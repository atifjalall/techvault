"use client";

import { useState } from "react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function PromoBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-black text-white py-2 px-4 text-center text-sm font-medium relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <span>🔥 Winter Sale: Up to 50% OFF on Electronics</span>
        <Link
          href="/sale"
          className="ml-2 underline hover:no-underline font-semibold"
        >
          Shop Now
        </Link>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          aria-label="Close promotion banner"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
