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
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  DocumentIcon,
  PrinterIcon,
  ChatBubbleLeftRightIcon,
  CurrencyEuroIcon,
  CalendarDaysIcon,
  UserIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ClockIcon as ClockIconSolid,
  TruckIcon as TruckIconSolid,
} from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";
import React from "react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  totalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: {
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
  };
}

// Order Status Configuration
const ORDER_STATUSES = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: ClockIconSolid,
    description: "Order received, awaiting confirmation",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircleIconSolid,
    description: "Order confirmed, preparing for processing",
  },
  processing: {
    label: "Processing",
    color: "bg-purple-100 text-purple-800",
    icon: ArrowPathIcon,
    description: "Order is being prepared",
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-800",
    icon: TruckIconSolid,
    description: "Order has been shipped",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: CheckCircleIconSolid,
    description: "Order has been delivered",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircleIconSolid,
    description: "Order has been cancelled",
  },
  refunded: {
    label: "Refunded",
    color: "bg-gray-100 text-gray-800",
    icon: ArrowPathIcon,
    description: "Order has been refunded",
  },
};

// Status Badge Component
function StatusBadge({
  status,
  showIcon = true,
}: {
  status: keyof typeof ORDER_STATUSES;
  showIcon?: boolean;
}) {
  const config = ORDER_STATUSES[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1.5" />}
      {config.label}
    </span>
  );
}

