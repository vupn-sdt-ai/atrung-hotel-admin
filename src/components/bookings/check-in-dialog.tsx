import { useEffect, useState } from 'react'
import { KeyRound, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useHotelStore } from '../../store/useHotelStore'
import { formatDateVN, formatMoney } from '../../lib/utils'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Field, Input, Textarea } from '../ui/field'
import { Avatar } from '../ui/primitives'

export function CheckInDialog({ bookingId, open, onOpenChange }: { bookingId?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const rooms = useHotelStore((state) => state.rooms)
  const checkIn = useHotelStore((state) => state.checkIn)
  const booking = bookings.find((item) => item.id === bookingId)
  const guest = booking ? guests.find((item) => item.id === booking.guestId) : undefined
  const room = booking ? rooms.find((item) => item.id === booking.roomId) : undefined
  const [deposit, setDeposit] = useState(0)
  const [idNumber, setIdNumber] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open || !booking) return
    setDeposit(Math.max(0, booking.total - booking.paid))
    setIdNumber(guest?.idNumber ?? '')
    setNote('')
  }, [open, bookingId])

  if (!booking) return null
  const balance = Math.max(0, booking.total - booking.paid)

  const submit = () => {
    const result = checkIn(booking.id, { deposit, idNumber, note })
    if (!result.ok) {
      toast.error(result.error ?? 'Không thể check-in')
      return
    }
    toast.success(`Đã check-in ${guest?.name ?? 'khách'} · ${room?.number}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Check-in khách</DialogTitle>
          <DialogDescription>Xác minh khách, thu cọc (nếu có) và gán phòng.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="rounded-3xl border border-sand-200 bg-white/60 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={guest?.name ?? 'Khách'} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold text-ink-900">{guest?.name}</p>
                <p className="text-[11px] text-ink-500">{guest?.phone} · {guest?.nationality}</p>
              </div>
              <span className="ml-auto rounded-xl bg-sea-700 px-2.5 py-1 text-xs font-bold text-sand-50">{room?.number}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-xl bg-sand-100/70 p-2"><span className="block text-ink-400">Nhận phòng</span><span className="font-semibold text-ink-900">{formatDateVN(booking.checkIn)}</span></div>
              <div className="rounded-xl bg-sand-100/70 p-2"><span className="block text-ink-400">Trả phòng</span><span className="font-semibold text-ink-900">{formatDateVN(booking.checkOut)}</span></div>
              <div className="rounded-xl bg-sand-100/70 p-2"><span className="block text-ink-400">Tổng</span><span className="font-semibold text-ink-900">{formatMoney(booking.total)}</span></div>
              <div className="rounded-xl bg-sand-100/70 p-2"><span className="block text-ink-400">Còn lại</span><span className="font-semibold text-terra-700">{formatMoney(balance)}</span></div>
            </div>
          </div>

          <Field label="Thu cọc / thanh toán khi nhận phòng">
            <Input type="number" min={0} step={50_000} value={deposit} onChange={(event) => setDeposit(Number(event.target.value))} />
          </Field>
          <Field label="Số CCCD / hộ chiếu">
            <Input value={idNumber} onChange={(event) => setIdNumber(event.target.value)} placeholder="Nhập số giấy tờ để lưu hồ sơ" />
          </Field>
          <Field label="Ghi chú lễ tân">
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: khách đến muộn, đã giao 1 chìa khoá..." className="min-h-20" />
          </Field>
          <div className="flex items-center gap-2 rounded-2xl bg-sea-50/80 p-3 text-[10px] text-sea-800/80">
            <KeyRound className="h-4 w-4 shrink-0" /> Sau khi check-in, phòng chuyển sang “Đang ở” và xuất hiện trong danh sách khách lưu trú.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button onClick={submit}><LogIn className="h-4 w-4" /> Xác nhận check-in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
