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

// GET /api/orders - Get user's orders with enhanced tracking info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role === "VENDOR") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
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

    // Build where clause with status mapping
    const where: any = { userId: user.id };
    if (status && status !== "all") {
      // Map simplified customer statuses to database statuses
      switch (status.toLowerCase()) {
        case "pending":
          where.status = { in: ["PENDING", "PAYMENT_PENDING", "CONFIRMED"] };
          break;
        case "processing":
          where.status = { in: ["PROCESSING", "PACKAGING", "READY_TO_SHIP"] };
          break;
        case "shipped":
          where.status = { in: ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"] };
          break;
        case "delivered":
          where.status = { in: ["DELIVERED", "COMPLETED"] };
          break;
        case "cancelled":
          where.status = { in: ["CANCELLED", "REFUNDED", "RETURNED"] };
          break;
        default:
          where.status = status.toUpperCase();
      }
    }

    // Get orders with pagination and enhanced tracking info
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
                  vendor: {
                    select: {
                      id: true,
                      name: true,
                      vendorSettings: {
                        select: {
                          storeName: true,
                        },
                      },
                    },
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

    // Transform orders with enhanced tracking information
    const transformedOrders = orders.map((order) => {
      const subtotal = order.subtotal
        ? Number(order.subtotal)
        : order.items.reduce(
            (sum, item) => sum + Number(item.price) * item.quantity,
            0
          );

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),

        // Enhanced tracking info
        trackingNumber: order.trackingNumber,
        shippingCarrier: order.shippingCarrier,
        estimatedDelivery: order.estimatedDelivery,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,

        // Payment info
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        priority: order.priority,

        // Addresses
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentIntentId: order.paymentIntentId,

        // Timestamps
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,

        // Items with vendor info
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.product.name,
          brand: item.product.brand?.name,
          image: item.product.images[0] || "",
          slug: item.product.slug,
          quantity: item.quantity,
          price: Number(item.price),
          vendor: {
            name:
              item.product.vendor?.vendorSettings?.storeName ||
              item.product.vendor?.name ||
              "TechVault",
          },
        })),

        // Summary info
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        vendorCount: new Set(order.items.map((item) => item.product.vendor?.id))
          .size,

        // Delivery estimate
        deliveryEstimate: getQuickDeliveryEstimate(order),
      };
    });

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

// Helper function for quick delivery estimates in list view
function getQuickDeliveryEstimate(order: any) {
  const now = new Date();

  if (order.deliveredAt) {
    return {
      status: "delivered",
      message: "Delivered",
    };
  }

  if (order.estimatedDelivery) {
    const estimatedDate = new Date(order.estimatedDelivery);
    const diffDays = Math.ceil(
      (estimatedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 0) {
      return {
        status: "today",
        message: "Expected today",
      };
    } else if (diffDays === 1) {
      return {
        status: "tomorrow",
        message: "Expected tomorrow",
      };
    } else {
      return {
        status: "scheduled",
        message: `Expected in ${diffDays} days`,
      };
    }
  }

  // Default based on status
  switch (order.status) {
    case "PENDING":
    case "CONFIRMED":
      return { status: "processing", message: "Being processed" };
    case "PROCESSING":
    case "PACKAGING":
      return { status: "processing", message: "Preparing for shipment" };
    case "SHIPPED":
    case "IN_TRANSIT":
      return {
        status: "shipped",
        message: order.shippingCarrier
          ? `In transit via ${order.shippingCarrier}`
          : "In transit",
      };
    case "OUT_FOR_DELIVERY":
      return { status: "today", message: "Out for delivery" };
    case "CANCELLED":
      return { status: "cancelled", message: "Cancelled" };
    default:
      return { status: "unknown", message: "Processing" };
  }
}

// POST /api/orders - Create new order with correct payment status
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role === "VENDOR") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
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
    let paymentSuccessful = false;

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
          customer: customerId,
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
        paymentSuccessful = true;
      } else {
        // Mock payment for development
        paymentIntentId = `pi_mock_${Date.now()}`;
        paymentSuccessful = true;
      }
    } catch (stripeError: any) {
      console.error("Stripe payment error:", stripeError);
      return NextResponse.json(
        { error: stripeError.message || "Payment processing failed" },
        { status: 400 }
      );
    }

    // Only create order if payment was successful
    if (!paymentSuccessful) {
      return NextResponse.json(
        { error: "Payment was not completed successfully" },
        { status: 400 }
      );
    }

    // Create order in database transaction
    const order = await db.$transaction(async (tx) => {
      // Create order with CONFIRMED status and COMPLETED payment status
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          status: "CONFIRMED", // Order is confirmed since payment succeeded
          total,
          subtotal, // Add subtotal
          taxAmount: tax, // Add tax amount
          shippingCost: shipping, // Add shipping cost
          shippingAddress,
          paymentIntentId,
          paymentStatus: "COMPLETED", // Payment is completed since we only reach here if payment succeeded
          paymentMethod: paymentMethod.cardBrand || "Card",
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

      // Create initial status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: "CONFIRMED",
          notes: "Order confirmed and payment completed successfully",
          changedBy: "System",
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
          type: "ORDER_CONFIRMED",
          severity: "INFO",
          message: `Order confirmed! Your order #${newOrder.orderNumber?.slice(-8).toUpperCase() || newOrder.id.slice(-8).toUpperCase()} has been placed successfully. Payment completed. Total: ${formatPrice(total)}`,
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

    // Transform order response
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      shippingAddress: order.shippingAddress,
      paymentIntentId: order.paymentIntentId,
      paymentStatus: "COMPLETED", // Always completed if we reach here
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
