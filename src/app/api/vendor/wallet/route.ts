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

    // Get vendor user
    const vendor = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!vendor || vendor.role !== "VENDOR") {
      return NextResponse.json(
        { success: false, error: "Vendor access required" },
        { status: 403 }
      );
    }

    // Since your schema doesn't have vendorId in Product,
    // we'll calculate based on all orders for now
    // You might want to add vendorId to Product model later

    // Get all orders (for now showing all since no vendor relationship exists)
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to recent orders
    });

    // Calculate totals
    let totalEarnings = 0;
    let thisMonthEarnings = 0;
    let availableBalance = 0;
    let pendingBalance = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const transactions: Array<{
      id: string;
      type: "sale" | "payout" | "refund" | "fee";
      amount: number;
      description: string;
      date: string;
      status: "completed" | "pending" | "failed";
      orderId?: string;
    }> = [];

    orders.forEach((order) => {
      order.items.forEach((item) => {
        // Convert Decimal to number for calculations
        const itemTotal = Number(item.price) * item.quantity;
        totalEarnings += itemTotal;

        const orderDate = new Date(order.createdAt);
        if (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        ) {
          thisMonthEarnings += itemTotal;
        }

        // Determine balance based on order status
        if (order.status === "DELIVERED") {
          availableBalance += itemTotal;
        } else if (["PROCESSING", "SHIPPED"].includes(order.status)) {
          pendingBalance += itemTotal;
        }

        // Add to transactions
        transactions.push({
          id: `sale-${order.id}-${item.id}`,
          type: "sale",
          amount: itemTotal,
          description: `${item.product.name} - Order #${order.id.slice(-8)}`,
          date: order.createdAt.toISOString(),
          status: order.status === "DELIVERED" ? "completed" : "pending",
          orderId: order.id,
        });
      });
    });

    // Calculate growth (mock calculation - you can implement proper historical comparison)
    const lastMonthEarnings = thisMonthEarnings * 0.85; // Mock previous month
    const growth =
      lastMonthEarnings > 0
        ? (
            ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) *
            100
          ).toFixed(1)
        : "0";

    // Sort transactions by date (most recent first)
    transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Prepare wallet data
    const walletData = {
      balance: {
        available: availableBalance,
        pending: pendingBalance,
        total: availableBalance + pendingBalance,
      },
      thisMonth: {
        earnings: thisMonthEarnings,
        growth: parseFloat(growth),
      },
      payoutInfo: {
        nextPayout: getNextPayoutDate(),
        frequency: "Weekly",
        method: "Bank Transfer",
        account: "****1234", // You can store this in user profile
      },
      recentTransactions: transactions.slice(0, 10), // Last 10 transactions
    };

    return NextResponse.json({
      success: true,
      data: walletData,
    });
  } catch (error) {
    console.error("Wallet API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get next payout date (weekly)
function getNextPayoutDate(): string {
  const today = new Date();
  const daysUntilFriday = (5 - today.getDay() + 7) % 7; // Next Friday
  const nextPayout = new Date(today);
  nextPayout.setDate(
    today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday)
  );
  return nextPayout.toISOString();
}

// POST endpoint for requesting payouts (optional)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount, method } = await request.json();

    // Here you would implement payout logic
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Payout request submitted successfully",
      payoutId: `payout_${Date.now()}`,
    });
  } catch (error) {
    console.error("Payout request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process payout request" },
      { status: 500 }
    );
  }
}
