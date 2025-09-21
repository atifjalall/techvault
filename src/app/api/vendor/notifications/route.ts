/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "15"))
    );
    const search = searchParams.get("search") || "";
    const typeFilter = searchParams.get("type") || "";
    const statusFilter = searchParams.get("status") || "";
    const severityFilter = searchParams.get("severity") || "";

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current user
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

    // Build where clause for filtering
    const where: any = {
      userId: user.id, // Only get notifications for this user
    };

    // Apply search filter
    if (search && search.trim()) {
      where.message = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    // Apply type filter
    if (typeFilter && typeFilter !== "all") {
      // Direct mapping for type filter
      const validTypes = [
        "NEW_ORDER",
        "ORDER_UPDATED",
        "LOW_STOCK",
        "NEW_REVIEW",
        "SYSTEM_ALERT",
      ];
      if (validTypes.includes(typeFilter)) {
        where.type = typeFilter;
      }
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      where.isRead = statusFilter === "read";
    }

    // Apply severity filter
    if (severityFilter && severityFilter !== "all") {
      const validSeverities = ["INFO", "WARNING", "CRITICAL"];
      if (validSeverities.includes(severityFilter)) {
        where.severity = severityFilter;
      }
    }

    // Get total count for pagination with error handling
    let totalCount = 0;
    try {
      totalCount = await db.notification.count({ where });
    } catch (countError) {
      console.error("Error counting notifications:", countError);
      totalCount = 0;
    }

    // Calculate pagination values safely
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const safePage = Math.min(page, totalPages);
    const skip = Math.max(0, (safePage - 1) * limit);

    // Get notifications with pagination
    let notifications: any[] = [];
    try {
      notifications = await db.notification.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          order: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: [
          { isRead: "asc" }, // Unread first
          { createdAt: "desc" }, // Then by newest
        ],
        skip: skip,
        take: limit,
      });
    } catch (notificationError) {
      console.error("Error fetching notifications:", notificationError);
      notifications = [];
    }

    // Transform notifications for frontend with error handling
    const transformedNotifications = notifications.map((notification) => {
      try {
        return {
          id: notification.id || "",
          type: notification.type || "SYSTEM_ALERT",
          severity: notification.severity || "INFO",
          message: notification.message || "",
          isRead: Boolean(notification.isRead),
          createdAt: notification.createdAt
            ? notification.createdAt.toISOString()
            : new Date().toISOString(),
          productId: notification.productId || null,
          orderId: notification.orderId || null,
          product: notification.product || null,
          order: notification.order || null,
        };
      } catch (transformError) {
        console.error("Error transforming notification:", transformError);
        return {
          id: notification.id || "",
          type: "SYSTEM_ALERT",
          severity: "INFO",
          message: "Error loading notification",
          isRead: true,
          createdAt: new Date().toISOString(),
          productId: null,
          orderId: null,
          product: null,
          order: null,
        };
      }
    });

    // Calculate stats with error handling
    let stats = {
      totalNotifications: 0,
      unreadCount: 0,
      todayCount: 0,
      criticalCount: 0,
    };

    try {
      const statsAggregate = await db.notification.aggregate({
        where: { userId: user.id },
        _count: {
          _all: true,
        },
      });

      const unreadCount = await db.notification.count({
        where: {
          userId: user.id,
          isRead: false,
        },
      });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayCount = await db.notification.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: todayStart,
          },
        },
      });

      const criticalCount = await db.notification.count({
        where: {
          userId: user.id,
          severity: "CRITICAL",
          isRead: false,
        },
      });

      stats = {
        totalNotifications: Math.max(0, statsAggregate._count._all || 0),
        unreadCount: Math.max(0, unreadCount || 0),
        todayCount: Math.max(0, todayCount || 0),
        criticalCount: Math.max(0, criticalCount || 0),
      };
    } catch (statsError) {
      console.error("Error calculating stats:", statsError);
      // Use default values if stats calculation fails
    }

    return NextResponse.json({
      success: true,
      notifications: transformedNotifications,
      pagination: {
        page: safePage,
        limit: limit,
        totalCount: Math.max(0, totalCount),
        totalPages: Math.max(1, totalPages),
      },
      stats: stats,
    });
  } catch (error) {
    console.error("Get vendor notifications error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        notifications: [],
        pagination: {
          page: 1,
          limit: 15,
          totalCount: 0,
          totalPages: 1,
        },
        stats: {
          totalNotifications: 0,
          unreadCount: 0,
          todayCount: 0,
          criticalCount: 0,
        },
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint for marking notification as read
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { notificationId, markAllRead } = requestBody;

    // Get current user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (markAllRead) {
      // Mark all notifications as read for this user
      try {
        await db.notification.updateMany({
          where: {
            userId: user.id,
            isRead: false,
          },
          data: {
            isRead: true,
          },
        });

        return NextResponse.json({
          success: true,
          message: "All notifications marked as read",
        });
      } catch (updateError) {
        console.error("Error marking all notifications as read:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to mark all notifications as read" },
          { status: 500 }
        );
      }
    } else if (notificationId) {
      // Mark specific notification as read
      try {
        const notification = await db.notification.findFirst({
          where: {
            id: notificationId,
            userId: user.id, // Ensure user owns this notification
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
      } catch (updateError) {
        console.error("Error marking notification as read:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to mark notification as read" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request: missing notificationId or markAllRead",
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

// DELETE endpoint for deleting notifications
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!notificationId || notificationId.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify notification belongs to user and delete
    try {
      const notification = await db.notification.findFirst({
        where: {
          id: notificationId,
          userId: user.id,
        },
      });

      if (!notification) {
        return NextResponse.json(
          { success: false, error: "Notification not found" },
          { status: 404 }
        );
      }

      await db.notification.delete({
        where: { id: notificationId },
      });

      return NextResponse.json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (deleteError) {
      console.error("Error deleting notification:", deleteError);
      return NextResponse.json(
        { success: false, error: "Failed to delete notification" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
