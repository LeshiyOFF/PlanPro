import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import {
  BASE_BUTTON_CLASSES,
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  type ButtonVariant,
  type ButtonSize,
} from './button-variants'

const buttonVariants = cva(BASE_BUTTON_CLASSES, {
  variants: {
    variant: BUTTON_VARIANTS,
    size: BUTTON_SIZES,
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

// Определяем интерфейс для props кнопки
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

/**
 * Компонент кнопки с различными стилями
 * Поддерживает Ribbon стиль для меню ProjectLibre
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants, type ButtonVariant, type ButtonSize }
