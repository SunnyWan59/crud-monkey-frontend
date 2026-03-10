import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type TextProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "body" | "heading" | "label";
  asChild?: boolean;
};

export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ className, variant = "body", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp
        ref={ref}
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
  }
);

Text.displayName = "Text";
