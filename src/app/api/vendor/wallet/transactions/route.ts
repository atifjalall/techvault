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
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const typeFilter = searchParams.get("type") || "";
    const statusFilter = searchParams.get("status") || "";
    const dateFilter = searchParams.get("date") || "";

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

    // Get vendor's products to filter transactions
    let productIds: string[] = [];
    if (user.role === "VENDOR") {
      const vendorProducts = await db.product.findMany({
        where: { vendorId: user.id },
        select: { id: true },
      });
      productIds = vendorProducts.map((p) => p.id);
    }

    // Build date filter
    let dateFilterCondition = {};
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

      dateFilterCondition = { gte: startDate };
    }

    // Get all orders for this vendor to create transactions
    const orders = await db.order.findMany({
      where: {
        ...(productIds.length > 0 && {
          items: {
            some: {
              productId: { in: productIds },
            },
          },
        }),
        ...(Object.keys(dateFilterCondition).length > 0 && {
          createdAt: dateFilterCondition,
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

    // Create transaction records from orders
    const allTransactions: any[] = [];

    orders.forEach((order) => {
      // Calculate order total for vendor's products
      const orderTotal = order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );

      if (orderTotal > 0) {
        // Create sale transaction
        const mainProduct = order.items[0]?.product?.name || "Product Sale";
        const description =
          order.items.length > 1
            ? `${mainProduct} +${order.items.length - 1} more items`
            : mainProduct;

        allTransactions.push({
          id: `sale-${order.id}`,
          type: "sale",
          amount: orderTotal,
          description: `Sale: ${description}`,
          date: order.createdAt.toISOString(),
          status:
            order.status === "DELIVERED"
              ? "completed"
              : order.status === "CANCELLED"
                ? "failed"
                : "pending",
          orderId: order.id,
          customerName: order.user.name || order.user.email,
          paymentMethod: "Credit Card", // Could be enhanced with actual payment method
          reference: `ORD-${order.id.slice(-8).toUpperCase()}`,
        });

        // Add platform fee transaction (simulate 3% fee)
        const platformFee = orderTotal * 0.03;
        allTransactions.push({
          id: `fee-${order.id}`,
          type: "fee",
          amount: -platformFee,
          description: "Platform fee (3%)",
          date: order.createdAt.toISOString(),
          status: "completed",
          orderId: order.id,
          reference: `FEE-${order.id.slice(-8).toUpperCase()}`,
        });

        // Add payout transaction for delivered orders (simulate weekly payouts)
        if (order.status === "DELIVERED") {
          const payoutAmount = orderTotal - platformFee;
          const payoutDate = new Date(order.createdAt);
          payoutDate.setDate(payoutDate.getDate() + 7); // Payout 7 days after delivery

          allTransactions.push({
            id: `payout-${order.id}`,
            type: "payout",
            amount: -payoutAmount,
            description: `Weekly payout to bank account`,
            date: payoutDate.toISOString(),
            status: payoutDate <= new Date() ? "completed" : "pending",
            reference: `PAY-${order.id.slice(-8).toUpperCase()}`,
            paymentMethod: "Bank Transfer",
          });
        }
      }
    });

    // Add some refund transactions (from cancelled orders)
    const cancelledOrders = orders.filter(
      (order) => order.status === "CANCELLED"
    );
    cancelledOrders.forEach((order) => {
      const refundAmount = order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );

      if (refundAmount > 0) {
        allTransactions.push({
          id: `refund-${order.id}`,
          type: "refund",
          amount: -refundAmount,
          description: `Refund: Order #${order.id.slice(-8).toUpperCase()}`,
          date: new Date(order.updatedAt).toISOString(),
          status: "completed",
          orderId: order.id,
          customerName: order.user.name || order.user.email,
          reference: `REF-${order.id.slice(-8).toUpperCase()}`,
        });
      }
    });

    // Sort transactions by date (most recent first)
    allTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Apply filters
    let filteredTransactions = allTransactions;

    // Search filter
    if (search) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) =>
          transaction.description
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          transaction.reference?.toLowerCase().includes(search.toLowerCase()) ||
          transaction.customerName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter && typeFilter !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => transaction.type === typeFilter
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => transaction.status === statusFilter
      );
    }

    // Calculate pagination
    const totalCount = filteredTransactions.length;
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;
    const paginatedTransactions = filteredTransactions.slice(
      skip,
      skip + limit
    );

    // Calculate stats
    const totalIncome = allTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutgoing = Math.abs(
      allTransactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const pendingAmount = allTransactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const completedTransactions = allTransactions.filter(
      (t) => t.status === "completed"
    ).length;

    const stats = {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalOutgoing: Math.round(totalOutgoing * 100) / 100,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
      completedTransactions,
    };

    return NextResponse.json({
      success: true,
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      stats,
    });
  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
