import React from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export const Link = ({ className, href, ...props }: LinkProps) => {
  return (
    <NextLink
      href={href}
      className={cn("text-blue-600 hover:underline hover:text-blue-800", className)}
      {...props}
    />
  );
};
