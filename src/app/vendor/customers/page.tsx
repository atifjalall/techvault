// File: src/app/vendor/customers/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShoppingBagIcon,
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// UI Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

import { formatPrice } from "@/lib/utils";

// Customer interface based on actual schema
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  emailVerified?: string;
  createdAt: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
  isVerified: boolean;
  _count: {
    orders: number;
  };
  totalSpent: number;
  lastOrderDate?: string;
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
  stats: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    averageOrderValue: number;
    totalRevenue: number;
  };
}

// Mobile-responsive Stats Card Component with ultra-compact design
function StatCard({
  title,
  value,
  icon: Icon,
  change,
  iconColor,
  bgColor,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change: number;
  iconColor: string;
  bgColor: string;
}) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">
                {title}
              </p>
              <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {value}
              </p>
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                {isPositive ? (
                  <ArrowTrendingUpIcon className="h-2 w-2 sm:h-3 sm:w-3 text-green-500 flex-shrink-0" />
                ) : (
                  <ArrowTrendingDownIcon className="h-2 w-2 sm:h-3 sm:w-3 text-red-500 flex-shrink-0" />
                )}
                <span
                  className={`text-[9px] sm:text-xs font-medium ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
                <span className="text-[8px] sm:text-xs text-gray-500 hidden sm:inline">
                  vs last month
                </span>
              </div>
            </div>
            <div
              className={`w-7 h-7 sm:w-10 sm:h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ml-1 sm:ml-0`}
            >
              <Icon className={`h-3 w-3 sm:h-5 sm:w-5 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Mobile Customer Card Component with ultra-compact design
function MobileCustomerCard({
  customer,
  onContactCustomer,
  getInitials,
  formatDate,
}: {
  customer: Customer;
  onContactCustomer: (customer: Customer, method: string) => void;
  getInitials: (name: string) => string;
  formatDate: (dateString: string) => string;
}) {
  return (
    <Card className="border-0 shadow-sm bg-white mb-2">
      <CardContent className="p-2">
        <div className="space-y-2">
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {customer.image ? (
                  <Image
                    src={customer.image}
                    alt={customer.name || "Customer"}
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-medium text-[9px]">
                    {getInitials(customer.name || customer.email)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[11px] font-medium text-gray-900 truncate">
                  {customer.name || "Anonymous"}
                </h3>
                <p className="text-[9px] text-gray-500 truncate">
                  {customer.email}
                </p>
              </div>
            </div>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-gray-100 flex-shrink-0"
                >
                  <EllipsisVerticalIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/vendor/orders?customer=${customer.id}`}
                    className="cursor-pointer text-[11px] py-1"
                  >
                    <EyeIcon className="w-3 h-3 mr-1" />
                    View Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onContactCustomer(customer, "email")}
                  className="cursor-pointer text-[11px] py-1"
                >
                  <EnvelopeIcon className="w-3 h-3 mr-1" />
                  Send Email
                </DropdownMenuItem>
                {customer.phone && (
                  <DropdownMenuItem
                    onClick={() => onContactCustomer(customer, "phone")}
                    className="cursor-pointer text-[11px] py-1"
                  >
                    <PhoneIcon className="w-3 h-3 mr-1" />
                    Call Customer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contact Info Row */}
          {customer.phone && (
            <div className="flex items-center">
              <PhoneIcon className="w-2.5 h-2.5 mr-1 text-gray-400 flex-shrink-0" />
              <span className="text-[9px] text-gray-600 truncate">
                {customer.phone}
              </span>
            </div>
          )}

          {/* Status & Role Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {customer.role === "VENDOR" ? (
                <Badge variant="default" size="sm" icon="auto">
                  Vendor
                </Badge>
              ) : customer.role === "ADMIN" ? (
                <Badge variant="destructive" size="sm" icon="auto">
                  Admin
                </Badge>
              ) : (
                <Badge variant="secondary" size="sm" icon="auto">
                  Customer
                </Badge>
              )}

              <Badge
                variant={customer.isVerified ? "verified" : "unverified"}
                size="sm"
                icon="auto"
              >
                {customer.isVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <p className="text-[10px] font-medium text-gray-900">
                  {customer._count.orders}
                </p>
                <p className="text-[8px] text-gray-500">orders</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-semibold text-gray-900">
                  {formatPrice(customer.totalSpent || 0)}
                </p>
                <p className="text-[8px] text-gray-500">spent</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[9px] text-gray-500">
                {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile skeleton for customer loading
function MobileCustomersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardContent className="p-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <Skeleton className="w-7 h-7 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2 w-24" />
                  </div>
                </div>
                <Skeleton className="w-5 h-5 rounded" />
              </div>
              <Skeleton className="h-2 w-16" />
              <div className="flex justify-between">
                <div className="flex space-x-1">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex space-x-3">
                  <div className="text-center space-y-1">
                    <Skeleton className="h-2.5 w-4" />
                    <Skeleton className="h-2 w-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <Skeleton className="h-2.5 w-8" />
                    <Skeleton className="h-2 w-6" />
                  </div>
                </div>
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Sort Button Component - matching dashboard style
function SortButton({
  field,
  currentSort,
  currentOrder,
  onSort,
  children,
}: {
  field: string;
  currentSort: string;
  currentOrder: "asc" | "desc";
  onSort: (field: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(field)}
      className="hover:bg-transparent p-0 h-auto font-semibold text-xs text-slate-600 uppercase tracking-wide cursor-pointer"
    >
      <span className="flex items-center space-x-1">
        <span>{children}</span>
        {currentSort === field && (
          <div className="text-slate-900">
            {currentOrder === "asc" ? (
              <ArrowTrendingUpIcon className="w-3 h-3" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3" />
            )}
          </div>
        )}
      </span>
    </Button>
  );
}

// Mobile-responsive Loading Skeletons
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 sm:space-y-2 flex-1">
                <Skeleton className="h-2 sm:h-3 w-14 sm:w-20" />
                <Skeleton className="h-4 sm:h-6 w-10 sm:w-16" />
                <Skeleton className="h-2 sm:h-3 w-16 sm:w-24" />
              </div>
              <Skeleton className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VendorCustomersPage() {
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [verificationFilter, setVerificationFilter] = useState(
    searchParams.get("verified") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    averageOrderValue: 0,
    totalRevenue: 0,
  });

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
          sort: sortBy,
          order: sortOrder,
        });

        if (searchTerm) params.append("search", searchTerm);
        if (roleFilter) params.append("role", roleFilter);
        if (verificationFilter) params.append("verified", verificationFilter);

        const response = await fetch(`/api/vendor/customers?${params}`);
        const data: CustomersResponse = await response.json();

        if (data.success) {
          setCustomers(data.customers);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalCount);
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Error loading customers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [
    currentPage,
    searchTerm,
    roleFilter,
    verificationFilter,
    sortBy,
    sortOrder,
  ]);

  const handleContactCustomer = (customer: Customer, method: string) => {
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
    // loadCustomers will be called automatically via useEffect when currentPage changes
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-2 sm:p-6 space-y-3 sm:space-y-6">
        {/* Mobile-optimized Header */}
        <div className="flex items-start sm:items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-gray-900">
              Customers
            </h1>
            <p className="text-[10px] sm:text-sm text-gray-600 truncate">
              Manage and track your customer relationships
            </p>
          </div>
        </div>

        {/* Stats Grid - matching dashboard style */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4"
          >
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              change={12.5}
              icon={UsersIcon}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="New This Month"
              value={stats.newCustomersThisMonth}
              change={8.3}
              icon={UserIcon}
              iconColor="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Total Revenue"
              value={formatPrice(stats.totalRevenue)}
              change={15.2}
              icon={CurrencyEuroIcon}
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
            />
            <StatCard
              title="Avg Order Value"
              value={
                isNaN(stats.averageOrderValue) || stats.averageOrderValue === 0
                  ? "€0.00"
                  : formatPrice(stats.averageOrderValue)
              }
              change={5.7}
              icon={ShoppingBagIcon}
              iconColor="text-orange-600"
              bgColor="bg-orange-50"
            />
          </motion.div>
        )}

        {/* Mobile-optimized Filters */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-2 sm:p-4">
            <form onSubmit={handleSearch} className="space-y-2 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                {/* Search */}
                <div className="sm:col-span-2 md:col-span-2 space-y-1 sm:space-y-2">
                  <Label
                    htmlFor="search"
                    className="text-[9px] sm:text-xs font-medium text-gray-700"
                  >
                    Search Customers
                  </Label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-7 sm:pl-10 h-7 sm:h-9 text-[11px] sm:text-sm"
                      placeholder="Search customers..."
                    />
                  </div>
                </div>

                {/* Role Filter */}
                <div className="space-y-1 sm:space-y-2">
                  <Label
                    htmlFor="role"
                    className="text-[9px] sm:text-xs font-medium text-gray-700"
                  >
                    Role
                  </Label>
                  <Select
                    value={roleFilter || "all"}
                    onValueChange={(value) =>
                      setRoleFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-7 sm:h-9 text-[11px] sm:text-sm">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="all"
                        className="text-[11px] sm:text-sm"
                      >
                        All Roles
                      </SelectItem>
                      <SelectItem
                        value="CUSTOMER"
                        className="text-[11px] sm:text-sm"
                      >
                        Customer
                      </SelectItem>
                      <SelectItem
                        value="VENDOR"
                        className="text-[11px] sm:text-sm"
                      >
                        Vendor
                      </SelectItem>
                      <SelectItem
                        value="ADMIN"
                        className="text-[11px] sm:text-sm"
                      >
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Verification Filter */}
                <div className="space-y-1 sm:space-y-2">
                  <Label
                    htmlFor="verified"
                    className="text-[9px] sm:text-xs font-medium text-gray-700"
                  >
                    Verification
                  </Label>
                  <Select
                    value={verificationFilter || "all"}
                    onValueChange={(value) =>
                      setVerificationFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-7 sm:h-9 text-[11px] sm:text-sm">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="all"
                        className="text-[11px] sm:text-sm"
                      >
                        All Status
                      </SelectItem>
                      <SelectItem
                        value="true"
                        className="text-[11px] sm:text-sm"
                      >
                        Verified
                      </SelectItem>
                      <SelectItem
                        value="false"
                        className="text-[11px] sm:text-sm"
                      >
                        Unverified
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
                <p className="text-[9px] sm:text-xs text-gray-600">
                  {totalCount} customers found
                </p>
                <Button
                  variant="active"
                  className="text-blue-700 h-6 sm:h-8 text-[10px] sm:text-sm px-2 sm:px-3"
                >
                  <FunnelIcon className="text-current h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                  Apply Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Customers Display - Mobile Cards / Desktop Table */}
        {loading ? (
          <>
            {/* Mobile Loading */}
            <div className="block lg:hidden">
              <MobileCustomersSkeleton />
            </div>
            {/* Desktop Loading */}
            <div className="hidden lg:block">
              <TableSkeleton />
            </div>
          </>
        ) : !customers || customers.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-12 text-center">
              <UsersIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
              <h3 className="text-[12px] sm:text-sm font-semibold text-gray-900 mb-1">
                No customers found
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Customers will appear here as they register and make purchases
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Customer Cards - Only visible on mobile */}
            <div className="block lg:hidden">
              {customers.map((customer) => (
                <MobileCustomerCard
                  key={customer.id}
                  customer={customer}
                  onContactCustomer={handleContactCustomer}
                  getInitials={getInitials}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {/* Desktop Table - Only visible on desktop (unchanged) */}
            <div className="hidden lg:block">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-gray-100">
                        <TableHead className="h-10 text-left pl-4">
                          <SortButton
                            field="name"
                            currentSort={sortBy}
                            currentOrder={sortOrder}
                            onSort={handleSort}
                          >
                            Customer
                          </SortButton>
                        </TableHead>
                        <TableHead className="h-10 text-left pl-4">
                          Contact
                        </TableHead>
                        <TableHead className="h-10 text-center">
                          <SortButton
                            field="role"
                            currentSort={sortBy}
                            currentOrder={sortOrder}
                            onSort={handleSort}
                          >
                            Role
                          </SortButton>
                        </TableHead>
                        <TableHead className="h-10 text-center">
                          Orders
                        </TableHead>
                        <TableHead className="h-10 text-center">
                          Total Spent
                        </TableHead>
                        <TableHead className="h-10 text-center">
                          Status
                        </TableHead>
                        <TableHead className="h-10 text-left pl-4">
                          <SortButton
                            field="createdAt"
                            currentSort={sortBy}
                            currentOrder={sortOrder}
                            onSort={handleSort}
                          >
                            Joined
                          </SortButton>
                        </TableHead>
                        <TableHead className="w-[50px] h-10 text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow
                          key={customer.id}
                          className="hover:bg-gray-50/50 border-b border-gray-50"
                        >
                          {/* Customer Column */}
                          <TableCell className="py-3 text-left pl-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                {customer.image ? (
                                  <Image
                                    src={customer.image}
                                    alt={customer.name || "Customer"}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-blue-600 font-medium text-xs">
                                    {getInitials(
                                      customer.name || customer.email
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {customer.name || "Anonymous"}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Contact Column */}
                          <TableCell className="py-3 text-left pl-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-xs text-gray-600">
                                <EnvelopeIcon className="w-3 h-3 mr-1.5 text-gray-400" />
                                <span className="truncate max-w-[120px]">
                                  {customer.email}
                                </span>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <PhoneIcon className="w-3 h-3 mr-1.5 text-gray-400" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Role Column - UPDATED with consistent badges */}
                          <TableCell className="py-3 text-center">
                            {customer.role === "VENDOR" ? (
                              <Badge variant="default" size="sm" icon="auto">
                                Vendor
                              </Badge>
                            ) : customer.role === "ADMIN" ? (
                              <Badge
                                variant="destructive"
                                size="sm"
                                icon="auto"
                              >
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" size="sm" icon="auto">
                                Customer
                              </Badge>
                            )}
                          </TableCell>

                          {/* Orders Column */}
                          <TableCell className="py-3 text-center">
                            <div className="inline-flex flex-col items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {customer._count.orders}
                              </p>
                              <p className="text-xs text-gray-500">orders</p>
                            </div>
                          </TableCell>

                          {/* Total Spent Column */}
                          <TableCell className="py-3 text-center">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPrice(customer.totalSpent || 0)}
                            </p>
                          </TableCell>

                          {/* Status Column - UPDATED with consistent badges */}
                          <TableCell className="py-3 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <Badge
                                variant={
                                  customer.isVerified
                                    ? "verified"
                                    : "unverified"
                                }
                                size="sm"
                                icon="auto"
                              >
                                {customer.isVerified
                                  ? "Verified"
                                  : "Unverified"}
                              </Badge>
                              {customer.emailVerified && (
                                <Badge variant="success" size="sm">
                                  Email ✓
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Joined Column */}
                          <TableCell className="py-3 text-left pl-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(
                                  customer.createdAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(customer.createdAt)}
                              </p>
                            </div>
                          </TableCell>

                          {/* Actions Column */}
                          <TableCell className="py-3 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-gray-100 cursor-pointer"
                                >
                                  <EllipsisVerticalIcon className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/vendor/orders?customer=${customer.id}`}
                                    className="cursor-pointer"
                                  >
                                    <EyeIcon className="w-3 h-3 mr-2" />
                                    View Orders
                                  </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() =>
                                    handleContactCustomer(customer, "email")
                                  }
                                  className="cursor-pointer"
                                >
                                  <EnvelopeIcon className="w-3 h-3 mr-2" />
                                  Send Email
                                </DropdownMenuItem>

                                {customer.phone && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleContactCustomer(customer, "phone")
                                    }
                                    className="cursor-pointer"
                                  >
                                    <PhoneIcon className="w-3 h-3 mr-2" />
                                    Call Customer
                                  </DropdownMenuItem>
                                )}

                                {customer.phone && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleContactCustomer(customer, "sms")
                                    }
                                    className="cursor-pointer"
                                  >
                                    <ChatBubbleLeftRightIcon className="w-3 h-3 mr-2" />
                                    Send SMS
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Mobile-optimized Pagination */}
        {totalPages > 1 && (
          <>
            {/* Mobile Pagination - Ultra compact */}
            <div className="flex flex-col space-y-2 sm:hidden">
              <p className="text-[9px] text-gray-700 text-center">
                Page {currentPage} of {totalPages} ({totalCount} customers)
              </p>
              <div className="flex items-center justify-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-6 px-2 text-[9px]"
                >
                  Prev
                </Button>
                <span className="text-[9px] text-gray-500 px-1">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-6 px-2 text-[9px]"
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Desktop Pagination - Unchanged */}
            <div className="hidden sm:flex items-center justify-between">
              <p className="text-xs text-gray-700">
                Showing {(currentPage - 1) * 10 + 1} to{" "}
                {Math.min(currentPage * 10, totalCount)} of {totalCount}{" "}
                customers
              </p>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 px-3 text-xs cursor-pointer"
                >
                  Previous
                </Button>

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
                      <Button
                        key={pageNumber}
                        variant={
                          currentPage === pageNumber ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 text-xs cursor-pointer ${
                          currentPage === pageNumber
                            ? "bg-slate-900 hover:bg-slate-800 text-white"
                            : ""
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 text-xs cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
