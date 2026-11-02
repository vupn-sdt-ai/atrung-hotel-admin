import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function Logo({ compact = false, light = false, className }: { compact?: boolean; light?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn('group flex items-center gap-3', className)} aria-label="A Trung Homestay">
      <span
        className={cn(
          'relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5',
          light ? 'bg-sand-50' : 'bg-sea-700',
        )}
      >
        <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
          <circle cx="47" cy="17" r="5" fill="#C56A4A" />
          <path d="M14 48V33c0-8.8 7.2-16 16-16s16 7.2 16 16v15h-7V33a9 9 0 0 0-18 0v15z" fill={light ? '#0B5D50' : '#FAF8F3'} />
          <rect x="14" y="48" width="36" height="2.5" fill="#C8A45D" />
        </svg>
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className={cn('block font-display text-[17px] font-semibold leading-none tracking-[0.02em]', light ? 'text-sand-50' : 'text-ink-900')}>
            A TRUNG
          </span>
          <span className={cn('mt-1 block whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.22em]', light ? 'text-sand-200/80' : 'text-ink-400')}>
            Homestay · Quy Nhơn
          </span>
        </span>
      )}
    </Link>
  )
}
