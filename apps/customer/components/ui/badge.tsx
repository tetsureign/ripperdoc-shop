import { cn } from "@/lib/utils";
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-bold tracking-widest uppercase border border-[#00ffd0]/25 bg-[#00ffd0]/10 text-[#00ffd0]",
        className
      )}
      {...props}
    />
  );
}
