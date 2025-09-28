// src/app/api/store/[storeSlug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storeSlug: string }> }
) {
  try {
    const params = await context.params;
    const storeSlug = params.storeSlug;

    // Validate store slug parameter
    if (
      !storeSlug ||
      typeof storeSlug !== "string" ||
      storeSlug.trim() === ""
    ) {
      return NextResponse.json(
        { success: false, error: "Valid store slug is required" },
        { status: 400 }
      );
    }

    // Normalize the slug (handle URL encoding and case sensitivity)
    const normalizedSlug = decodeURIComponent(storeSlug.toLowerCase().trim());

    // Get vendor details by store slug
    const vendor = await db.user.findFirst({
      where: {
        role: "VENDOR",
        deleteAt: null,
        vendorSettings: {
          storeSlug: normalizedSlug,
        },
      },
      include: {
        vendorSettings: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            businessName: true,
            businessType: true,
            logo: true,
            banner: true,
            website: true,
          },
        },
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

    // Handle vendor not found
    if (!vendor || !vendor.vendorSettings) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    // Get vendor's review statistics
    const reviewStats = await db.review.aggregate({
      where: {
        product: {
          vendorId: vendor.id,
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

    // Calculate actual rating and review count
    const actualRating = reviewStats._avg.rating
      ? Math.round(Number(reviewStats._avg.rating) * 10) / 10 // Round to 1 decimal
      : 0;
    const totalReviews = reviewStats._count.rating || 0;

    // Get categories with product counts for this vendor
    const categories = await db.category.findMany({
      where: {
        products: {
          some: {
            vendorId: vendor.id,
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
                vendorId: vendor.id,
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
            vendorId: vendor.id,
            isActive: true,
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate follower count (using a more realistic algorithm based on products and reviews)
    const baseFollowers = Math.max(100, vendor._count.products * 15);
    const reviewBonus = Math.floor(totalReviews * 2.5);
    const ratingBonus = actualRating >= 4 ? Math.floor(actualRating * 50) : 0;
    const calculatedFollowers = baseFollowers + reviewBonus + ratingBonus;

    // Format vendor response
    const vendorData = {
      id: vendor.id,
      name: vendor.name || "Store Owner",
      businessName:
        vendor.vendorSettings.businessName ||
        vendor.vendorSettings.storeName ||
        vendor.name ||
        "Professional Store",
      storeName:
        vendor.vendorSettings.storeName ||
        vendor.vendorSettings.businessName ||
        vendor.name ||
        "Professional Store",
      storeSlug: vendor.vendorSettings.storeSlug,
      description:
        vendor.bio ||
        `Professional ${vendor.vendorSettings.businessType || "electronics"} store offering quality products with reliable service.`,
      image:
        vendor.vendorSettings.logo || vendor.image || "/placeholder-store.jpg",
      location: "Germany", // Could be made dynamic in the future
      rating: actualRating,
      totalReviews: totalReviews,
      totalProducts: vendor._count.products,
      joinedDate: vendor.createdAt.toISOString(),
      verified: vendor.isVerified || false,
      responseTime: "< 2 hours", // Could be made dynamic based on actual response data
      shippingTime: "1-3 days", // Could be made dynamic based on vendor settings
      returnPolicy: "14 days", // Could be made dynamic based on vendor settings
      categories: categories.map((cat) => cat.name),
      followers: calculatedFollowers,
      website: vendor.vendorSettings.website || null,
      businessType: vendor.vendorSettings.businessType || null,
    };

    // Format categories response with product counts
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

    // Set appropriate cache headers
    const response = NextResponse.json({
      success: true,
      vendor: vendorData,
      categories: categoriesData,
      brands: brandsData,
    });

    // Cache for 5 minutes (store data doesn't change frequently)
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    console.error("Store API Error:", error);

    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to load store data",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
