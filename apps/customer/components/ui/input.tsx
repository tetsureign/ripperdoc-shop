import { cn } from "@/lib/utils";
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full h-10 px-3 bg-[#0f1117] border border-[#232738] text-white placeholder:text-[#8b8fa3] focus:outline-none focus:border-[#00ffd0]/50 focus:ring-1 focus:ring-[#00ffd0]/30 text-sm",
        className
      )}
      {...props}
    />
  );
}
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full min-h-[88px] p-3 bg-[#0f1117] border border-[#232738] text-white placeholder:text-[#8b8fa3] focus:outline-none focus:border-[#00ffd0]/50 text-sm",
        className
      )}
      {...props}
    />
  );
}
