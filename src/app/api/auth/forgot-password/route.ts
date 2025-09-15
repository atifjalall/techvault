import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    // Check if user exists in database
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true },
    });

    console.log("👤 User found:", user ? "YES" : "NO");
    if (user) {
      console.log("✅ User details:", {
        id: user.id,
        email: user.email,
        name: user.name,
      });
    }

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

    // Generate reset token for existing user
    const resetToken = "111111";
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("🔑 Generating reset token for user:", user.id);

    // Save reset token to database
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    console.log("✅ Reset token saved successfully");

    return NextResponse.json(
      {
        message: "Password reset code sent to your email",
        emailExists: true,
        resetToken: resetToken, // Remove this in production
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
