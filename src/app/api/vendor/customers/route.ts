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
    const statusFilter = searchParams.get("status") || "";
    const dateFilter = searchParams.get("date") || "";
    const sortBy = searchParams.get("sort") || "createdAt";
    const sortOrder = searchParams.get("order") || "desc";

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

    // Get vendor's products (for filtering orders)
    let productIds: string[] = [];
    if (user.role === "VENDOR") {
      const vendorProducts = await db.product.findMany({
        where: { vendorId: user.id },
        select: { id: true },
      });
      productIds = vendorProducts.map((p) => p.id);
    } else {
      // For demo purposes, get all products if not a vendor
      const allProducts = await db.product.findMany({
        select: { id: true },
        take: 20,
      });
      productIds = allProducts.map((p) => p.id);
    }

    // Build where conditions
    const whereConditions: any = {};

    // Filter by vendor's products
    if (productIds.length > 0) {
      whereConditions.items = {
        some: {
          productId: { in: productIds },
        },
      };
    }

    // Search filter
    if (search) {
      whereConditions.OR = [
        { id: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      whereConditions.status = statusFilter.toUpperCase();
    }

    // Date filter
    if (dateFilter && dateFilter !== "all") {
      const now = new Date();
      const startDate = new Date();

      switch (dateFilter) {
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

    // Get orders with related data
    const orders = await db.order.findMany({
      where: whereConditions,
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
                images: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder as "asc" | "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await db.order.count({
      where: whereConditions,
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Format orders for response
    const formattedOrders = orders.map((order) => {
      const orderTotal = Number(order.total);
      const shippingAmount = 9.99; // Mock shipping - you can add this to your schema
      const taxRate = 0.19; // 19% VAT for Germany
      const taxAmount = orderTotal * taxRate;

      return {
        id: order.id,
        orderNumber: `ORD-${order.id.slice(-6).toUpperCase()}`,
        customerId: order.userId,
        customerName: order.user.name || "Unknown Customer",
        customerEmail: order.user.email,
        customerPhone: order.user.phone,
        status: order.status.toLowerCase(),
        totalAmount: orderTotal,
        shippingAmount,
        taxAmount,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.images[0] || "/products/default.jpg",
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.price) * item.quantity,
        })),
        shippingAddress:
          typeof order.shippingAddress === "object"
            ? (order.shippingAddress as any)
            : {
                street: "Address not provided",
                city: "Unknown",
                postalCode: "Unknown",
                country: "Germany",
              },
        paymentMethod: "Credit Card", // Mock - you can add this to your schema
        paymentStatus: "paid", // Mock - you can add this to your schema
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        estimatedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        trackingNumber:
          order.status === "SHIPPED" || order.status === "DELIVERED"
            ? `TRK${Math.random().toString().slice(2, 10).toUpperCase()}`
            : undefined,
      };
    });

    // Calculate stats
    const allOrders = await db.order.findMany({
      where:
        productIds.length > 0
          ? {
              items: {
                some: {
                  productId: { in: productIds },
                },
              },
            }
          : {},
      select: {
        status: true,
        total: true,
        createdAt: true,
      },
    });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthOrders = allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    const totalRevenue = thisMonthOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );

    const pendingOrders = allOrders.filter(
      (o) => o.status === "PENDING"
    ).length;
    const processingOrders = allOrders.filter((o) =>
      ["PROCESSING", "SHIPPED"].includes(o.status)
    ).length;
    const completedOrders = allOrders.filter(
      (o) => o.status === "DELIVERED"
    ).length;

    const stats = {
      totalRevenue,
      pendingOrders,
      processingOrders,
      completedOrders,
    };

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      stats,
    });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating order status
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { orderId, status } = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
