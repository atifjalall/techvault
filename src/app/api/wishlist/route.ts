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

    // Get wishlist items
    const wishlistItems = await db.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
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

    // Transform data
    const transformedItems = wishlistItems.map((item) => {
      const avgRating =
        item.product.reviews.length > 0
          ? item.product.reviews.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / item.product.reviews.length
          : 0;

      return {
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        brand: item.product.brand?.name,
        price: Number(item.product.price),
        originalPrice: item.product.comparePrice
          ? Number(item.product.comparePrice)
          : null,
        image: item.product.images[0] || "",
        category: item.product.category.name,
        inStock: item.product.stock > 0,
        stock: item.product.stock,
        rating: avgRating > 0 ? avgRating : null,
        reviewCount: item.product._count.reviews,
        slug: item.product.slug,
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

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
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
