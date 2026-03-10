import React from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, href, ...props }, ref) => {
    return (
      <NextLink
        ref={ref}
        href={href}
        className={cn("text-blue-600 hover:underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm", className)}
        {...props}
      />
    );
  }
);

Link.displayName = "Link";
