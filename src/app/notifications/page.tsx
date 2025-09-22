/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ShoppingCartIcon,
  TrashIcon,
  FunnelIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";

// Types
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  actionUrl?: string;
  order?: {
    id: string;
    status: string;
    createdAt: string;
    productImage?: string;
    productName?: string;
  };
  product?: {
    id: string;
    name: string;
    image?: string;
    price: number;
    slug: string;
  };
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: {
    totalNotifications: number;
    unreadCount: number;
    todayCount: number;
    criticalCount: number;
  };
}

// Helper functions
const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    ORDER_CONFIRMED: CheckIcon,
    ORDER_PROCESSING: InformationCircleIcon,
    ORDER_PACKED: InformationCircleIcon,
    ORDER_SHIPPED: ShoppingCartIcon,
    ORDER_OUT_FOR_DELIVERY: ShoppingCartIcon,
    ORDER_DELIVERED: CheckIcon,
    ORDER_CANCELLED: ExclamationTriangleIcon,
    ORDER_REFUNDED: ExclamationTriangleIcon,
    ORDER_RETURNED: ExclamationTriangleIcon,
    ORDER_UPDATED: InformationCircleIcon,
    PAYMENT_PROCESSING: InformationCircleIcon,
    PAYMENT_PROCESSED: CheckIcon,
    PAYMENT_FAILED: ExclamationTriangleIcon,
    PAYMENT_REFUNDED: InformationCircleIcon,
    REFUND_PROCESSED: CheckIcon,
    RETURN_APPROVED: CheckIcon,
    RETURN_RECEIVED: InformationCircleIcon,
    RETURN_PROCESSED: CheckIcon,
    WISHLIST_ITEM_BACK_IN_STOCK: CheckIcon,
    WISHLIST_ITEM_PRICE_DROP: InformationCircleIcon,
    WISHLIST_ITEM_LOW_STOCK: ExclamationTriangleIcon,
    PRICE_DROP_ALERT: InformationCircleIcon,
    PROMOTIONAL_OFFER: InformationCircleIcon,
    FLASH_SALE_ALERT: InformationCircleIcon,
    DISCOUNT_EXPIRING: ExclamationTriangleIcon,
    NEW_ARRIVAL_ALERT: InformationCircleIcon,
    BIRTHDAY_OFFER: InformationCircleIcon,
    LOYALTY_REWARD: CheckIcon,
    ACCOUNT_SECURITY: ExclamationTriangleIcon,
    PASSWORD_CHANGED: CheckIcon,
    EMAIL_CHANGED: CheckIcon,
    LOGIN_SUSPICIOUS: ExclamationTriangleIcon,
    ACCOUNT_LOCKED: ExclamationTriangleIcon,
    TWO_FACTOR_ENABLED: CheckIcon,
    NEWSLETTER_WELCOME: InformationCircleIcon,
    REVIEW_REMINDER: InformationCircleIcon,
    ABANDONED_CART_REMINDER: ShoppingCartIcon,
    RESTOCK_NOTIFICATION: CheckIcon,
    SHIPPING_DELAY_ALERT: ExclamationTriangleIcon,
    DELIVERY_ATTEMPT_FAILED: ExclamationTriangleIcon,
    CUSTOMER_SERVICE_FOLLOW_UP: InformationCircleIcon,
  };

  return iconMap[type] || InformationCircleIcon;
};

