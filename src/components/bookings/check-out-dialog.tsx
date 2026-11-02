import { useEffect, useMemo, useState } from 'react'
import { LogOut, Plus, ReceiptText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useHotelStore } from '../../store/useHotelStore'
import type { BookingExtra, PaymentMethod } from '../../types'
import { formatDateVN, formatMoney, nightsBetween } from '../../lib/utils'
import { PAYMENT_METHOD_LABELS } from '../../lib/constants'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Field, Input, Select, Textarea } from '../ui/field'

const QUICK_EXTRAS = [
  { id: 'minibar', name: 'Minibar', price: 120_000 },
  { id: 'laundry', name: 'Giặt ủi', price: 80_000 },
  { id: 'breakfast', name: 'Ăn sáng thêm', price: 80_000 },
  { id: 'airport', name: 'Đưa đón sân bay', price: 350_000 },
]

export function CheckOutDialog({ bookingId, open, onOpenChange }: { bookingId?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const rooms = useHotelStore((state) => state.rooms)
  const checkOut = useHotelStore((state) => state.checkOut)
  const booking = bookings.find((item) => item.id === bookingId)
  const guest = booking ? guests.find((item) => item.id === booking.guestId) : undefined
  const room = booking ? rooms.find((item) => item.id === booking.roomId) : undefined
  const [extras, setExtras] = useState<BookingExtra[]>([])
  const [discount, setDiscount] = useState(0)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open || !booking) return
    setExtras([])
    setDiscount(0)
    setPaymentAmount(Math.max(0, booking.total - booking.paid))
    setMethod('cash')
    setNote('')
  }, [open, bookingId])

  const baseTotal = useMemo(() => {
    if (!booking) return 0
    return booking.nightlyRate * nightsBetween(booking.checkIn, booking.checkOut)
  }, [booking])
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
  const total = Math.max(0, baseTotal + extrasTotal - discount)
  const remaining = Math.max(0, total - (booking?.paid ?? 0))

  if (!booking) return null

  const toggleExtra = (item: (typeof QUICK_EXTRAS)[number]) => {
    const exists = extras.find((extra) => extra.id === item.id)
    const next = exists
      ? extras.filter((extra) => extra.id !== item.id)
      : [...extras, { id: item.id, name: item.name, quantity: 1, price: item.price }]
    setExtras(next)
    const nextTotal = Math.max(0, baseTotal + next.reduce((sum, extra) => sum + extra.price * extra.quantity, 0) - discount)
    setPaymentAmount(Math.max(0, nextTotal - booking.paid))
  }

  const updateDiscount = (value: number) => {
    setDiscount(Math.max(0, value))
    const nextTotal = Math.max(0, baseTotal + extrasTotal - Math.max(0, value))
    setPaymentAmount(Math.max(0, nextTotal - booking.paid))
  }

  const submit = () => {
    const result = checkOut(booking.id, { extras, discount, paymentAmount, method, note })
    if (!result.ok) {
      toast.error(result.error ?? 'Không thể trả phòng')
      return
    }
    toast.success(`Đã trả phòng ${room?.number}. Phòng chuyển sang cần dọn.`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Trả phòng & thanh toán</DialogTitle>
          <DialogDescription>Kiểm tra dịch vụ phát sinh, thu tiền còn lại và tạo hóa đơn.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 px-5 pb-5 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-sand-200 bg-white/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-ink-900">{guest?.name}</p>
                  <p className="text-[11px] text-ink-500">{room?.number} · {formatDateVN(booking.checkIn)} → {formatDateVN(booking.checkOut)}</p>
                </div>
                <span className="rounded-xl bg-gold-100 px-2.5 py-1 text-[10px] font-bold text-warning-600">{booking.code}</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">Dịch vụ phát sinh</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_EXTRAS.map((item) => {
                  const selected = extras.some((extra) => extra.id === item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleExtra(item)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-[11px] transition ${
                        selected ? 'border-sea-300 bg-sea-50 text-sea-800' : 'border-sand-200 bg-white/45 text-ink-600 hover:bg-white'
                      }`}
                    >
                      <span>{item.name}<span className="block text-[9px] text-ink-400">{formatMoney(item.price)}</span></span>
                      {selected ? <Trash2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Giảm giá">
                <Input type="number" min={0} step={50_000} value={discount} onChange={(event) => updateDiscount(Number(event.target.value))} />
              </Field>
              <Field label="Phương thức thanh toán">
                <Select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Thu tiền còn lại">
              <Input type="number" min={0} step={50_000} value={paymentAmount} onChange={(event) => setPaymentAmount(Number(event.target.value))} />
            </Field>
            <Field label="Ghi chú hóa đơn">
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: khách đã thanh toán minibar bằng tiền mặt..." className="min-h-20" />
            </Field>
          </div>

          <div className="space-y-3">
            <div className="rounded-3xl bg-sea-900 p-4 text-sand-50">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-sand-200/70">
                <ReceiptText className="h-3.5 w-3.5" /> Hóa đơn tạm tính
              </div>
              <div className="mt-3 space-y-1.5 text-[11px] text-sand-200/75">
                <div className="flex justify-between"><span>Tiền phòng</span><span>{formatMoney(baseTotal)}</span></div>
                <div className="flex justify-between"><span>Dịch vụ thêm</span><span>{formatMoney(extrasTotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-sage-200"><span>Giảm giá</span><span>-{formatMoney(discount)}</span></div>}
                <div className="flex justify-between"><span>Đã thu trước</span><span>{formatMoney(booking.paid)}</span></div>
              </div>
              <div className="mt-3 border-t border-white/15 pt-3">
                <div className="flex items-end justify-between">
                  <span className="text-[11px] text-sand-200/70">Tổng hóa đơn</span>
                  <span className="font-display text-2xl font-semibold">{formatMoney(total)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-sand-200/70">Còn phải thu</span>
                  <span className={remaining > 0 ? 'font-semibold text-gold-300' : 'font-semibold text-sage-200'}>{formatMoney(remaining)}</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-gold-100/70 p-3 text-[10px] leading-relaxed text-warning-600">
              Sau khi trả phòng, phòng sẽ chuyển sang <strong>Cần dọn</strong> và tự tạo việc cho buồng phòng.
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button onClick={submit}><LogOut className="h-4 w-4" /> Xác nhận trả phòng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
