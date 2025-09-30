import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  sendEmail,
  getVerificationEmailTemplate,
  generateVerificationToken,
} from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // Validation
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const newUser = await db.user.create({
      data: {
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        verificationToken,
        emailVerified: null, // Not verified yet
        isVerified: false,
        deleteAt: verificationExpiry, // Account will be deleted if not verified within 24 hours
        role: "CUSTOMER",
      },
    });

    // Create verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;

    // Send verification email
    try {
      await sendEmail({
        to: newUser.email,
        subject: "Verify Your Email - TechVault",
        html: getVerificationEmailTemplate(
          newUser.name || "User",
          verificationUrl
        ),
      });

      console.log("✅ Verification email sent to:", newUser.email);
    } catch (emailError) {
      console.error("❌ Failed to send verification email:", emailError);

      // Delete the user if email fails
      await db.user.delete({
        where: { id: newUser.id },
      });

      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    // Remove sensitive data from response
    const {
      password: _,
      verificationToken: __,
      ...userWithoutSensitiveData
    } = newUser;

    return NextResponse.json(
      {
        message:
          "Account created successfully! Please check your email to verify your account.",
        user: userWithoutSensitiveData,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Handle Prisma validation errors
    if (error instanceof Error && error.message.includes("Argument")) {
      return NextResponse.json(
        { error: "Invalid data provided. Please check your input." },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (error instanceof Error && error.message.includes("connect")) {
      return NextResponse.json(
        { error: "Database connection failed. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
