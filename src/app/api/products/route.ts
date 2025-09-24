import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: {
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
            isActive: true, // Added this field
          },
          orderBy: {
            price: "asc", // Order by price to get cheapest first
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
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });

    // Transform products to compute pricing from variants
    const transformedProducts = products.map((product) => {
      const activeVariants = product.variants.filter(
        (v) => v.isActive && v.stock > 0
      );

      // Compute pricing from variants
      const prices = activeVariants.map((v) => Number(v.price));
      const comparePrices = activeVariants
        .map((v) => (v.comparePrice ? Number(v.comparePrice) : null))
        .filter(Boolean) as number[];

      const basePrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0);

      // Calculate average rating
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0;

      // Calculate discount percentage (using lowest compare price vs base price)
      const lowestComparePrice =
        comparePrices.length > 0 ? Math.min(...comparePrices) : null;
      const discountPercentage =
        lowestComparePrice && lowestComparePrice > basePrice
          ? Math.round(
              ((lowestComparePrice - basePrice) / lowestComparePrice) * 100
            )
          : 0;

      // Get color options
      const colorOptions = activeVariants
        .filter((v) => v.color)
        .map((v) => ({
          color: v.color,
          colorHex: v.colorHex,
          image: v.thumbnailImage || v.images[0] || null,
        }))
        .filter((v, i, arr) => arr.findIndex((a) => a.color === v.color) === i); // Remove duplicates

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.images,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory,

        // Computed pricing
        price: basePrice,
        maxPrice: maxPrice !== basePrice ? maxPrice : null,
        comparePrice: lowestComparePrice,
        priceRange:
          maxPrice !== basePrice
            ? `€${basePrice} - €${maxPrice}`
            : `€${basePrice}`,

        // Stock and availability
        stock: totalStock,
        inStock: totalStock > 0,

        // Product attributes
        featured: product.featured,
        newArrival: product.newArrival,
        returnable: product.returnable,

        // Computed stats
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product._count.reviews,
        discountPercentage,

        // Variant info
        variantCount: activeVariants.length,
        colorOptions,
        hasMultipleVariants: activeVariants.length > 1,

        // Additional fields
        tags: product.tags,
        modelNumber: product.modelNumber,
        views: product.views,
        sold: product.sold,
        deliveryDays: product.deliveryDays,
        warranty: product.warranty,
        weight: product.weight,
        dimensions: product.dimensions,

        // Timestamps
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      products: transformedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
