/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for order updates
const updateOrderSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "PAYMENT_PENDING",
      "PAYMENT_FAILED",
      "CONFIRMED",
      "PROCESSING",
      "PACKAGING",
      "READY_TO_SHIP",
      "SHIPPED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERY_ATTEMPT",
      "DELIVERED",
      "COMPLETED",
      "CANCELLED",
      "REFUNDED",
      "RETURNED",
      "EXCHANGE_REQUESTED",
      "ON_HOLD",
      "REQUIRES_ACTION",
    ])
    .optional(),
  trackingNumber: z.string().nullable().optional(),
  shippingCarrier: z.string().nullable().optional(),
  estimatedDelivery: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
});

// GET single order details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user and verify vendor role
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "VENDOR") {
      return NextResponse.json(
        { success: false, error: "Vendor access required" },
        { status: 403 }
      );
    }

    // Fetch order with all related data
    const order = await db.order.findFirst({
      where: {
        id: resolvedParams.id,
        // Only show orders that contain vendor's products
        items: {
          some: {
            product: {
              vendorId: user.id,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          // Only include items that belong to this vendor
          where: {
            product: {
              vendorId: user.id,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Calculate vendor-specific totals (only for their items)
    const vendorSubtotal = order.items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    // Create modified order object with vendor-specific calculations
    const vendorOrder = {
      ...order,
      subtotal: order.subtotal ? Number(order.subtotal) : vendorSubtotal,
      total: Number(order.total),
      taxAmount: Number(order.taxAmount || 0),
      shippingCost: Number(order.shippingCost || 0),
      discountAmount: Number(order.discountAmount || 0),
    };

    return NextResponse.json({
      success: true,
      order: vendorOrder,
    });
  } catch (error) {
    console.error("Get order detail error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH update order
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user and verify vendor role
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, name: true },
    });

    if (!user || user.role !== "VENDOR") {
      return NextResponse.json(
        { success: false, error: "Vendor access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    // Verify order exists and vendor has access
    const existingOrder = await db.order.findFirst({
      where: {
        id: resolvedParams.id,
        items: {
          some: {
            product: {
              vendorId: user.id,
            },
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;

      // Set timestamp fields based on status
      if (validatedData.status === "SHIPPED" && !existingOrder.shippedAt) {
        updateData.shippedAt = new Date();
      }
      if (validatedData.status === "DELIVERED" && !existingOrder.deliveredAt) {
        updateData.deliveredAt = new Date();
      }
      if (validatedData.status === "CANCELLED" && !existingOrder.cancelledAt) {
        updateData.cancelledAt = new Date();
      }
    }

    if (validatedData.trackingNumber !== undefined) {
      updateData.trackingNumber = validatedData.trackingNumber;
    }
    if (validatedData.shippingCarrier !== undefined) {
      updateData.shippingCarrier = validatedData.shippingCarrier;
    }
    if (validatedData.estimatedDelivery !== undefined) {
      updateData.estimatedDelivery = validatedData.estimatedDelivery
        ? new Date(validatedData.estimatedDelivery)
        : null;
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }
    if (validatedData.priority) {
      updateData.priority = validatedData.priority;
    }

    // Update order in transaction to ensure consistency
    const updatedOrder = await db.$transaction(async (tx) => {
      // Update the order
      const order = await tx.order.update({
        where: { id: resolvedParams.id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            where: {
              product: {
                vendorId: user.id,
              },
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true,
                },
              },
            },
          },
          statusHistory: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      // Add status history entry if status changed
      if (
        validatedData.status &&
        validatedData.status !== existingOrder.status
      ) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: resolvedParams.id,
            status: validatedData.status,
            notes: `Status changed by vendor: ${user.name}`,
            changedBy: user.name || user.id,
          },
        });

        // Create detailed notification for customer based on status
        const notificationMessage = getNotificationMessage(
          validatedData.status,
          order.orderNumber
        );

        await tx.notification.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            type: getNotificationTypeForStatus(validatedData.status),
            message: notificationMessage,
            severity: getSeverityForStatus(validatedData.status),
          },
        });

        // Create additional notifications for specific status changes
        if (
          validatedData.status === "SHIPPED" &&
          validatedData.trackingNumber
        ) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              type: "ORDER_SHIPPED",
              message: `Your order #${order.orderNumber.slice(-8).toUpperCase()} has been shipped! Tracking: ${validatedData.trackingNumber}${validatedData.shippingCarrier ? ` via ${validatedData.shippingCarrier}` : ""}`,
              severity: "INFO",
            },
          });
        }

        if (validatedData.status === "OUT_FOR_DELIVERY") {
          await tx.notification.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              type: "ORDER_OUT_FOR_DELIVERY",
              message: `Your order #${order.orderNumber.slice(-8).toUpperCase()} is out for delivery and should arrive today.`,
              severity: "INFO",
            },
          });
        }

        if (validatedData.status === "DELIVERED") {
          await tx.notification.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              type: "ORDER_DELIVERED",
              message: `Your order #${order.orderNumber.slice(-8).toUpperCase()} has been delivered successfully. Thank you for your purchase.`,
              severity: "INFO",
            },
          });
        }

        if (validatedData.status === "CANCELLED") {
          await tx.notification.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              type: "ORDER_CANCELLED",
              message: `Your order #${order.orderNumber.slice(-8).toUpperCase()} has been cancelled. Please contact support if you have any questions.`,
              severity: "WARNING",
            },
          });
        }
      }

      // Create notification for tracking number updates (even without status change)
      if (
        validatedData.trackingNumber &&
        validatedData.trackingNumber !== existingOrder.trackingNumber
      ) {
        await tx.notification.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            type: "ORDER_UPDATED",
            message: `Tracking information updated for order #${order.orderNumber.slice(-8).toUpperCase()}: ${validatedData.trackingNumber}${validatedData.shippingCarrier ? ` via ${validatedData.shippingCarrier}` : ""}`,
            severity: "INFO",
          },
        });
      }

      return order;
    });

    // Calculate vendor-specific totals
    const vendorSubtotal = updatedOrder.items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    const vendorOrder = {
      ...updatedOrder,
      subtotal: updatedOrder.subtotal
        ? Number(updatedOrder.subtotal)
        : vendorSubtotal,
      total: Number(updatedOrder.total),
      taxAmount: Number(updatedOrder.taxAmount || 0),
      shippingCost: Number(updatedOrder.shippingCost || 0),
      discountAmount: Number(updatedOrder.discountAmount || 0),
    };

    return NextResponse.json({
      success: true,
      order: vendorOrder,
      message: "Order updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data provided",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get user-friendly notification messages
function getNotificationMessage(status: string, orderNumber: string): string {
  const orderNum = orderNumber.slice(-8).toUpperCase();

  switch (status) {
    case "CONFIRMED":
      return `Your order #${orderNum} has been confirmed and is being prepared.`;
    case "PROCESSING":
      return `Your order #${orderNum} is now being processed by our team.`;
    case "PACKAGING":
      return `Your order #${orderNum} is being carefully packaged for shipment.`;
    case "READY_TO_SHIP":
      return `Your order #${orderNum} is packaged and ready for pickup by our shipping partner.`;
    case "SHIPPED":
      return `Your order #${orderNum} has been shipped and is on its way to you.`;
    case "IN_TRANSIT":
      return `Your order #${orderNum} is in transit and moving closer to your location.`;
    case "OUT_FOR_DELIVERY":
      return `Your order #${orderNum} is out for delivery and should arrive today.`;
    case "DELIVERED":
      return `Your order #${orderNum} has been successfully delivered. Thank you for your purchase.`;
    case "COMPLETED":
      return `Your order #${orderNum} is complete. Thank you for shopping with us.`;
    case "CANCELLED":
      return `Your order #${orderNum} has been cancelled. Please contact support if you have questions.`;
    case "ON_HOLD":
      return `Your order #${orderNum} is temporarily on hold. We will update you soon.`;
    case "REQUIRES_ACTION":
      return `Your order #${orderNum} requires your attention. Please check your email or contact support.`;
    case "PAYMENT_FAILED":
      return `Payment failed for order #${orderNum}. Please update your payment method.`;
    case "REFUNDED":
      return `Your order #${orderNum} has been refunded. Please allow 3-5 business days for processing.`;
    case "RETURNED":
      return `Your return for order #${orderNum} has been processed.`;
    default:
      return `Your order #${orderNum} status has been updated to ${status.replace(/_/g, " ").toLowerCase()}.`;
  }
}

// Helper function to get notification type based on order status
function getNotificationTypeForStatus(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "ORDER_CONFIRMED";
    case "PROCESSING":
    case "PACKAGING":
      return "ORDER_PROCESSING";
    case "READY_TO_SHIP":
      return "ORDER_PROCESSING";
    case "SHIPPED":
    case "IN_TRANSIT":
      return "ORDER_SHIPPED";
    case "OUT_FOR_DELIVERY":
      return "ORDER_OUT_FOR_DELIVERY";
    case "DELIVERED":
      return "ORDER_DELIVERED";
    case "COMPLETED":
      return "ORDER_DELIVERED";
    case "CANCELLED":
      return "ORDER_CANCELLED";
    case "REFUNDED":
      return "ORDER_REFUNDED";
    case "RETURNED":
      return "ORDER_RETURNED";
    case "PAYMENT_FAILED":
      return "PAYMENT_FAILED";
    default:
      return "ORDER_UPDATED";
  }
}

// Helper function to get notification severity based on status
function getSeverityForStatus(status: string) {
  switch (status) {
    case "CANCELLED":
    case "PAYMENT_FAILED":
    case "REQUIRES_ACTION":
      return "CRITICAL";
    case "ON_HOLD":
    case "DELIVERY_ATTEMPT":
      return "WARNING";
    case "DELIVERED":
    case "COMPLETED":
    case "CONFIRMED":
      return "INFO";
    default:
      return "INFO";
  }
}
