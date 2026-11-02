import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CircleDollarSign, Download, ReceiptText, Search, WalletCards } from 'lucide-react'
import { useHotelStore } from '../store/useHotelStore'
import { bookingBalance, cn, formatDateVN, formatMoney, formatMoneyShort } from '../lib/utils'
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from '../lib/constants'
import { PageHeader } from '../components/shared/page-header'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input, Select } from '../components/ui/field'
import { Badge } from '../components/ui/badge'
import { StatCard, EmptyState } from '../components/shared/data-display'
import { BookingStatusBadge } from '../components/shared/status-badge'
import { PaymentDialog } from '../components/bookings/payment-dialog'
import { InvoiceDialog } from '../components/bookings/invoice-dialog'

export function PaymentsPage() {
  const navigate = useNavigate()
  const bookings = useHotelStore((state) => state.bookings)
  const guests = useHotelStore((state) => state.guests)
  const rooms = useHotelStore((state) => state.rooms)
  const payments = useHotelStore((state) => state.payments)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(10)
  const [paymentId, setPaymentId] = useState<string | undefined>()
  const [invoiceId, setInvoiceId] = useState<string | undefined>()

  const rows = useMemo(() => bookings
    .filter((booking) => booking.status !== 'cancelled' && booking.status !== 'no_show')
    .map((booking) => {
      const guest = guests.find((item) => item.id === booking.guestId)
      const room = rooms.find((item) => item.id === booking.roomId)
      const balance = bookingBalance(booking.total, booking.paid)
      const status = balance <= 0 ? 'paid' : booking.paid > 0 ? 'partial' : 'unpaid'
      const lastPayment = payments.filter((payment) => payment.bookingId === booking.id).sort((a, b) => b.date.localeCompare(a.date))[0]
      return { booking, guest, room, balance, status, lastPayment }
    })
    .filter((row) => {
      const q = search.trim().toLowerCase()
      const matchesSearch = !q || `${row.guest?.name ?? ''} ${row.booking.code} ${row.room?.number ?? ''}`.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => b.booking.checkIn.localeCompare(a.booking.checkIn)), [bookings, guests, rooms, payments, search, statusFilter])

  const stats = useMemo(() => {
    const total = payments.reduce((sum, payment) => sum + (payment.type === 'refund' ? -payment.amount : payment.amount), 0)
    const outstanding = bookings.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'no_show').reduce((sum, booking) => sum + bookingBalance(booking.total, booking.paid), 0)
    const refunds = payments.filter((payment) => payment.type === 'refund').reduce((sum, payment) => sum + payment.amount, 0)
    return { total, outstanding, refunds, count: payments.length }
  }, [bookings, payments])

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Folio & payments"
        title="Thanh toán & hóa đơn"
        description="Theo dõi tiền đã thu, công nợ và in hóa đơn nội bộ cho khách."
        actions={<Button variant="outline" onClick={() => navigate('/reports')}><Download className="h-4 w-4" /> Báo cáo doanh thu</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Đã thu" value={formatMoneyShort(stats.total)} sub={`${formatMoney(stats.total)} · toàn bộ giao dịch`} icon={WalletCards} />
        <StatCard label="Còn phải thu" value={formatMoneyShort(stats.outstanding)} sub={`${formatMoney(stats.outstanding)} · công nợ hiện tại`} icon={CircleDollarSign} tone="terra" />
        <StatCard label="Đã hoàn" value={formatMoneyShort(stats.refunds)} sub={`${formatMoney(stats.refunds)} · giao dịch hoàn tiền`} icon={ReceiptText} tone="gold" />
        <StatCard label="Giao dịch" value={`${stats.count}`} sub="phiếu thu đã ghi" icon={ReceiptText} tone="sage" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-sand-200/70 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm khách, mã booking, số phòng..." className="pl-9" />
          </div>
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-40">
            <option value="all">Mọi trạng thái</option>
            <option value="paid">Đã thu đủ</option>
            <option value="partial">Thu một phần</option>
            <option value="unpaid">Chưa thu</option>
          </Select>
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead>
              <tr className="border-b border-sand-200/70 bg-sand-100/30 text-[10px] uppercase tracking-[0.12em] text-ink-400">
                <th className="px-5 py-3 font-semibold">Khách / booking</th>
                <th className="px-3 py-3 font-semibold">Phòng</th>
                <th className="px-3 py-3 text-right font-semibold">Tổng</th>
                <th className="px-3 py-3 text-right font-semibold">Đã thu</th>
                <th className="px-3 py-3 text-right font-semibold">Còn lại</th>
                <th className="px-3 py-3 font-semibold">Gần nhất</th>
                <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, visibleCount).map((row) => (
                <tr key={row.booking.id} className="border-b border-sand-200/50 transition hover:bg-white/55 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-ink-900">{row.guest?.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-ink-400">{row.booking.code}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-ink-800">{row.room?.number}</p>
                    <div className="mt-1"><BookingStatusBadge status={row.booking.status} /></div>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-ink-900">{formatMoney(row.booking.total)}</td>
                  <td className="px-3 py-3 text-right font-semibold text-success-600">{formatMoney(row.booking.paid)}</td>
                  <td className={cn('px-3 py-3 text-right font-semibold', row.balance > 0 ? 'text-terra-700' : 'text-success-600')}>{formatMoney(row.balance)}</td>
                  <td className="px-3 py-3 text-[10px] text-ink-500">
                    {row.lastPayment ? <><p>{formatDateVN(row.lastPayment.date)}</p><p className="text-ink-400">{PAYMENT_METHOD_LABELS[row.lastPayment.method]} · {PAYMENT_TYPE_LABELS[row.lastPayment.type]}</p></> : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      {row.balance > 0 && <Button size="sm" variant="outline" onClick={() => setPaymentId(row.booking.id)}>Thu tiền</Button>}
                      <Button size="sm" variant="ghost" onClick={() => setInvoiceId(row.booking.id)}><ReceiptText className="h-3.5 w-3.5" /> Hóa đơn</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 p-3 sm:hidden">
          {rows.slice(0, visibleCount).map((row) => (
            <div key={row.booking.id} className="rounded-2xl border border-sand-200/70 bg-white/45 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink-900">{row.guest?.name}</p>
                  <p className="text-[10px] text-ink-400">{row.room?.number} · {row.booking.code}</p>
                </div>
                <Badge tone={row.balance > 0 ? 'gold' : 'success'}>{row.balance > 0 ? 'Còn nợ' : 'Đã thu'}</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-ink-500">
                <span>Tổng {formatMoney(row.booking.total)} · Đã thu {formatMoney(row.booking.paid)}</span>
                <span className={row.balance > 0 ? 'font-semibold text-terra-700' : 'font-semibold text-success-600'}>{formatMoney(row.balance)}</span>
              </div>
              <div className="mt-2 flex gap-1.5">
                {row.balance > 0 && <Button size="sm" variant="outline" onClick={() => setPaymentId(row.booking.id)}>Thu tiền</Button>}
                <Button size="sm" variant="ghost" onClick={() => setInvoiceId(row.booking.id)}>Hóa đơn</Button>
              </div>
            </div>
          ))}
        </div>

        {rows.length === 0 && <div className="p-5"><EmptyState icon={WalletCards} title="Không có giao dịch phù hợp" description="Thử đổi bộ lọc hoặc từ khóa." /></div>}
        {rows.length > visibleCount && (
          <div className="flex justify-center border-t border-sand-200/70 p-4">
            <Button variant="outline" onClick={() => setVisibleCount((count) => count + 10)}>Xem thêm {rows.length - visibleCount} booking</Button>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-sand-200/70 px-4 py-2.5 text-[10px] text-ink-400">
          <span>{rows.length} booking · {stats.count} giao dịch</span>
          <span className="hidden sm:block">Không lưu số thẻ/CVV trong bản demo</span>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-sand-200/70 p-4 sm:p-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-900">Sổ quỹ gần đây</h3>
            <p className="mt-0.5 text-xs text-ink-500">Các phiếu thu mới nhất.</p>
          </div>
          <Badge tone="sea">{payments.length} phiếu</Badge>
        </div>
        <div className="divide-y divide-sand-200/60">
          {[...payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((payment) => {
            const booking = bookings.find((item) => item.id === payment.bookingId)
            const guest = booking ? guests.find((item) => item.id === booking.guestId) : undefined
            return (
              <button key={payment.id} onClick={() => booking && setInvoiceId(booking.id)} className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-white/50 sm:px-5">
                <span className={cn('grid h-9 w-9 place-items-center rounded-xl', payment.type === 'refund' ? 'bg-terra-100 text-terra-700' : 'bg-success-100 text-success-600')}><CircleDollarSign className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-ink-900">{guest?.name ?? booking?.code} · {PAYMENT_METHOD_LABELS[payment.method]}</span>
                  <span className="block text-[10px] text-ink-500">{formatDateVN(payment.date)} · {PAYMENT_TYPE_LABELS[payment.type]} · {payment.invoiceNo}</span>
                </span>
                <span className={cn('text-sm font-bold', payment.type === 'refund' ? 'text-terra-700' : 'text-success-600')}>{payment.type === 'refund' ? '-' : '+'}{formatMoney(payment.amount)}</span>
                <ArrowRight className="hidden h-3.5 w-3.5 text-ink-300 sm:block" />
              </button>
            )
          })}
        </div>
      </Card>

      <PaymentDialog bookingId={paymentId} open={Boolean(paymentId)} onOpenChange={(open) => !open && setPaymentId(undefined)} />
      <InvoiceDialog bookingId={invoiceId} open={Boolean(invoiceId)} onOpenChange={(open) => !open && setInvoiceId(undefined)} />
    </div>
  )
}
