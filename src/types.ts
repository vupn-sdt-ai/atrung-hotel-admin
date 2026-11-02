export type Role = 'owner' | 'manager' | 'receptionist' | 'housekeeping'

export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'maintenance'

export type HousekeepingStatus = 'clean' | 'dirty' | 'cleaning' | 'inspected' | 'maintenance'

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'

export type BookingSource = 'direct' | 'walkin' | 'booking' | 'agoda' | 'airbnb' | 'zalo'

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'vnpay'

export type PaymentType = 'deposit' | 'payment' | 'refund'

export type TaskStatus = 'todo' | 'doing' | 'done'

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface DemoUser {
  id: string
  name: string
  role: Role
  email: string
  phone: string
  initials: string
}

export interface RoomType {
  id: string
  name: string
  nameEn: string
  description: string
  size: number
  bed: string
  maxAdults: number
  maxChildren: number
  basePrice: number
  weekendPrice: number
  amenities: string[]
  images: string[]
}

export interface Room {
  id: string
  number: string
  name: string
  floor: number
  floorLabel: string
  typeId: string
  coverImage?: string
  status: RoomStatus
  housekeeping: HousekeepingStatus
  note?: string
}

export interface Guest {
  id: string
  name: string
  phone: string
  email: string
  nationality: string
  idNumber?: string
  tags: string[]
  notes: string
  createdAt: string
}

export interface BookingExtra {
  id: string
  name: string
  quantity: number
  price: number
}

export interface Booking {
  id: string
  code: string
  guestId: string
  roomId: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  source: BookingSource
  status: BookingStatus
  nightlyRate: number
  total: number
  paid: number
  extras: BookingExtra[]
  notes: string
  createdAt: string
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  method: PaymentMethod
  type: PaymentType
  date: string
  note: string
  invoiceNo: string
}

export interface HousekeepingTask {
  id: string
  roomId: string
  title: string
  note: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  createdAt: string
}

export interface CalendarOverride {
  typeId: string
  date: string
  price?: number
  closed?: boolean
  available?: number
}

export interface HotelSettings {
  name: string
  tagline: string
  address: string
  phone: string
  email: string
  checkIn: string
  checkOut: string
  taxRate: number
  currency: string
}

export interface NewBookingInput {
  guestName: string
  guestPhone: string
  guestEmail: string
  nationality: string
  roomId: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  source: BookingSource
  nightlyRate: number
  deposit: number
  notes: string
  breakfast: boolean
  extraBed: boolean
}

export interface CheckInInput {
  deposit: number
  idNumber: string
  note: string
}

export interface CheckOutInput {
  extras: BookingExtra[]
  discount: number
  paymentAmount: number
  method: PaymentMethod
  note: string
}
