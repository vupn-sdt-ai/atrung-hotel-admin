import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useHotelStore } from '../../store/useHotelStore'
import type { Booking, BookingSource, NewBookingInput } from '../../types'
import { addDaysKey, calculateTotal, formatMoney, nightsBetween, todayKey } from '../../lib/utils'
import { BOOKING_STATUS_LABELS, SOURCE_LABELS } from '../../lib/constants'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Field, Input, Select, Textarea } from '../ui/field'
import { Avatar } from '../ui/primitives'
import { Badge } from '../ui/badge'

interface BookingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialRoomId?: string
  initialDate?: string
  initialSource?: BookingSource
  bookingId?: string
  onSaved?: (booking: Booking) => void
}

interface FormState {
  guestName: string
  guestPhone: string
  guestEmail: string
  nationality: string
  roomId: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  source: BookingSource
  nightlyRate: number
  deposit: number
  notes: string
  breakfast: boolean
  extraBed: boolean
}

export function BookingFormDialog({ open, onOpenChange, initialRoomId, initialDate, initialSource, bookingId, onSaved }: BookingFormDialogProps) {
  const rooms = useHotelStore((state) => state.rooms)
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const guests = useHotelStore((state) => state.guests)
  const bookings = useHotelStore((state) => state.bookings)
  const addBooking = useHotelStore((state) => state.addBooking)
  const updateBooking = useHotelStore((state) => state.updateBooking)
  const updateGuest = useHotelStore((state) => state.updateGuest)
  const [error, setError] = useState('')
  const existing = bookingId ? bookings.find((booking) => booking.id === bookingId) : undefined
  const existingGuest = existing ? guests.find((guest) => guest.id === existing.guestId) : undefined

  const defaultRoom = initialRoomId ?? rooms.find((room) => room.status === 'available')?.id ?? rooms[0]?.id ?? ''
  const defaultDate = initialDate ?? todayKey()
  const [form, setForm] = useState<FormState>({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    nationality: 'Việt Nam',
    roomId: defaultRoom,
    checkIn: defaultDate,
    checkOut: addDaysKey(defaultDate, 1),
    adults: 2,
    children: 0,
    source: initialSource ?? 'direct',
    nightlyRate: 650_000,
    deposit: 0,
    notes: '',
    breakfast: false,
    extraBed: false,
  })

  useEffect(() => {
    if (!open) return
    setError('')
    if (existing) {
      const guest = guests.find((item) => item.id === existing.guestId)
      const room = rooms.find((item) => item.id === existing.roomId)
      const type = roomTypes.find((item) => item.id === room?.typeId)
      setForm({
        guestName: guest?.name ?? '',
        guestPhone: guest?.phone ?? '',
        guestEmail: guest?.email ?? '',
        nationality: guest?.nationality ?? 'Việt Nam',
        roomId: existing.roomId,
        checkIn: existing.checkIn,
        checkOut: existing.checkOut,
        adults: existing.adults,
        children: existing.children,
        source: existing.source,
        nightlyRate: existing.nightlyRate || type?.basePrice || 650_000,
        deposit: 0,
        notes: existing.notes,
        breakfast: existing.extras.some((extra) => extra.id === 'breakfast'),
        extraBed: existing.extras.some((extra) => extra.id === 'extra-bed'),
      })
    } else {
      const room = rooms.find((item) => item.id === defaultRoom)
      const type = roomTypes.find((item) => item.id === room?.typeId)
      setForm({
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        nationality: 'Việt Nam',
        roomId: defaultRoom,
        checkIn: defaultDate,
        checkOut: addDaysKey(defaultDate, 1),
        adults: 2,
        children: 0,
        source: initialSource ?? 'direct',
        nightlyRate: type?.basePrice ?? 650_000,
        deposit: 0,
        notes: '',
        breakfast: false,
        extraBed: false,
      })
    }
  }, [open, bookingId, initialRoomId, initialDate, initialSource])

  const type = roomTypes.find((item) => item.id === rooms.find((room) => room.id === form.roomId)?.typeId)
  const nights = nightsBetween(form.checkIn, form.checkOut)
  const extras = useMemo(() => {
    const items = []
    if (form.breakfast) items.push({ id: 'breakfast', name: 'Ăn sáng', quantity: Math.max(1, form.adults + form.children) * Math.max(1, nights), price: 80_000 })
    if (form.extraBed) items.push({ id: 'extra-bed', name: 'Giường phụ', quantity: Math.max(1, nights), price: 150_000 })
    return items
  }, [form.breakfast, form.extraBed, form.adults, form.children, nights])
  const total = calculateTotal(nights, form.nightlyRate, extras)
  const extrasTotal = extras.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))

  const submit = () => {
    setError('')
    if (!form.guestName.trim() || !form.guestPhone.trim()) {
      setError('Vui lòng nhập tên và số điện thoại khách.')
      return
    }
    if (nights <= 0) {
      setError('Ngày trả phòng phải sau ngày nhận phòng.')
      return
    }
    if (existing) {
      const result = updateBooking(existing.id, {
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        roomId: form.roomId,
        adults: form.adults,
        children: form.children,
        source: form.source,
        nightlyRate: form.nightlyRate,
        total,
        extras,
        notes: form.notes,
      })
      if (!result.ok) {
        setError(result.error ?? 'Không thể cập nhật booking.')
        return
      }
      if (existingGuest) {
        updateGuest(existingGuest.id, {
          name: form.guestName,
          phone: form.guestPhone,
          email: form.guestEmail,
          nationality: form.nationality,
        })
      }
      toast.success('Đã cập nhật booking')
      onOpenChange(false)
      if (existing) onSaved?.(existing)
      return
    }

    const input: NewBookingInput = {
      guestName: form.guestName,
      guestPhone: form.guestPhone,
      guestEmail: form.guestEmail,
      nationality: form.nationality,
      roomId: form.roomId,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: form.adults,
      children: form.children,
      source: form.source,
      nightlyRate: form.nightlyRate,
      deposit: form.deposit,
      notes: form.notes,
      breakfast: form.breakfast,
      extraBed: form.extraBed,
    }
    const result = addBooking(input)
    if (!result.ok || !result.booking) {
      setError(result.error ?? 'Không thể tạo booking.')
      return
    }
    toast.success(`Đã tạo booking ${result.booking.code}`)
    onOpenChange(false)
    onSaved?.(result.booking)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{existing ? `Sửa booking ${existing.code}` : 'Đặt phòng mới'}</DialogTitle>
          <DialogDescription>
            {existing ? 'Cập nhật ngày, phòng, giá hoặc thông tin khách.' : 'Điền thông tin cơ bản, hệ thống sẽ kiểm tra phòng trống trước khi lưu.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 px-5 py-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-sea-700">
              <UserRound className="h-3.5 w-3.5" /> Khách
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tên khách" required>
                <Input value={form.guestName} onChange={(event) => update('guestName', event.target.value)} placeholder="Nguyễn Thu Hà" />
              </Field>
              <Field label="Số điện thoại" required>
                <Input value={form.guestPhone} onChange={(event) => update('guestPhone', event.target.value)} placeholder="0905 123 456" />
              </Field>
              <Field label="Email">
                <Input value={form.guestEmail} onChange={(event) => update('guestEmail', event.target.value)} placeholder="guest@email.com" type="email" />
              </Field>
              <Field label="Quốc tịch">
                <Input value={form.nationality} onChange={(event) => update('nationality', event.target.value)} />
              </Field>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-sea-700">
              <CalendarDays className="h-3.5 w-3.5" /> Lưu trú
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phòng">
                <Select
                  value={form.roomId}
                  onChange={(event) => {
                    const room = rooms.find((item) => item.id === event.target.value)
                    const nextType = roomTypes.find((item) => item.id === room?.typeId)
                    update('roomId', event.target.value)
                    if (!existing && nextType) update('nightlyRate', nextType.basePrice)
                  }}
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.number} · {room.name} ({room.status === 'available' ? 'trống' : room.status === 'occupied' ? 'đang ở' : room.status === 'dirty' ? 'cần dọn' : 'bảo trì'})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Nguồn đặt">
                <Select value={form.source} onChange={(event) => update('source', event.target.value as BookingSource)}>
                  {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Nhận phòng">
                <Input type="date" value={form.checkIn} onChange={(event) => update('checkIn', event.target.value)} />
              </Field>
              <Field label="Trả phòng">
                <Input type="date" value={form.checkOut} onChange={(event) => update('checkOut', event.target.value)} />
              </Field>
              <Field label="Người lớn">
                <Input type="number" min={1} max={type?.maxAdults ?? 6} value={form.adults} onChange={(event) => update('adults', Number(event.target.value))} />
              </Field>
              <Field label="Trẻ em">
                <Input type="number" min={0} max={type?.maxChildren ?? 4} value={form.children} onChange={(event) => update('children', Number(event.target.value))} />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Giá mỗi đêm" hint={type ? `${type.name} · giá gốc ${formatMoney(type.basePrice)}` : undefined}>
                <Input type="number" min={0} step={50_000} value={form.nightlyRate} onChange={(event) => update('nightlyRate', Number(event.target.value))} />
              </Field>
              {!existing && (
                <Field label="Đặt cọc" hint="Có thể thu sau, không bắt buộc">
                  <Input type="number" min={0} step={50_000} value={form.deposit} onChange={(event) => update('deposit', Number(event.target.value))} />
                </Field>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-sand-200 bg-white/50 px-3 py-2 text-[11px] font-medium text-ink-700">
                <input type="checkbox" checked={form.breakfast} onChange={(event) => update('breakfast', event.target.checked)} className="h-3.5 w-3.5 accent-[#0B5D50]" />
                Ăn sáng · 80.000đ/khách/ngày
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-sand-200 bg-white/50 px-3 py-2 text-[11px] font-medium text-ink-700">
                <input type="checkbox" checked={form.extraBed} onChange={(event) => update('extraBed', event.target.checked)} className="h-3.5 w-3.5 accent-[#0B5D50]" />
                Giường phụ · 150.000đ/đêm
              </label>
            </div>

            <Field label="Ghi chú">
              <Textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Ví dụ: đến muộn, cần thêm gối, dị ứng hải sản..." />
            </Field>
          </div>

          <div className="space-y-3">
            <div className="rounded-3xl border border-sand-200 bg-white/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">Tóm tắt</p>
                <Badge tone="sea">{nights} đêm</Badge>
              </div>
              {existing && existingGuest && (
                <div className="mt-3 flex items-center gap-2">
                  <Avatar name={existingGuest.name} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-ink-900">{existingGuest.name}</p>
                    <p className="text-[10px] text-ink-400">{BOOKING_STATUS_LABELS[existing.status]}</p>
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between gap-3 text-ink-500"><span>{formatMoney(form.nightlyRate)} × {nights} đêm</span><span className="font-semibold text-ink-900">{formatMoney(form.nightlyRate * Math.max(0, nights))}</span></div>
                {extras.map((extra) => (
                  <div key={extra.id} className="flex justify-between gap-3 text-ink-500"><span>{extra.name} × {extra.quantity}</span><span className="font-semibold text-ink-900">{formatMoney(extra.price * extra.quantity)}</span></div>
                ))}
                {extrasTotal > 0 && <div className="flex justify-between gap-3 text-ink-500"><span>Dịch vụ thêm</span><span className="font-semibold text-ink-900">{formatMoney(extrasTotal)}</span></div>}
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-sand-200 pt-3">
                <span className="text-xs font-semibold text-ink-500">Tổng cộng</span>
                <span className="font-display text-xl font-semibold text-ink-900">{formatMoney(total)}</span>
              </div>
              {!existing && form.deposit > 0 && (
                <p className="mt-2 text-right text-[10px] text-ink-400">Còn lại {formatMoney(Math.max(0, total - form.deposit))}</p>
              )}
            </div>

            <div className="rounded-2xl bg-sea-50/80 p-3 text-[10px] leading-relaxed text-sea-800/80">
              <Check className="mr-1 inline h-3.5 w-3.5" />
              Hệ thống kiểm tra trùng phòng theo ngày nhận/trả. Nếu phòng đã có booking, bạn sẽ được báo ngay.
            </div>
            {error && <p className="rounded-xl bg-danger-100 px-3 py-2 text-[11px] font-medium text-danger-600">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={submit}>{existing ? 'Lưu thay đổi' : 'Tạo booking'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
