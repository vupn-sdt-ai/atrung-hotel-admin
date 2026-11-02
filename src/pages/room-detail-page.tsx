import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BedDouble, CalendarPlus, CheckCircle2, Edit3, Maximize2, Mountain, Sparkles, Users, Wifi } from 'lucide-react'
import { toast } from 'sonner'
import { useHotelStore } from '../store/useHotelStore'
import { bookingBalance, cn, formatDateVN, formatMoney, todayKey } from '../lib/utils'
import { HOUSEKEEPING_LABELS, ROOM_STATUS_LABELS } from '../lib/constants'
import type { RoomStatus } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { HousekeepingBadge, RoomStatusBadge } from '../components/shared/status-badge'
import { InfoRow, EmptyState } from '../components/shared/data-display'
import { BookingDetailSheet } from '../components/bookings/booking-detail-sheet'
import { BookingFormDialog } from '../components/bookings/booking-form-dialog'
import { RoomEditDialog } from '../components/rooms/room-edit-dialog'

export function RoomDetailPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const rooms = useHotelStore((state) => state.rooms)
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const tasks = useHotelStore((state) => state.tasks)
  const updateRoom = useHotelStore((state) => state.updateRoom)
  const room = rooms.find((item) => item.id === roomId)
  const type = room ? roomTypes.find((item) => item.id === room.typeId) : undefined
  const gallery = room && type ? [room.coverImage, ...type.images].filter((image, index, list): image is string => Boolean(image) && list.indexOf(image) === index) : []
  const [activeImage, setActiveImage] = useState(room?.coverImage ?? type?.images[0] ?? '')
  const [detailId, setDetailId] = useState<string | undefined>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    setActiveImage(room?.coverImage ?? type?.images[0] ?? '')
  }, [roomId, type?.id])

  const roomBookings = useMemo(
    () => bookings.filter((booking) => booking.roomId === roomId && booking.status !== 'cancelled' && booking.status !== 'no_show' && booking.checkOut >= todayKey()).sort((a, b) => a.checkIn.localeCompare(b.checkIn)),
    [bookings, roomId],
  )
  const roomTasks = tasks.filter((task) => task.roomId === roomId)
  const currentBooking = roomBookings.find((booking) => booking.status === 'checked_in' && booking.checkIn <= todayKey() && booking.checkOut > todayKey())
  const currentGuest = currentBooking ? guests.find((guest) => guest.id === currentBooking.guestId) : undefined

  if (!room || !type) {
    return (
      <div className="py-16">
        <EmptyState icon={BedDouble} title="Không tìm thấy phòng" description="Phòng có thể đã bị xoá hoặc đường dẫn không đúng." action={<Button onClick={() => navigate('/rooms')}>Về danh sách phòng</Button>} />
      </div>
    )
  }

  const setStatus = (status: RoomStatus) => {
    updateRoom(room.id, { status })
    toast.success(`Đã chuyển ${room.number} sang ${ROOM_STATUS_LABELS[status]}`)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button onClick={() => navigate('/rooms')} className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-500 transition hover:text-sea-700">
            <ArrowLeft className="h-3.5 w-3.5" /> Tất cả phòng
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sea-600">{room.floorLabel} · {type.name}</p>
            <RoomStatusBadge status={room.status} />
            <HousekeepingBadge status={room.housekeeping} />
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] text-ink-900">
            {room.number} <span className="text-2xl text-ink-400">· {room.name}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">{type.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}><Edit3 className="h-4 w-4" /> Chỉnh sửa</Button>
          <Button onClick={() => setFormOpen(true)}><CalendarPlus className="h-4 w-4" /> Đặt phòng</Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-sand-200">
              <img src={activeImage} alt={`${room.number} · ${room.name}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">A Trung Homestay</p>
                  <p className="font-display text-xl font-semibold text-white">{type.name}</p>
                </div>
                <Badge className="border-white/20 bg-white/15 text-white backdrop-blur"><Maximize2 className="h-3 w-3" /> {type.size} m²</Badge>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 p-3">
              {gallery.map((image) => (
                <button key={image} onClick={() => setActiveImage(image)} className={cn('aspect-[4/3] overflow-hidden rounded-xl border-2 transition', activeImage === image ? 'border-sea-500' : 'border-transparent opacity-70 hover:opacity-100')}>
                  <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin phòng</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Maximize2, label: 'Diện tích', value: `${type.size} m²` },
                  { icon: BedDouble, label: 'Giường', value: type.bed },
                  { icon: Users, label: 'Sức chứa', value: `${type.maxAdults} lớn · ${type.maxChildren} nhỏ` },
                  { icon: Mountain, label: 'Tầng', value: room.floorLabel },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-sand-100/60 p-3">
                    <item.icon className="h-4 w-4 text-sea-600" />
                    <p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-ink-400">{item.label}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-ink-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">Tiện nghi</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {type.amenities.map((amenity) => (
                    <Badge key={amenity} tone="neutral" className="gap-1"><Wifi className="h-3 w-3 text-sea-600" /> {amenity}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Booking của phòng</CardTitle>
                <p className="mt-1 text-xs text-ink-500">Các booking sắp tới và đang lưu trú.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-3">
              {roomBookings.length === 0 ? (
                <EmptyState icon={CalendarPlus} title="Chưa có booking" description="Phòng đang trống, có thể đặt ngay." className="border-0 bg-transparent py-6" />
              ) : (
                roomBookings.slice(0, 6).map((booking) => {
                  const guest = guests.find((item) => item.id === booking.guestId)
                  const balance = bookingBalance(booking.total, booking.paid)
                  return (
                    <button key={booking.id} onClick={() => { setDetailId(booking.id); setDetailOpen(true) }} className="flex w-full items-center gap-3 rounded-2xl border border-sand-200/70 bg-white/45 p-3 text-left transition hover:bg-white">
                      <span className={cn('grid h-9 w-9 place-items-center rounded-xl text-[10px] font-bold', booking.status === 'checked_in' ? 'bg-sage-200 text-sea-900' : 'bg-sea-100 text-sea-800')}>
                        {formatDateVN(booking.checkIn, 'dd')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-ink-900">{guest?.name}</span>
                        <span className="mt-0.5 block text-[10px] text-ink-500">{formatDateVN(booking.checkIn)} → {formatDateVN(booking.checkOut)} · {booking.adults + booking.children} khách</span>
                      </span>
                      <span className={cn('text-right text-[10px] font-semibold', balance > 0 ? 'text-terra-700' : 'text-success-600')}>{formatMoney(balance)}</span>
                    </button>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="bg-sea-900 text-sand-50">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sand-200/60">Giá bán</p>
              <div className="mt-2 flex items-end gap-2">
                <p className="font-display text-3xl font-semibold">{formatMoney(type.basePrice)}</p>
                <span className="pb-1 text-[10px] text-sand-200/60">/ đêm</span>
              </div>
              <p className="mt-1 text-[11px] text-sand-200/65">Cuối tuần {formatMoney(type.weekendPrice)} · đã gồm thuế</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/10 p-2.5"><p className="text-[9px] text-sand-200/60">Hiện tại</p><p className="mt-1 text-xs font-semibold">{currentGuest?.name ?? 'Phòng trống'}</p></div>
                <div className="rounded-xl bg-white/10 p-2.5"><p className="text-[9px] text-sand-200/60">Buồng phòng</p><p className="mt-1 text-xs font-semibold">{HOUSEKEEPING_LABELS[room.housekeeping]}</p></div>
              </div>
              <Button className="mt-3 w-full bg-sand-50 text-sea-900 hover:bg-sand-100" onClick={() => setEditOpen(true)}><Edit3 className="h-4 w-4" /> Đổi giá & thông tin</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Trạng thái phòng</CardTitle></CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-2 gap-2">
                {(['available', 'occupied', 'dirty', 'maintenance'] as RoomStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatus(status)}
                    className={cn('rounded-xl border px-3 py-2.5 text-[11px] font-semibold transition', room.status === status ? 'border-sea-300 bg-sea-100 text-sea-800' : 'border-sand-200 bg-white/40 text-ink-500 hover:bg-white')}
                  >
                    {ROOM_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-1.5">
                <InfoRow label="Tầng" value={room.floorLabel} />
                <InfoRow label="Loại phòng" value={type.name} />
                <InfoRow label="Mã phòng" value={<span className="font-mono">{room.id}</span>} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Việc buồng phòng</CardTitle>
                <p className="mt-1 text-xs text-ink-500">{roomTasks.filter((task) => task.status !== 'done').length} việc đang mở.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-3">
              {roomTasks.length === 0 ? (
                <p className="rounded-2xl bg-sand-100/60 p-3 text-[11px] text-ink-500">Chưa có việc nào cho phòng này.</p>
              ) : (
                roomTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-sand-200/70 bg-white/45 p-3">
                    <div className="flex items-start gap-2">
                      {task.status === 'done' ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-success-600" /> : <Sparkles className="mt-0.5 h-4 w-4 text-gold-600" />}
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-ink-900">{task.title}</p>
                        <p className="mt-0.5 text-[10px] text-ink-500">{task.assignee} · {task.status === 'done' ? 'Hoàn tất' : task.status === 'doing' ? 'Đang làm' : 'Cần làm'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BookingDetailSheet bookingId={detailId} open={detailOpen} onOpenChange={setDetailOpen} />
      <BookingFormDialog open={formOpen} onOpenChange={setFormOpen} initialRoomId={room.id} initialDate={todayKey()} />
      <RoomEditDialog roomId={room.id} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
