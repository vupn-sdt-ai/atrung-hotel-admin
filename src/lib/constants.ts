import type {
  BookingSource,
  BookingStatus,
  DemoUser,
  HousekeepingStatus,
  PaymentMethod,
  PaymentType,
  Role,
  RoomStatus,
  TaskPriority,
  TaskStatus,
} from '../types'

export const DEMO_USERS: DemoUser[] = [
  { id: 'u-owner', name: 'Anh Trưng', role: 'owner', email: 'owner@atrung.demo', phone: '0905 123 456', initials: 'AT' },
  { id: 'u-manager', name: 'Trần Mai', role: 'manager', email: 'manager@atrung.demo', phone: '0912 345 678', initials: 'TM' },
  { id: 'u-reception', name: 'Lê Hân', role: 'receptionist', email: 'letan@atrung.demo', phone: '0938 456 789', initials: 'LH' },
  { id: 'u-housekeeping', name: 'Phạm Tâm', role: 'housekeeping', email: 'buongphong@atrung.demo', phone: '0977 567 890', initials: 'PT' },
]

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Chủ homestay',
  manager: 'Quản lý',
  receptionist: 'Lễ tân',
  housekeeping: 'Buồng phòng',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: 'Toàn quyền, xem báo cáo và cấu hình',
  manager: 'Điều hành hằng ngày, giá và nhân sự',
  receptionist: 'Đặt phòng, check-in/out, thu tiền',
  housekeeping: 'Nhận việc và cập nhật trạng thái phòng',
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  checked_in: 'Đang ở',
  checked_out: 'Đã trả phòng',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
}

export const BOOKING_STATUS_CLASSES: Record<BookingStatus, string> = {
  pending: 'border-gold-300 bg-gold-100 text-gold-600',
  confirmed: 'border-sea-200 bg-sea-100 text-sea-800',
  checked_in: 'border-sage-300 bg-sage-200 text-sea-900',
  checked_out: 'border-sand-200 bg-sand-100 text-ink-500',
  cancelled: 'border-terra-300 bg-danger-100 text-danger-600',
  no_show: 'border-terra-300 bg-terra-100 text-terra-700',
}

export const BOOKING_BAR_CLASSES: Record<BookingStatus, string> = {
  pending: 'bg-gold-500/90 text-white',
  confirmed: 'bg-sea-600 text-white',
  checked_in: 'bg-sage-600 text-white',
  checked_out: 'bg-sand-400 text-ink-900',
  cancelled: 'bg-terra-500/80 text-white line-through',
  no_show: 'bg-terra-700 text-white',
}

export const SOURCE_LABELS: Record<BookingSource, string> = {
  direct: 'Trực tiếp',
  walkin: 'Walk-in',
  booking: 'Booking.com',
  agoda: 'Agoda',
  airbnb: 'Airbnb',
  zalo: 'Zalo',
}

export const SOURCE_COLORS: Record<BookingSource, string> = {
  direct: '#0B5D50',
  walkin: '#849D87',
  booking: '#1B4F8A',
  agoda: '#C56A4A',
  airbnb: '#C8A45D',
  zalo: '#238673',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  card: 'Thẻ',
  vnpay: 'VNPay',
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  deposit: 'Đặt cọc',
  payment: 'Thanh toán',
  refund: 'Hoàn tiền',
}

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Còn trống',
  occupied: 'Đang ở',
  dirty: 'Cần dọn',
  maintenance: 'Bảo trì',
}

export const ROOM_STATUS_CLASSES: Record<RoomStatus, string> = {
  available: 'border-success-100 bg-success-100 text-success-600',
  occupied: 'border-sea-200 bg-sea-100 text-sea-800',
  dirty: 'border-gold-300 bg-gold-100 text-warning-600',
  maintenance: 'border-terra-300 bg-danger-100 text-danger-600',
}

export const HOUSEKEEPING_LABELS: Record<HousekeepingStatus, string> = {
  clean: 'Sạch',
  dirty: 'Cần dọn',
  cleaning: 'Đang dọn',
  inspected: 'Đã kiểm tra',
  maintenance: 'Bảo trì',
}

export const HOUSEKEEPING_CLASSES: Record<HousekeepingStatus, string> = {
  clean: 'border-success-100 bg-success-100 text-success-600',
  dirty: 'border-gold-300 bg-gold-100 text-warning-600',
  cleaning: 'border-sea-200 bg-sea-100 text-sea-800',
  inspected: 'border-sage-200 bg-sage-100 text-sage-600',
  maintenance: 'border-terra-300 bg-danger-100 text-danger-600',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Cần làm',
  doing: 'Đang làm',
  done: 'Hoàn tất',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Thấp',
  normal: 'Bình thường',
  high: 'Cao',
  urgent: 'Gấp',
}

export const TASK_PRIORITY_CLASSES: Record<TaskPriority, string> = {
  low: 'bg-sand-100 text-ink-500',
  normal: 'bg-sea-100 text-sea-800',
  high: 'bg-gold-100 text-warning-600',
  urgent: 'bg-danger-100 text-danger-600',
}

export const HOTEL_SETTINGS = {
  name: 'A Trung Homestay',
  tagline: 'Nhà nhỏ ven biển, nơi mọi kỳ nghỉ bắt đầu chậm lại.',
  address: 'Quy Nhơn, Bình Định',
  phone: '0905 123 456',
  email: 'hello@atrunghomestay.vn',
  checkIn: '14:00',
  checkOut: '12:00',
  taxRate: 8,
  currency: 'VND',
}

export const NAV_ITEMS = [
  { href: '/', label: 'Tổng quan', icon: 'LayoutDashboard', roles: ['owner', 'manager', 'receptionist'] },
  { href: '/calendar', label: 'Lịch phòng', icon: 'CalendarRange', roles: ['owner', 'manager', 'receptionist'] },
  { href: '/bookings', label: 'Đặt phòng', icon: 'BookOpenCheck', roles: ['owner', 'manager', 'receptionist'] },
  { href: '/front-desk', label: 'Lễ tân', icon: 'ConciergeBell', roles: ['owner', 'manager', 'receptionist'] },
  { href: '/rooms', label: 'Phòng', icon: 'BedDouble', roles: ['owner', 'manager', 'receptionist', 'housekeeping'] },
  { href: '/housekeeping', label: 'Buồng phòng', icon: 'Sparkles', roles: ['owner', 'manager', 'housekeeping'] },
  { href: '/guests', label: 'Khách', icon: 'Users', roles: ['owner', 'manager', 'receptionist'] },
  { href: '/payments', label: 'Thanh toán', icon: 'WalletCards', roles: ['owner', 'manager', 'receptionist'] },
  { href: '/reports', label: 'Báo cáo', icon: 'ChartNoAxesCombined', roles: ['owner', 'manager'] },
  { href: '/settings', label: 'Cài đặt', icon: 'Settings2', roles: ['owner', 'manager'] },
] as const

export const QUICK_ACTIONS = [
  { label: 'Đặt phòng mới', description: 'Tạo booking nhanh', icon: 'CalendarPlus', href: '/bookings?new=1' },
  { label: 'Check-in', description: 'Khách đến hôm nay', icon: 'LogIn', href: '/front-desk?tab=arrivals' },
  { label: 'Walk-in', description: 'Khách nhận phòng ngay', icon: 'DoorOpen', href: '/bookings?new=1&walkin=1' },
  { label: 'Buồng phòng', description: 'Xem việc cần dọn', icon: 'Sparkles', href: '/housekeeping' },
] as const
