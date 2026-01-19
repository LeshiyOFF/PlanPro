import * as React from "react"
import { cn } from "@/lib/utils"

export interface CalendarProps {
  mode?: "single" | "range" | "multiple"
  selected?: Date | Date[] | { from?: Date; to?: Date }
  onSelect?: (date: Date | undefined) => void
  className?: string
  disabled?: boolean
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "p-3 border rounded-md bg-background",
          className
        )}
        {...props}
      >
        <div className="text-center text-sm text-muted-foreground">
          Calendar Component (Simplified)
        </div>
        {children}
      </div>
    )
  }
)
Calendar.displayName = "Calendar"

export { Calendar }
