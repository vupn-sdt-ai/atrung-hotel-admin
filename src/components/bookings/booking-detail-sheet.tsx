import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, CircleDollarSign, Edit3, LogIn, LogOut, Phone, ReceiptText, UserRound, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useHotelStore } from '../../store/useHotelStore'
import { bookingBalance, formatDateLong, formatMoney, nightsBetween } from '../../lib/utils'
import { BOOKING_STATUS_LABELS, PAYMENT_METHOD_LABELS, SOURCE_LABELS } from '../../lib/constants'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { BookingStatusBadge, RoomStatusBadge } from '../shared/status-badge'
import { InfoRow } from '../shared/data-display'
import { Avatar, Progress } from '../ui/primitives'
import { BookingFormDialog } from './booking-form-dialog'
import { CheckInDialog } from './check-in-dialog'
import { CheckOutDialog } from './check-out-dialog'
import { PaymentDialog } from './payment-dialog'
import { InvoiceDialog } from './invoice-dialog'

export function BookingDetailSheet({ bookingId, open, onOpenChange }: { bookingId?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate()
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const rooms = useHotelStore((state) => state.rooms)
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const payments = useHotelStore((state) => state.payments)
  const cancelBooking = useHotelStore((state) => state.cancelBooking)
  const booking = bookings.find((item) => item.id === bookingId)
  const guest = booking ? guests.find((item) => item.id === booking.guestId) : undefined
  const room = booking ? rooms.find((item) => item.id === booking.roomId) : undefined
  const type = room ? roomTypes.find((item) => item.id === room.typeId) : undefined
  const bookingPayments = booking ? payments.filter((payment) => payment.bookingId === booking.id) : []
  const [editOpen, setEditOpen] = useState(false)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkOutOpen, setCheckOutOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)

  if (!booking) return null
  const balance = bookingBalance(booking.total, booking.paid)
  const nights = Math.max(1, nightsBetween(booking.checkIn, booking.checkOut))
  const roomTotal = booking.nightlyRate * nights
  const canCheckIn = booking.status === 'confirmed' || booking.status === 'pending'
  const canCheckOut = booking.status === 'checked_in'
  const canEdit = booking.status === 'pending' || booking.status === 'confirmed'

  const handleCancel = () => {
    if (!window.confirm(`Hủy booking ${booking.code}? Tồn phòng sẽ được giải phóng.`)) return
    cancelBooking(booking.id, 'Hủy từ màn hình chi tiết')
    toast.success('Đã hủy booking')
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <div className="flex flex-wrap items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              <span className="font-mono text-[10px] text-ink-400">{booking.code}</span>
              <span className="text-[10px] text-ink-400">· {SOURCE_LABELS[booking.source]}</span>
            </div>
            <SheetTitle>{guest?.name ?? 'Chi tiết booking'}</SheetTitle>
            <SheetDescription>
              {room?.number} · {room?.name} · {formatDateLong(booking.checkIn)} → {formatDateLong(booking.checkOut)}
            </SheetDescription>
          </SheetHeader>

          <SheetBody>
            <div className="flex items-center gap-3 rounded-3xl border border-sand-200 bg-white/60 p-4">
              <Avatar name={guest?.name ?? 'Khách'} size="xl" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-semibold tracking-[-0.02em] text-ink-900">{guest?.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-500"><Phone className="h-3 w-3" /> {guest?.phone}</p>
                <p className="mt-0.5 truncate text-[11px] text-ink-500">{guest?.email || 'Chưa có email'} · {guest?.nationality}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {guest?.tags.map((tag) => <Badge key={tag} tone="sage" className="text-[9px]">{tag}</Badge>)}
                </div>
              </div>
              <button
                onClick={() => {
                  onOpenChange(false)
                  navigate(`/guests?guest=${guest?.id}`)
                }}
                className="grid h-9 w-9 place-items-center rounded-xl bg-sand-100 text-ink-500 transition hover:bg-sand-200"
                aria-label="Mở hồ sơ khách"
              >
                <UserRound className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-sand-200 bg-white/45 p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-400">Phòng</p>
                <p className="mt-1 font-display text-lg font-semibold text-ink-900">{room?.number}</p>
                <p className="text-[10px] text-ink-500">{type?.name} · {room?.floorLabel}</p>
                <div className="mt-2"><RoomStatusBadge status={room?.status ?? 'available'} /></div>
              </div>
              <div className="rounded-2xl border border-sand-200 bg-white/45 p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-400">Lưu trú</p>
                <p className="mt-1 font-display text-lg font-semibold text-ink-900">{nights} đêm</p>
                <p className="text-[10px] text-ink-500">{booking.adults} người lớn · {booking.children} trẻ em</p>
                <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-sea-700"><CalendarDays className="h-3 w-3" /> {formatMoney(booking.nightlyRate)}/đêm</p>
              </div>
            </div>

            <div className="rounded-3xl border border-sand-200 bg-white/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">Thanh toán</p>
                <Badge tone={balance > 0 ? 'gold' : 'success'}>{balance > 0 ? 'Còn công nợ' : 'Đã thanh toán'}</Badge>
              </div>
              <div className="mt-3 space-y-1.5">
                <InfoRow label="Tiền phòng" value={formatMoney(roomTotal)} />
                {booking.extras.map((extra) => <InfoRow key={extra.id} label={`${extra.name} × ${extra.quantity}`} value={formatMoney(extra.price * extra.quantity)} />)}
                <div className="border-t border-sand-200 pt-1"><InfoRow label="Tổng cộng" value={<span className="text-sm font-bold text-ink-900">{formatMoney(booking.total)}</span>} /></div>
                <InfoRow label="Đã thu" value={<span className="text-success-600">{formatMoney(booking.paid)}</span>} />
                <InfoRow label="Còn lại" value={<span className={balance > 0 ? 'text-terra-700' : 'text-success-600'}>{formatMoney(balance)}</span>} />
              </div>
              <Progress value={booking.total ? Math.min(100, (booking.paid / booking.total) * 100) : 0} className="mt-2 bg-sand-200" indicatorClassName={balance > 0 ? 'bg-gold-500' : 'bg-success-600'} />
              {bookingPayments.length > 0 && (
                <div className="mt-3 border-t border-sand-200 pt-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-400">Lịch sử</p>
                  {bookingPayments.map((payment) => (
                    <div key={payment.id} className="mt-1.5 flex items-center justify-between text-[10px] text-ink-500">
                      <span>{formatDateLong(payment.date)} · {PAYMENT_METHOD_LABELS[payment.method]}</span>
                      <span className="font-semibold text-ink-900">{formatMoney(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {booking.notes && (
              <div className="rounded-2xl bg-gold-100/60 p-3 text-[11px] leading-relaxed text-warning-600">
                <span className="font-bold">Ghi chú: </span>{booking.notes}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {canCheckIn && <Button size="sm" onClick={() => setCheckInOpen(true)}><LogIn className="h-3.5 w-3.5" /> Check-in</Button>}
              {canCheckOut && <Button size="sm" onClick={() => setCheckOutOpen(true)}><LogOut className="h-3.5 w-3.5" /> Trả phòng</Button>}
              {balance > 0 && booking.status !== 'cancelled' && booking.status !== 'no_show' && <Button size="sm" variant="outline" onClick={() => setPaymentOpen(true)}><CircleDollarSign className="h-3.5 w-3.5" /> Thu tiền</Button>}
              {canEdit && <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}><Edit3 className="h-3.5 w-3.5" /> Sửa</Button>}
              <Button size="sm" variant="outline" onClick={() => setInvoiceOpen(true)}><ReceiptText className="h-3.5 w-3.5" /> Hóa đơn</Button>
              {canEdit && <Button size="sm" variant="ghost" className="text-danger-600 hover:bg-danger-100" onClick={handleCancel}><XCircle className="h-3.5 w-3.5" /> Hủy</Button>}
            </div>
            {booking.status === 'cancelled' && <p className="text-[11px] text-danger-600">Booking đã hủy. {BOOKING_STATUS_LABELS[booking.status]}</p>}
          </SheetBody>

          <SheetFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
            {canCheckIn && <Button onClick={() => setCheckInOpen(true)}><LogIn className="h-4 w-4" /> Check-in ngay</Button>}
            {canCheckOut && <Button onClick={() => setCheckOutOpen(true)}><LogOut className="h-4 w-4" /> Trả phòng</Button>}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <BookingFormDialog open={editOpen} onOpenChange={setEditOpen} bookingId={booking.id} />
      <CheckInDialog bookingId={booking.id} open={checkInOpen} onOpenChange={setCheckInOpen} />
      <CheckOutDialog bookingId={booking.id} open={checkOutOpen} onOpenChange={setCheckOutOpen} />
      <PaymentDialog bookingId={booking.id} open={paymentOpen} onOpenChange={setPaymentOpen} />
      <InvoiceDialog bookingId={booking.id} open={invoiceOpen} onOpenChange={setInvoiceOpen} />
    </>
  )
}
