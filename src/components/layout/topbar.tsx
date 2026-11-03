import { useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, Check, ChevronDown, Download, LogOut, Search, Settings2, Smartphone, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateLong, todayKey } from '../../lib/utils'
import { DEMO_USERS, ROLE_LABELS } from '../../lib/constants'
import { useHotelStore } from '../../store/useHotelStore'
import { Avatar } from '../ui/primitives'
import { Logo } from '../shared/logo'
import { NotificationMenu } from './notification-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

const TITLES: Record<string, string> = {
  '/': 'Tổng quan',
  '/calendar': 'Lịch phòng',
  '/bookings': 'Đặt phòng',
  '/front-desk': 'Lễ tân',
  '/rooms': 'Phòng',
  '/housekeeping': 'Buồng phòng',
  '/guests': 'Khách',
  '/payments': 'Thanh toán',
  '/reports': 'Báo cáo',
  '/settings': 'Cài đặt',
  '/install': 'Cài app',
}

export function Topbar({ onSearch, onInstall }: { onSearch: () => void; onInstall: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const session = useHotelStore((state) => state.session)
  const loginAs = useHotelStore((state) => state.loginAs)
  const logout = useHotelStore((state) => state.logout)
  const title = location.pathname.startsWith('/rooms/') ? 'Chi tiết phòng' : TITLES[location.pathname] ?? 'A Trung Homestay'

  const switchRole = (role: (typeof DEMO_USERS)[number]['role']) => {
    loginAs(role)
    toast.success(`Đã chuyển sang vai trò ${ROLE_LABELS[role]}`)
    navigate(role === 'housekeeping' ? '/housekeeping' : '/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-sand-200/60 bg-sand-50/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-[64px] max-w-[1500px] items-center gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
        <div className="md:hidden">
          <Logo compact />
        </div>
        <div className="hidden min-w-0 md:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">A Trung Homestay</p>
          <p className="truncate font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">{title}</p>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onSearch}
            aria-label="Tìm kiếm"
            className="group flex h-10 items-center gap-2 rounded-xl border border-sand-200/80 bg-white/55 px-2.5 text-ink-400 transition hover:bg-white hover:text-ink-700 sm:h-9 sm:w-56 sm:px-3"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden text-xs sm:block">Tìm nhanh...</span>
            <span className="ml-auto hidden rounded-md border border-sand-200 bg-sand-50 px-1.5 py-0.5 font-mono text-[9px] text-ink-400 sm:block">Ctrl K</span>
          </button>

          <div className="hidden items-center gap-1.5 rounded-xl border border-sand-200/70 bg-white/45 px-2.5 py-2 text-[10px] font-medium text-ink-500 lg:flex">
            <CalendarDays className="h-3.5 w-3.5 text-sea-600" />
            {formatDateLong(todayKey())}
          </div>

          <button
            onClick={onInstall}
            className="hidden h-9 items-center gap-1.5 rounded-xl border border-sea-200/70 bg-sea-50/70 px-2.5 text-[11px] font-semibold text-sea-800 transition hover:bg-sea-100 sm:flex"
          >
            <Download className="h-3.5 w-3.5" /> Cài app
          </button>

          <NotificationMenu />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 items-center gap-2 rounded-xl border border-sand-200/80 bg-white/55 p-1 pr-1.5 transition hover:bg-white sm:pr-2">
                <Avatar name={session?.name ?? 'Anh Trưng'} size="sm" className="h-7 w-7 text-[10px]" />
                <span className="hidden max-w-24 truncate text-xs font-semibold text-ink-800 sm:block">{session?.name?.split(' ').slice(-1)[0] ?? 'Vũ'}</span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-ink-400 sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <span className="block text-[11px] font-bold normal-case tracking-normal text-ink-900">{session?.name ?? 'Anh Trưng'}</span>
                <span className="mt-0.5 block text-[10px] font-medium normal-case tracking-normal text-ink-400">
                  {session ? ROLE_LABELS[session.role] : 'Chủ homestay'} · {session?.email ?? 'owner@atrung.demo'}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/settings')}>
                <Settings2 className="h-4 w-4 text-ink-400" /> Cài đặt
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onInstall}>
                <Smartphone className="h-4 w-4 text-ink-400" /> Cài app lên điện thoại
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Chuyển vai trò demo</DropdownMenuLabel>
              {DEMO_USERS.map((user) => (
                <DropdownMenuItem key={user.role} onSelect={() => switchRole(user.role)}>
                  <UserRound className="h-4 w-4 text-ink-400" />
                  <span className="flex-1">{ROLE_LABELS[user.role]}</span>
                  {session?.role === user.role && <Check className="h-3.5 w-3.5 text-sea-700" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  logout()
                  navigate('/login')
                }}
                className="text-danger-600 focus:bg-danger-100"
              >
                <LogOut className="h-4 w-4" /> Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
