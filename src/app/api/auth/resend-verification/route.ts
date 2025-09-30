import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  sendEmail,
  getVerificationEmailTemplate,
  generateVerificationToken,
} from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validation
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isVerified: true,
      },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        {
          message:
            "If an account exists with this email, a verification link has been sent.",
        },
        { status: 200 }
      );
    }

    // Check if already verified
    if (user.emailVerified || user.isVerified) {
      return NextResponse.json(
        { error: "This account is already verified" },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await db.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        deleteAt: verificationExpiry, // Extend deletion time
      },
    });

    // Create verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;

    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email - TechVault",
        html: getVerificationEmailTemplate(
          user.name || "User",
          verificationUrl
        ),
      });

      console.log("✅ Verification email resent to:", user.email);
    } catch (emailError) {
      console.error("❌ Failed to resend verification email:", emailError);

      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Verification email sent! Please check your inbox.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
