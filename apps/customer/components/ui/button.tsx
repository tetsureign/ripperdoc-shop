import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variantMap: Record<Variant, string> = {
  primary: "bg-[#00ffd0] text-black hover:bg-[#00e6bc] border border-[#00ffd0]",
  ghost: "bg-transparent text-[#8b8fa3] hover:text-white hover:bg-white/[0.06]",
  outline: "bg-transparent text-[#00ffd0] border border-[#00ffd0]/40 hover:bg-[#00ffd0]/10 hover:border-[#00ffd0]",
  danger: "bg-[#ff2a6d] text-white hover:bg-[#e6005c] border border-[#ff2a6d]",
};

const sizeMap: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-5 text-sm",
  lg: "h-11 px-7 text-sm",
  icon: "h-9 w-9 p-0",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold tracking-wide uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00ffd0] disabled:opacity-40 disabled:pointer-events-none",
        variantMap[variant],
        sizeMap[size],
        className
      )}
      {...props}
    />
  );
}
