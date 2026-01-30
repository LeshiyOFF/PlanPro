"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { useUserPreferences } from "@/components/userpreferences/hooks/useUserPreferences"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

/**
 * TooltipContent - Контент подсказки с collision avoidance
 * 
 * КРИТИЧНО: collisionPadding=16 гарантирует отступ от границ viewport.
 * Это исправляет баг с выходом tooltip за границы экрана.
 * 
 * @version 2.0 - Добавлен collision handling
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, collisionPadding = 16, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    collisionPadding={collisionPadding}
    avoidCollisions={true}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

/**
 * SafeTooltip - Безопасный tooltip с collision avoidance
 * 
 * КРИТИЧНО: Исправляет выход подсказок за границы экрана.
 * Использует collisionPadding и avoidCollisions от Radix UI.
 * 
 * Clean Architecture: UI Component (Presentation Layer)
 * 
 * @version 2.0 - Добавлен collision handling
 */
const SafeTooltip = ({ 
  children, 
  content, 
  side = "top", 
  align = "center",
  delayDuration = 400,
  collisionPadding = 16,
  ...props 
}: { 
  children: React.ReactNode; 
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  collisionPadding?: number;
}) => {
  const { preferences } = useUserPreferences();
  const showTips = preferences.display.showTips;

  if (!showTips) {
    return <>{children}</>;
  }

  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        align={align} 
        collisionPadding={collisionPadding}
        {...props}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, SafeTooltip }

