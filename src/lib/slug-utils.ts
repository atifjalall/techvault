// src/lib/slug-utils.ts
import { db } from "@/lib/db";

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate a unique store slug for a vendor
 */
export async function generateUniqueStoreSlug(
  storeName: string,
  vendorId?: string
): Promise<string> {
  const baseSlug = generateSlug(storeName);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.vendorSettings.findFirst({
      where: {
        storeSlug: slug,
        ...(vendorId && { userId: { not: vendorId } }), // Exclude current vendor when updating
      },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Update vendor settings with store slug
 */
export async function updateVendorStoreSlug(
  vendorId: string,
  storeName: string
) {
  try {
    const slug = await generateUniqueStoreSlug(storeName, vendorId);

    // Update or create vendor settings with the new slug
    const vendorSettings = await db.vendorSettings.upsert({
      where: { userId: vendorId },
      update: {
        storeSlug: slug,
        storeName: storeName,
      },
      create: {
        userId: vendorId,
        storeSlug: slug,
        storeName: storeName,
      },
    });

    return vendorSettings;
  } catch (error) {
    console.error("Error updating vendor store slug:", error);
    throw error;
  }
}
