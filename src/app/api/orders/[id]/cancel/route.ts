/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/orders/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/orders/[id]/cancel - Cancel an order
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

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get order with items to check ownership and status
    const order = await db.order.findFirst({
      where: {
        id: id,
        userId: user.id, // Ensure user owns this order
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                stock: true,
                vendorId: true, // Add vendorId to the selection
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ["PENDING", "PROCESSING"];
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          error: "Order cannot be cancelled",
          message: `Orders with status "${order.status.toLowerCase()}" cannot be cancelled`,
        },
        { status: 400 }
      );
    }

    // Get cancellation reason from request body
    const { reason } = await request.json();

    // Update order in a transaction
    const updatedOrder = await db.$transaction(async (tx) => {
      // Update order status to cancelled
      const cancelledOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
        },
      });

      // Restore product stock for each item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity, // Add back the quantity to stock
            },
            sold: {
              decrement: item.quantity, // Remove from sold count
            },
          },
        });
      }

      // TODO: Create notification for user (when notification system is implemented)
      // await tx.notification.create({
      //   data: {
      //     userId: user.id,
      //     type: "ORDER_CANCELLED",
      //     title: "Order Cancelled",
      //     message: `Your order #${order.id.slice(-8).toUpperCase()} has been cancelled successfully.`,
      //     severity: "info",
      //   },
      // });

      // TODO: Notify vendors about cancellation (when notification system is implemented)
      // Create vendor notifications for affected products
      const vendorNotifications = new Map<string, any>();

      order.items.forEach((item) => {
        // Note: This assumes products have vendorId field
        // If your schema doesn't have this, you might need to adjust
        if (item.product.vendorId) {
          const vendorId = item.product.vendorId;
          if (!vendorNotifications.has(vendorId)) {
            vendorNotifications.set(vendorId, {
              vendorId,
              items: [],
              totalAmount: 0,
            });
          }

          const vendorData = vendorNotifications.get(vendorId);
          vendorData.items.push({
            name: item.product.name,
            quantity: item.quantity,
          });
          vendorData.totalAmount += Number(item.price) * item.quantity;
        }
      });

      // Create vendor notifications
      // for (const [vendorId, vendorData] of vendorNotifications) {
      //   const itemsList = vendorData.items
      //     .map((item: any) => `${item.name} (${item.quantity}x)`)
      //     .join(", ");

      //   await tx.notification.create({
      //     data: {
      //       userId: vendorId,
      //       type: "ORDER_CANCELLED",
      //       title: "Order Cancelled",
      //       message: `Order cancelled by customer. Items: ${itemsList}. Reason: ${reason || "No reason provided"}`,
      //       severity: "warning",
      //     },
      //   });
      // }

      return cancelledOrder;
    });

    // TODO: Process refund if payment was already processed
    // In a real implementation, you would:
    // 1. Check if payment was captured
    // 2. Initiate refund through Stripe
    // 3. Update order with refund information

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
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
