import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { available: false, error: "Invalid email format" },
        { status: 200 }
      );
    }

    // Check if email exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true },
    });

    return NextResponse.json(
      {
        available: !existingUser,
        message: existingUser
          ? "Email is already registered"
          : "Email is available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { error: "Failed to check email availability" },
      { status: 500 }
    );
  }
}
