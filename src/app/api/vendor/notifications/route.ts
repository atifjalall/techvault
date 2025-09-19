/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";
    const typeFilter = searchParams.get("type") || "";
    const statusFilter = searchParams.get("status") || "";
    const priorityFilter = searchParams.get("priority") || "";

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

    // Get vendor's products to create relevant notifications
    let productIds: string[] = [];
    if (user.role === "VENDOR") {
      const vendorProducts = await db.product.findMany({
        where: { vendorId: user.id },
        select: { id: true, name: true, stock: true },
      });
      productIds = vendorProducts.map((p) => p.id);
    }

    // Get orders for this vendor to create notifications
    const orders = await db.order.findMany({
      where: {
        ...(productIds.length > 0 && {
          items: {
            some: {
              productId: { in: productIds },
            },
          },
        }),
      },
      include: {
        items: {
          where:
            productIds.length > 0
              ? {
                  productId: { in: productIds },
                }
              : undefined,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                stock: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to recent orders
    });

    // Create notifications based on orders (in a real app, these would be stored in DB)
    const notifications = orders.flatMap((order) =>
      order.items.map((item) => ({
        id: `${order.id}-${item.productId}`,
        type: "order",
        title: "New Order Received",
        message: `New order for ${item.quantity}x ${item.product.name}`,
        isRead: false,
        priority: "medium",
        createdAt: order.createdAt.toISOString(),
        actionUrl: `/vendor/orders?search=${order.id}`,
        orderId: order.id,
        productId: item.productId,
      }))
    );

    // Apply filters
    let filteredNotifications = notifications;

    if (search) {
      filteredNotifications = filteredNotifications.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.message.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (typeFilter) {
      filteredNotifications = filteredNotifications.filter(
        (n) => n.type === typeFilter
      );
    }

    if (statusFilter) {
      const isUnread = statusFilter === "unread";
      filteredNotifications = filteredNotifications.filter(
        (n) => n.isRead !== isUnread
      );
    }

    if (priorityFilter) {
      filteredNotifications = filteredNotifications.filter(
        (n) => n.priority === priorityFilter
      );
    }

    // Pagination
    const offset = (page - 1) * limit;
    const paginatedNotifications = filteredNotifications.slice(
      offset,
      offset + limit
    );

    // Calculate stats for the page
    const totalNotifications = notifications.length;
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = notifications.filter(
      (n) => new Date(n.createdAt) >= todayStart
    ).length;

    const highPriorityCount = notifications.filter(
      (n) => n.priority === "high"
    ).length;

    return NextResponse.json({
      success: true,
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        totalCount: filteredNotifications.length,
        totalPages: Math.ceil(filteredNotifications.length / limit),
      },
      stats: {
        totalNotifications,
        unreadCount,
        todayCount,
        highPriorityCount,
      },
    });
  } catch (error) {
    console.error("Get vendor notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH endpoint for marking notification as read
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { notificationId } = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // In a real implementation, you would update the notification in the database
    // For now, we'll just return success since we're using mock data

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
