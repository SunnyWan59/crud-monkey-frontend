import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type TextProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "body" | "heading" | "label";
  asChild?: boolean;
};

export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ className, variant = "body", asChild = false, ...props }, ref) => {
    const classes = cn(
      "text-gray-900",
      variant === "body" && "text-base",
      variant === "heading" && "text-xl font-bold",
      variant === "label" && "text-sm font-medium",
      className
    );

    if (asChild) {
      return React.createElement(Slot as React.ElementType, {
        ref,
        className: classes,
        ...props,
      });
    }

    return <span ref={ref} className={classes} {...props} />;
  }
);

Text.displayName = "Text";
