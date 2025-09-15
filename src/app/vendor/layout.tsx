"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VendorSidebar from "./VendorSidebar";

interface VendorLayoutProps {
  children: React.ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protect all vendor routes
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (session?.user && session.user.role !== "VENDOR") {
      router.push("/?error=access-denied");
    }
  }, [status, session, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!session || session.user.role !== "VENDOR") {
    return null;
  }

  return <VendorSidebar>{children}</VendorSidebar>;
}
