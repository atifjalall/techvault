/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";
import { getUserInitials } from "@/lib/utils";

const categories = [
  {
    name: "Electronics",
    href: "/electronics",
    subcategories: [
      "Smartphones",
      "Laptops",
      "Tablets",
      "Audio",
      "Gaming",
      "Smart Home",
    ],
  },
  {
    name: "Audio",
    href: "/audio",
    subcategories: [
      "Headphones",
      "Speakers",
      "Earbuds",
      "Sound Systems",
      "Microphones",
    ],
  },
  {
    name: "Computing",
    href: "/computing",
    subcategories: [
      "Laptops",
      "Desktops",
      "Monitors",
      "Keyboards",
      "Accessories",
    ],
  },
  {
    name: "Gaming",
    href: "/gaming",
    subcategories: [
      "Consoles",
      "Controllers",
      "Gaming PCs",
      "VR Headsets",
      "Accessories",
    ],
  },
];

// Notification interfaces
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}

// Helper functions for notification icons and colors
const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    // Order related
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

    // Payment
    PAYMENT_PROCESSING: InformationCircleIcon,
    PAYMENT_PROCESSED: CheckIcon,
    PAYMENT_FAILED: ExclamationTriangleIcon,
    PAYMENT_REFUNDED: InformationCircleIcon,
    REFUND_PROCESSED: CheckIcon,
    RETURN_APPROVED: CheckIcon,
    RETURN_RECEIVED: InformationCircleIcon,
    RETURN_PROCESSED: CheckIcon,

    // Wishlist
    WISHLIST_ITEM_BACK_IN_STOCK: CheckIcon,
    WISHLIST_ITEM_PRICE_DROP: InformationCircleIcon,
    WISHLIST_ITEM_LOW_STOCK: ExclamationTriangleIcon,

    // Promotions
    PRICE_DROP_ALERT: InformationCircleIcon,
    PROMOTIONAL_OFFER: InformationCircleIcon,
    FLASH_SALE_ALERT: InformationCircleIcon,
    DISCOUNT_EXPIRING: ExclamationTriangleIcon,
    NEW_ARRIVAL_ALERT: InformationCircleIcon,
    BIRTHDAY_OFFER: InformationCircleIcon,
    LOYALTY_REWARD: CheckIcon,

    // Security
    ACCOUNT_SECURITY: ExclamationTriangleIcon,
    PASSWORD_CHANGED: CheckIcon,
    EMAIL_CHANGED: CheckIcon,
    LOGIN_SUSPICIOUS: ExclamationTriangleIcon,
    ACCOUNT_LOCKED: ExclamationTriangleIcon,
    TWO_FACTOR_ENABLED: CheckIcon,

    // Engagement
    NEWSLETTER_WELCOME: InformationCircleIcon,
    REVIEW_REMINDER: InformationCircleIcon,
    ABANDONED_CART_REMINDER: ShoppingCartIcon,
    RESTOCK_NOTIFICATION: CheckIcon,
    SHIPPING_DELAY_ALERT: ExclamationTriangleIcon,
    DELIVERY_ATTEMPT_FAILED: ExclamationTriangleIcon,
    CUSTOMER_SERVICE_FOLLOW_UP: InformationCircleIcon,

    // Vendor notifications
    LOW_STOCK: ExclamationTriangleIcon,
    NEW_ORDER: ShoppingCartIcon,
    NEW_REVIEW: InformationCircleIcon,
    SYSTEM_ALERT: ExclamationTriangleIcon,
    PRODUCT_APPROVED: CheckIcon,
    PRODUCT_REJECTED: ExclamationTriangleIcon,
    PAYOUT_PROCESSED: CheckIcon,
    PAYOUT_FAILED: ExclamationTriangleIcon,
    VENDOR_VERIFICATION_REQUIRED: ExclamationTriangleIcon,
    VENDOR_ACCOUNT_SUSPENDED: ExclamationTriangleIcon,
    VENDOR_ACCOUNT_APPROVED: CheckIcon,
    SALES_MILESTONE: CheckIcon,
    REVENUE_THRESHOLD_REACHED: CheckIcon,
    INVENTORY_WARNING: ExclamationTriangleIcon,
    COMPETITOR_PRICE_ALERT: InformationCircleIcon,
    SEASONAL_DEMAND_FORECAST: InformationCircleIcon,
  };

  return iconMap[type] || InformationCircleIcon;
};

