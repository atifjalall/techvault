"use client";

import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const heroSlides = [
  {
    id: 1,
    title: "Portable Power",
    subtitle: "Elevate your tunes anywhere",
    description:
      "Meet the ThunderBlast Speaker crafted for bold audio, rich bass, and durability. Take your music outdoors or enjoy room filling sound wherever you go.",
    ctaPrimary: "Shop Speakers",
    ctaPrimaryLink: "/products?category=audio&subcategory=speakers",
    ctaSecondary: "Browse All Audio",
    ctaSecondaryLink: "/products?category=audio",
    image: "/carousel/speakermodel.png",
    product: {
      name: "ThunderBlast Speaker",
      price: 729.0,
      originalPrice: 899.0,
      image: "/carousel/speaker.jpg",
      slug: "thunderblast-speaker",
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
    ctaPrimaryLink: "/products?category=audio&subcategory=headphones",
    ctaSecondary: "View All Audio",
    ctaSecondaryLink: "/products?category=audio",
    image: "/carousel/sonyheadphonesmodel.png",
    product: {
      name: "Sony WH CH520",
      price: 69.99,
      originalPrice: 99.99,
      image: "/carousel/sonyheadphones.webp",
      slug: "sony-wh-ch520",
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
    ctaPrimaryLink: "/products?category=electronics&subcategory=smartphones",
    ctaSecondary: "See Smartphones",
    ctaSecondaryLink: "/products?category=electronics&subcategory=smartphones",
    image: "/carousel/huaweipuramodel.png",
    product: {
      name: "HUAWEI Pura 70 Ultra",
      price: 859.0,
      originalPrice: 1_199.0,
      image: "/carousel/huaweipura70.jpg",
      slug: "huawei-pura-70-ultra",
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
    ctaPrimaryLink: "/products?category=computing&subcategory=laptops",
    ctaSecondary: "Explore Gaming",
    ctaSecondaryLink: "/products?category=gaming",
    image: "/carousel/razerblademodel.png",
    product: {
      name: "Razer Blade 16",
      price: 3_005.94,
      originalPrice: 3_499.99,
      image: "/carousel/razerblade16.webp",
      slug: "razer-blade-16",
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
    <div className="relative overflow-hidden min-h-[500px] sm:min-h-[650px] lg:min-h-[800px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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

          <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-28 h-full">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-12 items-center min-h-[420px] sm:min-h-[570px] lg:min-h-[600px]">
              {/* Mobile: Image First (Top) */}
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
                className="relative flex justify-center items-center lg:justify-end lg:order-2 w-full"
              >
                <div className="relative w-full max-w-[200px] sm:max-w-[280px] lg:max-w-[620px]">
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
                      scale: 1.03,
                      y: -8,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                    className="w-full aspect-square relative cursor-pointer z-10"
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
                  <Link
                    href={`/products/${heroSlides[currentSlide].product.slug}`}
                  >
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
                        scale: 1.05,
                        y: -6,
                      }}
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 sm:-bottom-6 lg:bottom-16 lg:left-auto lg:translate-x-0 lg:-right-12 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl lg:rounded-2xl shadow-2xl p-2 sm:p-3 lg:p-5 w-48 sm:w-60 lg:w-72 z-20 cursor-pointer"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      }}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                        {/* Small product thumbnail */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          className="w-8 h-8 sm:w-10 sm:h-10 lg:w-16 lg:h-16 relative flex-shrink-0 overflow-hidden rounded-lg lg:rounded-xl border border-white/20"
                        >
                          <Image
                            src={heroSlides[currentSlide].product.image}
                            alt={heroSlides[currentSlide].product.name}
                            fill
                            className="object-cover"
                          />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-[9px] sm:text-xs lg:text-sm truncate">
                            {heroSlides[currentSlide].product.name}
                          </h3>
                          <div className="flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2 mt-0.5 sm:mt-1 lg:mt-1.5">
                            <motion.span
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              className="text-[10px] sm:text-xs lg:text-sm font-bold text-white"
                            >
                              {formatPrice(
                                heroSlides[currentSlide].product.price
                              )}
                            </motion.span>
                            <span className="text-[8px] sm:text-[10px] lg:text-xs text-white/60 line-through">
                              {formatPrice(
                                heroSlides[currentSlide].product.originalPrice
                              )}
                            </span>
                          </div>
                          <motion.div
                            className="flex items-center mt-0.5 sm:mt-1 lg:mt-1.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                          >
                            <motion.span
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-[8px] sm:text-[10px] lg:text-xs font-medium px-1 sm:px-1.5 lg:px-2 py-0.5 sm:py-0.5 lg:py-1 rounded-full bg-white/20 text-white border border-white/30"
                            >
                              Limited Time
                            </motion.span>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {/* Mobile: Content Second (Bottom), Desktop: Left */}
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
                className="space-y-2 sm:space-y-3 lg:space-y-8 z-10 relative text-center lg:text-left lg:order-1"
              >
                <div className="space-y-1 sm:space-y-2 lg:space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-3 lg:py-1.5 rounded-full text-[8px] sm:text-[10px] lg:text-xs font-semibold backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-lg"
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
                      className="w-0.5 h-0.5 sm:w-1 sm:h-1 lg:w-1.5 lg:h-1.5 bg-white rounded-full mr-1 sm:mr-1.5 lg:mr-2"
                    />
                    Featured Product
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                    className="font-heading font-bold text-xl sm:text-2xl lg:text-6xl text-white leading-tight tracking-tight"
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="text-xs sm:text-sm lg:text-xl text-white/90 font-medium"
                  >
                    {heroSlides[currentSlide].subtitle}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-[10px] sm:text-xs lg:text-sm text-white/70 max-w-lg leading-relaxed mx-auto lg:mx-0"
                  >
                    {heroSlides[currentSlide].description}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 lg:gap-4 justify-center lg:justify-start"
                >
                  <Link href={heroSlides[currentSlide].ctaPrimaryLink}>
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        y: -3,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto bg-white text-gray-900 px-4 py-1.5 sm:px-5 sm:py-2 lg:px-7 lg:py-3 rounded-lg lg:rounded-xl text-[10px] sm:text-xs lg:text-sm font-semibold hover:bg-gray-50 transition-all duration-300 cursor-pointer shadow-xl backdrop-blur-md"
                    >
                      {heroSlides[currentSlide].ctaPrimary}
                    </motion.button>
                  </Link>
                  <Link href={heroSlides[currentSlide].ctaSecondaryLink}>
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        backgroundColor: "rgba(255,255,255,0.15)",
                        borderColor: "rgba(255,255,255,0.4)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto bg-white/5 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 sm:px-5 sm:py-2 lg:px-7 lg:py-3 rounded-lg lg:rounded-xl text-[10px] sm:text-xs lg:text-sm font-medium hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      {heroSlides[currentSlide].ctaSecondary}
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows with Glass Effect - Hidden on mobile */}
      <motion.button
        whileHover={{
          scale: 1.1,
          x: -3,
          backgroundColor: "rgba(255,255,255,0.15)",
        }}
        whileTap={{ scale: 0.9 }}
        onClick={prevSlide}
        disabled={isTransitioning}
        className="hidden sm:block absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full p-1.5 lg:p-3 shadow-2xl transition-all duration-300 z-30 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
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
        className="hidden sm:block absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full p-1.5 lg:p-3 shadow-2xl transition-all duration-300 z-30 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
      </motion.button>

      {/* Slide Indicators with Progress Effect */}
      <div className="absolute bottom-3 sm:bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2 lg:space-x-3 z-30">
        {heroSlides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            className={`relative transition-all duration-500 rounded-full cursor-pointer overflow-hidden backdrop-blur-md ${
              index === currentSlide
                ? "w-6 sm:w-8 lg:w-10 h-1 sm:h-1.5 lg:h-2 bg-white shadow-lg"
                : "w-1 sm:w-1.5 lg:w-2 h-1 sm:h-1.5 lg:h-2 bg-white/40 hover:bg-white/70"
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

      {/* Auto-play indicator with Glass Effect - Hidden on mobile */}
      <AnimatePresence>
        {isAutoPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="hidden sm:block absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-[10px] sm:text-xs text-white shadow-xl z-30 cursor-pointer"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full inline-block mr-1.5 sm:mr-2"
            />
            Auto-playing
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Particle Effect - Reduced on mobile */}
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
            className="absolute w-1 h-1 bg-white/30 rounded-full hidden sm:block"
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
