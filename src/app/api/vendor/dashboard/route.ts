import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
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

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate date ranges
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all products (for demo - in real scenario, filter by vendor)
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
        take: 10, // Limit for demo
      });
      productIds = allProducts.map((p) => p.id);
    }

    // Get current month orders
    const currentMonthOrders = await db.order.findMany({
      where: {
        createdAt: { gte: currentMonthStart },
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
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get previous month orders for comparison
    const prevMonthOrders = await db.order.findMany({
      where: {
        createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
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
        },
      },
    });

    // Calculate current month stats
    const currentRevenue = currentMonthOrders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum, item) => itemSum + Number(item.price) * item.quantity,
          0
        ),
      0
    );

    const currentOrdersCount = currentMonthOrders.length;

    // Calculate previous month stats
    const prevRevenue = prevMonthOrders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum, item) => itemSum + Number(item.price) * item.quantity,
          0
        ),
      0
    );

    const prevOrdersCount = prevMonthOrders.length;

    // Calculate growth rates
    const revenueChange =
      prevRevenue > 0
        ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    const ordersChange =
      prevOrdersCount > 0
        ? ((currentOrdersCount - prevOrdersCount) / prevOrdersCount) * 100
        : currentOrdersCount > 0
          ? 100
          : 0;

    // Get total products count
    const totalProducts = await db.product.count({
      where: productIds.length > 0 ? { id: { in: productIds } } : {},
    });

    const prevTotalProducts = Math.max(1, Math.floor(totalProducts * 0.9)); // Mock previous count
    const productsChange =
      ((totalProducts - prevTotalProducts) / prevTotalProducts) * 100;

    // Mock views data (in real scenario, you'd track this)
    const totalViews =
      Math.floor(currentRevenue * 0.1) + Math.floor(Math.random() * 1000);
    const prevViews = Math.floor(totalViews * 0.85);
    const viewsChange =
      prevViews > 0 ? ((totalViews - prevViews) / prevViews) * 100 : 0;

    // Format recent orders
    const recentOrders = currentMonthOrders.slice(0, 5).map((order) => {
      const orderTotal = order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );

      const mainProduct = order.items[0]?.product?.name || "Unknown Product";

      return {
        id: order.id.slice(-8).toUpperCase(),
        customer: order.user.name || order.user.email || "Unknown Customer",
        product:
          order.items.length > 1
            ? `${mainProduct} +${order.items.length - 1} more`
            : mainProduct,
        amount: orderTotal,
        status: order.status.toLowerCase() as
          | "delivered"
          | "shipped"
          | "processing"
          | "pending",
        date: order.createdAt.toISOString(),
      };
    });

    // Calculate top products
    const productSales = new Map<
      string,
      {
        name: string;
        sales: number;
        revenue: number;
        views: number;
      }
    >();

    currentMonthOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.productId;
        const revenue = Number(item.price) * item.quantity;

        if (productSales.has(key)) {
          const existing = productSales.get(key)!;
          existing.sales += item.quantity;
          existing.revenue += revenue;
        } else {
          productSales.set(key, {
            name: item.product.name,
            sales: item.quantity,
            revenue,
            views: Math.floor(revenue * 0.05) + Math.floor(Math.random() * 100), // Mock views
          });
        }
      });
    });

    const topProducts = Array.from(productSales.entries())
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 3)
      .map(([id, product]) => ({
        id,
        name: product.name,
        sales: product.sales,
        revenue: product.revenue,
        views: product.views,
      }));

    // Build dashboard data
    const dashboardData = {
      stats: {
        totalRevenue: currentRevenue,
        totalOrders: currentOrdersCount,
        totalProducts,
        totalViews,
        revenueChange,
        ordersChange,
        productsChange,
        viewsChange,
      },
      recentOrders,
      topProducts,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
