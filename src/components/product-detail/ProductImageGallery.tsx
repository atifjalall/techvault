"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  selectedImage: number;
  onImageSelect: (index: number) => void;
  newArrival?: boolean;
  discountPercentage?: number;
}

export default function ProductImageGallery({
  images,
  productName,
  selectedImage,
  onImageSelect,
  newArrival = false,
  discountPercentage = 0,
}: ProductImageGalleryProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePrevImage = () => {
    onImageSelect(selectedImage > 0 ? selectedImage - 1 : images.length - 1);
  };

  const handleNextImage = () => {
    onImageSelect(selectedImage < images.length - 1 ? selectedImage + 1 : 0);
  };

  const currentImage = images[selectedImage] || images[0] || "";

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <motion.div
        className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative group"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Image
          src={currentImage}
          alt={productName}
          fill
          className="object-cover"
          priority
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
        />

        {/* Badges */}
        {newArrival && (
          <motion.div
            className="absolute top-3 left-3 bg-slate-900 text-white px-2 py-1 rounded-md text-xs font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            New
          </motion.div>
        )}
        {discountPercentage > 0 && (
          <motion.div
            className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            -{discountPercentage}%
          </motion.div>
        )}

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <motion.button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeftIcon className="w-4 h-4 text-slate-700" />
            </motion.button>
            <motion.button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRightIcon className="w-4 h-4 text-slate-700" />
            </motion.button>
          </>
        )}
      </motion.div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => onImageSelect(index)}
              className={`flex-shrink-0 aspect-square w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                selectedImage === index
                  ? "border-slate-900"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
