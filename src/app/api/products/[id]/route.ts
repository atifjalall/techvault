/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Product identifier is required" },
        { status: 400 }
      );
    }

    const product = await db.product.findFirst({
      where: {
        slug: id, // Still search by slug, but param is named 'id'
        isActive: true,
        deletedAt: null,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            website: true,
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
        vendor: {
          select: {
            id: true,
            name: true,
            vendorSettings: {
              select: {
                storeName: true,
                storeSlug: true, // Include store slug
                businessName: true,
                logo: true,
              },
            },
          },
        },
        variants: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            variantName: true,
            sku: true,
            price: true,
            comparePrice: true,
            stock: true,
            lowStockAlert: true,
            color: true,
            colorHex: true,
            storage: true,
            ram: true,
            size: true,
            length: true,
            material: true,
            attributes: true,
            images: true,
            thumbnailImage: true,
            isActive: true,
          },
          orderBy: {
            price: "asc",
          },
        },
        specifications: {
          select: {
            id: true,
            category: true,
            categoryOrder: true,
            name: true,
            value: true,
            unit: true,
            specOrder: true,
            isHighlight: true,
          },
          orderBy: [{ categoryOrder: "asc" }, { specOrder: "asc" }],
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
        _count: {
          select: {
            reviews: true,
            wishlistItems: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get active variants with stock
    const activeVariants = product.variants.filter((v) => v.isActive);
    const inStockVariants = activeVariants.filter((v) => v.stock > 0);

    // Compute pricing from variants
    const allPrices = activeVariants.map((v) => Number(v.price));
    const allComparePrices = activeVariants
      .map((v) => (v.comparePrice ? Number(v.comparePrice) : null))
      .filter(Boolean) as number[];

    const basePrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
    const totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0);

    // Calculate average rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0;

    // Calculate discount percentage
    const lowestComparePrice =
      allComparePrices.length > 0 ? Math.min(...allComparePrices) : null;
    const discountPercentage =
      lowestComparePrice && lowestComparePrice > basePrice
        ? Math.round(
            ((lowestComparePrice - basePrice) / lowestComparePrice) * 100
          )
        : 0;

    // Group specifications by category
    const groupedSpecs = product.specifications.reduce(
      (acc, spec) => {
        if (!acc[spec.category]) {
          acc[spec.category] = {
            category: spec.category,
            categoryOrder: spec.categoryOrder,
            specs: [],
          };
        }
        acc[spec.category].specs.push({
          id: spec.id,
          name: spec.name,
          value: spec.value,
          unit: spec.unit,
          specOrder: spec.specOrder,
          isHighlight: spec.isHighlight,
        });
        return acc;
      },
      {} as Record<string, any>
    );

    // Get highlighted specifications
    const highlightedSpecs = product.specifications
      .filter((spec) => spec.isHighlight)
      .slice(0, 6); // Limit to 6 key specs

    // Transform variants for frontend
    const transformedVariants = activeVariants.map((variant) => ({
      id: variant.id,
      variantName: variant.variantName,
      sku: variant.sku,
      price: Number(variant.price),
      comparePrice: variant.comparePrice ? Number(variant.comparePrice) : null,
      stock: variant.stock,
      lowStockAlert: variant.lowStockAlert,
      inStock: variant.stock > 0,
      isLowStock: variant.stock <= variant.lowStockAlert,

      // Attributes
      color: variant.color,
      colorHex: variant.colorHex,
      storage: variant.storage,
      ram: variant.ram,
      size: variant.size,
      length: variant.length,
      material: variant.material,
      attributes: variant.attributes,

      // Images
      images: variant.images,
      thumbnailImage: variant.thumbnailImage,

      // Discount for this variant
      discountPercentage:
        variant.comparePrice &&
        Number(variant.comparePrice) > Number(variant.price)
          ? Math.round(
              ((Number(variant.comparePrice) - Number(variant.price)) /
                Number(variant.comparePrice)) *
                100
            )
          : 0,
    }));

    // Get unique attribute options for variant selection
    const colorOptions = [
      ...new Set(activeVariants.filter((v) => v.color).map((v) => v.color)),
    ];
    const storageOptions = [
      ...new Set(activeVariants.filter((v) => v.storage).map((v) => v.storage)),
    ];
    const ramOptions = [
      ...new Set(activeVariants.filter((v) => v.ram).map((v) => v.ram)),
    ];
    const sizeOptions = [
      ...new Set(activeVariants.filter((v) => v.size).map((v) => v.size)),
    ];

    // Transform product response with store slug
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      images: product.images,

      // Brand and category info
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      vendor: {
        id: product.vendor.id,
        name: product.vendor.name,
        storeName:
          product.vendor.vendorSettings?.storeName || product.vendor.name,
        storeSlug: product.vendor.vendorSettings?.storeSlug, // Include store slug
        businessName: product.vendor.vendorSettings?.businessName,
        logo: product.vendor.vendorSettings?.logo,
      },

      // Computed pricing
      basePrice,
      maxPrice: maxPrice !== basePrice ? maxPrice : null,
      comparePrice: lowestComparePrice,
      priceRange:
        maxPrice !== basePrice
          ? `€${basePrice} - €${maxPrice}`
          : `€${basePrice}`,

      // Stock and availability
      totalStock,
      inStock: totalStock > 0,

      // Product attributes
      featured: product.featured,
      newArrival: product.newArrival,
      returnable: product.returnable,
      isActive: product.isActive,

      // Stats
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product._count.reviews,
      wishlistCount: product._count.wishlistItems,
      discountPercentage,

      // Product details
      tags: product.tags,
      modelNumber: product.modelNumber,
      views: product.views,
      sold: product.sold,
      deliveryDays: product.deliveryDays,
      warranty: product.warranty,
      weight: product.weight,
      dimensions: product.dimensions,

      // Variants and specifications
      variants: transformedVariants,
      variantCount: activeVariants.length,
      inStockVariantCount: inStockVariants.length,

      // Variant options for selection
      variantOptions: {
        colors: colorOptions,
        storage: storageOptions,
        ram: ramOptions,
        sizes: sizeOptions,
      },

      // Specifications
      specifications: Object.values(groupedSpecs).sort(
        (a, b) => a.categoryOrder - b.categoryOrder
      ),
      highlightedSpecs,

      // Reviews
      reviews: product.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.user.id,
          name: review.user.name,
          image: review.user.image,
        },
      })),

      // Timestamps
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    // Increment view count (fire and forget)
    db.product
      .update({
        where: { id: product.id },
        data: { views: { increment: 1 } },
      })
      .catch((error) => {
        console.error("Failed to increment product views:", error);
      });

    return NextResponse.json({
      success: true,
      product: transformedProduct,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
