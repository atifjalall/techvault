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
                businessName: true,
              },
            },
          },
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
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
        colors: {
          select: {
            id: true,
            color: true,
            image: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            cartItems: true,
            wishlistItems: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate average rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0;

    // Calculate discount percentage
    const discountPercentage = product.comparePrice
      ? Math.round(
          ((Number(product.comparePrice) - Number(product.price)) /
            Number(product.comparePrice)) *
            100
        )
      : 0;

    // Transform Decimal values to numbers for JSON serialization
    const transformedProduct = {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      avgRating: Math.round(avgRating * 10) / 10,
      discountPercentage,
      specifications: (product.specifications as Record<string, any>) || {},
      inStock: product.stock > 0,
      isNew: product.newArrival,
      reviewCount: product._count.reviews,
      cartCount: product._count.cartItems,
      wishlistCount: product._count.wishlistItems,
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
