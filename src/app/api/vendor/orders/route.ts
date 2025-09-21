/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

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

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const dateRange = searchParams.get("date") || "";
    const sortBy = searchParams.get("sort") || "createdAt";
    const sortOrder = searchParams.get("order") || "desc";

    // Get vendor's products first
    let vendorProductIds: string[] = [];
    if (user.role === "VENDOR") {
      const vendorProducts = await db.product.findMany({
        where: { vendorId: user.id },
        select: { id: true },
      });
      vendorProductIds = vendorProducts.map((p) => p.id);

      if (vendorProductIds.length === 0) {
        // Vendor has no products, return empty data
        return NextResponse.json({
          success: true,
          orders: [],
          pagination: {
            page: 1,
            limit,
            totalCount: 0,
            totalPages: 0,
          },
          stats: {
            totalRevenue: 0,
            pendingOrders: 0,
            processingOrders: 0,
            completedOrders: 0,
            totalOrders: 0,
          },
        });
      }
    }

    // Build where conditions for orders
    const whereConditions: any = {};

    // For vendors, only show orders that contain their products
    if (user.role === "VENDOR") {
      whereConditions.items = {
        some: {
          productId: { in: vendorProductIds },
        },
      };
    }

    // Search filter
    if (search) {
      whereConditions.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Status filter
    if (status && status !== "all") {
      whereConditions.status = status.toUpperCase();
    }

    // Date range filter
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      whereConditions.createdAt = { gte: startDate };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order by clause
    const orderBy: any = {};
    if (sortBy === "total") {
      orderBy.total = sortOrder;
    } else if (sortBy === "customerName") {
      orderBy.user = { name: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
            },
          },
          items: {
            // For vendors, only include their products
            where:
              user.role === "VENDOR"
                ? {
                    productId: { in: vendorProductIds },
                  }
                : undefined,
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true,
                  vendorId: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.order.count({ where: whereConditions }),
    ]);

    // Calculate statistics
    const allOrdersForStats = await db.order.findMany({
      where:
        user.role === "VENDOR"
          ? {
              items: {
                some: {
                  productId: { in: vendorProductIds },
                },
              },
            }
          : {},
      include: {
        items: {
          where:
            user.role === "VENDOR"
              ? {
                  productId: { in: vendorProductIds },
                }
              : undefined,
        },
      },
    });

    // Calculate vendor-specific revenue and stats
    const calculateOrderTotal = (order: any) => {
      return order.items.reduce((sum: number, item: any) => {
        // Only count items from this vendor's products
        if (
          user.role === "VENDOR" &&
          !vendorProductIds.includes(item.productId)
        ) {
          return sum;
        }
        return sum + Number(item.price) * item.quantity;
      }, 0);
    };

    const stats = {
      totalRevenue: allOrdersForStats.reduce(
        (sum, order) => sum + calculateOrderTotal(order),
        0
      ),
      pendingOrders: allOrdersForStats.filter(
        (order) => order.status === "PENDING"
      ).length,
      processingOrders: allOrdersForStats.filter(
        (order) => order.status === "PROCESSING"
      ).length,
      completedOrders: allOrdersForStats.filter(
        (order) => order.status === "DELIVERED"
      ).length,
      totalOrders: allOrdersForStats.length,
    };

    // Transform orders data for frontend
    const transformedOrders = orders.map((order) => {
      const orderItems = order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images?.[0] || "/products/default.jpg",
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.price) * item.quantity,
      }));

      const totalAmount = calculateOrderTotal(order);

      return {
        id: order.id,
        orderNumber: `TF-${order.id.slice(-8).toUpperCase()}`,
        customerId: order.user.id,
        customerName: order.user.name || "Unknown Customer",
        customerEmail: order.user.email,
        customerPhone: order.user.phone,
        status: order.status.toLowerCase(),
        totalAmount,
        shippingAmount: 0, // Add shipping logic if needed
        taxAmount: totalAmount * 0.19, // 19% VAT for Germany
        items: orderItems,
        shippingAddress: (order.shippingAddress as any) || {
          street: "",
          city: "",
          postalCode: "",
          country: "Germany",
        },
        paymentMethod: "card", // Add payment method logic if needed
        paymentStatus: order.status === "DELIVERED" ? "paid" : "pending",
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        estimatedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        trackingNumber: `TK${order.id.slice(-6).toUpperCase()}`,
        notes: "",
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      stats,
    });
  } catch (error) {
    console.error("Vendor orders API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

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

    if (!user || user.role !== "VENDOR") {
      return NextResponse.json(
        { success: false, error: "Vendor access required" },
        { status: 403 }
      );
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Check if vendor has access to this order (contains their products)
    const vendorProducts = await db.product.findMany({
      where: { vendorId: user.id },
      select: { id: true },
    });
    const vendorProductIds = vendorProducts.map((p) => p.id);

    const order = await db.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            productId: { in: vendorProductIds },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found or access denied" },
        { status: 404 }
      );
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: status.toUpperCase(),
        updatedAt: new Date(),
      },
    });

    // TODO: Add notification creation when notification system is implemented
    // await db.notification.create({ ... })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
