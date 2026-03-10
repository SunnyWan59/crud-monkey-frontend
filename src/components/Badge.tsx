import React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "success" | "warning" | "error";
};

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "bg-gray-100 text-gray-800",
        variant === "success" && "bg-green-100 text-green-800",
        variant === "warning" && "bg-yellow-100 text-yellow-800",
        variant === "error" && "bg-red-100 text-red-800",
        className
      )}
      {...props}
    />
  );
};
