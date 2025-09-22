/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

    const product = await db.product.findFirst({
      where: {
        id: id,
        vendorId: session.user.id, // Ensure user owns this product
      },
      include: {
        brand: true, // Include brand relation
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
        colors: true, // Include color variants
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

// PATCH /api/vendor/products/[id] - Update product with color variants support
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
    console.log("📝 UPDATE REQUEST BODY:", JSON.stringify(body, null, 2));

    // Verify user owns this product
    const existingProduct = await db.product.findFirst({
      where: {
        id: id,
        vendorId: session.user.id,
      },
      include: {
        colors: true, // Include existing colors
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    console.log(
      "📦 EXISTING PRODUCT:",
      JSON.stringify(existingProduct, null, 2)
    );

    // Prepare update data - handle all field types properly
    const updateData: any = {};

    // String fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description || null;
    if (body.brandId !== undefined) updateData.brandId = body.brandId || null;
    if (body.modelNumber !== undefined)
      updateData.modelNumber = body.modelNumber || null;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.subcategoryId !== undefined)
      updateData.subcategoryId = body.subcategoryId || null;
    if (body.warranty !== undefined)
      updateData.warranty = body.warranty || null;
    if (body.weight !== undefined) updateData.weight = body.weight || null;
    if (body.dimensions !== undefined)
      updateData.dimensions = body.dimensions || null;
    if (body.storage !== undefined) updateData.storage = body.storage || null;
    if (body.length !== undefined) updateData.length = body.length || null;
    if (body.color !== undefined) updateData.color = body.color || null;
    if (body.material !== undefined)
      updateData.material = body.material || null;

    // Number fields
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.comparePrice !== undefined)
      updateData.comparePrice = body.comparePrice
        ? Number(body.comparePrice)
        : null;
    if (body.stock !== undefined) updateData.stock = Number(body.stock);
    if (body.lowStockAlert !== undefined)
      updateData.lowStockAlert = Number(body.lowStockAlert);
    if (body.deliveryDays !== undefined)
      updateData.deliveryDays = body.deliveryDays
        ? Number(body.deliveryDays)
        : null;

    // Boolean fields
    if (body.featured !== undefined)
      updateData.featured = Boolean(body.featured);
    if (body.newArrival !== undefined)
      updateData.newArrival = Boolean(body.newArrival);
    if (body.returnable !== undefined)
      updateData.returnable = Boolean(body.returnable);
    if (body.isActive !== undefined)
      updateData.isActive = Boolean(body.isActive);

    // Array fields
    if (body.images !== undefined)
      updateData.images = Array.isArray(body.images) ? body.images : [];
    if (body.tags !== undefined)
      updateData.tags = Array.isArray(body.tags) ? body.tags : [];

    // JSON fields
    if (body.specifications !== undefined) {
      updateData.specifications =
        body.specifications && typeof body.specifications === "object"
          ? body.specifications
          : {};
    }

    console.log("🔄 UPDATE DATA:", JSON.stringify(updateData, null, 2));

    // Validate brandId if provided
    if (updateData.brandId) {
      const brand = await db.brand.findUnique({
        where: { id: updateData.brandId },
      });

      if (!brand) {
        return NextResponse.json({ error: "Invalid brand" }, { status: 400 });
      }
    }

    // Validate subcategory if provided
    if (updateData.subcategoryId && updateData.categoryId) {
      const subcategory = await db.subcategory.findUnique({
        where: { id: updateData.subcategoryId },
      });

      if (!subcategory || subcategory.categoryId !== updateData.categoryId) {
        return NextResponse.json(
          { error: "Invalid subcategory for selected category" },
          { status: 400 }
        );
      }
    }

    // Generate new slug if name changed
    if (updateData.name && updateData.name !== existingProduct.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Ensure slug is unique
      const existingSlug = await db.product.findFirst({
        where: {
          slug: updateData.slug,
          id: { not: id },
        },
      });

      if (existingSlug) {
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
    }

    console.log("🎨 PROCESSING COLOR VARIANTS:", body.colors);

    // Start a transaction to ensure consistency
    const result = await db.$transaction(async (tx) => {
      // Update the main product
      const updatedProduct = await tx.product.update({
        where: { id: id },
        data: updateData,
      });

      // Handle color variants update if colors are provided
      // Handle color variants update if colors are provided
      if (body.colors !== undefined) {
        console.log("RECEIVED COLORS:", JSON.stringify(body.colors, null, 2));

        if (Array.isArray(body.colors) && body.colors.length > 0) {
          for (const colorVariant of body.colors) {
            if (colorVariant.color && colorVariant.image) {
              try {
                // Check if this exact combination already exists
                const existing = await tx.productColor.findFirst({
                  where: {
                    productId: id,
                    color: colorVariant.color,
                  },
                });

                if (!existing) {
                  const result = await tx.productColor.create({
                    data: {
                      productId: id,
                      color: colorVariant.color,
                      image: colorVariant.image,
                    },
                  });
                  console.log("COLOR CREATED:", result);
                } else {
                  console.log("COLOR ALREADY EXISTS:", colorVariant.color);
                  // Optionally update the image if it's different
                  if (existing.image !== colorVariant.image) {
                    await tx.productColor.update({
                      where: { id: existing.id },
                      data: { image: colorVariant.image },
                    });
                    console.log("COLOR IMAGE UPDATED:", colorVariant.color);
                  }
                }
              } catch (error) {
                console.error("COLOR CREATION ERROR:", error);
              }
            }
          }
        }
      }

      return updatedProduct;
    });

    // Fetch the final product with all relations including updated colors
    const finalProduct = await db.product.findUnique({
      where: { id: id },
      include: {
        brand: true,
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
        colors: true, // Include updated color variants
        _count: {
          select: {
            reviews: true,
            cartItems: true,
          },
        },
      },
    });

    console.log(
      "✅ FINAL UPDATED PRODUCT WITH COLORS:",
      JSON.stringify(finalProduct, null, 2)
    );

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: finalProduct,
    });
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);

    // Handle Prisma constraint errors
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Invalid category, subcategory, or brand reference" },
          { status: 400 }
        );
      }
    }

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
    const existingProduct = await db.product.findFirst({
      where: {
        id: id,
        vendorId: session.user.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete related records first (in a transaction)
    await db.$transaction(async (tx) => {
      // Delete color variants
      await tx.productColor.deleteMany({
        where: { productId: id },
      });

      // Delete cart items
      await tx.cartItem.deleteMany({
        where: { productId: id },
      });

      // Delete wishlist items
      await tx.wishlistItem.deleteMany({
        where: { productId: id },
      });

      // Delete reviews
      await tx.review.deleteMany({
        where: { productId: id },
      });

      // Finally delete the product
      await tx.product.delete({
        where: { id: id },
      });
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
