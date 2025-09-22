/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { NotificationType } from "@prisma/client";

// Define notification types for each role
const VENDOR_NOTIFICATION_TYPES: NotificationType[] = [
  "LOW_STOCK",
  "NEW_ORDER",
  "ORDER_UPDATED",
  "NEW_REVIEW",
  "SYSTEM_ALERT",
  "PRODUCT_APPROVED",
  "PRODUCT_REJECTED",
  "PAYOUT_PROCESSED",
  "PAYOUT_FAILED",
  "VENDOR_VERIFICATION_REQUIRED",
  "VENDOR_ACCOUNT_SUSPENDED",
  "VENDOR_ACCOUNT_APPROVED",
  "SALES_MILESTONE",
  "REVENUE_THRESHOLD_REACHED",
  "INVENTORY_WARNING",
  "COMPETITOR_PRICE_ALERT",
  "SEASONAL_DEMAND_FORECAST",
];

const CUSTOMER_NOTIFICATION_TYPES: NotificationType[] = [
  "ORDER_CONFIRMED",
  "ORDER_PROCESSING",
  "ORDER_PACKED",
  "ORDER_SHIPPED",
  "ORDER_OUT_FOR_DELIVERY",
  "ORDER_DELIVERED",
  "ORDER_CANCELLED",
  "ORDER_REFUNDED",
  "ORDER_RETURNED",
  "PAYMENT_PROCESSING",
  "PAYMENT_PROCESSED",
  "PAYMENT_FAILED",
  "PAYMENT_REFUNDED",
  "REFUND_PROCESSED",
  "RETURN_APPROVED",
  "RETURN_RECEIVED",
  "RETURN_PROCESSED",
  "WISHLIST_ITEM_BACK_IN_STOCK",
  "WISHLIST_ITEM_PRICE_DROP",
  "WISHLIST_ITEM_LOW_STOCK",
  "PRICE_DROP_ALERT",
  "PROMOTIONAL_OFFER",
  "FLASH_SALE_ALERT",
  "DISCOUNT_EXPIRING",
  "NEW_ARRIVAL_ALERT",
  "ACCOUNT_SECURITY",
  "PASSWORD_CHANGED",
  "EMAIL_CHANGED",
  "LOGIN_SUSPICIOUS",
  "ACCOUNT_LOCKED",
  "TWO_FACTOR_ENABLED",
  "NEWSLETTER_WELCOME",
  "BIRTHDAY_OFFER",
  "LOYALTY_REWARD",
  "REVIEW_REMINDER",
  "ABANDONED_CART_REMINDER",
  "RESTOCK_NOTIFICATION",
  "SHIPPING_DELAY_ALERT",
  "DELIVERY_ATTEMPT_FAILED",
  "CUSTOMER_SERVICE_FOLLOW_UP",
  "ORDER_UPDATED",
];

// Fixed validation schema - handle null values properly
const getNotificationsSchema = z.object({
  page: z.coerce.number().min(1).catch(1), // Default to 1 if invalid
  limit: z.coerce.number().min(1).max(50).catch(10), // Default to 10 if invalid
  unreadOnly: z.coerce.boolean().catch(false), // Default to false if invalid
  type: z.string().nullable().optional(), // Allow null and undefined
});

const markReadSchema = z.object({
  notificationId: z.string().optional(),
  markAllRead: z.boolean().default(false),
});

// Helper function to get notification titles
function getNotificationTitle(type: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    // Vendor notifications
    LOW_STOCK: "Low Stock Alert",
    NEW_ORDER: "New Order",
    ORDER_UPDATED: "Order Updated",
    NEW_REVIEW: "New Review",
    SYSTEM_ALERT: "System Alert",
    PRODUCT_APPROVED: "Product Approved",
    PRODUCT_REJECTED: "Product Rejected",
    PAYOUT_PROCESSED: "Payout Processed",
    PAYOUT_FAILED: "Payout Failed",
    VENDOR_VERIFICATION_REQUIRED: "Verification Required",
    VENDOR_ACCOUNT_SUSPENDED: "Account Suspended",
    VENDOR_ACCOUNT_APPROVED: "Account Approved",
    SALES_MILESTONE: "Sales Milestone",
    REVENUE_THRESHOLD_REACHED: "Revenue Threshold",
    INVENTORY_WARNING: "Inventory Warning",
    COMPETITOR_PRICE_ALERT: "Competitor Price Alert",
    SEASONAL_DEMAND_FORECAST: "Demand Forecast",

    // Customer notifications
    ORDER_CONFIRMED: "Order Confirmed",
    ORDER_PROCESSING: "Order Processing",
    ORDER_PACKED: "Order Packed",
    ORDER_SHIPPED: "Order Shipped",
    ORDER_OUT_FOR_DELIVERY: "Out for Delivery",
    ORDER_DELIVERED: "Order Delivered",
    ORDER_CANCELLED: "Order Cancelled",
    ORDER_REFUNDED: "Order Refunded",
    ORDER_RETURNED: "Order Returned",
    PAYMENT_PROCESSING: "Payment Processing",
    PAYMENT_PROCESSED: "Payment Processed",
    PAYMENT_FAILED: "Payment Failed",
    PAYMENT_REFUNDED: "Payment Refunded",
    REFUND_PROCESSED: "Refund Processed",
    RETURN_APPROVED: "Return Approved",
    RETURN_RECEIVED: "Return Received",
    RETURN_PROCESSED: "Return Processed",
    WISHLIST_ITEM_BACK_IN_STOCK: "Item Back in Stock",
    WISHLIST_ITEM_PRICE_DROP: "Price Drop Alert",
    WISHLIST_ITEM_LOW_STOCK: "Low Stock Alert",
    PRICE_DROP_ALERT: "Price Drop Alert",
    PROMOTIONAL_OFFER: "Special Offer",
    FLASH_SALE_ALERT: "Flash Sale Alert",
    DISCOUNT_EXPIRING: "Discount Expiring Soon",
    NEW_ARRIVAL_ALERT: "New Arrival",
    ACCOUNT_SECURITY: "Security Alert",
    PASSWORD_CHANGED: "Password Changed",
    EMAIL_CHANGED: "Email Changed",
    LOGIN_SUSPICIOUS: "Suspicious Login",
    ACCOUNT_LOCKED: "Account Locked",
    TWO_FACTOR_ENABLED: "Two-Factor Authentication Enabled",
    NEWSLETTER_WELCOME: "Welcome to Newsletter",
    BIRTHDAY_OFFER: "Birthday Special Offer",
    LOYALTY_REWARD: "Loyalty Reward",
    REVIEW_REMINDER: "Review Reminder",
    ABANDONED_CART_REMINDER: "Complete Your Purchase",
    RESTOCK_NOTIFICATION: "Item Restocked",
    SHIPPING_DELAY_ALERT: "Shipping Delay",
    DELIVERY_ATTEMPT_FAILED: "Delivery Failed",
    CUSTOMER_SERVICE_FOLLOW_UP: "Customer Service",
  };

  return titles[type] || "Notification";
}

