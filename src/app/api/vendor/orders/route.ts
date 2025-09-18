import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

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

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // If user is vendor, get their products, otherwise get all products for demo
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
      });
      productIds = allProducts.map((p) => p.id);
    }

    // Fetch orders data
    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: startDate },
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
                images: true,
                price: true,
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
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate current month data
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthOrders = orders.filter(
      (order) => new Date(order.createdAt) >= currentMonthStart
    );

    // Calculate previous month for growth comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
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

    // Calculate metrics
    const currentRevenue = currentMonthOrders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum, item) => itemSum + Number(item.price) * item.quantity,
          0
        ),
      0
    );

    const prevRevenue = prevMonthOrders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum, item) => itemSum + Number(item.price) * item.quantity,
          0
        ),
      0
    );

    const revenueGrowth =
      prevRevenue > 0
        ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
        : 0;

    const currentOrdersCount = currentMonthOrders.length;
    const prevOrdersCount = prevMonthOrders.length;
    const ordersGrowth =
      prevOrdersCount > 0
        ? ((currentOrdersCount - prevOrdersCount) / prevOrdersCount) * 100
        : 0;

    const avgOrderValue =
      currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;
    const prevAvgOrderValue =
      prevOrdersCount > 0 ? prevRevenue / prevOrdersCount : 0;
    const avgOrderGrowth =
      prevAvgOrderValue > 0
        ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100
        : 0;

    // Get unique customers
    const currentCustomers = new Set(
      currentMonthOrders.map((order) => order.userId)
    ).size;
    const prevCustomers = new Set(prevMonthOrders.map((order) => order.userId))
      .size;
    const customerGrowth =
      prevCustomers > 0
        ? ((currentCustomers - prevCustomers) / prevCustomers) * 100
        : 0;

    // Get products data
    const products = await db.product.findMany({
      where: productIds.length > 0 ? { id: { in: productIds } } : {},
      select: {
        id: true,
        name: true,
        images: true,
        stock: true,
        isActive: true,
        price: true,
        _count: {
          select: {
            orderItems: {
              where: {
                order: {
                  createdAt: { gte: startDate },
                },
              },
            },
          },
        },
      },
    });

    const activeProducts = products.filter((p) => p.isActive).length;

    // Calculate top products
    const productSales = new Map<
      string,
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        product: any;
        revenue: number;
        orders: number;
      }
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.productId;
        const revenue = Number(item.price) * item.quantity;

        if (productSales.has(key)) {
          const existing = productSales.get(key)!;
          existing.revenue += revenue;
          existing.orders += 1;
        } else {
          productSales.set(key, {
            product: item.product,
            revenue,
            orders: 1,
          });
        }
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((item, index) => ({
        id: item.product.id,
        name: item.product.name,
        image: item.product.images[0] || "/products/default.jpg",
        revenue: item.revenue,
        orders: item.orders,
        growth: Math.random() * 20 - 5, // Mock growth for now
        stock: item.product.stock,
      }));

    // Generate time series data (last 8 periods based on range)
    const timeSeriesData = [];
    const periodCount = 8;

    for (let i = periodCount - 1; i >= 0; i--) {
      const periodEnd = new Date(now);
      const periodStart = new Date(now);

      switch (range) {
        case "7d":
          periodStart.setDate(now.getDate() - i - 1);
          periodEnd.setDate(now.getDate() - i);
          break;
        case "30d":
          periodStart.setDate(now.getDate() - (i + 1) * 4);
          periodEnd.setDate(now.getDate() - i * 4);
          break;
        case "90d":
          periodStart.setDate(now.getDate() - (i + 1) * 11);
          periodEnd.setDate(now.getDate() - i * 11);
          break;
        case "1y":
          periodStart.setMonth(now.getMonth() - (i + 1));
          periodEnd.setMonth(now.getMonth() - i);
          break;
      }

      const periodOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= periodStart && orderDate < periodEnd;
      });

      const periodRevenue = periodOrders.reduce(
        (sum, order) =>
          sum +
          order.items.reduce(
            (itemSum, item) => itemSum + Number(item.price) * item.quantity,
            0
          ),
        0
      );

      timeSeriesData.push({
        date:
          range === "1y"
            ? periodStart.toLocaleDateString("en-US", { month: "short" })
            : range === "90d"
              ? `Week ${periodCount - i}`
              : range === "30d"
                ? `${periodStart.getDate()}/${periodStart.getMonth() + 1}`
                : periodStart.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: periodRevenue,
        orders: periodOrders.length,
        visitors: Math.floor(periodOrders.length * (2 + Math.random() * 3)), // Mock visitors
        conversion:
          periodOrders.length > 0
            ? (periodOrders.length / Math.max(100, periodOrders.length * 20)) *
              100
            : 0,
      });
    }

    // Customer segments (simplified)
    const newCustomers = currentMonthOrders.filter((order) => {
      const customerSignupDate = new Date(order.user.createdAt);
      return customerSignupDate >= currentMonthStart;
    }).length;

    const returningCustomers = currentCustomers - newCustomers;

    const customerSegments = [
      {
        segment: "New Customers",
        count: newCustomers,
        revenue: currentMonthOrders
          .filter(
            (order) => new Date(order.user.createdAt) >= currentMonthStart
          )
          .reduce(
            (sum, order) =>
              sum +
              order.items.reduce(
                (itemSum, item) => itemSum + Number(item.price) * item.quantity,
                0
              ),
            0
          ),
        percentage:
          currentCustomers > 0 ? (newCustomers / currentCustomers) * 100 : 0,
        color: "#3B82F6",
      },
      {
        segment: "Returning Customers",
        count: returningCustomers,
        revenue: currentRevenue * 0.6, // Approximate
        percentage:
          currentCustomers > 0
            ? (returningCustomers / currentCustomers) * 100
            : 0,
        color: "#10B981",
      },
    ];

    // Build response
    const insightsData = {
      overview: {
        totalRevenue: currentRevenue,
        revenueGrowth,
        totalOrders: currentOrdersCount,
        ordersGrowth,
        avgOrderValue,
        avgOrderGrowth,
        conversionRate: 3.2, // Mock for now
        conversionGrowth: -0.5, // Mock for now
        totalCustomers: currentCustomers,
        customerGrowth,
        totalProducts: products.length,
        activeProducts,
      },
      timeSeriesData,
      topProducts,
      customerSegments,
      geographicData: [
        {
          country: "Germany",
          orders: Math.floor(currentOrdersCount * 0.6),
          revenue: currentRevenue * 0.6,
          percentage: 60,
        },
        {
          country: "Austria",
          orders: Math.floor(currentOrdersCount * 0.2),
          revenue: currentRevenue * 0.2,
          percentage: 20,
        },
        {
          country: "Switzerland",
          orders: Math.floor(currentOrdersCount * 0.15),
          revenue: currentRevenue * 0.15,
          percentage: 15,
        },
        {
          country: "Netherlands",
          orders: Math.floor(currentOrdersCount * 0.05),
          revenue: currentRevenue * 0.05,
          percentage: 5,
        },
      ],
      deviceData: [
        {
          device: "Desktop",
          visitors: 1580,
          orders: Math.floor(currentOrdersCount * 0.5),
          conversion: 5.6,
          color: "#6366F1",
        },
        {
          device: "Mobile",
          visitors: 1820,
          orders: Math.floor(currentOrdersCount * 0.4),
          conversion: 4.2,
          color: "#8B5CF6",
        },
        {
          device: "Tablet",
          visitors: 250,
          orders: Math.floor(currentOrdersCount * 0.1),
          conversion: 4.8,
          color: "#06B6D4",
        },
      ],
      performanceMetrics: {
        pageViews: 8945,
        uniqueVisitors: 2650,
        bounceRate: 32.5,
        avgSessionDuration: 4.2,
        returnCustomerRate:
          currentCustomers > 0
            ? (returningCustomers / currentCustomers) * 100
            : 0,
        customerLifetimeValue: avgOrderValue * 2, // Simple approximation
      },
      recommendations: [] as Array<{
        type: "warning" | "success" | "opportunity";
        title: string;
        description: string;
        impact: "low" | "medium" | "high";
        actionable: boolean;
      }>,
    };

    // Generate smart recommendations based on data
    if (products.some((p) => p.stock < 10)) {
      insightsData.recommendations.push({
        type: "warning" as const,
        title: "Low Stock Alert",
        description: `${products.filter((p) => p.stock < 10).length} products have low stock levels. Consider restocking to avoid lost sales.`,
        impact: "medium" as const,
        actionable: true,
      });
    }

    if (revenueGrowth > 15) {
      insightsData.recommendations.push({
        type: "success" as const,
        title: "Strong Growth",
        description: `Revenue is up ${revenueGrowth.toFixed(1)}% this month. Great performance!`,
        impact: "high" as const,
        actionable: false,
      });
    }

    if (avgOrderValue < 100) {
      insightsData.recommendations.push({
        type: "opportunity" as const,
        title: "Increase Order Value",
        description:
          "Consider bundle deals or cross-selling to increase average order value.",
        impact: "high" as const,
        actionable: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: insightsData,
    });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
