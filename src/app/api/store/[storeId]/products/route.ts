/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/store/[storeId]/products/route.ts
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

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const subcategory = searchParams.get("subcategory") || "";
    const brand = searchParams.get("brand") || "";
    const sortBy = searchParams.get("sort") || "newest";

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Verify vendor exists and is active
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

    // Build where conditions
    const whereConditions: any = {
      vendorId: storeId,
      isActive: true,
      deletedAt: null,
    };

    // Search filter
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Category filter
    if (category) {
      whereConditions.category = { name: category };
    }

    // Subcategory filter
    if (subcategory) {
      whereConditions.subcategory = { name: subcategory };
    }

    // Brand filter
    if (brand) {
      whereConditions.brand = { name: brand };
    }

    // Build order by
    let orderBy: any = { createdAt: "desc" };

    switch (sortBy) {
      case "price-asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price-desc":
        orderBy = { basePrice: "desc" };
        break;
      case "rating":
        orderBy = { createdAt: "desc" }; // Can be enhanced with actual rating calculation
        break;
      case "popular":
        orderBy = { sold: "desc" };
        break;
      case "featured":
        orderBy = [{ featured: "desc" }, { createdAt: "desc" }];
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await db.product.count({
      where: whereConditions,
    });

    // Fetch products with all related data
    const products = await db.product.findMany({
      where: whereConditions,
      include: {
        brand: {
          select: { id: true, name: true },
        },
        category: {
          select: { id: true, name: true },
        },
        subcategory: {
          select: { id: true, name: true },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            price: true,
            comparePrice: true,
            stock: true,
            color: true,
            storage: true,
            size: true,
            images: true,
            variantName: true,
          },
          orderBy: { price: "asc" },
        },
        reviews: {
          select: { rating: true },
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Format products for frontend
    const formattedProducts = products.map((product) => {
      // Calculate average rating
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0;

      // Determine pricing
      let price = Number(product.basePrice || 0);
      let originalPrice: number | undefined = undefined;
      let priceRange: { min: number; max: number } | null = null;

      if (product.variants.length > 0) {
        const variantPrices = product.variants.map((v) => Number(v.price));
        const minPrice = Math.min(...variantPrices);
        const maxPrice = Math.max(...variantPrices);

        price = minPrice;

        if (minPrice !== maxPrice) {
          priceRange = { min: minPrice, max: maxPrice };
        }

        // Check for compare price
        const comparePrice = product.variants.find(
          (v) => v.comparePrice
        )?.comparePrice;
        if (comparePrice) {
          originalPrice = Number(comparePrice);
        }
      }

      // Calculate total stock
      const totalStock =
        product.variants.length > 0
          ? product.variants.reduce((sum, variant) => sum + variant.stock, 0)
          : product.totalStock;

      // Check if new (created within last 30 days)
      const isNew =
        product.newArrival ||
        new Date(product.createdAt) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand?.name || null,
        price,
        originalPrice,
        image: product.images[0] || "/placeholder-product.jpg",
        images: product.images,
        rating: Number(avgRating.toFixed(1)),
        reviewCount: product._count.reviews,
        stock: totalStock,
        category: product.category.name,
        isNew,
        isFeatured: product.featured,
        isActive: product.isActive,
        // Simple variant count instead of complex object array
        variants: product.variants.length,
        // Optional: Add description if you have it
        description: product.description,
      };
    });

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Store Products API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load products" },
      { status: 500 }
    );
  }
}
