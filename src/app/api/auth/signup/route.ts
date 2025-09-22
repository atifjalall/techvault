import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getRandomAvatar } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      agreeToTerms,
      agreeToMarketing,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !agreeToTerms) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate name fields
    if (firstName.trim().length < 2) {
      return NextResponse.json(
        { error: "First name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    if (lastName.trim().length < 2) {
      return NextResponse.json(
        { error: "Last name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Validate name characters (only letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(firstName.trim())) {
      return NextResponse.json(
        { error: "First name contains invalid characters" },
        { status: 400 }
      );
    }

    if (!nameRegex.test(lastName.trim())) {
      return NextResponse.json(
        { error: "Last name contains invalid characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate random avatar
    const randomAvatar = getRandomAvatar();

    // Create user
    const newUser = await db.user.create({
      data: {
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        image: randomAvatar,
        isVerified: false, // Keep email verification for tomorrow
        // Set deletion date for unverified accounts (7 days from now)
        deleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        role: "CUSTOMER", // Default role
      },
    });

    // Remove sensitive data from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: userWithoutPassword,
        shouldAutoSignIn: true, // Flag for client to auto-signin
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
