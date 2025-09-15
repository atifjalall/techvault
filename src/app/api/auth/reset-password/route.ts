import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    console.log("🔐 Password reset request for:", email);

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, code, and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check password strength (same as signup)
    let score = 0;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) score++;

    if (score < 3) {
      return NextResponse.json(
        {
          error:
            "Password is too weak. Must contain uppercase, lowercase, number, and special character",
        },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const user = await db.user.findFirst({
      where: {
        email: email.toLowerCase(),
        resetToken: code,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      console.log("❌ Invalid or expired reset code for:", email);
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    console.log("✅ Valid reset token found for user:", user.id);

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    console.log("🔑 Password updated successfully for user:", updatedUser.id);

    // Return user data for automatic login
    return NextResponse.json(
      {
        message: "Password reset successfully",
        user: updatedUser,
        autoLogin: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
