import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
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

    // Get cart items
    const cartItems = await db.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform data
    const transformedItems = cartItems.map((item) => ({
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
      quantity: item.quantity,
      stock: item.product.stock,
      slug: item.product.slug,
      dateAdded: item.createdAt,
    }));

    // Calculate totals
    const subtotal = transformedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return NextResponse.json({
      success: true,
      items: transformedItems,
      count: transformedItems.length,
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

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();

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

    // Check if product exists and is active
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, stock: true, isActive: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: "Product is not available" },
        { status: 400 }
      );
    }

    if (product.stock < quantity) {
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

      if (product.stock < newQuantity) {
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
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// PATCH /api/cart - Update cart item quantity
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity < 1) {
      return NextResponse.json(
        { error: "Product ID and valid quantity are required" },
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

    // Check stock availability
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.stock < quantity) {
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
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
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

    // Remove from cart
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
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
