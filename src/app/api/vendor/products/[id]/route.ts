/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/vendor/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: id,
        vendorId: session.user.id, // Ensure user owns this product
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            cartItems: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/vendor/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Verify user owns this product
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: id,
        vendorId: session.user.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    // Basic fields that can be updated
    const allowedFields = [
      "name",
      "description",
      "brand",
      "modelNumber",
      "price",
      "comparePrice",
      "stock",
      "lowStockAlert",
      "images",
      "specifications",
      "featured",
      "isActive",
      "warranty",
      "weight",
      "dimensions",
      "color",
      "material",
      "tags",
      "categoryId",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Generate new slug if name changed
    if (body.name && body.name !== existingProduct.name) {
      updateData.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Ensure slug is unique
      const existingSlug = await prisma.product.findFirst({
        where: {
          slug: updateData.slug,
          id: { not: id },
        },
      });

      if (existingSlug) {
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/vendor/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns this product
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: id,
        vendorId: session.user.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete related records first (if needed)
    // Note: Adjust based on your schema's cascade settings
    await prisma.cartItem.deleteMany({
      where: { productId: id },
    });

    await prisma.review.deleteMany({
      where: { productId: id },
    });

    // Delete the product
    await prisma.product.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
