"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import {
  BellIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShoppingBagIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VendorTopBarProps {
  onMobileMenuToggle?: () => void;
  title?: string;
  breadcrumbs?: { name: string; href?: string }[];
}

interface Notification {
  id: string;
  type:
    | "NEW_ORDER"
    | "ORDER_UPDATED"
    | "LOW_STOCK"
    | "SYSTEM_ALERT"
    | "NEW_REVIEW";
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  isRead: boolean;
  createdAt: string;
  productId?: string;
  orderId?: string;
}

// Skeleton Loading Component
const NotificationSkeleton = () => (
  <div className="px-3 py-2 border-b border-gray-100 animate-pulse">
    <div className="flex items-start space-x-2">
      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
      <div className="flex-1 min-w-0">
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
        <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-1 h-1 bg-gray-200 rounded-full flex-shrink-0"></div>
    </div>
  </div>
);

// Generate breadcrumbs from pathname with error handling
const generateBreadcrumbs = (pathname: string) => {
  try {
    if (!pathname || typeof pathname !== "string") {
      return [{ name: "Dashboard", href: "/vendor/dashboard" }];
    }

    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "Dashboard", href: "/vendor/dashboard" }];

    if (segments.length > 2) {
      const currentPage = segments[segments.length - 1];
      const parentPage = segments[segments.length - 2];

      // Add parent if it's not dashboard
      if (parentPage && parentPage !== "dashboard") {
        breadcrumbs.push({
          name: parentPage.charAt(0).toUpperCase() + parentPage.slice(1),
          href: `/vendor/${parentPage}`,
        });
      }

      // Add current page
      if (currentPage && currentPage !== "dashboard") {
        breadcrumbs.push({
          name:
            currentPage === "add"
              ? "Add New"
              : currentPage.charAt(0).toUpperCase() + currentPage.slice(1),
          href: "",
        });
      }
    } else if (segments.length === 2 && segments[1] !== "dashboard") {
      breadcrumbs.push({
        name: segments[1].charAt(0).toUpperCase() + segments[1].slice(1),
        href: "",
      });
    }

    return breadcrumbs;
  } catch (error) {
    console.error("Error generating breadcrumbs:", error);
    return [{ name: "Dashboard", href: "/vendor/dashboard" }];
  }
};

