/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Updated validation schema for variant-based products
const createProductSchema = z.object({
  // Base product info
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  modelNumber: z.string().optional(),

  // Base product images (general product images)
  images: z.array(z.string()).default([]),

  // Product settings
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  returnable: z.boolean().default(true),
  isActive: z.boolean().default(true),

  // Shipping and warranty
  deliveryDays: z.number().int().positive().optional(),
  warranty: z.string().optional(),

  // Physical properties (shared across variants)
  weight: z.string().optional(),
  dimensions: z.string().optional(),

  // SEO
  tags: z.array(z.string()).default([]),

  // Product variants - the actual purchasable items
  variants: z
    .array(
      z.object({
        variantName: z.string().min(1, "Variant name is required"),
        sku: z.string().optional(),

        // Pricing for this variant
        price: z.number().positive("Price must be positive"),
        comparePrice: z.number().positive().optional(),

        // Stock for this variant
        stock: z.number().int().min(0, "Stock must be non-negative"),
        lowStockAlert: z.number().int().min(0).default(10),

        // Variant attributes (flexible based on product type)
        color: z.string().optional(),
        colorHex: z.string().optional(),
        storage: z.string().optional(),
        ram: z.string().optional(),
        size: z.string().optional(),
        length: z.string().optional(),
        material: z.string().optional(),

        // Additional flexible attributes
        attributes: z.record(z.string()).optional(),

        // Variant images
        images: z.array(z.string()).default([]),
        thumbnailImage: z.string().optional(),

        // Status
        isActive: z.boolean().default(true),
      })
    )
    .min(1, "At least one variant is required"),

  // Product specifications with categories
  specifications: z
    .array(
      z.object({
        category: z.string().min(1, "Specification category is required"),
        categoryOrder: z.number().int().min(0).default(0),
        name: z.string().min(1, "Specification name is required"),
        value: z.string().min(1, "Specification value is required"),
        unit: z.string().optional(),
        specOrder: z.number().int().min(0).default(0),
        isHighlight: z.boolean().default(false),
      })
    )
    .default([]),
});

// Generate unique slug for products
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  let slug = baseSlug;
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

// Calculate total stock and base price from variants
function calculateProductMetrics(variants: any[]) {
  const totalStock = variants
    .filter((v) => v.isActive)
    .reduce((sum, variant) => sum + variant.stock, 0);

  const basePrice = Math.min(
    ...variants.filter((v) => v.isActive).map((v) => v.price)
  );

  return { totalStock, basePrice };
}

