import { useMemo, useState } from 'react'
import { Area, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownRight, ArrowUpRight, BedDouble, CalendarRange, Download, Percent, TrendingUp, WalletCards } from 'lucide-react'
import { useHotelStore } from '../store/useHotelStore'
import { addDaysKey, downloadCsv, formatDateVN, formatMoney, formatMoneyShort, todayKey } from '../lib/utils'
import { getReportStats } from '../lib/analytics'
import { PageHeader } from '../components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/field'
import { StatCard } from '../components/shared/data-display'
import { Progress } from '../components/ui/primitives'
import { cn } from '../lib/utils'

const RANGES = [7, 30, 90] as const

export function ReportsPage() {
  const bookings = useHotelStore((state) => state.bookings)
  const payments = useHotelStore((state) => state.payments)
  const rooms = useHotelStore((state) => state.rooms)
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const [range, setRange] = useState<number>(30)
  const [startKey, setStartKey] = useState(addDaysKey(todayKey(), -29))
  const [endKey, setEndKey] = useState(todayKey())

  const report = useMemo(() => getReportStats(startKey, endKey, bookings, payments, rooms, roomTypes), [startKey, endKey, bookings, payments, rooms, roomTypes])
  const sourceTotal = report.sourceRevenue.reduce((sum, item) => sum + item.value, 0)

  const setPreset = (days: number) => {
    setRange(days)
    setStartKey(addDaysKey(todayKey(), -(days - 1)))
    setEndKey(todayKey())
  }

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Ngày', 'Doanh thu', 'Công suất (%)', 'Đêm phòng bán', 'Khách đến', 'Khách đi'],
      ...report.daily.map((day) => [day.date, day.revenue, day.occupancy, day.roomNights, day.arrivals, day.departures]),
      [],
      ['Tổng doanh thu', report.revenue],
      ['Công suất', report.occupancy],
      ['ADR', report.adr],
      ['RevPAR', report.revpar],
      ['Tỷ lệ hủy', report.cancellationRate],
    ]
    downloadCsv(`atrung-report-${startKey}-${endKey}.csv`, rows)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Business intelligence"
        title="Báo cáo doanh thu"
        description="Công suất, doanh thu, ADR/RevPAR và nguồn khách — đủ để trả lời câu hỏi “tháng này có tốt hơn không?”."
        actions={<Button onClick={exportCsv}><Download className="h-4 w-4" /> Xuất CSV</Button>}
      />

      <div className="flex flex-col gap-3 rounded-3xl border border-sand-200/80 bg-white/45 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {RANGES.map((days) => (
            <button key={days} onClick={() => setPreset(days)} className={cn('rounded-xl px-3 py-2 text-[11px] font-semibold transition', range === days ? 'bg-sea-700 text-sand-50' : 'text-ink-500 hover:bg-white')}>
              {days} ngày
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 shrink-0 text-ink-400" />
            <Input type="date" value={startKey} onChange={(event) => { setStartKey(event.target.value); setRange(0) }} className="w-full sm:w-36" />
          </div>
          <span className="hidden text-[10px] text-ink-400 sm:block">→</span>
          <Input type="date" value={endKey} onChange={(event) => { setEndKey(event.target.value); setRange(0) }} className="w-full sm:w-36" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Doanh thu" value={formatMoneyShort(report.revenue)} sub={`${formatMoney(report.revenue)} · ${report.days} ngày`} icon={WalletCards} trend={{ value: `${report.days} ngày gần nhất`, positive: true }} />
        <StatCard label="Công suất" value={`${report.occupancy}%`} sub={`${report.soldRoomNights}/${report.totalRoomNights} đêm phòng`} icon={Percent} tone="sage" />
        <StatCard label="ADR" value={formatMoneyShort(report.adr)} sub={`${formatMoney(report.adr)} · giá phòng trung bình`} icon={TrendingUp} tone="gold" />
        <StatCard label="RevPAR" value={formatMoneyShort(report.revpar)} sub={`${formatMoney(report.revpar)} · mỗi phòng có thể bán`} icon={BedDouble} tone="terra" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Doanh thu & công suất</CardTitle>
              <p className="mt-1 text-xs text-ink-500">Cột doanh thu thực thu, đường công suất theo ngày.</p>
            </div>
            <div className="flex items-center gap-3 text-[9px] text-ink-400">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sea-600" /> Doanh thu</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-terra-500" /> Công suất</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={report.daily} margin={{ top: 8, right: 0, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#238673" stopOpacity={0.26} />
                      <stop offset="100%" stopColor="#238673" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eae3d6" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#7b8781' }} interval={report.days > 35 ? 3 : 2} dy={8} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#7b8781' }} tickFormatter={(value) => formatMoneyShort(Number(value))} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#a54f32' }} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, border: '1px solid #eae3d6', background: 'rgba(250,248,243,0.96)', fontSize: 11 }}
                    formatter={(value, name) => [name === 'Công suất' ? `${value}%` : formatMoney(Number(value)), name === 'Công suất' ? 'Công suất' : 'Doanh thu']}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#0B5D50" strokeWidth={2.5} fill="url(#reportRevenue)" name="Doanh thu" />
                  <Line yAxisId="right" type="monotone" dataKey="occupancy" stroke="#C56A4A" strokeWidth={2} dot={false} name="Công suất" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Nguồn khách</CardTitle>
              <p className="mt-1 text-xs text-ink-500">Tỷ trọng doanh thu theo kênh.</p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={report.sourceRevenue} dataKey="value" nameKey="label" innerRadius={52} outerRadius={78} paddingAngle={4} stroke="none">
                    {report.sourceRevenue.map((entry) => <Cell key={entry.source} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(Number(value))} contentStyle={{ borderRadius: 16, border: '1px solid #eae3d6', background: 'rgba(250,248,243,0.96)', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {report.sourceRevenue.map((source) => (
                <div key={source.source} className="flex items-center gap-2 text-[10px]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="flex-1 text-ink-500">{source.label}</span>
                  <span className="font-semibold text-ink-900">{sourceTotal ? Math.round((source.value / sourceTotal) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Hiệu suất loại phòng</CardTitle>
              <p className="mt-1 text-xs text-ink-500">Doanh thu và công suất theo từng loại.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {report.typeRevenue.map((type) => (
              <div key={type.typeId}>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-ink-900">{type.name}</span>
                  <span className="text-ink-500">{formatMoney(type.revenue)} · {type.occupancy}%</span>
                </div>
                <Progress value={type.occupancy} className="mt-1.5 bg-sand-200" indicatorClassName={type.occupancy > 70 ? 'bg-sea-600' : type.occupancy > 40 ? 'bg-gold-500' : 'bg-terra-500'} />
                <div className="mt-1 flex justify-between text-[9px] text-ink-400"><span>{type.roomNights} đêm phòng</span><span>{type.occupancy}% công suất</span></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Chỉ số vận hành</CardTitle>
              <p className="mt-1 text-xs text-ink-500">Các chỉ số nên xem cùng doanh thu.</p>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 pt-4">
            {[
              { label: 'Tỷ lệ hủy', value: `${report.cancellationRate}%`, detail: `${report.cancellations} booking`, icon: Percent, tone: 'bg-terra-100 text-terra-700' },
              { label: 'Khách trực tiếp', value: `${report.directShare}%`, detail: 'doanh thu direct', icon: TrendingUp, tone: 'bg-sea-100 text-sea-800' },
              { label: 'Khách đến', value: `${report.arrivals}`, detail: 'trong kỳ', icon: ArrowDownRight, tone: 'bg-sage-200 text-sea-900' },
              { label: 'Khách đi', value: `${report.departures}`, detail: 'trong kỳ', icon: ArrowUpRight, tone: 'bg-gold-100 text-gold-600' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-sand-200/70 bg-white/45 p-3">
                <span className={cn('grid h-8 w-8 place-items-center rounded-xl', item.tone)}><item.icon className="h-4 w-4" /></span>
                <p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-ink-400">{item.label}</p>
                <p className="mt-0.5 font-display text-xl font-semibold text-ink-900">{item.value}</p>
                <p className="text-[9px] text-ink-400">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Doanh thu theo ngày</CardTitle>
            <p className="mt-1 text-xs text-ink-500">{formatDateVN(startKey)} – {formatDateVN(endKey, 'dd/MM/yyyy')}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={exportCsv}><Download className="h-3.5 w-3.5" /> CSV</Button>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead>
                <tr className="border-b border-sand-200/70 text-[10px] uppercase tracking-[0.12em] text-ink-400">
                  <th className="pb-2 font-semibold">Ngày</th>
                  <th className="pb-2 text-right font-semibold">Doanh thu</th>
                  <th className="pb-2 text-right font-semibold">Đêm phòng</th>
                  <th className="pb-2 text-right font-semibold">Công suất</th>
                  <th className="pb-2 text-right font-semibold">Đến</th>
                  <th className="pb-2 text-right font-semibold">Đi</th>
                </tr>
              </thead>
              <tbody>
                {report.daily.slice(-10).reverse().map((day) => (
                  <tr key={day.date} className="border-b border-sand-200/50 last:border-0">
                    <td className="py-2.5 font-medium text-ink-700">{formatDateVN(day.date, 'dd/MM/yyyy')}</td>
                    <td className="py-2.5 text-right font-semibold text-ink-900">{formatMoney(day.revenue)}</td>
                    <td className="py-2.5 text-right text-ink-500">{day.roomNights}</td>
                    <td className="py-2.5 text-right text-ink-500">{day.occupancy}%</td>
                    <td className="py-2.5 text-right text-ink-500">{day.arrivals}</td>
                    <td className="py-2.5 text-right text-ink-500">{day.departures}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
