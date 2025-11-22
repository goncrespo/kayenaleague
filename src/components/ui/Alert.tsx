"use client";

import React from "react";

type AlertVariant = "error" | "success" | "info" | "warning";

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
  role?: "alert" | "status";
}

const variantStyles: Record<AlertVariant, string> = {
  error: "bg-red-500/10 border-red-500/30 text-red-200",
  success: "bg-green-500/10 border-green-500/30 text-green-200",
  info: "bg-blue-500/10 border-blue-500/30 text-blue-200",
  warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-200",
};

export default function Alert({ variant = "info", children, className, role }: AlertProps) {
  return (
    <div
      role={role ?? (variant === "error" ? "alert" : "status")}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`rounded-md border px-3 py-2 text-sm ${variantStyles[variant]} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}