const getNotificationColor = (type: string, severity: string) => {
  // Override with severity colors for critical notifications
  if (severity === "CRITICAL") {
    return "text-red-600 bg-red-100 border-red-200";
  }
  if (severity === "WARNING") {
    return "text-amber-600 bg-amber-100 border-amber-200";
  }

  const colorMap: Record<string, string> = {
    ORDER_CONFIRMED: "text-green-600 bg-green-100 border-green-200",
    ORDER_DELIVERED: "text-green-600 bg-green-100 border-green-200",
    PAYMENT_PROCESSED: "text-green-600 bg-green-100 border-green-200",
    PASSWORD_CHANGED: "text-green-600 bg-green-100 border-green-200",
    EMAIL_CHANGED: "text-green-600 bg-green-100 border-green-200",
    TWO_FACTOR_ENABLED: "text-green-600 bg-green-100 border-green-200",
    REFUND_PROCESSED: "text-green-600 bg-green-100 border-green-200",
    RETURN_APPROVED: "text-green-600 bg-green-100 border-green-200",
    RETURN_PROCESSED: "text-green-600 bg-green-100 border-green-200",
    WISHLIST_ITEM_BACK_IN_STOCK: "text-green-600 bg-green-100 border-green-200",
    LOYALTY_REWARD: "text-green-600 bg-green-100 border-green-200",
    RESTOCK_NOTIFICATION: "text-green-600 bg-green-100 border-green-200",
    default: "text-blue-600 bg-blue-100 border-blue-200",
  };

  return colorMap[type] || colorMap.default;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 48) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

// Filter component
interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function FilterDropdown({ value, onChange, options }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <FunnelIcon className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700">
          {options.find((opt) => opt.value === value)?.label || "All Types"}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg cursor-pointer"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Skeleton loading component
function NotificationSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalNotifications: 0,
    unreadCount: 0,
    todayCount: 0,
    criticalCount: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Filter options
  const filterOptions = [
    { value: "all", label: "All Types" },
    { value: "ORDER_CONFIRMED", label: "Order Updates" },
    { value: "PAYMENT_PROCESSED", label: "Payments" },
    { value: "WISHLIST_ITEM_BACK_IN_STOCK", label: "Wishlist" },
    { value: "PROMOTIONAL_OFFER", label: "Promotions" },
    { value: "ACCOUNT_SECURITY", label: "Security" },
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Load notifications
  const loadNotifications = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(showUnreadOnly && { unreadOnly: "true" }),
        ...(filterType !== "all" && { type: filterType }),
      });

      const response = await fetch(`/api/notifications?${params}`);

      if (!response.ok) {
        throw new Error("Failed to load notifications");
      }

      const data: NotificationsResponse = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        throw new Error("Failed to load notifications");
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (session?.user) {
      loadNotifications();
    }
  }, [session, filterType, showUnreadOnly]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId,
          markAllRead: false,
        }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setStats((prev) => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAllRead: true,
        }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        );
        setStats((prev) => ({ ...prev, unreadCount: 0 }));
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    loadNotifications(newPage);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BellIconSolid className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>
          <p className="text-gray-600">
            Stay updated with your orders, payments, and account activity
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalNotifications}
                </p>
              </div>
              <BellIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.unreadCount}
                </p>
              </div>
              <EyeSlashIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.todayCount}
                </p>
              </div>
              <CheckIcon className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.criticalCount}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <FilterDropdown
                value={filterType}
                onChange={setFilterType}
                options={filterOptions}
              />

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Unread only</span>
              </label>
            </div>

            {stats.unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <EyeIcon className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <XCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Notifications
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => loadNotifications()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Notifications
            </h3>
            <p className="text-gray-600">
              {showUnreadOnly
                ? "No unread notifications found"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColor(
                notification.type,
                notification.severity
              );

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    notification.isRead
                      ? "border-gray-200"
                      : "border-blue-200 bg-blue-50/30"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${colorClasses}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3
                              className={`text-sm font-semibold ${
                                notification.isRead
                                  ? "text-gray-700"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {notification.severity === "CRITICAL" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Critical
                              </span>
                            )}
                            {notification.severity === "WARNING" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                Warning
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-sm mt-1 ${
                              notification.isRead
                                ? "text-gray-500"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.message}
                          </p>

                          {/* Order/Product info if available */}
                          {notification.order && (
                            <div className="flex items-center space-x-2 mt-2 p-2 bg-gray-50 rounded text-xs">
                              <ShoppingCartIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Order #
                                {notification.order.id.slice(-8).toUpperCase()}
                              </span>
                              {notification.order.productName && (
                                <span className="text-gray-400">
                                  • {notification.order.productName}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-400">
                              {formatDate(notification.createdAt)}
                            </span>

                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.totalCount
              )}{" "}
              of {pagination.totalCount} notifications
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                )
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm border rounded-lg cursor-pointer ${
                        page === pagination.page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
