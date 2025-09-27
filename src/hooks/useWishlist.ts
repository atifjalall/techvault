/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface WishlistItem {
  id: string;
  productId: string;
  productVariantId?: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  stock: number;
  rating?: number;
  reviewCount?: number;
  slug: string;
  dateAdded: string;

  variant?: {
    id: string;
    name: string;
    color?: string;
    storage?: string;
    ram?: string;
    size?: string;
    length?: string;
    material?: string;
  };
}

export function useWishlist() {
  const { data: session } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!session?.user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/wishlist");

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch wishlist");
      }
    } catch (err) {
      setError("Failed to fetch wishlist");
      console.error("Wishlist fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Updated: Add variant support
  const addToWishlist = useCallback(
    async (productId: string, productVariantId?: string) => {
      if (!session?.user) {
        throw new Error("Please sign in to add items to wishlist");
      }

      try {
        const requestBody: any = { productId };
        if (productVariantId) {
          requestBody.productVariantId = productVariantId;
        }

        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (response.ok) {
          await fetchWishlist(); // Refresh the list
          return data;
        } else {
          throw new Error(data.error || "Failed to add to wishlist");
        }
      } catch (err) {
        console.error("Add to wishlist error:", err);
        throw err;
      }
    },
    [session, fetchWishlist]
  );

  // Updated: Add variant support
  const removeFromWishlist = useCallback(
    async (productId: string, productVariantId?: string) => {
      if (!session?.user) {
        throw new Error("Please sign in to manage wishlist");
      }

      try {
        const requestBody: any = { productId };
        if (productVariantId) {
          requestBody.productVariantId = productVariantId;
        }

        const response = await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (response.ok) {
          await fetchWishlist(); // Refresh the list
          return data;
        } else {
          throw new Error(data.error || "Failed to remove from wishlist");
        }
      } catch (err) {
        console.error("Remove from wishlist error:", err);
        throw err;
      }
    },
    [session, fetchWishlist]
  );

  // FIXED: Proper variant-specific checking logic
  const isInWishlist = useCallback(
    (productId: string, productVariantId?: string) => {
      return items.some((item) => {
        if (productVariantId) {
          // Check for EXACT match: same product AND same variant
          return (
            item.productId === productId &&
            item.productVariantId === productVariantId
          );
        } else {
          // Check for product with NO variant (base product)
          return item.productId === productId && !item.productVariantId;
        }
      });
    },
    [items]
  );

  // Updated: Toggle with variant support
  const toggleWishlist = useCallback(
    async (productId: string, productVariantId?: string) => {
      if (isInWishlist(productId, productVariantId)) {
        return await removeFromWishlist(productId, productVariantId);
      } else {
        return await addToWishlist(productId, productVariantId);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  // Helper to check if any variant of a product is in wishlist
  const isProductInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  // Get specific wishlist item for a product/variant combination
  const getWishlistItem = useCallback(
    (productId: string, productVariantId?: string) => {
      return items.find((item) => {
        if (productVariantId) {
          return (
            item.productId === productId &&
            item.productVariantId === productVariantId
          );
        } else {
          return item.productId === productId && !item.productVariantId;
        }
      });
    },
    [items]
  );

  // Fetch wishlist on session change
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Listen for custom wishlist update events
  useEffect(() => {
    const handleWishlistUpdate = () => {
      fetchWishlist();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, [fetchWishlist]);

  return {
    items,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    isProductInWishlist, // Check if any variant of product is in wishlist
    getWishlistItem, // Get specific wishlist item
    refetch: fetchWishlist,
    count: items.length,
  };
}
