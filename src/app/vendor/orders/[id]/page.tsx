/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button1";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftIcon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  ClockIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CubeIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { toast } from "sonner";

// Updated interfaces for variant support
interface OrderItemBase {
  id: string;
  quantity: number;
  price: number;
  total: number;
}

interface RegularOrderItem extends OrderItemBase {
  type: "regular";
  productId: string;
  variantId: null;
  productName: string;
  variantName: null;
  image: string;
  variantDetails: null;
}

interface VariantOrderItem extends OrderItemBase {
  type: "variant";
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  image: string;
  variantDetails: {
    color?: string;
    storage?: string;
    ram?: string;
    size?: string;
    material?: string;
    attributes?: Record<string, any>;
  } | null;
}

type OrderItem = RegularOrderItem | VariantOrderItem;

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal?: number;
  vendorSubtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  shippingAddress: any;
  billingAddress?: any;
  trackingNumber?: string;
  shippingCarrier?: string;
  estimatedDelivery?: string;
  notes?: string;
  customerNotes?: string;
  priority: string;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  statusHistory: Array<{
    id: string;
    status: string;
    notes?: string;
    changedBy?: string;
    createdAt: string;
  }>;
}

const OrderStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
      case "PAYMENT_PENDING":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "PAYMENT_FAILED":
      case "CANCELLED":
        return "bg-red-100 text-red-600 border-red-200";
      case "CONFIRMED":
      case "PROCESSING":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "SHIPPED":
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-600 border-purple-200";
      case "DELIVERED":
      case "COMPLETED":
        return "bg-green-100 text-green-600 border-green-200";
      case "ON_HOLD":
      case "REQUIRES_ACTION":
        return "bg-orange-100 text-orange-600 border-orange-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <Badge
      className={`${getStatusColor(status)} text-[10px] px-1 py-0.25 rounded font-normal`}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const getColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-600 border-green-200";
      case "PENDING":
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <Badge
      className={`${getColor(status)} text-[10px] px-1 py-0.25 rounded font-normal`}
    >
      {status}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const getColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-600 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-600 border-orange-200";
      case "NORMAL":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "LOW":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <Badge
      className={`${getColor(priority)} text-[10px] px-1 py-0.25 rounded font-normal`}
    >
      {priority}
    </Badge>
  );
};

