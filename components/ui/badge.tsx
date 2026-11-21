import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center rounded-full border border-[#d9efeb] bg-[#effaf8] px-2.5 py-1 text-[11px] font-semibold leading-4 text-[#087e75]", className)} {...props} />;
}
