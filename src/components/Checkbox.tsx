import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> & {
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const isChecked = Boolean(checked);
    return (
      <label className={cn("relative inline-flex cursor-pointer", className)}>
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded border border-gray-300 text-blue-600 flex items-center justify-center",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600"
          )}
        >
          {isChecked && <Check className="h-3 w-3" />}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
