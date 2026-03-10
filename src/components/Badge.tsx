import React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "success" | "warning" | "error";
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          variant === "default" && "bg-gray-100 text-gray-800",
          variant === "success" && "bg-green-100 text-green-800",
          variant === "warning" && "bg-yellow-100 text-yellow-800",
          variant === "error" && "bg-red-100 text-red-800",
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
