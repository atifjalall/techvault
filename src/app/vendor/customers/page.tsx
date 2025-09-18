"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ShoppingBagIcon,
  CurrencyEuroIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

// UI Components
import { Button } from "@/components/ui/buttonSidebar";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  totalSpent: number; // This would be calculated from orders
  lastOrderDate?: string; // From most recent order
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

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  variant = "default",
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change: string;
  variant?: "default" | "success" | "warning" | "destructive";
}) {
  const variantStyles = {
    default: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-yellow-50 text-yellow-600",
    destructive: "bg-red-50 text-red-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === "number" &&
              title.toLowerCase().includes("revenue")
                ? formatPrice(value)
                : value}
            </p>
            <p
              className={`text-xs font-medium ${change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
            >
              {change} from last month
            </p>
          </div>
          <div className={`p-3 rounded-xl ${variantStyles[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sort Button Component
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
      className="hover:bg-transparent p-0 h-auto font-semibold text-xs text-gray-600 uppercase tracking-wide"
    >
      <span className="flex items-center space-x-1">
        <span>{children}</span>
        {currentSort === field && (
          <div className="text-blue-600">
            {currentOrder === "asc" ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
          </div>
        )}
      </span>
    </Button>
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
    loadCustomers();
  }, [
    currentPage,
    searchTerm,
    roleFilter,
    verificationFilter,
    sortBy,
    sortOrder,
  ]);

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage customer relationships and view order history
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={UsersIcon}
          change="+12.5%"
          variant="default"
        />
        <StatsCard
          title="New This Month"
          value={stats.newCustomersThisMonth}
          icon={UserIcon}
          change="+8.3%"
          variant="success"
        />
        <StatsCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={CurrencyEuroIcon}
          change="+15.2%"
          variant="default"
        />
        <StatsCard
          title="Avg Order Value"
          value={formatPrice(stats.averageOrderValue)}
          icon={ShoppingBagIcon}
          change="+5.7%"
          variant="success"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="search">Search Customers</Label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    placeholder="Search by name, email, or phone..."
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={roleFilter || "all"}
                  onValueChange={(value) =>
                    setRoleFilter(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="VENDOR">Vendor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verification Filter */}
              <div className="space-y-2">
                <Label htmlFor="verified">Verification</Label>
                <Select
                  value={verificationFilter || "all"}
                  onValueChange={(value) =>
                    setVerificationFilter(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-600">
                {totalCount} customers found
              </p>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center space-y-4">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : !customers || customers.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No customers found
              </h3>
              <p className="text-gray-500">
                Customers will appear here as they register and make purchases
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>
                    <SortButton
                      field="name"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    >
                      Customer
                    </SortButton>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>
                    <SortButton
                      field="role"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    >
                      Role
                    </SortButton>
                  </TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <SortButton
                      field="createdAt"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    >
                      Joined
                    </SortButton>
                  </TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                          {customer.image ? (
                            <Image
                              src={customer.image}
                              alt={customer.name || "Customer"}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-medium text-sm">
                              {getInitials(customer.name || customer.email)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {customer.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="w-3 h-3 mr-2 text-gray-400" />
                          <span className="truncate max-w-[120px]">
                            {customer.email}
                          </span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="w-3 h-3 mr-2 text-gray-400" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          customer.role === "VENDOR"
                            ? "default"
                            : customer.role === "ADMIN"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {customer.role}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">
                          {customer._count.orders}
                        </p>
                        <p className="text-xs text-gray-500">orders</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="font-bold text-gray-900">
                        {formatPrice(customer.totalSpent || 0)}
                      </p>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            customer.isVerified ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {customer.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                        {customer.emailVerified && (
                          <Badge variant="outline" className="text-xs">
                            Email ✓
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(customer.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(customer.createdAt)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/vendor/orders?customer=${customer.id}`}
                            >
                              <EyeIcon className="w-4 h-4 mr-2" />
                              View Orders
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() =>
                              handleContactCustomer(customer, "email")
                            }
                          >
                            <EnvelopeIcon className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>

                          {customer.phone && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleContactCustomer(customer, "phone")
                              }
                            >
                              <PhoneIcon className="w-4 h-4 mr-2" />
                              Call Customer
                            </DropdownMenuItem>
                          )}

                          {customer.phone && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleContactCustomer(customer, "sms")
                              }
                            >
                              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, totalCount)} of {totalCount} customers
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
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
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-10 ${currentPage === pageNumber ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
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
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
