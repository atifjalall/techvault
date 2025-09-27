/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/vendor/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Helper function to generate display order number from ID
function generateOrderNumber(orderId: string): string {
  return `TF-${orderId.slice(-8).toUpperCase()}`;
}

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

    if (user.role !== "VENDOR") {
      return NextResponse.json(
        { success: false, error: "Vendor access required" },
        { status: 403 }
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

    // Get vendor's products (both for regular and variant items)
    const vendorProducts = await db.product.findMany({
      where: { vendorId: user.id, isActive: true },
      select: { id: true },
    });

    const vendorProductIds = vendorProducts.map((p) => p.id);

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

    // Build where conditions for orders
    const whereConditions: any = {
      // Only show orders that contain vendor's products (regular or variant items)
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
    };

    // Search filter
    if (search) {
      const searchConditions = {
        OR: [
          { id: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      };

      whereConditions.AND = [searchConditions];
    }

    // Status filter - Fixed enum mapping
    if (status && status !== "all") {
      const statusMapping: { [key: string]: string } = {
        pending: "PENDING",
        confirmed: "CONFIRMED",
        processing: "PROCESSING",
        shipped: "SHIPPED",
        delivered: "DELIVERED",
        cancelled: "CANCELLED",
        refunded: "REFUNDED",
      };

      const mappedStatus = statusMapping[status.toLowerCase()];
      if (mappedStatus) {
        if (whereConditions.AND) {
          whereConditions.AND.push({ status: mappedStatus });
        } else {
          whereConditions.status = mappedStatus;
        }
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
      } else {
        whereConditions.AND = [dateCondition];
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
            // Only include items that belong to this vendor
            where: {
              productId: { in: vendorProductIds },
            },
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
            // Only include variant items that belong to this vendor
            where: {
              productVariant: {
                productId: { in: vendorProductIds },
              },
            },
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

    // Get all orders for statistics calculation
    const allVendorOrders = await db.order.findMany({
      where: whereConditions,
      include: {
        items: {
          where: { productId: { in: vendorProductIds } },
        },
        variantItems: {
          where: {
            productVariant: { productId: { in: vendorProductIds } },
          },
        },
      },
    });

    // Helper function to calculate vendor-specific order total
    const calculateOrderTotal = (order: any) => {
      const regularItemsTotal = order.items.reduce((sum: number, item: any) => {
        return sum + Number(item.price) * item.quantity;
      }, 0);

      const variantItemsTotal = order.variantItems.reduce(
        (sum: number, item: any) => {
          return sum + Number(item.price) * item.quantity;
        },
        0
      );

      return regularItemsTotal + variantItemsTotal;
    };

    // Calculate statistics
    const stats = {
      totalRevenue: allVendorOrders.reduce(
        (sum, order) => sum + calculateOrderTotal(order),
        0
      ),
      pendingOrders: allVendorOrders.filter(
        (order) => order.status === "PENDING"
      ).length,
      processingOrders: allVendorOrders.filter(
        (order) => order.status === "PROCESSING"
      ).length,
      completedOrders: allVendorOrders.filter(
        (order) => order.status === "DELIVERED"
      ).length,
      totalOrders: allVendorOrders.length,
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
              (item.productVariant as any).images?.[0] ||
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
        orderNumber: generateOrderNumber(order.id),
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
        paymentMethod: order.paymentMethod || "stripe",
        paymentStatus: order.paymentStatus?.toLowerCase() || "pending",
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        estimatedDelivery:
          order.estimatedDelivery?.toISOString() ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        trackingNumber:
          order.trackingNumber || `TK${order.id.slice(-6).toUpperCase()}`,
        shippingCarrier: order.shippingCarrier || "DHL",
        notes: order.notes || "",
        priority: order.priority || "NORMAL",
        paymentIntentId: order.paymentIntentId,
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

    // Validate status and map to enum values
    const statusMapping: { [key: string]: string } = {
      pending: "PENDING",
      confirmed: "CONFIRMED",
      processing: "PROCESSING",
      shipped: "SHIPPED",
      delivered: "DELIVERED",
      cancelled: "CANCELLED",
      refunded: "REFUNDED",
    };

    const mappedStatus = statusMapping[status.toLowerCase()];
    if (!mappedStatus) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Check if vendor has access to this order
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

    // Update order status with additional fields based on status
    const updateData: any = {
      status: mappedStatus,
      updatedAt: new Date(),
    };

    // Set additional fields based on status
    if (mappedStatus === "SHIPPED" && !order.shippedAt) {
      updateData.shippedAt = new Date();
      if (!order.trackingNumber) {
        updateData.trackingNumber = `TK${order.id.slice(-6).toUpperCase()}`;
      }
      if (!order.shippingCarrier) {
        updateData.shippingCarrier = "DHL";
      }
    }

    if (mappedStatus === "DELIVERED" && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
      if (!order.shippedAt) {
        updateData.shippedAt = new Date();
      }
    }

    if (mappedStatus === "CANCELLED" && !order.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Create notification for status change
    try {
      await db.notification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: "ORDER_UPDATED",
          message: `Your order ${generateOrderNumber(order.id)} status has been updated to ${status}`,
          severity: "INFO",
        },
      });
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the order update if notification creation fails
    }

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        status: updatedOrder.status.toLowerCase(),
      },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
