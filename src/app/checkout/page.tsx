"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CheckIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Types for variant-based system
interface CartItem {
  id: string;
  type: "product" | "variant";
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  brand?: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  category: string;
  quantity: number;
  stock: number;
  slug: string;
  dateAdded: string;
}

interface CartData {
  items: CartItem[];
  count: number;
  subtotal: number;
}

interface SavedPaymentMethod {
  id: string;
  last4Digits: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
  billingName: string;
  isDefault: boolean;
  nickname?: string;
}

// Skeleton loading components
function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {/* Progress Card Skeleton */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="w-full h-1.5 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Main Form Card Skeleton */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            {/* Header */}
            <div>
              <Skeleton className="h-4 w-36 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>

            {/* Email field */}
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-9 w-full" />
            </div>

            {/* Shipping Address header */}
            <div>
              <Skeleton className="h-4 w-28 mb-3" />

              {/* First/Last name grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>

              {/* Address field */}
              <div className="mb-3">
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-9 w-full" />
              </div>

              {/* City/Postal/Country grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Skeleton className="h-3 w-8 mb-1" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-3 w-56" />
            </div>

            {/* Continue button */}
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar skeleton */}
      <div className="lg:col-span-1">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Product items */}
              <div className="space-y-3 mb-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-2.5">
                    <div className="relative">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <Skeleton className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-2 w-2/3" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-4 space-y-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <Skeleton className="w-3 h-3 rounded-full mr-2" />
                    <div className="flex-1">
                      <Skeleton className="h-2 w-20 mb-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Cart data state
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);

  // Payment methods state
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    SavedPaymentMethod[]
  >([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [showAddNewCard, setShowAddNewCard] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Contact
    email: "",
    // Shipping
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Germany",
    // Payment (only for new cards - never stored)
    cardholderName: "",
    // Options
    saveShippingInfo: false,
    savePaymentMethod: false,
    newsletter: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const progressValue = useMemo(() => {
    switch (currentStep) {
      case 1:
        return 33;
      case 2:
        return 66;
      case 3:
        return 100;
      default:
        return 0;
    }
  }, [currentStep]);

  // Fetch cart data with variant support
  const fetchCart = async () => {
    if (!session?.user) {
      setCartData({ items: [], count: 0, subtotal: 0 });
      setCartLoading(false);
      return;
    }

    try {
      setCartLoading(true);
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCartData(data);
        setCartError(null);
      } else {
        const errorData = await response.json();
        setCartError(errorData.error || "Failed to fetch cart");
      }
    } catch (err) {
      setCartError("Failed to fetch cart");
      console.error("Cart fetch error:", err);
    } finally {
      setCartLoading(false);
    }
  };

  // Fetch saved payment methods and user address
  const fetchSavedPaymentMethods = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/payment-methods");
      if (response.ok) {
        const data = await response.json();
        setSavedPaymentMethods(data.paymentMethods || []);

        // Auto-select default payment method
        const defaultMethod = data.paymentMethods?.find(
          (pm: SavedPaymentMethod) => pm.isDefault
        );
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    }
  };

  // Fetch user's saved address
  const fetchUserAddress = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/user/address");
      if (response.ok) {
        const data = await response.json();
        console.log("Address API response:", data); // Debug log

        if (data.success && data.address) {
          setFormData((prev) => ({
            ...prev,
            address: data.address.street || "",
            city: data.address.city || "",
            postalCode:
              data.address.postalCode ||
              data.address.postal_code ||
              data.address.zipCode ||
              "", // Try multiple field names
            country: data.address.country || "Germany",
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch user address:", error);
    }
  };

  // Authentication check
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setAuthError(true);
      const timer = setTimeout(() => {
        router.push(`/signin?callbackUrl=${encodeURIComponent("/checkout")}`);
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (status === "authenticated" && session?.user) {
      setAuthError(false);
      // Pre-fill user data from session
      setFormData((prev) => ({
        ...prev,
        email: session.user.email || "",
        firstName: session.user.name?.split(" ")[0] || "",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
      }));
    }
  }, [status, session, router]);

  // Load cart and payment methods
  useEffect(() => {
    if (status === "authenticated") {
      fetchCart();
      fetchSavedPaymentMethods();
      fetchUserAddress();
    }
  }, [status, session]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, session, router]);

  // Don't render content for vendors
  if (session?.user?.role === "VENDOR") {
    return null;
  }

  // Show loading state with skeleton
  if (status === "loading" || (status === "authenticated" && cartLoading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-4"
        >
          <div className="mb-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <Link
                  href="/cart"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-2 cursor-pointer"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-1" />
                  Back to Cart
                </Link>
                <h1 className="text-lg font-bold text-gray-900">
                  Secure Checkout
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete your purchase safely
                </p>
              </CardContent>
            </Card>
          </div>
          <CheckoutSkeleton />
        </motion.div>
      </div>
    );
  }

  // Show authentication error
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-gray-400" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 mb-1">
                  Authentication Required
                </h1>
                <p className="text-sm text-gray-600 mb-4">
                  You need to be signed in to proceed with checkout.
                </p>
                <div className="space-y-2">
                  <Link
                    href={`/signin?callbackUrl=${encodeURIComponent("/checkout")}`}
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Sign In Now
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show cart error
  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 mb-1">
                  Error Loading Cart
                </h1>
                <p className="text-sm text-gray-600 mb-4">{cartError}</p>
                <div className="space-y-2">
                  <button
                    onClick={fetchCart}
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show empty cart
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 mb-1">
                  Your Cart is Empty
                </h1>
                <p className="text-sm text-gray-600 mb-4">
                  Add some items to your cart before proceeding to checkout.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Start Shopping
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cartData.subtotal;
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const tax = subtotal * 0.19; // 19% VAT
  const total = subtotal + shipping + tax;

  // Input change handler with validation clearing
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Form validation
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }

      if (!formData.firstName.trim()) {
        errors.firstName = "First name is required";
      }

      if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required";
      }

      if (!formData.address.trim()) {
        errors.address = "Address is required";
      }

      if (!formData.city.trim()) {
        errors.city = "City is required";
      }

      if (!formData.postalCode.trim()) {
        errors.postalCode = "Postal code is required";
      }
    }

    if (step === 2) {
      if (!selectedPaymentMethod && !showAddNewCard) {
        errors.payment = "Please select a payment method or add a new card";
      }

      if (showAddNewCard && !formData.cardholderName.trim()) {
        errors.cardholderName = "Cardholder name is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle adding new payment method with Stripe
  const handleAddNewPaymentMethod = async () => {
    setPaymentLoading(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe not loaded");

      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardholderName: formData.cardholderName,
          saveMethod: formData.savePaymentMethod,
          mockCard: true, // For development
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchSavedPaymentMethods(); // Refresh list
        setSelectedPaymentMethod(data.paymentMethod.id);
        setShowAddNewCard(false);
      }
    } catch (error) {
      console.error("Failed to add payment method:", error);
      setFormErrors({
        payment: "Failed to add payment method. Please try again.",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Complete order with variant support
  const handleCompleteOrder = async () => {
    if (!validateStep(currentStep)) return;

    setIsProcessing(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodId: selectedPaymentMethod,
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          billingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          saveShippingInfo: formData.saveShippingInfo,
          cartItems: cartData.items,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment failed");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      setFormErrors({
        payment:
          error instanceof Error
            ? error.message
            : "Payment failed. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Progress Bar Component (same technique as forgot password page)
  const ProgressBar = () => {
    const progress = progressValue;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">
            {currentStep === 1 && "Contact & Shipping"}
            {currentStep === 2 && "Payment Method"}
            {currentStep === 3 && "Review & Confirm"}
          </span>
          <span className="text-xs text-gray-500">Step {currentStep} of 3</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 bg-gray-900 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  // Payment Method Card Component
  const PaymentMethodCard = ({ method }: { method: SavedPaymentMethod }) => {
    const isSelected = selectedPaymentMethod === method.id;

    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setSelectedPaymentMethod(method.id)}
        className={`p-3 border rounded-lg cursor-pointer transition-all ${
          isSelected
            ? "border-gray-900 bg-gray-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              <CreditCardIcon className="w-3 h-3 text-gray-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">
                {method.cardBrand} •••• {method.last4Digits}
              </p>
              <p className="text-xs text-gray-600">
                Expires {method.expiryMonth}/{method.expiryYear}
              </p>
              {method.nickname && (
                <p className="text-xs text-gray-500">{method.nickname}</p>
              )}
            </div>
          </div>
          {isSelected && <CheckIcon className="w-3 h-3 text-gray-900" />}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-4 space-y-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Link
                href="/cart"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-2 cursor-pointer"
              >
                <motion.div
                  whileHover={{ x: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-1" />
                </motion.div>
                Back to Cart
              </Link>
              <h1 className="text-lg font-bold text-gray-900">
                Secure Checkout
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete your purchase safely
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <ProgressBar />
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Shipping Information */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">
                            Contact Information
                          </h3>
                          <p className="text-xs text-gray-600">
                            We&apos;ll use this to send you order updates
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            disabled={!!session?.user?.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className={`w-full px-3 py-2 border text-sm ${
                              formErrors.email
                                ? "border-red-400"
                                : "border-gray-300"
                            } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500/20`}
                            placeholder="your@email.com"
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-xs text-red-600">
                              {formErrors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Shipping Address
                          </h4>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                First Name
                              </label>
                              <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) =>
                                  handleInputChange("firstName", e.target.value)
                                }
                                className={`w-full px-3 py-2 border text-sm ${
                                  formErrors.firstName
                                    ? "border-red-400"
                                    : "border-gray-300"
                                } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500/20`}
                                placeholder="John"
                              />
                              {formErrors.firstName && (
                                <p className="mt-1 text-xs text-red-600">
                                  {formErrors.firstName}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Last Name
                              </label>
                              <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) =>
                                  handleInputChange("lastName", e.target.value)
                                }
                                className={`w-full px-3 py-2 border text-sm ${
                                  formErrors.lastName
                                    ? "border-red-400"
                                    : "border-gray-300"
                                } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500/20`}
                                placeholder="Doe"
                              />
                              {formErrors.lastName && (
                                <p className="mt-1 text-xs text-red-600">
                                  {formErrors.lastName}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              value={formData.address}
                              onChange={(e) =>
                                handleInputChange("address", e.target.value)
                              }
                              className={`w-full px-3 py-2 border text-sm ${
                                formErrors.address
                                  ? "border-red-400"
                                  : "border-gray-300"
                              } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500/20`}
                              placeholder="Hauptstraße 123"
                            />
                            {formErrors.address && (
                              <p className="mt-1 text-xs text-red-600">
                                {formErrors.address}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                City
                              </label>
                              <input
                                type="text"
                                value={formData.city}
                                onChange={(e) =>
                                  handleInputChange("city", e.target.value)
                                }
                                className={`w-full px-3 py-2 border text-sm ${
                                  formErrors.city
                                    ? "border-red-400"
                                    : "border-gray-300"
                                } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500/20`}
                                placeholder="Berlin"
                              />
                              {formErrors.city && (
                                <p className="mt-1 text-xs text-red-600">
                                  {formErrors.city}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Postal Code
                              </label>
                              <input
                                type="text"
                                value={formData.postalCode}
                                onChange={(e) =>
                                  handleInputChange(
                                    "postalCode",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border text-sm ${
                                  formErrors.postalCode
                                    ? "border-red-400"
                                    : "border-gray-300"
                                } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500/20`}
                                placeholder="10115"
                              />
                              {formErrors.postalCode && (
                                <p className="mt-1 text-xs text-red-600">
                                  {formErrors.postalCode}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Country
                              </label>
                              <div className="relative">
                                <select
                                  value={formData.country}
                                  onChange={(e) =>
                                    handleInputChange("country", e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 text-sm rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500/20 appearance-none cursor-pointer"
                                >
                                  <option value="Germany">Germany</option>
                                  <option value="Austria">Austria</option>
                                  <option value="Switzerland">
                                    Switzerland
                                  </option>
                                </select>
                                <ChevronDownIcon className="w-3 h-3 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="saveShipping"
                            checked={formData.saveShippingInfo}
                            onChange={(e) =>
                              handleInputChange(
                                "saveShippingInfo",
                                e.target.checked
                              )
                            }
                            className="h-3 w-3 text-gray-900 focus:ring-gray-500/20 border-gray-300 rounded cursor-pointer"
                          />
                          <label
                            htmlFor="saveShipping"
                            className="text-xs font-medium text-gray-700 cursor-pointer"
                          >
                            Save shipping information for future orders
                          </label>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={handleNextStep}
                          className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-all cursor-pointer"
                        >
                          Continue to Payment
                        </motion.button>
                      </motion.div>
                    )}

                    {/* Step 2: Payment Method */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">
                            Payment Method
                          </h3>
                          <p className="text-xs text-gray-600">
                            Your payment is secured with Stripe tokenization
                          </p>
                        </div>

                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center text-xs">
                            <LockClosedIcon className="w-3 h-3 text-green-600 mr-2" />
                            <span className="font-medium text-green-800">
                              Tokenized Payment - No card data stored
                            </span>
                          </div>
                        </div>

                        {/* Saved Payment Methods */}
                        {savedPaymentMethods.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900">
                              Saved Payment Methods
                            </h4>
                            {savedPaymentMethods.map((method) => (
                              <PaymentMethodCard
                                key={method.id}
                                method={method}
                              />
                            ))}
                          </div>
                        )}

                        {/* Add New Payment Method */}
                        <div className="space-y-3">
                          {!showAddNewCard ? (
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setShowAddNewCard(true)}
                              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center justify-center space-x-2 text-gray-600">
                                <PlusIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Add New Payment Method
                                </span>
                              </div>
                            </motion.button>
                          ) : (
                            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-semibold text-gray-900">
                                  Add New Card
                                </h5>
                                <button
                                  onClick={() => setShowAddNewCard(false)}
                                  className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Cardholder Name
                                </label>
                                <input
                                  type="text"
                                  value={formData.cardholderName}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "cardholderName",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full px-3 py-2 border text-sm ${
                                    formErrors.cardholderName
                                      ? "border-red-400"
                                      : "border-gray-300"
                                  } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500/20`}
                                  placeholder="John Doe"
                                />
                                {formErrors.cardholderName && (
                                  <p className="mt-1 text-xs text-red-600">
                                    {formErrors.cardholderName}
                                  </p>
                                )}
                              </div>

                              {/* Stripe Elements placeholder */}
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center text-xs text-blue-800">
                                  <InformationCircleIcon className="w-3 h-3 mr-2" />
                                  <span>
                                    Stripe Elements integration would be
                                    implemented here for secure card input
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="savePayment"
                                  checked={formData.savePaymentMethod}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "savePaymentMethod",
                                      e.target.checked
                                    )
                                  }
                                  className="h-3 w-3 text-gray-900 focus:ring-gray-500/20 border-gray-300 rounded cursor-pointer"
                                />
                                <label
                                  htmlFor="savePayment"
                                  className="text-xs font-medium text-gray-700 cursor-pointer"
                                >
                                  Save this payment method for future purchases
                                </label>
                              </div>

                              <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={handleAddNewPaymentMethod}
                                disabled={paymentLoading}
                                className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-all disabled:opacity-50 cursor-pointer"
                              >
                                {paymentLoading ? (
                                  <div className="flex items-center justify-center space-x-1">
                                    <Skeleton className="w-2 h-2 rounded-full" />
                                    <Skeleton className="w-2 h-2 rounded-full" />
                                    <Skeleton className="w-2 h-2 rounded-full" />
                                    <span className="ml-2">Adding...</span>
                                  </div>
                                ) : (
                                  "Add Payment Method"
                                )}
                              </motion.button>
                            </div>
                          )}
                        </div>

                        {formErrors.payment && (
                          <p className="text-xs text-red-600">
                            {formErrors.payment}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePreviousStep}
                            className="px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm cursor-pointer"
                          >
                            ← Back
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleNextStep}
                            disabled={!selectedPaymentMethod}
                            className="px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Review Order
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Review & Confirm */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">
                            Review Your Order
                          </h3>
                          <p className="text-xs text-gray-600">
                            Please review your order details before completing
                            your purchase
                          </p>
                        </div>

                        {/* Order Items with Variant Support */}
                        <div className="space-y-3">
                          {cartData?.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200"></div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">
                                    {item.variantName
                                      ? `${item.name} - ${item.variantName}`
                                      : item.name}
                                  </p>
                                  {item.brand && (
                                    <p className="text-xs text-gray-600">
                                      {item.brand}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 text-xs mb-2">
                              Shipping Address
                            </h4>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p className="font-medium text-gray-800 text-xs">
                                {formData.firstName} {formData.lastName}
                              </p>
                              <p className="text-xs">{formData.address}</p>
                              <p className="text-xs">
                                {formData.city}, {formData.postalCode}
                              </p>
                              <p className="text-xs">{formData.country}</p>
                            </div>
                          </div>

                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 text-xs mb-2">
                              Payment Method
                            </h4>
                            <div className="text-xs text-gray-600 space-y-1">
                              {selectedPaymentMethod && (
                                <>
                                  {(() => {
                                    const method = savedPaymentMethods.find(
                                      (pm) => pm.id === selectedPaymentMethod
                                    );
                                    return method ? (
                                      <>
                                        <div className="flex items-center space-x-2">
                                          <CreditCardIcon className="w-3 h-3" />
                                          <span className="text-xs">
                                            {method.cardBrand} ••••{" "}
                                            {method.last4Digits}
                                          </span>
                                        </div>
                                        <p className="font-medium text-gray-800 text-xs">
                                          {method.billingName}
                                        </p>
                                        <p className="text-xs">
                                          Expires {method.expiryMonth}/
                                          {method.expiryYear}
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-xs">
                                        Payment method selected
                                      </p>
                                    );
                                  })()}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {formErrors.payment && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-700">
                              {formErrors.payment}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePreviousStep}
                            className="px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm cursor-pointer"
                          >
                            ← Back
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleCompleteOrder}
                            disabled={isProcessing}
                            className="px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                          >
                            {isProcessing ? (
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  <Skeleton className="w-2 h-2 rounded-full" />
                                  <Skeleton className="w-2 h-2 rounded-full" />
                                  <Skeleton className="w-2 h-2 rounded-full" />
                                </div>
                                <span>Processing...</span>
                              </div>
                            ) : (
                              <span>Complete Order {formatPrice(total)}</span>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="border-0 shadow-sm sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Cart Items with Variant Names */}
                <div className="space-y-3 mb-4">
                  {cartData?.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                          )}
                        </div>
                        <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm leading-tight">
                          {item.variantName
                            ? `${item.name} - ${item.variantName}`
                            : item.name}
                        </p>
                        {item.brand && (
                          <p className="text-xs text-gray-600">{item.brand}</p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600 font-semibold">
                          Free
                        </span>
                      ) : (
                        <span className="text-gray-900">
                          {formatPrice(shipping)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Tax (VAT 19%)</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(tax)}
                    </span>
                  </div>

                  {/* Free Shipping Progress */}
                  {shipping > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-900">
                          {formatPrice(50 - subtotal)} away from free shipping
                        </span>
                        <TruckIcon className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((subtotal / 50) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 text-sm">
                        Total
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-xs text-gray-700">
                    <div className="w-3 h-3 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <ShieldCheckIcon className="w-2 h-2 text-green-600" />
                    </div>
                    <span>Secure SSL checkout</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-700">
                    <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <TruckIcon className="w-2 h-2 text-blue-600" />
                    </div>
                    <span>Free shipping over €50</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-700">
                    <div className="w-3 h-3 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <svg
                        className="w-2 h-2 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span>30-day returns</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
