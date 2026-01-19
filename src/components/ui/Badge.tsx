import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Варианты баджа для статусов задач и других элементов
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // ProjectLibre статусы задач
        success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        error: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
        info: "bg-slate-100 text-slate-900 dark:bg-blue-900/20 dark:text-blue-400",
        // Статусы задач
        'task-completed': "bg-task-completed text-white",
        'task-in-progress': "bg-task-in-progress text-white",
        'task-delayed': "bg-task-delayed text-white",
        'task-planned': "bg-task-planned text-white",
        'task-milestone': "bg-task-milestone text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Компонент баджа для отображения статусов
 * Поддерживает все варианты стилей для ProjectLibre
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }

