import { useEffect, useState } from 'react'
import { CircleDollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { useHotelStore } from '../../store/useHotelStore'
import type { PaymentMethod, PaymentType } from '../../types'
import { bookingBalance, formatMoney } from '../../lib/utils'
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from '../../lib/constants'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Field, Input, Select, Textarea } from '../ui/field'

export function PaymentDialog({ bookingId, open, onOpenChange }: { bookingId?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const rooms = useHotelStore((state) => state.rooms)
  const recordPayment = useHotelStore((state) => state.recordPayment)
  const booking = bookings.find((item) => item.id === bookingId)
  const guest = booking ? guests.find((item) => item.id === booking.guestId) : undefined
  const room = booking ? rooms.find((item) => item.id === booking.roomId) : undefined
  const [amount, setAmount] = useState(0)
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [type, setType] = useState<PaymentType>('payment')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open || !booking) return
    setAmount(bookingBalance(booking.total, booking.paid))
    setMethod('cash')
    setType('payment')
    setNote('')
  }, [open, bookingId])

  if (!booking) return null

  const submit = () => {
    if (amount <= 0) {
      toast.error('Số tiền phải lớn hơn 0')
      return
    }
    recordPayment(booking.id, amount, method, type, note)
    toast.success(`Đã ghi nhận ${formatMoney(amount)} cho ${booking.code}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ghi nhận thanh toán</DialogTitle>
          <DialogDescription>{guest?.name} · {room?.number} · {booking.code}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-sand-100/70 p-3"><p className="text-[9px] uppercase tracking-[0.1em] text-ink-400">Tổng</p><p className="mt-1 text-xs font-bold text-ink-900">{formatMoney(booking.total)}</p></div>
            <div className="rounded-2xl bg-success-100/70 p-3"><p className="text-[9px] uppercase tracking-[0.1em] text-success-600/70">Đã thu</p><p className="mt-1 text-xs font-bold text-success-600">{formatMoney(booking.paid)}</p></div>
            <div className="rounded-2xl bg-terra-100/70 p-3"><p className="text-[9px] uppercase tracking-[0.1em] text-terra-700/70">Còn lại</p><p className="mt-1 text-xs font-bold text-terra-700">{formatMoney(bookingBalance(booking.total, booking.paid))}</p></div>
          </div>
          <Field label="Số tiền">
            <Input type="number" min={0} step={50_000} value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phương thức">
              <Select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
            </Field>
            <Field label="Loại">
              <Select value={type} onChange={(event) => setType(event.target.value as PaymentType)}>
                {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Ghi chú">
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: khách chuyển khoản trước khi trả phòng..." className="min-h-20" />
          </Field>
          <div className="flex items-center gap-2 rounded-2xl bg-sea-50/80 p-3 text-[10px] text-sea-800/80">
            <CircleDollarSign className="h-4 w-4 shrink-0" /> Bản demo chỉ ghi nhận phương thức, không lưu số thẻ/CVV.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button onClick={submit}>Ghi nhận thanh toán</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