const getNotificationColor = (type: string) => {
  const colorMap: Record<string, string> = {
    // Success states (green)
    ORDER_CONFIRMED: "text-green-600 bg-green-100",
    ORDER_DELIVERED: "text-green-600 bg-green-100",
    PAYMENT_PROCESSED: "text-green-600 bg-green-100",
    PASSWORD_CHANGED: "text-green-600 bg-green-100",
    EMAIL_CHANGED: "text-green-600 bg-green-100",
    TWO_FACTOR_ENABLED: "text-green-600 bg-green-100",
    REFUND_PROCESSED: "text-green-600 bg-green-100",
    RETURN_APPROVED: "text-green-600 bg-green-100",
    RETURN_PROCESSED: "text-green-600 bg-green-100",
    WISHLIST_ITEM_BACK_IN_STOCK: "text-green-600 bg-green-100",
    LOYALTY_REWARD: "text-green-600 bg-green-100",
    RESTOCK_NOTIFICATION: "text-green-600 bg-green-100",
    PRODUCT_APPROVED: "text-green-600 bg-green-100",
    PAYOUT_PROCESSED: "text-green-600 bg-green-100",
    VENDOR_ACCOUNT_APPROVED: "text-green-600 bg-green-100",
    SALES_MILESTONE: "text-green-600 bg-green-100",
    REVENUE_THRESHOLD_REACHED: "text-green-600 bg-green-100",

    // Warning states (amber)
    ORDER_CANCELLED: "text-amber-600 bg-amber-100",
    ORDER_REFUNDED: "text-amber-600 bg-amber-100",
    ORDER_RETURNED: "text-amber-600 bg-amber-100",
    WISHLIST_ITEM_LOW_STOCK: "text-amber-600 bg-amber-100",
    DISCOUNT_EXPIRING: "text-amber-600 bg-amber-100",
    LOW_STOCK: "text-amber-600 bg-amber-100",
    SHIPPING_DELAY_ALERT: "text-amber-600 bg-amber-100",
    DELIVERY_ATTEMPT_FAILED: "text-amber-600 bg-amber-100",
    INVENTORY_WARNING: "text-amber-600 bg-amber-100",
    VENDOR_VERIFICATION_REQUIRED: "text-amber-600 bg-amber-100",

    // Error states (red)
    PAYMENT_FAILED: "text-red-600 bg-red-100",
    ACCOUNT_SECURITY: "text-red-600 bg-red-100",
    LOGIN_SUSPICIOUS: "text-red-600 bg-red-100",
    ACCOUNT_LOCKED: "text-red-600 bg-red-100",
    PRODUCT_REJECTED: "text-red-600 bg-red-100",
    PAYOUT_FAILED: "text-red-600 bg-red-100",
    VENDOR_ACCOUNT_SUSPENDED: "text-red-600 bg-red-100",

    // Order process states (blue)
    ORDER_PROCESSING: "text-blue-600 bg-blue-100",
    ORDER_PACKED: "text-blue-600 bg-blue-100",
    ORDER_SHIPPED: "text-blue-600 bg-blue-100",
    ORDER_OUT_FOR_DELIVERY: "text-blue-600 bg-blue-100",
    ORDER_UPDATED: "text-blue-600 bg-blue-100",
    PAYMENT_PROCESSING: "text-blue-600 bg-blue-100",
    NEW_ORDER: "text-blue-600 bg-blue-100",

    // Info states (default blue)
    default: "text-blue-600 bg-blue-100",
  };

  return colorMap[type] || colorMap.default;
};

// Customer Notifications Component
interface NotificationsDropdownProps {
  onClose: () => void;
  onNotificationUpdate?: () => void;
}

