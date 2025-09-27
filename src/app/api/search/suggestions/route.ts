import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase().trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    // Search categories
    const categories = await db.category.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 3,
    });

    // Search subcategories
    const subcategories = await db.subcategory.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      take: 3,
    });

    // Search products - Fixed for brand relation
    const products = await db.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            brand: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 4,
    });

    const suggestions = [
      ...categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: "category" as const,
        href: `/products?category=${cat.slug}`,
      })),
      ...subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        type: "subcategory" as const,
        category: sub.category.name,
        href: `/products?subcategory=${sub.slug}`,
      })),
      ...products.map((product) => ({
        id: product.id,
        name: product.name,
        type: "product" as const,
        href: `/products/${product.slug}`,
      })),
    ];

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
