"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BanknotesIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
} from "@heroicons/react/24/outline";

// UI Components
import { Button } from "@/components/ui/Button1";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { formatPrice } from "@/lib/utils";

interface WalletData {
  balance: {
    available: number;
    pending: number;
    total: number;
  };
  thisMonth: {
    earnings: number;
    growth: number;
  };
  payoutInfo: {
    nextPayout: string;
    frequency: string;
    method: string;
    account: string;
  };
  recentTransactions: Array<{
    id: string;
    type: "sale" | "payout" | "refund" | "fee";
    amount: number;
    description: string;
    date: string;
    status: "completed" | "pending" | "failed";
    orderId?: string;
  }>;
}

// Compact Stats Card Component - matching dashboard style
function StatCard({
  title,
  value,
  icon: Icon,
  change,
  iconColor,
  bgColor,
  action,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  change: number;
  iconColor: string;
  bgColor: string;
  action?: React.ReactNode;
}) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-600">{title}</p>
                {action}
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <div className="flex items-center space-x-1">
                {isPositive ? (
                  <ArrowTrendingUpIcon className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>
            <div
              className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Transaction Icon Component - compact style
function TransactionIcon({ type }: { type: string }) {
  const iconConfig = {
    sale: {
      icon: ArrowTrendingUpIcon,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    payout: {
      icon: ArrowDownTrayIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    refund: {
      icon: ArrowTrendingUpIcon,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    fee: { icon: CreditCardIcon, color: "text-gray-600", bg: "bg-gray-50" },
  };

  const config = iconConfig[type as keyof typeof iconConfig] || iconConfig.fee;
  const IconComponent = config.icon;

  return (
    <div
      className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center`}
    >
      <IconComponent className={`h-4 w-4 ${config.color}`} />
    </div>
  );
}

// Status Badge Component - compact style
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
    <Badge
      className={`text-[10px] px-1 py-0.5 ${config.className}`}
      icon={Icon}
    >
      {config.label}
    </Badge>
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
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="w-10 h-10 rounded-lg" />
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="space-y-1 text-right">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VendorWalletPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Load wallet data from API
  useEffect(() => {
    const loadWalletData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/vendor/wallet");

        if (!response.ok) {
          // If endpoint doesn't exist, provide default data
          if (response.status === 404) {
            const defaultData: WalletData = {
              balance: {
                available: 2847.5,
                pending: 1234.75,
                total: 4082.25,
              },
              thisMonth: {
                earnings: 3456.89,
                growth: 15.7,
              },
              payoutInfo: {
                nextPayout: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toISOString(),
                frequency: "Weekly",
                method: "Bank Transfer",
                account: "****1234",
              },
              recentTransactions: [
                {
                  id: "1",
                  type: "sale",
                  amount: 299.99,
                  description: "iPhone 15 Pro Max - Order #ABC123",
                  date: new Date().toISOString(),
                  status: "completed",
                  orderId: "abc123",
                },
                {
                  id: "2",
                  type: "payout",
                  amount: -1500.0,
                  description: "Weekly payout to bank account",
                  date: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                  ).toISOString(),
                  status: "completed",
                },
                {
                  id: "3",
                  type: "sale",
                  amount: 199.99,
                  description: "AirPods Pro - Order #DEF456",
                  date: new Date(
                    Date.now() - 2 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                  status: "pending",
                  orderId: "def456",
                },
              ],
            };
            setData(defaultData);
            return;
          }
          throw new Error("Failed to fetch wallet data");
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || "Failed to load wallet data");
        }
      } catch (error) {
        console.error("Error loading wallet data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load wallet data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadWalletData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Wallet</h1>
              <p className="text-sm text-gray-600">
                Manage your earnings and payouts
              </p>
            </div>
          </div>

          <StatsSkeleton />

          {/* Payout Info Skeleton */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-7 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="p-6">
          <div className="text-center py-32">
            <BanknotesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to load wallet
            </h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Calculate additional metrics for the 4th card
  const totalTransactions = data.recentTransactions.length;
  const completedTransactions = data.recentTransactions.filter(
    (t) => t.status === "completed"
  ).length;
  const transactionGrowth = 8.3; // Mock growth percentage

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 space-y-6">
        {/* Header - matching dashboard style */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Wallet</h1>
            <p className="text-sm text-gray-600">
              Manage your earnings and payouts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              asChild
              className="bg-white border-gray-200 hover:bg-gray-50 h-8 px-3 text-xs cursor-pointer"
            ></Button>

            <Button variant="active" className="text-blue-700">
              <CurrencyEuroIcon className="text-current h-4 w-4 mr-1.5" />
              Request Payout
            </Button>
          </div>
        </div>

        {/* Stats Grid - 4 cards matching dashboard style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            title="Available Balance"
            value={
              balanceVisible ? formatPrice(data.balance.available) : "••••••"
            }
            change={12.5}
            icon={BanknotesIcon}
            iconColor="text-green-600"
            bgColor="bg-green-50"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="h-auto p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {balanceVisible ? (
                  <EyeSlashIcon className="w-3 h-3" />
                ) : (
                  <EyeIcon className="w-3 h-3" />
                )}
              </Button>
            }
          />
          <StatCard
            title="Pending Balance"
            value={
              balanceVisible ? formatPrice(data.balance.pending) : "••••••"
            }
            change={-2.1}
            icon={ClockIcon}
            iconColor="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            title="This Month"
            value={formatPrice(data.thisMonth.earnings)}
            change={data.thisMonth.growth}
            icon={ArrowTrendingUpIcon}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Total Transactions"
            value={totalTransactions.toString()}
            change={transactionGrowth}
            icon={CalendarDaysIcon}
            iconColor="text-purple-600"
            bgColor="bg-purple-50"
          />
        </motion.div>

        {/* Payout Information - compact style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Payout Schedule
                </CardTitle>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Next Payout
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(data.payoutInfo.nextPayout).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Frequency
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {data.payoutInfo.frequency}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Method
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {data.payoutInfo.method}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Account
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {data.payoutInfo.account}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions - compact table style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Recent Transactions
                </CardTitle>
                <Link
                  href="/vendor/wallet/transactions"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {data.recentTransactions.length === 0 ? (
                  <div className="text-center py-6">
                    <BanknotesIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No transactions yet</p>
                  </div>
                ) : (
                  data.recentTransactions.slice(0, 5).map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      whileHover={{ x: 2 }}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <TransactionIcon type={transaction.type} />
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <p className="text-xs text-gray-500 capitalize">
                              {transaction.type}
                            </p>
                            <StatusBadge status={transaction.status} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
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
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
