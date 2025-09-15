"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type Step = "email" | "verification" | "password";

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
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

  // Toast notification function
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Timer countdown effect
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStepNumber = (step: Step): number => {
    switch (step) {
      case "email":
        return 1;
      case "verification":
        return 2;
      case "password":
        return 3;
      default:
        return 1;
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

    let color = "bg-red-500";
    if (score >= 3) color = "bg-yellow-500";
    if (score >= 4) color = "bg-green-500";

    return { score, feedback, color };
  };

  const passwordStrength = validatePassword(newPassword);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
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
    if (passwordStrength.score < 3) {
      setError("Password is too weak");
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
          email,
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
              email: email,
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
        body: JSON.stringify({ email }),
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

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step < getStepNumber(currentStep)
                  ? "bg-green-500 text-white"
                  : step === getStepNumber(currentStep)
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {step < getStepNumber(currentStep) ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <div
                className={`w-16 sm:w-24 h-1 mx-2 transition-all duration-300 ${
                  step < getStepNumber(currentStep)
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Email</span>
        <span>Verify</span>
        <span>Password</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">TechVault</h1>
          </Link>
          <div className="w-20 h-1 bg-black mx-auto mb-8"></div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Back Button */}
          <Link
            href="/signin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
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
                className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
              >
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Reset Password
                </h2>
                <p className="text-gray-600 mb-6">
                  Enter your email address and we&apos;ll send you a
                  verification code
                </p>

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
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
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email address"
                      />
                      <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Enter Verification Code
                </h2>
                <p className="text-gray-600 mb-6">
                  We&apos;ve sent a 6-digit code to{" "}
                  <span className="font-medium text-gray-900">{email}</span>
                </p>

                <div className="space-y-6">
                  {/* Code Input Boxes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Verification Code (Test: 111111)
                    </label>
                    <div className="flex justify-center space-x-3 mb-4">
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
                          className={`w-12 h-12 text-center text-lg font-mono font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200 ${
                            codeError
                              ? "border-red-500 bg-red-50 text-red-600"
                              : "border-gray-300 text-gray-900 focus:border-transparent"
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
                      <p className="text-sm text-gray-600">
                        Resend code in{" "}
                        <span className="font-mono font-semibold text-gray-900">
                          {formatTime(timer)}
                        </span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="text-sm font-medium text-black hover:text-gray-700 transition-colors disabled:opacity-50"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Set New Password
                </h2>
                <p className="text-gray-600 mb-6">
                  Create a strong password for your account
                </p>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-semibold text-gray-700 mb-2"
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
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                        placeholder="Enter new password"
                      />
                      <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
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
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${(passwordStrength.score / 5) * 100}%`,
                                }}
                                transition={{ duration: 0.3 }}
                                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              {passwordStrength.score < 3
                                ? "Weak"
                                : passwordStrength.score < 4
                                  ? "Good"
                                  : "Strong"}
                            </span>
                          </div>
                          {passwordStrength.feedback.length > 0 && (
                            <div className="space-y-1">
                              {passwordStrength.feedback.map((item, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center text-xs text-gray-500"
                                >
                                  <XMarkIcon className="h-3 w-3 text-red-500 mr-1" />
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
                      className="block text-sm font-semibold text-gray-700 mb-2"
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
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                        placeholder="Confirm new password"
                      />
                      <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
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
                              className="absolute inset-y-0 right-10 flex items-center"
                            >
                              <CheckIcon className="h-5 w-5 text-green-500" />
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || passwordStrength.score < 3}
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/signin"
              className="font-medium text-black hover:text-gray-700 transition-colors"
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
            <div className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-3 max-w-sm">
              <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