function NotificationsDropdown({
  onClose,
  onNotificationUpdate,
}: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/notifications");

        if (response.ok) {
          const data: NotificationsResponse = await response.json();
          if (data.success) {
            setNotifications(data.notifications || []);
          }
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

    loadNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: notificationId,
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
        // Notify parent component to update badge count
        onNotificationUpdate?.();
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
        // Notify parent component to update badge count
        onNotificationUpdate?.();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 origin-top-right bg-white rounded-lg shadow-xl border border-gray-200 z-20">
      {/* Arrow pointer */}
      <div className="absolute -top-1 right-4 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          // Loading skeleton
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="p-6 text-center">
            <XCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          // Empty state
          <div className="p-6 text-center">
            <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              We&apos;ll notify you about order updates and special offers
            </p>
          </div>
        ) : (
          // Notifications list
          <div className="py-2">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColor(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                    notification.isRead
                      ? "border-transparent"
                      : "border-blue-500 bg-blue-50/30"
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                    onClose();
                  }}
                >
                  <div className="flex space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              notification.isRead
                                ? "text-gray-600"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              notification.isRead
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <Link
            href="/notifications"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            onClick={onClose}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

interface ProfileDropdownProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  onSignOut: () => void;
}

function ProfileDropdown({ user, onSignOut }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Define menu item type
  interface MenuItem {
    name: string;
    href: string;
    icon: React.ElementType;
    description: string;
    isVendor?: boolean;
  }

  // Simplified profile menu items (removed cart and wishlist)
  const baseProfileMenuItems: MenuItem[] = [
    {
      name: "My Profile",
      href: "/profile",
      icon: UserIcon,
      description: "Manage your account",
    },
    {
      name: "My Orders",
      href: "/orders",
      icon: ShoppingCartIcon,
      description: "Track your purchases",
    },
  ];

  // Add vendor dashboard if user is a vendor
  const profileMenuItems: MenuItem[] =
    user.role === "VENDOR"
      ? [
          {
            name: "Vendor Dashboard",
            href: "/vendor/dashboard",
            icon: BuildingStorefrontIcon,
            description: "Manage your store",
            isVendor: true,
          },
          ...baseProfileMenuItems,
        ]
      : baseProfileMenuItems;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/20 cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Profile Image */}
        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white/20 border border-white/30">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "Profile"}
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800/80 text-white text-xs font-semibold">
              {getUserInitials(user.name || "User")}
            </div>
          )}
        </div>

        {/* Desktop: Show name and chevron */}
        <div className="hidden md:flex items-center space-x-1">
          <span className="text-xs font-medium text-slate-700 max-w-16 truncate">
            {user.name?.split(" ")[0] || "User"}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="h-3 w-3 text-slate-500" />
          </motion.div>
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-52 origin-top-right bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20"
          >
            {/* Arrow pointer */}
            <div className="absolute -top-1 right-4 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>

            {/* User Info Header */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="flex items-center space-x-1.5">
                <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Profile"}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-xs font-semibold">
                      {getUserInitials(user.name || "User")}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-slate-600 truncate">
                    {user.email}
                  </p>
                  {user.role === "VENDOR" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      Vendor
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {profileMenuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center mx-1 px-2 py-2 text-xs transition-all duration-150 rounded-md cursor-pointer ${
                    item.isVendor
                      ? "text-blue-700 hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100 mb-1"
                      : "text-slate-700 hover:bg-gray-50 hover:text-slate-900"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center mr-2 transition-colors ${
                      item.isVendor
                        ? "bg-blue-100 group-hover:bg-blue-200"
                        : "bg-gray-100 group-hover:bg-gray-200"
                    }`}
                  >
                    <item.icon
                      className={`w-3 h-3 transition-colors ${
                        item.isVendor
                          ? "text-blue-600 group-hover:text-blue-700"
                          : "text-slate-600 group-hover:text-slate-700"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-xs">{item.name}</div>
                    <div className="text-xs text-slate-500">
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-100 pt-1 mx-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="group w-full flex items-center px-2 py-2 text-xs text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all duration-150 rounded-md cursor-pointer"
              >
                <div className="w-4 h-4 bg-gray-100 rounded-md flex items-center justify-center mr-2 group-hover:bg-red-100 transition-colors">
                  <ArrowRightOnRectangleIcon className="w-3 h-3 text-slate-600 group-hover:text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-xs">Sign Out</div>
                  <div className="text-xs text-slate-500">
                    Sign out of your account
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Smart Badge Component for Cart/Wishlist/Notifications counters
interface SmartBadgeProps {
  count: number;
}

function SmartBadge({ count }: SmartBadgeProps) {
  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
      {count > 9 ? "9+" : count}
    </span>
  );
}

// Notification Button Component
function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Load unread count
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications?unreadOnly=true");
        if (response.ok) {
          const data: NotificationsResponse = await response.json();
          if (data.success) {
            setUnreadCount(data.unreadCount || 0);
          }
        }
      } catch (error) {
        console.error("Error loading notification count:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUnreadCount();

    // Refresh count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update count when notifications are marked as read
  useEffect(() => {
    const handleNotificationRead = () => {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleAllNotificationsRead = () => {
      setUnreadCount(0);
    };

    window.addEventListener("notificationRead", handleNotificationRead);
    window.addEventListener("allNotificationsRead", handleAllNotificationsRead);

    return () => {
      window.removeEventListener("notificationRead", handleNotificationRead);
      window.removeEventListener(
        "allNotificationsRead",
        handleAllNotificationsRead
      );
    };
  }, []);

  if (loading) {
    // Skeleton
    return (
      <div className="w-8 h-8 rounded-full backdrop-blur-md bg-white/10 border border-white/20 animate-pulse"></div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-700 hover:text-slate-900 p-1.5 relative transition-colors backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-full border border-white/20 cursor-pointer"
        aria-label="View notifications"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="h-4 w-4 text-slate-700" />
        ) : (
          <BellIcon className="h-4 w-4" />
        )}
        <SmartBadge count={unreadCount} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="z-20"
          >
            <NotificationsDropdown
              onClose={() => setIsOpen(false)}
              onNotificationUpdate={() => {
                // Reload unread count when notifications are updated
                const loadUnreadCount = async () => {
                  try {
                    const response = await fetch(
                      "/api/notifications?unreadOnly=true"
                    );
                    if (response.ok) {
                      const data: NotificationsResponse = await response.json();
                      if (data.success) {
                        setUnreadCount(data.unreadCount || 0);
                      }
                    }
                  } catch (error) {
                    console.error("Error loading notification count:", error);
                  }
                };
                loadUnreadCount();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fixed position skeleton components to prevent layout shift
function NavActionsSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      {/* Notifications Skeleton */}
      <div className="w-8 h-8 rounded-full backdrop-blur-md bg-white/10 border border-white/20 animate-pulse"></div>

      {/* Wishlist Skeleton */}
      <div className="w-8 h-8 rounded-full backdrop-blur-md bg-white/10 border border-white/20 animate-pulse"></div>

      {/* Cart Skeleton */}
      <div className="w-8 h-8 rounded-full backdrop-blur-md bg-white/10 border border-white/20 animate-pulse"></div>

      {/* Profile Skeleton */}
      <div className="flex items-center space-x-1 p-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
        <div className="w-7 h-7 rounded-full bg-white/20 animate-pulse"></div>
        <div className="hidden md:flex items-center space-x-1">
          <div className="w-10 h-3 bg-white/20 rounded animate-pulse"></div>
          <div className="w-3 h-3 bg-white/20 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Real cart and wishlist state management
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const [countsLoading, setCountsLoading] = useState(true);

  // Load cart and wishlist counts
  useEffect(() => {
    const loadCounts = async () => {
      if (!session?.user) {
        setCartItemCount(0);
        setWishlistItemCount(0);
        setCountsLoading(false);
        return;
      }

      try {
        setCountsLoading(true);

        // Load cart count
        const cartResponse = await fetch("/api/cart");
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          if (cartData.success) {
            setCartItemCount(cartData.count || 0);
          }
        }

        // Load wishlist count
        const wishlistResponse = await fetch("/api/wishlist");
        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          if (wishlistData.success) {
            setWishlistItemCount(wishlistData.items?.length || 0);
          }
        }
      } catch (error) {
        console.error("Error loading cart/wishlist counts:", error);
      } finally {
        setCountsLoading(false);
      }
    };

    loadCounts();
  }, [session]);

  // Listen for cart/wishlist updates
  useEffect(() => {
    const handleCartUpdate = () => {
      // Reload cart count when cart is updated
      if (session?.user) {
        fetch("/api/cart")
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setCartItemCount(data.count || 0);
            }
          })
          .catch((error) => console.error("Error updating cart count:", error));
      }
    };

    const handleWishlistUpdate = () => {
      // Reload wishlist count when wishlist is updated
      if (session?.user) {
        fetch("/api/wishlist")
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setWishlistItemCount(data.items?.length || 0);
            }
          })
          .catch((error) =>
            console.error("Error updating wishlist count:", error)
          );
      }
    };

    // Listen for custom events
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, [session]);

  if (
    session?.user &&
    "role" in session.user &&
    session.user.role === "VENDOR"
  ) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="backdrop-blur-xl bg-white/70 border-b border-white/50 sticky top-0 z-50">
      <div className="w-full px-3 sm:px-4">
        <div className="flex items-center justify-between h-12">
          {/* Left side - Logo and Categories */}
          <div className="flex items-center space-x-8">
            {/* Logo - Always on the far left */}
            <Link
              href="/"
              className="text-lg font-bold text-slate-900 flex-shrink-0"
            >
              TechVault
            </Link>

            {/* Desktop Navigation - Categories */}
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-3">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="relative group"
                    onMouseEnter={() => setHoveredCategory(category.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link
                      href={`/products?category=${encodeURIComponent(category.name)}`}
                      className="text-slate-700 hover:text-slate-900 px-2 py-1 text-xs font-medium flex items-center transition-colors duration-200 cursor-pointer"
                    >
                      {category.name}
                      <motion.div
                        animate={{
                          rotate: hoveredCategory === category.name ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDownIcon className="ml-1 h-3 w-3" />
                      </motion.div>
                    </Link>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {hoveredCategory === category.name && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute left-0 mt-1 w-44 origin-top z-50"
                        >
                          {/* Arrow pointer */}
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>

                          <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-1 mt-1">
                            <div className="px-2 py-1 border-b border-gray-100">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                {category.name}
                              </p>
                            </div>
                            <div className="py-1">
                              {category.subcategories.map((subcategory) => (
                                <Link
                                  key={subcategory}
                                  href={`/products?category=${encodeURIComponent(subcategory)}`}
                                  className="group flex items-center mx-1 px-2 py-1.5 text-xs text-slate-700 hover:bg-gray-50 hover:text-slate-900 transition-colors duration-150 rounded-md cursor-pointer"
                                >
                                  {/* Icon placeholder */}
                                  <div className="w-4 h-4 bg-gray-100 rounded-md flex items-center justify-center mr-2 group-hover:bg-gray-200 transition-colors">
                                    <div className="w-2 h-2 bg-slate-400 rounded group-hover:bg-slate-500"></div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-xs">
                                      {subcategory}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Explore {subcategory.toLowerCase()}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>

                            {/* View All Link */}
                            <div className="border-t border-gray-100 mt-1 pt-1">
                              <Link
                                href={`/products?category=${encodeURIComponent(category.name)}`}
                                className="flex items-center justify-center mx-1 px-2 py-1.5 text-xs font-medium text-slate-900 hover:bg-gray-50 transition-colors rounded-md cursor-pointer"
                              >
                                View All {category.name}
                                <svg
                                  className="ml-1 w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden md:block flex-1 max-w-xs mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-8 pr-3 py-1.5 text-xs backdrop-blur-md bg-white/30 border border-gray-200/50 rounded-lg leading-4 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-all duration-200"
                placeholder="Search products..."
              />
            </div>
          </div>

          {/* Right side - Actions and Profile */}
          <div className="flex items-center justify-end space-x-1.5">
            {status === "loading" ? (
              <NavActionsSkeleton />
            ) : (
              <div className="flex items-center space-x-2">
                {/* Authenticated user actions */}
                {session?.user && (
                  <>
                    {/* Notifications Button - Desktop only */}
                    <div className="hidden md:block">
                      <NotificationButton />
                    </div>

                    {/* Wishlist Button - Desktop only */}
                    <Link
                      href="/wishlist"
                      className="text-slate-700 hover:text-slate-900 p-1.5 relative transition-colors backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-full border border-white/20 hidden md:block cursor-pointer"
                    >
                      <HeartIcon className="h-4 w-4" />
                      {!countsLoading && (
                        <SmartBadge count={wishlistItemCount} />
                      )}
                    </Link>

                    {/* Cart Button - Desktop only */}
                    <Link
                      href="/cart"
                      className="text-slate-700 hover:text-slate-900 p-1.5 relative transition-colors backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-full border border-white/20 hidden md:block cursor-pointer"
                    >
                      <ShoppingBagIcon className="h-4 w-4" />
                      {!countsLoading && <SmartBadge count={cartItemCount} />}
                    </Link>
                  </>
                )}

                {/* Auth/Profile Section - Desktop only */}
                <div className="hidden md:block">
                  {session?.user ? (
                    <ProfileDropdown
                      user={{
                        id: session.user.id || "",
                        name: session.user.name,
                        email: session.user.email,
                        image: session.user.image,
                        role: session.user.role,
                      }}
                      onSignOut={handleSignOut}
                    />
                  ) : (
                    <Link
                      href="/signin"
                      className="text-slate-700 hover:text-slate-900 px-2.5 py-1.5 text-xs font-medium backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-200 cursor-pointer"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-700 hover:text-slate-900 p-1.5 backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all duration-200 cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-4 w-4" />
                ) : (
                  <Bars3Icon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 backdrop-blur-xl bg-white/80 border-t border-white/50">
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-9 pr-3 py-2 text-xs backdrop-blur-md bg-white/30 border border-white/30 rounded-lg leading-4 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                    placeholder="Search products..."
                  />
                </div>
              </div>

              {/* Mobile Categories */}
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="text-slate-700 hover:text-slate-900 hover:bg-white/50 block px-3 py-2 text-xs font-medium rounded-lg mx-2 transition-all duration-200 cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}

              {/* Mobile Auth/Profile Actions */}
              <div className="border-t border-white/30 pt-4 pb-3 mx-2">
                {session?.user ? (
                  <div className="px-3 space-y-3">
                    {/* Mobile Profile Info */}
                    <div className="flex items-center space-x-3 mb-4 p-3 backdrop-blur-md bg-white/30 rounded-lg border border-white/30">
                      <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white/20 border border-white/30">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "Profile"}
                            width={28}
                            height={28}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800/80 text-white text-xs font-semibold">
                            {getUserInitials(session.user.name || "User")}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {session.user.email}
                        </p>
                        {session.user.role === "VENDOR" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            Vendor
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mobile Profile Links */}
                    <div className="space-y-1">
                      {/* Vendor Dashboard for mobile */}
                      {session.user.role === "VENDOR" && (
                        <Link
                          href="/vendor/dashboard"
                          className="flex items-center px-3 py-2 text-xs text-blue-700 hover:bg-blue-100/50 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <BuildingStorefrontIcon className="w-4 h-4 mr-2" />
                          Vendor Dashboard
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-xs text-slate-700 hover:bg-white/50 rounded-lg transition-all duration-200 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-3 py-2 text-xs text-slate-700 hover:bg-white/50 rounded-lg transition-all duration-200 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/notifications"
                        className="block px-3 py-2 text-xs text-slate-700 hover:bg-white/50 rounded-lg transition-all duration-200 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Notifications
                      </Link>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleSignOut();
                        }}
                        className="block w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-100/50 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center px-5 space-x-4">
                    <Link
                      href="/signin"
                      className="text-slate-700 hover:text-slate-900 px-3 py-2 text-xs font-medium backdrop-blur-md bg-white/30 hover:bg-white/50 rounded-lg border border-white/30 transition-all duration-200 cursor-pointer"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </div>
                )}

                {/* Mobile Actions (Wishlist, Cart, Notifications) */}
                {session?.user && (
                  <div className="flex items-center px-5 space-x-4 mt-4">
                    <Link
                      href="/notifications"
                      className="text-slate-700 hover:text-slate-900 p-2 relative backdrop-blur-md bg-white/30 hover:bg-white/50 rounded-full border border-white/30 transition-all duration-200 cursor-pointer"
                      aria-label="View notifications"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BellIcon className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/wishlist"
                      className="text-slate-700 hover:text-slate-900 p-2 relative backdrop-blur-md bg-white/30 hover:bg-white/50 rounded-full border border-white/30 transition-all duration-200 cursor-pointer"
                      aria-label="View wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <HeartIcon className="h-4 w-4" />
                      {!countsLoading && (
                        <SmartBadge count={wishlistItemCount} />
                      )}
                    </Link>
                    <Link
                      href="/cart"
                      className="text-slate-700 hover:text-slate-900 p-2 relative backdrop-blur-md bg-white/30 hover:bg-white/50 rounded-full border border-white/30 transition-all duration-200 cursor-pointer"
                      aria-label="View shopping cart"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingBagIcon className="h-4 w-4" />
                      {!countsLoading && <SmartBadge count={cartItemCount} />}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
