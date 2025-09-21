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
              orderNumber: true,
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

  // Create notifications for new orders
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

  // Create order update notifications
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
