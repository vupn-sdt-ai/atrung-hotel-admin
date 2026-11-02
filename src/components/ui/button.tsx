import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold'
type Size = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-sea-700 text-sand-50 shadow-[0_10px_24px_-12px_rgba(11,93,80,0.65)] hover:bg-sea-800 active:bg-sea-900',
  secondary: 'bg-sand-100 text-ink-900 border border-sand-200 hover:bg-sand-200',
  outline: 'border border-sea-200 bg-white/60 text-sea-800 hover:bg-sea-50',
  ghost: 'text-ink-700 hover:bg-sand-100 hover:text-ink-900',
  danger: 'bg-danger-600 text-white hover:bg-terra-700',
  gold: 'bg-gold-500 text-ink-900 hover:bg-gold-600 hover:text-white',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 rounded-lg px-3 text-xs font-semibold gap-1.5',
  md: 'h-10 rounded-xl px-4 text-sm font-semibold gap-2',
  lg: 'h-12 rounded-2xl px-5 text-sm font-semibold gap-2',
  icon: 'h-9 w-9 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(
          'inline-flex select-none items-center justify-center whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
