"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button";

type Step = "email" | "verification" | "password";

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect authenticated users away from forgot password page
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Don't render if user is already authenticated
  if (status === "loading") {
    return <LoadingPage />;
  }

  if (status === "authenticated") {
    return null; // Don't render anything while redirecting
  }

  // Toast notification function
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  };

  // Timer countdown effect

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStepProgress = (step: Step): number => {
    switch (step) {
      case "email":
        return 33;
      case "verification":
        return 66;
      case "password":
        return 100;
      default:
        return 0;
    }
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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

  const passwordStrength = validatePassword(newPassword);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email format
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset code");
      }

      setCurrentStep("verification");
      setTimer(600); // 10 minutes
      showToastNotification("Reset code sent to your email!");

      // Auto-focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) return; // Only allow single digits

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setCodeError(false);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every((digit) => digit) && newCode.join("").length === 6) {
      handleCodeVerification(newCode.join(""));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Prevent non-numeric characters
    if (
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      !/^\d$/.test(e.key)
    ) {
      e.preventDefault();
      return;
    }

    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodeVerification = async (code: string) => {
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid code");
      }

      setCurrentStep("password");
      showToastNotification("Code verified successfully!");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid code");
      setCodeError(true);
      // Clear and reset inputs with animation
      setTimeout(() => {
        setVerificationCode(["", "", "", "", "", ""]);
        setCodeError(false);
        inputRefs.current[0]?.focus();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (!newPassword) {
      setError("Password is required");
      return;
    }

    if (passwordStrength.score < 3) {
      setError("Password is too weak");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode.join(""),
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      console.log("✅ Password reset successful, auto-login:", data.autoLogin);

      if (data.autoLogin && data.user) {
        // Auto-login the user with new password
        showToastNotification("Password reset successfully! Signing you in...");

        // Wait 1 second to show the toast, then sign in
        setTimeout(async () => {
          try {
            const result = await signIn("credentials", {
              email: email.trim(),
              password: newPassword,
              redirect: false,
            });

            if (result?.ok) {
              // Successful login - redirect to home
              window.location.href = "/";
            } else {
              // Fallback to signin page if auto-login fails
              router.push(
                "/signin?message=Password reset successfully! Please sign in with your new password."
              );
            }
          } catch (error) {
            console.error("Auto-login failed:", error);
            // Fallback to signin page
            router.push(
              "/signin?message=Password reset successfully! Please sign in with your new password."
            );
          }
        }, 1500);
      } else {
        // Fallback if auto-login not supported
        showToastNotification("Password reset successfully!");
        setTimeout(() => {
          router.push(
            "/signin?message=Password reset successfully! Please sign in with your new password."
          );
        }, 2000);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setTimer(600); // Reset to 10 minutes
      setVerificationCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      showToastNotification(
        "If an account exists, a new reset code has been sent!"
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to resend code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Linear Progress Bar Component
  const ProgressBar = () => {
    const progress = getStepProgress(currentStep);

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-700">
            {currentStep === "email" && "Enter Email"}
            {currentStep === "verification" && "Verify Code"}
            {currentStep === "password" && "Set New Password"}
          </span>
          <span className="text-xs text-slate-500">
            Step{" "}
            {currentStep === "email"
              ? "1"
              : currentStep === "verification"
                ? "2"
                : "3"}{" "}
            of 3
          </span>
        </div>
        <div className="w-full bg-slate-200/50 rounded-full h-2">
          <div
            className="h-2 bg-gradient-to-r from-slate-900 to-slate-700 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              TechVault
            </h1>
          </Link>
          <motion.div
            className="w-16 h-0.5 bg-slate-900 mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>

        {/* Main Form Container */}
        <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-6">
          {/* Back Button */}
          <Link
            href="/signin"
            className="inline-flex items-center text-xs text-slate-600 hover:text-slate-900 transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 mr-1.5" />
            Back to Sign In
          </Link>

          {/* Error Alert */}
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

          {/* Progress Bar */}
          <ProgressBar />

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  Reset Password
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Enter your email address and we&apos;ll send you a
                  verification code
                </p>

                <form
                  onSubmit={handleEmailSubmit}
                  className="space-y-4"
                  noValidate
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300/70 placeholder-slate-400 text-sm text-slate-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email address"
                      />
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="default"
                      size="md"
                      fullWidth
                      isLoading={isLoading}
                      className="bg-slate-900 hover:bg-slate-800 focus:ring-slate-500/20 text-sm font-medium py-2.5 cursor-pointer"
                    >
                      {isLoading ? "Sending..." : "Send Verification Code"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {currentStep === "verification" && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  Enter Verification Code
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  We&apos;ve sent a 6-digit code to{" "}
                  <span className="font-medium text-slate-900">{email}</span>
                </p>

                <div className="space-y-4">
                  {/* Code Input Boxes */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-3">
                      Verification Code (Test: 111111)
                    </label>
                    <div className="flex justify-center space-x-2 mb-3">
                      {verificationCode.map((digit, index) => (
                        <motion.input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleCodeChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          className={`w-10 h-10 text-center text-sm font-mono font-bold border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all duration-200 ${
                            codeError
                              ? "border-red-400/70 bg-red-50/50 text-red-600"
                              : "border-slate-300/70 text-slate-900 focus:border-transparent"
                          }`}
                          inputMode="numeric"
                          pattern="\d*"
                          placeholder="0"
                          animate={codeError ? { x: [-5, 5, -5, 5, 0] } : {}}
                          transition={{ duration: 0.4 }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Timer/Resend */}
                  <div className="text-center">
                    {timer > 0 ? (
                      <p className="text-xs text-slate-600">
                        Resend code in{" "}
                        <span className="font-mono font-semibold text-slate-900">
                          {formatTime(timer)}
                        </span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="text-xs font-medium text-slate-900 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Resend verification code
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === "password" && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  Set New Password
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Create a strong password for your account
                </p>

                <form
                  onSubmit={handlePasswordSubmit}
                  className="space-y-4"
                  noValidate
                >
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-slate-300/70 placeholder-slate-400 text-sm text-slate-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200"
                        placeholder="Enter new password"
                      />
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    <AnimatePresence>
                      {newPassword && (
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
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-slate-300/70 placeholder-slate-400 text-sm text-slate-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-transparent transition-all duration-200"
                        placeholder="Confirm new password"
                      />
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                      <AnimatePresence>
                        {newPassword &&
                          confirmPassword &&
                          newPassword === confirmPassword && (
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
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="default"
                      size="md"
                      fullWidth
                      isLoading={isLoading}
                      disabled={isLoading || passwordStrength.score < 3}
                      className="bg-slate-900 hover:bg-slate-800 focus:ring-slate-500/20 text-sm font-medium py-2.5 cursor-pointer"
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Remember your password?{" "}
            <Link
              href="/signin"
              className="font-medium text-slate-900 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 max-w-sm">
              <CheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-xs font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
