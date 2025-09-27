import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log("🔍 Fetching products...");

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
            isActive: true,
          },
          orderBy: {
            price: "asc", // Order by price to get cheapest first
          },
        },
        specifications: {
          select: {
            category: true,
            name: true,
            value: true,
            unit: true,
            isHighlight: true,
          },
          orderBy: [{ categoryOrder: "asc" }, { specOrder: "asc" }],
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

    console.log(`📦 Found ${products.length} products in database`);

    if (products.length === 0) {
      console.log("⚠️ No products found! Check if:");
      console.log("   - Products exist in database");
      console.log("   - Products have isActive: true");
      console.log("   - Products have deletedAt: null");
      return NextResponse.json({
        success: true,
        products: [],
        count: 0,
        message: "No active products found",
      });
    }

    // Transform products to compute pricing from variants
    const transformedProducts = products.map((product, index) => {
      console.log(`🔄 Processing product ${index + 1}: ${product.name}`);
      console.log(`   Total variants: ${product.variants.length}`);

      // Get all active variants (regardless of stock) for pricing
      const activeVariants = product.variants.filter((v) => v.isActive);
      console.log(`   Active variants: ${activeVariants.length}`);

      // Get variants with stock for availability calculations
      const inStockVariants = activeVariants.filter((v) => v.stock > 0);
      console.log(`   In-stock variants: ${inStockVariants.length}`);

      // Use active variants for pricing even if out of stock
      const pricingVariants =
        activeVariants.length > 0 ? activeVariants : product.variants;

      // Compute pricing from active variants (not just in-stock ones)
      const prices = pricingVariants
        .map((v) => Number(v.price))
        .filter((p) => p > 0); // Only valid prices

      const comparePrices = pricingVariants
        .map((v) => (v.comparePrice ? Number(v.comparePrice) : null))
        .filter(Boolean) as number[];

      const basePrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const totalStock = activeVariants.reduce(
        (sum, v) => sum + (v.stock || 0),
        0
      );

      console.log(`   Base price: €${basePrice}, Total stock: ${totalStock}`);

      if (basePrice === 0) {
        console.warn(
          `⚠️ Product "${product.name}" has no valid pricing! Check variants.`
        );
      }

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

      // Get color options with images
      const colorOptions = activeVariants
        .filter((v) => v.color)
        .map((v) => ({
          color: v.color,
          colorHex: v.colorHex,
          image: v.thumbnailImage || (v.images && v.images[0]) || null,
          variantId: v.id,
        }))
        .filter((v, i, arr) => arr.findIndex((a) => a.color === v.color) === i); // Remove duplicates

      // Get storage options
      const storageOptions = activeVariants
        .filter((v) => v.storage)
        .map((v) => v.storage)
        .filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates

      // Get RAM options
      const ramOptions = activeVariants
        .filter((v) => v.ram)
        .map((v) => v.ram)
        .filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.images,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory,

        // Computed pricing from variants
        price: basePrice,
        maxPrice: maxPrice !== basePrice ? maxPrice : null,
        comparePrice: lowestComparePrice,
        priceRange:
          maxPrice !== basePrice && maxPrice > 0
            ? `€${basePrice.toFixed(2)} - €${maxPrice.toFixed(2)}`
            : basePrice > 0
              ? `€${basePrice.toFixed(2)}`
              : `€0.00`,

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
        storageOptions,
        ramOptions,
        hasMultipleVariants: activeVariants.length > 1,
        variants: activeVariants, // Include full variant data

        // Specifications grouped by category
        specifications: product.specifications.reduce(
          (acc, spec) => {
            if (!acc[spec.category]) {
              acc[spec.category] = [];
            }
            acc[spec.category].push({
              name: spec.name,
              value: spec.value,
              unit: spec.unit || undefined, // Convert null to undefined
              isHighlight: spec.isHighlight,
            });
            return acc;
          },
          {} as Record<
            string,
            Array<{
              name: string;
              value: string;
              unit?: string;
              isHighlight: boolean;
            }>
          >
        ),

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

    console.log(
      `✅ Returning ${transformedProducts.length} transformed products`
    );
    console.log(
      `📊 Products with valid pricing: ${transformedProducts.filter((p) => p.price > 0).length}`
    );

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      count: transformedProducts.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
