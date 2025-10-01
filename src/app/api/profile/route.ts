/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash, compare } from "bcryptjs";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// Enhanced validation functions with strict security
const validateName = (name: string): string | null => {
  if (!name || typeof name !== "string") return "Name is required";

  const trimmed = name.trim();
  if (!trimmed) return "Name cannot be empty";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (trimmed.length > 30) return "Name cannot exceed 30 characters";

  // Only allow letters, spaces, hyphens, apostrophes, and common international characters
  if (!/^[a-zA-ZÀ-ÿĀ-žА-я\u0100-\u017F\u0180-\u024F\s'-]+$/.test(trimmed)) {
    return "Name contains invalid characters";
  }

  // Prevent script injection attempts
  if (/<[^>]*>|javascript:|data:|vbscript:|on\w+=/i.test(trimmed)) {
    return "Invalid characters detected";
  }

  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Phone is optional

  if (typeof phone !== "string") return "Invalid phone format";

  const trimmed = phone.trim();
  if (!trimmed) return null;

  // Remove spaces, dashes, parentheses for validation
  const digitsOnly = trimmed.replace(/[\s\-()]/g, "");

  // Must start with + or digit, contain only valid phone characters
  if (!/^[+]?[\d\s\-()]+$/.test(trimmed)) {
    return "Invalid phone number format";
  }

  // Extract just digits (excluding +)
  const numbersOnly = digitsOnly.replace(/^\+/, "");
  if (numbersOnly.length < 7) return "Phone number too short";
  if (numbersOnly.length > 15) return "Phone number too long";

  // Prevent script injection
  if (/<[^>]*>|javascript:|data:|vbscript:/i.test(trimmed)) {
    return "Invalid characters detected";
  }

  return null;
};

const validateBio = (bio: string): string | null => {
  if (!bio) return null; // Bio is optional

  if (typeof bio !== "string") return "Invalid bio format";

  if (bio.length > 200) return "Bio cannot exceed 200 characters";

  // Check for script injection attempts
  if (/<script|javascript:|data:|vbscript:|on\w+=/i.test(bio)) {
    return "Invalid content detected";
  }

  // Block angle brackets
  if (/[<>]/.test(bio)) {
    return "Angle brackets are not allowed";
  }

  return null;
};

const validateAddress = (field: string, value: string): string | null => {
  if (!value) return null; // Address fields are optional

  if (typeof value !== "string") return `Invalid ${field} format`;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Prevent script injection
  if (/<[^>]*>|javascript:|data:|vbscript:/i.test(trimmed)) {
    return "Invalid characters detected";
  }

  switch (field) {
    case "street":
      if (trimmed.length < 5) return "Street address too short";
      if (trimmed.length > 80) return "Street address too long";
      // Allow letters, numbers, spaces, basic punctuation for addresses
      if (!/^[a-zA-ZÀ-ÿ0-9\s\-.,#/]+$/.test(trimmed)) {
        return "Invalid characters in street address";
      }
      break;

    case "city":
      if (trimmed.length < 2) return "City name too short";
      if (trimmed.length > 40) return "City name too long";
      // Only letters, spaces, hyphens, apostrophes
      if (!/^[a-zA-ZÀ-ÿĀ-žА-я\s'-]+$/.test(trimmed)) {
        return "Invalid city name format";
      }
      break;

    case "state":
      if (trimmed.length > 40) return "State name too long";
      // Only letters, spaces, hyphens
      if (!/^[a-zA-ZÀ-ÿĀ-žА-я\s'-]+$/.test(trimmed)) {
        return "Invalid state name format";
      }
      break;

    case "zipCode":
      if (!/^[0-9A-Za-z\s-]{3,10}$/.test(trimmed)) {
        return "Invalid postal code format";
      }
      // German postal code validation
      if (/^[0-9]{5}$/.test(trimmed)) {
        const num = parseInt(trimmed);
        if (num < 1000 || num > 99999) {
          return "Invalid German postal code";
        }
      }
      break;

    case "country":
      if (trimmed.length > 40) return "Country name too long";
      // Only letters, spaces, hyphens
      if (!/^[a-zA-ZÀ-ÿĀ-žА-я\s'-]+$/.test(trimmed)) {
        return "Invalid country name format";
      }
      break;
  }

  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password || typeof password !== "string") return "Password is required";

  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 64) return "Password too long (max 64 characters)";
  if (!/[A-Z]/.test(password)) return "Password must contain uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain lowercase letter";
  if (!/\d/.test(password)) return "Password must contain a number";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Password must contain special character";
  }

  // Prevent common weak patterns
  if (/^(.)\1{7,}$/.test(password)) return "Password too repetitive";
  if (/123456|password|qwerty|admin/i.test(password))
    return "Password too common";

  return null;
};

// Input sanitization with strict length limits
const sanitizeInput = (input: string, maxLength: number = 100): string => {
  if (!input || typeof input !== "string") return "";

  return input
    .slice(0, maxLength) // Enforce max length
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript protocol
    .replace(/data:/gi, "") // Remove data protocol
    .replace(/vbscript:/gi, "") // Remove vbscript protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
};

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10; // Max 10 updates per 15 minutes

  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxAttempts) {
    return false;
  }

  userLimit.count++;
  return true;
};

