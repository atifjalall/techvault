/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Import shared types
import {
  Product,
  ProductVariant,
  Brand,
  Category,
  Subcategory,
  Vendor,
  Review,
} from "@/types/product";

// Import our new modular components
import ProductDetailSkeleton from "@/components/product-detail/ProductDetailSkeleton";
import ProductImageGallery from "@/components/product-detail/ProductImageGallery";
import ProductInfoCard from "@/components/product-detail/ProductInfoCard";
import ProductTabsSection from "@/components/product-detail/ProductTabsSection";
import ReviewsSection from "@/components/product-detail/ReviewsSection";

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
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Type assertion for user role
  const userRole = session?.user?.role as
    | "CUSTOMER"
    | "VENDOR"
    | "ADMIN"
    | undefined;

  // Redirect vendors to dashboard
  useEffect(() => {
    if (status === "authenticated" && userRole === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, userRole, router]);

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

          // Auto-select variant from URL parameter or first available
          const urlParams = new URLSearchParams(window.location.search);
          const variantId = urlParams.get("variant");

          if (variantId && data.product.variants) {
            const targetVariant = data.product.variants.find(
              (v: any) => v.id === variantId
            );
            if (targetVariant) {
              setSelectedVariant(targetVariant);
            } else {
              const firstVariant = data.product.variants.find(
                (v: any) => v.inStock
              );
              if (firstVariant) {
                setSelectedVariant(firstVariant);
              }
            }
          } else {
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

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!session?.user || !product) {
        return;
      }

      try {
        const response = await fetch("/api/wishlist");
        if (response.ok) {
          const data = await response.json();

          const wishlistItem = data.items?.find((item: any) => {
            if (selectedVariant) {
              return (
                item.productId === product.id &&
                item.productVariantId === selectedVariant.id
              );
            } else {
              return item.productId === product.id && !item.productVariantId;
            }
          });

          setIsWishlisted(!!wishlistItem);
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    if (product && selectedVariant) {
      checkWishlistStatus();
    }
  }, [session?.user?.id, product?.id, selectedVariant?.id]);

  // Clean up URL after variant is selected
  useEffect(() => {
    if (selectedVariant && window.location.search.includes("variant=")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("variant");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [selectedVariant]);

  // Handle quantity changes
  const handleQuantityChange = (action: "increase" | "decrease") => {
    if (!selectedVariant) return;

    if (action === "increase" && quantity < selectedVariant.stock) {
      setQuantity(quantity + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Handle variant selection
  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedImage(0);
    setQuantity(1);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!session?.user || !product) {
      router.push("/signin");
      return;
    }

    if (!selectedVariant && product.variants.length > 0) {
      alert("Please select a variant before adding to wishlist");
      return;
    }

    try {
      const method = isWishlisted ? "DELETE" : "POST";

      const requestBody: any = {
        productId: product.id,
      };

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

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

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

  // Handle review submission
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!product || !session?.user) return;

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.id,
        rating,
        comment: comment.trim() || null,
      }),
    });

    if (response.ok) {
      // Refresh product data
      const updatedResponse = await fetch(`/api/products/${slug}`);
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        if (updatedData.success && updatedData.product) {
          setProduct(updatedData.product);
        }
      }
    }
  };

  // Get current images to display
  const getCurrentImages = () => {
    if (!product) return [];
    if (selectedVariant && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }
    return product.images;
  };

  // Loading state
  if (loading) {
    return <ProductDetailSkeleton />;
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-lg font-medium text-slate-900 mb-1">
              {error || "Product Not Found"}
            </h1>
            <p className="text-sm text-slate-600 mb-4">
              {error === "Product not found"
                ? "The product you're looking for doesn't exist."
                : "Something went wrong while loading the product."}
            </p>
            <Link
              href="/products"
              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              ← Back to Products
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Don't render for vendors
  if (userRole === "VENDOR") {
    return null;
  }

  const currentImages = getCurrentImages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header with Breadcrumb */}
      <div className="pt-4 lg:pt-8 px-2 lg:px-4 pb-2 lg:pb-4">
        <div className="container mx-auto px-2 lg:px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Breadcrumb>
              <BreadcrumbList className="text-[10px] lg:text-sm">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/"
                      className="cursor-pointer text-[10px] lg:text-sm hover:text-slate-900"
                    >
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-[10px] lg:text-sm" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/products"
                      className="cursor-pointer text-[10px] lg:text-sm hover:text-slate-900"
                    >
                      Products
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-[10px] lg:text-sm" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[10px] lg:text-sm font-medium">
                    {product.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-2 lg:px-4 py-2 lg:py-4 space-y-4 lg:space-y-8"
      >
        {/* Product Section */}
        {/* Product Gallery and Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Image Gallery */}
          <ProductImageGallery
            images={currentImages}
            productName={product.name}
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
            newArrival={product.newArrival}
            discountPercentage={
              selectedVariant?.discountPercentage || product.discountPercentage
            }
          />

          {/* Product Info */}
          <ProductInfoCard
            product={product}
            selectedVariant={selectedVariant}
            onVariantSelect={handleVariantSelect}
            isWishlisted={isWishlisted}
            onWishlistToggle={handleWishlistToggle}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
            isAddingToCart={isAddingToCart}
          />
        </div>

        {/* Product Tabs */}
        {/* Product Details and Reviews */}
        <div className="space-y-3 lg:space-y-6">
          <ProductTabsSection
            product={{
              id: product.id,
              name: product.name,
              description: product.description,
              specifications: product.specifications,
              weight: product.weight,
              dimensions: product.dimensions,
              tags: product.tags,
            }}
            selectedVariant={selectedVariant}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
          />

          {/* Reviews Section - Show when reviews tab is selected */}
          {selectedTab === "reviews" && (
            <ReviewsSection
              productId={product.id}
              reviews={product.reviews}
              avgRating={product.avgRating}
              reviewCount={product.reviewCount}
              onSubmitReview={handleSubmitReview}
            />
          )}
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
