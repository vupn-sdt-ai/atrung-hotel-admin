import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarCheck2, CalendarPlus, CircleDollarSign, ConciergeBell, LogIn, LogOut, Phone, Users } from 'lucide-react'
import { useHotelStore } from '../store/useHotelStore'
import { bookingBalance, formatDateVN, formatMoney, nightsBetween, todayKey } from '../lib/utils'
import { PageHeader } from '../components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Avatar } from '../components/ui/primitives'
import { EmptyState } from '../components/shared/data-display'
import { BookingStatusBadge } from '../components/shared/status-badge'
import { BookingDetailSheet } from '../components/bookings/booking-detail-sheet'
import { CheckInDialog } from '../components/bookings/check-in-dialog'
import { CheckOutDialog } from '../components/bookings/check-out-dialog'
import { PaymentDialog } from '../components/bookings/payment-dialog'
import { BookingFormDialog } from '../components/bookings/booking-form-dialog'

export function FrontDeskPage() {
  const [searchParams] = useSearchParams()
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const rooms = useHotelStore((state) => state.rooms)
  const [tab, setTab] = useState(searchParams.get('tab') ?? 'arrivals')
  const [detailId, setDetailId] = useState<string | undefined>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [checkInId, setCheckInId] = useState<string | undefined>()
  const [checkOutId, setCheckOutId] = useState<string | undefined>()
  const [paymentId, setPaymentId] = useState<string | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const today = todayKey()

  useEffect(() => {
    const next = searchParams.get('tab')
    if (next) setTab(next)
  }, [searchParams])

  const data = useMemo(() => {
    const arrivals = bookings.filter((booking) => booking.checkIn === today && (booking.status === 'confirmed' || booking.status === 'pending'))
    const inHouse = bookings.filter((booking) => booking.status === 'checked_in' && booking.checkIn <= today && booking.checkOut > today)
    const departures = bookings.filter((booking) => booking.status === 'checked_in' && booking.checkOut <= today)
    return { arrivals, inHouse, departures }
  }, [bookings, today])

  const openDetail = (id: string) => {
    setDetailId(id)
    setDetailOpen(true)
  }

  const renderCards = (list: typeof bookings, mode: 'arrival' | 'inhouse' | 'departure') => {
    if (list.length === 0) {
      return (
        <EmptyState
          icon={mode === 'arrival' ? LogIn : mode === 'departure' ? LogOut : Users}
          title={mode === 'arrival' ? 'Không có khách đến hôm nay' : mode === 'departure' ? 'Không có khách trả phòng hôm nay' : 'Chưa có khách đang lưu trú'}
          description="Danh sách sẽ tự cập nhật khi có booking hoặc check-in mới."
        />
      )
    }
    return (
      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((booking) => {
          const guest = guests.find((item) => item.id === booking.guestId)
          const room = rooms.find((item) => item.id === booking.roomId)
          const balance = bookingBalance(booking.total, booking.paid)
          const nights = nightsBetween(booking.checkIn, booking.checkOut)
          return (
            <Card key={booking.id} className="overflow-hidden transition hover:shadow-lift">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={guest?.name ?? 'Khách'} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">{guest?.name}</p>
                      <BookingStatusBadge status={booking.status} />
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-500"><Phone className="h-3 w-3" /> {guest?.phone}</p>
                    <p className="mt-1 text-[10px] text-ink-400">{booking.code} · {booking.adults} người lớn · {booking.children} trẻ em</p>
                  </div>
                  <button onClick={() => openDetail(booking.id)} className="rounded-xl bg-sea-700 px-3 py-2 text-center text-sand-50">
                    <span className="block font-display text-lg font-semibold leading-none">{room?.number}</span>
                    <span className="mt-0.5 block text-[9px] opacity-75">{room?.floorLabel}</span>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
                  <div className="rounded-xl bg-sand-100/70 p-2"><span className="block text-ink-400">Nhận</span><span className="font-semibold text-ink-900">{formatDateVN(booking.checkIn)}</span></div>
                  <div className="rounded-xl bg-sand-100/70 p-2"><span className="block text-ink-400">Trả</span><span className="font-semibold text-ink-900">{formatDateVN(booking.checkOut)}</span></div>
                  <div className="rounded-xl bg-sand-100/70 p-2"><span className="block text-ink-400">Số đêm</span><span className="font-semibold text-ink-900">{nights}</span></div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-ink-400">Còn lại</p>
                    <p className={`text-sm font-bold ${balance > 0 ? 'text-terra-700' : 'text-success-600'}`}>{formatMoney(balance)}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {mode === 'arrival' && <Button size="sm" onClick={() => setCheckInId(booking.id)}><LogIn className="h-3.5 w-3.5" /> Check-in</Button>}
                    {mode === 'departure' && <Button size="sm" onClick={() => setCheckOutId(booking.id)}><LogOut className="h-3.5 w-3.5" /> Trả phòng</Button>}
                    {mode === 'inhouse' && <Button size="sm" variant="outline" onClick={() => setCheckOutId(booking.id)}><LogOut className="h-3.5 w-3.5" /> Trả phòng</Button>}
                    {balance > 0 && <Button size="sm" variant="outline" onClick={() => setPaymentId(booking.id)}><CircleDollarSign className="h-3.5 w-3.5" /> Thu tiền</Button>}
                    <Button size="sm" variant="ghost" onClick={() => openDetail(booking.id)}>Chi tiết</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Front desk"
        title="Lễ tân hôm nay"
        description="Đón khách, thu cọc, trả phòng và xử lý công nợ trong một luồng ngắn."
        actions={
          <>
            <Button variant="outline" onClick={() => setFormOpen(true)}><CalendarPlus className="h-4 w-4" /> Walk-in</Button>
            <Button onClick={() => setCheckInId(data.arrivals[0]?.id)} disabled={!data.arrivals.length}><ConciergeBell className="h-4 w-4" /> Check-in nhanh</Button>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Khách đến', value: data.arrivals.length, sub: 'chờ check-in', icon: LogIn, tone: 'bg-sea-100 text-sea-800' },
          { label: 'Đang ở', value: data.inHouse.length, sub: 'khách lưu trú', icon: Users, tone: 'bg-sage-200 text-sea-900' },
          { label: 'Trả phòng', value: data.departures.length, sub: 'cần xử lý hôm nay', icon: LogOut, tone: 'bg-gold-100 text-warning-600' },
        ].map((item) => (
          <Card key={item.label} className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-400">{item.label}</p>
                <p className="mt-1 font-display text-2xl font-semibold leading-none text-ink-900 sm:text-3xl">{item.value}</p>
                <p className="mt-1 text-[9px] leading-relaxed text-ink-400 sm:text-[10px]">{item.sub}</p>
              </div>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${item.tone}`}><item.icon className="h-4 w-4" /></span>
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="arrivals" className="flex-1 sm:flex-none"><LogIn className="hidden h-3.5 w-3.5 sm:block" /> Đến hôm nay <Badge tone="sea" className="ml-1 px-1.5 py-0.5 text-[9px]">{data.arrivals.length}</Badge></TabsTrigger>
            <TabsTrigger value="inhouse" className="flex-1 sm:flex-none"><Users className="hidden h-3.5 w-3.5 sm:block" /> Đang ở <Badge tone="sage" className="ml-1 px-1.5 py-0.5 text-[9px]">{data.inHouse.length}</Badge></TabsTrigger>
            <TabsTrigger value="departures" className="flex-1 sm:flex-none"><LogOut className="hidden h-3.5 w-3.5 sm:block" /> Trả phòng <Badge tone="gold" className="ml-1 px-1.5 py-0.5 text-[9px]">{data.departures.length}</Badge></TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 text-[10px] text-ink-400">
            <CalendarCheck2 className="h-3.5 w-3.5 text-sea-600" /> {formatDateVN(today, 'EEEE, dd/MM/yyyy')}
          </div>
        </div>

        <TabsContent value="arrivals">{renderCards(data.arrivals, 'arrival')}</TabsContent>
        <TabsContent value="inhouse">{renderCards(data.inHouse, 'inhouse')}</TabsContent>
        <TabsContent value="departures">{renderCards(data.departures, 'departure')}</TabsContent>
      </Tabs>

      <Card className="bg-sea-900 text-sand-50">
        <CardHeader>
          <div>
            <CardTitle className="text-sand-50">Quy trình nhanh</CardTitle>
            <p className="mt-1 text-xs text-sand-200/60">3 bước cho một lượt khách, không cần rời màn hình.</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-3">
          {[
            { step: '01', title: 'Xác minh', text: 'Tìm booking, đối chiếu tên và giấy tờ.' },
            { step: '02', title: 'Check-in', text: 'Gán phòng, thu cọc, ghi chú lễ tân.' },
            { step: '03', title: 'Bàn giao', text: 'Phòng chuyển “Đang ở”, buồng phòng nhận task.' },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="font-mono text-[10px] text-gold-300">{item.step}</p>
              <p className="mt-1 text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-sand-200/60">{item.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <BookingDetailSheet bookingId={detailId} open={detailOpen} onOpenChange={setDetailOpen} />
      <CheckInDialog bookingId={checkInId} open={Boolean(checkInId)} onOpenChange={(open) => !open && setCheckInId(undefined)} />
      <CheckOutDialog bookingId={checkOutId} open={Boolean(checkOutId)} onOpenChange={(open) => !open && setCheckOutId(undefined)} />
      <PaymentDialog bookingId={paymentId} open={Boolean(paymentId)} onOpenChange={(open) => !open && setPaymentId(undefined)} />
      <BookingFormDialog open={formOpen} onOpenChange={setFormOpen} initialSource="walkin" />
    </div>
  )
}
