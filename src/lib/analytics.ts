import { addDays, differenceInCalendarDays, eachDayOfInterval, format, parseISO } from 'date-fns'
import type { Booking, Payment, Room, RoomType } from '../types'
import { nightsBetween, toDateKey } from './utils'

export function stayDates(checkIn: string, checkOut: string) {
  const start = parseISO(checkIn)
  const end = parseISO(checkOut)
  const days = Math.max(0, differenceInCalendarDays(end, start))
  return Array.from({ length: days }, (_, index) => toDateKey(addDays(start, index)))
}

export function isBookingActiveOn(booking: Booking, dateKey: string) {
  if (booking.status === 'cancelled' || booking.status === 'no_show') return false
  return booking.checkIn <= dateKey && dateKey < booking.checkOut
}

export function occupiedRoomIds(dateKey: string, bookings: Booking[]) {
  return new Set(bookings.filter((booking) => isBookingActiveOn(booking, dateKey)).map((booking) => booking.roomId))
}

export function bookingsInRange(bookings: Booking[], startKey: string, endKey: string) {
  return bookings.filter((booking) => booking.checkIn < endKey && booking.checkOut > startKey)
}

export function nightsInRange(booking: Booking, startKey: string, endKey: string) {
  return stayDates(booking.checkIn, booking.checkOut).filter((date) => date >= startKey && date <= endKey).length
}

export interface DailyStat {
  date: string
  label: string
  revenue: number
  roomNights: number
  occupancy: number
  arrivals: number
  departures: number
}

export interface ReportStats {
  days: number
  totalRoomNights: number
  soldRoomNights: number
  occupancy: number
  revenue: number
  roomRevenue: number
  adr: number
  revpar: number
  arrivals: number
  departures: number
  cancellations: number
  cancellationRate: number
  directShare: number
  daily: DailyStat[]
  sourceRevenue: { source: string; label: string; value: number; color: string }[]
  typeRevenue: { typeId: string; name: string; revenue: number; roomNights: number; occupancy: number }[]
  statusCounts: Record<string, number>
}

const SOURCE_META: Record<string, { label: string; color: string }> = {
  direct: { label: 'Trực tiếp', color: '#0B5D50' },
  walkin: { label: 'Walk-in', color: '#849D87' },
  booking: { label: 'Booking.com', color: '#1B4F8A' },
  agoda: { label: 'Agoda', color: '#C56A4A' },
  airbnb: { label: 'Airbnb', color: '#C8A45D' },
  zalo: { label: 'Zalo', color: '#238673' },
}

export function getReportStats(
  startKey: string,
  endKey: string,
  bookings: Booking[],
  payments: Payment[],
  rooms: Room[],
  roomTypes: RoomType[],
): ReportStats {
  const days = Math.max(1, differenceInCalendarDays(parseISO(endKey), parseISO(startKey)) + 1)
  const dates = eachDayOfInterval({ start: parseISO(startKey), end: parseISO(endKey) }).map(toDateKey)
  const totalRoomNights = rooms.length * days
  const inRange = bookingsInRange(bookings, startKey, endKey)
  const activeInRange = inRange.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'no_show')

  let soldRoomNights = 0
  let roomRevenue = 0
  let arrivals = 0
  let departures = 0
  let cancellations = 0

  for (const booking of inRange) {
    if (booking.status === 'cancelled' || booking.status === 'no_show') {
      cancellations += 1
      continue
    }
    if (booking.checkIn >= startKey && booking.checkIn <= endKey) arrivals += 1
    if (booking.checkOut >= startKey && booking.checkOut <= endKey) departures += 1
    const nights = nightsInRange(booking, startKey, endKey)
    soldRoomNights += nights
    roomRevenue += nights * booking.nightlyRate
  }

  const daily = dates.map((date) => {
    const occupied = occupiedRoomIds(date, activeInRange)
    const revenue = payments
      .filter((payment) => payment.date === date)
      .reduce((sum, payment) => sum + (payment.type === 'refund' ? -payment.amount : payment.amount), 0)
    return {
      date,
      label: format(parseISO(date), 'dd/MM'),
      revenue,
      roomNights: occupied.size,
      occupancy: rooms.length ? Math.round((occupied.size / rooms.length) * 100) : 0,
      arrivals: activeInRange.filter((booking) => booking.checkIn === date).length,
      departures: activeInRange.filter((booking) => booking.checkOut === date).length,
    }
  })

  const revenue = payments
    .filter((payment) => payment.date >= startKey && payment.date <= endKey)
    .reduce((sum, payment) => sum + (payment.type === 'refund' ? -payment.amount : payment.amount), 0)

  const sourceTotals = new Map<string, number>()
  const typeTotals = new Map<string, { revenue: number; roomNights: number }>()

  for (const booking of activeInRange) {
    const nights = nightsInRange(booking, startKey, endKey)
    const value = nights * booking.nightlyRate
    sourceTotals.set(booking.source, (sourceTotals.get(booking.source) ?? 0) + value)
    const room = rooms.find((item) => item.id === booking.roomId)
    if (room) {
      const current = typeTotals.get(room.typeId) ?? { revenue: 0, roomNights: 0 }
      typeTotals.set(room.typeId, { revenue: current.revenue + value, roomNights: current.roomNights + nights })
    }
  }

  const sourceRevenue = [...sourceTotals.entries()]
    .map(([source, value]) => ({
      source,
      label: SOURCE_META[source]?.label ?? source,
      value,
      color: SOURCE_META[source]?.color ?? '#849D87',
    }))
    .sort((a, b) => b.value - a.value)

  const typeRevenue = roomTypes.map((type) => {
    const totals = typeTotals.get(type.id) ?? { revenue: 0, roomNights: 0 }
    const typeRooms = rooms.filter((room) => room.typeId === type.id).length
    return {
      typeId: type.id,
      name: type.name,
      revenue: totals.revenue,
      roomNights: totals.roomNights,
      occupancy: typeRooms ? Math.round((totals.roomNights / (typeRooms * days)) * 100) : 0,
    }
  })

  const statusCounts = inRange.reduce<Record<string, number>>((acc, booking) => {
    acc[booking.status] = (acc[booking.status] ?? 0) + 1
    return acc
  }, {})

  const directValue = sourceTotals.get('direct') ?? 0
  const allSourceValue = [...sourceTotals.values()].reduce((sum, value) => sum + value, 0)

  return {
    days,
    totalRoomNights,
    soldRoomNights,
    occupancy: totalRoomNights ? Math.round((soldRoomNights / totalRoomNights) * 100) : 0,
    revenue,
    roomRevenue,
    adr: soldRoomNights ? Math.round(roomRevenue / soldRoomNights) : 0,
    revpar: totalRoomNights ? Math.round(roomRevenue / totalRoomNights) : 0,
    arrivals,
    departures,
    cancellations,
    cancellationRate: inRange.length ? Math.round((cancellations / inRange.length) * 100) : 0,
    directShare: allSourceValue ? Math.round((directValue / allSourceValue) * 100) : 0,
    daily,
    sourceRevenue,
    typeRevenue,
    statusCounts,
  }
}

export function bookingNights(booking: Booking) {
  return nightsBetween(booking.checkIn, booking.checkOut)
}
