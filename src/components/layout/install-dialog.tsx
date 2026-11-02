import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Copy, Download, MoreVertical, Share, Smartphone } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { toast } from 'sonner'

export function InstallDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { canInstall, installed, install } = usePwaInstall()
  const [copied, setCopied] = useState(false)
  const url = new URL(import.meta.env.BASE_URL, window.location.origin).href

  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Đã copy link cài app')
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cài A Trung trên điện thoại</DialogTitle>
          <DialogDescription>
            Dùng như một app riêng: có icon ngoài màn hình chính, mở toàn màn hình và vẫn xem được khi mạng chập chờn.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 px-5 pb-6 sm:px-6">
          <div className="flex items-center gap-4 rounded-3xl border border-sand-200 bg-white/60 p-4">
            <div className="rounded-2xl bg-white p-2 shadow-sm">
              <QRCodeSVG value={url} size={92} fgColor="#0B5D50" bgColor="#FFFFFF" level="M" />
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Smartphone className="h-4 w-4 text-sea-600" /> Quét mã để mở
              </p>
              <p className="mt-1 break-all text-[11px] leading-relaxed text-ink-500">{url}</p>
              <button onClick={copyLink} className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-sea-700 hover:text-sea-900">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Đã copy' : 'Copy link'}
              </button>
            </div>
          </div>

          {installed ? (
            <div className="flex items-center gap-3 rounded-2xl border border-success-100 bg-success-100/60 p-4 text-sm text-success-600">
              <Check className="h-5 w-5" />
              App đã được cài trên thiết bị này.
            </div>
          ) : canInstall ? (
            <Button
              onClick={async () => {
                const accepted = await install()
                if (accepted) toast.success('Đã cài app A Trung')
              }}
              className="w-full"
              size="lg"
            >
              <Download className="h-4 w-4" /> Cài app ngay
            </Button>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-sand-200 bg-white/45 p-4">
              <p className="flex items-center gap-2 text-xs font-bold text-ink-900">
                <MoreVertical className="h-4 w-4 text-sea-600" /> Android · Chrome
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
                Mở menu <span className="font-semibold text-ink-700">⋮</span> → chọn <span className="font-semibold text-ink-700">Cài đặt ứng dụng</span> hoặc{' '}
                <span className="font-semibold text-ink-700">Thêm vào màn hình chính</span>.
              </p>
            </div>
            <div className="rounded-2xl border border-sand-200 bg-white/45 p-4">
              <p className="flex items-center gap-2 text-xs font-bold text-ink-900">
                <Share className="h-4 w-4 text-sea-600" /> iPhone · Safari
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
                Nhấn nút <span className="font-semibold text-ink-700">Chia sẻ</span> → <span className="font-semibold text-ink-700">Thêm vào màn hình chính</span> →{' '}
                <span className="font-semibold text-ink-700">Thêm</span>.
              </p>
            </div>
          </div>

          <p className="text-center text-[10px] leading-relaxed text-ink-400">
            Đây là bản PWA demo. Khi cần lên CH Play / App Store, có thể bọc thêm Capacitor mà không phải viết lại giao diện.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
