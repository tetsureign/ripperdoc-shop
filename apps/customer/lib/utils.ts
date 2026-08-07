import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const formatPrice = (p: number) => `€$${new Intl.NumberFormat("en-US").format(p)}`;
export const formatDate = (d: string | Date) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
