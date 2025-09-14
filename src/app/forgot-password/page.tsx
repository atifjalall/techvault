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
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

type Step = "email" | "verification" | "password";

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
  const [passwordError, setPasswordError] = useState("");
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setCurrentStep("verification");
    setTimer(120); // 2 minutes (120 seconds)
    showToastNotification("Verification code sent to your email!");
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) return; // Only allow single digits

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setCodeError(false);

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (code === "111111") {
      setIsLoading(false);
      setCurrentStep("password");
      showToastNotification("Code verified successfully!");
    } else {
      setIsLoading(false);
      setCodeError(true);
      showToastNotification("Invalid code. Please try again.");
      // Clear and reset inputs with animation
      setTimeout(() => {
        setVerificationCode(["", "", "", "", "", ""]);
        setCodeError(false);
        inputRefs.current[0]?.focus();
      }, 1000);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    showToastNotification("Password reset successfully!");

    // Redirect to home after 2 seconds
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setTimer(120); // Reset to 2 minutes
    setVerificationCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    showToastNotification("New verification code sent!");
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
                        title="Enter your email address"
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
                      Verification Code (Try: 111111)
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
                          aria-label={`Verification code digit ${index + 1}`}
                          title={`Enter digit ${index + 1} of verification code`}
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

                  {codeError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <motion.p
                        className="text-sm text-red-600 font-medium flex items-center justify-center"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        Invalid code. Please try again.
                      </motion.p>
                    </motion.div>
                  )}
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
                        title="Enter your new password"
                      />
                      <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
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
                        title="Confirm your new password"
                      />
                      <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <motion.div
                          className="inline-flex items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                          >
                            <XMarkIcon className="w-5 h-5 text-red-500 mr-2" />
                          </motion.div>
                          <p className="text-sm text-red-700 font-medium">
                            {passwordError}
                          </p>
                        </motion.div>
                      </motion.div>
                    </AnimatePresence>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
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
