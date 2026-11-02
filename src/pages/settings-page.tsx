import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Copy, Download, Mail, MapPin, Phone, RotateCcw, Save, ShieldCheck, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { useHotelStore } from '../store/useHotelStore'
import { DEMO_USERS, ROLE_DESCRIPTIONS, ROLE_LABELS } from '../lib/constants'
import { formatMoney } from '../lib/utils'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { PageHeader } from '../components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Field, Input } from '../components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Avatar } from '../components/ui/primitives'
import { RoomEditDialog } from '../components/rooms/room-edit-dialog'

export function SettingsPage() {
  const navigate = useNavigate()
  const settings = useHotelStore((state) => state.settings)
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const rooms = useHotelStore((state) => state.rooms)
  const bookings = useHotelStore((state) => state.bookings)
  const paymentCount = useHotelStore((state) => state.payments.length)
  const updateSettings = useHotelStore((state) => state.updateSettings)
  const updateRoomType = useHotelStore((state) => state.updateRoomType)
  const resetDemo = useHotelStore((state) => state.resetDemo)
  const session = useHotelStore((state) => state.session)
  const loginAs = useHotelStore((state) => state.loginAs)
  const { canInstall, installed, install } = usePwaInstall()
  const [copied, setCopied] = useState(false)
  const [editRoomId, setEditRoomId] = useState<string | undefined>()
  const [form, setForm] = useState(settings)

  useEffect(() => setForm(settings), [settings])

  const appUrl = new URL(import.meta.env.BASE_URL, window.location.origin).href

  const copy = async () => {
    await navigator.clipboard.writeText(appUrl)
    setCopied(true)
    toast.success('Đã copy link app')
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Configuration"
        title="Cài đặt"
        description="Thông tin homestay, loại phòng, giá bán, người dùng và ứng dụng PWA."
        actions={<Button onClick={() => { updateSettings(form); toast.success('Đã lưu thông tin homestay') }}><Save className="h-4 w-4" /> Lưu thay đổi</Button>}
      />

      <Tabs defaultValue="hotel">
        <TabsList className="w-full flex-wrap justify-start sm:w-auto sm:flex-nowrap">
          <TabsTrigger value="hotel">Khách sạn</TabsTrigger>
          <TabsTrigger value="rooms">Phòng & giá</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="app">Ứng dụng</TabsTrigger>
          <TabsTrigger value="data">Dữ liệu demo</TabsTrigger>
        </TabsList>

        <TabsContent value="hotel">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader><CardTitle>Thông tin homestay</CardTitle></CardHeader>
              <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
                <Field label="Tên hiển thị"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
                <Field label="Tagline"><Input value={form.tagline} onChange={(event) => setForm({ ...form, tagline: event.target.value })} /></Field>
                <div className="sm:col-span-2"><Field label="Địa chỉ"><Input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></Field></div>
                <Field label="Số điện thoại"><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
                <Field label="Email"><Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" /></Field>
                <Field label="Giờ nhận phòng"><Input type="time" value={form.checkIn} onChange={(event) => setForm({ ...form, checkIn: event.target.value })} /></Field>
                <Field label="Giờ trả phòng"><Input type="time" value={form.checkOut} onChange={(event) => setForm({ ...form, checkOut: event.target.value })} /></Field>
                <Field label="Thuế / phí (%)"><Input type="number" min={0} max={30} value={form.taxRate} onChange={(event) => setForm({ ...form, taxRate: Number(event.target.value) })} /></Field>
                <Field label="Tiền tệ"><Input value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} /></Field>
              </CardContent>
            </Card>
            <Card className="bg-sea-900 text-sand-50">
              <CardContent className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sand-200/60">Preview</p>
                <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em]">{form.name || 'A Trung Homestay'}</p>
                <p className="mt-2 text-sm leading-relaxed text-sand-200/75">{form.tagline}</p>
                <div className="mt-5 space-y-2 text-[11px] text-sand-200/75">
                  <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-sage-200" /> {form.address}</p>
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-sage-200" /> {form.phone}</p>
                  <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-sage-200" /> {form.email}</p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white/10 p-3"><p className="text-[9px] text-sand-200/60">Check-in</p><p className="mt-1 font-display text-xl font-semibold">{form.checkIn}</p></div>
                  <div className="rounded-2xl bg-white/10 p-3"><p className="text-[9px] text-sand-200/60">Check-out</p><p className="mt-1 font-display text-xl font-semibold">{form.checkOut}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Loại phòng & giá bán</CardTitle>
                <p className="mt-1 text-xs text-ink-500">Giá thay đổi trực tiếp; áp dụng cho tất cả phòng cùng loại.</p>
              </div>
              <Badge tone="sea">{roomTypes.length} loại · {rooms.length} phòng</Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {roomTypes.map((type) => {
                const typeRooms = rooms.filter((room) => room.typeId === type.id)
                return (
                  <div key={type.id} className="grid gap-3 rounded-2xl border border-sand-200/70 bg-white/45 p-3 sm:grid-cols-[1.2fr_0.7fr_0.7fr_auto] sm:items-center">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{type.name}</p>
                      <p className="mt-0.5 text-[10px] text-ink-500">{typeRooms.map((room) => room.number).join(', ')} · {type.size} m² · {type.bed}</p>
                    </div>
                    <Field label="Ngày thường"><Input type="number" step={50_000} value={type.basePrice} onChange={(event) => updateRoomType(type.id, { basePrice: Number(event.target.value) })} /></Field>
                    <Field label="Cuối tuần"><Input type="number" step={50_000} value={type.weekendPrice} onChange={(event) => updateRoomType(type.id, { weekendPrice: Number(event.target.value) })} /></Field>
                    <Button variant="outline" size="sm" onClick={() => setEditRoomId(typeRooms[0]?.id)} disabled={!typeRooms.length}>Sửa chi tiết</Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
          <p className="mt-3 text-[10px] text-ink-400">Giá hiển thị dạng VND/đêm. Giá cuối tuần áp dụng thứ Bảy và Chủ nhật; có thể ghi đè từng ngày trong mục Lịch phòng → Giá & tồn.</p>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Người dùng & vai trò</CardTitle>
                <p className="mt-1 text-xs text-ink-500">Bản demo cho phép chuyển vai trò để xem giao diện.</p>
              </div>
              <Badge tone="sage"><ShieldCheck className="h-3 w-3" /> Phân quyền</Badge>
            </CardHeader>
            <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
              {DEMO_USERS.map((user) => (
                <div key={user.id} className="flex items-center gap-3 rounded-2xl border border-sand-200/70 bg-white/45 p-3">
                  <Avatar name={user.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900">{user.name}</p>
                    <p className="text-[10px] text-ink-500">{ROLE_LABELS[user.role]} · {user.email}</p>
                    <p className="mt-0.5 text-[9px] text-ink-400">{ROLE_DESCRIPTIONS[user.role]}</p>
                  </div>
                  {session?.role === user.role ? <Badge tone="success">Đang dùng</Badge> : <Button size="sm" variant="ghost" onClick={() => { loginAs(user.role); toast.success(`Đã chuyển sang ${ROLE_LABELS[user.role]}`); navigate('/') }}>Chuyển</Button>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <CardHeader><CardTitle>Cài app PWA</CardTitle></CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-center rounded-3xl bg-white p-4">
                  <QRCodeSVG value={appUrl} size={160} fgColor="#0B5D50" bgColor="#FFFFFF" level="M" />
                </div>
                <p className="mt-3 break-all text-center text-[10px] text-ink-400">{appUrl}</p>
                <button onClick={copy} className="mx-auto mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-sea-700">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Đã copy' : 'Copy link'}</button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Trạng thái ứng dụng</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center gap-3 rounded-2xl bg-sea-50/70 p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sea-700 text-sand-50"><Smartphone className="h-5 w-5" /></span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-ink-900">{installed ? 'Đã cài trên thiết bị này' : 'Cài như một app riêng'}</p>
                    <p className="text-[10px] text-ink-500">Android Chrome · iPhone Safari · không cần store.</p>
                  </div>
                </div>
                {canInstall && !installed && <Button className="w-full" onClick={async () => { const ok = await install(); if (ok) toast.success('Đã cài app A Trung') }}><Download className="h-4 w-4" /> Cài app ngay</Button>}
                <div className="rounded-2xl border border-sand-200 bg-white/45 p-3 text-[10px] leading-relaxed text-ink-500">
                  <p className="font-semibold text-ink-800">Cách cài trên iPhone</p>
                  <p className="mt-1">Mở Safari → nút Chia sẻ → “Thêm vào màn hình chính” → Thêm.</p>
                  <p className="mt-2 font-semibold text-ink-800">Cách cài trên Android</p>
                  <p className="mt-1">Mở Chrome → menu ⋮ → “Cài đặt ứng dụng” hoặc “Thêm vào màn hình chính”.</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/install')}>Mở hướng dẫn cài app</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Dữ liệu demo</CardTitle></CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-sand-100/70 p-3"><p className="text-[9px] uppercase tracking-[0.1em] text-ink-400">Phòng</p><p className="mt-1 font-display text-2xl font-semibold text-ink-900">{rooms.length}</p></div>
                  <div className="rounded-2xl bg-sand-100/70 p-3"><p className="text-[9px] uppercase tracking-[0.1em] text-ink-400">Booking</p><p className="mt-1 font-display text-2xl font-semibold text-ink-900">{bookings.length}</p></div>
                  <div className="rounded-2xl bg-sand-100/70 p-3"><p className="text-[9px] uppercase tracking-[0.1em] text-ink-400">Giao dịch</p><p className="mt-1 font-display text-2xl font-semibold text-ink-900">{paymentCount}</p></div>
                  <div className="rounded-2xl bg-sand-100/70 p-3"><p className="text-[9px] uppercase tracking-[0.1em] text-ink-400">Giá trị</p><p className="mt-1 text-sm font-bold text-ink-900">{formatMoney(bookings.reduce((sum, booking) => sum + booking.total, 0))}</p></div>
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-ink-500">Dữ liệu được lưu trong localStorage của trình duyệt. Khôi phục dữ liệu mẫu sẽ tạo lại 7 phòng, booking, thanh toán và task.</p>
              </CardContent>
            </Card>
            <Card className="border-terra-300/60">
              <CardHeader><CardTitle>Khôi phục dữ liệu</CardTitle></CardHeader>
              <CardContent className="pt-4">
                <p className="text-xs leading-relaxed text-ink-500">Dùng khi muốn reset toàn bộ thay đổi trong phiên demo: booking mới, giá đã sửa, trạng thái phòng, thanh toán.</p>
                <Button variant="danger" className="mt-4 w-full" onClick={() => { if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu? Thay đổi hiện tại sẽ mất.')) { resetDemo(); toast.success('Đã khôi phục dữ liệu mẫu') } }}>
                  <RotateCcw className="h-4 w-4" /> Khôi phục dữ liệu mẫu
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {editRoomId && <RoomEditDialog roomId={editRoomId} open={Boolean(editRoomId)} onOpenChange={(open) => !open && setEditRoomId(undefined)} />}
    </div>
  )
}
