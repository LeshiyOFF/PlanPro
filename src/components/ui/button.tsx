import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { SafeTooltip } from "./Tooltip"

/**
 * Варианты кнопки для shadcn/ui + ProjectLibre Ribbon стили
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-hover))] shadow-sm shadow-[hsl(var(--primary-shadow-light))] transition-all",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-[hsl(var(--primary-border)/0.6)] bg-background hover:bg-[hsl(var(--primary-soft))] hover:text-[hsl(var(--primary))] transition-all",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-[hsl(var(--primary-soft))] hover:text-[hsl(var(--primary))] transition-all",
        link: "text-[hsl(var(--primary))] underline-offset-4 hover:underline",
        // ProjectLibre Ribbon стили
        ribbon: "bg-transparent hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1",
        "ribbon-active": "bg-accent text-accent-foreground h-8 px-3 py-1",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Ribbon размеры
        ribbon: "h-8 px-3 py-1 text-xs",
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
  tooltip?: string
}

/**
 * Компонент кнопки с поддержкой shadcn/ui и ProjectLibre Ribbon
 * Следует SOLID принципам и современным стандартам
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, tooltip, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )

    if (tooltip) {
      return (
        <SafeTooltip content={tooltip} side="bottom">
          {buttonElement}
        </SafeTooltip>
      )
    }

    return buttonElement
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

