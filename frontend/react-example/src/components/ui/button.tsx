import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-lg text-base font-normal font-mono transition-all disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500 text-white shadow-[0px_2px_2px_rgba(0,0,0,0.25),inset_0px_2px_2px_rgba(255,255,255,0.25),inset_0px_-4px_2px_rgba(0,0,0,0.25)] hover:bg-blue-700 hover:shadow-none focus-visible:bg-blue-900 focus-visible:shadow-none disabled:bg-blue-100 disabled:shadow-none disabled:opacity-100",
        secondary:
          "bg-grey-900 text-white shadow-[0px_2px_2px_rgba(0,0,0,0.25),inset_0px_2px_2px_rgba(255,255,255,0.25),inset_0px_-4px_2px_rgba(0,0,0,0.25)] hover:bg-black hover:shadow-none focus-visible:bg-grey-700 focus-visible:shadow-none disabled:bg-grey-100 disabled:shadow-none disabled:opacity-100",
        tertiary:
          "bg-white text-black shadow-[0px_2px_2px_rgba(0,0,0,0.25),inset_0px_2px_2px_rgba(255,255,255,0.25),inset_0px_-2px_2px_rgba(0,0,0,0.15)] hover:bg-grey-50 hover:shadow-none focus-visible:bg-white focus-visible:shadow-none disabled:bg-grey-100 disabled:text-white disabled:shadow-none disabled:opacity-100",
        "outline-white":
          "border border-white bg-transparent text-white hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black disabled:border-grey-100 disabled:text-grey-100 disabled:opacity-100",
        "outline-black":
          "border border-black bg-transparent text-black hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white disabled:border-grey-100 disabled:text-grey-100 disabled:opacity-100",
        "ghost-white":
          "bg-transparent text-white hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black disabled:text-grey-100 disabled:opacity-100",
        "ghost-black":
          "bg-transparent text-black hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white disabled:text-grey-100 disabled:opacity-100",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
