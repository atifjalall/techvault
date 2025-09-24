/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/vendor/orders/route.ts
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

    // For vendors, only show orders that contain their products (regular or variant items)
    if (user.role === "VENDOR") {
      whereConditions.OR = [
        {
          items: {
            some: {
              productId: { in: vendorProductIds },
            },
          },
        },
        {
          variantItems: {
            some: {
              productVariant: {
                productId: { in: vendorProductIds },
              },
            },
          },
        },
      ];
    }

    // Search filter
    if (search) {
      whereConditions.AND = [
        whereConditions.OR ? { OR: whereConditions.OR } : {},
        {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { orderNumber: { contains: search, mode: "insensitive" } },
            { user: { name: { contains: search, mode: "insensitive" } } },
            { user: { email: { contains: search, mode: "insensitive" } } },
          ],
        },
      ];
      delete whereConditions.OR;
    }

    // Status filter
    if (status && status !== "all") {
      if (whereConditions.AND) {
        whereConditions.AND.push({ status: status.toUpperCase() });
      } else {
        whereConditions.status = status.toUpperCase();
      }
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

      const dateCondition = { createdAt: { gte: startDate } };
      if (whereConditions.AND) {
        whereConditions.AND.push(dateCondition);
      } else if (whereConditions.OR) {
        whereConditions.AND = [{ OR: whereConditions.OR }, dateCondition];
        delete whereConditions.OR;
      } else {
        whereConditions.createdAt = { gte: startDate };
      }
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
                  vendorId: true,
                },
              },
            },
          },
          variantItems: {
            // For vendors, only include their variant products
            where:
              user.role === "VENDOR"
                ? {
                    productVariant: {
                      productId: { in: vendorProductIds },
                    },
                  }
                : undefined,
            include: {
              productVariant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      images: true,
                      vendorId: true,
                    },
                  },
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

    // Calculate statistics for all vendor orders
    const allOrdersForStats = await db.order.findMany({
      where:
        user.role === "VENDOR"
          ? {
              OR: [
                {
                  items: {
                    some: {
                      productId: { in: vendorProductIds },
                    },
                  },
                },
                {
                  variantItems: {
                    some: {
                      productVariant: {
                        productId: { in: vendorProductIds },
                      },
                    },
                  },
                },
              ],
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
        variantItems: {
          where:
            user.role === "VENDOR"
              ? {
                  productVariant: {
                    productId: { in: vendorProductIds },
                  },
                }
              : undefined,
        },
      },
    });

    // Helper function to calculate vendor-specific order total
    const calculateOrderTotal = (order: any) => {
      const regularItemsTotal = order.items.reduce((sum: number, item: any) => {
        // Only count items from this vendor's products
        if (
          user.role === "VENDOR" &&
          !vendorProductIds.includes(item.productId)
        ) {
          return sum;
        }
        return sum + Number(item.price) * item.quantity;
      }, 0);

      const variantItemsTotal = order.variantItems.reduce(
        (sum: number, item: any) => {
          // Only count variant items from this vendor's products
          if (
            user.role === "VENDOR" &&
            !vendorProductIds.includes(item.productVariant.product.id)
          ) {
            return sum;
          }
          return sum + Number(item.price) * item.quantity;
        },
        0
      );

      return regularItemsTotal + variantItemsTotal;
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
      // Combine regular and variant items
      const allOrderItems = [
        ...order.items.map((item) => ({
          id: item.id,
          type: "regular" as const,
          productId: item.productId,
          variantId: null,
          productName: item.product.name,
          variantName: null,
          productImage: item.product.images?.[0] || "/products/default.jpg",
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.price) * item.quantity,
          variantDetails: null,
        })),
        ...order.variantItems.map((item) => {
          const snapshot = item.variantSnapshot as any;
          return {
            id: item.id,
            type: "variant" as const,
            productId: item.productVariant.product.id,
            variantId: item.productVariantId,
            productName: item.productVariant.product.name,
            variantName: snapshot?.variantName || "Variant",
            productImage:
              item.productVariant.images?.[0] ||
              item.productVariant.product.images?.[0] ||
              "/products/default.jpg",
            quantity: item.quantity,
            price: Number(item.price),
            total: Number(item.price) * item.quantity,
            variantDetails: {
              color: snapshot?.color,
              storage: snapshot?.storage,
              ram: snapshot?.ram,
              size: snapshot?.size,
              material: snapshot?.material,
            },
          };
        }),
      ];

      const totalAmount = calculateOrderTotal(order);

      return {
        id: order.id,
        orderNumber:
          order.orderNumber || `TF-${order.id.slice(-8).toUpperCase()}`,
        customerId: order.user.id,
        customerName: order.user.name || "Unknown Customer",
        customerEmail: order.user.email,
        customerPhone: order.user.phone,
        status: order.status.toLowerCase(),
        totalAmount,
        shippingAmount: Number(order.shippingCost || 0),
        taxAmount: Number(order.taxAmount || 0),
        items: allOrderItems,
        shippingAddress: (order.shippingAddress as any) || {
          street: "",
          city: "",
          postalCode: "",
          country: "Germany",
        },
        paymentMethod: order.paymentMethod || "card",
        paymentStatus: order.paymentStatus?.toLowerCase() || "pending",
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        estimatedDelivery:
          order.estimatedDelivery?.toISOString() ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        trackingNumber:
          order.trackingNumber || `TK${order.id.slice(-6).toUpperCase()}`,
        shippingCarrier: order.shippingCarrier,
        notes: order.notes || "",
        priority: order.priority || "NORMAL",
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
        OR: [
          {
            items: {
              some: {
                productId: { in: vendorProductIds },
              },
            },
          },
          {
            variantItems: {
              some: {
                productVariant: {
                  productId: { in: vendorProductIds },
                },
              },
            },
          },
        ],
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

    // Create notification for status change
    await db.notification.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        type: "ORDER_UPDATED",
        message: `Your order status has been updated to ${status}`,
        severity: "INFO",
      },
    });

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
