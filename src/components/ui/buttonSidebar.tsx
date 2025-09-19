import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium transition-colors duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-gray-800 active:bg-gray-900",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500",
        outline:
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100",
        secondary:
          "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 border border-gray-200",
        ghost:
          "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 active:text-blue-800",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 px-2.5 py-1 text-xs",
        lg: "h-9 px-4 py-2 text-sm",
        icon: "w-8 h-8 p-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
