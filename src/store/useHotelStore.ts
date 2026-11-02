import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { addDays, format, parseISO } from 'date-fns'
import { DEMO_USERS } from '../lib/constants'
import { calculateTotal, nightsBetween, toDateKey, todayKey } from '../lib/utils'
import type {
  Booking,
  BookingExtra,
  CalendarOverride,
  CheckInInput,
  CheckOutInput,
  DemoUser,
  Guest,
  HotelSettings,
  HousekeepingStatus,
  HousekeepingTask,
  NewBookingInput,
  Payment,
  PaymentMethod,
  PaymentType,
  Room,
  RoomType,
  Role,
} from '../types'
import { createSeedData } from '../data/seed'

interface HotelStore {
  settings: HotelSettings
  roomTypes: RoomType[]
  rooms: Room[]
  guests: Guest[]
  bookings: Booking[]
  payments: Payment[]
  tasks: HousekeepingTask[]
  calendarOverrides: CalendarOverride[]
  session: DemoUser | null
  loginAs: (role: Role) => void
  logout: () => void
  addBooking: (input: NewBookingInput) => { ok: boolean; error?: string; booking?: Booking }
  updateBooking: (id: string, patch: Partial<Booking>) => { ok: boolean; error?: string }
  cancelBooking: (id: string, reason: string) => void
  checkIn: (id: string, input: CheckInInput) => { ok: boolean; error?: string }
  checkOut: (id: string, input: CheckOutInput) => { ok: boolean; error?: string }
  recordPayment: (bookingId: string, amount: number, method: PaymentMethod, type: PaymentType, note: string) => void
  updateSettings: (patch: Partial<HotelSettings>) => void
  updateGuest: (id: string, patch: Partial<Guest>) => void
  updateRoom: (id: string, patch: Partial<Room>) => void
  updateRoomType: (id: string, patch: Partial<RoomType>) => void
  setOverride: (typeId: string, date: string, patch: Omit<CalendarOverride, 'typeId' | 'date'>) => void
  clearOverride: (typeId: string, date: string) => void
  updateTaskStatus: (id: string, status: HousekeepingTask['status']) => void
  addTask: (task: Omit<HousekeepingTask, 'id' | 'createdAt'>) => void
  resetDemo: () => void
}

export function isRoomAvailable(roomId: string, checkIn: string, checkOut: string, bookings: Booking[], excludeId?: string) {
  return !bookings.some(
    (booking) =>
      booking.id !== excludeId &&
      booking.roomId === roomId &&
      booking.status !== 'cancelled' &&
      booking.status !== 'no_show' &&
      checkIn < booking.checkOut &&
      booking.checkIn < checkOut,
  )
}

