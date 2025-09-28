import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for review submission
const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z.string().optional(),
});

// Validation schema for review deletion
const deleteReviewSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
});

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user details
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Only customers can leave reviews
    if (user.role !== "CUSTOMER") {
      return NextResponse.json(
        { success: false, error: "Only customers can submit reviews" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { productId, rating, comment } = reviewSchema.parse(body);

    // Check if product exists and is active
    const product = await db.product.findFirst({
      where: {
        id: productId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        vendorId: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found or inactive" },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await db.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    // Create the review
    const review = await db.review.create({
      data: {
        userId: user.id,
        productId: productId,
        rating: rating,
        comment: comment?.trim() || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            vendorId: true,
          },
        },
      },
    });

    // Create notification for vendor about new review
    try {
      await db.notification.create({
        data: {
          userId: product.vendorId,
          type: "NEW_REVIEW",
          severity: "INFO",
          message: `New ${rating}-star review for ${product.name}`,
          productId: productId,
        },
      });
    } catch (notificationError) {
      console.error("Failed to create review notification:", notificationError);
      // Don't fail the review creation if notification fails
    }

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.user.id,
          name: review.user.name,
          image: review.user.image,
        },
      },
    });
  } catch (error) {
    console.error("Review submission error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user details
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { reviewId } = deleteReviewSchema.parse(body);

    // Find the review and verify ownership
    const review = await db.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        userId: true,
        productId: true,
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Check if user owns the review or is an admin
    if (review.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    // Delete the review
    await db.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Review deletion error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch reviews for a product (optional endpoint for pagination)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      db.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      db.review.count({
        where: { productId },
      }),
    ]);

    // Calculate rating statistics
    const ratingStats = await db.review.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    });

    const avgRating = await db.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    return NextResponse.json({
      success: true,
      reviews: reviews.map((review) => ({
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
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews: totalCount,
        ratingDistribution: ratingStats.reduce(
          (acc, stat) => {
            acc[stat.rating] = stat._count.rating;
            return acc;
          },
          { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
        ),
      },
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