// GET - Fetch notifications based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Parse query parameters with better null handling
    const { searchParams } = new URL(request.url);
    const rawParams = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      unreadOnly: searchParams.get("unreadOnly") || "false",
      type: searchParams.get("type"), // Can be null
    };

    const { page, limit, unreadOnly, type } =
      getNotificationsSchema.parse(rawParams);
    const skip = (page - 1) * limit;

    // Get notification types based on user role
    const allowedTypes =
      user.role === "VENDOR"
        ? VENDOR_NOTIFICATION_TYPES
        : CUSTOMER_NOTIFICATION_TYPES;

    // Build where clause
    const whereClause: any = {
      userId: user.id,
      type: { in: allowedTypes },
      ...(unreadOnly && { isRead: false }),
    };

    // Add specific type filter if provided and valid
    if (type && allowedTypes.includes(type as NotificationType)) {
      whereClause.type = type as NotificationType;
    }

    const notifications = await db.notification.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            items: {
              take: 1,
              select: {
                product: {
                  select: {
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            price: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalCount = await db.notification.count({ where: whereClause });

    const unreadCount = await db.notification.count({
      where: {
        userId: user.id,
        type: { in: allowedTypes },
        isRead: false,
      },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayCount = await db.notification.count({
      where: {
        userId: user.id,
        type: { in: allowedTypes },
        createdAt: { gte: todayStart },
      },
    });

    const criticalCount = await db.notification.count({
      where: {
        userId: user.id,
        type: { in: allowedTypes },
        severity: "CRITICAL",
        isRead: false,
      },
    });

    const formattedNotifications = notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: getNotificationTitle(notification.type),
      message: notification.message,
      severity: notification.severity,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
      ...(notification.order && {
        actionUrl:
          user.role === "VENDOR"
            ? `/vendor/orders/${notification.order.id}`
            : `/orders/${notification.order.id}`,
        order: {
          id: notification.order.id,
          status: notification.order.status,
          createdAt: notification.order.createdAt.toISOString(),
          productImage:
            notification.order.items[0]?.product?.images?.[0] || null,
          productName: notification.order.items[0]?.product?.name || "Order",
        },
      }),
      ...(notification.product && {
        actionUrl:
          user.role === "VENDOR"
            ? `/vendor/products/${notification.product.id}`
            : `/products/${notification.product.slug}`,
        product: {
          id: notification.product.id,
          name: notification.product.name,
          image: notification.product.images?.[0] || null,
          price: Number(notification.product.price),
          slug: notification.product.slug,
        },
      }),
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalNotifications: totalCount,
        unreadCount,
        todayCount,
        criticalCount,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { notificationId, markAllRead } = markReadSchema.parse(body);

    const allowedTypes =
      user.role === "VENDOR"
        ? VENDOR_NOTIFICATION_TYPES
        : CUSTOMER_NOTIFICATION_TYPES;

    if (markAllRead) {
      await db.notification.updateMany({
        where: {
          userId: user.id,
          type: { in: allowedTypes },
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    } else if (notificationId) {
      const notification = await db.notification.findFirst({
        where: {
          id: notificationId,
          userId: user.id,
          type: { in: allowedTypes },
        },
      });

      if (!notification) {
        return NextResponse.json(
          { success: false, error: "Notification not found" },
          { status: 404 }
        );
      }

      await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either notificationId or markAllRead is required",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
