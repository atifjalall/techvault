import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer select-none relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white border border-blue-600 shadow-sm hover:bg-blue-700 hover:border-blue-700 hover:shadow-md active:scale-[0.98] active:bg-blue-800 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/8 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
        destructive:
          "bg-red-600 text-white border border-red-600 shadow-sm hover:bg-red-700 hover:border-red-700 hover:shadow-md active:scale-[0.98] active:bg-red-800 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/8 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
        outline:
          "border border-blue-200 bg-white text-blue-700 shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:shadow-md active:scale-[0.98] active:bg-blue-100 before:absolute before:inset-0 before:bg-gradient-to-t before:from-blue-50/40 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
        secondary:
          "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm hover:bg-blue-100 hover:border-blue-200 hover:shadow-md active:scale-[0.98] active:bg-blue-200 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
        ghost:
          "text-slate-700 border border-transparent hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm active:scale-[0.98] active:bg-blue-100 before:absolute before:inset-0 before:bg-gradient-to-t before:from-blue-50/40 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
        link: "text-blue-600 hover:text-blue-700 active:text-blue-800 hover:underline underline-offset-2 shadow-none hover:shadow-none border-none bg-transparent p-0 h-auto transition-colors duration-150",
        success:
          "bg-emerald-600 text-white border border-emerald-600 shadow-sm hover:bg-emerald-700 hover:border-emerald-700 hover:shadow-md active:scale-[0.98] active:bg-emerald-800 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/8 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
        warning:
          "bg-amber-500 text-white border border-amber-500 shadow-sm hover:bg-amber-600 hover:border-amber-600 hover:shadow-md active:scale-[0.98] active:bg-amber-700 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/8 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
        premium:
          "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border border-blue-600 shadow-md hover:shadow-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 active:scale-[0.98] active:from-blue-800 active:via-indigo-800 active:to-purple-800 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/12 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
        dark: "bg-slate-900 text-white border border-slate-900 shadow-sm hover:bg-slate-800 hover:border-slate-800 hover:shadow-md active:scale-[0.98] active:bg-slate-700 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/8 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
        active: "bg-blue-50 text-blue-700 shadow-sm border border-blue-100 hover:bg-blue-100 hover:border-blue-200",
        danger:
          "bg-red-50 text-red-700 shadow-sm border border-red-100 hover:bg-red-100 hover:border-red-200",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        xs: "h-6 px-2 py-1 text-[10px]",
        sm: "h-7 px-2.5 py-1 text-[11px]",
        lg: "h-9 px-4 py-2 text-sm",
        xl: "h-10 px-5 py-2.5 text-sm",
        icon: "h-8 w-8 p-0",
        "icon-sm": "h-6 w-6 p-0",
        "icon-lg": "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            {/* Refined loading spinner */}
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current/25 border-t-current"></div>
            <span className="opacity-80">Loading...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
