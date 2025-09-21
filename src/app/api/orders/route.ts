/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";
import { Decimal } from "@prisma/client/runtime/library";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// Helper function for price formatting
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build where clause
    const where: any = { userId: user.id };
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  slug: true,
                  brand: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    // Transform orders
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: Number(order.total),
      shippingAddress: order.shippingAddress,
      paymentIntentId: order.paymentIntentId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        brand: item.product.brand?.name,
        image: item.product.images[0] || "",
        slug: item.product.slug,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }));

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const {
      paymentMethodId,
      shippingAddress,
      saveShippingInfo = false,
    } = await request.json();

    if (!paymentMethodId || !shippingAddress) {
      return NextResponse.json(
        { error: "Payment method and shipping address are required" },
        { status: 400 }
      );
    }

    // Validate shipping address
    const requiredFields = [
      "firstName",
      "lastName",
      "address",
      "city",
      "postalCode",
      "country",
    ];
    for (const field of requiredFields) {
      if (!shippingAddress[field]?.trim()) {
        return NextResponse.json(
          { error: `${field} is required in shipping address` },
          { status: 400 }
        );
      }
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's cart
    const cartItems = await db.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            isActive: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate stock and calculate total
    let subtotal = 0;
    const orderItems: {
      productId: string;
      quantity: number;
      price: Decimal;
    }[] = [];

    for (const cartItem of cartItems) {
      const product = cartItem.product;

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Product "${product.name}" is no longer available` },
          { status: 400 }
        );
      }

      if (product.stock < cartItem.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
          },
          { status: 400 }
        );
      }

      const itemTotal = Number(product.price) * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: cartItem.quantity,
        price: product.price,
      });
    }

    // Calculate totals
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const tax = subtotal * 0.19; // 19% VAT
    const total = subtotal + shipping + tax;

    // Get payment method
    const paymentMethod = await db.savedPaymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: user.id,
        isActive: true,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    let paymentIntentId: string | null = null;

    // Process payment with Stripe
    try {
      if (!paymentMethod.stripePaymentMethodId.startsWith("pm_mock_")) {
        // Get or create Stripe customer
        let customerId: string;
        try {
          const customers = await stripe.customers.list({
            email: user.email,
            limit: 1,
          });

          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
          } else {
            const customer = await stripe.customers.create({
              email: user.email,
              name:
                user.name ||
                `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            });
            customerId = customer.id;
          }
        } catch (customerError) {
          console.error("Error with Stripe customer:", customerError);
          throw new Error("Failed to setup customer for payment");
        }

        // Real Stripe payment with customer
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100), // Convert to cents
          currency: "eur",
          payment_method: paymentMethod.stripePaymentMethodId,
          customer: customerId, // Include customer ID
          confirm: true,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
          },
          metadata: {
            userId: user.id,
            userEmail: user.email,
            orderTotal: total.toString(),
          },
          description: `TechVault Order - ${cartItems.length} items`,
        });

        if (paymentIntent.status !== "succeeded") {
          return NextResponse.json(
            { error: "Payment failed. Please try again." },
            { status: 400 }
          );
        }

        paymentIntentId = paymentIntent.id;
      } else {
        // Mock payment for development
        paymentIntentId = `pi_mock_${Date.now()}`;
      }
    } catch (stripeError: any) {
      console.error("Stripe payment error:", stripeError);
      return NextResponse.json(
        { error: stripeError.message || "Payment processing failed" },
        { status: 400 }
      );
    }

    // Create order in database transaction
    const order = await db.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          status: "PROCESSING",
          total,
          shippingAddress,
          paymentIntentId,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  brand: { select: { name: true } },
                  vendor: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
        },
      });

      // Update product stock and sales
      for (const cartItem of cartItems) {
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            stock: {
              decrement: cartItem.quantity,
            },
            sold: {
              increment: cartItem.quantity,
            },
          },
        });
      }

      // Create notifications for vendors
      const vendorNotifications = new Map<
        string,
        {
          vendorId: string;
          vendorName: string;
          vendorEmail: string;
          items: any[];
          totalAmount: number;
        }
      >();

      // Group items by vendor
      newOrder.items.forEach((item) => {
        const vendor = item.product.vendor;
        if (vendor) {
          const vendorId = vendor.id;
          if (!vendorNotifications.has(vendorId)) {
            vendorNotifications.set(vendorId, {
              vendorId,
              vendorName: vendor.name || "Vendor",
              vendorEmail: vendor.email,
              items: [],
              totalAmount: 0,
            });
          }

          const vendorData = vendorNotifications.get(vendorId)!;
          vendorData.items.push({
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.price),
          });
          vendorData.totalAmount += Number(item.price) * item.quantity;
        }
      });

      // Create vendor notifications
      for (const [vendorId, vendorData] of vendorNotifications) {
        const itemsList = vendorData.items
          .map((item) => `${item.name} (${item.quantity}x)`)
          .join(", ");

        await tx.notification.create({
          data: {
            userId: vendorId,
            orderId: newOrder.id,
            type: "NEW_ORDER",
            severity: "INFO",
            message: `New order received! Items: ${itemsList}. Total: ${formatPrice(vendorData.totalAmount)}. Customer: ${shippingAddress.firstName} ${shippingAddress.lastName}`,
          },
        });
      }

      // Create customer confirmation notification
      await tx.notification.create({
        data: {
          userId: user.id,
          orderId: newOrder.id,
          type: "ORDER_UPDATED",
          severity: "INFO",
          message: `Order confirmed! Your order #${newOrder.id.slice(-8).toUpperCase()} has been placed successfully. Total: ${formatPrice(total)}`,
        },
      });

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      return newOrder;
    });

    // Save shipping info if requested
    if (saveShippingInfo) {
      try {
        await db.user.update({
          where: { id: user.id },
          data: {
            businessAddress: {
              street: shippingAddress.address,
              city: shippingAddress.city,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
            },
          },
        });
      } catch (error) {
        console.warn("Failed to save shipping info:", error);
        // Don't fail the order for this
      }
    }

    // Trigger cart update event
    // In a real app, you might want to send webhooks or notifications here

    // Transform order response
    const transformedOrder = {
      id: order.id,
      status: order.status,
      total: Number(order.total),
      shippingAddress: order.shippingAddress,
      paymentIntentId: order.paymentIntentId,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        brand: item.product.brand?.name,
        image: item.product.images[0] || "",
        slug: item.product.slug,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      totals: {
        subtotal,
        shipping,
        tax,
        total,
      },
    };

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order: transformedOrder,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
