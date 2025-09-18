"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";

// Mock product data - in real app, this would come from your database
const mockProducts = {
  "iphone-15-pro-max": {
    id: 1,
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    price: 1199.99,
    originalPrice: 1299.99,
    images: [
      "/products/iphone_16_pro_max.jpg",
      "/products/iphone_16_pro_max.jpg",
      "/products/iphone_16_pro_max.jpg",
      "/products/iphone_16_pro_max.jpg",
      "/products/iphone_16_pro_max.jpg",
    ],
    category: "Smartphones",
    rating: 4.8,
    reviewCount: 2847,
    isNew: true,
    inStock: true,
    stockCount: 12,
    slug: "iphone-15-pro-max",
    description:
      "The iPhone 15 Pro Max pushes the boundaries of what's possible in a smartphone. Built with aerospace-grade titanium for exceptional durability and a remarkably light feel.",
    longDescription:
      "Experience the most advanced iPhone ever created. The iPhone 15 Pro Max features a stunning 6.7-inch Super Retina XDR display with ProMotion technology, delivering incredibly smooth and responsive interactions.",
    specifications: [
      { label: "Display", value: "6.7-inch Super Retina XDR" },
      { label: "Chip", value: "A17 Pro" },
      {
        label: "Camera",
        value: "48MP Main, 12MP Ultra Wide, 12MP 2x Telephoto",
      },
      { label: "Storage", value: "256GB, 512GB, 1TB" },
      { label: "Battery", value: "Up to 29 hours video playback" },
      { label: "Material", value: "Titanium with textured matte glass back" },
      {
        label: "Colors",
        value:
          "Natural Titanium, Blue Titanium, White Titanium, Black Titanium",
      },
      { label: "Water Resistance", value: "IP68 (6 meters up to 30 minutes)" },
    ],
    features: [
      "Action Button for quick access to features",
      "48MP Main camera with 2x Telephoto",
      "A17 Pro chip with 6-core GPU",
      "USB-C connectivity",
      "Face ID facial recognition",
      "5G connectivity",
      "Ceramic Shield front",
      "MagSafe and Qi wireless charging",
    ],
    warranty: "1 year limited warranty",
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over €50",
  },
  "macbook-pro-16-m3": {
    id: 2,
    name: "MacBook Pro 16-inch M3",
    brand: "Apple",
    price: 2499.99,
    originalPrice: 2699.99,
    images: [
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
    ],
    category: "Laptops",
    rating: 4.9,
    reviewCount: 1523,
    isNew: true,
    inStock: true,
    stockCount: 5,
    slug: "macbook-pro-16-m3",
    description:
      "The most powerful MacBook Pro ever. With the M3 chip, this laptop delivers exceptional performance for professionals and creatives.",
    longDescription:
      "Built for professionals who demand the best. The 16-inch MacBook Pro with M3 chip offers incredible performance, a gorgeous display, and the longest battery life ever in a MacBook Pro.",
    specifications: [
      { label: "Chip", value: "Apple M3" },
      { label: "Display", value: "16.2-inch Liquid Retina XDR" },
      { label: "Memory", value: "18GB unified memory" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Battery", value: "Up to 22 hours" },
      { label: "Weight", value: "2.16 kg" },
      { label: "Colors", value: "Space Black, Silver" },
      { label: "Ports", value: "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3" },
    ],
    features: [
      "M3 chip with 8-core CPU and 10-core GPU",
      "16.2-inch Liquid Retina XDR display",
      "1080p FaceTime HD camera",
      "Six-speaker sound system with force-cancelling woofers",
      "Studio-quality three-microphone array",
      "Magic Keyboard with Touch ID",
      "Force Touch trackpad",
      "MagSafe 3 charging",
    ],
    warranty: "1 year limited warranty",
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over €50",
  },
  "sony-wh-1000xm5": {
    id: 3,
    name: "Sony WH-1000XM5",
    brand: "Sony",
    price: 299.99,
    originalPrice: 399.99,
    images: [
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
    ],
    category: "Audio",
    rating: 4.7,
    reviewCount: 3921,
    isNew: false,
    inStock: true,
    stockCount: 25,
    slug: "sony-wh-1000xm5",
    description:
      "Industry-leading noise canceling wireless headphones with the new lightweight design and improved noise canceling performance.",
    longDescription:
      "The Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise canceling quality.",
    specifications: [
      { label: "Driver Unit", value: "30mm dome type" },
      {
        label: "Noise Canceling",
        value: "Industry Leading with V1 + QN1 processors",
      },
      { label: "Battery Life", value: "Up to 30 hours with NC ON" },
      { label: "Quick Charge", value: "3 min charge = 3 hours playbook" },
      { label: "Weight", value: "250g" },
      { label: "Frequency Response", value: "4 Hz-40,000 Hz" },
      { label: "Bluetooth", value: "Version 5.2" },
      { label: "Codecs", value: "SBC, AAC, LDAC" },
    ],
    features: [
      "Industry-leading noise canceling with V1 processor",
      "Crystal clear hands-free calling with precise voice pickup",
      "Speak-to-Chat technology stops music when you speak",
      "30-hour battery life with quick charge",
      "Multipoint connection to two devices simultaneously",
      "Touch Sensor controls for play/pause/skip tracks",
      "360 Reality Audio for immersive music experience",
      "Carry case included for travel",
    ],
    warranty: "1 year limited warranty",
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over €50",
  },
  "samsung-galaxy-s24-ultra": {
    id: 4,
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 1099.99,
    originalPrice: 1199.99,
    images: [
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
    ],
    category: "Smartphones",
    rating: 4.6,
    reviewCount: 2156,
    isNew: true,
    inStock: true,
    stockCount: 18,
    slug: "samsung-galaxy-s24-ultra",
    description:
      "Ultimate Android flagship with S Pen and 200MP camera. Built with titanium for durability and featuring the most advanced Galaxy AI capabilities.",
    longDescription:
      "The Samsung Galaxy S24 Ultra sets a new standard for premium Android smartphones. With its stunning 6.8-inch Dynamic AMOLED 2X display, revolutionary 200MP camera system, and built-in S Pen.",
    specifications: [
      { label: "Display", value: "6.8-inch Dynamic AMOLED 2X" },
      { label: "Processor", value: "Snapdragon 8 Gen 3" },
      {
        label: "Camera",
        value: "200MP Main + 50MP Periscope + 10MP Telephoto + 12MP Ultra Wide",
      },
      { label: "Storage", value: "256GB, 512GB, 1TB" },
      { label: "RAM", value: "12GB" },
      { label: "Battery", value: "5000mAh with 45W fast charging" },
      { label: "S Pen", value: "Built-in with Air Actions" },
      { label: "Water Rating", value: "IP68" },
    ],
    features: [
      "200MP main camera with Space Zoom up to 100x",
      "Built-in S Pen with Air Actions",
      "Galaxy AI for enhanced photography and productivity",
      "6.8-inch QHD+ 120Hz display",
      "Titanium frame for premium durability",
      "5000mAh battery with all-day power",
      "45W super fast charging",
      "Samsung DeX for desktop experience",
    ],
    warranty: "1 year limited warranty",
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over €50",
  },
  "dell-xps-13-plus": {
    id: 5,
    name: "Dell XPS 13 Plus",
    brand: "Dell",
    price: 1299.99,
    originalPrice: 1499.99,
    images: [
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
    ],
    category: "Laptops",
    rating: 4.5,
    reviewCount: 892,
    isNew: false,
    inStock: true,
    stockCount: 8,
    slug: "dell-xps-13-plus",
    description:
      "Premium ultrabook with InfinityEdge display and modern design. Features the latest Intel processors and stunning 13.4-inch OLED display option.",
    longDescription:
      "The Dell XPS 13 Plus redefines premium ultrabook design with its seamless glass palm rest, invisible touchpad, and stunning InfinityEdge display.",
    specifications: [
      { label: "Processor", value: "12th Gen Intel Core i7-1260P" },
      { label: "Display", value: "13.4-inch FHD+ InfinityEdge" },
      { label: "Memory", value: "16GB LPDDR5" },
      { label: "Storage", value: "512GB PCIe SSD" },
      { label: "Graphics", value: "Intel Iris Xe Graphics" },
      { label: "Weight", value: "1.26kg" },
      { label: "Battery", value: "Up to 12 hours" },
      { label: "Ports", value: "2x Thunderbolt 4" },
    ],
    features: [
      "13.4-inch InfinityEdge display with minimal bezels",
      "Seamless glass palm rest with haptic touchpad",
      "12th Gen Intel Core processors",
      "Premium machined aluminum construction",
      "Backlit keyboard with larger keycaps",
      "Thunderbolt 4 connectivity",
      "Windows Hello fingerprint reader",
      "Dell Mobile Connect for smartphone integration",
    ],
    warranty: "1 year limited warranty",
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over €50",
  },
  "airpods-pro-2nd-gen": {
    id: 6,
    name: "AirPods Pro 2nd Gen",
    brand: "Apple",
    price: 199.99,
    originalPrice: 249.99,
    images: [
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
      "/api/placeholder/800/800",
    ],
    category: "Audio",
    rating: 4.8,
    reviewCount: 4127,
    isNew: false,
    inStock: true,
    stockCount: 35,
    slug: "airpods-pro-2nd-gen",
    description:
      "Active noise cancellation with adaptive transparency. The new H2 chip delivers smarter noise cancellation and three-dimensional sound.",
    longDescription:
      "AirPods Pro 2nd generation feature up to 2x more Active Noise Cancellation, plus Adaptive Transparency, and Personalized Spatial Audio with dynamic head tracking.",
    specifications: [
      { label: "Chip", value: "Apple H2 headphone chip" },
      { label: "Audio", value: "Adaptive EQ, Personalized Spatial Audio" },
      { label: "Battery", value: "Up to 6 hours listening (single charge)" },
      { label: "Case Battery", value: "Up to 30 hours total listening time" },
      { label: "Charging", value: "Lightning, MagSafe, Qi wireless" },
      { label: "Water Resistance", value: "IPX4 (earbuds and case)" },
      { label: "Controls", value: "Force sensor, Siri voice control" },
      {
        label: "Compatibility",
        value: "iPhone, iPad, Mac, Apple Watch, Apple TV",
      },
    ],
    features: [
      "Up to 2x more Active Noise Cancellation",
      "Adaptive Transparency lets outside sound in",
      "Personalized Spatial Audio with dynamic head tracking",
      "Multiple ear tip sizes (XS, S, M, L)",
      "Touch control for music and calls",
      "Hey Siri always listening",
      "Audio Sharing between two sets of AirPods",
      "MagSafe charging case with speaker and lanyard loop",
    ],
    warranty: "1 year limited warranty",
    returnPolicy: "30-day return policy",
    shipping: "Free shipping on orders over €50",
  },
};

type Product = (typeof mockProducts)[keyof typeof mockProducts];

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedTab, setSelectedTab] = useState("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // In real app, fetch product by id from database
  const product: Product | undefined =
    mockProducts[id as keyof typeof mockProducts];

  useEffect(() => {
    if (!product) {
      console.log("Product not found");
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-medium text-slate-900 mb-1">
            Product Not Found
          </h1>
          <p className="text-sm text-slate-600">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (action: "increase" | "decrease") => {
    if (action === "increase" && quantity < product.stockCount) {
      setQuantity(quantity + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsAddingToCart(false);
    console.log(`Added ${quantity} ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    console.log(`Buy now: ${quantity} ${product.name}`);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageLoaded) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Amazon-style magnifier positioning
    const magnifierSize = 180;
    const halfSize = magnifierSize / 2;

    let magnifierX = x - halfSize;
    let magnifierY = y - halfSize;

    // Keep magnifier within image bounds
    magnifierX = Math.max(0, Math.min(magnifierX, rect.width - magnifierSize));
    magnifierY = Math.max(0, Math.min(magnifierY, rect.height - magnifierSize));

    setMagnifierPosition({ x: magnifierX, y: magnifierY });

    // Calculate background position for zoom effect
    const backgroundX = -((x / rect.width) * (rect.width * 3)) + halfSize;
    const backgroundY = -((y / rect.height) * (rect.height * 3)) + halfSize;

    const magnifier = document.querySelector(".magnifier") as HTMLElement;
    if (magnifier) {
      magnifier.style.backgroundPosition = `${backgroundX}px ${backgroundY}px`;
    }
  };

  const handleMouseEnter = () => {
    if (imageLoaded) {
      setShowMagnifier(true);
    }
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <motion.div
              className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative group cursor-crosshair"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                onLoad={() => setImageLoaded(true)}
              />

              {/* Amazon-Style Square Magnifier */}
              <AnimatePresence>
                {showMagnifier && (
                  <motion.div
                    className="magnifier absolute pointer-events-none border-2 border-white shadow-xl"
                    style={{
                      width: "180px",
                      height: "180px",
                      left: `${magnifierPosition.x}px`,
                      top: `${magnifierPosition.y}px`,
                      backgroundImage: `url(${product.images[selectedImage]})`,
                      backgroundSize: "300% 300%",
                      backgroundRepeat: "no-repeat",
                      zIndex: 15,
                      borderRadius: "6px",
                      boxShadow:
                        "0 20px 40px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5)",
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>

              {product.isNew && (
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
              <motion.button
                onClick={() =>
                  setSelectedImage(
                    selectedImage > 0
                      ? selectedImage - 1
                      : product.images.length - 1
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeftIcon className="w-4 h-4 text-slate-700" />
              </motion.button>
              <motion.button
                onClick={() =>
                  setSelectedImage(
                    selectedImage < product.images.length - 1
                      ? selectedImage + 1
                      : 0
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRightIcon className="w-4 h-4 text-slate-700" />
              </motion.button>
            </motion.div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 aspect-square w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === index
                      ? "border-slate-900"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            {/* Brand and Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {product.brand}
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 mt-1 leading-tight">
                {product.name}
              </h1>
            </motion.div>

            {/* Rating and Reviews */}
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIconSolid
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
                <span className="text-sm font-medium text-slate-900 ml-1">
                  {product.rating}
                </span>
              </div>
              <span className="text-sm text-slate-500">
                ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </motion.div>

            {/* Pricing */}
            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-slate-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-slate-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Save {discountPercentage}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Tax included. Shipping calculated at checkout.
              </p>
            </motion.div>

            {/* Stock Status */}
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {product.inStock ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    In stock ({product.stockCount} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-600">
                    Out of stock
                  </span>
                </>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              className="text-sm text-slate-600 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <p>{product.description}</p>
            </motion.div>

            {/* Quantity and Add to Cart */}
            <motion.div
              className="space-y-3 pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-slate-700">
                  Qty:
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg">
                  <motion.button
                    onClick={() => handleQuantityChange("decrease")}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MinusIcon className="w-3 h-3" />
                  </motion.button>
                  <span className="px-3 py-2 text-sm font-medium border-x border-slate-300 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <motion.button
                    onClick={() => handleQuantityChange("increase")}
                    disabled={quantity >= product.stockCount}
                    className="p-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <PlusIcon className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                  className="flex-1 bg-black text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <AnimatePresence mode="wait">
                    {isAddingToCart ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                      />
                    ) : (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <ShoppingCartIcon className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-2.5 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isWishlisted ? (
                    <HeartIconSolid className="w-4 h-4 text-red-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4" />
                  )}
                </motion.button>

                <motion.button
                  className="p-2.5 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShareIcon className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Buy Now Button */}
              <motion.button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="w-full bg-black text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Buy Now
              </motion.button>
            </motion.div>

            {/* Features */}
            <motion.div
              className="grid grid-cols-3 gap-3 py-4 border-t border-slate-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <div className="text-center">
                <TruckIcon className="w-5 h-5 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-medium text-slate-900">
                  Free Shipping
                </p>
                <p className="text-xs text-slate-500">Orders over €50</p>
              </div>
              <div className="text-center">
                <ArrowPathIcon className="w-5 h-5 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-medium text-slate-900">
                  30-Day Returns
                </p>
                <p className="text-xs text-slate-500">Money back guarantee</p>
              </div>
              <div className="text-center">
                <ShieldCheckIcon className="w-5 h-5 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-medium text-slate-900">Warranty</p>
                <p className="text-xs text-slate-500">1 year coverage</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6">
              {["description", "specifications", "reviews"].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-3 px-1 border-b-2 text-sm font-medium capitalize transition-colors ${
                    selectedTab === tab
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab}
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="py-6">
            <AnimatePresence mode="wait">
              {selectedTab === "description" && (
                <motion.div
                  className="max-w-3xl"
                  key="description"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-slate-900 mb-3">
                    Product Description
                  </h3>
                  <div className="prose prose-sm prose-slate max-w-none">
                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {product.longDescription}
                    </p>

                    <h4 className="text-base font-medium text-slate-900 mb-3">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start space-x-2"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-600">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === "specifications" && (
                <motion.div
                  className="max-w-3xl"
                  key="specifications"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-slate-900 mb-3">
                    Technical Specifications
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                      {product.specifications.map((spec, index) => (
                        <motion.div
                          key={index}
                          className="border-b border-slate-200 pb-2 last:border-b-0"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <dt className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            {spec.label}
                          </dt>
                          <dd className="text-sm text-slate-900 mt-1">
                            {spec.value}
                          </dd>
                        </motion.div>
                      ))}
                    </dl>
                  </div>
                </motion.div>
              )}

              {selectedTab === "reviews" && (
                <motion.div
                  className="max-w-3xl"
                  key="reviews"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-slate-900 mb-3">
                    Customer Reviews
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-6 text-center">
                    <p className="text-slate-600 text-sm">
                      Review system coming soon...
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Current rating: {product.rating}/5 (
                      {product.reviewCount.toLocaleString()} reviews)
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
