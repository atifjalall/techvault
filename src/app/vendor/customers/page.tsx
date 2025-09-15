/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ShoppingBagIcon,
  CurrencyEuroIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  HeartIcon,
  TrophyIcon,
  UserPlusIcon,
  UsersIcon,
  BanknotesIcon,
  GiftIcon,
  TagIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";
import React from "react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  location?: {
    city: string;
    country: string;
  };
  registeredAt: string;
  lastOrderAt?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lifetimeValue: number;
  orderFrequency: number; // orders per month
  loyaltyLevel: "new" | "regular" | "vip" | "champion";
  preferredCategories: string[];
  lastPurchasedProducts: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    purchasedAt: string;
  }>;
  notes?: string;
  tags: string[];
  isActive: boolean;
  riskScore: number; // 0-100 (churn risk)
  satisfactionScore?: number; // 1-5 stars
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  socialMedia?: {
    platform: string;
    handle: string;
  }[];
}

interface CustomersResponse {
  success: boolean;
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  analytics: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
    averageLifetimeValue: number;
    topSpenders: number;
    churnRisk: number;
    satisfactionAverage: number;
  };
}

// Mock data for demo
const mockCustomersData: CustomersResponse = {
  success: true,
  customers: [
    {
      id: "1",
      name: "Maria Schmidt",
      email: "maria.schmidt@email.com",
      phone: "+49 151 23456789",
      image: "/profiles/Vector1.png",
      location: { city: "Berlin", country: "Germany" },
      registeredAt: "2024-01-15T10:30:00Z",
      lastOrderAt: "2024-08-20T14:22:00Z",
      totalOrders: 12,
      totalSpent: 2450.8,
      averageOrderValue: 204.23,
      lifetimeValue: 3200.0,
      orderFrequency: 2.5,
      loyaltyLevel: "vip",
      preferredCategories: ["Electronics", "Audio"],
      lastPurchasedProducts: [
        {
          id: "1",
          name: "iPhone 15 Pro",
          image: "/products/iphone_16_pro_max.jpg",
          price: 1199,
          purchasedAt: "2024-08-20T14:22:00Z",
        },
        {
          id: "2",
          name: "AirPods Pro",
          image: "/products/iphone_16_pro_max.jpg",
          price: 279,
          purchasedAt: "2024-08-20T14:22:00Z",
        },
      ],
      notes:
        "Premium customer, always pays on time. Interested in latest tech.",
      tags: ["Premium", "Tech Enthusiast", "Regular"],
      isActive: true,
      riskScore: 15,
      satisfactionScore: 5,
      communicationPreferences: { email: true, sms: false, phone: true },
      socialMedia: [{ platform: "LinkedIn", handle: "@mariaschmidt" }],
    },
    {
      id: "2",
      name: "Thomas Mueller",
      email: "thomas.mueller@company.de",
      phone: "+49 172 87654321",
      image: "/profiles/Vector2.png",
      location: { city: "Munich", country: "Germany" },
      registeredAt: "2024-03-22T09:15:00Z",
      lastOrderAt: "2024-08-18T11:45:00Z",
      totalOrders: 8,
      totalSpent: 1680.5,
      averageOrderValue: 210.06,
      lifetimeValue: 2100.0,
      orderFrequency: 1.8,
      loyaltyLevel: "regular",
      preferredCategories: ["Computing", "Gaming"],
      lastPurchasedProducts: [
        {
          id: "3",
          name: "MacBook Air M3",
          image: "/products/iphone_16_pro_max.jpg",
          price: 1299,
          purchasedAt: "2024-08-18T11:45:00Z",
        },
      ],
      notes: "Business customer, bulk orders occasionally.",
      tags: ["Business", "Gaming", "Bulk Buyer"],
      isActive: true,
      riskScore: 35,
      satisfactionScore: 4,
      communicationPreferences: { email: true, sms: true, phone: false },
    },
    {
      id: "3",
      name: "Sophie Weber",
      email: "sophie.weber@gmail.com",
      image: "/profiles/Vector_3.png",
      location: { city: "Hamburg", country: "Germany" },
      registeredAt: "2024-07-10T16:20:00Z",
      lastOrderAt: "2024-07-25T13:30:00Z",
      totalOrders: 2,
      totalSpent: 580.0,
      averageOrderValue: 290.0,
      lifetimeValue: 800.0,
      orderFrequency: 0.8,
      loyaltyLevel: "new",
      preferredCategories: ["Audio", "Smart Home"],
      lastPurchasedProducts: [
        {
          id: "4",
          name: "Sony WH-1000XM5",
          image: "/products/iphone_16_pro_max.jpg",
          price: 380,
          purchasedAt: "2024-07-25T13:30:00Z",
        },
      ],
      tags: ["New Customer", "Audio Lover"],
      isActive: true,
      riskScore: 65,
      satisfactionScore: 4,
      communicationPreferences: { email: true, sms: false, phone: false },
    },
    {
      id: "4",
      name: "Alexander Richter",
      email: "alex.richter@techcorp.com",
      phone: "+49 160 11223344",
      image: "/profiles/Vector_4.png",
      location: { city: "Frankfurt", country: "Germany" },
      registeredAt: "2023-11-08T12:45:00Z",
      lastOrderAt: "2024-08-22T09:15:00Z",
      totalOrders: 25,
      totalSpent: 4890.75,
      averageOrderValue: 195.63,
      lifetimeValue: 6500.0,
      orderFrequency: 3.2,
      loyaltyLevel: "champion",
      preferredCategories: ["Electronics", "Computing", "Gaming"],
      lastPurchasedProducts: [
        {
          id: "5",
          name: "iPad Pro 12.9",
          image: "/products/iphone_16_pro_max.jpg",
          price: 1299,
          purchasedAt: "2024-08-22T09:15:00Z",
        },
        {
          id: "6",
          name: "Apple Pencil Pro",
          image: "/products/iphone_16_pro_max.jpg",
          price: 129,
          purchasedAt: "2024-08-22T09:15:00Z",
        },
      ],
      notes:
        "Champion customer! Always leaves great reviews. Corporate account.",
      tags: ["Champion", "Corporate", "Reviewer", "High Value"],
      isActive: true,
      riskScore: 5,
      satisfactionScore: 5,
      communicationPreferences: { email: true, sms: true, phone: true },
      socialMedia: [
        { platform: "Twitter", handle: "@alexrichter" },
        { platform: "LinkedIn", handle: "@alexanderrichter" },
      ],
    },
    {
      id: "5",
      name: "Emma Fischer",
      email: "emma.fischer@startup.io",
      image: "/profiles/Vector_5.png",
      location: { city: "Stuttgart", country: "Germany" },
      registeredAt: "2024-02-14T14:20:00Z",
      lastOrderAt: "2024-06-10T16:45:00Z",
      totalOrders: 4,
      totalSpent: 920.4,
      averageOrderValue: 230.1,
      lifetimeValue: 1200.0,
      orderFrequency: 0.9,
      loyaltyLevel: "regular",
      preferredCategories: ["Smart Home", "Audio"],
      lastPurchasedProducts: [
        {
          id: "7",
          name: "HomePod mini",
          image: "/products/iphone_16_pro_max.jpg",
          price: 109,
          purchasedAt: "2024-06-10T16:45:00Z",
        },
      ],
      tags: ["Startup", "Smart Home"],
      isActive: false,
      riskScore: 85,
      satisfactionScore: 3,
      communicationPreferences: { email: true, sms: false, phone: false },
    },
  ],
  pagination: {
    page: 1,
    limit: 15,
    totalCount: 156,
    totalPages: 11,
  },
  analytics: {
    totalCustomers: 156,
    newCustomersThisMonth: 23,
    activeCustomers: 142,
    averageLifetimeValue: 1847.5,
    topSpenders: 18,
    churnRisk: 12,
    satisfactionAverage: 4.2,
  },
};

