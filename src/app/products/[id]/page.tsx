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

// Define types based on your database schema
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
  vendorSettings: {
    storeName: string | null;
    businessName: string | null;
  } | null;
}

interface ProductColor {
  id: string;
  color: string;
  image: string;
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
  price: number;
  comparePrice: number | null;
  images: string[];
  brand: Brand | null;
  category: Category;
  subcategory: Subcategory | null;
  vendor: Vendor;
  stock: number;
  lowStockAlert: number;
  isActive: boolean;
  featured: boolean;
  newArrival: boolean;
  modelNumber: string | null;
  warranty: string | null;
  weight: string | null;
  dimensions: string | null;
  storage: string | null;
  length: string | null;
  deliveryDays: number | null;
  tags: string[];
  color: string | null;
  material: string | null;
  views: number;
  sold: number;
  returnable: boolean;
  specifications: Record<string, any>;
  colors: ProductColor[];
  reviews: Review[];
  avgRating: number;
  discountPercentage: number;
  inStock: boolean;
  isNew: boolean;
  reviewCount: number;
  cartCount: number;
  wishlistCount: number;
  createdAt: string;
  updatedAt: string;
}

// Loading skeleton components
function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-3">
            <div className="aspect-square bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="flex space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-slate-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse"></div>
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-slate-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
            <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse"></div>
            <div className="space-y-3 pt-4">
              <div className="h-10 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="h-10 bg-slate-200 rounded-lg animate-pulse"></div>
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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedTab, setSelectedTab] = useState("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Review form state
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Type assertion for user role to fix TypeScript error
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
          // Set first color as default if colors exist
          if (data.product.colors && data.product.colors.length > 0) {
            setSelectedColor(data.product.colors[0].color);
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

  // Redirect vendors to dashboard
  useEffect(() => {
    if (status === "authenticated" && userRole === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, userRole, router]);

  // Handle quantity changes
  const handleQuantityChange = (action: "increase" | "decrease") => {
    if (!product) return;

    if (action === "increase" && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          selectedColor,
        }),
      });

      if (response.ok) {
        console.log(`Added ${quantity} ${product.name} to cart`);
      } else {
        console.error("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setTimeout(() => setIsAddingToCart(false), 800);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!product) return;
    console.log(`Buy now: ${quantity} ${product.name}`);
    router.push(`/checkout?product=${product.id}&quantity=${quantity}`);
  };

  // Handle image magnifier
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageLoaded || !product) return;

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

  // Get current image based on selected color or default
  const getCurrentImage = () => {
    if (!product) return "";

    if (selectedColor) {
      const colorVariant = product.colors.find(
        (c) => c.color === selectedColor
      );
      if (colorVariant) return colorVariant.image;
    }

    return product.images[selectedImage] || product.images[0] || "";
  };

  // Get current images to display (either product images or color variant image)
  const getCurrentImages = () => {
    if (!product) return [];

    if (selectedColor) {
      const colorVariant = product.colors.find(
        (c) => c.color === selectedColor
      );
      if (colorVariant) return [colorVariant.image];
    }

    return product.images;
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
        // Reset form
        setReviewText("");
        setReviewRating(0);

        // Refresh product data to show new review
        const updatedResponse = await fetch(`/api/products/${slug}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          if (updatedData.success && updatedData.product) {
            setProduct(updatedData.product);
          }
        }
      } else {
        console.error("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Parse specifications from JSON
  const getSpecifications = () => {
    if (!product?.specifications) return [];

    try {
      if (typeof product.specifications === "object") {
        return Object.entries(product.specifications).map(([key, value]) => ({
          label: key,
          value: String(value),
        }));
      }
    } catch (error) {
      console.error("Error parsing specifications:", error);
    }

    return [];
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

  // Loading state for session
  if (status === "loading") {
    return <ProductSkeleton />;
  }

  // Don't render content for vendors
  if (userRole === "VENDOR") {
    return null;
  }

  const specifications = getSpecifications();
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
              {product.isNew && (
                <motion.div
                  className="absolute top-3 left-3 bg-slate-900 text-white px-2 py-1 rounded-md text-xs font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  New
                </motion.div>
              )}
              {product.discountPercentage > 0 && (
                <motion.div
                  className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  -{product.discountPercentage}%
                </motion.div>
              )}

              {/* Navigation arrows - only show if there are multiple images and no color is selected */}
              {currentImages.length > 1 && !selectedColor && (
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

            {/* Thumbnail Images - only show if no color is selected */}
            {currentImages.length > 1 && !selectedColor && (
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

            {/* Color Variants - Show color variant images */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  Available Colors:
                </p>
                <div className="flex space-x-3 flex-wrap">
                  {/* Default product option */}
                  <motion.button
                    onClick={() => {
                      setSelectedColor(null);
                      setSelectedImage(0);
                    }}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                      selectedColor === null
                        ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={product.images[0] || "/api/placeholder/80/80"}
                      alt="Default"
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 text-center">
                      Default
                    </div>
                  </motion.button>

                  {/* Color variant options */}
                  {product.colors.map((colorVariant) => (
                    <motion.button
                      key={colorVariant.id}
                      onClick={() => {
                        setSelectedColor(colorVariant.color);
                        setSelectedImage(0);
                      }}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                        selectedColor === colorVariant.color
                          ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Image
                        src={colorVariant.image}
                        alt={colorVariant.color}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 text-center truncate">
                        {colorVariant.color}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            {/* Brand and Name */}
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
            </motion.div>

            {/* Rating and Reviews */}
            {product.reviewCount > 0 && (
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center space-x-1">
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
                  <span className="text-sm font-medium text-slate-900 ml-1">
                    {product.avgRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
              </motion.div>
            )}

            {/* Pricing */}
            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-slate-900">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="text-lg text-slate-500 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Save {product.discountPercentage}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Tax included.{" "}
                {product.deliveryDays &&
                  `Delivery in ${product.deliveryDays} days.`}
              </p>
            </motion.div>

            {/* Stock Status */}
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {product.inStock ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    In stock ({product.stock} available)
                    {product.stock <= product.lowStockAlert && " - Low stock!"}
                  </span>
                </>
              ) : (
                <>
                  <XMarkIcon className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">
                    Out of stock
                  </span>
                </>
              )}
            </motion.div>

            {/* Selected Color Display */}
            {selectedColor && (
              <motion.div
                className="text-sm text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="font-medium">Selected Color: </span>
                <span className="text-slate-900">{selectedColor}</span>
              </motion.div>
            )}

            {/* Description */}
            {product.description && (
              <motion.div
                className="text-sm text-slate-600 leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <p>{product.description}</p>
              </motion.div>
            )}

            {/* Vendor Info */}
            <motion.div
              className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
            >
              <p>
                Sold by:{" "}
                <span className="font-medium">
                  {product.vendor.vendorSettings?.storeName ||
                    product.vendor.vendorSettings?.businessName ||
                    product.vendor.name}
                </span>
              </p>
              <p className="mt-1">
                {product.views.toLocaleString()} views •{" "}
                {product.sold.toLocaleString()} sold
              </p>
            </motion.div>

            {/* Quantity and Add to Cart */}
            {product.inStock && (
              <motion.div
                className="space-y-3 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
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
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <PlusIcon className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={!product.inStock || isAddingToCart}
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
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                        />
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
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2.5 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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

                {/* Buy Now Button */}
                <motion.button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="w-full bg-black text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Buy Now
                </motion.button>
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
                      {product.material && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-slate-900">
                            Material:
                          </span>
                          <span className="text-sm text-slate-600">
                            {product.material}
                          </span>
                        </div>
                      )}
                      {product.storage && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-slate-900">
                            Storage:
                          </span>
                          <span className="text-sm text-slate-600">
                            {product.storage}
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
                  {specifications.length > 0 ? (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                        {specifications.map((spec, index) => (
                          <motion.div
                            key={index}
                            className="border-b border-slate-200 pb-2 last:border-b-0"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <dt className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                              {spec.label}
                            </dt>
                            <dd className="text-sm text-slate-900 mt-1">
                              {spec.value}
                            </dd>
                          </motion.div>
                        ))}
                      </dl>
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

                  {/* Write Review Section - Only for authenticated users */}
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
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                      {session?.user && (
                        <motion.button
                          onClick={() => setSelectedTab("reviews")}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="text-sm font-medium text-slate-900 hover:text-slate-700 cursor-pointer"
                        >
                          Write the first review
                        </motion.button>
                      )}
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
