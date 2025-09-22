// src/app/api/payment-methods/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// GET /api/payment-methods - Get user's saved payment methods
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get saved payment methods
    const paymentMethods = await db.savedPaymentMethod.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: [
        { isDefault: "desc" }, // Default first
        { createdAt: "desc" }, // Then newest
      ],
    });

    // Transform data for frontend
    const transformedMethods = paymentMethods.map((method) => ({
      id: method.id,
      last4Digits: method.last4Digits,
      cardBrand: method.cardBrand,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      billingName: method.billingName,
      billingEmail: method.billingEmail,
      billingAddress: method.billingAddress,
      isDefault: method.isDefault,
      nickname: method.nickname,
      createdAt: method.createdAt,
    }));

    return NextResponse.json({
      success: true,
      paymentMethods: transformedMethods,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

// POST /api/payment-methods - Add new payment method
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const {
      cardholderName,
      saveMethod = true,
      nickname,
      billingAddress,
      // In real implementation, you'd get payment method token from Stripe Elements
      mockCard = false,
    } = await request.json();

    if (!cardholderName?.trim()) {
      return NextResponse.json(
        { error: "Cardholder name is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let stripePaymentMethodId: string;
    let last4Digits: string;
    let cardBrand: string;
    let expiryMonth: number;
    let expiryYear: number;

    if (mockCard) {
      // Mock payment method for development
      stripePaymentMethodId = `pm_mock_${Date.now()}`;
      last4Digits = "4242";
      cardBrand = "Visa";
      expiryMonth = 12;
      expiryYear = 2025;
    } else {
      // In production, you would:
      // 1. Get payment method token from frontend (Stripe Elements)
      // 2. Attach it to customer
      // 3. Retrieve payment method details

      try {
        // Create a test payment method for demo
        const paymentMethod = await stripe.paymentMethods.create({
          type: "card",
          card: {
            token: "tok_visa", // Stripe test token
          },
        });

        // Add this to the SavedPaymentMethod creation section
        // Get customer or create one
        let customerId: string;
        try {
          const customers = await stripe.customers.list({
            email: user.email,
            limit: 1,
          });

          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
          } else {
            const customer = await stripe.customers.create({
              email: user.email,
              name: user.name || cardholderName,
            });
            customerId = customer.id;
          }
        } catch (error) {
          console.error("Error with Stripe customer:", error);
          throw new Error("Failed to setup payment method");
        }

        // Attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethod.id, {
          customer: customerId,
        });

        stripePaymentMethodId = paymentMethod.id;

        // Extract card details
        const card = paymentMethod.card!;
        last4Digits = card.last4;
        cardBrand = card.brand;
        expiryMonth = card.exp_month;
        expiryYear = card.exp_year;
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);

        // Fallback to mock for development
        stripePaymentMethodId = `pm_mock_${Date.now()}`;
        last4Digits = "4242";
        cardBrand = "Visa";
        expiryMonth = 12;
        expiryYear = 2025;
      }
    }

    // Check if this should be the default (first payment method)
    const existingMethods = await db.savedPaymentMethod.count({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    const isDefault = existingMethods === 0;

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.savedPaymentMethod.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Save payment method to database
    const savedPaymentMethod = await db.savedPaymentMethod.create({
      data: {
        userId: user.id,
        stripePaymentMethodId,
        last4Digits,
        cardBrand: cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1), // Capitalize
        expiryMonth,
        expiryYear,
        billingName: cardholderName,
        billingEmail: user.email,
        billingAddress: billingAddress || null,
        isDefault,
        nickname: nickname || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment method added successfully",
      paymentMethod: {
        id: savedPaymentMethod.id,
        last4Digits: savedPaymentMethod.last4Digits,
        cardBrand: savedPaymentMethod.cardBrand,
        expiryMonth: savedPaymentMethod.expiryMonth,
        expiryYear: savedPaymentMethod.expiryYear,
        billingName: savedPaymentMethod.billingName,
        isDefault: savedPaymentMethod.isDefault,
        nickname: savedPaymentMethod.nickname,
      },
    });
  } catch (error) {
    console.error("Error adding payment method:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}

// DELETE /api/payment-methods - Remove payment method
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Payment method ID is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find payment method
    const paymentMethod = await db.savedPaymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: user.id,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Don't allow deletion of default if it's the only method
    if (paymentMethod.isDefault) {
      const methodCount = await db.savedPaymentMethod.count({
        where: {
          userId: user.id,
          isActive: true,
        },
      });

      if (methodCount === 1) {
        return NextResponse.json(
          { error: "Cannot delete your only payment method" },
          { status: 400 }
        );
      }
    }

    // Detach from Stripe (if not mock)
    if (!paymentMethod.stripePaymentMethodId.startsWith("pm_mock_")) {
      try {
        await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
      } catch (stripeError) {
        console.warn("Failed to detach from Stripe:", stripeError);
        // Continue with local deletion
      }
    }

    // Soft delete (mark as inactive)
    await db.savedPaymentMethod.update({
      where: { id: paymentMethodId },
      data: { isActive: false },
    });

    // If this was default, make another one default
    if (paymentMethod.isDefault) {
      const nextMethod = await db.savedPaymentMethod.findFirst({
        where: {
          userId: user.id,
          isActive: true,
          id: { not: paymentMethodId },
        },
        orderBy: { createdAt: "desc" },
      });

      if (nextMethod) {
        await db.savedPaymentMethod.update({
          where: { id: nextMethod.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment method removed successfully",
    });
  } catch (error) {
    console.error("Error removing payment method:", error);
    return NextResponse.json(
      { error: "Failed to remove payment method" },
      { status: 500 }
    );
  }
}
