import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    console.log("🔍 Verifying reset code for:", email);

    // Validation
    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Invalid code format. Code must be 6 digits." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user with this email and reset token
    const user = await db.user.findFirst({
      where: {
        email: normalizedEmail,
        resetToken: code.trim(),
      },
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true,
      },
    });

    if (!user) {
      console.log("❌ Invalid code or email");
      return NextResponse.json(
        { error: "Invalid or expired reset code", valid: false },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      console.log("❌ Reset code expired");

      // Clear expired token
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return NextResponse.json(
        {
          error: "Reset code has expired. Please request a new one.",
          valid: false,
        },
        { status: 400 }
      );
    }

    console.log("✅ Reset code verified successfully");

    return NextResponse.json(
      {
        message: "Reset code verified successfully",
        valid: true,
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Verify reset code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
