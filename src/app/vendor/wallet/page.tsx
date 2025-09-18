"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BanknotesIcon,
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/buttonSidebar";
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

// Enhanced Stats Card Component with soft colors
function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  variant = "default",
  action,
  delay = 0,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  change?: string;
  variant?: "default" | "success" | "warning" | "destructive";
  action?: React.ReactNode;
  delay?: number;
}) {
  const variantStyles = {
    default:
      "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 border-slate-200",
    success:
      "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-200",
    warning:
      "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 border-amber-200",
    destructive:
      "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 border-rose-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{title}</p>
                {action}
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                {value}
              </p>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
              {change && (
                <div className="flex items-center space-x-1">
                  <ArrowUpIcon className="w-3 h-3 text-emerald-500" />
                  <p className="text-xs font-medium text-emerald-600">
                    {change}
                  </p>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              )}
            </div>
            <div
              className={`p-3 rounded-2xl ${variantStyles[variant]} shadow-sm`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Transaction Icon Component
function TransactionIcon({ type }: { type: string }) {
  const iconProps = "w-4 h-4";
  const iconConfig = {
    sale: { icon: ArrowUpIcon, color: "text-emerald-600", bg: "bg-emerald-50", rotate: "" },
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
    fee: { icon: CreditCardIcon, color: "text-slate-600", bg: "bg-slate-50", rotate: "" },
  };

  const config = iconConfig[type as keyof typeof iconConfig] || iconConfig.fee;
  const IconComponent = config.icon;

  return (
    <div
      className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center`}
    >
      <IconComponent
        className={`${iconProps} ${config.color} ${config.rotate || ""}`}
      />
    </div>
  );
}

// Enhanced Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const variants = {
    completed: {
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "Completed",
      icon: CheckCircleIcon,
    },
    pending: {
      className: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Pending",
      icon: ClockIcon,
    },
    failed: {
      className: "bg-rose-100 text-rose-700 border-rose-200",
      label: "Failed",
      icon: ExclamationTriangleIcon,
    },
  };

  const config = variants[status as keyof typeof variants];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      className={`text-xs font-medium ${config.className} hover:bg-opacity-80`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

// Enhanced Loading Skeleton Component
function WalletSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm bg-white/80">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-24 bg-slate-200" />
                    <Skeleton className="h-8 w-32 bg-slate-200" />
                    <Skeleton className="h-3 w-20 bg-slate-200" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-2xl bg-slate-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Payout Info Skeleton */}
      <Card className="border-0 shadow-sm bg-white/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40 bg-slate-200" />
            <Skeleton className="h-8 w-20 bg-slate-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16 bg-slate-200" />
                <Skeleton className="h-5 w-24 bg-slate-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Skeleton */}
      <Card className="border-0 shadow-sm bg-white/80">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-slate-200" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-xl bg-slate-200" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48 bg-slate-200" />
                    <Skeleton className="h-3 w-32 bg-slate-200" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-5 w-20 bg-slate-200" />
                  <Skeleton className="h-3 w-16 bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
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
                available: 0,
                pending: 0,
                total: 0,
              },
              thisMonth: {
                earnings: 0,
                growth: 0,
              },
              payoutInfo: {
                nextPayout: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toISOString(),
                frequency: "Weekly",
                method: "Bank Transfer",
                account: "Not configured",
              },
              recentTransactions: [],
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Wallet</h1>
              <p className="text-slate-600 mt-1">
                Manage your earnings and payouts
              </p>
            </div>
          </motion.div>
          <WalletSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <BanknotesIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Unable to load wallet
              </h3>
              <p className="text-slate-500 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              >
                Try Again
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Wallet</h1>
            <p className="text-slate-600 mt-1">
              Manage your earnings and payouts
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              asChild
              className="bg-white/80 border-slate-200 hover:bg-white"
            >
              <Link href="/vendor/wallet/settings">
                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
          </div>
        </motion.div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Available Balance"
            value={
              balanceVisible ? formatPrice(data.balance.available) : "••••••"
            }
            subtitle="Ready for payout"
            icon={BanknotesIcon}
            variant="success"
            delay={0}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="h-auto p-1 text-slate-400 hover:text-slate-600"
              >
                {balanceVisible ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </Button>
            }
          />

          <StatsCard
            title="Pending Balance"
            value={
              balanceVisible ? formatPrice(data.balance.pending) : "••••••"
            }
            subtitle="Processing payouts"
            icon={ClockIcon}
            variant="warning"
            delay={0.1}
          />

          <StatsCard
            title="This Month"
            value={formatPrice(data.thisMonth.earnings)}
            subtitle="Total earnings"
            icon={ArrowTrendingUpIcon}
            change={`+${data.thisMonth.growth}%`}
            variant="default"
            delay={0.2}
          />
        </div>

        {/* Payout Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center border border-blue-200">
                    <BuildingLibraryIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">
                      Payout Schedule
                    </CardTitle>
                    <p className="text-sm text-slate-600">Automatic payouts</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 border-slate-200 hover:bg-white"
                >
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                    Next Payout
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
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
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                    Frequency
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {data.payoutInfo.frequency}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                    Method
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {data.payoutInfo.method}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                    Account
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {data.payoutInfo.account}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-slate-900">
                  Recent Transactions
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href="/vendor/wallet/transactions"
                    className="text-slate-600 hover:text-slate-900"
                  >
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-slate-600">
                      Transaction
                    </TableHead>
                    <TableHead className="text-slate-600">Date</TableHead>
                    <TableHead className="text-slate-600">Status</TableHead>
                    <TableHead className="text-right text-slate-600">
                      Amount
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-slate-50/50 border-slate-100"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <TransactionIcon type={transaction.type} />
                          <div>
                            <p className="font-medium text-slate-900 text-sm">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">
                              {transaction.type}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {new Date(transaction.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
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

                      <TableCell>
                        <StatusBadge status={transaction.status} />
                      </TableCell>

                      <TableCell className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.amount > 0
                              ? "text-emerald-600"
                              : "text-slate-900"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {formatPrice(Math.abs(transaction.amount))}
                        </p>
                      </TableCell>

                      <TableCell>
                        {transaction.orderId && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/vendor/orders/${transaction.orderId}`}
                              className="text-slate-600 hover:text-slate-900 text-xs"
                            >
                              View
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200">
                  <BanknotesIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    How payouts work
                  </h3>
                  <p className="text-blue-800 text-sm mb-4 leading-relaxed">
                    Your earnings are automatically transferred to your bank
                    account based on your payout schedule. Funds typically take
                    1-3 business days to appear in your account.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-700 hover:text-blue-800 p-0 h-auto font-medium"
                  >
                    Learn more
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
