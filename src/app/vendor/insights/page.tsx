/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyEuroIcon,
  ShoppingBagIcon,
  UsersIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FireIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  HeartIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  FunnelIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import { formatPrice } from "@/lib/utils";

interface InsightsData {
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    avgOrderValue: number;
    avgOrderGrowth: number;
    conversionRate: number;
    conversionGrowth: number;
    totalCustomers: number;
    customerGrowth: number;
    totalProducts: number;
    activeProducts: number;
  };
  timeSeriesData: Array<{
    date: string;
    revenue: number;
    orders: number;
    visitors: number;
    conversion: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    image: string;
    revenue: number;
    orders: number;
    growth: number;
    stock: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
    color: string;
  }>;
  geographicData: Array<{
    country: string;
    orders: number;
    revenue: number;
    percentage: number;
  }>;
  deviceData: Array<{
    device: string;
    visitors: number;
    orders: number;
    conversion: number;
    color: string;
  }>;
  performanceMetrics: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
    returnCustomerRate: number;
    customerLifetimeValue: number;
  };
  recommendations: Array<{
    type: "opportunity" | "warning" | "success";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    actionable: boolean;
  }>;
}

// Mock data for demo - replace with real API calls
const mockInsightsData: InsightsData = {
  overview: {
    totalRevenue: 45678.9,
    revenueGrowth: 12.5,
    totalOrders: 234,
    ordersGrowth: 8.3,
    avgOrderValue: 195.25,
    avgOrderGrowth: 4.1,
    conversionRate: 3.2,
    conversionGrowth: -0.5,
    totalCustomers: 156,
    customerGrowth: 15.2,
    totalProducts: 48,
    activeProducts: 42,
  },
  timeSeriesData: [
    {
      date: "Jan",
      revenue: 12000,
      orders: 45,
      visitors: 1250,
      conversion: 3.6,
    },
    {
      date: "Feb",
      revenue: 15200,
      orders: 52,
      visitors: 1380,
      conversion: 3.8,
    },
    {
      date: "Mar",
      revenue: 18500,
      orders: 68,
      visitors: 1520,
      conversion: 4.5,
    },
    {
      date: "Apr",
      revenue: 22300,
      orders: 74,
      visitors: 1680,
      conversion: 4.4,
    },
    {
      date: "May",
      revenue: 28900,
      orders: 89,
      visitors: 1920,
      conversion: 4.6,
    },
    {
      date: "Jun",
      revenue: 35600,
      orders: 103,
      visitors: 2150,
      conversion: 4.8,
    },
    {
      date: "Jul",
      revenue: 42100,
      orders: 118,
      visitors: 2380,
      conversion: 5.0,
    },
    {
      date: "Aug",
      revenue: 45678,
      orders: 134,
      visitors: 2650,
      conversion: 5.1,
    },
  ],
  topProducts: [
    {
      id: "1",
      name: "iPhone 15 Pro Max",
      image: "/products/iphone_16_pro_max.jpg",
      revenue: 12500,
      orders: 25,
      growth: 18.5,
      stock: 12,
    },
    {
      id: "2",
      name: "MacBook Air M3",
      image: "/products/iphone_16_pro_max.jpg",
      revenue: 8900,
      orders: 18,
      growth: 22.3,
      stock: 8,
    },
    {
      id: "3",
      name: "AirPods Pro 2",
      image: "/products/iphone_16_pro_max.jpg",
      revenue: 6750,
      orders: 45,
      growth: 15.7,
      stock: 32,
    },
    {
      id: "4",
      name: "Apple Watch Ultra",
      image: "/products/iphone_16_pro_max.jpg",
      revenue: 5200,
      orders: 12,
      growth: 9.2,
      stock: 5,
    },
    {
      id: "5",
      name: "iPad Pro 12.9",
      image: "/products/iphone_16_pro_max.jpg",
      revenue: 4800,
      orders: 14,
      growth: -2.1,
      stock: 18,
    },
  ],
  customerSegments: [
    {
      segment: "New Customers",
      count: 89,
      revenue: 18500,
      percentage: 57.1,
      color: "#3B82F6",
    },
    {
      segment: "Returning Customers",
      count: 45,
      revenue: 21200,
      percentage: 28.8,
      color: "#10B981",
    },
    {
      segment: "VIP Customers",
      count: 22,
      revenue: 15900,
      percentage: 14.1,
      color: "#F59E0B",
    },
  ],
  geographicData: [
    { country: "Germany", orders: 89, revenue: 22400, percentage: 49.1 },
    { country: "Austria", orders: 34, revenue: 8900, percentage: 19.5 },
    { country: "Switzerland", orders: 28, revenue: 7800, percentage: 16.2 },
    { country: "Netherlands", orders: 19, revenue: 4200, percentage: 11.0 },
    { country: "Belgium", orders: 12, revenue: 2400, percentage: 4.2 },
  ],
  deviceData: [
    {
      device: "Desktop",
      visitors: 1580,
      orders: 89,
      conversion: 5.6,
      color: "#6366F1",
    },
    {
      device: "Mobile",
      visitors: 1820,
      orders: 76,
      conversion: 4.2,
      color: "#8B5CF6",
    },
    {
      device: "Tablet",
      visitors: 250,
      orders: 12,
      conversion: 4.8,
      color: "#06B6D4",
    },
  ],
  performanceMetrics: {
    pageViews: 8945,
    uniqueVisitors: 2650,
    bounceRate: 32.5,
    avgSessionDuration: 4.2,
    returnCustomerRate: 28.8,
    customerLifetimeValue: 387.5,
  },
  recommendations: [
    {
      type: "opportunity",
      title: "Optimize Mobile Conversion",
      description:
        "Mobile traffic is high but conversion is 25% lower than desktop. Consider improving mobile checkout experience.",
      impact: "high",
      actionable: true,
    },
    {
      type: "warning",
      title: "Low Stock Alert",
      description:
        "4 top-selling products have less than 10 units in stock. Consider restocking to avoid lost sales.",
      impact: "medium",
      actionable: true,
    },
    {
      type: "success",
      title: "Strong Customer Retention",
      description:
        "Return customer rate increased by 8.2% this month, indicating good customer satisfaction.",
      impact: "medium",
      actionable: false,
    },
    {
      type: "opportunity",
      title: "Expand to France Market",
      description:
        "Analysis shows potential for 25% revenue increase by entering the French market.",
      impact: "high",
      actionable: true,
    },
  ],
};

