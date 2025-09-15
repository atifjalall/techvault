"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  CurrencyEuroIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: HomeIcon },
  { name: "Products", href: "/vendor/products", icon: CubeIcon },
  { name: "Add Product", href: "/vendor/products/add", icon: PlusIcon },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingBagIcon },
  { name: "Insights", href: "/vendor/insights", icon: ChartBarIcon },
  { name: "Customers", href: "/vendor/customers", icon: UsersIcon },
  { name: "Wallet", href: "/vendor/wallet", icon: CurrencyEuroIcon },
  { name: "Settings", href: "/vendor/settings", icon: Cog6ToothIcon },
];

interface VendorSidebarProps {
  children: React.ReactNode;
}

export default function VendorSidebar({ children }: VendorSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-600 bg-opacity-75" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:hidden"
          >
            <SidebarContent
              navigation={navigation}
              pathname={pathname}
              session={session}
              onSignOut={handleSignOut}
              onClose={() => setSidebarOpen(false)}
              isMobile={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <SidebarContent
          navigation={navigation}
          pathname={pathname}
          session={session}
          onSignOut={handleSignOut}
          isMobile={false}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              TechVault Vendor
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  navigation: typeof navigation;
  pathname: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
  onSignOut: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

function SidebarContent({
  navigation,
  pathname,
  session,
  onSignOut,
  onClose,
  isMobile = false,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <Link href="/" className="text-xl font-bold text-gray-900">
          TechVault
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold">
              {session?.user?.name?.charAt(0) || "V"}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {session?.user?.name || "Vendor"}
            </p>
            <p className="text-xs text-gray-500">Vendor Account</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onSignOut}
          className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          Sign out
        </button>
      </div>
    </div>
  );
}
