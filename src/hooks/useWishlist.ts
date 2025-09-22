import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface WishlistItem {
  id: string;
  productId: string;
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

  const addToWishlist = useCallback(
    async (productId: string) => {
      if (!session?.user) {
        throw new Error("Please sign in to add items to wishlist");
      }

      try {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
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

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!session?.user) {
        throw new Error("Please sign in to manage wishlist");
      }

      try {
        const response = await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
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

  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (isInWishlist(productId)) {
        return await removeFromWishlist(productId);
      } else {
        return await addToWishlist(productId);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
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
    refetch: fetchWishlist,
    count: items.length,
  };
}