export default function VendorTopBar({
  onMobileMenuToggle,
  title,
  breadcrumbs,
}: VendorTopBarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultBreadcrumbs = generateBreadcrumbs(pathname);
  const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  // Fetch notifications from real API with error handling
  const fetchNotifications = async () => {
    if (!session?.user) return;

    setIsLoadingNotifications(true);
    setError(null);

    try {
      const response = await fetch("/api/vendor/notifications?limit=10");

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          setError(data.error || "Failed to fetch notifications");
          setNotifications([]);
        }
      } else {
        setError("Failed to fetch notifications");
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Network error occurred");
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();

      // Set up periodic refresh every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Fetch when dropdown opens
  useEffect(() => {
    if (notificationOpen && session?.user) {
      fetchNotifications();
    }
  }, [notificationOpen, session]);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserInitials = (name: string) => {
    try {
      if (!name || typeof name !== "string") return "V";

      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    } catch (error) {
      console.error("Error generating user initials:", error);
      return "V";
    }
  };

  const getNotificationIcon = (type: string, severity: string) => {
    const baseClasses = "h-4 w-4";

    try {
      switch (type) {
        case "NEW_ORDER":
          return <ShoppingBagIcon className={`${baseClasses} text-blue-500`} />;
        case "ORDER_UPDATED":
          return <ClockIcon className={`${baseClasses} text-purple-500`} />;
        case "LOW_STOCK":
          return (
            <ExclamationTriangleIcon
              className={`${baseClasses} ${severity === "CRITICAL" ? "text-red-500" : "text-orange-500"}`}
            />
          );
        case "NEW_REVIEW":
          return <CheckIcon className={`${baseClasses} text-green-500`} />;
        case "SYSTEM_ALERT":
          return (
            <InformationCircleIcon
              className={`${baseClasses} text-purple-500`}
            />
          );
        default:
          return <BellIcon className={`${baseClasses} text-gray-500`} />;
      }
    } catch (error) {
      console.error("Error generating notification icon:", error);
      return <BellIcon className={`${baseClasses} text-gray-500`} />;
    }
  };

  const getNotificationTitle = (type: string) => {
    try {
      switch (type) {
        case "NEW_ORDER":
          return "New Order";
        case "ORDER_UPDATED":
          return "Order Update";
        case "LOW_STOCK":
          return "Low Stock";
        case "NEW_REVIEW":
          return "New Review";
        case "SYSTEM_ALERT":
          return "System Alert";
        default:
          return "Notification";
      }
    } catch (error) {
      console.error("Error generating notification title:", error);
      return "Notification";
    }
  };

  const getActionUrl = (notification: Notification) => {
    try {
      switch (notification.type) {
        case "NEW_ORDER":
        case "ORDER_UPDATED":
          return notification.orderId ? `/vendor/orders` : "/vendor/orders";
        case "LOW_STOCK":
          return notification.productId
            ? `/vendor/products`
            : "/vendor/products";
        case "NEW_REVIEW":
          return notification.productId
            ? `/vendor/products`
            : "/vendor/products";
        default:
          return "/vendor/notifications";
      }
    } catch (error) {
      console.error("Error generating action URL:", error);
      return "/vendor/notifications";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      if (!dateString) return "Unknown";

      const now = new Date();
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return "Unknown";
      }

      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } catch (error) {
      console.error("Error formatting time ago:", error);
      return "Unknown";
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      if (!notificationId) return;

      const response = await fetch("/api/vendor/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      if (unreadNotifications.length === 0) return;

      const response = await fetch("/api/vendor/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Safe calculation of unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-10 lg:h-12">
          {/* Left section */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-1 hover:bg-gray-100 cursor-pointer"
              onClick={onMobileMenuToggle}
            >
              <Bars3Icon className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>

            {/* Breadcrumbs - Mobile ultra-compact */}
            <nav className="hidden lg:flex items-center space-x-1 text-xs">
              {finalBreadcrumbs.map((crumb, index) => (
                <div
                  key={`${crumb.name}-${index}`}
                  className="flex items-center"
                >
                  {index > 0 && (
                    <ChevronDownIcon className="h-2.5 w-2.5 text-gray-400 mx-1.5 rotate-[-90deg]" />
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="text-gray-900 font-medium">
                      {crumb.name}
                    </span>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile breadcrumbs - Ultra compact */}
            <nav className="flex lg:hidden items-center space-x-1 text-[10px]">
              {finalBreadcrumbs.slice(-2).map((crumb, index) => (
                <div
                  key={`${crumb.name}-${index}`}
                  className="flex items-center"
                >
                  {index > 0 && (
                    <ChevronDownIcon className="h-2 w-2 text-gray-400 mx-1 rotate-[-90deg]" />
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer truncate max-w-20"
                    >
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="text-gray-900 font-medium truncate max-w-20">
                      {crumb.name}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <DropdownMenu
              open={notificationOpen}
              onOpenChange={setNotificationOpen}
            >
              <DropdownMenuTrigger asChild>
                <button className="relative inline-flex items-center justify-center p-1.5 lg:p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
                  <BellIcon className="h-4 w-4 lg:h-6 lg:w-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] lg:h-5 lg:min-w-[20px] px-1 lg:px-1.5 bg-red-500 text-white text-[8px] lg:text-[11px] font-bold flex items-center justify-center rounded-full shadow-md"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.div>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-72 lg:w-80 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-0 max-h-80 lg:max-h-96 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-2 lg:p-3 border-b border-gray-100">
                  <div className="flex items-center space-x-1.5 lg:space-x-2">
                    <BellIcon className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                    <h3 className="text-xs lg:text-sm font-semibold text-gray-900">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center px-1.5 lg:px-2 py-0.5 bg-red-100 text-red-800 text-[8px] lg:text-[10px] font-medium rounded-md h-5">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-[8px] lg:text-xs text-blue-600 hover:text-blue-700 p-1 cursor-pointer"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-60 lg:max-h-72 overflow-y-auto">
                  {isLoadingNotifications ? (
                    // Skeleton loading - safe array creation
                    Array.from({ length: 3 }).map((_, i) => (
                      <NotificationSkeleton key={`skeleton-${i}`} />
                    ))
                  ) : error ? (
                    // Error state
                    <div className="p-6 text-center">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-300 mx-auto mb-2" />
                      <p className="text-red-600 text-xs mb-2">{error}</p>
                      <Button
                        onClick={fetchNotifications}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 cursor-pointer"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : !notifications || notifications.length === 0 ? (
                    // Empty state
                    <div className="p-6 text-center">
                      <BellIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-xs">
                        No notifications yet
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        You&apos;ll see order updates and alerts here
                      </p>
                    </div>
                  ) : (
                    // Real notifications
                    <AnimatePresence>
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`px-2 lg:px-3 py-2 lg:py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.isRead ? "bg-blue-50" : ""
                          } ${
                            notification.severity === "CRITICAL"
                              ? "border-l-2 border-l-red-500"
                              : notification.severity === "WARNING"
                                ? "border-l-2 border-l-orange-500"
                                : ""
                          }`}
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsRead(notification.id);
                            }
                            const actionUrl = getActionUrl(notification);
                            if (actionUrl) {
                              setNotificationOpen(false);
                              window.location.href = actionUrl;
                            }
                          }}
                        >
                          <div className="flex items-start space-x-2 lg:space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {getNotificationIcon(
                                notification.type,
                                notification.severity
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p
                                  className={`text-[10px] lg:text-xs font-medium ${
                                    !notification.isRead
                                      ? "text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {getNotificationTitle(notification.type)}
                                </p>
                                <p className="text-[8px] lg:text-xs text-gray-400 flex-shrink-0 ml-1 lg:ml-2">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                              <p className="text-[9px] lg:text-xs text-gray-600 mt-0.5 lg:mt-1 leading-relaxed">
                                {notification.message}
                              </p>
                              {notification.severity === "CRITICAL" && (
                                <Badge className="mt-1 bg-red-100 text-red-800 text-[8px] lg:text-xs h-5">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            {!notification.isRead && (
                              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-1.5 lg:p-2 border-t border-gray-100 bg-gray-50">
                    <Link
                      href="/vendor/notifications"
                      onClick={() => setNotificationOpen(false)}
                      className="block text-center text-[10px] lg:text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer py-1"
                    >
                      View all notifications →
                    </Link>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 lg:space-x-2 px-1.5 lg:px-2 py-1 lg:py-1.5 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                >
                  <Avatar className="h-5 w-5 lg:h-6 lg:w-6">
                    <AvatarImage
                      src={session?.user?.image || ""}
                      alt={session?.user?.name || ""}
                    />
                    <AvatarFallback className="bg-black text-white text-[8px] lg:text-xs">
                      {getUserInitials(session?.user?.name || "V")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-medium text-gray-900 max-w-16 truncate">
                      {session?.user?.name?.split(" ")[0] || "Vendor"}
                    </p>
                    <p className="text-xs text-gray-500">Vendor</p>
                  </div>
                  <ChevronDownIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48 lg:w-56 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-0.5 lg:p-1"
              >
                {/* User info header */}
                <DropdownMenuLabel className="p-1.5 lg:p-2 border-b border-gray-100">
                  <div className="flex items-center space-x-1.5 lg:space-x-2">
                    <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt={session?.user?.name || ""}
                      />
                      <AvatarFallback className="bg-black text-white text-[8px] lg:text-xs">
                        {getUserInitials(session?.user?.name || "V")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] lg:text-xs font-semibold text-gray-900 truncate">
                        {session?.user?.name || "Vendor"}
                      </p>
                      <p className="text-[8px] lg:text-xs text-gray-500 truncate">
                        {session?.user?.email}
                      </p>
                      <Badge
                        variant="secondary"
                        className="mt-0.5 lg:mt-1 text-[8px] lg:text-xs bg-green-100 text-green-800 h-5"
                      >
                        Vendor Account
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>

                {/* Quick actions */}
                <div className="p-0.5 lg:p-1">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/vendor/settings"
                      className="flex items-center px-1.5 lg:px-2 py-1 lg:py-1.5 text-[10px] lg:text-xs text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                    >
                      <Cog6ToothIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-1.5 lg:mr-2 text-gray-400" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="mx-0.5 lg:mx-1 my-0.5 lg:my-1" />

                {/* Sign out */}
                <div className="p-0.5 lg:p-1">
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center px-1.5 lg:px-2 py-1 lg:py-1.5 text-[10px] lg:text-xs text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                  >
                    <ArrowRightOnRectangleIcon className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-1.5 lg:mr-2 text-red-500" />
                    Sign out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
