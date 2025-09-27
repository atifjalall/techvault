/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/user/address/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/user/address - Get user's saved address
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user with business address
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        businessAddress: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // businessAddress is stored as Json in the database
    const address = user.businessAddress as any;

    return NextResponse.json({
      success: true,
      address: address || null,
    });
  } catch (error) {
    console.error("Error fetching user address:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch address" },
      { status: 500 }
    );
  }
}

// POST /api/user/address - Save user's address
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { street, city, postalCode, country } = await request.json();

    if (!street?.trim() || !city?.trim() || !postalCode?.trim()) {
      return NextResponse.json(
        { success: false, error: "Street, city, and postal code are required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update user's business address
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        businessAddress: {
          street: street.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(), // Make sure it's saved as postalCode
          country: country?.trim() || "Germany",
          updatedAt: new Date().toISOString(),
        },
      },
      select: { businessAddress: true },
    });

    console.log("Saved address:", updatedUser.businessAddress); // Debug log

    return NextResponse.json({
      success: true,
      message: "Address saved successfully",
      address: updatedUser.businessAddress,
    });
  } catch (error) {
    console.error("Error saving user address:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save address" },
      { status: 500 }
    );
  }
}
