import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import { forwardRef } from 'react'
import { cn, initialsColor } from '../../lib/utils'

export const Progress = forwardRef<
  ElementRef<typeof ProgressPrimitive.Root>,
  ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-sand-200/80', className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn('h-full w-full flex-1 rounded-full bg-sea-600 transition-all duration-700', indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = 'Progress'

export const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-sand-300 transition-colors data-[state=checked]:bg-sea-700 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5" />
  </SwitchPrimitive.Root>
))
Switch.displayName = 'Switch'

export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = {
    sm: 'h-8 w-8 text-[10px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  }
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide ring-2 ring-white/70',
        sizes[size],
        initialsColor(name),
        className,
      )}
    >
      {name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]?.toUpperCase()).join('')}
    </div>
  )
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-sand-200/80', className)} />
}

export function StatBar({ value, tone = 'bg-sea-600' }: { value: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand-200/80">
      <div className={cn('h-full rounded-full transition-all duration-700', tone)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}
