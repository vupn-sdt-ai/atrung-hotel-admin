import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '../components/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-svh place-items-center bg-sand-50 px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sea-100 text-sea-800"><Compass className="h-6 w-6" /></span>
        <p className="mt-4 font-display text-5xl font-semibold tracking-[-0.04em] text-ink-900">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900">Lạc đường rồi</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">Trang này không tồn tại hoặc đã được di chuyển. Về bảng điều khiển để tiếp tục.</p>
        <Button asChild className="mt-5"><Link to="/">Về tổng quan</Link></Button>
      </div>
    </div>
  )
}