// Enhanced Metric Card Component
function MetricCard({
  title,
  value,
  growth,
  icon: Icon,
  color = "blue",
  format = "number",
  delay = 0,
}: {
  title: string;
  value: number;
  growth?: number;
  icon: any;
  color?: string;
  format?: "number" | "currency" | "percentage";
  delay?: number;
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return formatPrice(val);
      case "percentage":
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const isPositiveGrowth = growth && growth > 0;
  const isNegativeGrowth = growth && growth < 0;

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatValue(value)}
          </p>

          {growth !== undefined && (
            <div
              className={`flex items-center text-sm font-medium ${
                isPositiveGrowth
                  ? "text-green-600"
                  : isNegativeGrowth
                    ? "text-red-600"
                    : "text-gray-500"
              }`}
            >
              {isPositiveGrowth && (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              )}
              {isNegativeGrowth && (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              {growth > 0 ? "+" : ""}
              {growth.toFixed(1)}%
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-2xl bg-${color}-100`}>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );
}

// Chart Component Wrapper
function ChartCard({
  title,
  children,
  actions,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}
      </div>
      {children}
    </motion.div>
  );
}

// Top Products Table
function TopProductsTable({ products }: { products: any[] }) {
  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="flex items-center space-x-4">
            <div className="text-sm font-bold text-gray-500 w-6">
              #{index + 1}
            </div>
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-500">{product.orders} orders</p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-bold text-gray-900">
              {formatPrice(product.revenue)}
            </p>
            <div
              className={`flex items-center text-sm ${
                product.growth > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.growth > 0 ? (
                <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
              )}
              {product.growth > 0 ? "+" : ""}
              {product.growth.toFixed(1)}%
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {entry.name === "Revenue"
              ? formatPrice(entry.value)
              : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Recommendation Card
function RecommendationCard({ recommendation }: { recommendation: any }) {
  const getIcon = () => {
    switch (recommendation.type) {
      case "opportunity":
        return LightBulbIcon;
      case "warning":
        return ExclamationTriangleIcon;
      case "success":
        return CheckCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getColors = () => {
    switch (recommendation.type) {
      case "opportunity":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getImpactColor = () => {
    switch (recommendation.impact) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      className={`p-4 rounded-xl border ${getColors()}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{recommendation.title}</h4>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor()}`}
            >
              {recommendation.impact} impact
            </span>
          </div>
          <p className="text-sm opacity-90">{recommendation.description}</p>
          {recommendation.actionable && (
            <button className="mt-3 text-sm font-medium hover:underline">
              Take Action →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function VendorInsightsDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<InsightsData>(mockInsightsData);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // Load insights data
  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        // const response = await fetch(`/api/vendor/insights?range=${timeRange}`);
        // const result = await response.json();
        // setData(result.data);

        // Simulate loading
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error loading insights:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [timeRange]);

  const handleExportData = () => {
    // Export functionality
    console.log("Exporting insights data...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Business Insights
              </h1>
              <p className="text-lg text-gray-600">
                Comprehensive analytics and performance metrics for your store
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm font-medium"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="1y">Last year</option>
              </select>

              {/* Export Button */}
              <motion.button
                onClick={handleExportData}
                className="flex items-center px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export Data
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={data.overview.totalRevenue}
            growth={data.overview.revenueGrowth}
            icon={CurrencyEuroIcon}
            color="green"
            format="currency"
            delay={0.1}
          />
          <MetricCard
            title="Total Orders"
            value={data.overview.totalOrders}
            growth={data.overview.ordersGrowth}
            icon={ShoppingBagIcon}
            color="blue"
            delay={0.2}
          />
          <MetricCard
            title="Avg Order Value"
            value={data.overview.avgOrderValue}
            growth={data.overview.avgOrderGrowth}
            icon={BanknotesIcon}
            color="purple"
            format="currency"
            delay={0.3}
          />
          <MetricCard
            title="Conversion Rate"
            value={data.overview.conversionRate}
            growth={data.overview.conversionGrowth}
            icon={BanknotesIcon}
            color="yellow"
            format="percentage"
            delay={0.4}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend Chart */}
          <ChartCard
            title="Revenue Trend"
            actions={
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg"
              >
                <option value="revenue">Revenue</option>
                <option value="orders">Orders</option>
                <option value="visitors">Visitors</option>
              </select>
            }
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data.timeSeriesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Customer Segments */}
          <ChartCard title="Customer Segments">
            <div className="grid grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.customerSegments}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {data.customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-4">
                {data.customerSegments.map((segment, index) => (
                  <motion.div
                    key={segment.segment}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {segment.segment}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {segment.count}
                      </p>
                      <p className="text-xs text-gray-500">
                        {segment.percentage}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Products */}
          <ChartCard title="Top Performing Products" className="lg:col-span-2">
            <TopProductsTable products={data.topProducts} />
          </ChartCard>

          {/* Performance Metrics */}
          <ChartCard title="Performance Metrics">
            <div className="space-y-6">
              {[
                {
                  label: "Page Views",
                  value: data.performanceMetrics.pageViews,
                  icon: EyeIcon,
                },
                {
                  label: "Unique Visitors",
                  value: data.performanceMetrics.uniqueVisitors,
                  icon: UsersIcon,
                },
                {
                  label: "Bounce Rate",
                  value: `${data.performanceMetrics.bounceRate}%`,
                  icon: ExclamationTriangleIcon,
                },
                {
                  label: "Avg Session",
                  value: `${data.performanceMetrics.avgSessionDuration}m`,
                  icon: ClockIcon,
                },
                {
                  label: "Return Rate",
                  value: `${data.performanceMetrics.returnCustomerRate}%`,
                  icon: ArrowTrendingUpIcon,
                },
                {
                  label: "Customer LTV",
                  value: formatPrice(
                    data.performanceMetrics.customerLifetimeValue
                  ),
                  icon: StarIcon,
                },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <metric.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {metric.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {metric.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Geographic Distribution and Device Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Geographic Distribution */}
          <ChartCard title="Sales by Country">
            <div className="space-y-3">
              {data.geographicData.map((country, index) => (
                <motion.div
                  key={country.country}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {country.country}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatPrice(country.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {country.orders} orders ({country.percentage}%)
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ChartCard>

          {/* Device Analytics */}
          <ChartCard title="Traffic by Device">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.deviceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="device" type="category" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visitors" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* AI-Powered Recommendations */}
        <ChartCard title="Smart Recommendations" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recommendations.map((recommendation, index) => (
              <RecommendationCard key={index} recommendation={recommendation} />
            ))}
          </div>
        </ChartCard>

        {/* Quick Actions Footer */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Quick Actions
              </h3>
              <p className="text-sm text-gray-600">
                Optimize your store performance with these tools
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                Customize Dashboard
              </motion.button>

              <motion.button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PresentationChartLineIcon className="w-4 h-4 mr-2" />
                Generate Report
              </motion.button>

              <motion.button
                className="flex items-center px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ChartPieIcon className="w-4 h-4 mr-2" />
                Schedule Analysis
              </motion.button>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BanknotesIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Revenue Growth
                  </p>
                  <p className="text-xs text-green-700">Up 12.5% this month</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 1.0 }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UsersIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    New Customers
                  </p>
                  <p className="text-xs text-blue-700">
                    89 acquired this month
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 1.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FireIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    Top Product
                  </p>
                  <p className="text-xs text-purple-700">iPhone 15 Pro Max</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Real-time Updates Indicator */}
        <motion.div
          className="fixed bottom-6 right-6 bg-white rounded-full shadow-lg border border-gray-200 p-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-gray-700">Live Data</span>
          </div>
        </motion.div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-8 shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Updating Analytics
                    </p>
                    <p className="text-sm text-gray-600">
                      Fetching latest data...
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
