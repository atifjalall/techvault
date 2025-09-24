// src/app/api/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/wishlist - Get user's wishlist
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role === "VENDOR") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get wishlist items with updated product structure
    const wishlistItems = await db.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            variants: {
              where: { isActive: true },
              select: {
                id: true,
                price: true,
                comparePrice: true,
                stock: true,
                color: true,
                thumbnailImage: true,
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
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform data with variant-based pricing
    const transformedItems = wishlistItems.map((item) => {
      const activeVariants = item.product.variants.filter((v) => v.stock > 0);
      const allVariants = item.product.variants;

      // Get pricing from variants
      const prices = allVariants.map((v) => Number(v.price));
      const comparePrices = allVariants
        .map((v) => (v.comparePrice ? Number(v.comparePrice) : null))
        .filter(Boolean) as number[];

      const basePrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0);

      // Calculate average rating
      const avgRating =
        item.product.reviews.length > 0
          ? item.product.reviews.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / item.product.reviews.length
          : 0;

      // Calculate discount percentage
      const lowestComparePrice =
        comparePrices.length > 0 ? Math.min(...comparePrices) : null;
      const discountPercentage =
        lowestComparePrice && lowestComparePrice > basePrice
          ? Math.round(
              ((lowestComparePrice - basePrice) / lowestComparePrice) * 100
            )
          : 0;

      // Get color options from variants
      const colorOptions = allVariants
        .filter((v) => v.color)
        .map((v) => ({
          color: v.color,
          image: v.thumbnailImage,
        }))
        .filter((v, i, arr) => arr.findIndex((a) => a.color === v.color) === i); // Remove duplicates

      return {
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        brand: item.product.brand?.name,
        slug: item.product.slug,

        // Variant-based pricing
        price: basePrice,
        maxPrice: maxPrice !== basePrice ? maxPrice : null,
        priceRange:
          maxPrice !== basePrice
            ? `€${basePrice} - €${maxPrice}`
            : `€${basePrice}`,
        originalPrice: lowestComparePrice,
        discountPercentage,

        // Images and variants
        image: item.product.images[0] || "",
        colorOptions,
        variantCount: allVariants.length,

        // Availability
        inStock: totalStock > 0,
        stock: totalStock,

        // Product details
        category: item.product.category.name,
        rating: avgRating > 0 ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: item.product._count.reviews,

        // Additional info
        featured: item.product.featured,
        newArrival: item.product.newArrival,
        dateAdded: item.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      items: transformedItems,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role === "VENDOR") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if product exists and is active
    const product = await db.product.findUnique({
      where: {
        id: productId,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if already in wishlist
    const existingItem = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Product already in wishlist" },
        { status: 400 }
      );
    }

    // Add to wishlist
    const wishlistItem = await db.wishlistItem.create({
      data: {
        userId: user.id,
        productId: productId,
      },
    });

    // Create notification for user
    await db.notification.create({
      data: {
        userId: user.id,
        productId: productId,
        type: "WISHLIST_ITEM_BACK_IN_STOCK",
        message: `"${product.name}" has been added to your wishlist. We'll notify you of price drops and availability.`,
        severity: "INFO",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product added to wishlist",
      item: wishlistItem,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role === "VENDOR") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove from wishlist
    const deletedItem = await db.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId: productId,
      },
    });

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { error: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
