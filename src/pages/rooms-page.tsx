import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BedDouble, CalendarRange, CheckCircle2, DoorOpen, Sparkles, Users } from 'lucide-react'
import { useHotelStore } from '../store/useHotelStore'
import { formatMoney, todayKey } from '../lib/utils'
import { ROOM_STATUS_LABELS } from '../lib/constants'
import { PageHeader } from '../components/shared/page-header'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { StatCard } from '../components/shared/data-display'
import { HousekeepingBadge, RoomStatusBadge } from '../components/shared/status-badge'
import { cn } from '../lib/utils'

export function RoomsPage() {
  const navigate = useNavigate()
  const rooms = useHotelStore((state) => state.rooms)
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'dirty'>('all')

  const stats = useMemo(() => ({
    occupied: rooms.filter((room) => room.status === 'occupied').length,
    available: rooms.filter((room) => room.status === 'available').length,
    dirty: rooms.filter((room) => room.status === 'dirty').length,
  }), [rooms])

  const filtered = rooms.filter((room) => filter === 'all' || room.status === filter)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Room management"
        title="Phòng & không gian"
        description="7 phòng, 4 loại phòng. Xem trạng thái, ảnh, giá bán và chỉnh sửa thông tin từng phòng."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/calendar')}><CalendarRange className="h-4 w-4" /> Lịch phòng</Button>
            <Button onClick={() => navigate('/settings')}><DoorOpen className="h-4 w-4" /> Cài đặt phòng</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Tổng phòng" value={`${rooms.length}`} sub="3 tầng" icon={BedDouble} />
        <StatCard label="Đang ở" value={`${stats.occupied}`} sub="khách đang lưu trú" icon={Users} tone="sage" />
        <StatCard label="Còn trống" value={`${stats.available}`} sub="sẵn sàng bán" icon={CheckCircle2} tone="gold" />
        <StatCard label="Cần dọn" value={`${stats.dirty}`} sub="ưu tiên buồng phòng" icon={Sparkles} tone="terra" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-sand-200/80 bg-white/45 p-2">
        {[
          { id: 'all', label: 'Tất cả', count: rooms.length },
          { id: 'available', label: 'Còn trống', count: stats.available },
          { id: 'occupied', label: 'Đang ở', count: stats.occupied },
          { id: 'dirty', label: 'Cần dọn', count: stats.dirty },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as typeof filter)}
            className={cn(
              'rounded-xl px-3 py-2 text-[11px] font-semibold transition',
              filter === item.id ? 'bg-sea-700 text-sand-50' : 'text-ink-500 hover:bg-white',
            )}
          >
            {item.label} <span className="ml-1 opacity-60">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((room) => {
          const type = roomTypes.find((item) => item.id === room.typeId)
          const activeBooking = bookings.find((booking) => booking.roomId === room.id && booking.status === 'checked_in' && booking.checkIn <= todayKey() && booking.checkOut > todayKey())
          const guest = activeBooking ? guests.find((item) => item.id === activeBooking.guestId) : undefined
          return (
            <Card key={room.id} className="group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <button onClick={() => navigate(`/rooms/${room.id}`)} className="relative block aspect-[16/10] w-full overflow-hidden text-left">
                <img src={room.coverImage ?? type?.images[0]} alt={`${room.number} · ${room.name}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-ink-900/10 to-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-1.5">
                  <RoomStatusBadge status={room.status} />
                  <Badge className="border-white/20 bg-white/15 text-white backdrop-blur">{room.floorLabel}</Badge>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="font-display text-3xl font-semibold leading-none text-white">{room.number}</p>
                      <p className="mt-1 text-xs font-medium text-white/80">{room.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-[0.1em] text-white/60">từ</p>
                      <p className="font-display text-lg font-semibold text-white">{formatMoney(type?.basePrice ?? 0)}</p>
                    </div>
                  </div>
                </div>
              </button>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-ink-900">{type?.name}</p>
                  <HousekeepingBadge status={room.housekeeping} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-ink-500">
                  <span className="inline-flex items-center gap-1"><BedDouble className="h-3 w-3" /> {type?.bed}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {type?.maxAdults} khách</span>
                  <span>{type?.size} m²</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-sand-200/70 pt-3">
                  <p className="truncate text-[10px] text-ink-500">{guest ? `Khách: ${guest.name}` : ROOM_STATUS_LABELS[room.status]}</p>
                  <button onClick={() => navigate(`/rooms/${room.id}`)} className="text-[10px] font-semibold text-sea-700 transition hover:text-sea-900">Chi tiết →</button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
