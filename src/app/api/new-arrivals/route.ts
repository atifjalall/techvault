/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "8");

    console.log("🆕 Fetching new arrivals, limit:", limit);

    // Fetch only products marked as new arrivals
    const products = await db.product.findMany({
      where: {
        newArrival: true,
        isActive: true,
        deletedAt: null,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            variantName: true,
            price: true,
            comparePrice: true,
            stock: true,
            color: true,
            colorHex: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    console.log(`✅ Found ${products.length} new arrival products`);

    return NextResponse.json({
      success: true,
      products: products,
      count: products.length,
    });
  } catch (error) {
    console.error("❌ Error fetching new arrivals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch new arrivals" },
      { status: 500 }
    );
  }
}
