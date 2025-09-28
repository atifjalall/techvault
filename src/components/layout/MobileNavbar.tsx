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
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { getUserInitials } from "@/lib/utils";

// Mobile Categories List Component with Expandable Subcategories
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
      subcategories: Array<{
        id: string;
        name: string;
        href: string;
      }>;
    }>
  >([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

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
        <div key={category.id}>
          {/* Main Category */}
          <div className="flex items-center justify-between">
            <Link
              href={category.href}
              className="flex-1 text-slate-700 hover:text-slate-900 hover:bg-white/50 block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
              onClick={onCategoryClick}
            >
              {category.name}
            </Link>
            {category.subcategories && category.subcategories.length > 0 && (
              <button
                onClick={() => toggleCategory(category.id)}
                className="p-2 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <motion.div
                  animate={{
                    rotate: expandedCategory === category.id ? 180 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </motion.div>
              </button>
            )}
          </div>

          {/* Subcategories */}
          <AnimatePresence>
            {expandedCategory === category.id &&
              category.subcategories &&
              category.subcategories.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 space-y-1 py-1">
                    {category.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        href={subcategory.href}
                        className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-white/30 rounded-lg transition-all duration-200 cursor-pointer"
                        onClick={onCategoryClick}
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// Smart Badge Component
interface SmartBadgeProps {
  count: number;
  isLoading?: boolean;
}

function SmartBadge({ count, isLoading = false }: SmartBadgeProps) {
  if (isLoading) {
    return (
      <span className="absolute -top-0 -right-0 bg-gray-300 text-transparent text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium animate-pulse">
        0
      </span>
    );
  }

  if (count === 0) return null;

  return (
    <span className="absolute -top-0 -right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
      {count > 9 ? "9+" : count}
    </span>
  );
}

// Mobile Search Bar Component
function MobileSearchBar({ isVisible }: { isVisible: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="border-t border-white/40 px-4 py-3 bg-white/90 backdrop-blur-md"
    >
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 text-sm bg-white border border-gray-300 rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
            placeholder="Search for products, brands, categories..."
            autoFocus
          />
        </div>
      </form>
    </motion.div>
  );
}

export default function MobileNavbar() {
  const { data: session } = useSession();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isKebabOpen, setIsKebabOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Real cart and wishlist state management
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const [countsLoading, setCountsLoading] = useState(true);

  const kebabRef = useRef<HTMLDivElement>(null);

  // Close kebab menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        kebabRef.current &&
        !kebabRef.current.contains(event.target as Node)
      ) {
        setIsKebabOpen(false);
      }
    }

    if (isKebabOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isKebabOpen]);

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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const closeAllMenus = () => {
    setIsHamburgerOpen(false);
    setIsKebabOpen(false);
    setIsSearchVisible(false);
  };

  return (
    <nav className="md:hidden sticky top-0 backdrop-blur-xl bg-white/90 border-b border-gray-200/50 z-50">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-14 min-h-[3.5rem]">
          {/* Left side - Hamburger Menu */}
          <button
            onClick={() => {
              setIsHamburgerOpen(!isHamburgerOpen);
              setIsKebabOpen(false);
              setIsSearchVisible(false);
            }}
            className="text-slate-700 hover:text-slate-900 p-2.5 backdrop-blur-md bg-white/20 hover:bg-white/30 rounded-xl border border-white/30 transition-all duration-200 cursor-pointer"
          >
            {isHamburgerOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>

          {/* Center - Logo */}
          <Link
            href="/"
            className="text-lg font-bold text-slate-900 flex-shrink-0"
          >
            TechVault
          </Link>

          {/* Right side - Search, Kebab Menu */}
          <div className="flex items-center space-x-2">
            {/* Search Icon */}
            <button
              onClick={() => {
                setIsSearchVisible(!isSearchVisible);
                setIsHamburgerOpen(false);
                setIsKebabOpen(false);
              }}
              className="text-slate-700 hover:text-slate-900 p-2.5 backdrop-blur-md bg-white/20 hover:bg-white/30 rounded-xl border border-white/30 transition-all duration-200 cursor-pointer"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Kebab Menu */}
            <div className="relative" ref={kebabRef}>
              <button
                onClick={() => {
                  setIsKebabOpen(!isKebabOpen);
                  setIsHamburgerOpen(false);
                  setIsSearchVisible(false);
                }}
                className="text-slate-700 hover:text-slate-900 p-2.5 backdrop-blur-md bg-white/20 hover:bg-white/30 rounded-xl border border-white/30 transition-all duration-200 cursor-pointer"
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>

              {/* Kebab Dropdown */}
              <AnimatePresence>
                {isKebabOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-64 origin-top-right bg-white rounded-xl shadow-xl border border-gray-200 z-20"
                  >
                    <div className="absolute -top-1 right-6 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>

                    {session?.user ? (
                      <div className="py-2">
                        {/* User Profile Section */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                              {session.user.image ? (
                                <Image
                                  src={session.user.image}
                                  alt={session.user.name || "Profile"}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-sm font-semibold">
                                  {getUserInitials(session.user.name || "User")}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {session.user.name || "User"}
                              </p>
                              <p className="text-xs text-slate-600 truncate">
                                {session.user.email}
                              </p>
                              {session.user.role === "VENDOR" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                  Vendor
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Profile Menu Items */}
                        <div className="py-1">
                          {session.user.role === "VENDOR" && (
                            <Link
                              href="/vendor/dashboard"
                              className="group flex items-center mx-2 px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 hover:text-blue-900 transition-all duration-150 rounded-lg cursor-pointer border-b border-gray-100 mb-1"
                              onClick={closeAllMenus}
                            >
                              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                                <BuildingStorefrontIcon className="w-3 h-3 text-blue-600 group-hover:text-blue-700" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-xs">
                                  Vendor Dashboard
                                </div>
                                <div className="text-xs text-slate-500">
                                  Manage your store
                                </div>
                              </div>
                            </Link>
                          )}

                          <Link
                            href="/profile"
                            className="group flex items-center mx-2 px-3 py-2 text-xs text-slate-700 hover:bg-gray-50 hover:text-slate-900 transition-all duration-150 rounded-lg cursor-pointer"
                            onClick={closeAllMenus}
                          >
                            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                              <UserIcon className="w-3 h-3 text-slate-600 group-hover:text-slate-700" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-xs">
                                My Profile
                              </div>
                              <div className="text-xs text-slate-500">
                                Manage your account
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/orders"
                            className="group flex items-center mx-2 px-3 py-2 text-xs text-slate-700 hover:bg-gray-50 hover:text-slate-900 transition-all duration-150 rounded-lg cursor-pointer"
                            onClick={closeAllMenus}
                          >
                            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                              <ShoppingCartIcon className="w-3 h-3 text-slate-600 group-hover:text-slate-700" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-xs">
                                My Orders
                              </div>
                              <div className="text-xs text-slate-500">
                                Track your purchases
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/notifications"
                            className="group flex items-center mx-2 px-3 py-2 text-xs text-slate-700 hover:bg-gray-50 hover:text-slate-900 transition-all duration-150 rounded-lg cursor-pointer"
                            onClick={closeAllMenus}
                          >
                            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                              <BellIcon className="w-3 h-3 text-slate-600 group-hover:text-slate-700" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-xs">
                                Notifications
                              </div>
                              <div className="text-xs text-slate-500">
                                View updates
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/wishlist"
                            className="group flex items-center mx-2 px-3 py-2 text-xs text-slate-700 hover:bg-gray-50 hover:text-slate-900 transition-all duration-150 rounded-lg cursor-pointer"
                            onClick={closeAllMenus}
                          >
                            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors relative">
                              <HeartIcon className="w-3 h-3 text-slate-600 group-hover:text-slate-700" />
                              <SmartBadge
                                count={wishlistItemCount}
                                isLoading={countsLoading}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-xs">
                                Wishlist
                              </div>
                              <div className="text-xs text-slate-500">
                                Saved items
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/cart"
                            className="group flex items-center mx-2 px-3 py-2 text-xs text-slate-700 hover:bg-gray-50 hover:text-slate-900 transition-all duration-150 rounded-lg cursor-pointer"
                            onClick={closeAllMenus}
                          >
                            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors relative">
                              <ShoppingBagIcon className="w-3 h-3 text-slate-600 group-hover:text-slate-700" />
                              <SmartBadge
                                count={cartItemCount}
                                isLoading={countsLoading}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-xs">
                                Shopping Cart
                              </div>
                              <div className="text-xs text-slate-500">
                                Items to buy
                              </div>
                            </div>
                          </Link>
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-gray-100 pt-1 mx-2">
                          <button
                            onClick={() => {
                              closeAllMenus();
                              handleSignOut();
                            }}
                            className="group w-full flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all duration-150 rounded-lg cursor-pointer"
                          >
                            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors">
                              <ArrowRightOnRectangleIcon className="w-3 h-3 text-slate-600 group-hover:text-red-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-xs">
                                Sign Out
                              </div>
                              <div className="text-xs text-slate-500">
                                Sign out of your account
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 px-4">
                        <Link
                          href="/signin"
                          className="block w-full text-center px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 backdrop-blur-md bg-white/40 hover:bg-white/50 rounded-xl border border-white/40 transition-all duration-200 cursor-pointer"
                          onClick={closeAllMenus}
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        <MobileSearchBar isVisible={isSearchVisible} />
      </AnimatePresence>

      {/* Hamburger Menu - Categories */}
      <AnimatePresence>
        {isHamburgerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/40 px-4 py-4 backdrop-blur-xl bg-white/80 max-h-80 overflow-y-auto"
          >
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-800 px-4">
                Categories
              </h3>
            </div>
            <MobileCategoriesList onCategoryClick={closeAllMenus} />
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
