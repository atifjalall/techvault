// src/app/api/store/[storeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const params = await context.params;
    const storeId = params.storeId;

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Get vendor details with vendor settings
    const vendor = await db.user.findFirst({
      where: {
        id: storeId,
        role: "VENDOR",
        deleteAt: null,
      },
      include: {
        vendorSettings: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    // Get vendor's review statistics - calculate actual rating from reviews
    const reviewStats = await db.review.aggregate({
      where: {
        product: {
          vendorId: storeId,
          isActive: true,
          deletedAt: null,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    // Calculate actual rating or use 0 if no reviews
    const actualRating = reviewStats._avg.rating
      ? Number(reviewStats._avg.rating.toFixed(1))
      : 0;
    const totalReviews = reviewStats._count.rating || 0;

    // Get categories with product counts for this vendor
    const categories = await db.category.findMany({
      where: {
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

    // Get brands for this vendor
    const brands = await db.brand.findMany({
      where: {
        products: {
          some: {
            vendorId: storeId,
            isActive: true,
            deletedAt: null,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format vendor response with calculated rating
    const vendorData = {
      id: vendor.id,
      name: vendor.name || "Store Owner",
      businessName:
        vendor.vendorSettings?.businessName ||
        vendor.vendorSettings?.storeName ||
        vendor.name ||
        "Professional Store",
      description:
        vendor.bio ||
        "Quality electronics and technology products with professional service.",
      image: vendor.image || "/placeholder-store.jpg",
      location: "Germany",
      rating: actualRating, // Use calculated rating from reviews
      totalReviews: totalReviews, // Use actual review count
      totalProducts: vendor._count.products,
      joinedDate: vendor.createdAt.toISOString(),
      verified: vendor.isVerified,
      responseTime: "< 2 hours",
      shippingTime: "1-3 days",
      returnPolicy: "14 days",
      categories: categories.map((cat) => cat.name),
      followers: Math.floor(Math.random() * 3000) + 500,
    };

    // Format categories response
    const categoriesData = categories.map((category) => ({
      id: category.id,
      name: category.name,
      count: category._count.products,
    }));

    // Format brands response
    const brandsData = brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
    }));

    return NextResponse.json({
      success: true,
      vendor: vendorData,
      categories: categoriesData,
      brands: brandsData,
    });
  } catch (error) {
    console.error("Store API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load store data" },
      { status: 500 }
    );
  }
}
