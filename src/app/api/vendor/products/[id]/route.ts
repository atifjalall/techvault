/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/vendor/products/[id] - Get single product with variants
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
        variants: {
          orderBy: { createdAt: "asc" },
        },
        specifications: {
          orderBy: [{ categoryOrder: "asc" }, { specOrder: "asc" }],
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

// PATCH /api/vendor/products/[id] - Update product with variants support
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
        variants: true,
        specifications: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Prepare update data for the main product
    const updateData: any = {};

    // Base product fields
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

    // Product settings
    if (body.featured !== undefined)
      updateData.featured = Boolean(body.featured);
    if (body.newArrival !== undefined)
      updateData.newArrival = Boolean(body.newArrival);
    if (body.returnable !== undefined)
      updateData.returnable = Boolean(body.returnable);
    if (body.isActive !== undefined)
      updateData.isActive = Boolean(body.isActive);

    // Delivery settings
    if (body.deliveryDays !== undefined) {
      updateData.deliveryDays = body.deliveryDays
        ? Number(body.deliveryDays)
        : null;
    }

    // Arrays
    if (body.images !== undefined) {
      updateData.images = Array.isArray(body.images) ? body.images : [];
    }
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags) ? body.tags : [];
    }

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

    // Calculate computed fields from variants
    if (body.variants && Array.isArray(body.variants)) {
      const activeVariants = body.variants.filter((v: any) => v.isActive);

      if (activeVariants.length > 0) {
        // Calculate basePrice (cheapest variant)
        const prices = activeVariants
          .map((v: any) => parseFloat(v.price || "0"))
          .filter((p: number) => p > 0);

        if (prices.length > 0) {
          updateData.basePrice = Math.min(...prices);
        }

        // Calculate totalStock (sum of all variant stocks)
        updateData.totalStock = activeVariants.reduce(
          (total: number, v: any) => total + parseInt(v.stock || "0"),
          0
        );
      }
    }

    console.log("🔄 UPDATE DATA:", JSON.stringify(updateData, null, 2));

    // Start a transaction to ensure consistency
    const result = await db.$transaction(async (tx) => {
      // Update the main product
      const updatedProduct = await tx.product.update({
        where: { id: id },
        data: updateData,
      });

      // Handle variants update
      if (body.variants !== undefined && Array.isArray(body.variants)) {
        console.log("🎨 PROCESSING VARIANTS:", body.variants.length);

        // Get existing variants
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
        });

        // Track which variants to keep (ones that have an ID in the request)
        const variantIdsToKeep = body.variants
          .filter((v: any) => v.id)
          .map((v: any) => v.id);

        // Delete variants that are no longer in the request
        const variantsToDelete = existingVariants.filter(
          (existing) => !variantIdsToKeep.includes(existing.id)
        );

        for (const variantToDelete of variantsToDelete) {
          // Delete related cart items first
          await tx.variantCartItem.deleteMany({
            where: { productVariantId: variantToDelete.id },
          });

          // Delete the variant
          await tx.productVariant.delete({
            where: { id: variantToDelete.id },
          });
        }

        // Process each variant in the request
        for (const variantData of body.variants) {
          const variantPayload = {
            productId: id,
            variantName: variantData.variantName || "",
            sku: variantData.sku || null,
            price: parseFloat(variantData.price || "0"),
            comparePrice: variantData.comparePrice
              ? parseFloat(variantData.comparePrice)
              : null,
            stock: parseInt(variantData.stock || "0"),
            lowStockAlert: parseInt(variantData.lowStockAlert || "10"),
            color: variantData.color || null,
            colorHex: variantData.colorHex || null,
            storage: variantData.storage || null,
            ram: variantData.ram || null,
            size: variantData.size || null,
            length: variantData.length || null,
            material: variantData.material || null,
            attributes: variantData.attributes || null,
            images: Array.isArray(variantData.cloudinaryUrls)
              ? variantData.cloudinaryUrls
              : [],
            thumbnailImage: variantData.thumbnailImage || null,
            isActive: Boolean(variantData.isActive),
          };

          if (variantData.id) {
            // Update existing variant
            await tx.productVariant.update({
              where: { id: variantData.id },
              data: variantPayload,
            });
            console.log("✅ UPDATED VARIANT:", variantData.id);
          } else {
            // Create new variant
            const newVariant = await tx.productVariant.create({
              data: variantPayload,
            });
            console.log("✅ CREATED VARIANT:", newVariant.id);
          }
        }
      }

      // Handle specifications update
      if (
        body.specifications !== undefined &&
        Array.isArray(body.specifications)
      ) {
        console.log(
          "📋 PROCESSING SPECIFICATIONS:",
          body.specifications.length
        );

        // Delete existing specifications
        await tx.productSpecification.deleteMany({
          where: { productId: id },
        });

        // Create new specifications
        for (const [index, spec] of body.specifications.entries()) {
          if (spec.name && spec.value) {
            await tx.productSpecification.create({
              data: {
                productId: id,
                category: spec.category || "Other",
                categoryOrder: spec.categoryOrder || 0,
                name: spec.name,
                value: spec.value,
                unit: spec.unit || null,
                specOrder: spec.specOrder || index,
                isHighlight: Boolean(spec.isHighlight),
              },
            });
          }
        }
      }

      return updatedProduct;
    });

    // Fetch the final product with all relations
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
        variants: {
          orderBy: { createdAt: "asc" },
        },
        specifications: {
          orderBy: [{ categoryOrder: "asc" }, { specOrder: "asc" }],
        },
        _count: {
          select: {
            reviews: true,
            cartItems: true,
          },
        },
      },
    });

    console.log("✅ FINAL UPDATED PRODUCT:", finalProduct?.name);

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
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "SKU must be unique" },
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

// DELETE /api/vendor/products/[id] - Delete product with variants
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
      // Get all variant IDs first
      const variants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });

      const variantIds = variants.map((v) => v.id);

      // Delete variant-related records
      if (variantIds.length > 0) {
        await tx.variantCartItem.deleteMany({
          where: { productVariantId: { in: variantIds } },
        });

        await tx.variantOrderItem.deleteMany({
          where: { productVariantId: { in: variantIds } },
        });
      }

      // Delete product variants
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      // Delete product specifications
      await tx.productSpecification.deleteMany({
        where: { productId: id },
      });

      // Delete regular cart items
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

      // Delete order items
      await tx.orderItem.deleteMany({
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
