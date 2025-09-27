/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/orders/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/orders/[id]/cancel - Cancel an order (updated for variant system)
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

    // Get order with items AND variant items to check ownership and status
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
                totalStock: true, // Use totalStock instead of stock
                vendorId: true,
              },
            },
          },
        },
        variantItems: {
          include: {
            productVariant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    vendorId: true,
                  },
                },
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order can be cancelled
    const cancellableStatuses = [
      "PENDING",
      "PAYMENT_PENDING",
      "CONFIRMED",
      "PROCESSING",
    ];
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
          cancelledAt: new Date(),
          cancellationReason: reason || "Cancelled by customer",
          updatedAt: new Date(),
        },
      });

      // Add status history record
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
          notes: reason || "Cancelled by customer",
          changedBy: `customer-${user.id}`,
        },
      });

      // Restore stock for regular product items
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            totalStock: {
              increment: item.quantity, // Add back the quantity to total stock
            },
            sold: {
              decrement: item.quantity, // Remove from sold count
            },
          },
        });
      }

      // Restore stock for variant items
      for (const variantItem of order.variantItems) {
        // Update variant stock
        await tx.productVariant.update({
          where: { id: variantItem.productVariantId },
          data: {
            stock: {
              increment: variantItem.quantity, // Add back to variant stock
            },
          },
        });

        // Update product total stock
        await tx.product.update({
          where: { id: variantItem.productVariant.product.id },
          data: {
            totalStock: {
              increment: variantItem.quantity, // Add back to product total stock
            },
            sold: {
              decrement: variantItem.quantity, // Remove from sold count
            },
          },
        });
      }

      // Create notification for customer
      await tx.notification.create({
        data: {
          userId: user.id,
          orderId: order.id,
          type: "ORDER_CANCELLED",
          severity: "INFO",
          message: `Your order #${order.orderNumber} has been cancelled successfully.${reason ? ` Reason: ${reason}` : ""}`,
        },
      });

      // Create vendor notifications for affected products
      const vendorNotifications = new Map<string, any>();

      // Process regular items
      order.items.forEach((item) => {
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
            type: "product",
          });
          vendorData.totalAmount += Number(item.price) * item.quantity;
        }
      });

      // Process variant items
      order.variantItems.forEach((variantItem) => {
        if (variantItem.productVariant.product.vendorId) {
          const vendorId = variantItem.productVariant.product.vendorId;
          if (!vendorNotifications.has(vendorId)) {
            vendorNotifications.set(vendorId, {
              vendorId,
              items: [],
              totalAmount: 0,
            });
          }

          const vendorData = vendorNotifications.get(vendorId);

          // Get variant name from the productVariant or variantSnapshot
          const variantInfo = variantItem.variantSnapshot as any;
          const variantName =
            variantItem.productVariant.variantName ||
            (variantInfo?.color && variantInfo?.storage
              ? `${variantInfo.color} ${variantInfo.storage}`
              : "Variant");

          vendorData.items.push({
            name: `${variantItem.productVariant.product.name} - ${variantName}`,
            quantity: variantItem.quantity,
            type: "variant",
          });
          vendorData.totalAmount +=
            Number(variantItem.price) * variantItem.quantity;
        }
      });

      // Create vendor notifications
      for (const [vendorId, vendorData] of vendorNotifications) {
        const itemsList = vendorData.items
          .map((item: any) => `${item.name} (${item.quantity}x)`)
          .join(", ");

        await tx.notification.create({
          data: {
            userId: vendorId,
            orderId: order.id,
            type: "ORDER_CANCELLED",
            severity: "WARNING",
            message: `Order #${order.orderNumber} cancelled by customer. Items: ${itemsList}. Total: €${vendorData.totalAmount.toFixed(2)}${reason ? `. Reason: ${reason}` : ""}`,
          },
        });
      }

      return cancelledOrder;
    });

    // TODO: Process refund if payment was already processed
    // In a real implementation, you would:
    // 1. Check if payment was captured (paymentStatus === "COMPLETED")
    // 2. Initiate refund through Stripe using paymentIntentId
    // 3. Update order with refund information and set paymentStatus to "REFUNDED"
    // Example:
    // if (order.paymentStatus === "COMPLETED" && order.paymentIntentId) {
    //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    //   const refund = await stripe.refunds.create({
    //     payment_intent: order.paymentIntentId,
    //     reason: "requested_by_customer",
    //   });
    //
    //   await tx.order.update({
    //     where: { id: order.id },
    //     data: { paymentStatus: "REFUNDED" },
    //   });
    // }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order: {
        id: updatedOrder.id,
        orderNumber: order.orderNumber,
        status: updatedOrder.status,
        cancelledAt: updatedOrder.cancelledAt,
        cancellationReason: updatedOrder.cancellationReason,
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
