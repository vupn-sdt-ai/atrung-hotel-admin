import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Card } from '../ui/card'

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'sea',
  trend,
  className,
}: {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  tone?: 'sea' | 'sage' | 'terra' | 'gold'
  trend?: { value: string; positive?: boolean }
  className?: string
}) {
  const tones = {
    sea: 'bg-sea-100 text-sea-800',
    sage: 'bg-sage-200 text-sea-900',
    terra: 'bg-terra-100 text-terra-700',
    gold: 'bg-gold-100 text-gold-600',
  }
  return (
    <Card className={cn('group relative overflow-hidden p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-ink-900 sm:text-[28px]">{value}</p>
          {(sub || trend) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {trend && (
                <span className={cn('text-[11px] font-semibold', trend.positive === false ? 'text-danger-600' : 'text-success-600')}>
                  {trend.value}
                </span>
              )}
              {sub && <span className="text-[11px] text-ink-400">{sub}</span>}
            </div>
          )}
        </div>
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:rotate-3', tones[tone])}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
    </Card>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-3xl border border-dashed border-sand-300 bg-white/35 px-6 py-12 text-center', className)}>
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sand-100 text-ink-400">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-display text-lg font-semibold text-ink-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function InfoRow({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-2.5', className)}>
      <span className="text-xs text-ink-400">{label}</span>
      <span className="text-right text-xs font-semibold text-ink-800">{value}</span>
    </div>
  )
}

export function MetricPill({ label, value, tone = 'bg-sand-100 text-ink-700' }: { label: string; value: string; tone?: string }) {
  return (
    <div className={cn('rounded-2xl px-3 py-2', tone)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] opacity-65">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  )
}
