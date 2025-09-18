"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Navbar from "@/components/layout/Navbar";
import { formatPrice } from "@/lib/utils";

// Mock cart data
const cartItems = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    price: 1199.99,
    quantity: 1,
    image: "/api/placeholder/80/80",
  },
  {
    id: 2,
    name: "AirPods Pro 2nd Gen",
    brand: "Apple",
    price: 199.99,
    quantity: 1,
    image: "/api/placeholder/80/80",
  },
];

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState(false);
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
    // Payment
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    // Options
    saveInfo: false,
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

  // Authentication check
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      setAuthError(true);
      // Redirect to sign in with return URL after 3 seconds
      const timer = setTimeout(() => {
        router.push(`/signin?callbackUrl=${encodeURIComponent('/checkout')}`);
      }, 3000);
      
      return () => clearTimeout(timer);
    }

    if (status === "authenticated" && session?.user) {
      setAuthError(false);
      // Pre-fill email from session
      setFormData(prev => ({
        ...prev,
        email: session.user.email || "",
        firstName: session.user.name?.split(' ')[0] || "",
        lastName: session.user.name?.split(' ').slice(1).join(' ') || "",
      }));
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
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
                You need to be signed in to proceed with checkout. We&apos;ll redirect you to sign in shortly.
              </p>
              <div className="space-y-3">
                <Link
                  href={`/signin?callbackUrl=${encodeURIComponent('/checkout')}`}
                  className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-slate-800 transition-all block"
                >
                  Sign In Now
                </Link>
                <Link
                  href="/cart"
                  className="w-full bg-white/60 text-slate-700 py-2.5 px-4 rounded-lg font-medium text-sm border border-slate-200/50 hover:bg-white/80 transition-all block"
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

  // Calculate totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const tax = subtotal * 0.19; // 19% VAT
  const total = subtotal + shipping + tax;

  const formatPriceLocal = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Format card number: 1234 5678 9012 3456
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date: MM/YY
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  // Validate expiry date
  const validateExpiryDate = (expiryDate: string): boolean => {
    if (!expiryDate || !expiryDate.includes('/')) return false;
    
    const [month, year] = expiryDate.split('/');
    if (!month || !year || month.length !== 2 || year.length !== 2) return false;
    
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(`20${year}`, 10);
    
    if (monthNum < 1 || monthNum > 12) return false;
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Check if card is expired
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return false;
    }
    
    return true;
  };

  // Text limits configuration
  const TEXT_LIMITS = {
    email: 100,
    firstName: 30,
    lastName: 30,
    address: 100,
    city: 40,
    postalCode: 10,
    cardNumber: 19, // 16 digits + 3 spaces
    expiryDate: 5, // MM/YY
    cvv: 4,
    cardName: 50,
  };

  // Smart input change handler with validation and limits
  const handleInputChange = (field: string, value: string | boolean) => {
    let processedValue = value;

    if (typeof value === 'string') {
      // Apply text limits
      const limit = TEXT_LIMITS[field as keyof typeof TEXT_LIMITS];
      if (limit && value.length > limit) {
        return; // Don't update if exceeds limit
      }

      // Apply formatting for specific fields
      if (field === 'cardNumber') {
        // Remove all non-digits
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length <= 16) {
          const formatted = formatCardNumber(digitsOnly);
          processedValue = formatted;
        } else {
          return; // Don't update if too long
        }
      }
      
      if (field === 'expiryDate') {
        // Remove all non-digits
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length <= 4) {
          const formatted = formatExpiryDate(digitsOnly);
          processedValue = formatted;
        } else {
          return; // Don't update if too long
        }
      }

      if (field === 'cvv') {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue.length <= 4) {
          processedValue = numericValue;
        } else {
          return; // Don't update if too long
        }
      }

      if (field === 'postalCode') {
        const alphanumeric = value.replace(/[^a-zA-Z0-9]/g, '');
        if (alphanumeric.length <= 10) {
          processedValue = alphanumeric;
        } else {
          return; // Don't update if too long
        }
      }

      if (field === 'firstName' || field === 'lastName' || field === 'cardName') {
        // Allow only letters, spaces, apostrophes, hyphens
        const cleanValue = value.replace(/[^a-zA-Z\s'-]/g, '');
        const limit = field === 'cardName' ? 50 : 30;
        if (cleanValue.length <= limit) {
          processedValue = cleanValue;
        } else {
          return; // Don't update if too long
        }
      }

      if (field === 'email') {
        // Basic email character validation
        const emailValue = value.replace(/[^a-zA-Z0-9@._-]/g, '');
        if (emailValue.length <= 100) {
          processedValue = emailValue;
        } else {
          return; // Don't update if too long
        }
      }

      if (field === 'address') {
        if (value.length <= 100) {
          processedValue = value;
        } else {
          return; // Don't update if too long
        }
      }

      if (field === 'city') {
        // Allow only letters, spaces, apostrophes, hyphens
        const cleanValue = value.replace(/[^a-zA-Z\s'-]/g, '');
        if (cleanValue.length <= 40) {
          processedValue = cleanValue;
        } else {
          return; // Don't update if too long
        }
      }
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
      
      if (!formData.firstName.trim()) {
        errors.firstName = "First name is required";
      } else if (formData.firstName.trim().length < 2) {
        errors.firstName = "First name must be at least 2 characters";
      }
      
      if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required";
      } else if (formData.lastName.trim().length < 2) {
        errors.lastName = "Last name must be at least 2 characters";
      }
      
      if (!formData.address.trim()) {
        errors.address = "Address is required";
      } else if (formData.address.trim().length < 5) {
        errors.address = "Please enter a complete address";
      }
      
      if (!formData.city.trim()) {
        errors.city = "City is required";
      } else if (formData.city.trim().length < 2) {
        errors.city = "City name must be at least 2 characters";
      }
      
      if (!formData.postalCode.trim()) {
        errors.postalCode = "Postal code is required";
      } else if (formData.postalCode.trim().length < 4) {
        errors.postalCode = "Please enter a valid postal code";
      }
    }

    if (step === 2) {
      const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
      
      // Card number validation
      if (!cardNumberDigits) {
        errors.cardNumber = "Card number is required";
      } else if (cardNumberDigits.length < 13 || cardNumberDigits.length > 16) {
        errors.cardNumber = "Please enter a valid card number (13-16 digits)";
      } else if (!/^\d+$/.test(cardNumberDigits)) {
        errors.cardNumber = "Card number must contain only numbers";
      }
      
      // Expiry date validation
      if (!formData.expiryDate) {
        errors.expiryDate = "Expiry date is required";
      } else if (!validateExpiryDate(formData.expiryDate)) {
        if (!formData.expiryDate.includes('/') || formData.expiryDate.length < 5) {
          errors.expiryDate = "Please enter expiry date in MM/YY format";
        } else {
          const [month, year] = formData.expiryDate.split('/');
          const monthNum = parseInt(month, 10);
          if (monthNum < 1 || monthNum > 12) {
            errors.expiryDate = "Please enter a valid month (01-12)";
          } else {
            errors.expiryDate = "This card has expired. Please use a valid card";
          }
        }
      }
      
      // CVV validation
      if (!formData.cvv) {
        errors.cvv = "CVV is required";
      } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
        errors.cvv = "CVV must be 3 or 4 digits";
      } else if (!/^\d+$/.test(formData.cvv)) {
        errors.cvv = "CVV must contain only numbers";
      }
      
      // Cardholder name validation
      if (!formData.cardName.trim()) {
        errors.cardName = "Cardholder name is required";
      } else if (formData.cardName.trim().length < 3) {
        errors.cardName = "Please enter the full name on the card";
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.cardName)) {
        errors.cardName = "Please enter a valid name (letters only)";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    // Redirect to success page
    window.location.href = "/checkout/success";
  };

  // Stable Progress Bar Component (from forgot password page)
  const ProgressBar = () => {
    const stepTitle = useMemo(() => {
      switch (currentStep) {
        case 1: return "Contact & Shipping";
        case 2: return "Payment Details";
        case 3: return "Review & Confirm";
        default: return "Contact & Shipping";
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
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors group text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to cart
          </Link>

          <div className="text-center">
            <Link href="/" className="inline-block">
              <motion.h1
                whileHover={{ scale: 1.02 }}
                className="text-xl font-bold text-slate-900 mb-2"
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
              Complete your purchase safely
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
              {/* Progress Bar */}
              <ProgressBar />

              <AnimatePresence mode="wait">
                {/* Step 1: Information */}
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
                        Well use this to send you order updates
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email Address
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="email"
                        value={formData.email}
                        maxLength={TEXT_LIMITS.email}
                        disabled={!!session?.user?.email} // Disable if pre-filled from session
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData('text').slice(0, TEXT_LIMITS.email);
                          handleInputChange("email", pastedText);
                        }}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`w-full px-3 py-2 border text-xs ${
                          formErrors.email
                            ? "border-red-400/70"
                            : "border-slate-300/70"
                        } placeholder-slate-400 text-slate-900 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                        placeholder="your@email.com"
                      />
                      <AnimatePresence>
                        {formErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-1 text-xs text-red-600"
                          >
                            {formErrors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">
                        Shipping Address
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            First Name
                          </label>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="text"
                            value={formData.firstName}
                            maxLength={TEXT_LIMITS.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            className={`w-full px-3 py-2 border text-xs ${
                              formErrors.firstName
                                ? "border-red-400/70"
                                : "border-slate-300/70"
                            } placeholder-slate-400 text-slate-900 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                            placeholder="John"
                          />
                          <AnimatePresence>
                            {formErrors.firstName && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-600"
                              >
                                {formErrors.firstName}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Last Name
                          </label>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="text"
                            value={formData.lastName}
                            maxLength={TEXT_LIMITS.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            className={`w-full px-3 py-2 border text-xs ${
                              formErrors.lastName
                                ? "border-red-400/70"
                                : "border-slate-300/70"
                            } placeholder-slate-400 text-slate-900 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                            placeholder="Doe"
                          />
                          <AnimatePresence>
                            {formErrors.lastName && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-600"
                              >
                                {formErrors.lastName}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Address
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.01 }}
                          type="text"
                          value={formData.address}
                          maxLength={TEXT_LIMITS.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          className={`w-full px-3 py-2 border text-xs ${
                            formErrors.address
                              ? "border-red-400/70"
                              : "border-slate-300/70"
                          } placeholder-slate-400 text-slate-900 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                          placeholder="Hauptstraße 123"
                        />
                        <AnimatePresence>
                          {formErrors.address && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-1 text-xs text-red-600"
                            >
                              {formErrors.address}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            City
                          </label>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="text"
                            value={formData.city}
                            maxLength={TEXT_LIMITS.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className={`w-full px-3 py-2 border text-xs ${
                              formErrors.city
                                ? "border-red-400/70"
                                : "border-slate-300/70"
                            } placeholder-slate-400 text-slate-900 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                            placeholder="Berlin"
                          />
                          <AnimatePresence>
                            {formErrors.city && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-600"
                              >
                                {formErrors.city}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Postal Code
                          </label>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="text"
                            value={formData.postalCode}
                            maxLength={TEXT_LIMITS.postalCode}
                            onChange={(e) =>
                              handleInputChange("postalCode", e.target.value)
                            }
                            className={`w-full px-3 py-2 border text-xs ${
                              formErrors.postalCode
                                ? "border-red-400/70"
                                : "border-slate-300/70"
                            } placeholder-slate-400 text-slate-900 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                            placeholder="10115"
                          />
                          <AnimatePresence>
                            {formErrors.postalCode && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-600"
                              >
                                {formErrors.postalCode}
                              </motion.p>
                            )}
                          </AnimatePresence>
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
                              className="w-full px-3 py-2 border border-slate-300/70 text-xs text-slate-900 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
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
                      <motion.input
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="checkbox"
                        id="saveInfo"
                        checked={formData.saveInfo}
                        onChange={(e) =>
                          handleInputChange("saveInfo", e.target.checked)
                        }
                        className="h-3 w-3 text-slate-900 focus:ring-slate-500/20 border-slate-300 rounded cursor-pointer"
                      />
                      <label
                        htmlFor="saveInfo"
                        className="text-xs font-medium text-slate-700 cursor-pointer"
                      >
                        Save this information for next time
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

                {/* Step 2: Payment */}
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
                        Payment Information
                      </h3>
                      <p className="text-xs text-slate-600">
                        Your payment is secured with SSL encryption
                      </p>
                    </div>

                    <div className="p-2.5 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 rounded-lg">
                      <div className="flex items-center text-xs">
                        <LockClosedIcon className="w-3 h-3 text-emerald-600 mr-1.5" />
                        <span className="font-medium text-emerald-800">
                          256-bit SSL Encryption
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <motion.input
                          whileFocus={{ scale: 1.01 }}
                          type="text"
                          value={formData.cardNumber}
                          autoComplete="cc-number"
                          onCopy={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 16);
                            if (pastedText) handleInputChange("cardNumber", pastedText);
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          onChange={(e) =>
                            handleInputChange("cardNumber", e.target.value)
                          }
                          className={`w-full px-3 py-2 pl-8 border text-xs ${
                            formErrors.cardNumber
                              ? "border-red-400/70"
                              : "border-slate-300/70"
                          } placeholder-slate-400 text-slate-900 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                          placeholder="1234 5678 9012 3456"
                        />
                        <CreditCardIcon className="w-3 h-3 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                      <AnimatePresence>
                        {formErrors.cardNumber && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-1 text-xs text-red-600"
                          >
                            {formErrors.cardNumber}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Expiry Date
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.01 }}
                          type="text"
                          value={formData.expiryDate}
                          autoComplete="cc-exp"
                          onCopy={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
                            if (pastedText) handleInputChange("expiryDate", pastedText);
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          onChange={(e) =>
                            handleInputChange("expiryDate", e.target.value)
                          }
                          className={`w-full px-3 py-2 border text-xs ${
                            formErrors.expiryDate
                              ? "border-red-400/70"
                              : "border-slate-300/70"
                          } placeholder-slate-400 text-slate-900 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                          placeholder="MM/YY"
                        />
                        <AnimatePresence>
                          {formErrors.expiryDate && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-1 text-xs text-red-600"
                            >
                              {formErrors.expiryDate}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          CVV
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.01 }}
                          type="password"
                          value={formData.cvv}
                          autoComplete="cc-csc"
                          onCopy={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
                            if (pastedText) handleInputChange("cvv", pastedText);
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          onChange={(e) =>
                            handleInputChange("cvv", e.target.value)
                          }
                          className={`w-full px-3 py-2 border text-xs ${
                            formErrors.cvv
                              ? "border-red-400/70"
                              : "border-slate-300/70"
                          } placeholder-slate-400 text-slate-900 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                          placeholder="123"
                        />
                        <AnimatePresence>
                          {formErrors.cvv && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-1 text-xs text-red-600"
                            >
                              {formErrors.cvv}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Cardholder Name
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        value={formData.cardName}
                        maxLength={TEXT_LIMITS.cardName}
                        onChange={(e) =>
                          handleInputChange("cardName", e.target.value)
                        }
                        className={`w-full px-3 py-2 border text-xs ${
                          formErrors.cardName
                            ? "border-red-400/70"
                            : "border-slate-300/70"
                        } placeholder-slate-400 text-slate-900 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                        placeholder="John Doe"
                      />
                      <AnimatePresence>
                        {formErrors.cardName && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-1 text-xs text-red-600"
                          >
                            {formErrors.cardName}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between pt-2">
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
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all shadow-lg text-xs cursor-pointer"
                      >
                        Review Order
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review */}
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
                        Please review your order details
                      </p>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b border-slate-200/50 last:border-b-0"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                            <div>
                              <p className="font-medium text-slate-900 text-xs">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-600">
                                {item.brand}
                              </p>
                              <p className="text-xs text-slate-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping & Payment Summary */}
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
                          <div className="flex items-center space-x-1.5">
                            <CreditCardIcon className="w-3 h-3" />
                            <span className="text-xs">
                              **** **** **** {formData.cardNumber.replace(/\s/g, '').slice(-4)}
                            </span>
                          </div>
                          <p className="font-medium text-slate-800 text-xs">
                            {formData.cardName}
                          </p>
                          <p className="text-xs">Expires {formData.expiryDate}</p>
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
                            <span className="text-white">Processing...</span>
                          </div>
                        ) : (
                          <span className="text-white">Complete Order</span>
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
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2.5">
                      <div className="relative">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                        <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-xs w-3.5 h-3.5 rounded-full flex items-center justify-center font-medium">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-xs leading-tight">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-600">{item.brand}</p>
                      </div>
                      <p className="font-semibold text-slate-900 text-xs">
                        {formatPriceLocal(item.price)}
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
                          {formatPriceLocal(50 - subtotal)} away from free shipping
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

                {/* Trust Indicators */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-xs text-slate-700">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
                      <ShieldCheckIcon className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-xs">Secure Payment</p>
                      <p className="text-xs text-slate-500">SSL encrypted</p>
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

                {/* Security Badge */}
                <div className="mt-3 pt-3 border-t border-slate-200/50">
                  <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
                    <div className="flex items-center space-x-0.5">
                      <LockClosedIcon className="w-2.5 h-2.5" />
                      <span className="text-xs">SSL Secured</span>
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