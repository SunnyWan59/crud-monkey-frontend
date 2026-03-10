import React from "react";
import { cn } from "@/lib/utils";

export type TextProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "body" | "heading" | "label";
};

export const Text = ({ className, variant = "body", ...props }: TextProps) => {
  return (
    <span
      className={cn(
        "text-gray-900",
        variant === "body" && "text-base",
        variant === "heading" && "text-xl font-bold",
        variant === "label" && "text-sm font-medium",
        className
      )}
      {...props}
    />
  );
};
