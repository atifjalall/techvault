import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    // Validation
    if (!token?.trim()) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find user with this token (using findFirst since it's not unique)
    const user = await db.user.findFirst({
      where: { verificationToken: token.trim() },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isVerified: true,
        deleteAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.emailVerified || user.isVerified) {
      return NextResponse.json(
        { message: "Email is already verified", alreadyVerified: true },
        { status: 200 }
      );
    }

    // Check if token expired (deleteAt date passed)
    if (user.deleteAt && new Date() > user.deleteAt) {
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify the user
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        isVerified: true,
        verificationToken: null, // Clear the token
        deleteAt: null, // Remove deletion date
      },
    });

    console.log("✅ Email verified for user:", user.email);

    return NextResponse.json(
      {
        message: "Email verified successfully! You can now sign in.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

// GET endpoint for token-based verification (when user clicks email link)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find user with this token (using findFirst)
    const user = await db.user.findFirst({
      where: { verificationToken: token },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        isVerified: true,
        deleteAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.emailVerified || user.isVerified) {
      return NextResponse.json(
        { message: "Email is already verified", alreadyVerified: true },
        { status: 200 }
      );
    }

    // Check if token expired
    if (user.deleteAt && new Date() > user.deleteAt) {
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify the user
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        isVerified: true,
        verificationToken: null,
        deleteAt: null,
      },
    });

    return NextResponse.json(
      {
        message: "Email verified successfully!",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
