import { Printer, ReceiptText } from 'lucide-react'
import { useHotelStore } from '../../store/useHotelStore'
import { formatDateVN, formatMoney, nightsBetween } from '../../lib/utils'
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from '../../lib/constants'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'

export function InvoiceDialog({ bookingId, open, onOpenChange }: { bookingId?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const rooms = useHotelStore((state) => state.rooms)
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const payments = useHotelStore((state) => state.payments)
  const settings = useHotelStore((state) => state.settings)
  const booking = bookings.find((item) => item.id === bookingId)
  const guest = booking ? guests.find((item) => item.id === booking.guestId) : undefined
  const room = booking ? rooms.find((item) => item.id === booking.roomId) : undefined
  const type = room ? roomTypes.find((item) => item.id === room.typeId) : undefined
  const bookingPayments = booking ? payments.filter((payment) => payment.bookingId === booking.id) : []

  if (!booking) return null
  const nights = nightsBetween(booking.checkIn, booking.checkOut)
  const roomTotal = booking.nightlyRate * nights
  const extrasTotal = booking.extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
  const balance = Math.max(0, booking.total - booking.paid)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="print-area max-w-2xl bg-white">
        <DialogHeader className="no-print">
          <DialogTitle>Hóa đơn</DialogTitle>
          <DialogDescription>Bản demo hóa đơn nội bộ, chưa phải hóa đơn điện tử hợp pháp.</DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-5 sm:px-6">
          <div className="rounded-3xl border border-sand-200 bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-4 border-b border-sand-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900">{settings.name}</p>
                <p className="mt-1 text-[11px] text-ink-500">{settings.address}</p>
                <p className="text-[11px] text-ink-500">{settings.phone} · {settings.email}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sea-700">Hóa đơn</p>
                <p className="mt-1 font-mono text-sm font-semibold text-ink-900">HD-{booking.code.replace('AT-', '')}</p>
                <p className="mt-1 text-[10px] text-ink-400">{formatDateVN(booking.checkOut, 'dd/MM/yyyy')}</p>
              </div>
            </div>

            <div className="grid gap-3 border-b border-sand-200 py-5 text-[11px] sm:grid-cols-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">Khách hàng</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">{guest?.name}</p>
                <p className="text-ink-500">{guest?.phone} · {guest?.email || '—'}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">Lưu trú</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">{room?.number} · {type?.name}</p>
                <p className="text-ink-500">{formatDateVN(booking.checkIn)} → {formatDateVN(booking.checkOut)} · {nights} đêm</p>
              </div>
            </div>

            <div className="py-4">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-sand-200 text-left text-[9px] uppercase tracking-[0.12em] text-ink-400">
                    <th className="pb-2 font-semibold">Nội dung</th>
                    <th className="pb-2 text-center font-semibold">SL</th>
                    <th className="pb-2 text-right font-semibold">Đơn giá</th>
                    <th className="pb-2 text-right font-semibold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-sand-100">
                    <td className="py-2.5 text-ink-900">Tiền phòng · {type?.name}</td>
                    <td className="py-2.5 text-center text-ink-500">{nights}</td>
                    <td className="py-2.5 text-right text-ink-500">{formatMoney(booking.nightlyRate)}</td>
                    <td className="py-2.5 text-right font-semibold text-ink-900">{formatMoney(roomTotal)}</td>
                  </tr>
                  {booking.extras.map((extra) => (
                    <tr key={extra.id} className="border-b border-sand-100">
                      <td className="py-2.5 text-ink-900">{extra.name}</td>
                      <td className="py-2.5 text-center text-ink-500">{extra.quantity}</td>
                      <td className="py-2.5 text-right text-ink-500">{formatMoney(extra.price)}</td>
                      <td className="py-2.5 text-right font-semibold text-ink-900">{formatMoney(extra.price * extra.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto max-w-xs space-y-1.5 border-t border-sand-200 pt-3 text-[11px]">
              <div className="flex justify-between text-ink-500"><span>Tạm tính</span><span>{formatMoney(roomTotal + extrasTotal)}</span></div>
              <div className="flex justify-between text-ink-500"><span>Thuế / phí ({settings.taxRate}%)</span><span>Đã bao gồm</span></div>
              <div className="flex justify-between border-t border-sand-200 pt-2 text-sm font-bold text-ink-900"><span>Tổng cộng</span><span>{formatMoney(booking.total)}</span></div>
              <div className="flex justify-between text-success-600"><span>Đã thanh toán</span><span>{formatMoney(booking.paid)}</span></div>
              <div className="flex justify-between font-semibold text-terra-700"><span>Còn lại</span><span>{formatMoney(balance)}</span></div>
            </div>

            {bookingPayments.length > 0 && (
              <div className="mt-5 border-t border-sand-200 pt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">Lịch sử thanh toán</p>
                <div className="mt-2 space-y-1.5">
                  {bookingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-[10px] text-ink-500">
                      <span>{formatDateVN(payment.date)} · {PAYMENT_METHOD_LABELS[payment.method]} · {PAYMENT_TYPE_LABELS[payment.type]}</span>
                      <span className="font-semibold text-ink-900">{formatMoney(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-end justify-between border-t border-sand-200 pt-4 text-[9px] text-ink-400">
              <div>
                <p className="font-semibold text-ink-600">Cảm ơn quý khách đã chọn A Trung.</p>
                <p className="mt-1">Hóa đơn demo · Không có giá trị thanh toán thật.</p>
              </div>
              <ReceiptText className="h-8 w-8 text-sand-300" />
            </div>
          </div>
        </div>
        <DialogFooter className="no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> In hóa đơn</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
