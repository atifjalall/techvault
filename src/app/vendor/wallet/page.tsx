"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BanknotesIcon,
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowTrendingUpIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
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

// Mock data
const mockWalletData: WalletData = {
  balance: {
    available: 4567.89,
    pending: 890.45,
    total: 5458.34,
  },
  thisMonth: {
    earnings: 12450.8,
    growth: 18.5,
  },
  payoutInfo: {
    nextPayout: "2024-09-20",
    frequency: "Weekly",
    method: "Bank Transfer",
    account: "****1234",
  },
  recentTransactions: [
    {
      id: "1",
      type: "sale",
      amount: 299.99,
      description: "iPhone 15 Pro Max - Order #12345",
      date: "2024-09-15T10:30:00Z",
      status: "completed",
      orderId: "12345",
    },
    {
      id: "2",
      type: "sale",
      amount: 189.5,
      description: "AirPods Pro 2 - Order #12346",
      date: "2024-09-15T08:15:00Z",
      status: "completed",
      orderId: "12346",
    },
    {
      id: "3",
      type: "payout",
      amount: -2450.75,
      description: "Weekly payout to bank account",
      date: "2024-09-13T09:00:00Z",
      status: "completed",
    },
    {
      id: "4",
      type: "sale",
      amount: 99.99,
      description: "Wireless Charger - Order #12347",
      date: "2024-09-12T16:45:00Z",
      status: "pending",
      orderId: "12347",
    },
    {
      id: "5",
      type: "refund",
      amount: -79.99,
      description: "Refund for Order #12340",
      date: "2024-09-11T14:20:00Z",
      status: "completed",
      orderId: "12340",
    },
  ],
};

function TransactionIcon({ type }: { type: string }) {
  switch (type) {
    case "sale":
      return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
    case "payout":
      return <ArrowDownTrayIcon className="w-4 h-4 text-blue-600" />;
    case "refund":
      return <ArrowUpIcon className="w-4 h-4 text-red-600 rotate-180" />;
    case "fee":
      return <CreditCardIcon className="w-4 h-4 text-gray-600" />;
    default:
      return <ClockIcon className="w-4 h-4 text-gray-600" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Failed
        </span>
      );
    default:
      return null;
  }
}

export default function VendorWalletPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<WalletData>(mockWalletData);
  const [loading, setLoading] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Load wallet data
  useEffect(() => {
    const loadWalletData = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        // const response = await fetch('/api/vendor/wallet');
        // const result = await response.json();
        // setData(result.data);

        // Simulate loading
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        console.error("Error loading wallet data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-light text-gray-900 mb-3">Wallet</h1>
          <p className="text-lg text-gray-600">
            Manage your earnings and payouts
          </p>
        </motion.div>

        {/* Balance Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Available Balance */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <BanknotesIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">
                    Available Balance
                  </h3>
                  <p className="text-xs text-gray-500">Ready for payout</p>
                </div>
              </div>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {balanceVisible ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="space-y-4">
              {balanceVisible ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-4xl font-light text-gray-900"
                >
                  {formatPrice(data.balance.available)}
                </motion.div>
              ) : (
                <div className="text-4xl font-light text-gray-900">••••••</div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium text-gray-900">
                  {balanceVisible ? formatPrice(data.balance.pending) : "••••"}
                </span>
              </div>
            </div>
          </div>

          {/* This Month Earnings */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  This Month
                </h3>
                <p className="text-xs text-gray-500">Total earnings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-4xl font-light text-gray-900">
                {formatPrice(data.thisMonth.earnings)}
              </div>

              <div className="flex items-center space-x-2">
                <ArrowUpIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{data.thisMonth.growth}%
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payout Information */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <BuildingLibraryIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Payout Schedule
                </h3>
                <p className="text-sm text-gray-500">Automatic payouts</p>
              </div>
            </div>

            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Manage
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Next Payout
              </p>
              <p className="text-lg font-medium text-gray-900">
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
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Frequency
              </p>
              <p className="text-lg font-medium text-gray-900">
                {data.payoutInfo.frequency}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Method
              </p>
              <p className="text-lg font-medium text-gray-900">
                {data.payoutInfo.method}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Account
              </p>
              <p className="text-lg font-medium text-gray-900">
                {data.payoutInfo.account}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          className="bg-white rounded-3xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Activity
              </h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                View All
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {data.recentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <TransactionIcon type={transaction.type} />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                          <StatusBadge status={transaction.status} />
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-medium ${
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-gray-900"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {formatPrice(Math.abs(transaction.amount))}
                      </p>
                      {transaction.orderId && (
                        <button className="text-xs text-blue-600 hover:text-blue-700 transition-colors mt-1">
                          View Order
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <InformationCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                How payouts work
              </h3>
              <p className="text-blue-700 mb-4">
                Your earnings are automatically transferred to your bank account
                based on your payout schedule. Funds typically take 1-3 business
                days to appear in your account.
              </p>
              <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Learn more
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
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
                className="bg-white rounded-2xl p-8 shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Loading wallet data
                    </p>
                    <p className="text-sm text-gray-600">Please wait...</p>
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
