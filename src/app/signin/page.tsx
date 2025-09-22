"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

// -----------------------------
// Loading Component
// -----------------------------
function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
      <motion.div
        className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-600">Loading...</p>
      </motion.div>
    </div>
  );
}

// -----------------------------
// Sign In Form Component
// -----------------------------
function SignInForm() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Redirect authenticated users away from signin page
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/");
    }
  }, [status, session, router]);

  // Show message if redirected from signup or reset password
  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Don't render signin form if user is already authenticated
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

    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false, // Keep this false for custom handling
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        // ADD THIS: Get fresh session to check role
        const response = await fetch("/api/auth/session");
        const sessionData = await response.json();

        if (sessionData?.user?.role === "VENDOR") {
          // Redirect vendors to dashboard
          window.location.href = "/vendor/dashboard";
        } else {
          // Redirect customers to home or callback URL
          const callbackUrl = searchParams.get("callbackUrl") || "/";
          window.location.href = callbackUrl;
        }
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      // Let Google sign-in complete, then check role
      const result = await signIn("google", {
        redirect: false,
      });

      if (result?.ok) {
        // Get session to check role
        const response = await fetch("/api/auth/session");
        const sessionData = await response.json();

        if (sessionData?.user?.role === "VENDOR") {
          window.location.href = "/vendor/dashboard";
        } else {
          const callbackUrl = searchParams.get("callbackUrl") || "/";
          window.location.href = callbackUrl;
        }
      }
    } catch (err) {
      console.error("Google sign in error:", err);
      setError("Google sign in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link href="/" className="inline-block">
            <motion.h1
              className="text-2xl font-bold text-slate-900 mb-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              TechVault
            </motion.h1>
          </Link>
          <motion.div
            className="w-16 h-0.5 bg-slate-900 mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-slate-600">
            Sign in to your account to continue shopping
          </p>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 rounded-xl p-3 mb-6"
            >
              <div className="flex items-center">
                <CheckIcon className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">
                  {successMessage}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Container */}
        <motion.div
          className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="mb-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-3"
              >
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-xs text-red-700 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign In */}
          <motion.button
            onClick={handleGoogleSignIn}
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
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email + Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <motion.label
                htmlFor="email"
                className="block text-xs font-medium text-slate-700 mb-1.5"
                animate={{
                  color: focusedInput === "email" ? "#0f172a" : "#374151",
                  scale: focusedInput === "email" ? 1.02 : 1,
                }}
              >
                Email address
              </motion.label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
                className="w-full px-3 py-2 border border-slate-300/70 placeholder-slate-400 text-sm text-slate-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email address"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <motion.label
                htmlFor="password"
                className="block text-xs font-medium text-slate-700 mb-1.5"
                animate={{
                  color: focusedInput === "password" ? "#0f172a" : "#374151",
                  scale: focusedInput === "password" ? 1.02 : 1,
                }}
              >
                Password
              </motion.label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 pr-10 border border-slate-300/70 placeholder-slate-400 text-sm text-slate-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <motion.button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Remember Me + Forgot Password */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-3.5 w-3.5 text-slate-900 focus:ring-slate-500/20 border-slate-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-xs text-slate-700 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-slate-900 hover:text-slate-700 transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="pt-2"
            >
              <Button
                type="submit"
                variant="default"
                size="md"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading || isGoogleLoading}
                className="bg-slate-900 hover:bg-slate-800 focus:ring-slate-500/20 text-sm font-medium py-2.5 cursor-pointer"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <p className="text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-slate-900 hover:text-slate-700 transition-colors"
            >
              Create one here
            </Link>
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
            {[
              { icon: "lock", text: "Secure Login" },
              { icon: "shield", text: "GDPR Compliant" },
              { icon: "ssl", text: "SSL Protected" },
            ].map((item, index) => (
              <motion.div
                key={item.text}
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.85 + index * 0.05 }}
              >
                {item.icon === "lock" && (
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
                )}
                {item.icon === "shield" && (
                  <svg
                    className="w-3.5 h-3.5 text-emerald-500 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 01.514.143l7 4A1 1 0 0118 7v5c0 3.519-2.614 6.865-7.481 8.824a1 1 0 01-.758 0C4.614 18.865 2 15.519 2 12V7a1 1 0 01.486-.857l7-4A1 1 0 0110 2zm0 2.236L4 7v5c0 2.981 2.178 5.863 6 7.619 3.822-1.756 6-4.638 6-7.619V7l-6-2.764z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {item.icon === "ssl" && (
                  <svg
                    className="w-3.5 h-3.5 text-emerald-500 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18L19 7v4.95c0 4.44-3.07 8.93-7 10.05-3.93-1.12-7-5.61-7-10.05V7l7-3.82z" />
                    <path d="M11 10h2v5h-2zM11 16h2v2h-2z" />
                  </svg>
                )}
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// -----------------------------
// Page Export
// -----------------------------
export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <SignInForm />
    </Suspense>
  );
}
