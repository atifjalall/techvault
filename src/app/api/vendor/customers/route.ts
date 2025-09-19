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
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";
    const verificationFilter = searchParams.get("verified") || "";
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

    // Get vendor's products to filter customers who bought from this vendor
    let productIds: string[] = [];
    if (user.role === "VENDOR") {
      const vendorProducts = await db.product.findMany({
        where: { vendorId: user.id },
        select: { id: true },
      });
      productIds = vendorProducts.map((p) => p.id);
    }

    // Build where conditions for customers who have orders with vendor's products
    const whereConditions: any = {};

    // If vendor has products, only show customers who bought from them
    if (productIds.length > 0) {
      whereConditions.orders = {
        some: {
          items: {
            some: {
              productId: { in: productIds },
            },
          },
        },
      };
    }

    // Search filter
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Role filter
    if (roleFilter && roleFilter !== "all") {
      whereConditions.role = roleFilter.toUpperCase();
    }

    // Verification filter
    if (verificationFilter && verificationFilter !== "all") {
      whereConditions.isVerified = verificationFilter === "true";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get customers with order data
    const customers = await db.user.findMany({
      where: whereConditions,
      include: {
        _count: {
          select: {
            orders:
              productIds.length > 0
                ? {
                    where: {
                      items: {
                        some: {
                          productId: { in: productIds },
                        },
                      },
                    },
                  }
                : true,
          },
        },
        orders: {
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
            id: true,
            total: true,
            createdAt: true,
            items: {
              where:
                productIds.length > 0
                  ? {
                      productId: { in: productIds },
                    }
                  : {},
              select: {
                price: true,
                quantity: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        [sortBy]: sortOrder as "asc" | "desc",
      },
      skip,
      take: limit,
    });

    // Calculate total spent for each customer and format response
    const customersWithStats = customers.map((customer) => {
      // Calculate total spent from vendor-specific orders
      let totalSpent = 0;
      let lastOrderDate: string | undefined;

      if (customer.orders && customer.orders.length > 0) {
        // Get the most recent order date
        lastOrderDate = customer.orders[0].createdAt.toISOString();

        // Calculate total spent from all orders
        totalSpent = customer.orders.reduce((sum, order) => {
          const orderTotal = order.items.reduce((itemSum, item) => {
            return itemSum + Number(item.price) * item.quantity;
          }, 0);
          return sum + orderTotal;
        }, 0);
      }

      return {
        id: customer.id,
        name: customer.name || "",
        email: customer.email,
        phone: customer.phone,
        image: customer.image,
        emailVerified: customer.emailVerified?.toISOString(),
        createdAt: customer.createdAt.toISOString(),
        role: customer.role as "CUSTOMER" | "VENDOR" | "ADMIN",
        isVerified: customer.isVerified,
        _count: {
          orders: customer._count.orders,
        },
        totalSpent: Math.round(totalSpent * 100) / 100, // Round to 2 decimal places
        lastOrderDate,
      };
    });

    // Get total count for pagination
    const totalCount = await db.user.count({
      where: whereConditions,
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Calculate stats for all customers (vendor-specific if applicable)
    const statsWhereCondition =
      productIds.length > 0
        ? {
            orders: {
              some: {
                items: {
                  some: {
                    productId: { in: productIds },
                  },
                },
              },
            },
          }
        : {};

    const allCustomers = await db.user.findMany({
      where: statsWhereCondition,
      select: {
        id: true,
        createdAt: true,
        orders: {
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
            total: true,
            createdAt: true,
            items: {
              where:
                productIds.length > 0
                  ? {
                      productId: { in: productIds },
                    }
                  : {},
              select: {
                price: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    // Calculate stats
    const totalCustomers = allCustomers.length;

    // New customers this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newCustomersThisMonth = allCustomers.filter((customer) => {
      const createdDate = new Date(customer.createdAt);
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    }).length;

    // Calculate total revenue and total orders for average calculation
    let totalRevenue = 0;
    let totalOrderCount = 0;

    allCustomers.forEach((customer) => {
      customer.orders.forEach((order) => {
        // Calculate order total from items
        const orderTotal = order.items.reduce((sum, item) => {
          return sum + Number(item.price) * item.quantity;
        }, 0);

        if (orderTotal > 0) {
          totalRevenue += orderTotal;
          totalOrderCount += 1;
        }
      });
    });

    // Calculate average order value with proper null check
    const averageOrderValue =
      totalOrderCount > 0
        ? Math.round((totalRevenue / totalOrderCount) * 100) / 100
        : 0;

    const stats = {
      totalCustomers,
      newCustomersThisMonth,
      averageOrderValue,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    };

    return NextResponse.json({
      success: true,
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      stats,
    });
  } catch (error) {
    console.error("Customers API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
