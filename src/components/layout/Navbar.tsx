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

// Search Bar Component with Dynamic Autocomplete
function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{
      id: string;
      name: string;
      type: "category" | "subcategory" | "product";
      category?: string;
    }>
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
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

  // Handle search input changes with API call
  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);

    if (value.length > 1) {
      // Start searching after 2 characters
      setLoading(true);
      setIsOpen(true);

      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(value)}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSuggestions(data.suggestions || []);
          }
        }
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setSearchQuery(suggestion.name);
    setIsOpen(false);

    // Navigate based on suggestion type
    if (suggestion.type === "category") {
      window.location.href = `/products?category=${encodeURIComponent(suggestion.name)}`;
    } else if (suggestion.type === "subcategory") {
      window.location.href = `/products?subcategory=${encodeURIComponent(suggestion.name)}`;
    } else if (suggestion.type === "product") {
      window.location.href = `/products?search=${encodeURIComponent(suggestion.name)}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsOpen(false);
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "category":
        return (
          <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded"></div>
          </div>
        );
      case "subcategory":
        return (
          <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded"></div>
          </div>
        );
      default:
        return <MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative flex-1 max-w-lg" ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 text-sm bg-white border border-gray-300 rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
            placeholder="What are you looking for?"
          />
        </div>
      </form>

      {/* Dynamic Search Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-30 overflow-hidden"
          >
            {/* Arrow pointer */}
            <div className="absolute -top-1 left-8 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>

            {loading ? (
              // Loading skeleton
              <div className="p-3 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 animate-pulse"
                  >
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="ml-3 flex-1">
                      <span className="font-medium">{suggestion.name}</span>
                      {suggestion.category && (
                        <span className="text-xs text-slate-500 ml-2">
                          in {suggestion.category}
                        </span>
                      )}
                      <div className="text-xs text-slate-400 capitalize">
                        {suggestion.type}
                      </div>
                    </div>
                  </button>
                ))}

                {/* View all results */}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() =>
                      handleSubmit({
                        preventDefault: () => {},
                      } as React.FormEvent)
                    }
                    className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Search for &quot;{searchQuery}&quot;
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              searchQuery &&
              !loading && (
                <div className="p-4 text-center text-sm text-slate-500">
                  No suggestions found for &quot;{searchQuery}&quot;
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dynamic Categories Component
function CategoriesNavigation() {
  const [categories, setCategories] = useState<
    Array<{
      id: string;
      name: string;
      href: string;
      subcategories: Array<{
        id: string;
        name: string;
        href: string;
      }>;
    }>
  >([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategories(data.categories || []);
          }
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="hidden lg:block">
        <div className="flex items-baseline space-x-4 w-64">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-3 py-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block">
      <div className="flex items-baseline space-x-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative group"
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <Link
              href={category.href}
              className="text-slate-700 hover:text-slate-900 px-3 py-2 text-xs font-medium flex items-center transition-colors duration-200 cursor-pointer"
            >
              {category.name}
              <motion.div
                animate={{
                  rotate: hoveredCategory === category.id ? 180 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </motion.div>
            </Link>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {hoveredCategory === category.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-0 mt-1 w-52 origin-top z-50"
                >
                  <div className="absolute -top-1 left-6 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>

                  <div className="bg-white rounded-xl shadow-xl border border-gray-200 py-2 mt-1">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {category.name}
                      </p>
                    </div>
                    <div className="py-1">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={subcategory.href}
                          className="group flex items-center mx-2 px-3 py-2 text-sm text-slate-700 hover:bg-gray-50 hover:text-slate-900 transition-colors duration-150 rounded-lg cursor-pointer"
                        >
                          <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                            <div className="w-2 h-2 bg-slate-400 rounded group-hover:bg-slate-500"></div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {subcategory.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              Explore {subcategory.name.toLowerCase()}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Link
                        href={category.href}
                        className="flex items-center justify-center mx-2 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
                      >
                        View All {category.name}
                        <svg
                          className="ml-2 w-4 h-4"
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
  );
}

// Mobile Categories List Component
function MobileCategoriesList({
  onCategoryClick,
}: {
  onCategoryClick: () => void;
}) {
  const [categories, setCategories] = useState<
    Array<{
      id: string;
      name: string;
      href: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategories(data.categories || []);
          }
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={category.href}
          className="text-slate-700 hover:text-slate-900 hover:bg-white/50 block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
          onClick={onCategoryClick}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}

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
    ORDER_CONFIRMED: CheckIcon,
    ORDER_PROCESSING: InformationCircleIcon,
    ORDER_SHIPPED: ShoppingCartIcon,
    ORDER_DELIVERED: CheckIcon,
    ORDER_CANCELLED: ExclamationTriangleIcon,
    PAYMENT_PROCESSED: CheckIcon,
    PAYMENT_FAILED: ExclamationTriangleIcon,
    WISHLIST_ITEM_BACK_IN_STOCK: CheckIcon,
    PRICE_DROP_ALERT: InformationCircleIcon,
    default: InformationCircleIcon,
  };
  return iconMap[type] || iconMap.default;
};

const getNotificationColor = (type: string) => {
  const colorMap: Record<string, string> = {
    ORDER_CONFIRMED: "text-green-600 bg-green-100",
    ORDER_DELIVERED: "text-green-600 bg-green-100",
    PAYMENT_PROCESSED: "text-green-600 bg-green-100",
    ORDER_CANCELLED: "text-amber-600 bg-amber-100",
    PAYMENT_FAILED: "text-red-600 bg-red-100",
    ORDER_PROCESSING: "text-blue-600 bg-blue-100",
    ORDER_SHIPPED: "text-blue-600 bg-blue-100",
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

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, markAllRead: false }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        onNotificationUpdate?.();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        );
        onNotificationUpdate?.();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 origin-top-right bg-white rounded-xl shadow-xl border border-gray-200 z-20">
      <div className="absolute -top-1 right-6 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>

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

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
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
          <div className="p-6 text-center">
            <XCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              We&apos;ll notify you about order updates and special offers
            </p>
          </div>
        ) : (
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

  interface MenuItem {
    name: string;
    href: string;
    icon: React.ElementType;
    description: string;
    isVendor?: boolean;
  }

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
        className="flex items-center space-x-2 p-2 rounded-lg backdrop-blur-md bg-white/20 hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40 border border-white/30 cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white/30 border border-white/40">
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-60 origin-top-right bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20"
          >
            <div className="absolute -top-1 right-6 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>

            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Profile"}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-sm font-semibold">
                      {getUserInitials(user.name || "User")}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-slate-600 truncate">
                    {user.email}
                  </p>
                  {user.role === "VENDOR" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      Vendor
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="py-1">
              {profileMenuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center mx-2 px-3 py-2 text-xs transition-all duration-150 rounded-lg cursor-pointer ${
                    item.isVendor
                      ? "text-blue-700 hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100 mb-1"
                      : "text-slate-700 hover:bg-gray-50 hover:text-slate-900"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center mr-3 transition-colors ${
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

            <div className="border-t border-gray-100 pt-1 mx-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="group w-full flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all duration-150 rounded-lg cursor-pointer"
              >
                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors">
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

// Smart Badge Component
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
  const [notificationData, setNotificationData] = useState<{
    count: number;
    loaded: boolean;
  }>({
    count: 0,
    loaded: false,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications?unreadOnly=true");
        if (response.ok) {
          const data: NotificationsResponse = await response.json();
          if (data.success) {
            setNotificationData({
              count: data.unreadCount || 0,
              loaded: true,
            });
          }
        }
      } catch (error) {
        console.error("Error loading notification count:", error);
        setNotificationData((prev) => ({ ...prev, loaded: true }));
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-700 hover:text-slate-900 p-2 relative transition-colors hover:bg-gray-100/50 rounded-lg cursor-pointer"
        aria-label="View notifications"
      >
        {notificationData.loaded ? (
          <>
            {notificationData.count > 0 ? (
              <BellIconSolid className="h-4 w-4 text-slate-700" />
            ) : (
              <BellIcon className="h-4 w-4" />
            )}
            <SmartBadge count={notificationData.count} />
          </>
        ) : (
          <BellIcon className="h-4 w-4" />
        )}
      </button>

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
                const loadUnreadCount = async () => {
                  try {
                    const response = await fetch(
                      "/api/notifications?unreadOnly=true"
                    );
                    if (response.ok) {
                      const data: NotificationsResponse = await response.json();
                      if (data.success) {
                        setNotificationData({
                          count: data.unreadCount || 0,
                          loaded: true,
                        });
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

// Enhanced skeleton components with improved styling
function NavActionsSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      {/* Notifications Skeleton */}
      <div className="w-8 h-8 rounded-lg bg-gray-200/50 animate-pulse"></div>

      {/* Wishlist Skeleton */}
      <div className="w-8 h-8 rounded-lg bg-gray-200/50 animate-pulse"></div>

      {/* Cart Skeleton */}
      <div className="w-8 h-8 rounded-lg bg-gray-200/50 animate-pulse"></div>

      {/* Profile Skeleton - exact same dimensions as real profile */}
      <div className="flex items-center space-x-2 p-2 rounded-lg backdrop-blur-md bg-white/20 border border-white/30 animate-pulse">
        <div className="w-7 h-7 rounded-full bg-gray-300/50"></div>
        <div className="hidden md:flex items-center space-x-1">
          <div className="w-8 h-3 bg-gray-300/50 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <nav className="sticky top-0 backdrop-blur-xl bg-white/90 border-b border-gray-200/50 z-50">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 min-h-[3.5rem]">
          {/* Left side - Logo and Categories */}
          <div className="flex items-center space-x-8 w-80 flex-shrink-0">
            {/* Logo */}
            <Link
              href="/"
              className="text-lg font-bold text-slate-900 flex-shrink-0"
            >
              TechVault
            </Link>

            {/* Desktop Navigation - Categories */}
            <CategoriesNavigation />
          </div>

          {/* Center - Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-6">
            <div className="w-full">
              <SearchBar />
            </div>
          </div>
          {/* Right side - Actions and Profile */}
          <div className="flex items-center justify-end space-x-2 w-80 flex-shrink-0">
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
                      className="text-slate-700 hover:text-slate-900 p-2 relative transition-colors hover:bg-gray-100/50 rounded-lg hidden md:block cursor-pointer"
                    >
                      <HeartIcon className="h-4 w-4" />
                      {!countsLoading && (
                        <SmartBadge count={wishlistItemCount} />
                      )}
                    </Link>

                    {/* Cart Button - Desktop only */}
                    <Link
                      href="/cart"
                      className="text-slate-700 hover:text-slate-900 p-2 relative transition-colors hover:bg-gray-100/50 rounded-lg hidden md:block cursor-pointer"
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
                      className="text-slate-700 hover:text-slate-900 px-4 py-2.5 text-sm font-medium backdrop-blur-md bg-white/20 hover:bg-white/30 rounded-xl border border-white/30 transition-all duration-200 cursor-pointer"
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
                className="text-slate-700 hover:text-slate-900 p-2.5 backdrop-blur-md bg-white/20 hover:bg-white/30 rounded-xl border border-white/30 transition-all duration-200 cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <Bars3Icon className="h-5 w-5" />
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
            <div className="px-4 pt-4 pb-6 space-y-3 backdrop-blur-xl bg-white/80 border-t border-white/50">
              {/* Mobile Search */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-3 text-sm bg-white border border-gray-300 rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    placeholder="Search products..."
                  />
                </div>
              </div>

              {/* Mobile Categories */}
              <MobileCategoriesList
                onCategoryClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Mobile Auth/Profile Actions */}
              <div className="border-t border-white/40 pt-4">
                {session?.user ? (
                  <div className="space-y-4">
                    {/* Mobile Profile Info */}
                    <div className="flex items-center space-x-3 p-4 backdrop-blur-md bg-white/40 rounded-xl border border-white/40">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/30 border border-white/40">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "Profile"}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800/80 text-white text-sm font-semibold">
                            {getUserInitials(session.user.name || "User")}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
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
                      {session.user.role === "VENDOR" && (
                        <Link
                          href="/vendor/dashboard"
                          className="flex items-center px-4 py-3 text-sm text-blue-700 hover:bg-blue-100/50 rounded-xl font-medium transition-all duration-200 cursor-pointer"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <BuildingStorefrontIcon className="w-5 h-5 mr-3" />
                          Vendor Dashboard
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-white/50 rounded-xl transition-all duration-200 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-white/50 rounded-xl transition-all duration-200 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/notifications"
                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-white/50 rounded-xl transition-all duration-200 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Notifications
                      </Link>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleSignOut();
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-100/50 rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Link
                      href="/signin"
                      className="text-slate-700 hover:text-slate-900 px-6 py-3 text-sm font-medium backdrop-blur-md bg-white/40 hover:bg-white/50 rounded-xl border border-white/40 transition-all duration-200 cursor-pointer"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </div>
                )}

                {/* Mobile Actions (Wishlist, Cart, Notifications) */}
                {session?.user && (
                  <div className="flex items-center justify-center space-x-4 mt-6">
                    <Link
                      href="/notifications"
                      className="text-slate-700 hover:text-slate-900 p-3 relative backdrop-blur-md bg-white/40 hover:bg-white/50 rounded-xl border border-white/40 transition-all duration-200 cursor-pointer"
                      aria-label="View notifications"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BellIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      href="/wishlist"
                      className="text-slate-700 hover:text-slate-900 p-3 relative backdrop-blur-md bg-white/40 hover:bg-white/50 rounded-xl border border-white/40 transition-all duration-200 cursor-pointer"
                      aria-label="View wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <HeartIcon className="h-5 w-5" />
                      {!countsLoading && (
                        <SmartBadge count={wishlistItemCount} />
                      )}
                    </Link>
                    <Link
                      href="/cart"
                      className="text-slate-700 hover:text-slate-900 p-3 relative backdrop-blur-md bg-white/40 hover:bg-white/50 rounded-xl border border-white/40 transition-all duration-200 cursor-pointer"
                      aria-label="View shopping cart"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingBagIcon className="h-5 w-5" />
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
