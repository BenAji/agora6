import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gold text-black hover:bg-gold-hover hover:shadow-glow font-semibold",
        terminal: "bg-surface-secondary text-text-primary border border-border-default hover:border-gold hover:text-gold hover:shadow-glow",
        outline: "border border-gold text-gold hover:bg-gold hover:text-black hover:shadow-glow",
        ghost: "text-text-secondary hover:text-gold hover:bg-surface-secondary",
        danger: "bg-error text-text-primary hover:bg-error/90",
        success: "bg-success text-text-primary hover:bg-success/90",
        secondary: "bg-surface-secondary text-text-primary border border-border-default hover:border-border-hover",
        link: "text-gold underline-offset-4 hover:underline hover:text-gold-hover",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-12 rounded-sm px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
