import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { addDays, differenceInCalendarDays, format, isWeekend, parseISO, startOfDay } from 'date-fns'
import { vi } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const vndFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

export function formatMoney(value: number) {
  return `${vndFormatter.format(Math.round(value))}đ`
}

export function formatMoneyShort(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace('.0', '')} tỷ`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')} tr`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return `${value}`
}

export function toDateKey(date: Date | string) {
  return format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd')
}

export function todayKey() {
  return toDateKey(startOfDay(new Date()))
}

export function addDaysKey(key: string, amount: number) {
  return toDateKey(addDays(parseISO(key), amount))
}

export function nightsBetween(checkIn: string, checkOut: string) {
  return Math.max(0, differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn)))
}

export function formatDateVN(key: string, pattern = 'dd/MM') {
  return format(parseISO(key), pattern, { locale: vi })
}

export function formatDateLong(key: string) {
  const value = format(parseISO(key), 'EEEE, dd/MM/yyyy', { locale: vi })
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function formatDateRange(checkIn: string, checkOut: string) {
  return `${formatDateVN(checkIn)} – ${formatDateVN(checkOut)}`
}

export function isWeekendKey(key: string) {
  return isWeekend(parseISO(key))
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function bookingBalance(total: number, paid: number) {
  return Math.max(0, total - paid)
}

export function calculateTotal(nights: number, nightlyRate: number, extras: { price: number; quantity: number }[], discount = 0) {
  const room = Math.max(0, nights) * nightlyRate
  const extraTotal = extras.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return Math.max(0, room + extraTotal - discount)
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function initialsColor(name: string) {
  const palette = [
    'bg-sea-100 text-sea-800',
    'bg-terra-100 text-terra-700',
    'bg-sage-200 text-sea-900',
    'bg-gold-100 text-gold-600',
    'bg-sand-200 text-ink-700',
  ]
  const index = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length
  return palette[index]
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? '')
          return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
        })
        .join(','),
    )
    .join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