// GET /api/profile - Get user profile data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        emailVerified: true,
        phoneVerified: true,
        isVerified: true, // ADD THIS - the actual verification field
        businessAddress: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Parse name into first and last name
    const nameParts = user.name?.split(" ") || ["", ""];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Parse business address or set defaults
    const businessAddress = user.businessAddress as any;
    const address = {
      street: businessAddress?.street || "",
      city: businessAddress?.city || "",
      state: businessAddress?.state || "",
      zipCode: businessAddress?.zipCode || "",
      country: businessAddress?.country || "Germany",
    };

    const profile = {
      id: user.id,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone || "",
      bio: user.bio || "",
      address,
      joinedAt: user.createdAt.toISOString(),
      // FIX: Use isVerified which is true for OAuth users
      emailVerified: user.isVerified || !!user.emailVerified,
      phoneVerified: user.phoneVerified,
    };

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update user profile data
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true, businessAddress: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Rate limiting check
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON data" },
        { status: 400 }
      );
    }

    const { section, data } = requestBody;

    if (
      !section ||
      !data ||
      typeof section !== "string" ||
      typeof data !== "object"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400 }
      );
    }

    switch (section) {
      case "personal": {
        const { firstName, lastName, phone, bio } = data;

        // Validate all fields
        const firstNameError = validateName(firstName);
        if (firstNameError) {
          return NextResponse.json(
            { success: false, error: `First name: ${firstNameError}` },
            { status: 400 }
          );
        }

        const lastNameError = validateName(lastName);
        if (lastNameError) {
          return NextResponse.json(
            { success: false, error: `Last name: ${lastNameError}` },
            { status: 400 }
          );
        }

        const phoneError = validatePhone(phone);
        if (phoneError) {
          return NextResponse.json(
            { success: false, error: `Phone: ${phoneError}` },
            { status: 400 }
          );
        }

        const bioError = validateBio(bio);
        if (bioError) {
          return NextResponse.json(
            { success: false, error: `Bio: ${bioError}` },
            { status: 400 }
          );
        }

        // Sanitize inputs
        const sanitizedFirstName = sanitizeInput(firstName, 30);
        const sanitizedLastName = sanitizeInput(lastName, 30);
        const sanitizedPhone = sanitizeInput(phone, 20);
        const sanitizedBio = sanitizeInput(bio, 200);

        // Combine first and last name
        const fullName = `${sanitizedFirstName} ${sanitizedLastName}`.trim();

        await db.user.update({
          where: { id: user.id },
          data: {
            name: fullName,
            phone: sanitizedPhone || null,
            bio: sanitizedBio || null,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Personal information updated successfully",
        });
      }

      case "address": {
        const { street, city, state, zipCode, country } = data;

        // Validate all address fields
        const streetError = validateAddress("street", street);
        if (streetError) {
          return NextResponse.json(
            { success: false, error: `Street: ${streetError}` },
            { status: 400 }
          );
        }

        const cityError = validateAddress("city", city);
        if (cityError) {
          return NextResponse.json(
            { success: false, error: `City: ${cityError}` },
            { status: 400 }
          );
        }

        const stateError = validateAddress("state", state);
        if (stateError) {
          return NextResponse.json(
            { success: false, error: `State: ${stateError}` },
            { status: 400 }
          );
        }

        const zipError = validateAddress("zipCode", zipCode);
        if (zipError) {
          return NextResponse.json(
            { success: false, error: `ZIP Code: ${zipError}` },
            { status: 400 }
          );
        }

        const countryError = validateAddress("country", country);
        if (countryError) {
          return NextResponse.json(
            { success: false, error: `Country: ${countryError}` },
            { status: 400 }
          );
        }

        // Validate required fields for complete address
        if (
          street?.trim() &&
          (!city?.trim() || !zipCode?.trim() || !country?.trim())
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "City, ZIP code, and country are required when street is provided",
            },
            { status: 400 }
          );
        }

        // Sanitize inputs
        const addressData = {
          street: sanitizeInput(street, 80),
          city: sanitizeInput(city, 40),
          state: sanitizeInput(state, 40),
          zipCode: sanitizeInput(zipCode, 10),
          country: sanitizeInput(country, 40) || "Germany",
        };

        await db.user.update({
          where: { id: user.id },
          data: {
            businessAddress: addressData,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Address updated successfully",
        });
      }

      case "password": {
        const { currentPassword, newPassword } = data;

        // Validate required fields
        if (!currentPassword || !newPassword) {
          return NextResponse.json(
            {
              success: false,
              error: "Current password and new password are required",
            },
            { status: 400 }
          );
        }

        if (
          typeof currentPassword !== "string" ||
          typeof newPassword !== "string"
        ) {
          return NextResponse.json(
            { success: false, error: "Invalid password format" },
            { status: 400 }
          );
        }

        // Check if user has a password (might be OAuth user)
        if (!user.password) {
          return NextResponse.json(
            {
              success: false,
              error: "Cannot change password for OAuth accounts",
            },
            { status: 400 }
          );
        }

        // Verify current password
        const isCurrentPasswordValid = await compare(
          currentPassword,
          user.password
        );
        if (!isCurrentPasswordValid) {
          return NextResponse.json(
            { success: false, error: "Current password is incorrect" },
            { status: 400 }
          );
        }

        // Validate new password strength
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
          return NextResponse.json(
            { success: false, error: passwordError },
            { status: 400 }
          );
        }

        // Check if new password is different from current
        const isSamePassword = await compare(newPassword, user.password);
        if (isSamePassword) {
          return NextResponse.json(
            {
              success: false,
              error: "New password must be different from current password",
            },
            { status: 400 }
          );
        }

        // Hash new password with high cost
        const hashedPassword = await hash(newPassword, 14);

        await db.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            lastPasswordChange: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: "Password updated successfully",
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid section specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Profile PATCH error:", error);

    // Don't expose internal errors to client
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
