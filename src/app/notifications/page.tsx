/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
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
  FunnelIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/Button1";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/layout/Footer";

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
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center space-x-2 text-sm bg-white border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <FunnelIcon className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700">
          {options.find((opt) => opt.value === value)?.label || "All Types"}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                  value === option.value
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Skeleton loading component
function NotificationSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex space-x-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-2 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

// Enhanced skeleton for the full page
function NotificationsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4">
        {/* Breadcrumb Skeleton */}
        <div className="pt-8 px-4 pb-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Header Skeleton */}
        <div className="mb-8 px-4">
          <div className="flex items-center space-x-3 mb-2">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-8 w-40" />
          </div>
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-8" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="px-4">
          <Card className="p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-9 w-32" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </Card>
        </div>

        {/* Notifications List Skeleton */}
        <div className="px-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
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
  const loadNotifications = useCallback(
    async (page = 1) => {
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
    },
    [pagination.limit, showUnreadOnly, filterType]
  );

  // Initial load
  useEffect(() => {
    if (session?.user) {
      loadNotifications();
    }
  }, [session, filterType, showUnreadOnly, loadNotifications]);

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
    return <NotificationsPageSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="pt-8 px-4 pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Notifications</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8 px-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BellIconSolid className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Stay updated with your orders, payments, and account activity
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 px-4">
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalNotifications}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <BellIcon className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Unread</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.unreadCount}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <EyeSlashIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.todayCount}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Critical
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.criticalCount}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="px-4">
          <Card className="p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 select-none">
                    Unread only
                  </span>
                </label>
              </div>

              {stats.unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>Mark all as read</span>
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="px-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <XCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error Loading Notifications
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => loadNotifications()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
            </Card>
          ) : notifications.length === 0 ? (
            <Card className="p-8 text-center">
              <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Notifications
              </h3>
              <p className="text-gray-600">
                {showUnreadOnly
                  ? "No unread notifications found"
                  : "You don't have any notifications yet"}
              </p>
            </Card>
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
                    className="cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Card
                      className={`p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
                        notification.isRead
                          ? "bg-white border-gray-200"
                          : "bg-gradient-to-r from-blue-50 to-white border-blue-200 shadow-sm"
                      }`}
                    >
                      <div className="flex space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${colorClasses}`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <h3
                                className={`text-base font-semibold ${
                                  notification.isRead
                                    ? "text-gray-700"
                                    : "text-gray-900"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              {notification.severity === "CRITICAL" && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  Critical
                                </span>
                              )}
                              {notification.severity === "WARNING" && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                  Warning
                                </span>
                              )}
                            </div>
                            {!notification.isRead && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>

                          <p
                            className={`text-sm leading-relaxed ${
                              notification.isRead
                                ? "text-gray-600"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.message}
                          </p>

                          {/* Order/Product info if available */}
                          {notification.order && (
                            <div className="flex items-center space-x-2 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="p-1 bg-gray-200 rounded">
                                <ShoppingCartIcon className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">
                                  Order #
                                  {notification.order.id
                                    .slice(-8)
                                    .toUpperCase()}
                                </span>
                                {notification.order.productName && (
                                  <span className="text-gray-500 ml-2">
                                    • {notification.order.productName}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500 font-medium">
                              {formatDate(notification.createdAt)}
                            </span>
                            {notification.actionUrl && (
                              <span className="text-xs text-blue-600 font-medium">
                                Click to view →
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4">
              <Card className="p-6 mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.totalCount
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{pagination.totalCount}</span>{" "}
                    notifications
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      variant="outline"
                      size="sm"
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </Button>

                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.page - 1 &&
                            page <= pagination.page + 1)
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <Button
                            onClick={() => handlePageChange(page)}
                            variant={
                              page === pagination.page ? "default" : "outline"
                            }
                            size="sm"
                            className={
                              page === pagination.page
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : ""
                            }
                          >
                            {page}
                          </Button>
                        </div>
                      ))}

                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      variant="outline"
                      size="sm"
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
