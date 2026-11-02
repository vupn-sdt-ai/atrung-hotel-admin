import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarPlus, Globe2, Search, UserPlus, Users } from 'lucide-react'
import { useHotelStore } from '../store/useHotelStore'
import { formatDateVN, formatMoney, formatMoneyShort } from '../lib/utils'
import { PageHeader } from '../components/shared/page-header'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/field'
import { Badge } from '../components/ui/badge'
import { Avatar } from '../components/ui/primitives'
import { StatCard, EmptyState } from '../components/shared/data-display'
import { GuestDetailSheet } from '../components/guests/guest-detail-sheet'

export function GuestsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const guests = useHotelStore((state) => state.guests)
  const bookings = useHotelStore((state) => state.bookings)
  const [search, setSearch] = useState('')
  const [guestId, setGuestId] = useState<string | undefined>()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const id = searchParams.get('guest')
    if (id) {
      setGuestId(id)
      setOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('guest')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const enriched = useMemo(() => guests.map((guest) => {
    const history = bookings.filter((booking) => booking.guestId === guest.id)
    const valid = history.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'no_show')
    return {
      ...guest,
      stays: valid.length,
      spent: valid.reduce((sum, booking) => sum + booking.paid, 0),
      lastStay: history.sort((a, b) => b.checkIn.localeCompare(a.checkIn))[0],
    }
  }), [guests, bookings])

  const filtered = enriched.filter((guest) => {
    const q = search.trim().toLowerCase()
    return !q || `${guest.name} ${guest.phone} ${guest.email} ${guest.nationality}`.toLowerCase().includes(q)
  })

  const stats = useMemo(() => ({
    total: guests.length,
    returning: guests.filter((guest) => guest.tags.includes('Khách quen')).length,
    international: guests.filter((guest) => guest.nationality !== 'Việt Nam').length,
    spent: enriched.reduce((sum, guest) => sum + guest.spent, 0),
  }), [guests, enriched])

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Guest CRM"
        title="Khách"
        description="Hồ sơ khách, lịch sử lưu trú và chi tiêu — đủ để nhớ điều khách thích."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/bookings?new=1')}><CalendarPlus className="h-4 w-4" /> Đặt phòng</Button>
            <Button onClick={() => navigate('/bookings?new=1')}><UserPlus className="h-4 w-4" /> Thêm khách</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Tổng khách" value={`${stats.total}`} sub="hồ sơ đã lưu" icon={Users} />
        <StatCard label="Khách quen" value={`${stats.returning}`} sub="quay lại lưu trú" icon={Users} tone="sage" />
        <StatCard label="Khách quốc tế" value={`${stats.international}`} sub="hồ sơ nước ngoài" icon={Globe2} tone="gold" />
        <StatCard label="Tổng chi tiêu" value={formatMoneyShort(stats.spent)} sub={`${formatMoney(stats.spent)} · tất cả khách`} icon={Users} tone="terra" />
      </div>

      <Card>
        <div className="border-b border-sand-200/70 p-4 sm:p-5">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, số điện thoại, quốc tịch..." className="pl-9" />
          </div>
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="border-b border-sand-200/70 bg-sand-100/30 text-[10px] uppercase tracking-[0.12em] text-ink-400">
                <th className="px-5 py-3 font-semibold">Khách</th>
                <th className="px-3 py-3 font-semibold">Liên hệ</th>
                <th className="px-3 py-3 font-semibold">Quốc tịch</th>
                <th className="px-3 py-3 text-center font-semibold">Lần ở</th>
                <th className="px-3 py-3 text-right font-semibold">Chi tiêu</th>
                <th className="px-3 py-3 font-semibold">Gần nhất</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((guest) => (
                <tr key={guest.id} onClick={() => { setGuestId(guest.id); setOpen(true) }} className="group cursor-pointer border-b border-sand-200/50 transition hover:bg-white/55 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={guest.name} size="sm" />
                      <div>
                        <p className="font-semibold text-ink-900">{guest.name}</p>
                        <div className="mt-0.5 flex gap-1">{guest.tags.slice(0, 2).map((tag) => <Badge key={tag} tone="neutral" className="px-1.5 py-0.5 text-[8px]">{tag}</Badge>)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-600"><p>{guest.phone}</p><p className="text-[10px] text-ink-400">{guest.email}</p></td>
                  <td className="px-3 py-3 text-ink-600">{guest.nationality}</td>
                  <td className="px-3 py-3 text-center font-semibold text-ink-900">{guest.stays}</td>
                  <td className="px-3 py-3 text-right font-semibold text-ink-900">{formatMoney(guest.spent)}</td>
                  <td className="px-3 py-3 text-ink-500">{guest.lastStay ? formatDateVN(guest.lastStay.checkIn) : '—'}</td>
                  <td className="px-5 py-3 text-right"><span className="text-[11px] font-semibold text-sea-700 opacity-0 transition group-hover:opacity-100">Mở →</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 p-3 sm:hidden">
          {filtered.map((guest) => (
            <button key={guest.id} onClick={() => { setGuestId(guest.id); setOpen(true) }} className="flex w-full items-center gap-3 rounded-2xl border border-sand-200/70 bg-white/45 p-3 text-left">
              <Avatar name={guest.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink-900">{guest.name}</p>
                <p className="text-[10px] text-ink-500">{guest.phone} · {guest.nationality}</p>
                <p className="text-[9px] text-ink-400">{guest.stays} lần ở · {formatMoney(guest.spent)}</p>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && <div className="p-5"><EmptyState icon={Users} title="Không tìm thấy khách" description="Thử từ khóa khác hoặc tạo booking mới." action={<Button variant="outline" onClick={() => setSearch('')}>Xóa tìm kiếm</Button>} /></div>}
        <div className="border-t border-sand-200/70 px-4 py-2.5 text-[10px] text-ink-400">Hiển thị {filtered.length} khách · dữ liệu mẫu</div>
      </Card>

      <GuestDetailSheet guestId={guestId} open={open} onOpenChange={setOpen} />
    </div>
  )
}
