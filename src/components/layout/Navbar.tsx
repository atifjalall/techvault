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
} from "@heroicons/react/24/outline";
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

// Smart Badge Component for Cart/Wishlist counters
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

// Fixed position skeleton components to prevent layout shift
function NavActionsSkeleton() {
  return (
    <div className="flex items-center space-x-2">
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

  // TODO: Replace with actual cart/wishlist state management
  const [cartItemCount] = useState(0); // This should come from your cart state
  const [wishlistItemCount] = useState(0); // This should come from your wishlist state

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
                {/* Wishlist Button - Desktop only */}
                <Link
                  href="/wishlist"
                  className="text-slate-700 hover:text-slate-900 p-1.5 relative transition-colors backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-full border border-white/20 hidden md:block cursor-pointer"
                >
                  <HeartIcon className="h-4 w-4" />
                  <SmartBadge count={wishlistItemCount} />
                </Link>

                {/* Cart Button - Desktop only */}
                <Link
                  href="/cart"
                  className="text-slate-700 hover:text-slate-900 p-1.5 relative transition-colors backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-full border border-white/20 hidden md:block cursor-pointer"
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  <SmartBadge count={cartItemCount} />
                </Link>

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

                {/* Mobile Actions (Wishlist, Cart) */}
                <div className="flex items-center px-5 space-x-4 mt-4">
                  <Link
                    href="/wishlist"
                    className="text-slate-700 hover:text-slate-900 p-2 relative backdrop-blur-md bg-white/30 hover:bg-white/50 rounded-full border border-white/30 transition-all duration-200 cursor-pointer"
                    aria-label="View wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HeartIcon className="h-4 w-4" />
                    <SmartBadge count={wishlistItemCount} />
                  </Link>
                  <Link
                    href="/cart"
                    className="text-slate-700 hover:text-slate-900 p-2 relative backdrop-blur-md bg-white/30 hover:bg-white/50 rounded-full border border-white/30 transition-all duration-200 cursor-pointer"
                    aria-label="View shopping cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingBagIcon className="h-4 w-4" />
                    <SmartBadge count={cartItemCount} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
