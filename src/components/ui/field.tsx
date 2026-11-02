import { forwardRef } from 'react'
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-xs font-semibold text-ink-700', className)} {...props} />
}

export interface FieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="ml-0.5 text-terra-500">*</span>}
        </Label>
      )}
      {children}
      {error ? <p className="text-[11px] font-medium text-danger-600">{error}</p> : hint ? <p className="text-[11px] text-ink-400">{hint}</p> : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-10 w-full rounded-xl border border-sand-200 bg-white/70 px-3 text-sm text-ink-900 shadow-sm outline-none transition placeholder:text-ink-400 focus:border-sea-400 focus:bg-white focus:ring-4 focus:ring-sea-100 disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-24 w-full resize-y rounded-xl border border-sand-200 bg-white/70 px-3 py-2.5 text-sm leading-relaxed text-ink-900 shadow-sm outline-none transition placeholder:text-ink-400 focus:border-sea-400 focus:bg-white focus:ring-4 focus:ring-sea-100 disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        'h-10 w-full appearance-none rounded-xl border border-sand-200 bg-white/70 px-3 pr-9 text-sm text-ink-900 shadow-sm outline-none transition focus:border-sea-400 focus:bg-white focus:ring-4 focus:ring-sea-100 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
  </div>
))
Select.displayName = 'Select'
