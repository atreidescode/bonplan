import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "discount";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "default",
}) => {
  const base = "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold";
  const variants = {
    default: "bg-neutral-800 text-neutral-300",
    outline: "border border-neutral-700 text-neutral-300",
    discount: "bg-rose-600 text-white font-bold shadow-md shadow-rose-900/30",
  };

  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
};
