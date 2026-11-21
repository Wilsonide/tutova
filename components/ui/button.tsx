import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769d2] focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-[#1769d2] text-white shadow-[0_5px_14px_rgba(23,105,210,0.16)] hover:-translate-y-0.5 hover:bg-[#1258b4] hover:shadow-[0_9px_20px_rgba(23,105,210,0.22)]",
        secondary: "bg-[#00AFA0] text-white shadow-[0_5px_14px_rgba(0,175,160,0.14)] hover:-translate-y-0.5 hover:bg-[#00988c] hover:shadow-[0_9px_20px_rgba(0,175,160,0.2)]",
        outline: "border border-slate-200 bg-white text-[#102A56] hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:text-[#1769d2]",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-[#102A56]",
        destructive: "bg-red-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700",
        link: "text-[#0077E6] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-7",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";
export { buttonVariants };
