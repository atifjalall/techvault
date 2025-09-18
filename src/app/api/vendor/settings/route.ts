/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user with all settings
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        lastPasswordChange: true,
        businessAddress: true,
        notificationSettings: true,
        vendorSettings: {
          select: {
            storeName: true,
            businessName: true,
            businessType: true,
            taxId: true,
            website: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Parse JSON fields with fallbacks
    const businessAddress = (user.businessAddress as any) || {
      street: "",
      city: "",
      postalCode: "",
      country: "Germany",
    };

    const notificationSettings = (user.notificationSettings as any) || {
      orderAlerts: true,
      marketingEmails: false,
      productUpdates: true,
      payoutNotifications: true,
    };

    // Format settings response
    const settings = {
      profile: {
        id: user.id,
        name: user.name || "",
        email: user.email,
        phone: user.phone || "",
        image: user.image || "",
        bio: user.bio || "",
      },
      address: businessAddress,
      businessInfo: {
        businessName: user.vendorSettings?.businessName || "",
        businessType: user.vendorSettings?.businessType || "Electronics Retail",
        taxId: user.vendorSettings?.taxId || "",
        website: user.vendorSettings?.website || "",
      },
      security: {
        emailVerified: !!user.emailVerified,
        phoneVerified: user.phoneVerified || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
        lastPasswordChange:
          user.lastPasswordChange?.toISOString() || new Date().toISOString(),
      },
      notifications: notificationSettings,
    };

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { section, data } = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    switch (section) {
      case "profile": {
        const { name, email, phone, bio } = data;

        // Check if email is already taken by another user
        if (email !== session.user.email) {
          const existingUser = await db.user.findUnique({
            where: { email },
            select: { id: true },
          });

          if (existingUser && existingUser.id !== user.id) {
            return NextResponse.json(
              { success: false, error: "Email already in use" },
              { status: 400 }
            );
          }
        }

        await db.user.update({
          where: { id: user.id },
          data: {
            name,
            email,
            phone,
            bio,
          },
        });

        break;
      }

      case "address": {
        const { street, city, postalCode, country } = data;

        await db.user.update({
          where: { id: user.id },
          data: {
            businessAddress: {
              street,
              city,
              postalCode,
              country,
            },
          },
        });

        break;
      }

      case "business": {
        const { businessName, businessType, taxId, website } = data;

        // Update or create vendor settings
        await db.vendorSettings.upsert({
          where: { userId: user.id },
          update: {
            businessName,
            businessType,
            taxId,
            website,
          },
          create: {
            userId: user.id,
            businessName,
            businessType,
            taxId,
            website,
          },
        });

        break;
      }

      case "password": {
        const { currentPassword, newPassword } = data;

        if (!user.password) {
          return NextResponse.json(
            {
              success: false,
              error: "No password set. Please use OAuth to sign in.",
            },
            { status: 400 }
          );
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(
          currentPassword,
          user.password
        );
        if (!isValidPassword) {
          return NextResponse.json(
            { success: false, error: "Current password is incorrect" },
            { status: 400 }
          );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await db.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            lastPasswordChange: new Date(),
          },
        });

        break;
      }

      case "notifications": {
        // Get current notification settings
        const currentUser = await db.user.findUnique({
          where: { id: user.id },
          select: { notificationSettings: true },
        });

        const currentSettings = (currentUser?.notificationSettings as any) || {
          orderAlerts: true,
          marketingEmails: false,
          productUpdates: true,
          payoutNotifications: true,
        };

        // Merge with new settings
        const updatedSettings = { ...currentSettings, ...data };

        await db.user.update({
          where: { id: user.id },
          data: {
            notificationSettings: updatedSettings,
          },
        });

        break;
      }

      case "2fa": {
        const { enabled } = data;

        await db.user.update({
          where: { id: user.id },
          data: {
            twoFactorEnabled: enabled,
          },
        });

        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid section" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Settings PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { password } = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify password if user has one
    if (user.password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: "Password is incorrect" },
          { status: 400 }
        );
      }
    }

    // In a real app, you might want to:
    // 1. Process any pending payouts
    // 2. Archive data for legal compliance
    // 3. Send confirmation emails
    // 4. Handle related data cleanup

    // For now, we'll mark the user for deletion
    await db.user.update({
      where: { id: user.id },
      data: {
        deleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        email: `deleted-${Date.now()}@deleted.com`, // Anonymize email
        name: "Deleted User",
        phone: null,
        image: null,
        bio: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account scheduled for deletion",
    });
  } catch (error) {
    console.error("Settings DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