// Loyalty Level Configuration
const LOYALTY_LEVELS = {
  new: {
    label: "New Customer",
    color: "bg-blue-100 text-blue-800",
    icon: UserPlusIcon,
    description: "Recently joined",
  },
  regular: {
    label: "Regular",
    color: "bg-green-100 text-green-800",
    icon: UsersIcon,
    description: "Repeat customer",
  },
  vip: {
    label: "VIP",
    color: "bg-purple-100 text-purple-800",
    icon: StarIconSolid,
    description: "High-value customer",
  },
  champion: {
    label: "Champion",
    color: "bg-yellow-100 text-yellow-800",
    icon: TrophyIcon,
    description: "Top-tier customer",
  },
};

// Loyalty Badge Component
function LoyaltyBadge({ level }: { level: keyof typeof LOYALTY_LEVELS }) {
  const config = LOYALTY_LEVELS[level];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
}

// Risk Score Component
function RiskScore({ score }: { score: number }) {
  const getRiskLevel = () => {
    if (score <= 25)
      return { label: "Low Risk", color: "text-green-600 bg-green-100" };
    if (score <= 50)
      return { label: "Medium Risk", color: "text-yellow-600 bg-yellow-100" };
    if (score <= 75)
      return { label: "High Risk", color: "text-orange-600 bg-orange-100" };
    return { label: "Critical Risk", color: "text-red-600 bg-red-100" };
  };

  const risk = getRiskLevel();

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`px-2 py-1 rounded-full text-xs font-medium ${risk.color}`}
      >
        {risk.label}
      </div>
      <div className="text-xs text-gray-500">{score}%</div>
    </div>
  );
}

