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

    // Only allow vendors to access this endpoint
    if (user.role !== "VENDOR") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Vendors only" },
        { status: 403 }
      );
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get vendor's products
    const vendorProducts = await db.product.findMany({
      where: { vendorId: user.id },
      select: { id: true },
    });

    const productIds = vendorProducts.map((p) => p.id);

    if (productIds.length === 0) {
      // No products yet - return empty dashboard
      return NextResponse.json({
        success: true,
        data: {
          stats: {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            productViews: 0,
            revenueChange: 0,
            ordersChange: 0,
            productsChange: 0,
            viewsChange: 0,
          },
          recentOrders: [],
          topProducts: [],
        },
      });
    }

    // Get current month orders
    const currentMonthOrders = await db.order.findMany({
      where: {
        createdAt: { gte: currentMonthStart },
        items: {
          some: {
            productId: { in: productIds },
          },
        },
      },
      include: {
        items: {
          where: {
            productId: { in: productIds },
          },
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
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get previous month orders for comparison
    const prevMonthOrders = await db.order.findMany({
      where: {
        createdAt: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
        items: {
          some: {
            productId: { in: productIds },
          },
        },
      },
      include: {
        items: {
          where: {
            productId: { in: productIds },
          },
        },
      },
    });

    // Calculate current month revenue
    const currentRevenue = currentMonthOrders.reduce((sum, order) => {
      return (
        sum +
        order.items.reduce((itemSum, item) => {
          return itemSum + Number(item.price) * item.quantity;
        }, 0)
      );
    }, 0);

    // Calculate previous month revenue
    const prevRevenue = prevMonthOrders.reduce((sum, order) => {
      return (
        sum +
        order.items.reduce((itemSum, item) => {
          return itemSum + Number(item.price) * item.quantity;
        }, 0)
      );
    }, 0);

    // Calculate stats
    const currentOrdersCount = currentMonthOrders.length;
    const prevOrdersCount = prevMonthOrders.length;
    const totalProducts = productIds.length;

    // Calculate growth percentages
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

    const productsChange = Math.random() * 20 - 10; // Mock change
    const viewsChange = Math.random() * 30 - 15; // Mock change
    const productViews =
      Math.floor(currentRevenue * 0.1) + Math.floor(Math.random() * 500);

    // Format recent orders - CORRECTED STRUCTURE
    const recentOrders = currentMonthOrders.slice(0, 5).map((order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + Number(item.price) * item.quantity;
      }, 0);

      return {
        id: order.id,
        orderNumber: order.id.slice(-8).toUpperCase(),
        customerName: order.user.name || order.user.email || "Unknown Customer",
        total: orderTotal,
        status: order.status.toLowerCase(),
        createdAt: order.createdAt.toISOString(),
      };
    });

    // Calculate top products - CORRECTED STRUCTURE
    const productSales = new Map<
      string,
      {
        name: string;
        totalSold: number;
        totalRevenue: number;
        price: number;
      }
    >();

    currentMonthOrders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId;
        const revenue = Number(item.price) * item.quantity;
        const price = Number(item.price);

        if (productSales.has(productId)) {
          const existing = productSales.get(productId)!;
          existing.totalSold += item.quantity;
          existing.totalRevenue += revenue;
        } else {
          productSales.set(productId, {
            name: item.product.name,
            totalSold: item.quantity,
            totalRevenue: revenue,
            price: price,
          });
        }
      });
    });

    const topProducts = Array.from(productSales.entries())
      .sort(([, a], [, b]) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map(([id, product]) => ({
        id,
        name: product.name,
        price: product.price,
        sold: product.totalSold,
        revenue: product.totalRevenue,
      }));

    // Build dashboard data with correct structure
    const dashboardData = {
      stats: {
        totalRevenue: currentRevenue,
        totalOrders: currentOrdersCount,
        totalProducts: totalProducts,
        productViews: productViews,
        revenueChange: revenueChange,
        ordersChange: ordersChange,
        productsChange: productsChange,
        viewsChange: viewsChange,
      },
      recentOrders: recentOrders,
      topProducts: topProducts,
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
