import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/cart/variant - Add variant to cart
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

    const { productVariantId, quantity = 1 } = await request.json();

    if (!productVariantId) {
      return NextResponse.json(
        { error: "Product variant ID is required" },
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

    // Check if variant exists and is active
    const variant = await db.productVariant.findUnique({
      where: { id: productVariantId },
      include: {
        product: {
          select: { id: true, name: true, isActive: true, deletedAt: true },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Product variant not found" },
        { status: 404 }
      );
    }

    if (
      !variant.isActive ||
      !variant.product.isActive ||
      variant.product.deletedAt
    ) {
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
          productVariantId: productVariantId,
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
          productVariantId: productVariantId,
          quantity: quantity,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: existingItem ? "Cart updated" : "Product variant added to cart",
      item: cartItem,
    });
  } catch (error) {
    console.error("Error adding variant to cart:", error);
    return NextResponse.json(
      { error: "Failed to add variant to cart" },
      { status: 500 }
    );
  }
}

// PATCH /api/cart/variant - Update variant cart item quantity
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

    const { productVariantId, quantity } = await request.json();

    if (!productVariantId || quantity < 1) {
      return NextResponse.json(
        { error: "Product variant ID and valid quantity are required" },
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

    // Check variant stock
    const variant = await db.productVariant.findUnique({
      where: { id: productVariantId },
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
          productVariantId: productVariantId,
        },
      },
      data: { quantity },
    });

    return NextResponse.json({
      success: true,
      message: "Cart updated",
      item: cartItem,
    });
  } catch (error) {
    console.error("Error updating variant cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/variant - Remove variant from cart
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

    const { productVariantId } = await request.json();

    if (!productVariantId) {
      return NextResponse.json(
        { error: "Product variant ID is required" },
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

    // Remove variant from cart
    const deletedItem = await db.variantCartItem.deleteMany({
      where: {
        userId: user.id,
        productVariantId: productVariantId,
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
  } catch (error) {
    console.error("Error removing variant from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
