"use client";

import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/lib/utils";

const heroSlides = [
  {
    id: 1,
    title: "Sound On The Go",
    subtitle: "Premium audio that moves with your lifestyle",
    description:
      "Discover our latest collection of wireless speakers and headphones designed for the modern lifestyle.",
    ctaPrimary: "Shop Speakers",
    ctaSecondary: "Browse All Categories",
    image: "/api/placeholder/600/400",
    product: {
      name: "ThunderBlast Speaker",
      price: 729.0,
      originalPrice: 899.0,
      image: "/api/placeholder/200/200",
    },
    background: "bg-gradient-to-r from-gray-50 to-gray-100",
  },
  {
    id: 2,
    title: "Gaming Revolution",
    subtitle: "Next-level gaming experiences await",
    description:
      "Immerse yourself in cutting-edge gaming technology with our premium collection.",
    ctaPrimary: "Shop Gaming",
    ctaSecondary: "View Consoles",
    image: "/api/placeholder/600/400",
    product: {
      name: "Pro Gaming Headset",
      price: 299.0,
      originalPrice: 399.0,
      image: "/api/placeholder/200/200",
    },
    background: "bg-gradient-to-r from-blue-50 to-indigo-100",
  },
  {
    id: 3,
    title: "Work From Anywhere",
    subtitle: "Professional computing solutions",
    description:
      "Power up your productivity with our range of laptops and workstation accessories.",
    ctaPrimary: "Shop Laptops",
    ctaSecondary: "View Accessories",
    image: "/api/placeholder/600/400",
    product: {
      name: "UltraBook Pro",
      price: 1299.0,
      originalPrice: 1499.0,
      image: "/api/placeholder/200/200",
    },
    background: "bg-gradient-to-r from-green-50 to-emerald-100",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume after 10s
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const slide = heroSlides[currentSlide];

  return (
    <div className="relative overflow-hidden">
      <div
        className={`${slide.background} transition-all duration-700 ease-in-out`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-base lg:text-lg text-gray-600 font-medium">
                  {slide.subtitle}
                </p>
                <p className="text-sm text-gray-500 max-w-md">
                  {slide.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-black text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer">
                  {slide.ctaPrimary}
                </button>
                <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                  {slide.ctaSecondary}
                </button>
              </div>
            </div>

            {/* Right Content - Product Showcase */}
            <div className="relative flex justify-center items-center">
              <div className="relative">
                {/* Main product image placeholder */}
                <div className="w-96 h-96 bg-gray-200 rounded-2xl flex items-center justify-center mb-8">
                  <div className="text-gray-400 text-center">
                    <div className="w-32 h-32 bg-gray-300 rounded-lg mx-auto mb-4"></div>
                    <p className="text-xs">Product Image</p>
                  </div>
                </div>

                {/* Product Info Card */}
                <div className="absolute bottom-0 right-4 bg-white rounded-lg shadow-xl p-6 max-w-xs">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {slide.product.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-base font-bold text-gray-900">
                          {formatPrice(slide.product.price)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(slide.product.originalPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">From</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="h-6 w-6 text-gray-700" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-8 h-2 bg-black"
                : "w-2 h-2 bg-black/50 hover:bg-black/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      {isAutoPlaying && (
        <div className="absolute top-4 right-4 bg-white/80 rounded-full px-3 py-1 text-xs text-gray-600">
          Auto-playing
        </div>
      )}
    </div>
  );
}