const VariantDisplayChips = ({ item }: { item: VariantOrderItem }) => {
  const details = item.variantDetails;
  if (!details) return null;

  const chips = [];
  if (details.color) chips.push({ label: details.color, type: "color" });
  if (details.storage) chips.push({ label: details.storage, type: "storage" });
  if (details.ram) chips.push({ label: details.ram, type: "ram" });
  if (details.size) chips.push({ label: details.size, type: "size" });
  if (details.material)
    chips.push({ label: details.material, type: "material" });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {chips.map((chip, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
};

// Loading skeleton components
const OrderDetailSkeleton = () => (
  <div className="bg-gray-50 min-h-screen">
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-6 w-12" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
          <Skeleton className="h-28" />
        </div>
      </div>
    </div>
  </div>
);

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form states for editing
  const [formData, setFormData] = useState({
    status: "",
    trackingNumber: "",
    shippingCarrier: "",
    estimatedDelivery: "",
    notes: "",
    priority: "",
  });

  useEffect(() => {
    if (session?.user) {
      fetchOrderDetail();
    }
  }, [session, resolvedParams.id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendor/orders/${resolvedParams.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Order not found");
          router.push("/vendor/orders");
          return;
        }
        throw new Error("Failed to fetch order");
      }

      const result = await response.json();
      if (result.success) {
        setOrder(result.order);
        setFormData({
          status: result.order.status,
          trackingNumber: result.order.trackingNumber || "",
          shippingCarrier: result.order.shippingCarrier || "",
          estimatedDelivery: result.order.estimatedDelivery
            ? format(new Date(result.order.estimatedDelivery), "yyyy-MM-dd")
            : "",
          notes: result.order.notes || "",
          priority: result.order.priority,
        });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!order) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/vendor/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: formData.status,
          trackingNumber: formData.trackingNumber || null,
          shippingCarrier: formData.shippingCarrier || null,
          estimatedDelivery: formData.estimatedDelivery || null,
          notes: formData.notes || null,
          priority: formData.priority,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const result = await response.json();
      if (result.success) {
        setOrder(result.order);
        setEditMode(false);

        const statusChanged = formData.status !== order.status;
        if (statusChanged) {
          toast.success(
            `Order status updated to ${formData.status.replace(/_/g, " ").toLowerCase()}`
          );
        } else {
          toast.success("Order updated successfully");
        }
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              The order you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have permission to view it.
            </p>
            <Button
              onClick={() => router.push("/vendor/orders")}
              size="sm"
              className="cursor-pointer"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">
                  Order #{order.orderNumber.slice(-8).toUpperCase()}
                </h1>
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
                <PriorityBadge priority={order.priority} />
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                <CalendarIcon className="w-3 h-3 mr-1" />
                Placed on{" "}
                {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
          <Button
            variant={editMode ? "active" : "default"} // use your variant names like "active" or "default"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="cursor-pointer"
          >
            {editMode ? (
              <>
                <EyeIcon className="w-4 h-4 mr-2" />
                View
              </>
            ) : (
              <>
                <PencilSquareIcon className="w-4 h-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                    <ShoppingBagIcon className="w-4 h-4 mr-2 text-blue-600" />
                    Order Items ({order.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ x: 2 }}
                        className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex-shrink-0 overflow-hidden border border-gray-200">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <CubeIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {item.productName}
                          </h4>
                          {item.type === "variant" && item.variantDetails && (
                            <VariantDisplayChips item={item} />
                          )}
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-600 flex items-center">
                              <CubeIcon className="w-3 h-3 mr-1" />
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs text-gray-600">
                              €{item.price.toFixed(2)} each
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            €{item.total.toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {editMode ? (
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                      <PencilSquareIcon className="w-4 h-4 mr-2 text-orange-600" />
                      Update Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor="status"
                          className="text-xs font-medium flex items-center mb-1"
                        >
                          <InformationCircleIcon className="w-3 h-3 mr-1" />
                          Order Status
                        </Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger className="cursor-pointer h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="PROCESSING">
                              Processing
                            </SelectItem>
                            <SelectItem value="PACKAGING">Packaging</SelectItem>
                            <SelectItem value="READY_TO_SHIP">
                              Ready to Ship
                            </SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="IN_TRANSIT">
                              In Transit
                            </SelectItem>
                            <SelectItem value="OUT_FOR_DELIVERY">
                              Out for Delivery
                            </SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="ON_HOLD">On Hold</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor="priority"
                          className="text-xs font-medium flex items-center mb-1"
                        >
                          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                          Priority
                        </Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) =>
                            setFormData({ ...formData, priority: value })
                          }
                        >
                          <SelectTrigger className="cursor-pointer h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="NORMAL">Normal</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor="trackingNumber"
                          className="text-xs font-medium flex items-center mb-1"
                        >
                          <TruckIcon className="w-3 h-3 mr-1" />
                          Tracking Number
                        </Label>
                        <Input
                          id="trackingNumber"
                          value={formData.trackingNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              trackingNumber: e.target.value,
                            })
                          }
                          placeholder="Enter tracking number"
                          className="cursor-pointer h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="shippingCarrier"
                          className="text-xs font-medium flex items-center mb-1"
                        >
                          <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                          Shipping Carrier
                        </Label>
                        <Select
                          value={formData.shippingCarrier}
                          onValueChange={(value) =>
                            setFormData({ ...formData, shippingCarrier: value })
                          }
                        >
                          <SelectTrigger className="cursor-pointer h-8 text-xs">
                            <SelectValue placeholder="Select carrier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DHL">DHL</SelectItem>
                            <SelectItem value="UPS">UPS</SelectItem>
                            <SelectItem value="FedEx">FedEx</SelectItem>
                            <SelectItem value="Deutsche Post">
                              Deutsche Post
                            </SelectItem>
                            <SelectItem value="Hermes">Hermes</SelectItem>
                            <SelectItem value="DPD">DPD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="estimatedDelivery"
                        className="text-xs font-medium flex items-center mb-1"
                      >
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Estimated Delivery
                      </Label>
                      <Input
                        id="estimatedDelivery"
                        type="date"
                        value={formData.estimatedDelivery}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estimatedDelivery: e.target.value,
                          })
                        }
                        className="cursor-pointer h-8 text-xs"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="notes"
                        className="text-xs font-medium flex items-center mb-1"
                      >
                        <DocumentTextIcon className="w-3 h-3 mr-1" />
                        Internal Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Add internal notes about this order..."
                        rows={2}
                        className="cursor-pointer text-xs"
                      />
                    </div>

                    <div className="flex space-x-2 pt-2 border-t border-gray-200">
                      <Button
                        onClick={handleUpdateOrder}
                        disabled={updating}
                        size="sm"
                        className="cursor-pointer"
                      >
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        {updating ? "Updating..." : "Update"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMode(false)}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                      <InformationCircleIcon className="w-4 h-4 mr-2 text-blue-600" />
                      Order Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.trackingNumber && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-blue-900">
                              Tracking
                            </p>
                            <p className="text-sm text-blue-700">
                              {order.trackingNumber}
                            </p>
                            {order.shippingCarrier && (
                              <p className="text-xs text-blue-600">
                                via {order.shippingCarrier}
                              </p>
                            )}
                          </div>
                          <TruckIcon className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                    )}

                    {order.estimatedDelivery && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-green-900">
                              Estimated Delivery
                            </p>
                            <p className="text-sm text-green-700">
                              {format(
                                new Date(order.estimatedDelivery),
                                "MMM d, yyyy"
                              )}
                            </p>
                          </div>
                          <CalendarIcon className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    )}

                    {order.notes && (
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-amber-900 mb-1">
                          Internal Notes
                        </p>
                        <p className="text-xs text-amber-800">{order.notes}</p>
                      </div>
                    )}

                    {order.customerNotes && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-purple-900 mb-1">
                          Customer Notes
                        </p>
                        <p className="text-xs text-purple-800">
                          {order.customerNotes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Status History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2 text-purple-600" />
                    Status History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.statusHistory?.length > 0 ? (
                      order.statusHistory.map((history, index) => (
                        <motion.div
                          key={history.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-gray-900">
                                {history.status.replace(/_/g, " ")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(
                                  new Date(history.createdAt),
                                  "MMM d, h:mm a"
                                )}
                              </p>
                            </div>
                            {history.notes && (
                              <p className="text-xs text-gray-600 mt-0.5">
                                {history.notes}
                              </p>
                            )}
                            {history.changedBy && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                by {history.changedBy}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-3">
                        No status history available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-4">
            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                    <UserIcon className="w-4 h-4 mr-2 text-blue-600" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.user.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {order.user.email}
                      </p>
                    </div>
                  </div>

                  {order.user.phone && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <PhoneIcon className="w-3 h-3" />
                      <span>{order.user.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <EnvelopeIcon className="w-3 h-3" />
                    <Link
                      href={`mailto:${order.user.email}`}
                      className="hover:text-blue-600 cursor-pointer"
                    >
                      Send Email
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-2 text-green-600" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 p-3 rounded-lg space-y-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {order.shippingAddress.name}
                    </p>
                    <p className="text-xs text-gray-700">
                      {order.shippingAddress.street}
                    </p>
                    <p className="text-xs text-gray-700">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-xs text-gray-700">
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                    <CreditCardIcon className="w-4 h-4 mr-2 text-purple-600" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.paymentMethod || "Card Payment"}
                      </p>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                    <CreditCardIcon className="w-4 h-4 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                    <BanknotesIcon className="w-4 h-4 mr-2 text-green-600" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Your Items</span>
                      <span className="font-medium text-gray-900">
                        €{order.vendorSubtotal.toFixed(2)}
                      </span>
                    </div>

                    {Number(order.taxAmount) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-700">
                          €{Number(order.taxAmount).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {Number(order.shippingCost) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-700">
                          €{Number(order.shippingCost).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {Number(order.discountAmount) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-red-600">
                          -€{Number(order.discountAmount).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        Your Revenue
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        €{order.vendorSubtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        Order Total: €{Number(order.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2 text-orange-600" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-gray-900">
                          Order Placed
                        </p>
                        <p className="text-xs text-orange-700">
                          {format(new Date(order.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <CalendarIcon className="w-3 h-3 text-orange-600" />
                    </div>

                    {order.shippedAt && (
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            Shipped
                          </p>
                          <p className="text-xs text-blue-700">
                            {format(new Date(order.shippedAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <TruckIcon className="w-3 h-3 text-blue-600" />
                      </div>
                    )}

                    {order.deliveredAt && (
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            Delivered
                          </p>
                          <p className="text-xs text-green-700">
                            {format(
                              new Date(order.deliveredAt),
                              "MMM d, h:mm a"
                            )}
                          </p>
                        </div>
                        <CheckCircleIcon className="w-3 h-3 text-green-600" />
                      </div>
                    )}

                    {order.estimatedDelivery && !order.deliveredAt && (
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            Est. Delivery
                          </p>
                          <p className="text-xs text-purple-700">
                            {format(
                              new Date(order.estimatedDelivery),
                              "MMM d, yyyy"
                            )}
                          </p>
                        </div>
                        <CalendarIcon className="w-3 h-3 text-purple-600" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
