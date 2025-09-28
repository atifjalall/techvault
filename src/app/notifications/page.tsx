/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ShoppingCartIcon,
  EyeIcon,
  EyeSlashIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/Button1";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

// Simplified Stats Card Component for customers
function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600">{title}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
            <div
              className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Notification Icon Component (matching vendor style)
function NotificationIcon({ type }: { type: string }) {
  const iconConfig = {
    ORDER_CONFIRMED: {
      icon: ShoppingCartIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    ORDER_PROCESSING: {
      icon: ShoppingCartIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    ORDER_SHIPPED: {
      icon: ShoppingCartIcon,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    PAYMENT_PROCESSED: {
      icon: CheckIcon,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    WISHLIST_ITEM_BACK_IN_STOCK: {
      icon: CheckIcon,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  };

  const config = iconConfig[type as keyof typeof iconConfig] || {
    icon: BellIcon,
    color: "text-gray-600",
    bg: "bg-gray-50",
  };
  const IconComponent = config.icon;

  return (
    <div
      className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center`}
    >
      <IconComponent className={`h-4 w-4 ${config.color}`} />
    </div>
  );
}

// Priority Badge Component
function SeverityBadge({ severity }: { severity: string }) {
  const variants = {
    CRITICAL: {
      className: "bg-red-100 text-red-700 border-red-200",
      label: "Critical",
    },
    WARNING: {
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      label: "Warning",
    },
    INFO: {
      className: "bg-gray-100 text-gray-700 border-gray-200",
      label: "Info",
    },
  };

  const config = variants[severity as keyof typeof variants];
  if (!config) return null;

  return (
    <Badge className={`text-xs px-2 py-0.5 ${config.className}`}>
      {config.label}
    </Badge>
  );
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours}h ago`;
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

// Loading Skeletons (matching vendor style)
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-0">
        <div className="space-y-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-4 border-b border-gray-100 last:border-b-0"
            >
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State - similar to vendor page
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalNotifications: 0,
    unreadCount: 0,
    todayCount: 0,
    criticalCount: 0,
  });

  // Filter options
  const filterOptions = [
    { label: "All Types", value: "all" },
    { label: "Order Updates", value: "ORDER_CONFIRMED" },
    { label: "Payments", value: "PAYMENT_PROCESSED" },
    { label: "Wishlist", value: "WISHLIST_ITEM_BACK_IN_STOCK" },
    { label: "Promotions", value: "PROMOTIONAL_OFFER" },
    { label: "Security", value: "ACCOUNT_SECURITY" },
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Load notifications (exact same pattern as vendor page)
  useEffect(() => {
    loadNotifications();
  }, [currentPage, searchTerm, typeFilter, statusFilter, severityFilter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20", // Increased from 15 to show more notifications
      });

      if (searchTerm) params.append("search", searchTerm);
      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (severityFilter) params.append("severity", severityFilter);

      const response = await fetch(`/api/notifications?${params}`);
      const data: NotificationsResponse = await response.json();

      if (data.success) {
        setNotifications(
          Array.isArray(data.notifications) ? data.notifications : []
        );
        setTotalPages(Math.max(1, data.pagination?.totalPages || 1));
        setTotalCount(Math.max(0, data.pagination?.totalCount || 0));
        setStats({
          totalNotifications: Math.max(0, data.stats?.totalNotifications || 0),
          unreadCount: Math.max(0, data.stats?.unreadCount || 0),
          todayCount: Math.max(0, data.stats?.todayCount || 0),
          criticalCount: Math.max(0, data.stats?.criticalCount || 0),
        });
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadNotifications();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setStatusFilter("");
    setSeverityFilter("");
    setCurrentPage(1);
  };

  // Mark notification as read - SAME AS VENDOR (local state update only)
  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state immediately
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setStats((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));

      // Make API call in background
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        // Revert on error
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: false } : notif
          )
        );
        setStats((prev) => ({
          ...prev,
          unreadCount: prev.unreadCount + 1,
        }));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert on error
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: false } : notif
        )
      );
      setStats((prev) => ({
        ...prev,
        unreadCount: prev.unreadCount + 1,
      }));
    }
  };

  // Mark all as read - SAME AS VENDOR (local state update only)
  const markAllAsRead = async () => {
    try {
      // Update local state immediately
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setStats((prev) => ({ ...prev, unreadCount: 0 }));

      // Make API call in background
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (!response.ok) {
        // Revert on error (would need to track original unread count)
        loadNotifications();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Revert on error
      loadNotifications();
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

  // Safe pagination calculation (same as vendor)
  const generatePaginationNumbers = () => {
    if (totalPages <= 1) return [];

    const pages: number[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 4) {
      for (let i = 1; i <= 7; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 3) {
      for (let i = Math.max(1, totalPages - 6); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = currentPage - 3; i <= currentPage + 3; i++) {
        if (i >= 1 && i <= totalPages) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const paginationNumbers = generatePaginationNumbers();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="container mx-auto px-4 py-4 space-y-4">
          <StatsSkeleton />
          <NotificationsSkeleton />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header with Breadcrumb */}
      <div className="pt-8 px-4 pb-4">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="cursor-pointer">
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Notifications</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-600">
              Stay updated on orders, payments, and account activity
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {stats.unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="bg-white border-gray-200 hover:bg-gray-50 h-8 px-3 text-xs cursor-pointer"
              >
                <CheckIcon className="w-3 h-3 mr-1.5" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              title="Total Notifications"
              value={stats.totalNotifications.toString()}
              icon={BellIcon}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Unread"
              value={stats.unreadCount.toString()}
              icon={EyeSlashIcon}
              iconColor="text-orange-600"
              bgColor="bg-orange-50"
            />
            <StatCard
              title="Today"
              value={stats.todayCount.toString()}
              icon={BellIcon}
              iconColor="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Critical"
              value={stats.criticalCount.toString()}
              icon={ExclamationTriangleIcon}
              iconColor="text-red-600"
              bgColor="bg-red-50"
            />
          </motion.div>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label
                    htmlFor="search"
                    className="text-xs font-medium text-gray-700"
                  >
                    Search Notifications
                  </Label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 text-sm"
                      placeholder="Search notifications..."
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">
                    Type
                  </Label>
                  <Select
                    value={typeFilter || "all"}
                    onValueChange={(value) =>
                      setTypeFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ORDER_CONFIRMED">
                        Order Updates
                      </SelectItem>
                      <SelectItem value="PAYMENT_PROCESSED">
                        Payments
                      </SelectItem>
                      <SelectItem value="WISHLIST_ITEM_BACK_IN_STOCK">
                        Wishlist
                      </SelectItem>
                      <SelectItem value="PROMOTIONAL_OFFER">
                        Promotions
                      </SelectItem>
                      <SelectItem value="ACCOUNT_SECURITY">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">
                    Status
                  </Label>
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) =>
                      setStatusFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Severity Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">
                    Priority
                  </Label>
                  <Select
                    value={severityFilter || "all"}
                    onValueChange={(value) =>
                      setSeverityFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                      <SelectItem value="INFO">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear & Apply */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">
                    Actions
                  </Label>
                  <div className="flex space-x-2">
                    {(searchTerm ||
                      typeFilter ||
                      statusFilter ||
                      severityFilter) && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={clearFilters}
                        className="h-9 px-3 text-xs cursor-pointer"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-3 text-xs cursor-pointer"
                    >
                      <FunnelIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  {totalCount} notifications found
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {loading ? (
          <NotificationsSkeleton />
        ) : error ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <XCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Error Loading Notifications
              </h3>
              <p className="text-xs text-gray-500 mb-4">{error}</p>
              <Button
                onClick={() => loadNotifications()}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs cursor-pointer"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : !notifications || notifications.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                No notifications found
              </h3>
              <p className="text-xs text-gray-500">
                {statusFilter === "unread"
                  ? "No unread notifications found"
                  : "You don't have any notifications yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-0">
              <div className="space-y-0">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    whileHover={{ x: 2 }}
                    className={`flex items-center space-x-3 p-4 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer ${
                      !notification.isRead
                        ? "bg-blue-50/30"
                        : "hover:bg-gray-50/50"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <NotificationIcon type={notification.type} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                        {notification.message}
                      </p>

                      {/* Order/Product info if available */}
                      {notification.order && (
                        <div className="flex items-center space-x-2 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="p-1 bg-gray-200 rounded">
                            <ShoppingCartIcon className="w-3 h-3 text-gray-600" />
                          </div>
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">
                              Order #
                              {notification.order.id.slice(-8).toUpperCase()}
                            </span>
                            {notification.order.productName && (
                              <span className="text-gray-500 ml-2">
                                • {notification.order.productName}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                        <span>{formatDate(notification.createdAt)}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {notification.type.replace(/_/g, " ").toLowerCase()}
                        </span>
                        <SeverityBadge severity={notification.severity} />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {notification.actionUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={notification.actionUrl}
                            className="text-blue-600 hover:text-blue-700 text-xs cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              !notification.isRead &&
                                markAsRead(notification.id);
                            }}
                          >
                            View
                          </Link>
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.isRead && (
                            <DropdownMenuItem
                              onClick={() => markAsRead(notification.id)}
                              className="cursor-pointer"
                            >
                              <CheckIcon className="w-4 h-4 mr-2" />
                              Mark as read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              /* Add delete functionality if needed */
                            }}
                            className="text-red-600 cursor-pointer"
                          >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-700">
              Showing {Math.max(1, (currentPage - 1) * 20 + 1)} to{" "}
              {Math.min(currentPage * 20, totalCount)} of {totalCount}{" "}
              notifications
            </p>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 text-xs cursor-pointer"
              >
                Previous
              </Button>

              <div className="flex space-x-1">
                {paginationNumbers.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 text-xs cursor-pointer ${
                      currentPage === pageNumber
                        ? "bg-slate-900 hover:bg-slate-800 text-white"
                        : ""
                    }`}
                  >
                    {pageNumber}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-xs cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
