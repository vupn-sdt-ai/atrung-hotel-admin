import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CalendarCheck2, CircleDollarSign, Clock3, Sparkles } from 'lucide-react'
import { useHotelStore } from '../../store/useHotelStore'
import { bookingBalance, todayKey } from '../../lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export function NotificationMenu() {
  const navigate = useNavigate()
  const bookings = useHotelStore((state) => state.bookings)
  const rooms = useHotelStore((state) => state.rooms)
  const today = todayKey()

  const alerts = useMemo(() => {
    const arrivals = bookings.filter((booking) => booking.checkIn === today && (booking.status === 'confirmed' || booking.status === 'pending'))
    const pending = bookings.filter((booking) => booking.status === 'pending')
    const unpaid = bookings.filter((booking) => (booking.status === 'checked_in' || booking.status === 'checked_out') && bookingBalance(booking.total, booking.paid) > 0)
    const dirty = rooms.filter((room) => room.status === 'dirty' || room.status === 'maintenance')
    return [
      {
        id: 'arrivals',
        icon: CalendarCheck2,
        title: `${arrivals.length} khách đến hôm nay`,
        description: arrivals.length ? 'Mở danh sách lễ tân để check-in' : 'Không có khách đến',
        href: '/front-desk?tab=arrivals',
        tone: 'bg-sea-100 text-sea-800',
        count: arrivals.length,
      },
      {
        id: 'dirty',
        icon: Sparkles,
        title: `${dirty.length} phòng cần xử lý`,
        description: 'Buồng phòng / bảo trì cần chú ý',
        href: '/housekeeping',
        tone: 'bg-gold-100 text-warning-600',
        count: dirty.length,
      },
      {
        id: 'unpaid',
        icon: CircleDollarSign,
        title: `${unpaid.length} booking còn công nợ`,
        description: 'Kiểm tra thanh toán trước khi trả phòng',
        href: '/payments',
        tone: 'bg-terra-100 text-terra-700',
        count: unpaid.length,
      },
      {
        id: 'pending',
        icon: Clock3,
        title: `${pending.length} booking chờ xác nhận`,
        description: 'Ưu tiên xác nhận sớm cho khách',
        href: '/bookings?status=pending',
        tone: 'bg-sage-200 text-sea-900',
        count: pending.length,
      },
    ]
  }, [bookings, rooms, today])

  const total = alerts.reduce((sum, alert) => sum + (alert.count > 0 ? 1 : 0), 0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-sand-200/80 bg-white/55 text-ink-500 transition hover:bg-white hover:text-ink-900"
          aria-label="Thông báo"
        >
          <Bell className="h-4 w-4" />
          {total > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-terra-500 px-1 text-[9px] font-bold text-white ring-2 ring-sand-50">
              {total}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        <DropdownMenuLabel>Việc cần chú ý</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {alerts.map((alert) => (
          <DropdownMenuItem key={alert.id} onSelect={() => navigate(alert.href)} className="items-start gap-3 py-2.5">
            <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${alert.tone}`}>
              <alert.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-ink-900">{alert.title}</span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-500">{alert.description}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
