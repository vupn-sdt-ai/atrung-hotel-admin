import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarPlus, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, DoorOpen, Info, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useHotelStore, rateForDate } from '../store/useHotelStore'
import { addDaysKey, cn, formatDateVN, formatMoney, isWeekendKey, todayKey } from '../lib/utils'
import { isBookingActiveOn, occupiedRoomIds } from '../lib/analytics'
import { BOOKING_BAR_CLASSES, ROOM_STATUS_LABELS } from '../lib/constants'
import type { Booking, CalendarOverride, RoomType } from '../types'
import { PageHeader } from '../components/shared/page-header'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Field, Input } from '../components/ui/field'
import { Switch } from '../components/ui/primitives'
import { BookingDetailSheet } from '../components/bookings/booking-detail-sheet'
import { BookingFormDialog } from '../components/bookings/booking-form-dialog'

const DAYS = 14

interface RateCell {
  typeId: string
  date: string
}

export function CalendarPage() {
  const navigate = useNavigate()
  const rooms = useHotelStore((state) => state.rooms)
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const calendarOverrides = useHotelStore((state) => state.calendarOverrides)
  const setOverride = useHotelStore((state) => state.setOverride)
  const clearOverride = useHotelStore((state) => state.clearOverride)
  const [startDate, setStartDate] = useState(todayKey())
  const [detailId, setDetailId] = useState<string | undefined>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formRoomId, setFormRoomId] = useState<string | undefined>()
  const [formDate, setFormDate] = useState<string | undefined>()
  const [rateCell, setRateCell] = useState<RateCell | undefined>()
  const dates = useMemo(() => Array.from({ length: DAYS }, (_, index) => addDaysKey(startDate, index)), [startDate])

  const openForm = (roomId?: string, date?: string) => {
    setFormRoomId(roomId)
    setFormDate(date)
    setFormOpen(true)
  }

  const openDetail = (booking: Booking) => {
    setDetailId(booking.id)
    setDetailOpen(true)
  }

  const sortedRooms = useMemo(() => [...rooms].sort((a, b) => a.floor - b.floor || a.number.localeCompare(b.number)), [rooms])
  const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'no_show')
  const totalRoomNights = dates.reduce((sum, date) => sum + occupiedRoomIds(date, activeBookings).size, 0)
  const occupancy = Math.round((totalRoomNights / (rooms.length * DAYS)) * 100)
  const rangeLabel = `${formatDateVN(dates[0])} – ${formatDateVN(dates[dates.length - 1], 'dd/MM/yyyy')}`

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Lịch & tồn kho"
        title="Lịch phòng"
        description="Nhìn toàn bộ 14 ngày, phát hiện khoảng trống và xử lý đặt phòng ngay trên lịch."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/rooms')}><DoorOpen className="h-4 w-4" /> Quản lý phòng</Button>
            <Button onClick={() => openForm()}><CalendarPlus className="h-4 w-4" /> Đặt phòng</Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 rounded-3xl border border-sand-200/80 bg-white/45 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={() => setStartDate(addDaysKey(startDate, -7))} aria-label="Tuần trước"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => setStartDate(addDaysKey(startDate, 7))} aria-label="Tuần sau"><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setStartDate(todayKey())}>Hôm nay</Button>
          <span className="ml-1 font-display text-sm font-semibold text-ink-900 sm:ml-2">{rangeLabel}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="sea">{occupancy}% công suất 14 ngày</Badge>
          <Badge tone="gold">{totalRoomNights} đêm phòng đã bán</Badge>
          <Badge tone="neutral">{rooms.length} phòng</Badge>
        </div>
      </div>

      <Tabs defaultValue="timeline">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="timeline"><Clock3 className="h-3.5 w-3.5" /> Sơ đồ phòng</TabsTrigger>
            <TabsTrigger value="rates"><CircleDollarSign className="h-3.5 w-3.5" /> Giá & tồn</TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap items-center gap-2 text-[9px] text-ink-400">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sea-600" /> Đã xác nhận</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sage-600" /> Đang ở</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gold-500" /> Chờ</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sand-400" /> Đã trả</span>
          </div>
        </div>

        <TabsContent value="timeline">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[1240px]">
                <div className="flex border-b border-sand-200/80 bg-sand-100/40">
                  <div className="sticky left-0 z-20 w-44 shrink-0 border-r border-sand-200/80 bg-sand-100/80 px-4 py-3 backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">Phòng</p>
                    <p className="mt-0.5 text-[10px] text-ink-400">{rooms.length} phòng · 3 tầng</p>
                  </div>
                  <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${DAYS}, minmax(80px, 1fr))` }}>
                    {dates.map((date) => {
                      const isToday = date === todayKey()
                      const occupied = occupiedRoomIds(date, activeBookings).size
                      return (
                        <div key={date} className={cn('border-r border-sand-200/60 px-2 py-2.5 text-center last:border-r-0', isToday && 'bg-sea-100/60')}>
                          <p className={cn('text-[9px] font-semibold uppercase tracking-[0.08em]', isToday ? 'text-sea-700' : 'text-ink-400')}>
                            {format(parseISO(date), 'EEE', { locale: vi })}
                          </p>
                          <p className={cn('font-display text-lg font-semibold leading-none', isToday ? 'text-sea-900' : 'text-ink-900')}>{format(parseISO(date), 'dd')}</p>
                          <p className="mt-1 text-[9px] text-ink-400">{occupied}/{rooms.length}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {sortedRooms.map((room, roomIndex) => {
                  const type = roomTypes.find((item) => item.id === room.typeId)
                  const roomBookings = bookings.filter((booking) => {
                    if (booking.roomId !== room.id) return false
                    if (booking.status === 'cancelled' || booking.status === 'no_show') return false
                    return booking.checkOut > dates[0] && booking.checkIn <= dates[dates.length - 1]
                  })
                  return (
                    <div key={room.id} className={cn('flex border-b border-sand-200/60 last:border-b-0', roomIndex % 2 === 0 ? 'bg-white/25' : 'bg-transparent')}>
                      <button onClick={() => navigate(`/rooms/${room.id}`)} className="sticky left-0 z-20 w-44 shrink-0 border-r border-sand-200/80 bg-sand-50/95 px-4 py-3 text-left backdrop-blur transition hover:bg-white">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-display text-base font-semibold text-ink-900">{room.number}</p>
                          <span className={cn('h-2 w-2 rounded-full', room.status === 'occupied' ? 'bg-sea-600' : room.status === 'dirty' ? 'bg-gold-500' : room.status === 'maintenance' ? 'bg-terra-500' : 'bg-success-600')} />
                        </div>
                        <p className="truncate text-[10px] text-ink-500">{room.name}</p>
                        <p className="mt-0.5 truncate text-[9px] text-ink-400">{type?.name} · {ROOM_STATUS_LABELS[room.status]}</p>
                      </button>
                      <div className="relative grid flex-1" style={{ gridTemplateColumns: `repeat(${DAYS}, minmax(80px, 1fr))` }}>
                        {dates.map((date) => (
                          <button
                            key={date}
                            onClick={() => openForm(room.id, date)}
                            className={cn('min-h-[74px] border-r border-sand-200/50 transition hover:bg-sea-50/60 last:border-r-0', date === todayKey() && 'bg-sea-50/40')}
                            aria-label={`Đặt ${room.number} ngày ${date}`}
                          />
                        ))}
                        {roomBookings.map((booking) => {
                          const startOffset = Math.max(0, differenceInCalendarDays(parseISO(booking.checkIn), parseISO(dates[0])))
                          const endOffset = Math.min(DAYS, differenceInCalendarDays(parseISO(booking.checkOut), parseISO(dates[0])))
                          const guest = guests.find((item) => item.id === booking.guestId)
                          if (endOffset <= startOffset) return null
                          return (
                            <button
                              key={booking.id}
                              onClick={(event) => {
                                event.stopPropagation()
                                openDetail(booking)
                              }}
                              className={cn(
                                'absolute top-3 z-10 h-[46px] overflow-hidden rounded-xl px-2.5 text-left text-[10px] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                                BOOKING_BAR_CLASSES[booking.status],
                              )}
                              style={{
                                left: `calc(${(startOffset / DAYS) * 100}% + 3px)`,
                                width: `calc(${((endOffset - startOffset) / DAYS) * 100}% - 6px)`,
                              }}
                              title={`${guest?.name} · ${booking.code}`}
                            >
                              <span className="block truncate font-bold leading-tight">{guest?.name}</span>
                              <span className="mt-0.5 block truncate text-[9px] opacity-80">{Math.max(1, differenceInCalendarDays(parseISO(booking.checkOut), parseISO(booking.checkIn)))} đêm · {booking.adults + booking.children} khách</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-sand-200/70 bg-sand-100/30 px-4 py-2 text-[10px] text-ink-400">
              <span>Bấm ô trống để tạo booking · bấm booking để xem chi tiết</span>
              <span className="hidden sm:block">Kéo ngang để xem thêm ngày</span>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rates">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[1240px]">
                <div className="flex border-b border-sand-200/80 bg-sand-100/40">
                  <div className="sticky left-0 z-20 w-44 shrink-0 border-r border-sand-200/80 bg-sand-100/80 px-4 py-3 backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">Loại phòng</p>
                    <p className="mt-0.5 text-[10px] text-ink-400">Giá bán & tồn</p>
                  </div>
                  <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${DAYS}, minmax(80px, 1fr))` }}>
                    {dates.map((date) => (
                      <div key={date} className={cn('border-r border-sand-200/60 px-2 py-2.5 text-center last:border-r-0', date === todayKey() && 'bg-sea-100/60')}>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-400">{format(parseISO(date), 'EEE', { locale: vi })}</p>
                        <p className="font-display text-lg font-semibold leading-none text-ink-900">{format(parseISO(date), 'dd')}</p>
                        <p className={cn('mt-1 text-[9px]', isWeekendKey(date) ? 'font-semibold text-terra-600' : 'text-ink-400')}>{isWeekendKey(date) ? 'cuối tuần' : format(parseISO(date), 'MMM', { locale: vi })}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {roomTypes.map((type) => {
                  const typeRooms = rooms.filter((room) => room.typeId === type.id)
                  return (
                    <div key={type.id} className="flex border-b border-sand-200/60 last:border-b-0">
                      <div className="sticky left-0 z-20 w-44 shrink-0 border-r border-sand-200/80 bg-sand-50/95 px-4 py-3 backdrop-blur">
                        <p className="font-display text-sm font-semibold text-ink-900">{type.name}</p>
                        <p className="mt-0.5 text-[9px] text-ink-400">{typeRooms.length} phòng · {type.bed}</p>
                      </div>
                      <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${DAYS}, minmax(80px, 1fr))` }}>
                        {dates.map((date) => {
                          const override = calendarOverrides.find((item) => item.typeId === type.id && item.date === date)
                          const available = typeRooms.filter((room) => !activeBookings.some((booking) => booking.roomId === room.id && isBookingActiveOn(booking, date))).length
                          const price = rateForDate(type, date, calendarOverrides)
                          return (
                            <button
                              key={date}
                              onClick={() => setRateCell({ typeId: type.id, date })}
                              className={cn('group relative min-h-[70px] border-r border-sand-200/50 px-2 py-2 text-left transition hover:bg-sea-50/60 last:border-r-0', override?.closed && 'bg-terra-100/50', isWeekendKey(date) && !override?.closed && 'bg-gold-100/20')}
                            >
                              <p className={cn('text-[11px] font-bold', override?.closed ? 'text-terra-700 line-through' : 'text-ink-900')}>
                                {override?.closed ? 'Đóng' : formatMoney(price).replace('đ', '')}
                              </p>
                              <p className="mt-1 text-[9px] text-ink-400">{override?.closed ? 'không bán' : `còn ${available} phòng`}</p>
                              {override?.price && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-terra-500" title="Giá đã sửa" />}
                              <Pencil className="absolute bottom-2 right-2 h-3 w-3 text-ink-300 opacity-0 transition group-hover:opacity-100" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-sand-200/70 bg-gold-100/30 px-4 py-2 text-[10px] text-warning-600">
              <Info className="h-3.5 w-3.5" /> Giá cuối tuần tự động áp dụng. Bấm vào ô để đổi giá hoặc đóng bán từng ngày.
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <BookingDetailSheet bookingId={detailId} open={detailOpen} onOpenChange={setDetailOpen} />
      <BookingFormDialog open={formOpen} onOpenChange={setFormOpen} initialRoomId={formRoomId} initialDate={formDate} />
      <RateDialog cell={rateCell} onClose={() => setRateCell(undefined)} onSave={setOverride} onClear={clearOverride} />
    </div>
  )
}

function RateDialog({
  cell,
  onClose,
  onSave,
  onClear,
}: {
  cell?: RateCell
  onClose: () => void
  onSave: (typeId: string, date: string, patch: Omit<CalendarOverride, 'typeId' | 'date'>) => void
  onClear: (typeId: string, date: string) => void
}) {
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const calendarOverrides = useHotelStore((state) => state.calendarOverrides)
  const type = cell ? roomTypes.find((item) => item.id === cell.typeId) : undefined
  const override = cell ? calendarOverrides.find((item) => item.typeId === cell.typeId && item.date === cell.date) : undefined
  const [price, setPrice] = useState(0)
  const [closed, setClosed] = useState(false)

  const key = cell ? `${cell.typeId}:${cell.date}` : ''
  useEffect(() => {
    if (!cell || !type) return
    setPrice(override?.price ?? rateForDate(type, cell.date, calendarOverrides))
    setClosed(Boolean(override?.closed))
    // Only reset when the selected cell changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  if (!cell || !type) return null

  const save = () => {
    onSave(cell.typeId, cell.date, { price: closed ? undefined : price, closed })
    toast.success('Đã cập nhật giá & tồn')
    onClose()
  }

  return (
    <Dialog open={Boolean(cell)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Giá & tồn · {type.name}</DialogTitle>
          <DialogDescription>{formatDateVN(cell.date, 'EEEE, dd/MM/yyyy')} · {roomsForTypeText(roomTypes, type.id)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="rounded-2xl bg-sand-100/70 p-3 text-[11px] text-ink-500">
            Giá gốc: <span className="font-semibold text-ink-900">{formatMoney(type.basePrice)}</span> · Cuối tuần: <span className="font-semibold text-ink-900">{formatMoney(type.weekendPrice)}</span>
          </div>
          <Field label="Giá bán ngày này">
            <Input type="number" min={0} step={50_000} value={price} onChange={(event) => setPrice(Number(event.target.value))} disabled={closed} />
          </Field>
          <div className="flex items-center justify-between rounded-2xl border border-sand-200 bg-white/60 p-3">
            <div>
              <p className="text-xs font-semibold text-ink-900">Đóng bán ngày này</p>
              <p className="text-[10px] text-ink-400">Không nhận thêm booking cho loại phòng.</p>
            </div>
            <Switch checked={closed} onCheckedChange={setClosed} />
          </div>
          {override && (
            <button onClick={() => { onClear(cell.typeId, cell.date); toast.success('Đã xóa ghi đè'); onClose() }} className="text-[11px] font-semibold text-terra-700 hover:text-terra-600">
              Xóa ghi đè ngày này
            </button>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={save}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function roomsForTypeText(roomTypes: RoomType[], typeId: string) {
  const type = roomTypes.find((item) => item.id === typeId)
  return type ? `${type.size} m² · tối đa ${type.maxAdults} khách` : ''
}
