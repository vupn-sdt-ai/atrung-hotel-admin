import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Tone = 'neutral' | 'sea' | 'sage' | 'gold' | 'terra' | 'success' | 'danger'

const tones: Record<Tone, string> = {
  neutral: 'border-sand-200 bg-sand-100 text-ink-600',
  sea: 'border-sea-200 bg-sea-100 text-sea-800',
  sage: 'border-sage-300 bg-sage-200 text-sea-900',
  gold: 'border-gold-300 bg-gold-100 text-gold-600',
  terra: 'border-terra-300 bg-terra-100 text-terra-700',
  success: 'border-success-100 bg-success-100 text-success-600',
  danger: 'border-terra-300 bg-danger-100 text-danger-600',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  dot?: boolean
}

export function Badge({ className, tone = 'neutral', dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none',
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  )
}
