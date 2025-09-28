"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/userButton";
import { Skeleton } from "@/components/ui/skeleton";

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  submit?: string;
}

// -----------------------------
// Loading Component
// -----------------------------
function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Header Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <Skeleton className="h-8 w-32 mx-auto mb-2" />
          <Skeleton className="h-0.5 w-16 mx-auto mb-6" />
          <Skeleton className="h-6 w-36 mx-auto mb-1" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </motion.div>

        {/* Form Container Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-6"
        >
          {/* Google Sign Up Button Skeleton */}
          <Skeleton className="w-full h-10 rounded-xl mb-4" />

          {/* Divider Skeleton */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <Skeleton className="w-full h-px" />
            </div>
            <div className="relative flex justify-center">
              <Skeleton className="h-4 w-32 bg-white/70" />
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            {/* Name Fields Row */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 gap-3"
            >
              <div>
                <Skeleton className="h-4 w-16 mb-1.5" />
                <Skeleton className="w-full h-10 rounded-xl" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-1.5" />
                <Skeleton className="w-full h-10 rounded-xl" />
              </div>
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Skeleton className="h-4 w-24 mb-1.5" />
              <Skeleton className="w-full h-10 rounded-xl" />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Skeleton className="h-4 w-16 mb-1.5" />
              <Skeleton className="w-full h-10 rounded-xl" />
              {/* Password Strength Indicator */}
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-1.5">
                  <Skeleton className="flex-1 h-1.5 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Skeleton className="h-3 w-3 mr-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-3 w-3 mr-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Skeleton className="h-4 w-28 mb-1.5" />
              <Skeleton className="w-full h-10 rounded-xl" />
            </motion.div>

            {/* Agreements Checkboxes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="space-y-3"
            >
              <div className="flex items-start">
                <Skeleton className="mt-0.5 h-3.5 w-3.5 mr-2.5" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <div className="flex items-start">
                <Skeleton className="mt-0.5 h-3.5 w-3.5 mr-2.5" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </motion.div>

            {/* Sign Up Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="pt-2"
            >
              <Skeleton className="w-full h-10 rounded-xl" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Sign In Link Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center mt-6"
        >
          <Skeleton className="h-4 w-56 mx-auto" />
        </motion.div>

        {/* Trust Indicators Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-center mt-6"
        >
          <div className="flex items-center justify-center space-x-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                className="flex items-center"
              >
                <Skeleton className="w-3.5 h-3.5 mr-1" />
                <Skeleton className="h-3 w-16" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    agreeToMarketing: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Redirect authenticated users away from signup page
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!formData.email || formData.email.length < 5) {
        setEmailAvailable(null);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setEmailAvailable(null);
        return;
      }

      setIsCheckingEmail(true);
      try {
        const response = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email.trim() }),
        });

        const data = await response.json();
        setEmailAvailable(data.available);
      } catch (error) {
        console.error("Email check failed:", error);
        setEmailAvailable(null);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const debounceTimer = setTimeout(checkEmailAvailability, 800);
    return () => clearTimeout(debounceTimer);
  }, [formData.email]);

  // Don't render signup form if user is already authenticated
  if (status === "loading") {
    return <LoadingPage />;
  }

  if (status === "authenticated") {
    return null; // Don't render anything while redirecting
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: "" }));
    }
  };

  const validatePassword = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push("At least 8 characters");

    if (/[A-Z]/.test(password)) score++;
    else feedback.push("One uppercase letter");

    if (/[a-z]/.test(password)) score++;
    else feedback.push("One lowercase letter");

    if (/\d/.test(password)) score++;
    else feedback.push("One number");

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    else feedback.push("One special character");

    let color = "bg-red-400";
    if (score >= 3) color = "bg-amber-400";
    if (score >= 4) color = "bg-emerald-400";

    return { score, feedback, color };
  };

  const passwordStrength = validatePassword(formData.password);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = "First name contains invalid characters";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = "Last name contains invalid characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    } else if (emailAvailable === false) {
      newErrors.email = "This email is already registered";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordStrength.score < 3) {
      newErrors.password = "Password is too weak";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the Terms and Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Step 1: Create the account
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Step 2: Automatically sign in the user
      const signInResult = await signIn("credentials", {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Account was created but signin failed, redirect to signin page
        router.push(
          "/signin?message=Account created successfully! Please sign in."
        );
        return;
      }

      // Step 3: Show success and redirect to homepage
      setSubmitSuccess(true);

      setTimeout(() => {
        router.push("/"); // Redirect to homepage instead of signin
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      console.error("Google sign up error:", err);
      setErrors({
        submit: "Google sign up failed. Please try again.",
      });
      setIsGoogleLoading(false);
    }
  };

  // Success animation
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckIcon className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-semibold text-slate-900 mb-2"
          >
            Account Created!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-slate-600 mb-6"
          >
            Redirecting you to sign in...
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-6 h-6 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin mx-auto"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block cursor-pointer">
            <motion.h1
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-2xl font-bold text-slate-900 mb-2"
            >
              TechVault
            </motion.h1>
          </Link>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-0.5 bg-slate-900 mx-auto mb-6"
          />
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl font-semibold text-slate-900 mb-1"
          >
            Create Account
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm text-slate-600"
          >
            Join thousands of tech enthusiasts
          </motion.p>
        </motion.div>

        {/* Sign Up Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-6"
        >
          {/* Submit Error Alert */}
          <AnimatePresence>
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="mb-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-3"
              >
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-xs text-red-700 font-medium">
                    {errors.submit}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign Up Button */}
          <motion.button
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300/70 rounded-xl text-xs font-medium text-slate-700 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4 cursor-pointer"
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
          >
            <AnimatePresence mode="wait">
              {isGoogleLoading ? (
                <motion.div
                  className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ) : (
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white/70 text-xs text-slate-500 font-medium">
                Or create with email
              </span>
            </div>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >
            {/* Name Fields */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 gap-3"
            >
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  First name
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    errors.firstName
                      ? "border-red-400/70"
                      : "border-slate-300/70"
                  } placeholder-slate-400 text-sm text-slate-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                  placeholder="John"
                />
                <AnimatePresence>
                  {errors.firstName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-xs text-red-600"
                    >
                      {errors.firstName}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Last name
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    errors.lastName
                      ? "border-red-400/70"
                      : "border-slate-300/70"
                  } placeholder-slate-400 text-sm text-slate-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                  placeholder="Doe"
                />
                <AnimatePresence>
                  {errors.lastName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-xs text-red-600"
                    >
                      {errors.lastName}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border ${
                    errors.email
                      ? "border-red-400/70"
                      : emailAvailable === false
                        ? "border-red-400/70"
                        : emailAvailable === true
                          ? "border-emerald-400/70"
                          : "border-slate-300/70"
                  } placeholder-slate-400 text-sm text-slate-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200`}
                  placeholder="john.doe@example.com"
                />

                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <AnimatePresence mode="wait">
                    {isCheckingEmail ? (
                      <motion.div
                        key="checking"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"
                      />
                    ) : emailAvailable === true ? (
                      <motion.div
                        key="available"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <CheckIcon className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                    ) : emailAvailable === false ? (
                      <motion.div
                        key="taken"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <XMarkIcon className="w-4 h-4 text-red-500" />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  onCopy={(e) => {
                    // Prevent copying password content for security
                    e.preventDefault();
                    return false;
                  }}
                  onCut={(e) => {
                    // Prevent cutting password content for security
                    e.preventDefault();
                    return false;
                  }}
                  onPaste={() => {
                    // Allow pasting for better UX with password managers
                    // This is standard practice and improves usability
                  }}
                  onContextMenu={(e) => {
                    // Disable right-click context menu on password field
                    e.preventDefault();
                    return false;
                  }}
                  onDragStart={(e) => {
                    // Prevent dragging password content
                    e.preventDefault();
                    return false;
                  }}
                  onKeyDown={(e) => {
                    // Prevent Ctrl+A (Select All) when password is hidden
                    if (
                      !showPassword &&
                      (e.ctrlKey || e.metaKey) &&
                      e.key === "a"
                    ) {
                      e.preventDefault();
                      return false;
                    }
                  }}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  data-lpignore="true"
                  className={`w-full px-3 py-2 pr-10 border ${
                    errors.password
                      ? "border-red-400/70"
                      : "border-slate-300/70"
                  } placeholder-slate-400 text-sm text-slate-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200 ${
                    showPassword ? "" : "select-none"
                  }`}
                  placeholder="Create a strong password"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  )}
                </motion.button>
              </div>

              {/* Password Strength Indicator */}
              <AnimatePresence>
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <div className="flex-1 bg-slate-200/50 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                          }}
                          transition={{ duration: 0.3 }}
                          className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {passwordStrength.score < 3
                          ? "Weak"
                          : passwordStrength.score < 4
                            ? "Good"
                            : "Strong"}
                      </span>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="space-y-0.5">
                        {passwordStrength.feedback
                          .slice(0, 3)
                          .map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center text-xs text-slate-500"
                            >
                              <XMarkIcon className="h-3 w-3 text-red-400 mr-1 flex-shrink-0" />
                              {item}
                            </motion.div>
                          ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Confirm password
              </label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onCopy={(e) => {
                    // Prevent copying password content for security
                    e.preventDefault();
                    return false;
                  }}
                  onCut={(e) => {
                    // Prevent cutting password content for security
                    e.preventDefault();
                    return false;
                  }}
                  onPaste={() => {
                    // Allow pasting for better UX with password managers
                    // This is standard practice and improves usability
                  }}
                  onContextMenu={(e) => {
                    // Disable right-click context menu on password field
                    e.preventDefault();
                    return false;
                  }}
                  onDragStart={(e) => {
                    // Prevent dragging password content
                    e.preventDefault();
                    return false;
                  }}
                  onKeyDown={(e) => {
                    // Prevent Ctrl+A (Select All) when password is hidden
                    if (
                      !showConfirmPassword &&
                      (e.ctrlKey || e.metaKey) &&
                      e.key === "a"
                    ) {
                      e.preventDefault();
                      return false;
                    }
                  }}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  data-lpignore="true"
                  className={`w-full px-3 py-2 pr-10 border ${
                    errors.confirmPassword
                      ? "border-red-400/70"
                      : "border-slate-300/70"
                  } placeholder-slate-400 text-sm text-slate-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200 ${
                    showConfirmPassword ? "" : "select-none"
                  }`}
                  placeholder="Confirm your password"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  )}
                </motion.button>
                <AnimatePresence>
                  {formData.password &&
                    formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute inset-y-0 right-8 flex items-center"
                      >
                        <CheckIcon className="h-4 w-4 text-emerald-500" />
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Agreements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="space-y-3"
            >
              <div className="flex items-start">
                <motion.input
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-0.5 h-3.5 w-3.5 text-slate-900 focus:ring-slate-500/20 border-slate-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="agreeToTerms"
                  className="ml-2.5 text-xs text-slate-700 leading-4 cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-slate-900 hover:text-slate-700 underline cursor-pointer"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-slate-900 hover:text-slate-700 underline cursor-pointer"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <AnimatePresence>
                {errors.agreeToTerms && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs text-red-600"
                  >
                    {errors.agreeToTerms}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex items-start">
                <motion.input
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  id="agreeToMarketing"
                  name="agreeToMarketing"
                  type="checkbox"
                  checked={formData.agreeToMarketing}
                  onChange={handleInputChange}
                  className="mt-0.5 h-3.5 w-3.5 text-slate-900 focus:ring-slate-500/20 border-slate-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="agreeToMarketing"
                  className="ml-2.5 text-xs text-slate-600 leading-4 cursor-pointer"
                >
                  Send me marketing communications and exclusive deals
                  (optional)
                </label>
              </div>
            </motion.div>

            {/* Sign Up Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="pt-2"
            >
              <Button
                type="submit"
                variant="default"
                size="md"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading || emailAvailable === false}
                className="bg-slate-900 hover:bg-slate-800 focus:ring-slate-500/20 text-sm font-medium py-2.5 cursor-pointer rounded-xl"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-slate-900 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-center mt-6"
        >
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="flex items-center"
            >
              <svg
                className="w-3.5 h-3.5 text-emerald-500 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Secure
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              className="flex items-center"
            >
              <svg
                className="w-3.5 h-3.5 text-emerald-500 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              GDPR Compliant
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="flex items-center"
            >
              <svg
                className="w-3.5 h-3.5 text-emerald-500 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C15.34 16.67 18.66 12.225 18.66 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11.666 6.61a1 1 0 00-1.415-1.42L8.5 6.94 7.25 5.69a1 1 0 00-1.415 1.42L7.086 8.36a1 1 0 001.415 0l3-3z"
                  clipRule="evenodd"
                />
              </svg>
              No Spam
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
