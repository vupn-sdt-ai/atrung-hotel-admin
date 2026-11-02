import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowRight, Check, Copy, Download, LayoutDashboard, LockKeyhole, MoreVertical, Share, Smartphone, Sparkles, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { PageHeader } from '../components/shared/page-header'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

export function InstallPage() {
  const navigate = useNavigate()
  const { canInstall, installed, install } = usePwaInstall()
  const [copied, setCopied] = useState(false)
  const url = new URL(import.meta.env.BASE_URL, window.location.origin).href

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Đã copy link')
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="PWA · installable"
        title="Mang A Trung theo bên mình"
        description="Cài web thành app trên điện thoại: có icon, mở toàn màn hình, dùng nhanh tại quầy lễ tân hoặc khi đi công tác."
        actions={<Button onClick={() => navigate('/')}>Mở bảng điều khiển <ArrowRight className="h-4 w-4" /></Button>}
      />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="relative overflow-hidden bg-sea-900 text-sand-50">
          <img src="/images/rooms/exterior.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-sea-950/90 to-sea-800/50" />
          <CardContent className="relative p-6 sm:p-8">
            <Badge className="border-white/15 bg-white/10 text-sand-100"><Smartphone className="h-3 w-3" /> PWA</Badge>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-0.03em]">Một chạm để mở.<br />Không cần store.</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-sand-200/75">Dùng chung một giao diện web, cài trên Android hoặc iPhone. Khi cần lên CH Play/App Store mới bọc thêm native.</p>
            <div className="mt-6 flex justify-center rounded-[2rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="w-full max-w-[220px] rounded-[1.5rem] bg-white p-3 shadow-lift">
                <div className="rounded-2xl bg-sea-900 p-3">
                  <QRCodeSVG value={url} size={180} fgColor="#FAF8F3" bgColor="transparent" level="M" className="mx-auto" />
                </div>
                <p className="mt-2 text-center text-[9px] font-semibold text-ink-500">Quét bằng camera điện thoại</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-[10px] font-semibold text-sand-100 transition hover:bg-white/15">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Đã copy' : 'Copy link'}
              </button>
              {canInstall && !installed && <Button size="sm" className="bg-sand-50 text-sea-900 hover:bg-sand-100" onClick={async () => { const ok = await install(); if (ok) toast.success('Đã cài app') }}><Download className="h-3.5 w-3.5" /> Cài ngay</Button>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-ink-900">Cài trong 30 giây</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-sand-200 bg-white/55 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink-900"><MoreVertical className="h-4 w-4 text-sea-600" /> Android · Chrome</div>
                  <ol className="mt-3 space-y-2 text-[11px] leading-relaxed text-ink-500">
                    <li><span className="font-semibold text-ink-700">1.</span> Mở link bằng Chrome.</li>
                    <li><span className="font-semibold text-ink-700">2.</span> Nhấn menu ⋮ góc phải.</li>
                    <li><span className="font-semibold text-ink-700">3.</span> Chọn “Cài đặt ứng dụng”.</li>
                    <li><span className="font-semibold text-ink-700">4.</span> Mở app từ icon ngoài màn hình.</li>
                  </ol>
                </div>
                <div className="rounded-2xl border border-sand-200 bg-white/55 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink-900"><Share className="h-4 w-4 text-sea-600" /> iPhone · Safari</div>
                  <ol className="mt-3 space-y-2 text-[11px] leading-relaxed text-ink-500">
                    <li><span className="font-semibold text-ink-700">1.</span> Mở link bằng Safari.</li>
                    <li><span className="font-semibold text-ink-700">2.</span> Nhấn nút Chia sẻ.</li>
                    <li><span className="font-semibold text-ink-700">3.</span> Chọn “Thêm vào MH chính”.</li>
                    <li><span className="font-semibold text-ink-700">4.</span> Nhấn “Thêm”.</li>
                  </ol>
                </div>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-ink-400">iOS không tự hiện prompt cài. Cần hướng dẫn khách/nhân viên thao tác thủ công. Push notification chỉ hoạt động sau khi đã cài vào màn hình chính (iOS 16.4+).</p>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: LayoutDashboard, title: 'Mở nhanh', text: 'Icon riêng, toàn màn hình, ít thao tác hơn.' },
              { icon: WifiOff, title: 'Xem offline', text: 'App shell và dữ liệu demo được cache.' },
              { icon: LockKeyhole, title: 'An toàn', text: 'HTTPS, không lưu thẻ/CVV trong demo.' },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-sea-100 text-sea-800"><item.icon className="h-4 w-4" /></span>
                  <p className="mt-3 text-xs font-semibold text-ink-900">{item.title}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-ink-500">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gold-100/60">
            <CardContent className="flex items-start gap-3 p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
              <p className="text-[11px] leading-relaxed text-warning-600">Đây là bản PWA demo. Khi khách cần app trên CH Play/App Store, in hóa đơn nhiệt hoặc tích hợp khóa từ, sẽ bọc Capacitor — vẫn dùng lại giao diện này.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
