import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  sendEmail,
  getPasswordResetEmailTemplate,
  generateResetCode,
} from "@/lib/email";

// In-memory rate limiting (use Redis in production)
const resetAttempts = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log("🔍 Forgot password request for:", email);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("📧 Searching for user with email:", normalizedEmail);

    // Rate limiting check
    const now = Date.now();
    const userAttempts = resetAttempts.get(normalizedEmail);

    if (userAttempts) {
      const oneHourAgo = now - 60 * 60 * 1000; // 1 hour in milliseconds

      // Reset counter if more than 1 hour has passed
      if (userAttempts.resetTime < oneHourAgo) {
        resetAttempts.set(normalizedEmail, { count: 1, resetTime: now });
      } else {
        // Check if user exceeded 3 attempts
        if (userAttempts.count >= 3) {
          const timeRemaining = Math.ceil(
            (userAttempts.resetTime + 60 * 60 * 1000 - now) / 60000
          );
          return NextResponse.json(
            {
              error: `Too many reset attempts. Please try again in ${timeRemaining} minutes.`,
              rateLimited: true,
            },
            { status: 429 }
          );
        }

        // Increment attempt count
        userAttempts.count += 1;
      }
    } else {
      // First attempt
      resetAttempts.set(normalizedEmail, { count: 1, resetTime: now });
    }

    // Check if user exists in database
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        resetTokenExpiry: true,
      },
    });

    console.log("👤 User found:", user ? "YES" : "NO");

    if (!user) {
      console.log("❌ No user found for email:", normalizedEmail);
      return NextResponse.json(
        {
          error: "No account found with this email address",
          emailExists: false,
        },
        { status: 404 }
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email first before resetting password",
          requiresVerification: true,
        },
        { status: 400 }
      );
    }

    // Check if there's a recent reset request (2-minute cooldown)
    if (user.resetTokenExpiry) {
      const twoMinutesAgo = new Date(now - 2 * 60 * 1000);
      const lastRequestTime = new Date(
        user.resetTokenExpiry.getTime() - 15 * 60 * 1000
      ); // Subtract 15 min to get original request time

      if (lastRequestTime > twoMinutesAgo) {
        const secondsRemaining = Math.ceil(
          (lastRequestTime.getTime() + 2 * 60 * 1000 - now) / 1000
        );
        return NextResponse.json(
          {
            error: `Please wait ${secondsRemaining} seconds before requesting a new code.`,
            cooldown: true,
            waitTime: secondsRemaining,
          },
          { status: 429 }
        );
      }
    }

    // Generate 6-digit reset code
    const resetCode = generateResetCode();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log("🔑 Generating reset code for user:", user.id);

    // Save reset code to database
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetCode,
        resetTokenExpiry,
      },
    });

    console.log("✅ Reset code saved successfully");

    // Send reset code email
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password - TechVault",
        html: getPasswordResetEmailTemplate(user.name || "User", resetCode),
      });

      console.log("✅ Password reset email sent to:", user.email);
    } catch (emailError) {
      console.error("❌ Failed to send reset email:", emailError);

      // Clear the reset token if email fails
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return NextResponse.json(
        { error: "Failed to send reset email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Password reset code sent to your email. Please check your inbox.",
        emailExists: true,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
