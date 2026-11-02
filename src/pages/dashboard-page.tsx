import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { eachDayOfInterval, format, parseISO, subDays } from 'date-fns'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarCheck2,
  CalendarPlus,
  CircleDollarSign,
  Clock3,
  ConciergeBell,
  DoorOpen,
  LogIn,
  LogOut,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useHotelStore } from '../store/useHotelStore'
import { bookingBalance, formatDateLong, formatDateVN, formatMoney, formatMoneyShort, todayKey } from '../lib/utils'
import { QUICK_ACTIONS } from '../lib/constants'
import { occupiedRoomIds } from '../lib/analytics'
import { PageHeader } from '../components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/primitives'
import { StatCard, EmptyState } from '../components/shared/data-display'
import { BookingStatusBadge, RoomStatusBadge } from '../components/shared/status-badge'
import { cn } from '../lib/utils'

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-sand-200 bg-sand-50/95 px-3 py-2 shadow-lift backdrop-blur">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">{label}</p>
      <p className="mt-0.5 font-display text-base font-semibold text-ink-900">{formatMoney(payload[0].value)}</p>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const session = useHotelStore((state) => state.session)
  const rooms = useHotelStore((state) => state.rooms)
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const payments = useHotelStore((state) => state.payments)
  const tasks = useHotelStore((state) => state.tasks)
  const today = todayKey()

  const data = useMemo(() => {
    const occupied = occupiedRoomIds(today, bookings)
    const todayPayments = payments.filter((payment) => payment.date === today)
    const revenueToday = todayPayments.reduce((sum, payment) => sum + (payment.type === 'refund' ? -payment.amount : payment.amount), 0)
    const yesterday = format(subDays(parseISO(today), 1), 'yyyy-MM-dd')
    const revenueYesterday = payments
      .filter((payment) => payment.date === yesterday)
      .reduce((sum, payment) => sum + (payment.type === 'refund' ? -payment.amount : payment.amount), 0)
    const arrivals = bookings.filter((booking) => booking.checkIn === today && (booking.status === 'confirmed' || booking.status === 'pending'))
    const departures = bookings.filter((booking) => booking.checkOut === today && booking.status === 'checked_in')
    const inHouse = bookings.filter((booking) => booking.status === 'checked_in' && booking.checkIn <= today && booking.checkOut > today)
    const dirty = rooms.filter((room) => room.status === 'dirty')
    const unpaid = bookings.filter((booking) => (booking.status === 'checked_in' || booking.status === 'checked_out') && bookingBalance(booking.total, booking.paid) > 0)
    const pending = bookings.filter((booking) => booking.status === 'pending')
    const occupancy = rooms.length ? Math.round((occupied.size / rooms.length) * 100) : 0
    const trend = revenueYesterday > 0 ? Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100) : 0
    const chart = eachDayOfInterval({ start: subDays(parseISO(today), 6), end: parseISO(today) }).map((date) => {
      const key = format(date, 'yyyy-MM-dd')
      const revenue = payments
        .filter((payment) => payment.date === key)
        .reduce((sum, payment) => sum + (payment.type === 'refund' ? -payment.amount : payment.amount), 0)
      const occupiedCount = occupiedRoomIds(key, bookings).size
      return {
        label: format(date, 'dd/MM'),
        revenue,
        occupancy: rooms.length ? Math.round((occupiedCount / rooms.length) * 100) : 0,
      }
    })
    return { occupied, revenueToday, revenueYesterday, arrivals, departures, inHouse, dirty, unpaid, pending, occupancy, trend, chart }
  }, [bookings, payments, rooms, today])

  const alerts = [
    {
      label: `${data.dirty.length} phòng cần dọn`,
      detail: 'Ưu tiên phòng có khách đến hôm nay',
      href: '/housekeeping',
      icon: Sparkles,
      tone: 'bg-gold-100 text-warning-600',
    },
    {
      label: `${data.unpaid.length} booking còn công nợ`,
      detail: 'Kiểm tra trước khi trả phòng',
      href: '/payments',
      icon: CircleDollarSign,
      tone: 'bg-terra-100 text-terra-700',
    },
    {
      label: `${data.pending.length} booking chờ xác nhận`,
      detail: 'Gọi xác nhận cho khách',
      href: '/bookings?status=pending',
      icon: Clock3,
      tone: 'bg-sage-200 text-sea-900',
    },
    {
      label: `${tasks.filter((task) => task.status !== 'done').length} việc buồng phòng`,
      detail: 'Xem bảng công việc hôm nay',
      href: '/housekeeping',
      icon: BedDouble,
      tone: 'bg-sea-100 text-sea-800',
    },
  ]

  const todayItems = [
    ...data.arrivals.map((booking) => ({ kind: 'arrival' as const, booking })),
    ...data.departures.map((booking) => ({ kind: 'departure' as const, booking })),
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={formatDateLong(today)}
        title={`Chào buổi sáng, ${session?.name?.split(' ').slice(-1)[0] ?? 'Vũ'}.`}
        description="Một ngày mới ở A Trung — mọi việc quan trọng đã được gom về đây."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/front-desk')}>
              <ConciergeBell className="h-4 w-4" /> Lễ tân
            </Button>
            <Button onClick={() => navigate('/bookings?new=1')}>
              <CalendarPlus className="h-4 w-4" /> Đặt phòng mới
            </Button>
          </>
        }
      />

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="noise relative overflow-hidden rounded-[2rem] bg-sea-900 text-sand-50 shadow-lift"
      >
        <img src="/images/rooms/pool.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-sea-950/95 via-sea-900/80 to-sea-800/40" />
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-sand-50/10" />
        <div className="absolute -right-4 top-10 h-32 w-32 rounded-full border border-sand-50/10" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/15 bg-white/10 text-sand-100">Hôm nay</Badge>
              <span className="text-[11px] text-sand-200/70">{data.inHouse.length} khách đang lưu trú</span>
            </div>
            <h2 className="mt-4 max-w-xl text-balance font-display text-3xl font-semibold leading-[1.1] tracking-[-0.04em] text-sand-50 sm:text-4xl">
              {data.arrivals.length > 0 ? `${data.arrivals.length} vị khách đang chờ được đón.` : 'Hôm nay là một ngày nhẹ nhàng.'}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-sand-200/75">
              {data.departures.length > 0
                ? `${data.departures.length} khách trả phòng hôm nay. Kiểm tra công nợ và giao buồng phòng trước 12:00.`
                : 'Không có khách trả phòng. Dành thời gian kiểm tra phòng và chuẩn bị cho ngày mai.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="sm" className="bg-sand-50 text-sea-900 hover:bg-sand-100" onClick={() => navigate('/front-desk?tab=arrivals')}>
                <LogIn className="h-3.5 w-3.5" /> Đón khách
              </Button>
              <Button size="sm" variant="outline" className="border-white/20 bg-white/5 text-sand-50 hover:bg-white/10" onClick={() => navigate('/bookings?new=1')}>
                <CalendarPlus className="h-3.5 w-3.5" /> Tạo booking
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-5">
            <div className="relative grid h-24 w-24 shrink-0 place-items-center">
              <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(250,248,243,0.18)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#D5E0D1"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.occupancy / 100) * 264} 264`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-display text-2xl font-semibold leading-none">{data.occupancy}%</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-sand-200/60">công suất</p>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sand-200/60">Hôm nay</p>
              <p className="mt-1 font-display text-xl font-semibold">{data.occupied.size}/{rooms.length} phòng</p>
              <p className="mt-1 text-[11px] text-sand-200/65">{data.inHouse.length} khách đang ở · {data.arrivals.length} khách đến</p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-sage-200">
                <TrendingUp className="h-3.5 w-3.5" />
                {data.arrivals.length + data.inHouse.length} lượt khách hôm nay
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Doanh thu hôm nay"
          value={formatMoneyShort(data.revenueToday)}
          sub="đã thu trong ngày"
          icon={WalletCards}
          trend={data.trend === 0 ? undefined : { value: `${data.trend > 0 ? '+' : ''}${data.trend}% so với hôm qua`, positive: data.trend >= 0 }}
        />
        <StatCard label="Công suất" value={`${data.occupancy}%`} sub={`${data.occupied.size}/${rooms.length} phòng đang bán`} icon={BedDouble} tone="sage" />
        <StatCard label="Khách đang ở" value={`${data.inHouse.length}`} sub={`${data.arrivals.length} khách dự kiến đến`} icon={Users} tone="gold" />
        <StatCard
          label="Cần xử lý"
          value={`${data.dirty.length + data.unpaid.length + data.pending.length}`}
          sub="phòng dọn · công nợ · chờ xác nhận"
          icon={Clock3}
          tone="terra"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <div>
              <CardTitle>Doanh thu 7 ngày</CardTitle>
              <p className="mt-1 text-xs text-ink-500">Tiền thực thu theo ngày, gồm cọc và thanh toán.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              Xem báo cáo <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[220px] w-full sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chart} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#238673" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#238673" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eae3d6" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#7b8781' }} dy={8} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#7b8781' }} tickFormatter={(value) => formatMoneyShort(Number(value))} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#0B5D50" strokeWidth={2.5} fill="url(#revenueFill)" activeDot={{ r: 4, strokeWidth: 2, stroke: '#FAF8F3' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-sand-200/70 pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-ink-400">Cao nhất</p>
                <p className="mt-1 text-sm font-bold text-ink-900">{formatMoney(Math.max(...data.chart.map((item) => item.revenue)))}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-ink-400">Trung bình/ngày</p>
                <p className="mt-1 text-sm font-bold text-ink-900">{formatMoney(Math.round(data.chart.reduce((sum, item) => sum + item.revenue, 0) / 7))}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-ink-400">Tổng 7 ngày</p>
                <p className="mt-1 text-sm font-bold text-ink-900">{formatMoneyShort(data.chart.reduce((sum, item) => sum + item.revenue, 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Hôm nay</CardTitle>
              <p className="mt-1 text-xs text-ink-500">Khách đến và khách đi.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/front-desk')}>
              Mở lễ tân <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {todayItems.length === 0 ? (
              <EmptyState icon={CalendarCheck2} title="Không có khách đến/đi" description="Hôm nay là một ngày yên ắng." className="border-0 bg-transparent py-8" />
            ) : (
              todayItems.map(({ kind, booking }) => {
                const guest = guests.find((item) => item.id === booking.guestId)
                const room = rooms.find((item) => item.id === booking.roomId)
                const isArrival = kind === 'arrival'
                return (
                  <button
                    key={`${kind}-${booking.id}`}
                    onClick={() => navigate(`/front-desk?tab=${isArrival ? 'arrivals' : 'departures'}`)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-sand-200/70 bg-white/45 p-3 text-left transition hover:bg-white"
                  >
                    <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', isArrival ? 'bg-sea-100 text-sea-800' : 'bg-gold-100 text-warning-600')}>
                      {isArrival ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-ink-900">{guest?.name ?? 'Khách'}</span>
                      <span className="mt-0.5 block text-[10px] text-ink-500">
                        {room?.number} · {isArrival ? `đến ${formatDateVN(booking.checkIn)}` : `đi ${formatDateVN(booking.checkOut)}`} · {booking.adults} khách
                      </span>
                    </span>
                    <Badge tone={isArrival ? 'sea' : 'gold'}>{isArrival ? 'Đến' : 'Đi'}</Badge>
                  </button>
                )
              })
            )}
            <div className="mt-3 rounded-2xl bg-sea-50/70 p-3">
              <div className="flex items-center justify-between text-[10px] font-semibold text-sea-800">
                <span>Tiến độ hôm nay</span>
                <span>{data.occupied.size}/{rooms.length} phòng</span>
              </div>
              <Progress value={data.occupancy} className="mt-2 bg-sea-100" indicatorClassName="bg-sea-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Tình trạng phòng</CardTitle>
              <p className="mt-1 text-xs text-ink-500">Bấm vào phòng để xem chi tiết và đổi trạng thái.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/rooms')}>
              Tất cả phòng <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 pt-4 sm:grid-cols-4 xl:grid-cols-4">
            {rooms.map((room) => {
              const type = roomTypes.find((item) => item.id === room.typeId)
              const activeBooking = bookings.find((booking) => booking.roomId === room.id && booking.status === 'checked_in' && booking.checkIn <= today && booking.checkOut > today)
              const guest = activeBooking ? guests.find((item) => item.id === activeBooking.guestId) : undefined
              return (
                <Link
                  key={room.id}
                  to={`/rooms/${room.id}`}
                  className="group rounded-2xl border border-sand-200/70 bg-white/40 p-3 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-soft"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-display text-lg font-semibold text-ink-900">{room.number}</span>
                    <RoomStatusBadge status={room.status} className="px-2 py-0.5 text-[9px]" />
                  </div>
                  <p className="mt-1 truncate text-[10px] text-ink-400">{type?.name}</p>
                  <p className="mt-2 truncate text-[10px] font-medium text-ink-600">{guest?.name ?? (room.status === 'available' ? 'Sẵn sàng đón khách' : room.name)}</p>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Cần chú ý</CardTitle>
              <p className="mt-1 text-xs text-ink-500">Những việc nên xử lý trước cuối ngày.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {alerts.map((alert) => (
              <button
                key={alert.label}
                onClick={() => navigate(alert.href)}
                className="flex w-full items-center gap-3 rounded-2xl border border-transparent p-2.5 text-left transition hover:border-sand-200 hover:bg-white/50"
              >
                <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', alert.tone)}>
                  <alert.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-ink-900">{alert.label}</span>
                  <span className="block text-[10px] text-ink-500">{alert.detail}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-300" />
              </button>
            ))}
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-sand-100/70 p-3 text-[10px] text-ink-500">
              <Sparkles className="h-3.5 w-3.5 text-gold-600" />
              Mẹo: dùng <span className="font-semibold text-ink-700">Ctrl K</span> để tìm nhanh booking hoặc khách.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Booking gần đây</CardTitle>
            <p className="mt-1 text-xs text-ink-500">Các đặt phòng mới nhất trong hệ thống demo.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
            Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-sand-200/80 text-[10px] uppercase tracking-[0.12em] text-ink-400">
                  <th className="pb-2 font-semibold">Khách</th>
                  <th className="pb-2 font-semibold">Phòng</th>
                  <th className="pb-2 font-semibold">Ngày</th>
                  <th className="pb-2 font-semibold">Tổng</th>
                  <th className="pb-2 font-semibold">Trạng thái</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {[...bookings]
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .slice(0, 5)
                  .map((booking) => {
                    const guest = guests.find((item) => item.id === booking.guestId)
                    const room = rooms.find((item) => item.id === booking.roomId)
                    return (
                      <tr key={booking.id} className="group border-b border-sand-200/50 last:border-0">
                        <td className="py-3">
                          <p className="font-semibold text-ink-900">{guest?.name}</p>
                          <p className="text-[10px] text-ink-400">{booking.code}</p>
                        </td>
                        <td className="py-3 text-ink-600">{room?.number} · {room?.name}</td>
                        <td className="py-3 text-ink-600">{formatDateVN(booking.checkIn)} – {formatDateVN(booking.checkOut)}</td>
                        <td className="py-3 font-semibold text-ink-900">{formatMoney(booking.total)}</td>
                        <td className="py-3"><BookingStatusBadge status={booking.status} /></td>
                        <td className="py-3 text-right">
                          <button onClick={() => navigate(`/bookings?booking=${booking.id}`)} className="text-[11px] font-semibold text-sea-700 opacity-0 transition group-hover:opacity-100">
                            Mở
                          </button>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 sm:hidden">
            {[...bookings]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 4)
              .map((booking) => {
                const guest = guests.find((item) => item.id === booking.guestId)
                const room = rooms.find((item) => item.id === booking.roomId)
                return (
                  <button key={booking.id} onClick={() => navigate(`/bookings?booking=${booking.id}`)} className="w-full rounded-2xl border border-sand-200/70 bg-white/45 p-3 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-ink-900">{guest?.name}</p>
                      <BookingStatusBadge status={booking.status} />
                    </div>
                    <p className="mt-1 text-[10px] text-ink-500">{room?.number} · {formatDateVN(booking.checkIn)} – {formatDateVN(booking.checkOut)} · {formatMoney(booking.total)}</p>
                  </button>
                )
              })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className="group flex items-center gap-3 rounded-2xl border border-sand-200/70 bg-white/45 p-3 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-soft"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sea-50 text-sea-700 transition group-hover:bg-sea-700 group-hover:text-sand-50">
              {action.icon === 'CalendarPlus' && <CalendarPlus className="h-4 w-4" />}
              {action.icon === 'LogIn' && <LogIn className="h-4 w-4" />}
              {action.icon === 'DoorOpen' && <DoorOpen className="h-4 w-4" />}
              {action.icon === 'Sparkles' && <Sparkles className="h-4 w-4" />}
            </span>
            <span>
              <span className="block text-[11px] font-semibold text-ink-900">{action.label}</span>
              <span className="text-[9px] text-ink-400">{action.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
