import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Updated validation schema with new fields
const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  modelNumber: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  lowStockAlert: z.number().int().min(0).default(10),
  images: z.array(z.string()).default([]),
  specifications: z.record(z.string()).optional(),
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
  colors: z
    .array(
      z.object({
        color: z.string().min(1),
        image: z.string().url(),
      })
    )
    .optional(),
});

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Helper function to ensure unique slug
async function generateUniqueSlug(baseName: string): Promise<string> {
  const slug = generateSlug(baseName);
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

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is a vendor
    if (session.user.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Vendor access required" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

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

    // Create the product with ALL fields
    const product = await db.product.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        brand: validatedData.brand,
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
        vendorId: session.user.id,
      },
      include: {
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
        category: true,
        subcategory: true,
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        colors: true, // This should now work with ProductColor model
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

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is a vendor
    if (session.user.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Vendor access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      vendorId: session.user.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    // Get total count for pagination
    const totalCount = await db.product.count({ where });

    // Get products with correct includes (remove 'colors' and use correct relation name)
    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        colors: true, // This should work with ProductColor model
        _count: {
          select: {
            reviews: true,
            cartItems: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
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
