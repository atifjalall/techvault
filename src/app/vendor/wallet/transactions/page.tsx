"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownTrayIcon,
  ArrowUpIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowLeftIcon,
  BanknotesIcon,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

import { formatPrice } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "sale" | "payout" | "refund" | "fee";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
  orderId?: string;
  customerName?: string;
  paymentMethod?: string;
  reference?: string;
}

interface TransactionsResponse {
  success: boolean;
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: {
    totalIncome: number;
    totalOutgoing: number;
    pendingAmount: number;
    completedTransactions: number;
  };
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const variants = {
    completed: {
      className: "bg-green-100 text-green-700 border-green-200",
      label: "Completed",
      icon: CheckCircleIcon,
    },
    pending: {
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      label: "Pending",
      icon: ClockIcon,
    },
    failed: {
      className: "bg-red-100 text-red-700 border-red-200",
      label: "Failed",
      icon: ExclamationTriangleIcon,
    },
  };

  const config = variants[status as keyof typeof variants];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge className={`text-xs px-2 py-0.5 ${config.className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

// Loading Skeleton for table
function TableSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-0">
        <div className="space-y-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Transaction Icon Component
function TransactionIcon({ type }: { type: string }) {
  const iconConfig = {
    sale: { icon: ArrowUpIcon, color: "text-green-600", bg: "bg-green-50", rotate: "" },
    payout: {
      icon: ArrowDownTrayIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
      rotate: "",
    },
    refund: {
      icon: ArrowUpIcon,
      color: "text-orange-600",
      bg: "bg-orange-50",
      rotate: "rotate-180",
    },
    fee: { icon: CreditCardIcon, color: "text-gray-600", bg: "bg-gray-50", rotate: "" },
  };

  const config = iconConfig[type as keyof typeof iconConfig] || iconConfig.fee;
  const IconComponent = config.icon;

  return (
    <div
      className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center`}
    >
      <IconComponent
        className={`h-4 w-4 ${config.color} ${config.rotate || ""}`}
      />
    </div>
  );
}
// Stat Card Component
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  bgColor,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">{title}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <div className="flex items-center space-x-1">
              <span
                className={`text-xs font-medium ${
                  change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {change >= 0 ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </div>
          <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeletons - matching dashboard style
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}



export default function VendorTransactionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalOutgoing: 0,
    pendingAmount: 0,
    completedTransactions: 0,
  });

  // Load transactions
  useEffect(() => {
    loadTransactions();
  }, [currentPage, searchTerm, typeFilter, statusFilter, dateFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (dateFilter) params.append("date", dateFilter);

      const response = await fetch(`/api/vendor/wallet/transactions?${params}`);
      const data: TransactionsResponse = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTransactions();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setStatusFilter("");
    setDateFilter("");
    setCurrentPage(1);
  };

  const exportTransactions = () => {
    // Implement export functionality
    console.log("Exporting transactions...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 space-y-6">
        {/* Header - matching dashboard style */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-600">
              View and manage all your wallet transactions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-white border-gray-200 hover:bg-gray-50 h-8 px-3 text-xs cursor-pointer"
            >
              <Link href="/vendor/wallet">
                <XMarkIcon className="w-3 h-3 mr-1.5" />
                Back to Wallet
              </Link>
            </Button>
            <Button
              onClick={exportTransactions}
              className="bg-slate-900 hover:bg-slate-800 text-white h-8 px-3 text-xs cursor-pointer"
            >
              <ArrowDownTrayIcon className="w-3 h-3 mr-1.5" />
              Export
            </Button>
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
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              title="Total Income"
              value={formatPrice(stats.totalIncome)}
              change={15.3}
              icon={BanknotesIcon}
              iconColor="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Total Outgoing"
              value={formatPrice(stats.totalOutgoing)}
              change={-2.1}
              icon={ArrowDownTrayIcon}
              iconColor="text-red-600"
              bgColor="bg-red-50"
            />
            <StatCard
              title="Pending Amount"
              value={formatPrice(stats.pendingAmount)}
              change={8.7}
              icon={ClockIcon}
              iconColor="text-yellow-600"
              bgColor="bg-yellow-50"
            />
            <StatCard
              title="Completed"
              value={stats.completedTransactions.toString()}
              change={12.4}
              icon={CheckCircleIcon}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />
          </motion.div>
        )}

        {/* Filters - compact style */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
                <div className="md:col-span-2 space-y-2">
                  <Label
                    htmlFor="search"
                    className="text-xs font-medium text-gray-700"
                  >
                    Search Transactions
                  </Label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 text-sm"
                      placeholder="Search by description, reference..."
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div className="space-y-2">
                  <Label
                    htmlFor="type"
                    className="text-xs font-medium text-gray-700"
                  >
                    Type
                  </Label>
                  <Select
                    value={typeFilter || "all"}
                    onValueChange={(value) =>
                      setTypeFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="sale">Sales</SelectItem>
                      <SelectItem value="payout">Payouts</SelectItem>
                      <SelectItem value="refund">Refunds</SelectItem>
                      <SelectItem value="fee">Fees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-xs font-medium text-gray-700"
                  >
                    Status
                  </Label>
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) =>
                      setStatusFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="text-xs font-medium text-gray-700"
                  >
                    Date Range
                  </Label>
                  <Select
                    value={dateFilter || "all"}
                    onValueChange={(value) =>
                      setDateFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-600">
                    {totalCount} transactions found
                  </p>
                  {(searchTerm || typeFilter || statusFilter || dateFilter) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-6 px-2 text-xs cursor-pointer"
                    >
                      <XMarkIcon className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white h-8 px-4 text-xs cursor-pointer"
                >
                  <FunnelIcon className="w-3 h-3 mr-1.5" />
                  Apply Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        {loading ? (
          <TableSkeleton />
        ) : !transactions || transactions.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                No transactions found
              </h3>
              <p className="text-xs text-gray-500">
                Transactions will appear here as you receive payments and make
                payouts
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="h-10 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Transaction
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Date
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Status
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-gray-600 uppercase tracking-wide text-right">
                      Amount
                    </TableHead>
                    <TableHead className="h-10 w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="hover:bg-gray-50/50 border-b border-gray-50"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center space-x-3">
                          <TransactionIcon type={transaction.type} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className="capitalize">
                                {transaction.type}
                              </span>
                              {transaction.reference && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.reference}</span>
                                </>
                              )}
                              {transaction.customerName && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.customerName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(transaction.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <StatusBadge status={transaction.status} />
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <p
                          className={`text-sm font-semibold ${
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-gray-900"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {formatPrice(Math.abs(transaction.amount))}
                        </p>
                        {transaction.paymentMethod && (
                          <p className="text-xs text-gray-500">
                            {transaction.paymentMethod}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="py-3">
                        {transaction.orderId && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/vendor/orders?search=${transaction.orderId}`}
                              className="text-blue-600 hover:text-blue-700 text-xs cursor-pointer"
                            >
                              View
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pagination - compact style */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-700">
              Showing {(currentPage - 1) * 20 + 1} to{" "}
              {Math.min(currentPage * 20, totalCount)} of {totalCount}{" "}
              transactions
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
        )}
      </div>
    </div>
  );
}
