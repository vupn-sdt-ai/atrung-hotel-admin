import { useMemo, useState } from 'react'
import { CalendarDays, Mail, MessageCircle, Phone, UserRound } from 'lucide-react'
import { useHotelStore } from '../../store/useHotelStore'
import { formatDateVN, formatMoney } from '../../lib/utils'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, Separator } from '../ui/primitives'
import { BookingStatusBadge } from '../shared/status-badge'
import { EmptyState } from '../shared/data-display'
import { BookingDetailSheet } from '../bookings/booking-detail-sheet'

export function GuestDetailSheet({ guestId, open, onOpenChange }: { guestId?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const guests = useHotelStore((state) => state.guests)
  const bookings = useHotelStore((state) => state.bookings)
  const rooms = useHotelStore((state) => state.rooms)
  const guest = guests.find((item) => item.id === guestId)
  const [bookingId, setBookingId] = useState<string | undefined>()
  const [bookingOpen, setBookingOpen] = useState(false)

  const history = useMemo(
    () => bookings.filter((booking) => booking.guestId === guestId).sort((a, b) => b.checkIn.localeCompare(a.checkIn)),
    [bookings, guestId],
  )
  const totalSpent = history.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'no_show').reduce((sum, booking) => sum + booking.paid, 0)
  const lastStay = history.find((booking) => booking.status === 'checked_out')

  if (!guest) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <div className="flex items-center gap-4">
              <Avatar name={guest.name} size="xl" />
              <div className="min-w-0">
                <SheetTitle>{guest.name}</SheetTitle>
                <SheetDescription>{guest.nationality} · khách từ {formatDateVN(guest.createdAt, 'MM/yyyy')}</SheetDescription>
                <div className="mt-2 flex flex-wrap gap-1">
                  {guest.tags.map((tag) => <Badge key={tag} tone="sage" className="text-[9px]">{tag}</Badge>)}
                </div>
              </div>
            </div>
          </SheetHeader>
          <SheetBody>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-sea-100/60 p-3 text-center">
                <p className="text-[9px] uppercase tracking-[0.1em] text-sea-700/60">Lần ở</p>
                <p className="mt-1 font-display text-xl font-semibold text-sea-900">{history.length}</p>
              </div>
              <div className="rounded-2xl bg-gold-100/60 p-3 text-center">
                <p className="text-[9px] uppercase tracking-[0.1em] text-gold-600/70">Đã chi</p>
                <p className="mt-1 text-sm font-bold text-gold-600">{formatMoney(totalSpent)}</p>
              </div>
              <div className="rounded-2xl bg-sand-100/70 p-3 text-center">
                <p className="text-[9px] uppercase tracking-[0.1em] text-ink-400">Gần nhất</p>
                <p className="mt-1 text-xs font-bold text-ink-900">{lastStay ? formatDateVN(lastStay.checkIn) : '—'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-sand-200 bg-white/55 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">Liên hệ</p>
              <div className="mt-2 space-y-2 text-[11px] text-ink-600">
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-sea-600" /> {guest.phone}</p>
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-sea-600" /> {guest.email || 'Chưa có email'}</p>
                <p className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-sea-600" /> {guest.idNumber || 'Chưa lưu giấy tờ'}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <a href={`tel:${guest.phone.replaceAll(' ', '')}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-sand-200 bg-white py-2 text-[10px] font-semibold text-ink-700">
                  <Phone className="h-3.5 w-3.5" /> Gọi
                </a>
                <a href={`https://zalo.me/${guest.phone.replaceAll(' ', '').replace('+84', '0')}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-sand-200 bg-white py-2 text-[10px] font-semibold text-ink-700">
                  <MessageCircle className="h-3.5 w-3.5" /> Zalo
                </a>
              </div>
            </div>

            {guest.notes && <div className="rounded-2xl bg-gold-100/60 p-3 text-[11px] leading-relaxed text-warning-600"><span className="font-bold">Ghi chú: </span>{guest.notes}</div>}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">Lịch sử lưu trú</p>
                <span className="text-[10px] text-ink-400">{history.length} booking</span>
              </div>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <EmptyState icon={CalendarDays} title="Chưa có lịch sử" description="Khách chưa có booking nào." className="border-0 bg-transparent py-6" />
                ) : (
                  history.slice(0, 8).map((booking) => {
                    const room = rooms.find((item) => item.id === booking.roomId)
                    return (
                      <button key={booking.id} onClick={() => { setBookingId(booking.id); setBookingOpen(true) }} className="flex w-full items-center gap-3 rounded-2xl border border-sand-200/70 bg-white/45 p-3 text-left transition hover:bg-white">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-sand-100 text-[10px] font-bold text-ink-700">{room?.number}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11px] font-semibold text-ink-900">{formatDateVN(booking.checkIn)} → {formatDateVN(booking.checkOut)}</span>
                          <span className="mt-0.5 block text-[10px] text-ink-500">{booking.code} · {formatMoney(booking.total)}</span>
                        </span>
                        <BookingStatusBadge status={booking.status} />
                      </button>
                    )
                  })
                )}
              </div>
            </div>
            <Separator />
            <p className="text-[10px] leading-relaxed text-ink-400">Thông tin cá nhân chỉ dùng cho vận hành. Bản demo không mã hoá dữ liệu thật.</p>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <BookingDetailSheet bookingId={bookingId} open={bookingOpen} onOpenChange={setBookingOpen} />
    </>
  )
}
