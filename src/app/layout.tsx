"use client";

import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import Navbar from "@/components/layout/Navbar";
import { usePathname } from "next/navigation";

// Montserrat for headings - elegant and modern
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Inter for body text - exceptional readability
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
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
        className={`${montserrat.variable} ${inter.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <LayoutContent>{children}</LayoutContent>
        </SessionProvider>
      </body>
    </html>
  );
}
