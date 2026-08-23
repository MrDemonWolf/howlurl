import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-[transform,background-color,border-color,color,box-shadow] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-moon focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0 motion-reduce:transition-none motion-reduce:active:translate-y-0",
  {
    variants: {
      variant: {
        default:
          "bg-amber text-midnight shadow-[0_0_0_1px_rgba(255,179,71,0.5),0_8px_30px_-12px_rgba(255,179,71,0.8)] hover:bg-amber-bright",
        outline:
          "border border-hairline bg-surface/60 text-silver hover:border-moon/60 hover:text-white",
        ghost: "text-muted hover:bg-surface hover:text-silver",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-8 px-3 text-xs",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
