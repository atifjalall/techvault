// src/app/api/store/[storeId]/subcategories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const params = await context.params;
    const storeId = params.storeId;
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get("category");

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: "Store ID is required" },
        { status: 400 }
      );
    }

    if (!categoryName) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    // Verify vendor exists
    const vendor = await db.user.findFirst({
      where: {
        id: storeId,
        role: "VENDOR",
        deleteAt: null,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    // Get subcategories for this vendor and category
    const subcategories = await db.subcategory.findMany({
      where: {
        category: {
          name: categoryName,
        },
        products: {
          some: {
            vendorId: storeId,
            isActive: true,
            deletedAt: null,
          },
        },
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                vendorId: storeId,
                isActive: true,
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format subcategories response
    const subcategoriesData = subcategories.map((subcategory) => ({
      id: subcategory.id,
      name: subcategory.name,
      count: subcategory._count.products,
    }));

    return NextResponse.json({
      success: true,
      subcategories: subcategoriesData,
    });
  } catch (error) {
    console.error("Subcategories API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load subcategories" },
      { status: 500 }
    );
  }
}
