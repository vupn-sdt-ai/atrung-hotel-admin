import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BedDouble, CalendarDays, Search, UserRound, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'
import { useHotelStore } from '../../store/useHotelStore'
import { formatDateVN, formatMoney } from '../../lib/utils'
import { BOOKING_STATUS_LABELS } from '../../lib/constants'
import { BookingStatusBadge } from '../shared/status-badge'

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const rooms = useHotelStore((state) => state.rooms)

  useEffect(() => {
    if (open) {
      setQuery('')
      window.setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { bookings: [], guests: [], rooms: [] }
    const matchingGuests = guests.filter((guest) => `${guest.name} ${guest.phone} ${guest.email}`.toLowerCase().includes(q))
    const guestIds = new Set(matchingGuests.map((guest) => guest.id))
    return {
      bookings: bookings
        .filter((booking) => {
          const guest = guests.find((item) => item.id === booking.guestId)
          return `${booking.code} ${guest?.name ?? ''} ${guest?.phone ?? ''}`.toLowerCase().includes(q) || guestIds.has(booking.guestId)
        })
        .slice(0, 5),
      guests: matchingGuests.slice(0, 4),
      rooms: rooms.filter((room) => `${room.number} ${room.name} ${room.floorLabel}`.toLowerCase().includes(q)).slice(0, 4),
    }
  }, [query, bookings, guests, rooms])

  const hasResults = results.bookings.length + results.guests.length + results.rooms.length > 0

  const go = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!top-[8%] !translate-y-0 max-w-2xl p-0" hideClose>
        <DialogTitle className="sr-only">Tìm kiếm nhanh</DialogTitle>
        <div className="flex items-center gap-3 border-b border-sand-200/80 px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm booking, khách, số phòng, số điện thoại..."
            className="h-8 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />
          <button onClick={() => onOpenChange(false)} className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 hover:bg-sand-100 hover:text-ink-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query && (
            <div className="grid gap-1.5 p-2 sm:grid-cols-2">
              <button onClick={() => go('/bookings?new=1')} className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white/50 p-3 text-left transition hover:bg-white">
                <CalendarDays className="h-4 w-4 text-sea-600" />
                <span>
                  <span className="block text-xs font-semibold text-ink-900">Tạo booking mới</span>
                  <span className="text-[10px] text-ink-400">Đặt phòng nhanh</span>
                </span>
              </button>
              <button onClick={() => go('/front-desk')} className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white/50 p-3 text-left transition hover:bg-white">
                <BedDouble className="h-4 w-4 text-sea-600" />
                <span>
                  <span className="block text-xs font-semibold text-ink-900">Lễ tân hôm nay</span>
                  <span className="text-[10px] text-ink-400">Check-in / check-out</span>
                </span>
              </button>
            </div>
          )}

          {query && !hasResults && (
            <div className="px-4 py-10 text-center">
              <p className="font-display text-lg font-semibold text-ink-900">Không tìm thấy kết quả</p>
              <p className="mt-1 text-xs text-ink-500">Thử tên khách, số điện thoại hoặc mã booking.</p>
            </div>
          )}

          {results.bookings.length > 0 && (
            <div className="p-2">
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">Booking</p>
              {results.bookings.map((booking) => {
                const guest = guests.find((item) => item.id === booking.guestId)
                const room = rooms.find((item) => item.id === booking.roomId)
                return (
                  <button
                    key={booking.id}
                    onClick={() => go(`/bookings?booking=${booking.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-sand-100"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-sea-100 text-sea-700">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-xs font-semibold text-ink-900">{guest?.name ?? 'Khách'}</span>
                        <span className="text-[10px] font-medium text-ink-400">{booking.code}</span>
                      </span>
                      <span className="mt-0.5 block text-[11px] text-ink-500">
                        {room?.number} · {formatDateVN(booking.checkIn)} → {formatDateVN(booking.checkOut)} · {formatMoney(booking.total)}
                      </span>
                    </span>
                    <BookingStatusBadge status={booking.status} className="hidden sm:inline-flex" />
                    <span className="sr-only">{BOOKING_STATUS_LABELS[booking.status]}</span>
                  </button>
                )
              })}
            </div>
          )}

          {results.guests.length > 0 && (
            <div className="p-2">
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">Khách</p>
              {results.guests.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => go(`/guests?guest=${guest.id}`)}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-sand-100"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-terra-100 text-terra-700">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-ink-900">{guest.name}</span>
                    <span className="text-[11px] text-ink-500">{guest.phone} · {guest.nationality}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {results.rooms.length > 0 && (
            <div className="p-2">
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">Phòng</p>
              {results.rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => go(`/rooms/${room.id}`)}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-sand-100"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-sage-200 text-sea-900">
                    <BedDouble className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-ink-900">{room.number} · {room.name}</span>
                    <span className="text-[11px] text-ink-500">{room.floorLabel}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-sand-200/80 px-4 py-2.5 text-[10px] text-ink-400">
          <span>Enter để mở kết quả đầu tiên</span>
          <span className="rounded-md border border-sand-200 bg-white px-1.5 py-0.5 font-mono">ESC</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
