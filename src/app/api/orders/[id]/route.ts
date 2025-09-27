/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/orders/[id] - Get specific order details with full variant support
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role === "VENDOR") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get order with all enhanced details including variant items
    const order = await db.order.findFirst({
      where: {
        id: id,
        userId: user.id, // Ensure user owns this order
      },
      include: {
        // Include regular order items (legacy)
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
        // Include variant-specific order items
        variantItems: {
          include: {
            productVariant: {
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
        },
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Calculate detailed totals including variant items
    const subtotal = order.subtotal
      ? Number(order.subtotal)
      : order.items.reduce(
          (sum, item) => sum + Number(item.price) * item.quantity,
          0
        ) +
        order.variantItems.reduce(
          (sum, item) => sum + Number(item.price) * item.quantity,
          0
        );

    const shipping = Number(order.shippingCost || 0);
    const tax = Number(order.taxAmount || subtotal * 0.19);
    const discount = Number(order.discountAmount || 0);
    const calculatedTotal = subtotal + shipping + tax - discount;

    // Transform order data with enhanced tracking info and variant support
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),

      // Enhanced tracking information
      trackingNumber: order.trackingNumber,
      shippingCarrier: order.shippingCarrier,
      estimatedDelivery: order.estimatedDelivery,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,

      // Payment and order details
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentIntentId: order.paymentIntentId,
      priority: order.priority,
      notes: order.customerNotes, // Customer notes only

      // Addresses
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,

      // Timestamps
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      // Combined items with full variant support
      items: [
        // Regular order items (legacy)
        ...order.items.map((item) => ({
          id: item.id,
          type: "product" as const,
          productId: item.productId,
          variantId: null,
          name: item.product.name,
          variantName: null,
          brand: item.product.brand?.name,
          image: item.product.images[0] || "",
          slug: item.product.slug,
          quantity: item.quantity,
          price: Number(item.price),
          variantSnapshot: null,
          vendor: {
            name:
              item.product.vendor?.vendorSettings?.storeName ||
              item.product.vendor?.name ||
              "TechVault",
          },
        })),
        // Variant-specific items
        ...order.variantItems.map((item) => {
          const snapshot = item.variantSnapshot as any;
          return {
            id: item.id,
            type: "variant" as const,
            productId: item.productVariant.product.id,
            variantId: item.productVariantId,
            name: item.productVariant.product.name,
            variantName:
              snapshot?.variantName || item.productVariant.variantName,
            brand: item.productVariant.product.brand?.name,
            image:
              item.productVariant.images?.[0] ||
              item.productVariant.product.images[0] ||
              "",
            slug: item.productVariant.product.slug,
            quantity: item.quantity,
            price: Number(item.price),
            variantSnapshot: snapshot,
            vendor: {
              name:
                item.productVariant.product.vendor?.vendorSettings?.storeName ||
                item.productVariant.product.vendor?.name ||
                "TechVault",
            },
          };
        }),
      ],

      // Enhanced totals
      totals: {
        subtotal,
        shipping,
        tax,
        discount,
        total: calculatedTotal,
      },

      // Status history for timeline
      statusHistory: order.statusHistory.map((history) => ({
        id: history.id,
        status: history.status,
        notes: history.notes,
        changedBy: history.changedBy,
        createdAt: history.createdAt,
      })),

      itemCount:
        order.items.reduce((sum, item) => sum + item.quantity, 0) +
        order.variantItems.reduce((sum, item) => sum + item.quantity, 0),

      // Delivery estimation logic
      deliveryEstimate: getDeliveryEstimate(order),
    };

    return NextResponse.json({
      success: true,
      order: transformedOrder,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

// Helper function to calculate delivery estimates
function getDeliveryEstimate(order: any) {
  const now = new Date();

  // If already delivered
  if (order.deliveredAt) {
    return {
      status: "delivered",
      message: "Package delivered",
      date: order.deliveredAt,
    };
  }

  // If cancelled
  if (order.cancelledAt) {
    return {
      status: "cancelled",
      message: "Order cancelled",
      date: order.cancelledAt,
    };
  }

  // If has estimated delivery date from vendor
  if (order.estimatedDelivery) {
    const estimatedDate = new Date(order.estimatedDelivery);
    const isToday = estimatedDate.toDateString() === now.toDateString();
    const isTomorrow =
      estimatedDate.toDateString() ===
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

    if (isToday) {
      return {
        status: "today",
        message: "Expected delivery today",
        date: estimatedDate,
      };
    } else if (isTomorrow) {
      return {
        status: "tomorrow",
        message: "Expected delivery tomorrow",
        date: estimatedDate,
      };
    } else {
      return {
        status: "scheduled",
        message: "Expected delivery",
        date: estimatedDate,
      };
    }
  }

  // Default estimates based on status and carrier
  const carrier = order.shippingCarrier?.toLowerCase();
  let daysToAdd = 7; // Default 7 days

  if (carrier) {
    switch (carrier) {
      case "dhl":
      case "ups":
        daysToAdd = order.status === "SHIPPED" ? 2 : 5;
        break;
      case "deutsche post":
        daysToAdd = order.status === "SHIPPED" ? 3 : 6;
        break;
      case "hermes":
      case "dpd":
        daysToAdd = order.status === "SHIPPED" ? 2 : 5;
        break;
      default:
        daysToAdd = order.status === "SHIPPED" ? 3 : 7;
    }
  }

  const estimatedDate = new Date(
    now.getTime() + daysToAdd * 24 * 60 * 60 * 1000
  );

  return {
    status: "estimated",
    message: `Estimated delivery in ${daysToAdd} business days`,
    date: estimatedDate,
  };
}

// POST /api/orders/[id]/cancel - Cancel order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role === "VENDOR") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { reason } = await request.json();

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get order and verify ownership
    const order = await db.order.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ["PENDING", "CONFIRMED", "PROCESSING"];
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: "Order cannot be cancelled at this stage" },
        { status: 400 }
      );
    }

    // Cancel order in transaction
    const updatedOrder = await db.$transaction(async (tx) => {
      // Update order status
      const cancelledOrder = await tx.order.update({
        where: { id: id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: reason || "Customer requested cancellation",
        },
      });

      // Add status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: "CANCELLED",
          notes: `Order cancelled by customer. Reason: ${reason || "No reason provided"}`,
          changedBy: user.name || "Customer",
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          orderId: id,
          type: "ORDER_CANCELLED",
          message: `Your order #${order.orderNumber?.slice(-8).toUpperCase() || id.slice(-8).toUpperCase()} has been cancelled successfully. Refund will be processed within 3-5 business days.`,
          severity: "INFO",
        },
      });

      return cancelledOrder;
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        cancelledAt: updatedOrder.cancelledAt,
      },
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
