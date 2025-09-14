"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

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

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

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
            <button className="text-gray-700 hover:text-gray-900 p-2">
              <HeartIcon className="h-6 w-6" />
            </button>
            <button className="text-gray-700 hover:text-gray-900 p-2 relative">
              <ShoppingBagIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>
            <Link
              href="/signin"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Sign In
            </Link>
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

            {/* Mobile Actions */}
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-5 space-x-4">
                <button
                  className="text-gray-700 hover:text-gray-900 p-2"
                  aria-label="View wishlist"
                >
                  <HeartIcon className="h-6 w-6" />
                </button>
                <button
                  className="text-gray-700 hover:text-gray-900 p-2 relative"
                  aria-label="View shopping cart"
                >
                  <ShoppingBagIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    0
                  </span>
                </button>
                <Link
                  href="/signin"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
