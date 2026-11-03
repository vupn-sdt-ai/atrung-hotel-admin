import { useState } from 'react'
import { CalendarDays, CircleDollarSign, Edit3, LogIn, LogOut, Phone, ReceiptText, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useHotelStore } from '../../store/useHotelStore'
import { bookingBalance, formatDateVN, formatMoney, nightsBetween } from '../../lib/utils'
import { PAYMENT_METHOD_LABELS, SOURCE_LABELS } from '../../lib/constants'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar } from '../ui/primitives'
import { BookingStatusBadge } from '../shared/status-badge'
import { InfoRow } from '../shared/data-display'
import { BookingFormDialog } from './booking-form-dialog'
import { CheckInDialog } from './check-in-dialog'
import { CheckOutDialog } from './check-out-dialog'
import { PaymentDialog } from './payment-dialog'
import { InvoiceDialog } from './invoice-dialog'

export function BookingCalendarModal({ bookingId, open, onOpenChange }: { bookingId?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
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
  const [editOpen, setEditOpen] = useState(false)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkOutOpen, setCheckOutOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)

  if (!booking) return null

  const nights = Math.max(1, nightsBetween(booking.checkIn, booking.checkOut))
  const balance = bookingBalance(booking.total, booking.paid)
  const canCheckIn = booking.status === 'confirmed' || booking.status === 'pending'
  const canCheckOut = booking.status === 'checked_in'
  const canEdit = booking.status === 'pending' || booking.status === 'confirmed'
  const bookingPayments = payments.filter((payment) => payment.bookingId === booking.id)

  const handleCancel = () => {
    if (!window.confirm(`Hủy booking ${booking.code}? Tồn phòng sẽ được giải phóng.`)) return
    cancelBooking(booking.id, 'Hủy từ lịch phòng')
    toast.success('Đã hủy booking')
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              <span className="font-mono text-[10px] text-ink-400">{booking.code}</span>
              <span className="text-[10px] text-ink-400">· {SOURCE_LABELS[booking.source]}</span>
            </div>
            <DialogTitle>Chi tiết đặt phòng</DialogTitle>
            <DialogDescription>{guest?.name} · {room?.number} · {formatDateVN(booking.checkIn)} → {formatDateVN(booking.checkOut)}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 pb-5 sm:px-6">
            <div className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white/60 p-3">
              <Avatar name={guest?.name ?? 'Khách'} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-semibold text-ink-900">{guest?.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-500"><Phone className="h-3 w-3" /> {guest?.phone}</p>
                <p className="mt-0.5 truncate text-[10px] text-ink-400">{guest?.email || 'Chưa có email'} · {guest?.nationality}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.1em] text-ink-400">Phòng</p>
                <p className="font-display text-xl font-semibold text-ink-900">{room?.number}</p>
                
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="rounded-xl bg-sand-100/70 p-2.5"><span className="block text-ink-400">Nhận phòng</span><span className="mt-0.5 block text-xs font-semibold text-ink-900">{formatDateVN(booking.checkIn)}</span></div>
              <div className="rounded-xl bg-sand-100/70 p-2.5"><span className="block text-ink-400">Trả phòng</span><span className="mt-0.5 block text-xs font-semibold text-ink-900">{formatDateVN(booking.checkOut)}</span></div>
              <div className="rounded-xl bg-sand-100/70 p-2.5"><span className="block text-ink-400">Lưu trú</span><span className="mt-0.5 block text-xs font-semibold text-ink-900">{nights} đêm</span></div>
            </div>

            <div className="rounded-2xl border border-sand-200 bg-white/50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">Thanh toán</p>
                <Badge tone={balance > 0 ? 'gold' : 'success'}>{balance > 0 ? 'Còn công nợ' : 'Đã thu đủ'}</Badge>
              </div>
              <div className="mt-2 space-y-1">
                <InfoRow label="Tiền phòng" value={`${formatMoney(booking.nightlyRate)} × ${nights} đêm`} />
                {booking.extras.map((extra) => <InfoRow key={extra.id} label={`${extra.name} × ${extra.quantity}`} value={formatMoney(extra.price * extra.quantity)} />)}
                <div className="border-t border-sand-200 pt-1"><InfoRow label="Tổng cộng" value={<span className="text-sm font-bold text-ink-900">{formatMoney(booking.total)}</span>} /></div>
                <InfoRow label="Đã thu" value={<span className="text-success-600">{formatMoney(booking.paid)}</span>} />
                <InfoRow label="Còn lại" value={<span className={balance > 0 ? 'text-terra-700' : 'text-success-600'}>{formatMoney(balance)}</span>} />
              </div>
              {bookingPayments.length > 0 && (
                <div className="mt-2 border-t border-sand-200 pt-2">
                  {bookingPayments.slice(-3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-[10px] text-ink-500">
                      <span>{formatDateVN(payment.date)} · {PAYMENT_METHOD_LABELS[payment.method]}</span>
                      <span className="font-semibold text-ink-900">{formatMoney(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {booking.notes && <div className="rounded-xl bg-gold-100/60 p-3 text-[11px] leading-relaxed text-warning-600"><span className="font-bold">Ghi chú: </span>{booking.notes}</div>}

            <div className="flex flex-wrap gap-1.5">
              {canCheckIn && <Button size="sm" onClick={() => setCheckInOpen(true)}><LogIn className="h-3.5 w-3.5" /> Check-in</Button>}
              {canCheckOut && <Button size="sm" onClick={() => setCheckOutOpen(true)}><LogOut className="h-3.5 w-3.5" /> Trả phòng</Button>}
              {balance > 0 && booking.status !== 'cancelled' && booking.status !== 'no_show' && <Button size="sm" variant="outline" onClick={() => setPaymentOpen(true)}><CircleDollarSign className="h-3.5 w-3.5" /> Thu tiền</Button>}
              {canEdit && <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}><Edit3 className="h-3.5 w-3.5" /> Sửa</Button>}
              <Button size="sm" variant="outline" onClick={() => setInvoiceOpen(true)}><ReceiptText className="h-3.5 w-3.5" /> Hóa đơn</Button>
              {canEdit && <Button size="sm" variant="ghost" className="text-danger-600 hover:bg-danger-100" onClick={handleCancel}><XCircle className="h-3.5 w-3.5" /> Hủy</Button>}
            </div>
            <p className="flex items-center gap-1.5 text-[10px] text-ink-400"><CalendarDays className="h-3 w-3" /> Khách ở {booking.adults} người lớn, {booking.children} trẻ em · {type?.name}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
            {canCheckIn && <Button onClick={() => setCheckInOpen(true)}><LogIn className="h-4 w-4" /> Check-in</Button>}
            {canCheckOut && <Button onClick={() => setCheckOutOpen(true)}><LogOut className="h-4 w-4" /> Trả phòng</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BookingFormDialog open={editOpen} onOpenChange={setEditOpen} bookingId={booking.id} />
      <CheckInDialog bookingId={booking.id} open={checkInOpen} onOpenChange={setCheckInOpen} />
      <CheckOutDialog bookingId={booking.id} open={checkOutOpen} onOpenChange={setCheckOutOpen} />
      <PaymentDialog bookingId={booking.id} open={paymentOpen} onOpenChange={setPaymentOpen} />
      <InvoiceDialog bookingId={booking.id} open={invoiceOpen} onOpenChange={setInvoiceOpen} />
    </>
  )
}
