/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Updated interfaces for the new variant system
interface ProductVariant {
  id: string;
  variantName: string;
  sku: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  lowStockAlert: number;
  inStock: boolean;
  isLowStock: boolean;

  // Variant attributes
  color: string | null;
  colorHex: string | null;
  storage: string | null;
  ram: string | null;
  size: string | null;
  length: string | null;
  material: string | null;
  attributes: any;

  // Images
  images: string[];
  thumbnailImage: string | null;

  discountPercentage: number;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface Vendor {
  id: string;
  name: string;
  storeName: string;
  businessName: string | null;
  logo: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  brand: Brand | null;
  category: Category;
  subcategory: Subcategory | null;
  vendor: Vendor;

  // Computed from variants
  basePrice: number;
  maxPrice: number | null;
  comparePrice: number | null;
  priceRange: string;
  totalStock: number;
  inStock: boolean;

  // Product attributes
  featured: boolean;
  newArrival: boolean;
  returnable: boolean;
  isActive: boolean;

  // Stats
  avgRating: number;
  reviewCount: number;
  wishlistCount: number;
  discountPercentage: number;

  // Product details
  tags: string[];
  modelNumber: string | null;
  views: number;
  sold: number;
  deliveryDays: number | null;
  warranty: string | null;
  weight: string | null;
  dimensions: string | null;

  // Variants and specifications
  variants: ProductVariant[];
  variantCount: number;
  inStockVariantCount: number;

  // Variant options for selection
  variantOptions: {
    colors: string[];
    storage: string[];
    ram: string[];
    sizes: string[];
  };

  // Specifications
  specifications: any[];
  highlightedSpecs: any[];

  // Reviews
  reviews: Review[];
}

// Loading skeleton components
function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex space-x-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-16 h-16 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-3/4" />
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-4 h-4 rounded" />
              ))}
            </div>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.id as string;

  // Component state
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Review form state
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);

  // Type assertion for user role
  const userRole = session?.user?.role as
    | "CUSTOMER"
    | "VENDOR"
    | "ADMIN"
    | undefined;

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Product not found");
          } else {
            setError("Failed to load product");
          }
          return;
        }

        const data = await response.json();

        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleWishlistToggle = async () => {
    if (!session?.user || !product) {
      router.push("/signin");
      return;
    }

    // Require variant selection for products with variants
    if (!selectedVariant && product.variants.length > 0) {
      // Show error message or toast
      alert("Please select a variant before adding to wishlist");
      return;
    }

    try {
      const method = isWishlisted ? "DELETE" : "POST";

      const requestBody: any = {
        productId: product.id,
      };

      // Include variant if selected
      if (selectedVariant) {
        requestBody.productVariantId = selectedVariant.id;
      }

      const response = await fetch("/api/wishlist", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setIsWishlisted(!isWishlisted);

        const action = !isWishlisted ? "added to" : "removed from";
        const itemName = selectedVariant
          ? `${product.name} - ${selectedVariant.variantName}`
          : product.name;

        console.log(`${itemName} ${action} wishlist`);

        // Trigger wishlist update event
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else {
        console.error("Wishlist error:", data.error);

        if (data.error === "Item already in wishlist") {
          setIsWishlisted(true);
        } else if (data.error === "Item not found in wishlist") {
          setIsWishlisted(false);
        }

        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  // Also, update the useEffect that checks wishlist status to be more reliable:

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!session?.user || !product) {
        return;
      }

      try {
        const response = await fetch("/api/wishlist");
        if (response.ok) {
          const data = await response.json();

          // Check if current product/variant combination is in wishlist
          const wishlistItem = data.items?.find((item: any) => {
            if (selectedVariant) {
              // Check for specific variant
              return (
                item.productId === product.id &&
                item.productVariantId === selectedVariant.id
              );
            } else {
              // Check for product without variant
              return item.productId === product.id && !item.productVariantId;
            }
          });

          setIsWishlisted(!!wishlistItem);
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [session?.user?.id, product?.id, selectedVariant?.id]);

  // Redirect vendors to dashboard
  useEffect(() => {
    if (status === "authenticated" && userRole === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, userRole, router]);

  // Handle quantity changes
  const handleQuantityChange = (action: "increase" | "decrease") => {
    if (!selectedVariant) return;

    if (action === "increase" && quantity < selectedVariant.stock) {
      setQuantity(quantity + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Product not found");
          } else {
            setError("Failed to load product");
          }
          return;
        }

        const data = await response.json();

        if (data.success && data.product) {
          setProduct(data.product);

          // NEW: Auto-select variant from URL parameter
          const urlParams = new URLSearchParams(window.location.search);
          const variantId = urlParams.get("variant");

          if (variantId && data.product.variants) {
            // Find the variant that matches the URL parameter
            const targetVariant = data.product.variants.find(
              (v: any) => v.id === variantId
            );

            if (targetVariant) {
              // Auto-select this variant
              setSelectedVariant(targetVariant);
              console.log(
                "Auto-selected variant from wishlist:",
                targetVariant.variantName
              );
            } else {
              // Fallback to first available variant if specified variant not found
              const firstVariant = data.product.variants.find(
                (v: any) => v.inStock
              );
              if (firstVariant) {
                setSelectedVariant(firstVariant);
              }
            }
          } else {
            // Original logic: select first available variant
            const firstVariant = data.product.variants?.find(
              (v: any) => v.inStock
            );
            if (firstVariant) {
              setSelectedVariant(firstVariant);
            }
          }
        } else {
          setError("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!session?.user || !product) {
        return;
      }

      try {
        const response = await fetch("/api/wishlist");
        if (response.ok) {
          const data = await response.json();

          // Check if current product/variant combination is in wishlist
          const wishlistItem = data.items?.find((item: any) => {
            if (selectedVariant) {
              // Check for specific variant
              return (
                item.productId === product.id &&
                item.productVariantId === selectedVariant.id
              );
            } else {
              // Check for product without variant (fallback)
              return item.productId === product.id && !item.productVariantId;
            }
          });

          setIsWishlisted(!!wishlistItem);
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    // Only check wishlist status after both product and selectedVariant are set
    if (product && selectedVariant) {
      checkWishlistStatus();
    }
  }, [session?.user?.id, product?.id, selectedVariant?.id]);

  // OPTIONAL: Clean up URL after variant is selected (removes the ?variant= parameter)
  useEffect(() => {
    if (selectedVariant && window.location.search.includes("variant=")) {
      // Clean up URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("variant");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [selectedVariant]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant || !session?.user) {
      if (!session?.user) {
        router.push("/signin");
        return;
      }
      return;
    }

    setIsAddingToCart(true);

    try {
      const response = await fetch("/api/cart/variant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productVariantId: selectedVariant.id,
          quantity,
        }),
      });

      if (response.ok) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        console.log(`Added ${quantity} ${selectedVariant.variantName} to cart`);
      } else {
        const errorData = await response.json();
        console.error("Failed to add to cart:", errorData.error);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setTimeout(() => setIsAddingToCart(false), 800);
    }
  };

  // Handle image magnifier
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageLoaded) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const magnifierSize = 180;
    const halfSize = magnifierSize / 2;

    let magnifierX = x - halfSize;
    let magnifierY = y - halfSize;

    magnifierX = Math.max(0, Math.min(magnifierX, rect.width - magnifierSize));
    magnifierY = Math.max(0, Math.min(magnifierY, rect.height - magnifierSize));

    setMagnifierPosition({ x: magnifierX, y: magnifierY });

    const backgroundX = -((x / rect.width) * (rect.width * 3)) + halfSize;
    const backgroundY = -((y / rect.height) * (rect.height * 3)) + halfSize;

    const magnifier = document.querySelector(".magnifier") as HTMLElement;
    if (magnifier) {
      magnifier.style.backgroundPosition = `${backgroundX}px ${backgroundY}px`;
    }
  };

  // Get current images to display
  const getCurrentImages = () => {
    if (!product) return [];

    // If variant is selected and has images, use variant images
    if (selectedVariant && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }

    // Otherwise use product images
    return product.images;
  };

  // Get current image
  const getCurrentImage = () => {
    const images = getCurrentImages();
    return images[selectedImage] || images[0] || "";
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!product || !session?.user || reviewRating === 0) return;

    setIsSubmittingReview(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewText.trim() || null,
        }),
      });

      if (response.ok) {
        setReviewText("");
        setReviewRating(0);

        // Refresh product data
        const updatedResponse = await fetch(`/api/products/${slug}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          if (updatedData.success && updatedData.product) {
            setProduct(updatedData.product);
          }
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Loading state
  if (loading) {
    return <ProductSkeleton />;
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-medium text-slate-900 mb-1">
            {error || "Product Not Found"}
          </h1>
          <p className="text-sm text-slate-600 mb-4">
            {error === "Product not found"
              ? "The product you're looking for doesn't exist."
              : "Something went wrong while loading the product."}
          </p>
          <button
            onClick={() => router.push("/products")}
            className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Don't render for vendors
  if (userRole === "VENDOR") {
    return null;
  }

  const currentImages = getCurrentImages();

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <motion.div
              className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative group cursor-crosshair"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => imageLoaded && setShowMagnifier(true)}
              onMouseLeave={() => setShowMagnifier(false)}
            >
              <Image
                src={getCurrentImage()}
                alt={product.name}
                fill
                className="object-cover"
                priority
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
              />

              {/* Magnifier */}
              <AnimatePresence>
                {showMagnifier && (
                  <motion.div
                    className="magnifier absolute pointer-events-none border-2 border-white shadow-xl"
                    style={{
                      width: "180px",
                      height: "180px",
                      left: `${magnifierPosition.x}px`,
                      top: `${magnifierPosition.y}px`,
                      backgroundImage: `url(${getCurrentImage()})`,
                      backgroundSize: "300% 300%",
                      backgroundRepeat: "no-repeat",
                      zIndex: 15,
                      borderRadius: "6px",
                      boxShadow:
                        "0 20px 40px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5)",
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>

              {/* Badges */}
              {product.newArrival && (
                <motion.div
                  className="absolute top-3 left-3 bg-slate-900 text-white px-2 py-1 rounded-md text-xs font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  New
                </motion.div>
              )}
              {selectedVariant && selectedVariant.discountPercentage > 0 && (
                <motion.div
                  className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  -{selectedVariant.discountPercentage}%
                </motion.div>
              )}

              {/* Navigation arrows */}
              {currentImages.length > 1 && (
                <>
                  <motion.button
                    onClick={() =>
                      setSelectedImage(
                        selectedImage > 0
                          ? selectedImage - 1
                          : currentImages.length - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeftIcon className="w-4 h-4 text-slate-700" />
                  </motion.button>
                  <motion.button
                    onClick={() =>
                      setSelectedImage(
                        selectedImage < currentImages.length - 1
                          ? selectedImage + 1
                          : 0
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRightIcon className="w-4 h-4 text-slate-700" />
                  </motion.button>
                </>
              )}
            </motion.div>

            {/* Thumbnail Images */}
            {currentImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {currentImages.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 aspect-square w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                      selectedImage === index
                        ? "border-slate-900"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            {/* Brand, Name, Vendor and Rating */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {product.brand && (
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {product.brand.name}
                </p>
              )}
              <h1 className="text-2xl font-semibold text-slate-900 mt-1 leading-tight">
                {product.name}
              </h1>
              {product.modelNumber && (
                <p className="text-xs text-slate-500 mt-1">
                  Model: {product.modelNumber}
                </p>
              )}

              {/* Rating under model number - Always show even if no reviews */}
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.avgRating || 0)
                          ? "text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600">
                  {product.reviewCount > 0
                    ? `${product.avgRating.toFixed(1)} (${product.reviewCount} reviews)`
                    : "No reviews yet"}
                </span>
              </div>

              {/* Vendor Info */}
              <div className="mt-3">
                <span className="text-sm text-slate-600">Sold by: </span>
                <a
                  href={`/store/${product.vendor.id}`}
                  className="text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {product.vendor.storeName || product.vendor.name}
                </a>
              </div>
            </motion.div>

            {/* Pricing */}
            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-slate-900">
                  {selectedVariant
                    ? formatPrice(selectedVariant.price)
                    : product.maxPrice && product.maxPrice !== product.basePrice
                      ? product.priceRange
                      : formatPrice(product.basePrice)}
                </span>
                {selectedVariant?.comparePrice && (
                  <span className="text-lg text-slate-500 line-through">
                    {formatPrice(selectedVariant.comparePrice)}
                  </span>
                )}
                {selectedVariant && selectedVariant.discountPercentage > 0 && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Save {selectedVariant.discountPercentage}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Tax included.{" "}
                {product.deliveryDays &&
                  `Delivery in ${product.deliveryDays} days.`}
              </p>
            </motion.div>

            {/* Stock Status - Only show when out of stock */}
            {selectedVariant && !selectedVariant.inStock && (
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <XMarkIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">
                  Out of stock
                </span>
              </motion.div>
            )}

            {/* Variant Selection */}
            <motion.div
              className="space-y-4 pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {/* Clean variant images without overlay text */}
              {product.variants.length > 0 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">
                      Available Options:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {product.variants.map((variant) => (
                        <motion.button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(variant);
                            setSelectedImage(0);
                          }}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                            selectedVariant?.id === variant.id
                              ? "border-slate-900 ring-2 ring-slate-900 ring-offset-1"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!variant.inStock}
                        >
                          <Image
                            src={
                              variant.thumbnailImage ||
                              variant.images[0] ||
                              product.images[0] ||
                              "/api/placeholder/80/80"
                            }
                            alt={variant.variantName}
                            fill
                            className={`object-cover ${!variant.inStock ? "grayscale opacity-50" : ""}`}
                            sizes="80px"
                          />

                          {/* Stock indicators only */}
                          {variant.inStock && variant.isLowStock && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                          {!variant.inStock && (
                            <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                              <XMarkIcon className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Color Display */}
                  {selectedVariant?.color && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Color (according to manufacturer):
                      </label>
                      <div className="text-sm text-slate-900 font-medium">
                        {selectedVariant.color}
                      </div>
                    </div>
                  )}

                  {/* Storage Selection */}
                  {selectedVariant?.storage && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Storage capacity:
                      </label>
                      <div className="flex space-x-2">
                        <motion.button className="px-3 py-2 border-2 border-slate-900 bg-slate-900 text-white rounded-lg text-sm font-medium cursor-default">
                          {selectedVariant.storage}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Description */}
            {product.description && (
              <motion.div
                className="text-sm text-slate-600 leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.45 }}
              >
                <p>{product.description}</p>
              </motion.div>
            )}

            {/* Quantity and Add to Cart - Only show when variant is selected */}
            {selectedVariant?.inStock && (
              <motion.div
                className="space-y-3 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.55 }}
              >
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-slate-700">
                    Qty:
                  </label>
                  <div className="flex items-center border border-slate-300 rounded-lg">
                    <motion.button
                      onClick={() => handleQuantityChange("decrease")}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MinusIcon className="w-3 h-3" />
                    </motion.button>
                    <span className="px-3 py-2 text-sm font-medium text-slate-900 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <motion.button
                      onClick={() => handleQuantityChange("increase")}
                      disabled={quantity >= (selectedVariant?.stock || 0)}
                      className="p-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <PlusIcon className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>

                {/* Action Buttons - Only Add to Cart */}
                <div className="flex space-x-3">
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant?.inStock || isAddingToCart}
                    className="flex-1 bg-black text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <AnimatePresence mode="wait">
                      {isAddingToCart ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1 h-1 bg-white rounded-full"
                                animate={{
                                  scale: [1, 1.5, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 0.8,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="content"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center space-x-2"
                        >
                          <ShoppingCartIcon className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <motion.button
                    onClick={handleWishlistToggle}
                    disabled={!selectedVariant && product.variants.length > 0}
                    className={`p-2.5 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors cursor-pointer ${
                      !selectedVariant && product.variants.length > 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={
                      !selectedVariant && product.variants.length > 0
                        ? "Please select a variant first"
                        : isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                    }
                  >
                    {isWishlisted ? (
                      <HeartIconSolid className="w-4 h-4 text-red-500" />
                    ) : (
                      <HeartIcon className="w-4 h-4" />
                    )}
                  </motion.button>

                  <motion.button
                    className="p-2.5 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShareIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Message when no variant selected */}
            {!selectedVariant && product.variants.length > 0 && (
              <motion.div
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.55 }}
              >
                <p className="text-sm text-blue-700 font-medium">
                  Please select a variant to add to cart
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Choose from available options above
                </p>
              </motion.div>
            )}

            {/* Features */}
            <motion.div
              className="grid grid-cols-3 gap-3 py-4 border-t border-slate-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <div className="text-center">
                <TruckIcon className="w-5 h-5 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-medium text-slate-900">
                  Free Shipping
                </p>
                <p className="text-xs text-slate-500">Orders over €50</p>
              </div>
              <div className="text-center">
                <ArrowPathIcon className="w-5 h-5 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-medium text-slate-900">
                  {product.returnable ? "30-Day Returns" : "Non-Returnable"}
                </p>
                <p className="text-xs text-slate-500">
                  {product.returnable ? "Money back guarantee" : "Final sale"}
                </p>
              </div>
              <div className="text-center">
                <ShieldCheckIcon className="w-5 h-5 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-medium text-slate-900">Warranty</p>
                <p className="text-xs text-slate-500">
                  {product.warranty || "1 year coverage"}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6">
              {["description", "specifications", "reviews"].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-3 px-1 border-b-2 text-sm font-medium capitalize transition-colors cursor-pointer ${
                    selectedTab === tab
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab}
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="py-6">
            <AnimatePresence mode="wait">
              {selectedTab === "description" && (
                <motion.div
                  className="max-w-3xl"
                  key="description"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-slate-900 mb-3">
                    Product Description
                  </h3>
                  <div className="prose prose-sm prose-slate max-w-none">
                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {product.description ||
                        "No detailed description available."}
                    </p>

                    {/* Product Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {product.weight && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-slate-900">
                            Weight:
                          </span>
                          <span className="text-sm text-slate-600">
                            {product.weight}
                          </span>
                        </div>
                      )}
                      {product.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-slate-900">
                            Dimensions:
                          </span>
                          <span className="text-sm text-slate-600">
                            {product.dimensions}
                          </span>
                        </div>
                      )}
                      {selectedVariant?.material && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-slate-900">
                            Material:
                          </span>
                          <span className="text-sm text-slate-600">
                            {selectedVariant.material}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {product.tags.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-base font-medium text-slate-900 mb-2">
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {selectedTab === "specifications" && (
                <motion.div
                  className="max-w-3xl"
                  key="specifications"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-slate-900 mb-3">
                    Technical Specifications
                  </h3>

                  {/* Selected Variant Specifications */}
                  {selectedVariant && (
                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                      <h4 className="text-base font-medium text-slate-900 mb-3">
                        Selected Configuration
                      </h4>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                        {selectedVariant.storage && (
                          <motion.div
                            className="border-b border-slate-200 pb-2 last:border-b-0"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <dt className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                              Storage
                            </dt>
                            <dd className="text-sm text-slate-900 mt-1">
                              {selectedVariant.storage}
                            </dd>
                          </motion.div>
                        )}

                        {selectedVariant.ram && (
                          <motion.div
                            className="border-b border-slate-200 pb-2 last:border-b-0"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.05 }}
                          >
                            <dt className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                              RAM
                            </dt>
                            <dd className="text-sm text-slate-900 mt-1">
                              {selectedVariant.ram}
                            </dd>
                          </motion.div>
                        )}

                        {selectedVariant.size && (
                          <motion.div
                            className="border-b border-slate-200 pb-2 last:border-b-0"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                          >
                            <dt className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                              Screen Size
                            </dt>
                            <dd className="text-sm text-slate-900 mt-1">
                              {selectedVariant.size}
                            </dd>
                          </motion.div>
                        )}
                      </dl>
                    </div>
                  )}

                  {/* Product Specifications */}
                  {product.specifications.length > 0 ? (
                    <div className="space-y-6">
                      {product.specifications.map((specGroup, groupIndex) => (
                        <div
                          key={groupIndex}
                          className="bg-slate-50 rounded-lg p-4"
                        >
                          <h4 className="text-base font-medium text-slate-900 mb-3">
                            {specGroup.category}
                          </h4>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            {specGroup.specs.map((spec: any, index: number) => (
                              <motion.div
                                key={index}
                                className="border-b border-slate-200 pb-2 last:border-b-0"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: index * 0.05,
                                }}
                              >
                                <dt className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                                  {spec.name}
                                </dt>
                                <dd className="text-sm text-slate-900 mt-1">
                                  {spec.value}
                                  {spec.unit && ` ${spec.unit}`}
                                </dd>
                              </motion.div>
                            ))}
                          </dl>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-6 text-center">
                      <p className="text-slate-600 text-sm">
                        No specifications available for this product.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === "reviews" && (
                <motion.div
                  className="max-w-4xl"
                  key="reviews"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-slate-900 mb-6">
                    Customer Reviews & Ratings
                  </h3>

                  {/* Review Summary */}
                  <div className="bg-slate-50 rounded-xl p-6 mb-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-slate-900">
                            {product.reviewCount > 0
                              ? product.avgRating.toFixed(1)
                              : "0.0"}
                          </div>
                          <div className="flex justify-center space-x-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIconSolid
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.avgRating)
                                    ? "text-yellow-400"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-slate-600">
                            {product.reviewCount} reviews
                          </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="flex-1 max-w-sm">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = product.reviews.filter(
                              (r) => r.rating === rating
                            ).length;
                            const percentage =
                              product.reviewCount > 0
                                ? (count / product.reviewCount) * 100
                                : 0;
                            return (
                              <div
                                key={rating}
                                className="flex items-center text-sm mb-1"
                              >
                                <span className="text-slate-600 w-8">
                                  {rating}
                                </span>
                                <StarIconSolid className="w-3 h-3 text-yellow-400 mr-2" />
                                <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-slate-500 w-8 text-right">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Write Review Section */}
                  {session?.user && (
                    <motion.div
                      className="bg-white border border-slate-200 rounded-xl p-6 mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="text-base font-medium text-slate-900 mb-4">
                        Write a Review
                      </h4>

                      {/* Rating Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Your Rating
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="focus:outline-none transition-colors duration-150 cursor-pointer"
                            >
                              <StarIconSolid
                                className={`w-6 h-6 ${
                                  star <= reviewRating
                                    ? "text-yellow-400"
                                    : "text-slate-300"
                                } hover:text-yellow-400`}
                              />
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Your Review (Optional)
                        </label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your thoughts about this product..."
                          rows={4}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none text-sm"
                          maxLength={500}
                        />
                        <div className="text-right text-xs text-slate-500 mt-1">
                          {reviewText.length}/500 characters
                        </div>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        onClick={handleSubmitReview}
                        disabled={reviewRating === 0 || isSubmittingReview}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSubmittingReview ? (
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1 h-1 bg-white rounded-full"
                                animate={{
                                  scale: [1, 1.5, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 0.8,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <PaperAirplaneIcon className="w-4 h-4" />
                        )}
                        <span>
                          {isSubmittingReview
                            ? "Submitting..."
                            : "Submit Review"}
                        </span>
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Existing Reviews */}
                  {product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.slice(0, 10).map((review, index) => (
                        <motion.div
                          key={review.id}
                          className="bg-white border border-slate-200 rounded-xl p-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                <span className="text-slate-600 font-medium text-sm">
                                  {(review.user.name || "A")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-slate-900">
                                    {review.user.name || "Anonymous"}
                                  </span>
                                  <div className="flex space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIconSolid
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < review.rating
                                            ? "text-yellow-400"
                                            : "text-slate-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </motion.div>
                      ))}

                      {product.reviews.length > 10 && (
                        <div className="text-center pt-6">
                          <motion.button
                            className="text-sm text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                          >
                            View all {product.reviewCount} reviews →
                          </motion.button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-8 text-center">
                      <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <StarIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="text-base font-medium text-slate-900 mb-2">
                        No reviews yet
                      </h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Be the first to share your thoughts about this product.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

//okk version
