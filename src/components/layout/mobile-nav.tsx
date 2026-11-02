import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  BedDouble,
  BookOpenCheck,
  CalendarRange,
  ChartNoAxesCombined,
  ConciergeBell,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NAV_ITEMS, ROLE_LABELS } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { useHotelStore } from '../../store/useHotelStore'
import type { Role } from '../../types'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Avatar } from '../ui/primitives'
import { Logo } from '../shared/logo'

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

const bottomItems = [
  { href: '/', label: 'Hôm nay', icon: LayoutDashboard },
  { href: '/calendar', label: 'Lịch', icon: CalendarRange },
  { href: '/bookings', label: 'Đặt phòng', icon: BookOpenCheck },
  { href: '/front-desk', label: 'Lễ tân', icon: ConciergeBell },
]

export function MobileNav({ onInstall }: { onInstall: () => void }) {
  const [open, setOpen] = useState(false)
  const session = useHotelStore((state) => state.session)
  const logout = useHotelStore((state) => state.logout)
  const navigate = useNavigate()
  const role = session?.role ?? 'owner'
  const items = NAV_ITEMS.filter((item) => (item.roles as readonly Role[]).includes(role))

  return (
    <>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-sand-200/70 bg-sand-50/90 px-2 pt-1.5 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {bottomItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-w-[56px] flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[9px] font-semibold transition',
                  isActive ? 'text-sea-700' : 'text-ink-400',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn('grid h-7 w-7 place-items-center rounded-xl transition', isActive && 'bg-sea-100')}>
                    <item.icon className="h-[17px] w-[17px]" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
          <button onClick={() => setOpen(true)} className="flex min-w-[56px] flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[9px] font-semibold text-ink-400">
            <span className="grid h-7 w-7 place-items-center rounded-xl">
              <Menu className="h-[17px] w-[17px]" />
            </span>
            Thêm
          </button>
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="max-w-sm">
          <SheetHeader>
            <Logo />
            <SheetTitle className="pt-2 text-xl">Điều hướng</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {items.map((item) => {
                const Icon = icons[item.icon] ?? LayoutDashboard
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-2xl border p-3 text-xs font-semibold transition',
                        isActive ? 'border-sea-200 bg-sea-100 text-sea-800' : 'border-sand-200 bg-white/45 text-ink-600',
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-sand-200 bg-white/55 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={session?.name ?? 'Nguyễn Vũ'} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink-900">{session?.name ?? 'Nguyễn Vũ'}</p>
                  <p className="text-[10px] text-ink-400">{session ? ROLE_LABELS[session.role] : 'Chủ homestay'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpen(false)
                  onInstall()
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-sea-700 py-2.5 text-xs font-semibold text-sand-50"
              >
                <Download className="h-4 w-4" /> Cài app lên điện thoại
              </button>
            </div>
          </div>
          <SheetFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setOpen(false)
                logout()
                navigate('/login')
              }}
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