// Action Menu Portal Component
function OrderActionMenu({
  order,
  onStatusUpdate,
  triggerRef,
}: {
  order: Order;
  onStatusUpdate: (orderId: string, status: string) => void;
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
        left: rect.right + scrollLeft - 250,
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

  const getAvailableActions = () => {
    const actions = [];

    // Status transitions
    if (order.status === "pending") {
      actions.push(
        {
          action: "confirm",
          label: "Confirm Order",
          icon: CheckCircleIcon,
          color: "text-green-600",
        },
        {
          action: "cancel",
          label: "Cancel Order",
          icon: XCircleIcon,
          color: "text-red-600",
        }
      );
    }

    if (order.status === "confirmed") {
      actions.push({
        action: "process",
        label: "Start Processing",
        icon: ArrowPathIcon,
        color: "text-purple-600",
      });
    }

    if (order.status === "processing") {
      actions.push({
        action: "ship",
        label: "Mark as Shipped",
        icon: TruckIcon,
        color: "text-indigo-600",
      });
    }

    if (order.status === "shipped") {
      actions.push({
        action: "deliver",
        label: "Mark as Delivered",
        icon: CheckCircleIcon,
        color: "text-green-600",
      });
    }

    // Always available actions
    actions.push(
      {
        action: "view",
        label: "View Details",
        icon: EyeIcon,
        color: "text-gray-600",
      },
      {
        action: "print",
        label: "Print Invoice",
        icon: PrinterIcon,
        color: "text-gray-600",
      },
      {
        action: "contact",
        label: "Contact Customer",
        icon: ChatBubbleLeftRightIcon,
        color: "text-blue-600",
      }
    );

    return actions;
  };

  const handleAction = (actionType: string) => {
    setIsOpen(false);

    switch (actionType) {
      case "confirm":
        onStatusUpdate(order.id, "confirmed");
        break;
      case "process":
        onStatusUpdate(order.id, "processing");
        break;
      case "ship":
        onStatusUpdate(order.id, "shipped");
        break;
      case "deliver":
        onStatusUpdate(order.id, "delivered");
        break;
      case "cancel":
        onStatusUpdate(order.id, "cancelled");
        break;
      case "view":
        // Navigate to order details
        window.open(`/vendor/orders/${order.id}`, "_blank");
        break;
      case "print":
        // Print invoice logic
        window.print();
        break;
      case "contact":
        // Contact customer logic
        window.open(`mailto:${order.customerEmail}`, "_blank");
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
          width: "250px",
          zIndex: 99999,
        }}
      >
        <div
          className="absolute w-3 h-3 bg-white rotate-45 border-l border-t border-gray-200"
          style={{ top: "-6px", right: "24px" }}
        />

        <div className="py-1">
          {getAvailableActions().map((action, index) => (
            <React.Fragment key={action.action}>
              {index === 2 && <div className="border-t border-gray-100 my-1" />}
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

export default function VendorOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
  });
  const [updating, setUpdating] = useState<string | null>(null);

  // Refs for action menu triggers
  const actionButtonRefs = useRef<{
    [key: string]: React.RefObject<HTMLButtonElement | null>;
  }>({});

  // Initialize refs for all orders
  useEffect(() => {
    const newRefs: {
      [key: string]: React.RefObject<HTMLButtonElement | null>;
    } = {};
    orders.forEach((order) => {
      if (!actionButtonRefs.current[order.id]) {
        newRefs[order.id] = React.createRef<HTMLButtonElement>();
        actionButtonRefs.current[order.id] = newRefs[order.id];
      }
    });
  }, [orders]);

  // Load orders
  useEffect(() => {
    loadOrders();
  }, [currentPage, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
        sort: sortBy,
        order: sortOrder,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (dateFilter) params.append("date", dateFilter);

      const response = await fetch(`/api/vendor/orders?${params}`);
      const data: OrdersResponse = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);

      const response = await fetch(`/api/vendor/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus as any,
                  updatedAt: new Date().toISOString(),
                }
              : order
          )
        );

        // Refresh stats
        loadOrders();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrders();
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

  const getOrderTotal = (order: Order) => {
    return order.totalAmount + order.shippingAmount + order.taxAmount;
  };

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
                Order Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your orders and track customer purchases
              </p>
            </div>
          </div>

          {/* Enhanced Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {[
              {
                label: "Total Revenue",
                value: formatPrice(stats.totalRevenue),
                icon: CurrencyEuroIcon,
                color: "green",
                change: "+12.5%",
              },
              {
                label: "Pending Orders",
                value: stats.pendingOrders,
                icon: ClockIcon,
                color: "yellow",
                change: "+5",
              },
              {
                label: "Processing",
                value: stats.processingOrders,
                icon: ArrowPathIcon,
                color: "purple",
                change: "+8",
              },
              {
                label: "Completed",
                value: stats.completedOrders,
                icon: CheckCircleIcon,
                color: "green",
                change: "+23",
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

        {/* Enhanced Filters */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Orders
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    placeholder="Search by order number, customer name, or email..."
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white transition-all duration-200"
                  >
                    <option value="">All Status</option>
                    {Object.entries(ORDER_STATUSES).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white transition-all duration-200"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                  <ChevronDownIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {totalCount} orders found
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

        {/* Orders Table */}
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
              <p className="text-gray-500 font-medium">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              className="p-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 mb-6">
                Orders will appear here once customers start purchasing your
                products
              </p>
            </motion.div>
          ) : (
            <div style={{ overflow: "visible" }}>
              {/* Table Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <div className="col-span-2">
                    <SortButton field="orderNumber">Order</SortButton>
                  </div>
                  <div className="col-span-2">
                    <SortButton field="customerName">Customer</SortButton>
                  </div>
                  <div className="col-span-2">Items</div>
                  <div className="col-span-1">
                    <SortButton field="totalAmount">Total</SortButton>
                  </div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Payment</div>
                  <div className="col-span-2">
                    <SortButton field="created">Date</SortButton>
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
                  {orders.map((order, index) => {
                    // Ensure we have a ref for this order
                    if (!actionButtonRefs.current[order.id]) {
                      actionButtonRefs.current[order.id] =
                        React.createRef<HTMLButtonElement>();
                    }

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="px-6 py-4 hover:bg-gray-50 transition-all duration-200 group"
                        style={{ position: "relative", overflow: "visible" }}
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Order Number */}
                          <div className="col-span-2">
                            <div className="font-medium text-gray-900">
                              #{order.orderNumber}
                            </div>
                            {order.trackingNumber && (
                              <div className="text-xs text-blue-600 mt-1">
                                Tracking: {order.trackingNumber}
                              </div>
                            )}
                          </div>

                          {/* Customer */}
                          <div className="col-span-2">
                            <div className="font-medium text-gray-900">
                              {order.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customerEmail}
                            </div>
                            {order.customerPhone && (
                              <div className="text-xs text-gray-400">
                                {order.customerPhone}
                              </div>
                            )}
                          </div>

                          {/* Items */}
                          <div className="col-span-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-2">
                                {order.items.slice(0, 3).map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden"
                                  >
                                    <Image
                                      src={item.productImage}
                                      alt={item.productName}
                                      width={32}
                                      height={32}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                                {order.items.length > 3 && (
                                  <div className="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-600">
                                      +{order.items.length - 3}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {order.items.length} item
                                {order.items.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>

                          {/* Total */}
                          <div className="col-span-1">
                            <div className="font-bold text-gray-900">
                              {formatPrice(getOrderTotal(order))}
                            </div>
                            {order.shippingAmount > 0 && (
                              <div className="text-xs text-gray-500">
                                +{formatPrice(order.shippingAmount)} shipping
                              </div>
                            )}
                          </div>

                          {/* Status */}
                          <div className="col-span-1">
                            <StatusBadge status={order.status} />
                            {updating === order.id && (
                              <div className="mt-1">
                                <div className="w-3 h-3 border border-gray-300 border-t-black rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>

                          {/* Payment Status */}
                          <div className="col-span-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                order.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : order.paymentStatus === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.paymentStatus === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.paymentStatus === "paid" && (
                                <CheckCircleIconSolid className="w-3 h-3 mr-1" />
                              )}
                              {order.paymentStatus === "pending" && (
                                <ClockIconSolid className="w-3 h-3 mr-1" />
                              )}
                              {order.paymentStatus === "failed" && (
                                <XCircleIconSolid className="w-3 h-3 mr-1" />
                              )}
                              {order.paymentStatus.charAt(0).toUpperCase() +
                                order.paymentStatus.slice(1)}
                            </span>
                          </div>

                          {/* Date */}
                          <div className="col-span-2">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                            {order.estimatedDelivery && (
                              <div className="text-xs text-blue-600 mt-1">
                                Est. delivery:{" "}
                                {new Date(
                                  order.estimatedDelivery
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div
                            className="col-span-1"
                            style={{ position: "relative", zIndex: 1 }}
                          >
                            <OrderActionMenu
                              order={order}
                              onStatusUpdate={handleStatusUpdate}
                              triggerRef={actionButtonRefs.current[order.id]}
                            />
                          </div>
                        </div>

                        {/* Order Details Expandable Section */}
                        <motion.div
                          className="mt-4 pt-4 border-t border-gray-100"
                          initial={false}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Shipping Address */}
                            <div className="flex items-start space-x-2">
                              <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Shipping Address
                                </p>
                                <p className="text-gray-600 text-xs">
                                  {order.shippingAddress.street}
                                  <br />
                                  {order.shippingAddress.city},{" "}
                                  {order.shippingAddress.postalCode}
                                  <br />
                                  {order.shippingAddress.country}
                                </p>
                              </div>
                            </div>

                            {/* Payment Method */}
                            <div className="flex items-start space-x-2">
                              <CurrencyEuroIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Payment Method
                                </p>
                                <p className="text-gray-600 text-xs">
                                  {order.paymentMethod}
                                </p>
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div className="flex items-start space-x-2">
                              <DocumentIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Order Summary
                                </p>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>
                                      {formatPrice(order.totalAmount)}
                                    </span>
                                  </div>
                                  {order.shippingAmount > 0 && (
                                    <div className="flex justify-between">
                                      <span>Shipping:</span>
                                      <span>
                                        {formatPrice(order.shippingAmount)}
                                      </span>
                                    </div>
                                  )}
                                  {order.taxAmount > 0 && (
                                    <div className="flex justify-between">
                                      <span>Tax:</span>
                                      <span>
                                        {formatPrice(order.taxAmount)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-medium text-gray-900 pt-1 border-t">
                                    <span>Total:</span>
                                    <span>
                                      {formatPrice(getOrderTotal(order))}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Notes Section */}
                          {order.notes && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-yellow-800">
                                    Order Notes
                                  </p>
                                  <p className="text-sm text-yellow-700">
                                    {order.notes}
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

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="mt-8 flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-sm text-gray-700 font-medium">
              Showing {(currentPage - 1) * 15 + 1} to{" "}
              {Math.min(currentPage * 15, totalCount)} of {totalCount} orders
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

        {/* Floating Action Button for Quick Actions */}
        <motion.div
          className="fixed bottom-8 right-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Quick Actions
            </h4>
            <div className="space-y-2">
              <button className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print All Orders
              </button>
              <button className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <DocumentIcon className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Bulk Actions
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
