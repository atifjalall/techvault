"use client";

import { useState } from "react";
import Link from "next/link";
import { XMarkIcon, FireIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function PromoBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 py-1.5"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: "easeOut",
            }}
            className="flex items-center justify-center space-x-2"
          >
            {/* Icon */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex-shrink-0"
            >
              <FireIcon className="h-4 w-4 text-white" />
            </motion.div>

            {/* Text content */}
            <div className="flex items-center space-x-2 text-white">
              <span className="text-[11px] font-medium">
                Winter Sale: Up to
              </span>

              {/* Highlighted text */}
              <motion.span
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-[11px] font-bold text-white bg-white/20 px-2 py-0.5 flex items-center justify-center rounded-full border border-white/30 backdrop-blur-sm"
              >
                50% OFF
              </motion.span>

              <span className="text-[11px] font-medium">Electronics</span>
            </div>

            {/* CTA Button (identical pill style) */}
            <Link
              href="/products?onlyOnSale=true"
              className="group relative flex items-center"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-[11px] font-bold text-white bg-white/20 px-2 py-0.5 flex items-center justify-center rounded-full border border-white/30 backdrop-blur-sm cursor-pointer"
              >
                Shop Now
              </motion.span>
            </Link>
          </motion.div>

          {/* Close button */}
          <motion.button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close promotion banner"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </motion.div>
  );
}
