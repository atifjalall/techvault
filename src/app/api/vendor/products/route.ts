/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for creating products
const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  comparePrice: z.number().positive().optional(),
  brandId: z.string().min(1, "Brand is required"),
  modelNumber: z.string().optional(),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  lowStockAlert: z.number().int().min(0).default(10),
  images: z.array(z.string()).min(1, "At least one image is required"),
  specifications: z.record(z.any()).optional(),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  returnable: z.boolean().default(true),
  isActive: z.boolean().default(true),
  warranty: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  storage: z.string().optional(),
  length: z.string().optional(),
  deliveryDays: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  color: z.string().optional(),
  material: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  colors: z
    .array(
      z.object({
        color: z.string(),
        image: z.string(),
      })
    )
    .optional(),
});

// Generate unique slug for products
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.product.findUnique({
      where: { slug: counter === 1 ? slug : `${slug}-${counter}` },
    });

    if (!existing) {
      return counter === 1 ? slug : `${slug}-${counter}`;
    }

    counter++;
  }
}

// POST /api/vendor/products - Create new product
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the current user from the database using email
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the user is actually a vendor
    if (currentUser.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Vendor access required" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Check if brand exists
    const brand = await db.brand.findUnique({
      where: { id: validatedData.brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: "Invalid brand" }, { status: 400 });
    }

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Check if subcategory exists (if provided)
    if (validatedData.subcategoryId) {
      const subcategory = await db.subcategory.findUnique({
        where: { id: validatedData.subcategoryId },
      });

      if (!subcategory || subcategory.categoryId !== validatedData.categoryId) {
        return NextResponse.json(
          { error: "Invalid subcategory for selected category" },
          { status: 400 }
        );
      }
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(validatedData.name);

    // Create the product with the vendorId
    const product = await db.product.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        brandId: validatedData.brandId,
        modelNumber: validatedData.modelNumber,
        price: validatedData.price,
        comparePrice: validatedData.comparePrice,
        stock: validatedData.stock,
        lowStockAlert: validatedData.lowStockAlert,
        images: validatedData.images,
        specifications: validatedData.specifications || {},
        featured: validatedData.featured,
        newArrival: validatedData.newArrival,
        returnable: validatedData.returnable,
        isActive: validatedData.isActive,
        warranty: validatedData.warranty,
        weight: validatedData.weight,
        dimensions: validatedData.dimensions,
        storage: validatedData.storage,
        length: validatedData.length,
        deliveryDays: validatedData.deliveryDays,
        tags: validatedData.tags,
        color: validatedData.color,
        material: validatedData.material,
        categoryId: validatedData.categoryId,
        subcategoryId: validatedData.subcategoryId,
        vendorId: currentUser.id, // Use the fetched user ID
      },
      include: {
        brand: true,
        category: true,
        subcategory: true,
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create colors AFTER product is created (if colors are provided)
    if (validatedData.colors && validatedData.colors.length > 0) {
      await Promise.all(
        validatedData.colors.map((c) =>
          db.productColor.create({
            data: {
              productId: product.id,
              color: c.color,
              image: c.image,
            },
          })
        )
      );
    }

    // Fetch product again including colors
    const productWithColors = await db.product.findUnique({
      where: { id: product.id },
      include: {
        brand: true,
        category: true,
        subcategory: true,
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        colors: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: productWithColors,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error instanceof Error) {
      // Foreign key constraint errors
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            error: "Invalid category, subcategory, brand, or vendor reference",
          },
          { status: 400 }
        );
      }

      // Duplicate slug error (shouldn't happen with our unique slug generation)
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Product with this name already exists" },
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

// GET /api/vendor/products - Get vendor's products
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the current user from the database
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a vendor
    if (currentUser.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Vendor access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {
      vendorId: currentUser.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { modelNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    } else if (status === "lowstock") {
      // For low stock, we'll need to handle this differently
      // We'll filter this after the query since Prisma doesn't support column references in where clauses
    } else if (status === "outofstock") {
      where.stock = 0;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get products with pagination
    let [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
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
          colors: true,
          _count: {
            select: {
              reviews: true,
              cartItems: true,
              orderItems: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder as "asc" | "desc",
        },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    // Handle low stock filtering after query (since Prisma doesn't support column references)
    if (status === "lowstock") {
      products = products.filter(
        (product) => product.stock <= product.lowStockAlert
      );
      // Note: This affects pagination accuracy, but it's a limitation we have to work with
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
