import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarCheck2, CalendarPlus, CircleDollarSign, Filter, Search, Users, WalletCards } from 'lucide-react'
import { useHotelStore } from '../store/useHotelStore'
import { BOOKING_STATUS_LABELS, SOURCE_LABELS } from '../lib/constants'
import { bookingBalance, cn, formatDateVN, formatMoney, todayKey } from '../lib/utils'
import type { BookingStatus } from '../types'
import { PageHeader } from '../components/shared/page-header'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input, Select } from '../components/ui/field'
import { Badge } from '../components/ui/badge'
import { StatCard, EmptyState } from '../components/shared/data-display'
import { BookingStatusBadge } from '../components/shared/status-badge'
import { BookingDetailSheet } from '../components/bookings/booking-detail-sheet'
import { BookingFormDialog } from '../components/bookings/booking-form-dialog'

export function BookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const rooms = useHotelStore((state) => state.rooms)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get('status') ?? 'all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(10)
  const [detailId, setDetailId] = useState<string | undefined>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [walkin, setWalkin] = useState(false)
  const today = todayKey()

  useEffect(() => {
    const newParam = searchParams.get('new')
    const bookingParam = searchParams.get('booking')
    if (newParam) {
      setWalkin(searchParams.get('walkin') === '1')
      setFormOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      next.delete('walkin')
      setSearchParams(next, { replace: true })
    }
    if (bookingParam) {
      setDetailId(bookingParam)
      setDetailOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('booking')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bookings
      .filter((booking) => {
        const guest = guests.find((item) => item.id === booking.guestId)
        const room = rooms.find((item) => item.id === booking.roomId)
        const matchesSearch = !q || `${booking.code} ${guest?.name ?? ''} ${guest?.phone ?? ''} ${room?.number ?? ''}`.toLowerCase().includes(q)
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
        const matchesSource = sourceFilter === 'all' || booking.source === sourceFilter
        return matchesSearch && matchesStatus && matchesSource
      })
      .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
  }, [bookings, guests, rooms, search, statusFilter, sourceFilter])

  const stats = useMemo(() => {
    const arrivals = bookings.filter((booking) => booking.checkIn === today && (booking.status === 'confirmed' || booking.status === 'pending'))
    const inHouse = bookings.filter((booking) => booking.status === 'checked_in')
    const unpaid = bookings.filter((booking) => (booking.status === 'checked_in' || booking.status === 'checked_out') && bookingBalance(booking.total, booking.paid) > 0)
    const cancelled = bookings.filter((booking) => booking.status === 'cancelled' || booking.status === 'no_show')
    return { arrivals, inHouse, unpaid, cancelled }
  }, [bookings, today])

  const openDetail = (id: string) => {
    setDetailId(id)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Booking management"
        title="Đặt phòng"
        description="Tìm, lọc và xử lý toàn bộ booking trong một nơi. Booking mới sẽ tự kiểm tra tồn phòng."
        actions={<Button onClick={() => { setWalkin(false); setFormOpen(true) }}><CalendarPlus className="h-4 w-4" /> Đặt phòng mới</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Tổng booking" value={`${bookings.length}`} sub="tất cả trạng thái" icon={CalendarCheck2} />
        <StatCard label="Khách đến hôm nay" value={`${stats.arrivals.length}`} sub="cần check-in" icon={Users} tone="sage" />
        <StatCard label="Đang lưu trú" value={`${stats.inHouse.length}`} sub="khách đang ở" icon={WalletCards} tone="gold" />
        <StatCard label="Còn công nợ" value={`${stats.unpaid.length}`} sub="booking chưa thu đủ" icon={CircleDollarSign} tone="terra" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-sand-200/70 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên khách, số điện thoại, mã booking..." className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 text-[10px] text-ink-400 sm:flex"><Filter className="h-3.5 w-3.5" /> Lọc</div>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-36">
              <option value="all">Mọi trạng thái</option>
              {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
            <Select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} className="w-32">
              <option value="all">Mọi nguồn</option>
              {Object.entries(SOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </div>
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead>
              <tr className="border-b border-sand-200/70 bg-sand-100/30 text-[10px] uppercase tracking-[0.12em] text-ink-400">
                <th className="px-5 py-3 font-semibold">Khách / mã</th>
                <th className="px-3 py-3 font-semibold">Phòng</th>
                <th className="px-3 py-3 font-semibold">Lưu trú</th>
                <th className="px-3 py-3 font-semibold">Nguồn</th>
                <th className="px-3 py-3 text-right font-semibold">Tổng</th>
                <th className="px-3 py-3 text-right font-semibold">Còn lại</th>
                <th className="px-3 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, visibleCount).map((booking) => {
                const guest = guests.find((item) => item.id === booking.guestId)
                const room = rooms.find((item) => item.id === booking.roomId)
                const balance = bookingBalance(booking.total, booking.paid)
                return (
                  <tr key={booking.id} onClick={() => openDetail(booking.id)} className="group cursor-pointer border-b border-sand-200/50 transition hover:bg-white/55 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-ink-900">{guest?.name ?? 'Khách'}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-ink-400">{booking.code}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink-800">{room?.number}</p>
                      <p className="text-[10px] text-ink-400">{room?.name}</p>
                    </td>
                    <td className="px-3 py-3 text-ink-600">
                      <p>{formatDateVN(booking.checkIn)} → {formatDateVN(booking.checkOut)}</p>
                      <p className="text-[10px] text-ink-400">{booking.adults} người lớn · {booking.children} trẻ em</p>
                    </td>
                    <td className="px-3 py-3"><Badge tone="neutral">{SOURCE_LABELS[booking.source]}</Badge></td>
                    <td className="px-3 py-3 text-right font-semibold text-ink-900">{formatMoney(booking.total)}</td>
                    <td className={cn('px-3 py-3 text-right font-semibold', balance > 0 ? 'text-terra-700' : 'text-success-600')}>{formatMoney(balance)}</td>
                    <td className="px-3 py-3"><BookingStatusBadge status={booking.status as BookingStatus} /></td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-[11px] font-semibold text-sea-700 opacity-0 transition group-hover:opacity-100">Mở →</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 p-3 sm:hidden">
          {filtered.slice(0, visibleCount).map((booking) => {
            const guest = guests.find((item) => item.id === booking.guestId)
            const room = rooms.find((item) => item.id === booking.roomId)
            const balance = bookingBalance(booking.total, booking.paid)
            return (
              <button key={booking.id} onClick={() => openDetail(booking.id)} className="w-full rounded-2xl border border-sand-200/70 bg-white/45 p-3 text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-ink-900">{guest?.name}</p>
                    <p className="mt-0.5 font-mono text-[9px] text-ink-400">{booking.code}</p>
                  </div>
                  <BookingStatusBadge status={booking.status as BookingStatus} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-ink-500">
                  <span>{room?.number} · {formatDateVN(booking.checkIn)} → {formatDateVN(booking.checkOut)}</span>
                  <span className={cn('font-semibold', balance > 0 ? 'text-terra-700' : 'text-success-600')}>{formatMoney(balance)}</span>
                </div>
              </button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-5">
            <EmptyState icon={CalendarCheck2} title="Không có booking phù hợp" description="Thử đổi từ khóa hoặc bộ lọc trạng thái." action={<Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); setSourceFilter('all') }}>Xóa bộ lọc</Button>} />
          </div>
        )}

        {filtered.length > visibleCount && (
          <div className="flex justify-center border-t border-sand-200/70 p-4">
            <Button variant="outline" onClick={() => setVisibleCount((count) => count + 10)}>Xem thêm {filtered.length - visibleCount} booking</Button>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-sand-200/70 px-4 py-2.5 text-[10px] text-ink-400">
          <span>Hiển thị {Math.min(visibleCount, filtered.length)} / {filtered.length} booking</span>
          <span className="hidden sm:block">Dữ liệu mẫu · lưu trên thiết bị</span>
        </div>
      </Card>

      <BookingDetailSheet bookingId={detailId} open={detailOpen} onOpenChange={setDetailOpen} />
      <BookingFormDialog
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setWalkin(false) }}
        initialSource={walkin ? 'walkin' : 'direct'}
        onSaved={(booking) => { setDetailId(booking.id); setDetailOpen(true) }}
      />
    </div>
  )
}