// POST /api/vendor/products - Create new product with variants and specifications
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

    // Get the current user from the database
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the user is a vendor
    if (currentUser.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Vendor access required" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Validate related entities exist
    const [brand, category, subcategory] = await Promise.all([
      db.brand.findUnique({ where: { id: validatedData.brandId } }),
      db.category.findUnique({ where: { id: validatedData.categoryId } }),
      validatedData.subcategoryId
        ? db.subcategory.findUnique({
            where: { id: validatedData.subcategoryId },
          })
        : null,
    ]);

    if (!brand) {
      return NextResponse.json({ error: "Invalid brand" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (
      validatedData.subcategoryId &&
      (!subcategory || subcategory.categoryId !== validatedData.categoryId)
    ) {
      return NextResponse.json(
        { error: "Invalid subcategory for selected category" },
        { status: 400 }
      );
    }

    // Validate variant pricing
    for (const variant of validatedData.variants) {
      if (variant.comparePrice && variant.comparePrice <= variant.price) {
        return NextResponse.json(
          {
            error: `Compare price must be higher than regular price for variant: ${variant.variantName}`,
          },
          { status: 400 }
        );
      }
    }

    // Check for duplicate SKUs within variants
    const skus = validatedData.variants
      .map((v) => v.sku)
      .filter((sku): sku is string => Boolean(sku && sku.trim())); // Type guard to ensure string[]

    const uniqueSkus = new Set(skus);
    if (skus.length !== uniqueSkus.size) {
      return NextResponse.json(
        { error: "Duplicate SKUs found in variants" },
        { status: 400 }
      );
    }

    // Check if SKUs already exist in database
    if (skus.length > 0) {
      const existingSKUs = await db.productVariant.findMany({
        where: { sku: { in: skus } }, // Now skus is definitely string[]
        select: { sku: true },
      });

      if (existingSKUs.length > 0) {
        return NextResponse.json(
          {
            error: `SKU already exists: ${existingSKUs.map((s) => s.sku).join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(validatedData.name);

    // Calculate product metrics from variants
    const { totalStock, basePrice } = calculateProductMetrics(
      validatedData.variants
    );

    // Create product with variants and specifications in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the main product
      const product = await tx.product.create({
        data: {
          name: validatedData.name,
          slug,
          description: validatedData.description,
          brandId: validatedData.brandId,
          modelNumber: validatedData.modelNumber,
          images: validatedData.images,
          basePrice,
          totalStock,
          featured: validatedData.featured,
          newArrival: validatedData.newArrival,
          returnable: validatedData.returnable,
          isActive: validatedData.isActive,
          deliveryDays: validatedData.deliveryDays,
          warranty: validatedData.warranty,
          weight: validatedData.weight,
          dimensions: validatedData.dimensions,
          tags: validatedData.tags,
          categoryId: validatedData.categoryId,
          subcategoryId: validatedData.subcategoryId,
          vendorId: currentUser.id,
        },
      });

      // Create product variants
      const variantPromises = validatedData.variants.map((variant) =>
        tx.productVariant.create({
          data: {
            productId: product.id,
            variantName: variant.variantName,
            sku: variant.sku || undefined,
            price: variant.price,
            comparePrice: variant.comparePrice,
            stock: variant.stock,
            lowStockAlert: variant.lowStockAlert,
            color: variant.color,
            colorHex: variant.colorHex,
            storage: variant.storage,
            ram: variant.ram,
            size: variant.size,
            length: variant.length,
            material: variant.material,
            attributes: variant.attributes,
            images: variant.images,
            thumbnailImage: variant.thumbnailImage,
            isActive: variant.isActive,
          },
        })
      );

      // Create specifications
      const specPromises = validatedData.specifications.map((spec) =>
        tx.productSpecification.create({
          data: {
            productId: product.id,
            category: spec.category,
            categoryOrder: spec.categoryOrder,
            name: spec.name,
            value: spec.value,
            unit: spec.unit,
            specOrder: spec.specOrder,
            isHighlight: spec.isHighlight,
          },
        })
      );

      // Execute all variant and specification creation
      await Promise.all([...variantPromises, ...specPromises]);

      return product;
    });

    // Fetch the complete product with all relations
    const productWithDetails = await db.product.findUnique({
      where: { id: result.id },
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
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
        specifications: {
          orderBy: [{ categoryOrder: "asc" }, { specOrder: "asc" }],
        },
        _count: {
          select: {
            reviews: true,
            variants: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: productWithDetails,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            error: "Invalid category, subcategory, brand, or vendor reference",
          },
          { status: 400 }
        );
      }

      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Product with this name or SKU already exists" },
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

// GET /api/vendor/products - Get vendor's products with variant information
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
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { modelNumber: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
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

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get products with enhanced information
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
          variants: {
            orderBy: {
              createdAt: "asc",
            },
          },
          specifications: {
            orderBy: [{ categoryOrder: "asc" }, { specOrder: "asc" }],
          },
          _count: {
            select: {
              reviews: true,
              variants: true,
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

    // Apply variant-based filtering
    if (status === "outofstock") {
      products = products.filter((product) => {
        const activeVariants = product.variants.filter((v) => v.isActive);
        return (
          activeVariants.length === 0 ||
          activeVariants.every((v) => v.stock === 0)
        );
      });
    } else if (status === "lowstock") {
      products = products.filter((product) => {
        const activeVariants = product.variants.filter((v) => v.isActive);
        return activeVariants.some((v) => v.stock <= v.lowStockAlert);
      });
    }

    // Add computed stock information
    const enhancedProducts = products.map((product) => {
      const activeVariants = product.variants.filter((v) => v.isActive);

      const stockInfo = {
        totalStock: product.totalStock,
        activeVariants: activeVariants.length,
        totalVariants: product.variants.length,
        hasLowStock: activeVariants.some((v) => v.stock <= v.lowStockAlert),
        hasOutOfStock: activeVariants.some((v) => v.stock === 0),
        priceRange: {
          min: Math.min(...activeVariants.map((v) => Number(v.price))),
          max: Math.max(...activeVariants.map((v) => Number(v.price))),
        },
      };

      return {
        ...product,
        stockInfo,
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      products: enhancedProducts,
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
