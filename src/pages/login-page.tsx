import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BriefcaseBusiness, ConciergeBell, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { DEMO_USERS, ROLE_DESCRIPTIONS, ROLE_LABELS } from '../lib/constants'
import { useHotelStore } from '../store/useHotelStore'
import type { Role } from '../types'
import { Logo } from '../components/shared/logo'
import { Button } from '../components/ui/button'
import { Field, Input } from '../components/ui/field'
import { cn } from '../lib/utils'

const roleIcons = {
  owner: UserRound,
  manager: BriefcaseBusiness,
  receptionist: ConciergeBell,
  housekeeping: Sparkles,
}

export function LoginPage() {
  const navigate = useNavigate()
  const session = useHotelStore((state) => state.session)
  const loginAs = useHotelStore((state) => state.loginAs)
  const [role, setRole] = useState<Role>('owner')
  const [email, setEmail] = useState('owner@atrung.demo')
  const [password, setPassword] = useState('atrung2026')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (session) navigate(session.role === 'housekeeping' ? '/housekeeping' : '/', { replace: true })
  }, [session, navigate])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim()) {
      toast.error('Vui lòng nhập email demo')
      return
    }
    setSubmitting(true)
    window.setTimeout(() => {
      loginAs(role)
      toast.success('Chào mừng trở lại, A Trung Homestay')
      navigate(role === 'housekeeping' ? '/housekeeping' : '/')
      setSubmitting(false)
    }, 350)
  }

  return (
    <div className="min-h-svh bg-sand-50 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative min-h-[280px] overflow-hidden bg-sea-900 px-6 py-8 sm:min-h-[340px] lg:min-h-svh lg:px-12 lg:py-12">
        <img
          src="/images/rooms/lobby.webp"
          alt="Không gian A Trung Homestay"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-sea-950/80 via-sea-900/45 to-ink-900/70" />
        <div className="noise absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col">
          <Logo light />
          <div className="mt-auto max-w-xl pt-16 lg:pt-24">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-sand-200/80">A Trung Homestay · Quy Nhơn</p>
            <h1 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-sand-50 sm:text-5xl lg:text-6xl">
              Nhà nhỏ ven biển,
              <br />
              vận hành thật nhẹ.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-sand-200/85">
              Một nơi để quản lý đặt phòng, lễ tân, buồng phòng và doanh thu — gọn như cách bạn tiếp đón khách.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {[
                { value: '7', label: 'phòng' },
                { value: '4.9', label: 'điểm khách' },
                { value: '24/7', label: 'sẵn sàng' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur">
                  <p className="font-display text-xl font-semibold text-sand-50">{item.value}</p>
                  <p className="text-[10px] text-sand-200/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-10 hidden text-[10px] text-sand-200/50 lg:block">Bản demo giao diện · Dữ liệu mẫu, không phải dữ liệu vận hành thật.</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-14 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-sea-600">Chào buổi sáng</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-ink-900 sm:text-4xl">Đăng nhập quản lý</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">Chọn vai trò demo để xem giao diện theo từng người dùng.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((user) => {
                const Icon = roleIcons[user.role]
                return (
                  <button
                    key={user.role}
                    type="button"
                    onClick={() => {
                      setRole(user.role)
                      setEmail(user.email)
                    }}
                    className={cn(
                      'rounded-2xl border p-3 text-left transition duration-200',
                      role === user.role
                        ? 'border-sea-300 bg-sea-50 shadow-[0_10px_24px_-20px_rgba(11,93,80,0.8)]'
                        : 'border-sand-200 bg-white/45 hover:border-sand-300 hover:bg-white/70',
                    )}
                  >
                    <span className={cn('grid h-7 w-7 place-items-center rounded-lg', role === user.role ? 'bg-sea-700 text-sand-50' : 'bg-sand-100 text-ink-500')}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="mt-2 block text-[11px] font-bold text-ink-900">{ROLE_LABELS[user.role]}</span>
                    <span className="mt-0.5 block text-[9px] leading-relaxed text-ink-400">{ROLE_DESCRIPTIONS[user.role]}</span>
                  </button>
                )
              })}
            </div>

            <Field label="Email demo">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <Input value={email} onChange={(event) => setEmail(event.target.value)} className="pl-9" autoComplete="username" />
              </div>
            </Field>

            <Field label="Mật khẩu" hint="Bản demo: mật khẩu bất kỳ, dữ liệu chỉ lưu trên thiết bị.">
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="px-9"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-ink-400 hover:bg-sand-100"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? 'Đang mở...' : `Vào bảng điều khiển · ${ROLE_LABELS[role]}`}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-sand-200" />
            <span className="text-[10px] text-ink-400">hoặc</span>
            <div className="h-px flex-1 bg-sand-200" />
          </div>
          <button
            onClick={() => {
              loginAs('owner')
              toast.success('Đang mở bản demo với quyền chủ homestay')
              navigate('/')
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-sea-200 bg-white/50 py-3 text-xs font-semibold text-sea-800 transition hover:bg-sea-50"
          >
            <Sparkles className="h-4 w-4" /> Vào nhanh bản demo
          </button>
          <p className="mt-6 text-center text-[10px] leading-relaxed text-ink-400">
            Đây là UI demo cho A Trung Homestay. Không dùng dữ liệu thật, không lưu thông tin thanh toán.
          </p>
        </motion.div>
      </section>
    </div>
  )
}