function nextBookingCode(bookings: Booking[]) {
  const month = format(parseISO(todayKey()), 'yyMM')
  const prefix = `AT-${month}-`
  const max = bookings
    .filter((booking) => booking.code.startsWith(prefix))
    .reduce((value, booking) => Math.max(value, Number(booking.code.slice(prefix.length)) || 0), 0)
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

function cloneSeed() {
  return JSON.parse(JSON.stringify(createSeedData())) as ReturnType<typeof createSeedData>
}

const initial = cloneSeed()

function findOrCreateGuest(guests: Guest[], input: NewBookingInput) {
  const existing = guests.find((guest) => guest.phone.replaceAll(' ', '') === input.guestPhone.replaceAll(' ', ''))
  if (existing) {
    return {
      guest: existing,
      guests: guests.map((guest) =>
        guest.id === existing.id
          ? { ...guest, name: input.guestName || guest.name, email: input.guestEmail || guest.email }
          : guest,
      ),
    }
  }
  const guest: Guest = {
    id: `g-${crypto.randomUUID()}`,
    name: input.guestName.trim(),
    phone: input.guestPhone.trim(),
    email: input.guestEmail.trim(),
    nationality: input.nationality || 'Việt Nam',
    tags: [input.source === 'walkin' ? 'Walk-in' : 'Mới'],
    notes: '',
    createdAt: todayKey(),
  }
  return { guest, guests: [...guests, guest] }
}

function makePayment(bookingId: string, amount: number, method: PaymentMethod, type: PaymentType, note: string): Payment {
  return {
    id: `p-${crypto.randomUUID()}`,
    bookingId,
    amount,
    method,
    type,
    date: todayKey(),
    note,
    invoiceNo: `HD-${format(new Date(), 'ddMMyy')}-${Math.floor(Math.random() * 900 + 100)}`,
  }
}

export const useHotelStore = create<HotelStore>()(
  persist(
    (set, get) => ({
      settings: initial.settings,
      roomTypes: initial.roomTypes,
      rooms: initial.rooms,
      guests: initial.guests,
      bookings: initial.bookings,
      payments: initial.payments,
      tasks: initial.tasks,
      calendarOverrides: initial.calendarOverrides,
      session: null,

      loginAs: (role) => {
        const user = DEMO_USERS.find((item) => item.role === role)
        if (user) set({ session: user })
      },

      logout: () => set({ session: null }),

      addBooking: (input) => {
        const { bookings, rooms, roomTypes, guests, payments } = get()
        const room = rooms.find((item) => item.id === input.roomId)
        if (!room) return { ok: false, error: 'Không tìm thấy phòng.' }
        if (!input.guestName.trim() || !input.guestPhone.trim()) return { ok: false, error: 'Vui lòng nhập tên và số điện thoại khách.' }
        const nights = nightsBetween(input.checkIn, input.checkOut)
        if (nights <= 0) return { ok: false, error: 'Ngày trả phòng phải sau ngày nhận phòng.' }
        if (!isRoomAvailable(input.roomId, input.checkIn, input.checkOut, bookings)) {
          return { ok: false, error: 'Phòng đã có booking trong khoảng ngày này.' }
        }
        const type = roomTypes.find((item) => item.id === room.typeId)
        const extraItems: BookingExtra[] = []
        if (input.breakfast) {
          extraItems.push({ id: 'breakfast', name: 'Ăn sáng', quantity: Math.max(1, input.adults + input.children) * nights, price: 80_000 })
        }
        if (input.extraBed) {
          extraItems.push({ id: 'extra-bed', name: 'Giường phụ', quantity: nights, price: 150_000 })
        }
        const total = calculateTotal(nights, input.nightlyRate || type?.basePrice || 0, extraItems)
        const paid = Math.min(Math.max(0, input.deposit), total)
        const { guest, guests: nextGuests } = findOrCreateGuest(guests, input)
        const booking: Booking = {
          id: `b-${crypto.randomUUID()}`,
          code: nextBookingCode(bookings),
          guestId: guest.id,
          roomId: input.roomId,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          adults: input.adults,
          children: input.children,
          source: input.source,
          status: input.source === 'walkin' ? 'checked_in' : 'confirmed',
          nightlyRate: input.nightlyRate || type?.basePrice || 0,
          total,
          paid,
          extras: extraItems,
          notes: input.notes,
          createdAt: todayKey(),
        }
        const nextPayments = paid > 0 ? [...payments, makePayment(booking.id, paid, 'transfer', 'deposit', 'Đặt cọc khi tạo booking')] : payments
        set({
          bookings: [...bookings, booking],
          guests: nextGuests,
          payments: nextPayments,
          rooms: rooms.map((item) => (item.id === room.id && input.source === 'walkin' ? { ...item, status: 'occupied' as const } : item)),
        })
        return { ok: true, booking }
      },

      updateBooking: (id, patch) => {
        const state = get()
        const current = state.bookings.find((booking) => booking.id === id)
        if (!current) return { ok: false, error: 'Không tìm thấy booking.' }
        const checkIn = patch.checkIn ?? current.checkIn
        const checkOut = patch.checkOut ?? current.checkOut
        const roomId = patch.roomId ?? current.roomId
        const nights = nightsBetween(checkIn, checkOut)
        if (nights <= 0) return { ok: false, error: 'Ngày trả phòng phải sau ngày nhận phòng.' }
        if (!isRoomAvailable(roomId, checkIn, checkOut, state.bookings, id)) {
          return { ok: false, error: 'Phòng đã có booking trong khoảng ngày này.' }
        }
        const rate = patch.nightlyRate ?? current.nightlyRate
        const total = patch.total ?? rate * nights + current.extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
        set({
          bookings: state.bookings.map((booking) =>
            booking.id === id ? { ...booking, ...patch, checkIn, checkOut, roomId, nightlyRate: rate, total } : booking,
          ),
        })
        return { ok: true }
      },

      cancelBooking: (id, reason) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id
              ? {
                  ...booking,
                  status: 'cancelled',
                  notes: `${booking.notes}${booking.notes ? '\n' : ''}Hủy: ${reason}`.trim(),
                }
              : booking,
          ),
        }))
      },

      checkIn: (id, input) => {
        const state = get()
        const booking = state.bookings.find((item) => item.id === id)
        if (!booking) return { ok: false, error: 'Không tìm thấy booking.' }
        if (booking.status !== 'confirmed' && booking.status !== 'pending') return { ok: false, error: 'Booking không ở trạng thái có thể check-in.' }
        const room = state.rooms.find((item) => item.id === booking.roomId)
        if (!room) return { ok: false, error: 'Không tìm thấy phòng.' }
        const deposit = Math.min(Math.max(0, input.deposit), Math.max(0, booking.total - booking.paid))
        const payments = deposit > 0 ? [...state.payments, makePayment(booking.id, deposit, 'cash', 'deposit', input.note || 'Thu cọc khi check-in')] : state.payments
        set({
          bookings: state.bookings.map((item) =>
            item.id === id
              ? { ...item, status: 'checked_in', paid: item.paid + deposit, notes: input.note ? `${item.notes}${item.notes ? '\n' : ''}${input.note}` : item.notes }
              : item,
          ),
          guests: state.guests.map((guest) => (guest.id === booking.guestId && input.idNumber ? { ...guest, idNumber: input.idNumber } : guest)),
          payments,
          rooms: state.rooms.map((item) => (item.id === room.id ? { ...item, status: 'occupied', housekeeping: 'clean' } : item)),
        })
        return { ok: true }
      },

      checkOut: (id, input) => {
        const state = get()
        const booking = state.bookings.find((item) => item.id === id)
        if (!booking) return { ok: false, error: 'Không tìm thấy booking.' }
        if (booking.status !== 'checked_in') return { ok: false, error: 'Chỉ có thể trả phòng cho khách đang ở.' }
        const room = state.rooms.find((item) => item.id === booking.roomId)
        const nights = nightsBetween(booking.checkIn, booking.checkOut)
        const extrasTotal = input.extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
        const total = Math.max(0, booking.nightlyRate * nights + extrasTotal - input.discount)
        const paymentAmount = Math.min(Math.max(0, input.paymentAmount), Math.max(0, total - booking.paid))
        const payments = paymentAmount > 0
          ? [...state.payments, makePayment(booking.id, paymentAmount, input.method, 'payment', input.note || 'Thanh toán khi trả phòng')]
          : state.payments
        const nextTasks = room
          ? [
              ...state.tasks,
              {
                id: `t-${crypto.randomUUID()}`,
                roomId: room.id,
                title: `Dọn phòng sau trả phòng ${room.number}`,
                note: 'Kiểm tra minibar, thay ga gối và bổ sung amenities.',
                status: 'todo' as const,
                priority: 'high' as const,
                assignee: 'Phạm Tâm',
                createdAt: todayKey(),
              },
            ]
          : state.tasks
        set({
          bookings: state.bookings.map((item) =>
            item.id === id ? { ...item, status: 'checked_out', extras: input.extras, total, paid: item.paid + paymentAmount } : item,
          ),
          payments,
          rooms: state.rooms.map((item) => (item.id === booking.roomId ? { ...item, status: 'dirty', housekeeping: 'dirty' } : item)),
          tasks: nextTasks,
        })
        return { ok: true }
      },

      recordPayment: (bookingId, amount, method, type, note) => {
        const state = get()
        const booking = state.bookings.find((item) => item.id === bookingId)
        if (!booking) return
        const signed = type === 'refund' ? -Math.abs(amount) : Math.abs(amount)
        set({
          payments: [...state.payments, makePayment(bookingId, Math.abs(amount), method, type, note)],
          bookings: state.bookings.map((item) =>
            item.id === bookingId ? { ...item, paid: Math.max(0, item.paid + signed) } : item,
          ),
        })
      },

      updateSettings: (patch) => {
        set((state) => ({ settings: { ...state.settings, ...patch } }))
      },

      updateGuest: (id, patch) => {
        set((state) => ({ guests: state.guests.map((guest) => (guest.id === id ? { ...guest, ...patch } : guest)) }))
      },

      updateRoom: (id, patch) => {
        set((state) => ({ rooms: state.rooms.map((room) => (room.id === id ? { ...room, ...patch } : room)) }))
      },

      updateRoomType: (id, patch) => {
        set((state) => ({ roomTypes: state.roomTypes.map((type) => (type.id === id ? { ...type, ...patch } : type)) }))
      },

      setOverride: (typeId, date, patch) => {
        set((state) => {
          const rest = state.calendarOverrides.filter((override) => !(override.typeId === typeId && override.date === date))
          return { calendarOverrides: [...rest, { typeId, date, ...patch }] }
        })
      },

      clearOverride: (typeId, date) => {
        set((state) => ({
          calendarOverrides: state.calendarOverrides.filter((override) => !(override.typeId === typeId && override.date === date)),
        }))
      },

      updateTaskStatus: (id, status) => {
        const state = get()
        const task = state.tasks.find((item) => item.id === id)
        if (!task) return
        const room = state.rooms.find((item) => item.id === task.roomId)
        set({
          tasks: state.tasks.map((item) => (item.id === id ? { ...item, status } : item)),
          rooms: room
            ? state.rooms.map((item) =>
                item.id === room.id
                  ? {
                      ...item,
                      housekeeping: (status === 'done' ? 'clean' : 'cleaning') as HousekeepingStatus,
                      status: status === 'done' && item.status === 'dirty' ? 'available' : item.status,
                    }
                  : item,
              )
            : state.rooms,
        })
      },

      addTask: (task) => {
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, id: `t-${crypto.randomUUID()}`, createdAt: todayKey() },
          ],
        }))
      },

      resetDemo: () => {
        const next = cloneSeed()
        set({
          settings: next.settings,
          roomTypes: next.roomTypes,
          rooms: next.rooms,
          guests: next.guests,
          bookings: next.bookings,
          payments: next.payments,
          tasks: next.tasks,
          calendarOverrides: next.calendarOverrides,
        })
      },
    }),
    {
      name: 'atrung-hotel-demo-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export function useSession() {
  return useHotelStore((state) => state.session)
}

export function getRoomType(state: Pick<HotelStore, 'roomTypes'>, typeId: string) {
  return state.roomTypes.find((type) => type.id === typeId)
}

export function getRoom(state: Pick<HotelStore, 'rooms'>, roomId: string) {
  return state.rooms.find((room) => room.id === roomId)
}

export function getGuest(state: Pick<HotelStore, 'guests'>, guestId: string) {
  return state.guests.find((guest) => guest.id === guestId)
}

export function getBooking(state: Pick<HotelStore, 'bookings'>, bookingId: string) {
  return state.bookings.find((booking) => booking.id === bookingId)
}

export function rateForDate(type: RoomType, date: string, overrides: CalendarOverride[]) {
  const override = overrides.find((item) => item.typeId === type.id && item.date === date)
  if (override?.price) return override.price
  const day = parseISO(date).getDay()
  return day === 0 || day === 6 ? type.weekendPrice : type.basePrice
}

export function nextDate(date: string, amount = 1) {
  return toDateKey(addDays(parseISO(date), amount))
}
