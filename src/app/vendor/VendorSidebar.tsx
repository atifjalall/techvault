"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  UsersIcon,
  XMarkIcon,
  PlusIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

// Removed Settings from navigation since it's now in the top bar
const navigation = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: HomeIcon },
  { name: "Products", href: "/vendor/products", icon: CubeIcon },
  { name: "Add Product", href: "/vendor/products/add", icon: PlusIcon },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingBagIcon },
  { name: "Insights", href: "/vendor/insights", icon: ChartBarIcon },
  { name: "Customers", href: "/vendor/customers", icon: UsersIcon },
  { name: "Wallet", href: "/vendor/wallet", icon: CurrencyEuroIcon },
  { name: "Notifications", href: "/vendor/notifications", icon: BellIcon },
];

interface VendorSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function VendorSidebar({
  sidebarOpen,
  setSidebarOpen,
}: VendorSidebarProps) {
  const pathname = usePathname();

  return (
    <>
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
          isMobile={false}
        />
      </div>
    </>
  );
}

interface SidebarContentProps {
  navigation: typeof navigation;
  pathname: string;
  onClose?: () => void;
  isMobile?: boolean;
}

function SidebarContent({
  navigation,
  pathname,
  onClose,
  isMobile = false,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Header - MATCHING navbar height exactly */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-12 border-b border-gray-200">
        <Link
          href="/"
          className="text-lg font-bold text-gray-900 cursor-pointer"
        >
          TechVault
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.name}
              whileHover={{ x: 1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Link
                href={item.href}
                onClick={isMobile ? onClose : undefined}
                className={`group flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 relative cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon
                  className={`mr-2.5 h-4 w-4 transition-colors ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Minimal Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <p className="text-xs text-gray-500 font-medium">System Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
