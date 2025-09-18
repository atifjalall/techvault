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
  UserIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/buttonSidebar";
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
  type: "order" | "product" | "system" | "payment";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Skeleton Loading Component
const NotificationSkeleton = () => (
  <div className="px-4 py-3 border-b border-gray-100 animate-pulse">
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-2 h-2 bg-gray-200 rounded-full flex-shrink-0"></div>
    </div>
  </div>
);

// Generate breadcrumbs from pathname
const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ name: "Dashboard", href: "/vendor/dashboard" }];

  if (segments.length > 2) {
    const currentPage = segments[segments.length - 1];
    const parentPage = segments[segments.length - 2];

    // Add parent if it's not dashboard
    if (parentPage !== "dashboard") {
      breadcrumbs.push({
        name: parentPage.charAt(0).toUpperCase() + parentPage.slice(1),
        href: `/vendor/${parentPage}`,
      });
    }

    // Add current page
    if (currentPage !== "dashboard") {
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
};

// Mock notification data - replace with actual API call
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "New Order Received",
    message: "Order #12345 has been placed by John Doe",
    isRead: false,
    createdAt: "2025-01-15T10:30:00Z",
    actionUrl: "/vendor/orders/12345",
  },
  {
    id: "2",
    type: "product",
    title: "Low Stock Alert",
    message: "iPhone 15 Pro is running low on stock (3 remaining)",
    isRead: false,
    createdAt: "2025-01-15T09:15:00Z",
    actionUrl: "/vendor/products",
  },
  {
    id: "3",
    type: "payment",
    title: "Payment Received",
    message: "Payment of €899.99 has been processed successfully",
    isRead: true,
    createdAt: "2025-01-14T16:45:00Z",
  },
  {
    id: "4",
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur tonight from 2-4 AM",
    isRead: true,
    createdAt: "2025-01-14T12:00:00Z",
  },
];

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

  const defaultBreadcrumbs = generateBreadcrumbs(pathname);
  const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoadingNotifications(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNotifications(mockNotifications);
      setIsLoadingNotifications(false);
    };

    if (notificationOpen) {
      fetchNotifications();
    }
  }, [notificationOpen]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBagIcon className="h-5 w-5 text-blue-500" />;
      case "product":
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case "payment":
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case "system":
        return <InformationCircleIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    // Here you would make an API call to mark as read
  };

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
    // Here you would make an API call to mark all as read
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 hover:bg-gray-100"
              onClick={onMobileMenuToggle}
            >
              <Bars3Icon className="h-5 w-5" />
            </Button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center space-x-1 text-sm">
              {finalBreadcrumbs.map((crumb, index) => (
                <div key={crumb.name} className="flex items-center">
                  {index > 0 && (
                    <ChevronDownIcon className="h-3 w-3 text-gray-400 mx-2 rotate-[-90deg]" />
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-gray-500 hover:text-gray-900 transition-colors"
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

            {/* Page title for mobile */}
            <div className="sm:hidden">
              <h1 className="text-lg font-semibold text-gray-900">
                {title || finalBreadcrumbs[finalBreadcrumbs.length - 1]?.name}
              </h1>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <DropdownMenu
              open={notificationOpen}
              onOpenChange={setNotificationOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2 hover:bg-gray-100 rounded-lg"
                >
                  <BellIcon className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-80 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-0 max-h-96 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <BellIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 p-1"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-64 overflow-y-auto">
                  {isLoadingNotifications ? (
                    // Skeleton loading
                    Array.from({ length: 3 }).map((_, i) => (
                      <NotificationSkeleton key={i} />
                    ))
                  ) : notifications.length === 0 ? (
                    // Empty state
                    <div className="p-8 text-center">
                      <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    // Notifications
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.isRead ? "bg-blue-50" : ""
                        }`}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id);
                          }
                          if (notification.actionUrl) {
                            // Navigate to action URL
                            window.location.href = notification.actionUrl;
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium ${
                                !notification.isRead
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <Link
                      href="/vendor/notifications"
                      className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all notifications
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
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session?.user?.image || ""}
                      alt={session?.user?.name || ""}
                    />
                    <AvatarFallback className="bg-black text-white text-sm">
                      {getUserInitials(session?.user?.name || "V")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 max-w-20 truncate">
                      {session?.user?.name?.split(" ")[0] || "Vendor"}
                    </p>
                    <p className="text-xs text-gray-500">Vendor</p>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-1"
              >
                {/* User info header */}
                <DropdownMenuLabel className="p-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt={session?.user?.name || ""}
                      />
                      <AvatarFallback className="bg-black text-white">
                        {getUserInitials(session?.user?.name || "V")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {session?.user?.name || "Vendor"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session?.user?.email}
                      </p>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-xs bg-green-100 text-green-800"
                      >
                        Vendor Account
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>

                {/* Quick actions */}
                <div className="p-1">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <HomeIcon className="h-4 w-4 mr-3 text-gray-400" />
                      Visit Store
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/vendor/settings"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-400" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="mx-1 my-1" />

                {/* Sign out */}
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-red-500" />
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
