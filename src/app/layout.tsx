"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import Navbar from "@/components/layout/Navbar";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Pages where Navbar should be hidden
const hideNavbarRoutes = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/vendor", // Vendor pages have their own layout
];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current route should hide navbar
  const shouldHideNavbar = hideNavbarRoutes.some(
    (route) =>
      pathname === route ||
      (route === "/vendor" && pathname.startsWith("/vendor"))
  );

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <LayoutContent>{children}</LayoutContent>
        </SessionProvider>
      </body>
    </html>
  );
}
