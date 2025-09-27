import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Fetch categories with their subcategories
    const categories = await db.category.findMany({
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // Format for navbar consumption
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      href: `/products?category=${category.slug}`,
      subcategories: category.subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        href: `/products?subcategory=${sub.slug}`,
      })),
    }));

    return NextResponse.json({
      success: true,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
