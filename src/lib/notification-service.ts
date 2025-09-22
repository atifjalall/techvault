/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import { NotificationType, NotificationSeverity } from "@prisma/client";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  severity?: NotificationSeverity;
  message: string;
  productId?: string;
  orderId?: string;
}

export class NotificationService {
  // Create a new notification
  static async createNotification(input: CreateNotificationInput) {
    try {
      if (!input.userId || !input.type || !input.message) {
        throw new Error("Missing required fields: userId, type, or message");
      }

      const notification = await db.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          severity: input.severity || NotificationSeverity.INFO,
          message: input.message.substring(0, 500),
          productId: input.productId || null,
          orderId: input.orderId || null,
          isRead: false,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          order: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // ============ VENDOR NOTIFICATIONS ============

  // Create notifications for new orders (vendor-focused)
  static async createOrderNotifications(orderId: string) {
    try {
      if (!orderId) {
        throw new Error("Order ID is required");
      }

      const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  vendor: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (!order.items || order.items.length === 0) {
        return [];
      }

      const vendorGroups = new Map<string, any[]>();

      for (const item of order.items) {
        const vendorId = item?.product?.vendorId;
        if (vendorId) {
          if (!vendorGroups.has(vendorId)) {
            vendorGroups.set(vendorId, []);
          }
          vendorGroups.get(vendorId)!.push(item);
        }
      }

      const notifications = [];

      for (const [vendorId, items] of vendorGroups) {
        if (!vendorId || !items || items.length === 0) continue;

        const totalItems = items.reduce((sum, item) => {
          return sum + Math.max(0, item?.quantity || 0);
        }, 0);

        const productNames = items
          .map((item) => item?.product?.name || "Unknown Product")
          .filter(Boolean)
          .join(", ");

        const truncatedProductNames =
          productNames.length > 50
            ? productNames.substring(0, 50) + "..."
            : productNames;

        const notification = await this.createNotification({
          userId: vendorId,
          type: NotificationType.NEW_ORDER,
          severity: NotificationSeverity.INFO,
          message: `New order received: ${totalItems} item(s) - ${truncatedProductNames}`,
          orderId: order.id,
        });

        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Error creating order notifications:", error);
      throw error;
    }
  }

  // Create low stock notifications
  static async createLowStockNotifications() {
    try {
      const lowStockProducts = await db.product.findMany({
        where: {
          stock: {
            lte: 10,
          },
          deletedAt: null,
          vendorId: {
            not: undefined,
          },
        },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: 100,
      });

      if (!lowStockProducts || lowStockProducts.length === 0) {
        return [];
      }

      const notifications = [];

      for (const product of lowStockProducts) {
        if (!product.vendorId) continue;

        const existingNotification = await db.notification.findFirst({
          where: {
            userId: product.vendorId,
            type: NotificationType.LOW_STOCK,
            productId: product.id,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        });

        if (!existingNotification) {
          const stock = Math.max(0, product.stock || 0);

          let severity: NotificationSeverity = NotificationSeverity.INFO;
          if (stock === 0) {
            severity = NotificationSeverity.CRITICAL;
          } else if (stock <= 5) {
            severity = NotificationSeverity.WARNING;
          }

          const message =
            stock === 0
              ? `${product.name || "Product"} is out of stock!`
              : `${product.name || "Product"} is running low (${stock} left)`;

          const notification = await this.createNotification({
            userId: product.vendorId,
            type: NotificationType.LOW_STOCK,
            severity,
            message,
            productId: product.id,
          });

          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error("Error creating low stock notifications:", error);
      throw error;
    }
  }

  // Create order update notifications for vendors
  static async createOrderUpdateNotification(
    orderId: string,
    newStatus: string
  ) {
    try {
      if (!orderId || !newStatus) {
        throw new Error("Order ID and new status are required");
      }

      const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  vendorId: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (!order.items || order.items.length === 0) {
        return [];
      }

      const vendorIds = [
        ...new Set(
          order.items
            .map((item) => item?.product?.vendorId)
            .filter((id): id is string => Boolean(id))
        ),
      ];

      if (vendorIds.length === 0) {
        return [];
      }

      const notifications = [];

      for (const vendorId of vendorIds) {
        const notification = await this.createNotification({
          userId: vendorId,
          type: NotificationType.ORDER_UPDATED,
          severity: NotificationSeverity.INFO,
          message: `Order #${order.id} status updated to ${newStatus}`,
          orderId: order.id,
        });

        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Error creating order update notification:", error);
      throw error;
    }
  }

  // Create new review notifications
  static async createReviewNotification(reviewId: string) {
    try {
      if (!reviewId) {
        throw new Error("Review ID is required");
      }

      const review = await db.review.findUnique({
        where: { id: reviewId },
        include: {
          product: {
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!review) {
        throw new Error("Review not found");
      }

      if (!review.product?.vendorId) {
        throw new Error("Product vendor not found");
      }

      const rating = Math.max(1, Math.min(5, review.rating || 0));
      const userName = review.user?.name || "Anonymous";
      const productName = review.product?.name || "Product";

      const notification = await this.createNotification({
        userId: review.product.vendorId,
        type: NotificationType.NEW_REVIEW,
        severity: NotificationSeverity.INFO,
        message: `New ${rating}-star review for ${productName} by ${userName}`,
        productId: review.productId,
      });

      return notification;
    } catch (error) {
      console.error("Error creating review notification:", error);
      throw error;
    }
  }

  // ============ CUSTOMER NOTIFICATIONS ============

  // Create customer order confirmation notification
  static async createCustomerOrderConfirmation(
    orderId: string,
    customerId: string
  ) {
    try {
      if (!orderId || !customerId) {
        throw new Error("Order ID and customer ID are required");
      }

      const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            take: 3,
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      const itemCount = order.items.length;
      const firstItem = order.items[0]?.product?.name || "items";
      const orderRef = order.id.slice(-8).toUpperCase();

      let message = `Order #${orderRef} confirmed! `;
      if (itemCount === 1) {
        message += `Your ${firstItem} will be processed shortly.`;
      } else {
        message += `Your ${itemCount} items including ${firstItem} will be processed shortly.`;
      }

      return await this.createNotification({
        userId: customerId,
        type: NotificationType.ORDER_CONFIRMED,
        severity: NotificationSeverity.INFO,
        message,
        orderId: order.id,
      });
    } catch (error) {
      console.error("Error creating customer order confirmation:", error);
      throw error;
    }
  }

  // Create customer order status update notification
  static async createCustomerOrderStatusUpdate(
    orderId: string,
    customerId: string,
    status: string
  ) {
    try {
      if (!orderId || !customerId || !status) {
        throw new Error("Order ID, customer ID and status are required");
      }

      const orderRef = orderId.slice(-8).toUpperCase();

      const statusMessages: Record<
        string,
        {
          type: NotificationType;
          message: string;
          severity?: NotificationSeverity;
        }
      > = {
        PROCESSING: {
          type: NotificationType.ORDER_PROCESSING,
          message: `Order #${orderRef} is now being processed. We'll pack your items soon!`,
        },
        PACKED: {
          type: NotificationType.ORDER_PACKED,
          message: `Order #${orderRef} has been packed and is ready for shipment.`,
        },
        SHIPPED: {
          type: NotificationType.ORDER_SHIPPED,
          message: `Order #${orderRef} has been shipped! Track your package for delivery updates.`,
        },
        OUT_FOR_DELIVERY: {
          type: NotificationType.ORDER_OUT_FOR_DELIVERY,
          message: `Order #${orderRef} is out for delivery! It should arrive today.`,
          severity: NotificationSeverity.WARNING,
        },
        DELIVERED: {
          type: NotificationType.ORDER_DELIVERED,
          message: `Order #${orderRef} has been delivered! We hope you love your purchase.`,
          severity: NotificationSeverity.INFO,
        },
        CANCELLED: {
          type: NotificationType.ORDER_CANCELLED,
          message: `Order #${orderRef} has been cancelled. If you didn't request this, please contact support.`,
          severity: NotificationSeverity.WARNING,
        },
      };

      const statusInfo = statusMessages[status.toUpperCase()];
      if (!statusInfo) {
        return await this.createNotification({
          userId: customerId,
          type: NotificationType.ORDER_UPDATED,
          severity: NotificationSeverity.INFO,
          message: `Order #${orderRef} status updated to ${status}.`,
          orderId,
        });
      }

      return await this.createNotification({
        userId: customerId,
        type: statusInfo.type,
        severity: statusInfo.severity || NotificationSeverity.INFO,
        message: statusInfo.message,
        orderId,
      });
    } catch (error) {
      console.error("Error creating customer order status update:", error);
      throw error;
    }
  }

  // Create payment notification
  static async createPaymentNotification(
    customerId: string,
    orderId: string,
    type: "processed" | "failed" | "refunded"
  ) {
    try {
      if (!customerId || !orderId || !type) {
        throw new Error("Customer ID, order ID and type are required");
      }

      const orderRef = orderId.slice(-8).toUpperCase();

      const paymentMessages = {
        processed: {
          type: NotificationType.PAYMENT_PROCESSED,
          message: `Payment for order #${orderRef} processed successfully.`,
          severity: NotificationSeverity.INFO,
        },
        failed: {
          type: NotificationType.PAYMENT_FAILED,
          message: `Payment for order #${orderRef} failed. Please update your payment method.`,
          severity: NotificationSeverity.CRITICAL,
        },
        refunded: {
          type: NotificationType.PAYMENT_REFUNDED,
          message: `Refund for order #${orderRef} has been processed to your original payment method.`,
          severity: NotificationSeverity.INFO,
        },
      };

      const paymentInfo = paymentMessages[type];

      return await this.createNotification({
        userId: customerId,
        type: paymentInfo.type,
        severity: paymentInfo.severity,
        message: paymentInfo.message,
        orderId,
      });
    } catch (error) {
      console.error("Error creating payment notification:", error);
      throw error;
    }
  }

  // Create wishlist notifications
  static async createWishlistNotification(
    customerId: string,
    productId: string,
    type: "back_in_stock" | "price_drop" | "low_stock"
  ) {
    try {
      if (!customerId || !productId || !type) {
        throw new Error("Customer ID, product ID and type are required");
      }

      const product = await db.product.findUnique({
        where: { id: productId },
        select: {
          name: true,
          price: true,
          stock: true,
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const wishlistMessages = {
        back_in_stock: {
          type: NotificationType.WISHLIST_ITEM_BACK_IN_STOCK,
          message: `Good news! ${product.name} is back in stock. Order now before it sells out again!`,
          severity: NotificationSeverity.INFO,
        },
        price_drop: {
          type: NotificationType.WISHLIST_ITEM_PRICE_DROP,
          message: `Price drop alert! ${product.name} is now available for €${product.price}.`,
          severity: NotificationSeverity.INFO,
        },
        low_stock: {
          type: NotificationType.WISHLIST_ITEM_LOW_STOCK,
          message: `Hurry! Only ${product.stock} left of ${product.name} in your wishlist.`,
          severity: NotificationSeverity.WARNING,
        },
      };

      const wishlistInfo = wishlistMessages[type];

      return await this.createNotification({
        userId: customerId,
        type: wishlistInfo.type,
        severity: wishlistInfo.severity,
        message: wishlistInfo.message,
        productId,
      });
    } catch (error) {
      console.error("Error creating wishlist notification:", error);
      throw error;
    }
  }

  // Create promotional notification
  static async createPromotionalNotification(
    customerId: string,
    type:
      | "flash_sale"
      | "discount_expiring"
      | "birthday_offer"
      | "loyalty_reward",
    message: string,
    productId?: string
  ) {
    try {
      if (!customerId || !type || !message) {
        throw new Error("Customer ID, type and message are required");
      }

      const promotionalTypes = {
        flash_sale: NotificationType.FLASH_SALE_ALERT,
        discount_expiring: NotificationType.DISCOUNT_EXPIRING,
        birthday_offer: NotificationType.BIRTHDAY_OFFER,
        loyalty_reward: NotificationType.LOYALTY_REWARD,
      };

      return await this.createNotification({
        userId: customerId,
        type: promotionalTypes[type],
        severity: NotificationSeverity.INFO,
        message,
        productId,
      });
    } catch (error) {
      console.error("Error creating promotional notification:", error);
      throw error;
    }
  }

  // Create security notification
  static async createSecurityNotification(
    customerId: string,
    type:
      | "password_changed"
      | "email_changed"
      | "suspicious_login"
      | "account_locked",
    additionalInfo?: string
  ) {
    try {
      if (!customerId || !type) {
        throw new Error("Customer ID and type are required");
      }

      const securityMessages = {
        password_changed: {
          type: NotificationType.PASSWORD_CHANGED,
          message: `Your password was changed successfully. If this wasn't you, contact support immediately.`,
          severity: NotificationSeverity.INFO,
        },
        email_changed: {
          type: NotificationType.EMAIL_CHANGED,
          message: `Your email address was updated. If this wasn't you, contact support immediately.`,
          severity: NotificationSeverity.INFO,
        },
        suspicious_login: {
          type: NotificationType.LOGIN_SUSPICIOUS,
          message: `Suspicious login detected from ${additionalInfo || "unknown location"}. Review your account security.`,
          severity: NotificationSeverity.WARNING,
        },
        account_locked: {
          type: NotificationType.ACCOUNT_LOCKED,
          message: `Your account has been temporarily locked due to suspicious activity. Contact support to unlock.`,
          severity: NotificationSeverity.CRITICAL,
        },
      };

      const securityInfo = securityMessages[type];

      return await this.createNotification({
        userId: customerId,
        type: securityInfo.type,
        severity: securityInfo.severity,
        message: securityInfo.message,
      });
    } catch (error) {
      console.error("Error creating security notification:", error);
      throw error;
    }
  }

  // ============ UTILITY METHODS ============

  // Cleanup old notifications
  static async cleanupOldNotifications(daysToKeep: number = 30) {
    try {
      const safeDaysToKeep = Math.max(1, Math.min(365, daysToKeep || 30));

      const cutoffDate = new Date(
        Date.now() - safeDaysToKeep * 24 * 60 * 60 * 1000
      );

      let totalDeleted = 0;
      const batchSize = 1000;

      while (true) {
        const result = await db.notification.deleteMany({
          where: {
            createdAt: {
              lt: cutoffDate,
            },
            isRead: true,
          },
        });

        totalDeleted += result.count;

        if (result.count < batchSize) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`Cleaned up ${totalDeleted} old notifications`);
      return { count: totalDeleted };
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
      throw error;
    }
  }
}

// Helper function to run periodic tasks
export async function runNotificationTasks() {
  const results = {
    lowStockNotifications: 0,
    cleanupCount: 0,
    errors: [] as string[],
  };

  try {
    const lowStockNotifications =
      await NotificationService.createLowStockNotifications();
    results.lowStockNotifications = lowStockNotifications.length;
  } catch (error) {
    const lowStockError = error as Error;
    console.error("Error in low stock notifications task:", lowStockError);
    results.errors.push(`Low stock notifications: ${lowStockError.message}`);
  }

  try {
    const cleanupResult = await NotificationService.cleanupOldNotifications(30);
    results.cleanupCount = cleanupResult.count;
  } catch (error) {
    const cleanupError = error as Error;
    console.error("Error in cleanup notifications task:", cleanupError);
    results.errors.push(`Cleanup notifications: ${cleanupError.message}`);
  }

  console.log("Notification tasks completed:", results);
  return results;
}
