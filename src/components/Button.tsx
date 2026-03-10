import React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export const Button = ({ className, variant = "primary", ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        variant === "ghost" && "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
        className
      )}
      {...props}
    />
  );
};
