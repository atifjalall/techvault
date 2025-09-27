
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Import commonly used icons (you can add more as needed)
import {
  TruckIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  UserIcon,
  StarIcon,
  FireIcon,
  TagIcon,
  ShieldCheckIcon,
  GiftIcon,
  BoltIcon,
  HeartIcon,
  // Additional icons for missing variants
  CubeIcon,
  HomeIcon,
  MapPinIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1.5 transition-all duration-200 cursor-default",
  {
    variants: {
      variant: {
        // Default variants
        default: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        secondary: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
        destructive: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        warning:
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",

        // Order Status variants
        pending:
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        payment_pending:
          "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
        payment_failed:
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        confirmed: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        processing:
          "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
        packaging:
          "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
        ready_to_ship:
          "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
        shipped: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
        in_transit:
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        out_for_delivery:
          "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
        delivery_attempt:
          "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
        delivered:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        completed:
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        cancelled:
          "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
        refunded:
          "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
        returned:
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        exchange_requested:
          "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100",
        on_hold: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
        requires_action:
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",

        // Payment Status variants
        payment_processing:
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        payment_completed:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        payment_cancelled:
          "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
        partially_refunded:
          "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",

        // Priority variants
        low: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        normal: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        high: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        urgent: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",

        // Product variants
        new: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        featured:
          "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
        discount: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        out_of_stock:
          "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
        sold_out: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",

        // Vendor/User status
        active:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        inactive:
          "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
        verified:
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        unverified:
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",

        // Special variants
        premium:
          "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
        exclusive: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100",
        limited:
          "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",

        // Business/Category variants
        supply_chain:
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        logistics:
          "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
        finance:
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        marketing: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100",
        technology:
          "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
        customer_service:
          "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] gap-1",
        default: "px-2.5 py-1 text-xs gap-1.5",
        lg: "px-3 py-1.5 text-sm gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// UPDATED: Icon mapping for ALL variants - NO MORE MISSING ICONS!
const variantIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  // Default variants
  default: DocumentTextIcon,
  secondary: UserIcon,
  destructive: XCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,

  // Order statuses - ALL COVERED NOW
  pending: ClockIcon,
  payment_pending: CreditCardIcon,
  payment_failed: XCircleIcon,
  confirmed: CheckCircleIcon,
  processing: ArrowPathIcon,
  packaging: CubeIcon, // NEW: Added icon for packaging
  ready_to_ship: TruckIcon,
  shipped: TruckIcon,
  in_transit: TruckIcon, // NEW: Added icon for in_transit
  out_for_delivery: MapPinIcon, // NEW: Added icon for out_for_delivery
  delivery_attempt: HomeIcon,
  delivered: CheckCircleIcon,
  completed: CheckCircleIcon,
  cancelled: XCircleIcon,
  refunded: BanknotesIcon,
  returned: ArrowPathIcon,
  exchange_requested: ArrowPathIcon,
  on_hold: ClockIcon,
  requires_action: ExclamationTriangleIcon,

  // Payment statuses - ALL COVERED
  payment_processing: ArrowPathIcon,
  payment_completed: CheckCircleIcon,
  payment_cancelled: XCircleIcon,
  partially_refunded: BanknotesIcon,

  // Priority - ALL COVERED
  low: CheckCircleIcon,
  normal: ClockIcon,
  high: ExclamationTriangleIcon,
  urgent: FireIcon,

  // Product variants - ALL COVERED
  new: StarIcon,
  featured: StarIcon,
  discount: TagIcon,
  out_of_stock: XCircleIcon,
  sold_out: EyeSlashIcon,

  // Status - ALL COVERED
  active: CheckCircleIcon,
  inactive: XCircleIcon, // NEW: Added icon for inactive
  verified: ShieldCheckIcon,
  unverified: ExclamationTriangleIcon, // NEW: Added icon for unverified

  // Special variants - ALL COVERED
  premium: StarIcon,
  exclusive: GiftIcon,
  limited: FireIcon, // NEW: Added icon for limited

  // Business categories - ALL COVERED
  supply_chain: TruckIcon,
  logistics: TruckIcon,
  finance: BanknotesIcon,
  marketing: HeartIcon,
  technology: BoltIcon,
  customer_service: UserIcon,
};

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  icon?: React.ComponentType<{ className?: string }> | "auto" | false;
  iconPosition?: "left" | "right";
}

function Badge({
  className,
  variant = "default",
  size,
  asChild = false,
  icon = "auto",
  iconPosition = "left",
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  // Auto-select icon based on variant
  const IconComponent =
    icon === "auto"
      ? variantIcons[variant as string]
      : icon === false
        ? null
        : icon;

  const iconSize = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }[size || "default"];

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {IconComponent && iconPosition === "left" && (
        <IconComponent className={iconSize} />
      )}
      {children}
      {IconComponent && iconPosition === "right" && (
        <IconComponent className={iconSize} />
      )}
    </Comp>
  );
}

// Helper functions remain the same but now support icons
export function getOrderStatusBadge(status: string) {
  const statusMap: Record<string, string> = {
    PENDING: "pending",
    PAYMENT_PENDING: "payment_pending",
    PAYMENT_FAILED: "payment_failed",
    CONFIRMED: "confirmed",
    PROCESSING: "processing",
    PACKAGING: "packaging",
    READY_TO_SHIP: "ready_to_ship",
    SHIPPED: "shipped",
    IN_TRANSIT: "in_transit",
    OUT_FOR_DELIVERY: "out_for_delivery",
    DELIVERY_ATTEMPT: "delivery_attempt",
    DELIVERED: "delivered",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
    RETURNED: "returned",
    EXCHANGE_REQUESTED: "exchange_requested",
    ON_HOLD: "on_hold",
    REQUIRES_ACTION: "requires_action",
  };

  return statusMap[status] || "default";
}

export function getPaymentStatusBadge(status: string) {
  const statusMap: Record<string, string> = {
    PENDING: "pending",
    PROCESSING: "payment_processing",
    COMPLETED: "payment_completed",
    FAILED: "payment_failed",
    REFUNDED: "refunded",
    PARTIALLY_REFUNDED: "partially_refunded",
    CANCELLED: "payment_cancelled",
  };

  return statusMap[status] || "default";
}

export function getPriorityBadge(priority: string) {
  const priorityMap: Record<string, string> = {
    LOW: "low",
    NORMAL: "normal",
    HIGH: "high",
    URGENT: "urgent",
  };

  return priorityMap[priority] || "normal";
}

export { Badge, badgeVariants };
