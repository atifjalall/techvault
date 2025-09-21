// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/orders/[id] - Get specific order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get order with all details
    const order = await db.order.findFirst({
      where: {
        id: id,
        userId: user.id, // Ensure user owns this order
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
                brand: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Calculate detailed totals
    const subtotal = order.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const tax = subtotal * 0.19; // 19% VAT
    const calculatedTotal = subtotal + shipping + tax;

    // Transform order data
    const transformedOrder = {
      id: order.id,
      status: order.status,
      total: Number(order.total),
      shippingAddress: order.shippingAddress,
      paymentIntentId: order.paymentIntentId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        brand: item.product.brand?.name,
        image: item.product.images[0] || "",
        slug: item.product.slug,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      totals: {
        subtotal,
        shipping,
        tax,
        total: calculatedTotal,
      },
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    };

    return NextResponse.json({
      success: true,
      order: transformedOrder,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
