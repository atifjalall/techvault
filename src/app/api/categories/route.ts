// src/app/api/categories/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Fetch categories with their subcategories
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });

    // Fetch all subcategories
    const subcategories = await db.subcategory.findMany({
      orderBy: { name: "asc" },
    });

    // Group subcategories by category
    const categoriesWithSubcategories = categories.map((category) => ({
      ...category,
      subcategories: subcategories.filter(
        (sub: { categoryId: string; }) => sub.categoryId === category.id
      ),
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithSubcategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
