"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "already-verified" | "waiting"
  >(token ? "loading" : "waiting");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    // Only verify if there's a token
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadyVerified) {
          setStatus("already-verified");
          setMessage(data.message);
        } else {
          setStatus("success");
          setMessage(data.message);

          setTimeout(() => {
            router.push("/signin?verified=true");
          }, 3000);
        }
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again later.");
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage("");

    try {
      const emailToUse = email || prompt("Please enter your email address:");

      if (!emailToUse) {
        setIsResending(false);
        return;
      }

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage("Verification email sent! Please check your inbox.");
      } else {
        setResendMessage(
          data.error || "Failed to resend email. Please try again."
        );
      }
    } catch (error) {
      console.error("Resend error:", error);
      setResendMessage("Something went wrong. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Waiting State - No token provided */}
        {status === "waiting" && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <EnvelopeIcon className="w-20 h-20 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Check Your Email
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              We&apos;ve sent a verification link to your email address. Click
              the link to verify your account.
            </p>

            {email && (
              <p className="text-sm font-medium text-gray-900 mb-6 bg-gray-100 px-4 py-2 rounded-lg">
                {email}
              </p>
            )}

            <div className="space-y-3">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-6 py-2.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Open Gmail
              </a>

              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </button>

              {resendMessage && (
                <p
                  className={`text-xs ${resendMessage.includes("sent") ? "text-green-600" : "text-red-600"}`}
                >
                  {resendMessage}
                </p>
              )}
            </div>

            <div className="mt-6">
              <Link
                href="/signin"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Keep existing Loading, Success, Already Verified, and Error states */}
        {status === "loading" && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Verifying Your Email
            </h1>
            <p className="text-sm text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {/* ... rest of your existing states (success, error, already-verified) ... */}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
