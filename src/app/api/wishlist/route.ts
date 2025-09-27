import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wishlistItems = await db.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            brand: { select: { name: true } },
            category: { select: { name: true } },
            reviews: { select: { rating: true } },
            _count: { select: { reviews: true } },
          },
        },
        productVariant: {
          select: {
            id: true,
            variantName: true,
            price: true,
            comparePrice: true,
            stock: true,
            color: true,
            storage: true,
            ram: true,
            size: true,
            length: true,
            material: true,
            images: true,
            thumbnailImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const transformedItems = wishlistItems.map((item) => {
      const product = item.product;
      const variant = item.productVariant;

      if (variant) {
        // Variant-specific item
        const discountPercentage =
          variant.comparePrice &&
          Number(variant.comparePrice) > Number(variant.price)
            ? Math.round(
                ((Number(variant.comparePrice) - Number(variant.price)) /
                  Number(variant.comparePrice)) *
                  100
              )
            : 0;

        return {
          id: item.id,
          productId: product.id,
          productVariantId: variant.id,
          name: `${product.name} - ${variant.variantName}`,
          slug: product.slug,
          brand: product.brand?.name,
          price: Number(variant.price),
          originalPrice: variant.comparePrice
            ? Number(variant.comparePrice)
            : null,
          discountPercentage,
          image:
            variant.thumbnailImage ||
            variant.images[0] ||
            product.images[0] ||
            "",
          variant: {
            id: variant.id,
            name: variant.variantName,
            color: variant.color,
            storage: variant.storage,
            ram: variant.ram,
            size: variant.size,
            length: variant.length,
            material: variant.material,
          },
          inStock: variant.stock > 0,
          stock: variant.stock,
          category: product.category.name,
          rating:
            product.reviews.length > 0
              ? Math.round(
                  (product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                    product.reviews.length) *
                    10
                ) / 10
              : null,
          reviewCount: product._count.reviews,
          dateAdded: item.createdAt,
        };
      } else {
        // Product-only item (legacy)
        return {
          id: item.id,
          productId: product.id,
          productVariantId: null,
          name: product.name,
          slug: product.slug,
          brand: product.brand?.name,
          price: 0, // You'll need to calculate this from variants
          image: product.images[0] || "",
          inStock: false, // You'll need to calculate this
          stock: 0,
          category: product.category.name,
          rating:
            product.reviews.length > 0
              ? Math.round(
                  (product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                    product.reviews.length) *
                    10
                ) / 10
              : null,
          reviewCount: product._count.reviews,
          dateAdded: item.createdAt,
        };
      }
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

    const { productId, productVariantId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId, isActive: true, deletedAt: null },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If variant specified, verify it exists
    if (productVariantId) {
      const variant = await db.productVariant.findUnique({
        where: { id: productVariantId, productId, isActive: true },
        select: { id: true, variantName: true },
      });

      if (!variant) {
        return NextResponse.json(
          { error: "Product variant not found" },
          { status: 404 }
        );
      }
    }

    // Check if already in wishlist
    const existingItem = await db.wishlistItem.findFirst({
      where: {
        userId: user.id,
        productId,
        productVariantId: productVariantId || null,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already in wishlist" },
        { status: 400 }
      );
    }

    // Add to wishlist
    const wishlistItem = await db.wishlistItem.create({
      data: {
        userId: user.id,
        productId,
        productVariantId: productVariantId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: productVariantId
        ? "Product variant added to wishlist"
        : "Product added to wishlist",
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

    const { productId, productVariantId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

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
        productId,
        productVariantId: productVariantId || null,
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
      message: "Item removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
