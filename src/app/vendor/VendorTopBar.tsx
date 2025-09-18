"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  HomeIcon,
  Bars3Icon,
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
          name: currentPage === "add"
              ? "Add New"
              : currentPage.charAt(0).toUpperCase() + currentPage.slice(1),
          href: ""
      });
    }
  } else if (segments.length === 2 && segments[1] !== "dashboard") {
    breadcrumbs.push({
        name: segments[1].charAt(0).toUpperCase() + segments[1].slice(1),
        href: ""
    });
  }

  return breadcrumbs;
};

export default function VendorTopBar({
  onMobileMenuToggle,
  title,
  breadcrumbs,
}: VendorTopBarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);

  const defaultBreadcrumbs = generateBreadcrumbs(pathname);
  const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

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

          {/* Center section - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <motion.div
                animate={{
                  scale: searchFocused ? 1.02 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, orders..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </motion.div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <BellIcon className="h-5 w-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                3
              </Badge>
            </Button>

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

      {/* Mobile search bar (appears below main bar on small screens) */}
      <div className="md:hidden px-4 pb-3 border-t border-gray-100">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>
    </header>
  );
}
