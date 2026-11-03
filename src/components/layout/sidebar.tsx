import { NavLink, useNavigate } from 'react-router-dom'
import {
  BedDouble,
  BookOpenCheck,
  CalendarRange,
  ChartNoAxesCombined,
  ConciergeBell,
  Download,
  LayoutDashboard,
  RotateCcw,
  Settings2,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { NAV_ITEMS, ROLE_LABELS } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { useHotelStore } from '../../store/useHotelStore'
import { Logo } from '../shared/logo'
import type { Role } from '../../types'

const icons: Record<string, LucideIcon> = {
  LayoutDashboard,
  CalendarRange,
  BookOpenCheck,
  ConciergeBell,
  BedDouble,
  Sparkles,
  Users,
  WalletCards,
  ChartNoAxesCombined,
  Settings2,
}

export function Sidebar({ onInstall }: { onInstall: () => void }) {
  const session = useHotelStore((state) => state.session)
  const resetDemo = useHotelStore((state) => state.resetDemo)
  const navigate = useNavigate()
  const role = session?.role ?? 'owner'
  const items = NAV_ITEMS.filter((item) => (item.roles as readonly Role[]).includes(role))

  const handleReset = () => {
    if (!window.confirm('Khôi phục toàn bộ dữ liệu mẫu? Các thay đổi trong phiên demo sẽ mất.')) return
    resetDemo()
    toast.success('Đã khôi phục dữ liệu mẫu')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-sand-200/70 bg-sand-50/70 px-4 py-5 backdrop-blur-xl md:flex">
      <div className="px-2">
        <Logo />
      </div>

      <div className="mt-7 flex-1 overflow-y-auto">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">Vận hành</p>
        <nav className="space-y-0.5">
          {items.map((item) => {
            const Icon = icons[item.icon] ?? LayoutDashboard
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sea-700 text-sand-50 shadow-[0_10px_24px_-16px_rgba(11,93,80,0.8)]'
                      : 'text-ink-600 hover:bg-white/70 hover:text-ink-900',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn('h-[17px] w-[17px] transition', isActive ? 'text-sand-100' : 'text-ink-400 group-hover:text-sea-700')} />
                    <span>{item.label}</span>
                    {item.href === '/front-desk' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-terra-500" />}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-6 rounded-2xl border border-sand-200/80 bg-white/45 p-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-600 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success-600" />
            </span>
            <p className="text-[11px] font-bold text-ink-900">Bản demo</p>
            <span className="ml-auto rounded-full bg-sand-100 px-1.5 py-0.5 text-[9px] font-semibold text-ink-500">v1.0</span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-ink-500">7 phòng · dữ liệu mẫu · lưu trên thiết bị của bạn.</p>
          <button
            onClick={handleReset}
            className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-semibold text-sea-700 transition hover:text-sea-900"
          >
            <RotateCcw className="h-3 w-3" /> Khôi phục dữ liệu
          </button>
        </div>

        <button
          onClick={onInstall}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-sea-200/70 bg-sea-50/70 p-3 text-left transition hover:bg-sea-100/70"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-sea-700 text-sand-50">
            <Download className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-[11px] font-bold text-sea-900">Cài app lên điện thoại</span>
            <span className="text-[10px] text-sea-700/70">Có icon, mở như app</span>
          </span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-sand-200/80 bg-white/55 p-3">
        <button onClick={() => navigate('/settings')} className="flex w-full items-center gap-3 text-left">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-sea-100 text-xs font-bold text-sea-800">
            {session?.initials ?? 'AT'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-ink-900">{session?.name ?? 'Anh Trưng'}</span>
            <span className="block truncate text-[10px] text-ink-400">{session ? ROLE_LABELS[session.role] : 'Chủ homestay'}</span>
          </span>
          <Settings2 className="h-3.5 w-3.5 text-ink-400" />
        </button>
      </div>
    </aside>
  )
}