// Customer Action Menu
function CustomerActionMenu({
  customer,
  onContactCustomer,
  triggerRef,
}: {
  customer: Customer;
  onContactCustomer: (customerId: string, method: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      setPosition({
        top: rect.bottom + scrollTop + 8,
        left: rect.right + scrollLeft - 220,
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", () => setIsOpen(false), true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", () => setIsOpen(false), true);
      };
    }
  }, [isOpen, triggerRef]);

  const actions = [
    {
      action: "view",
      label: "View Profile",
      icon: EyeIcon,
      color: "text-gray-600",
    },
    {
      action: "email",
      label: "Send Email",
      icon: EnvelopeIcon,
      color: "text-blue-600",
    },
    {
      action: "call",
      label: "Call Customer",
      icon: PhoneIcon,
      color: "text-green-600",
    },
    {
      action: "message",
      label: "Send Message",
      icon: ChatBubbleLeftRightIcon,
      color: "text-purple-600",
    },
    {
      action: "orders",
      label: "View Orders",
      icon: ShoppingBagIcon,
      color: "text-indigo-600",
    },
    {
      action: "note",
      label: "Add Note",
      icon: TagIcon,
      color: "text-yellow-600",
    },
  ];

  const handleAction = (actionType: string) => {
    setIsOpen(false);

    switch (actionType) {
      case "view":
        window.open(`/vendor/customers/${customer.id}`, "_blank");
        break;
      case "email":
        onContactCustomer(customer.id, "email");
        break;
      case "call":
        onContactCustomer(customer.id, "phone");
        break;
      case "message":
        onContactCustomer(customer.id, "sms");
        break;
      case "orders":
        window.open(`/vendor/orders?customer=${customer.id}`, "_blank");
        break;
      case "note":
        // Open note modal
        break;
    }
  };

  const menuContent = isOpen ? (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 py-2 overflow-hidden"
        style={{
          top: position.top,
          left: position.left,
          width: "220px",
          zIndex: 99999,
        }}
      >
        <div
          className="absolute w-3 h-3 bg-white rotate-45 border-l border-t border-gray-200"
          style={{ top: "-6px", right: "24px" }}
        />

        <div className="py-1">
          {actions.map((action, index) => (
            <React.Fragment key={action.action}>
              {index === 1 && <div className="border-t border-gray-100 my-1" />}
              {index === 4 && <div className="border-t border-gray-100 my-1" />}
              <button
                onClick={() => handleAction(action.action)}
                className={`flex items-center w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors group ${action.color}`}
              >
                <action.icon className="w-4 h-4 mr-3" />
                <span className="font-medium">{action.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  ) : null;

  return (
    <>
      <motion.button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
      </motion.button>

      {typeof window !== "undefined" &&
        createPortal(menuContent, document.body)}
    </>
  );
}

export default function VendorCustomersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [loyaltyFilter, setLoyaltyFilter] = useState(
    searchParams.get("loyalty") || ""
  );
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") || ""
  );
  const [activityFilter, setActivityFilter] = useState(
    searchParams.get("activity") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("totalSpent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [analytics, setAnalytics] = useState(mockCustomersData.analytics);

  // Refs for action menu triggers
  const actionButtonRefs = useRef<{
    [key: string]: React.RefObject<HTMLButtonElement | null>;
  }>({});

  // Initialize refs for all customers
  useEffect(() => {
    const newRefs: {
      [key: string]: React.RefObject<HTMLButtonElement | null>;
    } = {};
    customers.forEach((customer) => {
      if (!actionButtonRefs.current[customer.id]) {
        newRefs[customer.id] = React.createRef<HTMLButtonElement>();
        actionButtonRefs.current[customer.id] = newRefs[customer.id];
      }
    });
  }, [customers]);

  // Load customers
  useEffect(() => {
    loadCustomers();
  }, [
    currentPage,
    searchTerm,
    loyaltyFilter,
    locationFilter,
    activityFilter,
    sortBy,
    sortOrder,
  ]);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // In real implementation:
      // const params = new URLSearchParams({...});
      // const response = await fetch(`/api/vendor/customers?${params}`);
      // const data = await response.json();

      setCustomers(mockCustomersData.customers);
      setTotalPages(mockCustomersData.pagination.totalPages);
      setTotalCount(mockCustomersData.pagination.totalCount);
      setAnalytics(mockCustomersData.analytics);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactCustomer = (customerId: string, method: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    switch (method) {
      case "email":
        window.open(`mailto:${customer.email}`, "_blank");
        break;
      case "phone":
        if (customer.phone) {
          window.open(`tel:${customer.phone}`, "_blank");
        }
        break;
      case "sms":
        if (customer.phone) {
          window.open(`sms:${customer.phone}`, "_blank");
        }
        break;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCustomers();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-900 transition-colors group"
    >
      <span>{children}</span>
      {sortBy === field && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-black"
        >
          {sortOrder === "asc" ? (
            <ArrowUpIcon className="w-3 h-3" />
          ) : (
            <ArrowDownIcon className="w-3 h-3" />
          )}
        </motion.div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Customer Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage customer relationships and analyze customer behavior
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Export Report
              </motion.button>

              <motion.button
                className="flex items-center px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                Send Campaign
              </motion.button>
            </div>
          </div>

          {/* Customer Analytics */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {[
              {
                label: "Total Customers",
                value: analytics.totalCustomers,
                icon: UsersIcon,
                color: "blue",
                change: "+12.5%",
              },
              {
                label: "Active Customers",
                value: analytics.activeCustomers,
                icon: CheckCircleIcon,
                color: "green",
                change: "+8.3%",
              },
              {
                label: "Avg Lifetime Value",
                value: formatPrice(analytics.averageLifetimeValue),
                icon: BanknotesIcon,
                color: "purple",
                change: "+15.2%",
              },
              {
                label: "Satisfaction Score",
                value: `${analytics.satisfactionAverage}/5`,
                icon: StarIcon,
                color: "yellow",
                change: "+0.3",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs font-medium mt-1 text-green-600">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Customers
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    placeholder="Search by name, email, or phone..."
                  />
                </div>
              </div>

              {/* Loyalty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loyalty Level
                </label>
                <select
                  value={loyaltyFilter}
                  onChange={(e) => setLoyaltyFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Levels</option>
                  <option value="new">New Customer</option>
                  <option value="regular">Regular</option>
                  <option value="vip">VIP</option>
                  <option value="champion">Champion</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Locations</option>
                  <option value="berlin">Berlin</option>
                  <option value="munich">Munich</option>
                  <option value="hamburg">Hamburg</option>
                  <option value="frankfurt">Frankfurt</option>
                  <option value="stuttgart">Stuttgart</option>
                </select>
              </div>

              {/* Activity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Status
                </label>
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Customers</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="at-risk">At Risk</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {totalCount} customers found
              </div>
              <motion.button
                type="submit"
                className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Apply Filters
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Customers Table */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ overflow: "visible" }}
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <motion.div
              className="p-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No customers found
              </h3>
              <p className="text-gray-500 mb-6">
                Customers will appear here as they make purchases from your
                store
              </p>
            </motion.div>
          ) : (
            <div style={{ overflow: "visible" }}>
              {/* Table Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <div className="col-span-3">
                    <SortButton field="name">Customer</SortButton>
                  </div>
                  <div className="col-span-2">Contact</div>
                  <div className="col-span-1">
                    <SortButton field="totalOrders">Orders</SortButton>
                  </div>
                  <div className="col-span-1">
                    <SortButton field="totalSpent">Spent</SortButton>
                  </div>
                  <div className="col-span-1">
                    <SortButton field="lifetimeValue">LTV</SortButton>
                  </div>
                  <div className="col-span-1">Loyalty</div>
                  <div className="col-span-1">Risk</div>
                  <div className="col-span-1">
                    <SortButton field="lastOrderAt">Last Order</SortButton>
                  </div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div
                className="divide-y divide-gray-200"
                style={{ overflow: "visible" }}
              >
                <AnimatePresence>
                  {customers.map((customer, index) => {
                    if (!actionButtonRefs.current[customer.id]) {
                      actionButtonRefs.current[customer.id] =
                        React.createRef<HTMLButtonElement>();
                    }

                    return (
                      <motion.div
                        key={customer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="px-6 py-4 hover:bg-gray-50 transition-all duration-200 group"
                        style={{ position: "relative", overflow: "visible" }}
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Customer Info */}
                          <div className="col-span-3">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                  {customer.image ? (
                                    <Image
                                      src={customer.image}
                                      alt={customer.name}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <UserIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                {customer.isActive && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {customer.name}
                                </h3>
                                {customer.location && (
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <MapPinIcon className="w-3 h-3 mr-1" />
                                    {customer.location.city},{" "}
                                    {customer.location.country}
                                  </div>
                                )}
                                {customer.tags.length > 0 && (
                                  <div className="flex items-center space-x-1 mt-1">
                                    {customer.tags
                                      .slice(0, 2)
                                      .map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    {customer.tags.length > 2 && (
                                      <span className="text-xs text-gray-400">
                                        +{customer.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="col-span-2">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-900">
                                <EnvelopeIcon className="w-3 h-3 mr-2 text-gray-400" />
                                <span className="truncate">
                                  {customer.email}
                                </span>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <PhoneIcon className="w-3 h-3 mr-2 text-gray-400" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                              {customer.satisfactionScore && (
                                <div className="flex items-center">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIconSolid
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < customer.satisfactionScore!
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({customer.satisfactionScore}/5)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Orders */}
                          <div className="col-span-1">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-gray-900">
                                {customer.totalOrders}
                              </div>
                              <div className="text-xs text-gray-500">
                                {customer.orderFrequency.toFixed(1)}/month
                              </div>
                            </div>
                          </div>

                          {/* Total Spent */}
                          <div className="col-span-1">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatPrice(customer.totalSpent)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Avg: {formatPrice(customer.averageOrderValue)}
                              </div>
                            </div>
                          </div>

                          {/* Lifetime Value */}
                          <div className="col-span-1">
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-900">
                                {formatPrice(customer.lifetimeValue)}
                              </div>
                              {customer.lifetimeValue > customer.totalSpent && (
                                <div className="flex items-center justify-center text-xs text-green-600">
                                  <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                                  Potential
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Loyalty Level */}
                          <div className="col-span-1">
                            <LoyaltyBadge level={customer.loyaltyLevel} />
                          </div>

                          {/* Risk Score */}
                          <div className="col-span-1">
                            <RiskScore score={customer.riskScore} />
                          </div>

                          {/* Last Order */}
                          <div className="col-span-1">
                            <div className="text-center">
                              {customer.lastOrderAt ? (
                                <>
                                  <div className="text-sm font-medium text-gray-900">
                                    {new Date(
                                      customer.lastOrderAt
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {Math.floor(
                                      (Date.now() -
                                        new Date(
                                          customer.lastOrderAt
                                        ).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )}{" "}
                                    days ago
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs text-gray-400">
                                  No orders
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div
                            className="col-span-1"
                            style={{ position: "relative", zIndex: 1 }}
                          >
                            <CustomerActionMenu
                              customer={customer}
                              onContactCustomer={handleContactCustomer}
                              triggerRef={actionButtonRefs.current[customer.id]}
                            />
                          </div>
                        </div>

                        {/* Expandable Customer Details */}
                        <motion.div
                          className="mt-4 pt-4 border-t border-gray-100"
                          initial={false}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Recent Purchases */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Recent Purchases
                              </h4>
                              <div className="space-y-2">
                                {customer.lastPurchasedProducts
                                  .slice(0, 3)
                                  .map((product, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center space-x-2"
                                    >
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-8 h-8 rounded object-cover"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-900 truncate">
                                          {product.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatPrice(product.price)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            {/* Preferred Categories */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Preferred Categories
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {customer.preferredCategories.map(
                                  (category, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                    >
                                      {category}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Communication Preferences */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Communication
                              </h4>
                              <div className="space-y-1">
                                {customer.communicationPreferences.email && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <CheckCircleIconSolid className="w-3 h-3 mr-1 text-green-500" />
                                    Email
                                  </div>
                                )}
                                {customer.communicationPreferences.sms && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <CheckCircleIconSolid className="w-3 h-3 mr-1 text-green-500" />
                                    SMS
                                  </div>
                                )}
                                {customer.communicationPreferences.phone && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <CheckCircleIconSolid className="w-3 h-3 mr-1 text-green-500" />
                                    Phone
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Customer Notes */}
                          {customer.notes && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <TagIcon className="w-4 h-4 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-yellow-800">
                                    Customer Notes
                                  </p>
                                  <p className="text-sm text-yellow-700">
                                    {customer.notes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="mt-8 flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-sm text-gray-700 font-medium">
              Showing {(currentPage - 1) * 15 + 1} to{" "}
              {Math.min(currentPage * 15, totalCount)} of {totalCount} customers
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: currentPage === 1 ? 1 : 1.02 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.98 }}
              >
                Previous
              </motion.button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 7) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 4) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNumber = totalPages - 6 + i;
                  } else {
                    pageNumber = currentPage - 3 + i;
                  }

                  return (
                    <motion.button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        currentPage === pageNumber
                          ? "bg-black text-white shadow-lg"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {pageNumber}
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.02 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.98 }}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Customer Insights Panel */}
        <motion.div
          className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex justify-center mb-2">
                <TrophyIcon className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-blue-900">Top Customer</p>
              <p className="text-lg font-bold text-blue-800">
                Alexander Richter
              </p>
              <p className="text-xs text-blue-600">
                {formatPrice(4890.75)} total spent
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex justify-center mb-2">
                <UserPlusIcon className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-900">
                New This Month
              </p>
              <p className="text-lg font-bold text-green-800">
                {analytics.newCustomersThisMonth}
              </p>
              <p className="text-xs text-green-600">+18% from last month</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
              <div className="flex justify-center mb-2">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-yellow-900">At Risk</p>
              <p className="text-lg font-bold text-yellow-800">
                {analytics.churnRisk}
              </p>
              <p className="text-xs text-yellow-600">
                Customers need attention
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
