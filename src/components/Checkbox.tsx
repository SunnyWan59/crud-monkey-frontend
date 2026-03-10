import React from "react";
import { cn } from "@/lib/utils";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = ({ className, ...props }: CheckboxProps) => {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
        className
      )}
      {...props}
    />
  );
};
