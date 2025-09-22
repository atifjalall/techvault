/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/buttonSidebar";
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
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal?: number;
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PAYMENT_FAILED":
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CONFIRMED":
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPED":
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "ON_HOLD":
      case "REQUIRES_ACTION":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <Badge
      className={`${getStatusColor(status)} font-medium text-xs px-2 py-1`}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const getColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <Badge className={`${getColor(status)} font-medium text-xs px-2 py-1`}>
      {status}
    </Badge>
  );
};

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

        // Show simple success message
        const statusChanged = formData.status !== order.status;
        if (statusChanged) {
          toast.success(
            `Order status updated to ${formData.status.replace(/_/g, " ").toLowerCase()} - Customer has been notified`
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
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-slate-200 rounded"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-slate-200 rounded"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-slate-500 mb-4">
            The order you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </p>
          <Button
            onClick={() => router.push("/vendor/orders")}
            className="cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/vendor/orders")}
            className="cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Order #{order.orderNumber.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-slate-500">
              Placed on{" "}
              {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
          <Button
            variant={editMode ? "outline" : "default"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="cursor-pointer"
          >
            {editMode ? (
              <>
                <EyeIcon className="w-4 h-4 mr-2" />
                View Mode
              </>
            ) : (
              <>
                <PencilSquareIcon className="w-4 h-4 mr-2" />
                Edit Order
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.product.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">
                        €{(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-500">
                        €{Number(item.price).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Management */}
          {editMode ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Update Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium">
                      Order Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="PACKAGING">Packaging</SelectItem>
                        <SelectItem value="READY_TO_SHIP">
                          Ready to Ship
                        </SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
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
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Priority
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="trackingNumber"
                      className="text-sm font-medium"
                    >
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
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="shippingCarrier"
                      className="text-sm font-medium"
                    >
                      Shipping Carrier
                    </Label>
                    <Select
                      value={formData.shippingCarrier}
                      onValueChange={(value) =>
                        setFormData({ ...formData, shippingCarrier: value })
                      }
                    >
                      <SelectTrigger>
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
                    className="text-sm font-medium"
                  >
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
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Internal Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Add internal notes about this order..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleUpdateOrder}
                    disabled={updating}
                    className="cursor-pointer"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {updating ? "Updating..." : "Update Order"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">
                      Priority
                    </Label>
                    <p className="text-sm text-slate-900">
                      {order.priority || "Normal"}
                    </p>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">
                        Tracking Number
                      </Label>
                      <p className="text-sm text-slate-900">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                </div>

                {order.shippingCarrier && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600">
                      Shipping Carrier
                    </Label>
                    <p className="text-sm text-slate-900">
                      {order.shippingCarrier}
                    </p>
                  </div>
                )}

                {order.estimatedDelivery && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600">
                      Estimated Delivery
                    </Label>
                    <p className="text-sm text-slate-900">
                      {format(new Date(order.estimatedDelivery), "MMM d, yyyy")}
                    </p>
                  </div>
                )}

                {order.notes && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600">
                      Internal Notes
                    </Label>
                    <p className="text-sm text-slate-900">{order.notes}</p>
                  </div>
                )}

                {order.customerNotes && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600">
                      Customer Notes
                    </Label>
                    <p className="text-sm text-slate-900">
                      {order.customerNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.statusHistory?.length > 0 ? (
                  order.statusHistory.map((history, index) => (
                    <div
                      key={history.id}
                      className="flex items-start space-x-3 pb-3 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">
                            {history.status.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(
                              new Date(history.createdAt),
                              "MMM d, h:mm a"
                            )}
                          </p>
                        </div>
                        {history.notes && (
                          <p className="text-xs text-slate-600 mt-1">
                            {history.notes}
                          </p>
                        )}
                        {history.changedBy && (
                          <p className="text-xs text-slate-500 mt-1">
                            by {history.changedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No status history available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-slate-600">
                  Name
                </Label>
                <p className="text-sm text-slate-900">{order.user.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">
                  Email
                </Label>
                <p className="text-sm text-slate-900">{order.user.email}</p>
              </div>
              {order.user.phone && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">
                    Phone
                  </Label>
                  <p className="text-sm text-slate-900">{order.user.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-900">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-slate-600">
                  Method
                </Label>
                <p className="text-sm text-slate-900">
                  {order.paymentMethod || "Card"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">
                  Status
                </Label>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">
                  €{(order.subtotal || order.total).toFixed(2)}
                </span>
              </div>
              {Number(order.taxAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="text-slate-900">
                    €{Number(order.taxAmount).toFixed(2)}
                  </span>
                </div>
              )}
              {Number(order.shippingCost) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="text-slate-900">
                    €{Number(order.shippingCost).toFixed(2)}
                  </span>
                </div>
              )}
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-green-600">
                    -€{Number(order.discountAmount).toFixed(2)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span className="text-slate-900">Total</span>
                <span className="text-slate-900">
                  €{Number(order.total).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Order Placed</span>
                  <span className="text-slate-900">
                    {format(new Date(order.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                {order.shippedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipped</span>
                    <span className="text-slate-900">
                      {format(new Date(order.shippedAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Delivered</span>
                    <span className="text-slate-900">
                      {format(new Date(order.deliveredAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                )}
                {order.estimatedDelivery && !order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Est. Delivery</span>
                    <span className="text-slate-900">
                      {format(new Date(order.estimatedDelivery), "MMM d")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
