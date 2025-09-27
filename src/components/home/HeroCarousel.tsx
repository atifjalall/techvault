"use client";

import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const heroSlides = [
  {
    id: 1,
    title: "Portable Power",
    subtitle: "Elevate your tunes anywhere",
    description:
      "Meet the ThunderBlast Speaker crafted for bold audio, rich bass, and durability. Take your music outdoors or enjoy room filling sound wherever you go.",
    ctaPrimary: "Shop Speakers",
    ctaSecondary: "Browse All Audio",
    image: "/carousel/speakermodel.png",
    product: {
      name: "ThunderBlast Speaker",
      price: 729.0,
      originalPrice: 899.0,
      image: "/carousel/speaker.jpg",
    },
    background: "from-slate-900 via-purple-900 to-slate-900",
    gradientOverlay: "from-blue-600/20 via-purple-600/30 to-pink-600/20",
    accent: "blue",
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
    background: "from-amber-900 via-orange-900 to-amber-900",
    gradientOverlay: "from-amber-600/20 via-orange-600/30 to-yellow-600/20",
    accent: "amber",
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
    background: "from-emerald-900 via-teal-900 to-emerald-900",
    gradientOverlay: "from-emerald-600/20 via-teal-600/30 to-cyan-600/20",
    accent: "emerald",
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
    background: "from-violet-900 via-fuchsia-900 to-violet-900",
    gradientOverlay: "from-violet-600/20 via-pink-600/30 to-rose-600/20",
    accent: "violet",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    if (index === currentSlide || isTransitioning) return;

    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const nextSlide = () => {
    if (isTransitioning) return;

    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const prevSlide = () => {
    if (isTransitioning) return;

    setDirection(-1);
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1,
    }),
  };

  const contentVariants = {
    enter: {
      opacity: 0,
      y: 60,
      scale: 0.9,
    },
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: -40,
      scale: 1.1,
    },
  };

  const imageVariants = {
    enter: {
      opacity: 0,
      scale: 0.7,
      rotate: -10,
      y: 120,
    },
    center: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 1.2,
      rotate: 10,
      y: -80,
    },
  };

  const productCardVariants = {
    enter: {
      opacity: 0,
      scale: 0.6,
      y: 100,
      x: 60,
      rotate: -15,
    },
    center: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      rotate: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -60,
      x: -30,
      rotate: 15,
    },
  };

  return (
    <div className="relative overflow-hidden min-h-[700px] lg:min-h-[800px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatePresence custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.3, ease: "easeInOut" },
            scale: { duration: 0.3, ease: "easeOut" },
          }}
          onAnimationStart={() => setIsTransitioning(true)}
          onAnimationComplete={() => setIsTransitioning(false)}
          className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].background}`}
        >
          {/* Dynamic Gradient Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].gradientOverlay}`}
          />

          {/* Animated Mesh Background */}
          <div className="absolute inset-0 opacity-30">
            <motion.div
              animate={{
                background: [
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 40% 60%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-full h-full"
            />
          </div>

          {/* Glass Morphism Overlay */}
          <div className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-b from-white/5 via-transparent to-black/10" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
              {/* Left Content */}
              <motion.div
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  delay: 0.2,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="space-y-8 z-10 relative"
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-lg"
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(255,255,255,0.7)",
                          "0 0 0 4px rgba(255,255,255,0)",
                          "0 0 0 0 rgba(255,255,255,0)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 bg-white rounded-full mr-2"
                    />
                    Featured Product
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                    className="font-heading font-bold text-4xl lg:text-6xl text-white leading-tight tracking-tight"
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="text-lg lg:text-xl text-white/90 font-medium"
                  >
                    {heroSlides[currentSlide].subtitle}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-sm text-white/70 max-w-lg leading-relaxed"
                  >
                    {heroSlides[currentSlide].description}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      y: -3,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-gray-900 px-7 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-300 cursor-pointer shadow-xl backdrop-blur-md"
                  >
                    {heroSlides[currentSlide].ctaPrimary}
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      borderColor: "rgba(255,255,255,0.4)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/5 backdrop-blur-md border border-white/20 text-white px-7 py-3 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    {heroSlides[currentSlide].ctaSecondary}
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Right Content - Product Showcase */}
              <motion.div
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  delay: 0.3,
                  duration: 0.7,
                  ease: "easeOut",
                }}
                className="relative flex justify-center items-center lg:justify-end"
              >
                <div className="relative">
                  {/* Glow Effect Behind Product */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].gradientOverlay} blur-3xl rounded-full`}
                  />

                  {/* Main product image */}
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      rotate: [0, -2, 2, 0],
                      y: -10,
                    }}
                    transition={{
                      scale: { duration: 0.4 },
                      rotate: { duration: 0.8, ease: "easeInOut" },
                      y: { duration: 0.4 },
                    }}
                    className="w-[500px] h-[500px] lg:w-[620px] lg:h-[620px] relative cursor-pointer z-10"
                  >
                    <Image
                      src={heroSlides[currentSlide].image}
                      alt={heroSlides[currentSlide].title}
                      fill
                      className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                      priority
                    />
                  </motion.div>

                  {/* Enhanced Glass Product Info Card */}
                  <motion.div
                    variants={productCardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      delay: 0.6,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      scale: 1.08,
                      y: -8,
                      rotateY: 5,
                    }}
                    className="absolute bottom-8 -right-6 lg:bottom-16 lg:-right-12 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-5 w-72 z-20 cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        className="w-16 h-16 relative flex-shrink-0 overflow-hidden rounded-xl border border-white/20"
                      >
                        <Image
                          src={heroSlides[currentSlide].product.image}
                          alt={heroSlides[currentSlide].product.name}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">
                          {heroSlides[currentSlide].product.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <motion.span
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="text-sm font-bold text-white"
                          >
                            {formatPrice(
                              heroSlides[currentSlide].product.price
                            )}
                          </motion.span>
                          <span className="text-xs text-white/60 line-through">
                            {formatPrice(
                              heroSlides[currentSlide].product.originalPrice
                            )}
                          </span>
                        </div>
                        <motion.div
                          className="flex items-center mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-xs font-medium px-2 py-1 rounded-full bg-white/20 text-white border border-white/30"
                          >
                            Limited Time
                          </motion.span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows with Glass Effect */}
      <motion.button
        whileHover={{
          scale: 1.1,
          x: -3,
          backgroundColor: "rgba(255,255,255,0.15)",
        }}
        whileTap={{ scale: 0.9 }}
        onClick={prevSlide}
        disabled={isTransitioning}
        className="absolute left-6 top-1/2 -translate-y-1/2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full p-3 shadow-2xl transition-all duration-300 z-30 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="h-5 w-5 text-white" />
      </motion.button>

      <motion.button
        whileHover={{
          scale: 1.1,
          x: 3,
          backgroundColor: "rgba(255,255,255,0.15)",
        }}
        whileTap={{ scale: 0.9 }}
        onClick={nextSlide}
        disabled={isTransitioning}
        className="absolute right-6 top-1/2 -translate-y-1/2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full p-3 shadow-2xl transition-all duration-300 z-30 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="h-5 w-5 text-white" />
      </motion.button>

      {/* Slide Indicators with Progress Effect */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
        {heroSlides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            className={`relative transition-all duration-500 rounded-full cursor-pointer overflow-hidden backdrop-blur-md ${
              index === currentSlide
                ? "w-10 h-2 bg-white shadow-lg"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === currentSlide && isAutoPlaying && (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/60 rounded-full"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Auto-play indicator with Glass Effect */}
      <AnimatePresence>
        {isAutoPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute top-6 right-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white shadow-xl z-30"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block mr-2"
            />
            Auto-playing
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Particle Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -100],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeOut",
            }}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              bottom: "10%",
            }}
          />
        ))}
      </div>
    </div>
  );
}
