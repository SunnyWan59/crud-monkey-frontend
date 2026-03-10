import "@/app/globals.css";
import React from "react";

export const metadata = {
  title: "CRUD API Planner",
  description: "Plan your CRUD APIs visually",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
