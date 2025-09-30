/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const categoryParam = searchParams.get("category") || "";
    const subcategoryParam = searchParams.get("subcategory") || "";
    const brandParam = searchParams.get("brand") || "";
    const sort = searchParams.get("sort") || "featured";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const onlyOnSale = searchParams.get("onlyOnSale") === "true";
    const onlyInStock = searchParams.get("onlyInStock") === "true";
    const onlyNewArrival = searchParams.get("newArrival") === "true";

    console.log("🔍 API Filter params:", {
      page,
      limit,
      search,
      category: categoryParam,
      subcategory: subcategoryParam,
      brand: brandParam,
      sort,
      minPrice,
      maxPrice,
      onlyOnSale,
      onlyInStock,
      onlyNewArrival,
    });

    // Build where clause
    const where: any = {
      isActive: true,
      deletedAt: null,
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Category filter - Handle both slug and ID
    if (categoryParam) {
      // First try to find by slug, then by ID
      const categoryBySlug = await db.category.findUnique({
        where: { slug: categoryParam },
      });

      const categoryById = categoryBySlug
        ? null
        : await db.category.findUnique({
            where: { id: categoryParam },
          });

      const category = categoryBySlug || categoryById;
      if (category) {
        where.categoryId = category.id;
      }
    }

    // Subcategory filter - Handle both slug and ID
    if (subcategoryParam) {
      const subcategoryBySlug = await db.subcategory.findUnique({
        where: { slug: subcategoryParam },
      });

      const subcategoryById = subcategoryBySlug
        ? null
        : await db.subcategory.findUnique({
            where: { id: subcategoryParam },
          });

      const subcategory = subcategoryBySlug || subcategoryById;
      if (subcategory) {
        where.subcategoryId = subcategory.id;
      }
    }

    // Brand filter - Handle both name (as slug) and ID
    if (brandParam) {
      // Try to find by name converted from slug format
      const brandName = brandParam.replace(/-/g, " ");
      const brandByName = await db.brand.findFirst({
        where: {
          name: {
            equals: brandName,
            mode: "insensitive",
          },
        },
      });

      const brandById = brandByName
        ? null
        : await db.brand.findUnique({
            where: { id: brandParam },
          });

      const brand = brandByName || brandById;
      if (brand) {
        where.brandId = brand.id;
      }
    }

    // Price range filter (check variants)
    if (minPrice || maxPrice) {
      where.variants = {
        some: {
          isActive: true,
          ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
          ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
        },
      };
    }

    // Stock filter
    if (onlyInStock) {
      where.variants = {
        some: {
          isActive: true,
          stock: { gt: 0 },
        },
      };
    }

    // New arrival filter
    if (onlyNewArrival) {
      where.newArrival = true;
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sort) {
      case "price-asc":
        // This is complex with variants, we'll sort after fetching
        orderBy = [{ featured: "desc" }, { createdAt: "desc" }];
        break;
      case "price-desc":
        orderBy = [{ featured: "desc" }, { createdAt: "desc" }];
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "rating":
        // Will sort by calculated rating after fetch
        orderBy = [{ featured: "desc" }, { createdAt: "desc" }];
        break;
      case "featured":
      default:
        orderBy = [{ featured: "desc" }, { createdAt: "desc" }];
        break;
    }

    // Get total count
    const totalCount = await db.product.count({ where });

    // Get products with pagination
    const products = await db.product.findMany({
      where,
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
        subcategory: {
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
            storage: true,
            ram: true,
            size: true,
            thumbnailImage: true,
            images: true,
            isActive: true,
          },
          orderBy: {
            price: "asc",
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform products (rest of the transformation logic remains the same)
    let transformedProducts = products.map((product) => {
      const activeVariants = product.variants.filter((v) => v.isActive);
      const inStockVariants = activeVariants.filter((v) => v.stock > 0);
      const pricingVariants =
        activeVariants.length > 0 ? activeVariants : product.variants;

      const prices = pricingVariants
        .map((v) => Number(v.price))
        .filter((p) => p > 0);
      const comparePrices = pricingVariants
        .map((v) => (v.comparePrice ? Number(v.comparePrice) : null))
        .filter(Boolean) as number[];

      const basePrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const totalStock = activeVariants.reduce(
        (sum, v) => sum + (v.stock || 0),
        0
      );

      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0;

      const lowestComparePrice =
        comparePrices.length > 0 ? Math.min(...comparePrices) : null;
      const discountPercentage =
        lowestComparePrice && lowestComparePrice > basePrice
          ? Math.round(
              ((lowestComparePrice - basePrice) / lowestComparePrice) * 100
            )
          : 0;

      // Filter for on sale items
      const isOnSale = discountPercentage > 0;

      return {
        id: product.id,
        name: product.name || "Unnamed Product",
        slug: product.slug,
        description: product.description,
        images: product.images,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory,
        price: basePrice,
        maxPrice: maxPrice !== basePrice ? maxPrice : null,
        comparePrice: lowestComparePrice,
        stock: totalStock,
        inStock: totalStock > 0,
        featured: product.featured,
        newArrival: product.newArrival,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product._count.reviews,
        discountPercentage,
        variantCount: activeVariants.length,
        hasMultipleVariants: activeVariants.length > 1,
        variants: activeVariants,
        isActive: product.isActive,
        isOnSale,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    // Apply on sale filter after transformation
    if (onlyOnSale) {
      transformedProducts = transformedProducts.filter(
        (product) => product.isOnSale
      );
    }

    // Apply sorting after transformation
    switch (sort) {
      case "price-asc":
        transformedProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        transformedProducts.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        transformedProducts.sort((a, b) => b.avgRating - a.avgRating);
        break;
      case "newest":
        transformedProducts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "featured":
      default:
        transformedProducts.sort(
          (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        );
        break;
    }

    const totalPages = Math.ceil(totalCount / limit);

    console.log(`✅ API returning ${transformedProducts.length} products`);

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in products API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
