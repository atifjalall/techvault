import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/cart - Get user's cart (updated for variant system)
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

    // Get regular cart items (for products without variants)
    const cartItems = await db.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            variants: {
              where: { isActive: true },
              orderBy: { price: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get variant-specific cart items
    const variantCartItems = await db.variantCartItem.findMany({
      where: { userId: user.id },
      include: {
        productVariant: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform regular cart items
    const transformedItems = cartItems.map((item) => {
      // For products with variants, use the cheapest variant price as base price
      const basePrice =
        item.product.variants.length > 0
          ? Number(item.product.variants[0].price)
          : Number(item.product.basePrice || 0);

      const comparePrice =
        item.product.variants.length > 0
          ? item.product.variants[0].comparePrice
            ? Number(item.product.variants[0].comparePrice)
            : null
          : null;

      return {
        id: item.id,
        type: "product" as const,
        productId: item.product.id,
        variantId: null,
        name: item.product.name,
        variantName: null,
        brand: item.product.brand?.name,
        price: basePrice,
        originalPrice: comparePrice,
        image: item.product.images[0] || "",
        category: item.product.category.name,
        quantity: item.quantity,
        stock: item.product.totalStock,
        slug: item.product.slug,
        dateAdded: item.createdAt,
      };
    });

    // Transform variant cart items
    const transformedVariantItems = variantCartItems.map((item) => ({
      id: item.id,
      type: "variant" as const,
      productId: item.productVariant.product.id,
      variantId: item.productVariant.id,
      name: item.productVariant.product.name,
      variantName: item.productVariant.variantName,
      brand: item.productVariant.product.brand?.name,
      price: Number(item.productVariant.price),
      originalPrice: item.productVariant.comparePrice
        ? Number(item.productVariant.comparePrice)
        : null,
      image:
        item.productVariant.thumbnailImage ||
        item.productVariant.images[0] ||
        item.productVariant.product.images[0] ||
        "",
      category: item.productVariant.product.category.name,
      quantity: item.quantity,
      stock: item.productVariant.stock,
      slug: item.productVariant.product.slug,
      dateAdded: item.createdAt,
    }));

    // Combine all items
    const allItems = [...transformedItems, ...transformedVariantItems];

    // Calculate totals
    const subtotal = allItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return NextResponse.json({
      success: true,
      items: allItems,
      count: allItems.length,
      subtotal,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart (updated for variant system)
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

    const { productId, variantId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
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

    // If variantId is provided, add variant to cart
    if (variantId) {
      // Check if variant exists and is active
      const variant = await db.productVariant.findUnique({
        where: { id: variantId },
        include: {
          product: {
            select: { id: true, name: true, isActive: true },
          },
        },
      });

      if (!variant) {
        return NextResponse.json(
          { error: "Product variant not found" },
          { status: 404 }
        );
      }

      if (!variant.isActive || !variant.product.isActive) {
        return NextResponse.json(
          { error: "Product variant is not available" },
          { status: 400 }
        );
      }

      if (variant.stock < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock for this variant" },
          { status: 400 }
        );
      }

      // Check if already in cart
      const existingItem = await db.variantCartItem.findUnique({
        where: {
          userId_productVariantId: {
            userId: user.id,
            productVariantId: variantId,
          },
        },
      });

      let cartItem;

      if (existingItem) {
        // Update quantity if already in cart
        const newQuantity = existingItem.quantity + quantity;

        if (variant.stock < newQuantity) {
          return NextResponse.json(
            { error: "Insufficient stock for requested quantity" },
            { status: 400 }
          );
        }

        cartItem = await db.variantCartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        // Add new variant to cart
        cartItem = await db.variantCartItem.create({
          data: {
            userId: user.id,
            productVariantId: variantId,
            quantity: quantity,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: existingItem
          ? "Cart updated"
          : "Product variant added to cart",
        item: cartItem,
      });
    } else {
      // Handle regular product (for backward compatibility)
      // Check if product exists and is active
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, totalStock: true, isActive: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: "Product is not available" },
          { status: 400 }
        );
      }

      if (product.totalStock < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }

      // Check if already in cart
      const existingItem = await db.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: user.id,
            productId: productId,
          },
        },
      });

      let cartItem;

      if (existingItem) {
        // Update quantity if already in cart
        const newQuantity = existingItem.quantity + quantity;

        if (product.totalStock < newQuantity) {
          return NextResponse.json(
            { error: "Insufficient stock for requested quantity" },
            { status: 400 }
          );
        }

        cartItem = await db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        // Add new item to cart
        cartItem = await db.cartItem.create({
          data: {
            userId: user.id,
            productId: productId,
            quantity: quantity,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: existingItem ? "Cart updated" : "Product added to cart",
        item: cartItem,
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// PATCH /api/cart - Update cart item quantity (updated for variant system)
export async function PATCH(request: NextRequest) {
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

    const { productId, variantId, quantity } = await request.json();

    if ((!productId && !variantId) || quantity < 1) {
      return NextResponse.json(
        { error: "Product/variant ID and valid quantity are required" },
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

    if (variantId) {
      // Update variant cart item
      const variant = await db.productVariant.findUnique({
        where: { id: variantId },
        select: { stock: true },
      });

      if (!variant) {
        return NextResponse.json(
          { error: "Product variant not found" },
          { status: 404 }
        );
      }

      if (variant.stock < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }

      // Update variant cart item
      const cartItem = await db.variantCartItem.update({
        where: {
          userId_productVariantId: {
            userId: user.id,
            productVariantId: variantId,
          },
        },
        data: { quantity },
      });

      return NextResponse.json({
        success: true,
        message: "Cart updated",
        item: cartItem,
      });
    } else {
      // Update regular product cart item
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { totalStock: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      if (product.totalStock < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }

      // Update cart item
      const cartItem = await db.cartItem.update({
        where: {
          userId_productId: {
            userId: user.id,
            productId: productId,
          },
        },
        data: { quantity },
      });

      return NextResponse.json({
        success: true,
        message: "Cart updated",
        item: cartItem,
      });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart (updated for variant system)
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

    const { productId, variantId } = await request.json();

    if (!productId && !variantId) {
      return NextResponse.json(
        { error: "Product ID or variant ID is required" },
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

    if (variantId) {
      // Remove variant from cart
      const deletedItem = await db.variantCartItem.deleteMany({
        where: {
          userId: user.id,
          productVariantId: variantId,
        },
      });

      if (deletedItem.count === 0) {
        return NextResponse.json(
          { error: "Variant not found in cart" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Product variant removed from cart",
      });
    } else {
      // Remove regular product from cart
      const deletedItem = await db.cartItem.deleteMany({
        where: {
          userId: user.id,
          productId: productId,
        },
      });

      if (deletedItem.count === 0) {
        return NextResponse.json(
          { error: "Item not found in cart" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Product removed from cart",
      });
    }
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
