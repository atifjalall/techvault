"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserIcon,
  CogIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
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
  };
  onSignOut: () => void;
}

function ProfileDropdown({ user, onSignOut }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const profileMenuItems = [
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
    {
      name: "Wishlist",
      href: "/wishlist",
      icon: HeartIcon,
      description: "Saved items",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: CogIcon,
      description: "Account preferences",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-full hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Profile Image */}
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "Profile"}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-sm font-semibold">
              {getUserInitials(user.name || "User")}
            </div>
          )}
        </div>

        {/* Desktop: Show name and chevron */}
        <div className="hidden md:flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
            {user.name?.split(" ")[0] || "User"}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-72 origin-top-right bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
            {/* Arrow pointer */}
            <div className="absolute -top-1 right-6 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>

            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Profile"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white font-semibold">
                      {getUserInitials(user.name || "User")}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {profileMenuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                    <item.icon className="w-4 h-4 text-gray-600 group-hover:text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400 rotate-[-90deg] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="group w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors">
                  <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Sign Out</div>
                  <div className="text-xs text-gray-500">
                    Sign out of your account
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
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
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
      {count > 9 ? "9+" : count}
    </span>
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              TechVault
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="relative group"
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    href={category.href}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200"
                  >
                    {category.name}
                    <ChevronDownIcon
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                        hoveredCategory === category.name ? "rotate-180" : ""
                      }`}
                    />
                  </Link>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute left-0 mt-1 w-56 origin-top transition-all duration-200 ease-out z-50 ${
                      hoveredCategory === category.name
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    {/* Arrow pointer */}
                    <div className="absolute -top-1 left-6 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>

                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 py-2 mt-1">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {category.name}
                        </p>
                      </div>
                      <div className="py-1">
                        {category.subcategories.map((subcategory, index) => (
                          <Link
                            key={subcategory}
                            href={`${category.href}/${subcategory.toLowerCase().replace(/\s+/g, "-")}`}
                            className="group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                          >
                            {/* Icon placeholder */}
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                              <div className="w-4 h-4 bg-gray-400 rounded group-hover:bg-gray-500"></div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{subcategory}</div>
                              <div className="text-xs text-gray-500">
                                Explore {subcategory.toLowerCase()}
                              </div>
                            </div>
                            {/* Arrow on hover */}
                            <ChevronDownIcon className="w-4 h-4 text-gray-400 rotate-[-90deg] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ))}
                      </div>

                      {/* View All Link */}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link
                          href={category.href}
                          className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
                        >
                          View All {category.name}
                          <svg
                            className="ml-1 w-4 h-4"
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                placeholder="Search products..."
              />
            </div>
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              className="text-gray-700 hover:text-gray-900 p-2 relative transition-colors"
            >
              <HeartIcon className="h-6 w-6" />
              <SmartBadge count={wishlistItemCount} />
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="text-gray-700 hover:text-gray-900 p-2 relative transition-colors"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              <SmartBadge count={cartItemCount} />
            </Link>

            {/* Conditional Auth/Profile Section */}
            {status === "loading" ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session?.user ? (
              <ProfileDropdown
                user={{
                  id: session.user.id || "",
                  name: session.user.name,
                  email: session.user.email,
                  image: session.user.image,
                }}
                onSignOut={handleSignOut}
              />
            ) : (
              <Link
                href="/signin"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                  placeholder="Search products..."
                />
              </div>
            </div>

            {/* Mobile Categories */}
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}

            {/* Mobile Auth/Profile Actions */}
            <div className="border-t border-gray-200 pt-4 pb-3">
              {session?.user ? (
                <div className="px-3 space-y-3">
                  {/* Mobile Profile Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "Profile"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-sm font-semibold">
                          {getUserInitials(session.user.name || "User")}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Profile Links */}
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center px-5 space-x-4">
                  <Link
                    href="/signin"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
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
                  className="text-gray-700 hover:text-gray-900 p-2 relative"
                  aria-label="View wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HeartIcon className="h-6 w-6" />
                  <SmartBadge count={wishlistItemCount} />
                </Link>
                <Link
                  href="/cart"
                  className="text-gray-700 hover:text-gray-900 p-2 relative"
                  aria-label="View shopping cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingBagIcon className="h-6 w-6" />
                  <SmartBadge count={cartItemCount} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
