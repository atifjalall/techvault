"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Map known routes to friendly page names
const ROUTE_NAME_MAP: Record<string, string> = {
  "/": "Home",
  "/products": "Products",
  "/cart": "Cart",
  "/wishlist": "Wishlist",
  "/profile": "Profile",
  "/orders": "Orders",
  "/checkout": "Checkout",
  "/checkout/success": "Order Success",
  "/signin": "Sign In",
  "/signup": "Sign Up",
  "/forgot-password": "Forgot Password",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/store": "Store",
  "/vendor": "Vendor",
};

const VENDOR_ROUTE_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  "products/add": "Add Product",
  "products/edit": "Edit Product",
  orders: "Orders",
  "orders/details": "Order Details",
  wallet: "Wallet",
  "wallet/transactions": "Transactions",
  insights: "Insights",
  settings: "Settings",
  customers: "Customers",
  notifications: "Notifications",
  "help/getting-started": "Getting Started",
};

function humanizeSegment(segment: string) {
  if (!segment) return "";
  // replace dashes/underscores, capitalize
  return segment.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TitleManager() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    try {
      const base = "TechVault";

      // Exact match first
      if (ROUTE_NAME_MAP[pathname]) {
        document.title = `${base} - ${ROUTE_NAME_MAP[pathname]}`;
        return;
      }

      // Handle dynamic routes and nested paths
      const segments = pathname.split("/").filter(Boolean);

      if (segments.length === 0) {
        document.title = `${base} - Home`;
        return;
      }

      // If first segment matches a known route, use that
      const first = `/${segments[0]}`;
      if (ROUTE_NAME_MAP[first]) {
        // Special handling for vendor subroutes: map second segment to vendor page name
        if (segments[0] === "vendor") {
          // Build vendor key from subsequent segments (support nested keys like products/add)
          const vendorKey = segments.slice(1, 3).join("/");

          // Exact match first (e.g., /vendor/dashboard)
          if (VENDOR_ROUTE_MAP[segments[1]]) {
            document.title = `${base} - ${VENDOR_ROUTE_MAP[segments[1]]}`;
            return;
          }

          // Nested matches (e.g., products/add, wallet/transactions, help/getting-started)
          if (VENDOR_ROUTE_MAP[vendorKey]) {
            document.title = `${base} - ${VENDOR_ROUTE_MAP[vendorKey]}`;
            return;
          }

          // Handle product edit route: /vendor/products/:id/edit
          if (segments[1] === "products" && segments[3] === "edit") {
            document.title = `${base} - Edit Product`;
            return;
          }

          // Handle order details /vendor/orders/:id
          if (segments[1] === "orders" && segments[2]) {
            document.title = `${base} - Order Details`;
            return;
          }

          // Fallback for vendor: use humanized second segment
          const vendorFallback = humanizeSegment(segments[1] || "Vendor");
          document.title = `${base} - ${vendorFallback}`;
          return;
        }

        // special case: product detail (/products/:id) -> use slug
        if (segments[0] === "products" && segments[1]) {
          const productSlug = humanizeSegment(decodeURIComponent(segments[1]));
          document.title = `${base} - ${productSlug}`;
          return;
        }

        // store page with slug (/store/:storeSlug) -> use store slug
        if (segments[0] === "store" && segments[1]) {
          const storeSlug = humanizeSegment(decodeURIComponent(segments[1]));
          document.title = `${base} - ${storeSlug}`;
          return;
        }

        document.title = `${base} - ${ROUTE_NAME_MAP[first]}`;
        return;
      }

      // Fallback: capitalize first segment
      const fallback = humanizeSegment(segments[0]);
      document.title = `${base} - ${fallback || "Page"}`;
    } catch {
      // fail silently
    }
  }, [pathname]);

  return null;
}
