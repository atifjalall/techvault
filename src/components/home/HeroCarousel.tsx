"use client";

import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

const heroSlides = [
  {
    id: 1,
    title: "Portable Power",
    subtitle: "Elevate your tunes anywhere",
    description:
      "Meet the ThunderBlast Speaker crafted for bold audio, rich bass, and durability. Take your music outdoors or enjoy room filling sound wherever you go.",
    ctaPrimary: "Shop Speakers",
    ctaSecondary: "Browse All Audio",
    image: "/carousel/speaker.png",
    product: {
      name: "ThunderBlast Speaker",
      price: 729.0,
      originalPrice: 899.0,
      image: "/carousel/blaster.jpg",
    },
    background: "bg-gradient-to-r from-gray-50 to-gray-100",
  },
  {
    id: 2,
    title: "Wireless Beats",
    subtitle: "Long battery, lightweight comfort",
    description:
      "The Sony WH CH520 delivers up to 50 hours of playtime with sleek wireless design, reliable Bluetooth connection, and balanced sound for daily listening needs.",
    ctaPrimary: "Shop Headphones",
    ctaSecondary: "View All Audio",
    image: "/carousel/sonyheadphonesmodel.png",
    product: {
      name: "Sony WH CH520",
      price: 69.99,
      originalPrice: 99.99,
      image: "/carousel/sonyheadphones.webp",
    },
    background: "bg-gradient-to-r from-blue-50 to-indigo-100",
  },
  {
    id: 3,
    title: "Flagship Excellence",
    subtitle: "Innovation in every detail",
    description:
      "Power meets craftsmanship in the HUAWEI Pura 70 Ultra ultra fast display, premium cameras, and a beautiful design for those who demand top tier performance.",
    ctaPrimary: "Shop Phones",
    ctaSecondary: "See Smartphones",
    image: "/carousel/huaweipuramodel.png",
    product: {
      name: "HUAWEI Pura 70 Ultra",
      price: 859.0,
      originalPrice: 1_199.0,
      image: "/carousel/huaweipura70.jpg",
    },
    background: "bg-gradient-to-r from-green-50 to-emerald-100",
  },
  {
    id: 4,
    title: "Gaming Power",
    subtitle: "Power & portability in balance",
    description:
      "The Razer Blade 16 blends premium build with extreme performance, delivering fast graphics, advanced cooling, and stunning visuals for both gamers and creators.",
    ctaPrimary: "Shop Laptops",
    ctaSecondary: "Explore Gaming",
    image: "/carousel/razerblademodel.png",
    product: {
      name: "Razer Blade 16",
      price: 3_005.94,
      originalPrice: 3_499.99,
      image: "/carousel/razerblade16.webp",
    },
    background: "bg-gradient-to-r from-purple-50 to-violet-100",
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
            <div className="relative flex justify-center items-center lg:justify-end">
              <div className="relative">
                {/* Main product image */}
                <div className="w-[450px] h-[450px] lg:w-[550px] lg:h-[550px] relative">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Product Info Card - Positioned further right to avoid covering image */}
                <div className="absolute bottom-8 -right-4 lg:bottom-12 lg:-right-8 bg-white rounded-lg shadow-xl p-4 w-64 z-10 border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <Image
                        src={slide.product.image}
                        alt={slide.product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {slide.product.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(slide.product.price)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(slide.product.originalPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Featured</p>
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
            className={`transition-all duration-300 rounded-full cursor-pointer ${
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
