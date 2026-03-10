import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", asChild = false, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center whitespace-nowrap px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
      variant === "danger" && "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      variant === "ghost" && "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
      className
    );

    if (asChild) {
      return React.createElement(Slot as React.ElementType, {
        ref,
        className: classes,
        ...props,
      });
    }

    return <button ref={ref} className={classes} {...props} />;
  }
);

Button.displayName = "Button";
