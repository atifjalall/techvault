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
} from "@heroicons/react/24/outline";
import Navbar from "@/components/layout/Navbar";
import { formatPrice } from "@/lib/utils";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Types
interface CartItem {
  id: string;
  productId: string;
  name: string;
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

  // Fetch cart data
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

  // Fetch saved payment methods
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

  // Show loading state
  if (status === "loading" || (status === "authenticated" && cartLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-8 text-center">
              <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-slate-600">Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication error
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-8 text-center max-w-md"
            >
              <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Authentication Required
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                You need to be signed in to proceed with checkout.
              </p>
              <div className="space-y-3">
                <Link
                  href={`/signin?callbackUrl=${encodeURIComponent("/checkout")}`}
                  className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-slate-800 transition-all block cursor-pointer"
                >
                  Sign In Now
                </Link>
                <Link
                  href="/cart"
                  className="w-full bg-white/60 text-slate-700 py-2.5 px-4 rounded-lg font-medium text-sm border border-slate-200/50 hover:bg-white/80 transition-all block cursor-pointer"
                >
                  Back to Cart
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Show cart error
  if (cartError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-8 text-center max-w-md"
            >
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Error Loading Cart
              </h2>
              <p className="text-sm text-slate-600 mb-4">{cartError}</p>
              <div className="space-y-3">
                <button
                  onClick={fetchCart}
                  className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Try Again
                </button>
                <Link
                  href="/cart"
                  className="w-full bg-white/60 text-slate-700 py-2.5 px-4 rounded-lg font-medium text-sm border border-slate-200/50 hover:bg-white/80 transition-all block cursor-pointer"
                >
                  Back to Cart
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-8 text-center max-w-md"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Your Cart is Empty
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Add some items to your cart before proceeding to checkout.
              </p>
              <Link
                href="/products"
                className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-slate-800 transition-all block cursor-pointer"
              >
                Start Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cartData.subtotal;
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const tax = subtotal * 0.19; // 19% VAT
  const total = subtotal + shipping + tax;

  const formatPriceLocal = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Input change handler
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validation
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

      // Create payment method through Stripe Elements
      // This would integrate with Stripe Elements for secure card collection
      // For now, we'll simulate the process

      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardholderName: formData.cardholderName,
          saveMethod: formData.savePaymentMethod,
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

  const handleCompleteOrder = async () => {
    if (!validateStep(currentStep)) return;

    setIsProcessing(true);

    try {
      // Create order with selected payment method
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
          saveShippingInfo: formData.saveShippingInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment failed");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      setFormErrors({ payment: "Payment failed. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  // Progress Bar Component
  const ProgressBar = () => {
    const stepTitle = useMemo(() => {
      switch (currentStep) {
        case 1:
          return "Contact & Shipping";
        case 2:
          return "Payment Method";
        case 3:
          return "Review & Confirm";
        default:
          return "Contact & Shipping";
      }
    }, [currentStep]);

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-700">
            {stepTitle}
          </span>
          <span className="text-xs text-slate-500">
            Step {currentStep} of 3
          </span>
        </div>
        <div className="w-full bg-slate-200/50 rounded-full h-1.5">
          <motion.div
            className="h-1.5 bg-gradient-to-r from-slate-900 to-slate-700 rounded-full transition-all duration-500 ease-in-out"
            initial={{ width: 0 }}
            animate={{ width: `${progressValue}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
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
            ? "border-slate-900 bg-slate-50/50"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-900">
                {method.cardBrand} •••• {method.last4Digits}
              </p>
              <p className="text-xs text-slate-600">
                Expires {method.expiryMonth}/{method.expiryYear}
              </p>
              {method.nickname && (
                <p className="text-xs text-slate-500">{method.nickname}</p>
              )}
            </div>
          </div>
          {isSelected && <CheckIcon className="w-4 h-4 text-slate-900" />}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/cart"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors group text-sm cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to cart
          </Link>

          <div className="text-center">
            <Link href="/" className="inline-block">
              <motion.h1
                whileHover={{ scale: 1.02 }}
                className="text-xl font-bold text-slate-900 mb-2 cursor-pointer"
              >
                TechVault
              </motion.h1>
            </Link>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-0.5 bg-slate-900 mx-auto mb-3"
            />
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Secure Checkout
            </h2>
            <p className="text-sm text-slate-600">
              Complete your purchase safely with tokenized payments
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-6 min-h-[500px]"
            >
              <ProgressBar />

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
                      <h3 className="text-base font-semibold text-slate-900 mb-1">
                        Contact Information
                      </h3>
                      <p className="text-xs text-slate-600">
                        We&apos;ll use this to send you order updates
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled={!!session?.user?.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`w-full px-3 py-2 border text-xs ${
                          formErrors.email
                            ? "border-red-400"
                            : "border-slate-300"
                        } rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-slate-500/20`}
                        placeholder="your@email.com"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-600">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">
                        Shipping Address
                      </h4>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            className={`w-full px-3 py-2 border text-xs ${
                              formErrors.firstName
                                ? "border-red-400"
                                : "border-slate-300"
                            } rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-slate-500/20`}
                            placeholder="John"
                          />
                          {formErrors.firstName && (
                            <p className="mt-1 text-xs text-red-600">
                              {formErrors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            className={`w-full px-3 py-2 border text-xs ${
                              formErrors.lastName
                                ? "border-red-400"
                                : "border-slate-300"
                            } rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-slate-500/20`}
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
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          className={`w-full px-3 py-2 border text-xs ${
                            formErrors.address
                              ? "border-red-400"
                              : "border-slate-300"
                          } rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-slate-500/20`}
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
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className={`w-full px-3 py-2 border text-xs ${
                              formErrors.city
                                ? "border-red-400"
                                : "border-slate-300"
                            } rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-slate-500/20`}
                            placeholder="Berlin"
                          />
                          {formErrors.city && (
                            <p className="mt-1 text-xs text-red-600">
                              {formErrors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={formData.postalCode}
                            onChange={(e) =>
                              handleInputChange("postalCode", e.target.value)
                            }
                            className={`w-full px-3 py-2 border text-xs ${
                              formErrors.postalCode
                                ? "border-red-400"
                                : "border-slate-300"
                            } rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-slate-500/20`}
                            placeholder="10115"
                          />
                          {formErrors.postalCode && (
                            <p className="mt-1 text-xs text-red-600">
                              {formErrors.postalCode}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Country
                          </label>
                          <div className="relative">
                            <select
                              value={formData.country}
                              onChange={(e) =>
                                handleInputChange("country", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-slate-300 text-xs rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-slate-500/20 appearance-none cursor-pointer"
                            >
                              <option value="Germany">Germany</option>
                              <option value="Austria">Austria</option>
                              <option value="Switzerland">Switzerland</option>
                            </select>
                            <ChevronDownIcon className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
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
                        className="h-3 w-3 text-slate-900 focus:ring-slate-500/20 border-slate-300 rounded cursor-pointer"
                      />
                      <label
                        htmlFor="saveShipping"
                        className="text-xs font-medium text-slate-700 cursor-pointer"
                      >
                        Save shipping information for future orders
                      </label>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleNextStep}
                      className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-slate-800 transition-all shadow-lg cursor-pointer mt-4"
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
                      <h3 className="text-base font-semibold text-slate-900 mb-1">
                        Payment Method
                      </h3>
                      <p className="text-xs text-slate-600">
                        Your payment is secured with Stripe tokenization
                      </p>
                    </div>

                    <div className="p-2.5 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 rounded-lg">
                      <div className="flex items-center text-xs">
                        <LockClosedIcon className="w-3 h-3 text-emerald-600 mr-1.5" />
                        <span className="font-medium text-emerald-800">
                          Tokenized Payment - No card data stored
                        </span>
                      </div>
                    </div>

                    {/* Saved Payment Methods */}
                    {savedPaymentMethods.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">
                          Saved Payment Methods
                        </h4>
                        {savedPaymentMethods.map((method) => (
                          <PaymentMethodCard key={method.id} method={method} />
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
                          className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-center space-x-2 text-slate-600">
                            <PlusIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Add New Payment Method
                            </span>
                          </div>
                        </motion.button>
                      ) : (
                        <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-semibold text-slate-900">
                              Add New Card
                            </h5>
                            <button
                              onClick={() => setShowAddNewCard(false)}
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                              className={`w-full px-3 py-2 border text-xs ${
                                formErrors.cardholderName
                                  ? "border-red-400"
                                  : "border-slate-300"
                              } rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-slate-500/20`}
                              placeholder="John Doe"
                            />
                            {formErrors.cardholderName && (
                              <p className="mt-1 text-xs text-red-600">
                                {formErrors.cardholderName}
                              </p>
                            )}
                          </div>

                          {/* Stripe Elements would go here */}
                          <div className="p-3 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                            <div className="flex items-center text-xs text-blue-800">
                              <InformationCircleIcon className="w-3 h-3 mr-1.5" />
                              <span>
                                Stripe Elements integration would be implemented
                                here for secure card input
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
                              className="h-3 w-3 text-slate-900 focus:ring-slate-500/20 border-slate-300 rounded cursor-pointer"
                            />
                            <label
                              htmlFor="savePayment"
                              className="text-xs font-medium text-slate-700 cursor-pointer"
                            >
                              Save this payment method for future purchases
                            </label>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleAddNewPaymentMethod}
                            disabled={paymentLoading}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {paymentLoading
                              ? "Adding..."
                              : "Add Payment Method"}
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
                        className="px-3 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors text-xs cursor-pointer"
                      >
                        ← Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleNextStep}
                        disabled={!selectedPaymentMethod}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all shadow-lg text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <h3 className="text-base font-semibold text-slate-900 mb-1">
                        Review Your Order
                      </h3>
                      <p className="text-xs text-slate-600">
                        Please review your order details before completing your
                        purchase
                      </p>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {cartData?.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b border-slate-200/50 last:border-b-0"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-200"></div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 text-xs">
                                {item.name}
                              </p>
                              {item.brand && (
                                <p className="text-xs text-slate-600">
                                  {item.brand}
                                </p>
                              )}
                              <p className="text-xs text-slate-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-50/50 backdrop-blur-sm border border-slate-200/50 rounded-lg p-2.5">
                        <h4 className="font-medium text-slate-900 text-xs mb-2">
                          Shipping Address
                        </h4>
                        <div className="text-xs text-slate-600 space-y-0.5">
                          <p className="font-medium text-slate-800 text-xs">
                            {formData.firstName} {formData.lastName}
                          </p>
                          <p className="text-xs">{formData.address}</p>
                          <p className="text-xs">
                            {formData.city}, {formData.postalCode}
                          </p>
                          <p className="text-xs">{formData.country}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 backdrop-blur-sm border border-slate-200/50 rounded-lg p-2.5">
                        <h4 className="font-medium text-slate-900 text-xs mb-2">
                          Payment Method
                        </h4>
                        <div className="text-xs text-slate-600 space-y-0.5">
                          {selectedPaymentMethod && (
                            <>
                              {(() => {
                                const method = savedPaymentMethods.find(
                                  (pm) => pm.id === selectedPaymentMethod
                                );
                                return method ? (
                                  <>
                                    <div className="flex items-center space-x-1.5">
                                      <CreditCardIcon className="w-3 h-3" />
                                      <span className="text-xs">
                                        {method.cardBrand} ••••{" "}
                                        {method.last4Digits}
                                      </span>
                                    </div>
                                    <p className="font-medium text-slate-800 text-xs">
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

                    <div className="flex items-center justify-between pt-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePreviousStep}
                        className="px-3 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors text-xs cursor-pointer"
                      >
                        ← Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleCompleteOrder}
                        disabled={isProcessing}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs cursor-pointer"
                      >
                        {isProcessing ? (
                          <div className="flex items-center space-x-1.5">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <span>Complete Order {formatPriceLocal(total)}</span>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-4 min-h-[500px]"
              >
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                  Order Summary
                </h3>

                {/* Cart Items */}
                <div className="space-y-3 mb-4">
                  {cartData?.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-2.5"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200"></div>
                          )}
                        </div>
                        <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-xs w-3.5 h-3.5 rounded-full flex items-center justify-center font-medium">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-xs leading-tight">
                          {item.name}
                        </p>
                        {item.brand && (
                          <p className="text-xs text-slate-600">{item.brand}</p>
                        )}
                      </div>
                      <p className="font-semibold text-slate-900 text-xs">
                        {formatPriceLocal(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2 border-t border-slate-200/50 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium text-slate-900">
                      {formatPriceLocal(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-semibold">
                          Free
                        </span>
                      ) : (
                        <span className="text-slate-900">
                          {formatPriceLocal(shipping)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Tax (VAT 19%)</span>
                    <span className="font-medium text-slate-900">
                      {formatPriceLocal(tax)}
                    </span>
                  </div>

                  {/* Free Shipping Progress */}
                  {shipping > 0 && (
                    <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-lg p-2.5 my-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-blue-900">
                          {formatPriceLocal(50 - subtotal)} away from free
                          shipping
                        </span>
                        <TruckIcon className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="w-full bg-blue-200/50 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((subtotal / 50) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-200/50 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900 text-sm">
                        Total
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {formatPriceLocal(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-xs text-slate-700">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
                      <ShieldCheckIcon className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-xs">Tokenized Payment</p>
                      <p className="text-xs text-slate-500">
                        No card data stored
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-slate-700">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <TruckIcon className="w-2.5 h-2.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-xs">Fast Delivery</p>
                      <p className="text-xs text-slate-500">Free over €50</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-slate-700">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <InformationCircleIcon className="w-2.5 h-2.5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-xs">Easy Returns</p>
                      <p className="text-xs text-slate-500">30-day policy</p>
                    </div>
                  </div>
                </div>

                {/* Legal Compliance Badges */}
                <div className="mt-3 pt-3 border-t border-slate-200/50">
                  <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
                    <div className="flex items-center space-x-0.5">
                      <LockClosedIcon className="w-2.5 h-2.5" />
                      <span className="text-xs">PCI Compliant</span>
                    </div>
                    <div className="w-0.5 h-0.5 bg-slate-300 rounded-full"></div>
                    <div className="flex items-center space-x-0.5">
                      <ShieldCheckIcon className="w-2.5 h-2.5" />
                      <span className="text-xs">GDPR Compliant</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
