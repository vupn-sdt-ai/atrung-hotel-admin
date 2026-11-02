import { addDays, differenceInCalendarDays, format, isWeekend, nextSaturday, parseISO, startOfDay } from 'date-fns'
import { HOTEL_SETTINGS } from '../lib/constants'
import { nightsBetween, toDateKey } from '../lib/utils'
import type {
  Booking,
  BookingSource,
  CalendarOverride,
  Guest,
  HousekeepingTask,
  Payment,
  PaymentMethod,
  Room,
  RoomType,
} from '../types'

const today = startOfDay(new Date())
const key = (offset: number) => toDateKey(addDays(today, offset))

const roomTypes: RoomType[] = [
  {
    id: 'garden',
    name: 'Garden Double',
    nameEn: 'Garden Double',
    description:
      'Phòng đôi ấm áp nhìn ra khu vườn nhỏ, ánh sáng tự nhiên buổi sáng và khoảng nghỉ yên tĩnh. Phù hợp cho cặp đôi hoặc chuyến đi ngắn ngày.',
    size: 26,
    bed: '1 giường đôi 1m6',
    maxAdults: 2,
    maxChildren: 1,
    basePrice: 650_000,
    weekendPrice: 750_000,
    amenities: ['Điều hoà', 'Wi-Fi', 'Nước nóng', 'Tủ lạnh mini', 'Ấm đun nước', 'View vườn', 'Dọn phòng hằng ngày'],
    images: [
      '/images/rooms/p1-garden.webp',
      '/images/rooms/p2-garden.webp',
      '/images/rooms/detail-5.webp',
      '/images/rooms/detail-2.webp',
    ],
  },
  {
    id: 'deluxe',
    name: 'Deluxe Balcony',
    nameEn: 'Deluxe Balcony',
    description:
      'Phòng deluxe có ban công riêng, đón gió biển và nắng sớm. Không gian rộng hơn với góc làm việc nhỏ, phù hợp kỳ nghỉ 2–3 đêm.',
    size: 32,
    bed: '1 giường King 1m8',
    maxAdults: 2,
    maxChildren: 2,
    basePrice: 950_000,
    weekendPrice: 1_100_000,
    amenities: ['Ban công riêng', 'Điều hoà', 'Wi-Fi', 'Smart TV', 'Minibar', 'Bàn làm việc', 'View biển', 'Dọn phòng hằng ngày'],
    images: [
      '/images/rooms/p3-balcony.webp',
      '/images/rooms/p3-window.webp',
      '/images/rooms/p4-deluxe.webp',
      '/images/rooms/detail-6.webp',
    ],
  },
  {
    id: 'family',
    name: 'Family Suite',
    nameEn: 'Family Suite',
    description:
      'Suite gia đình với hai khu ngủ, phòng khách nhỏ và cửa sổ lớn. Đủ chỗ cho gia đình 4 người, có thêm giường phụ khi cần.',
    size: 38,
    bed: '1 King + 2 giường đơn',
    maxAdults: 4,
    maxChildren: 2,
    basePrice: 1_350_000,
    weekendPrice: 1_550_000,
    amenities: ['2 khu ngủ', 'Điều hoà', 'Wi-Fi', 'Smart TV', 'Minibar', 'Bồn tắm', 'Ấm đun nước', 'View vườn'],
    images: [
      '/images/rooms/p5-family.webp',
      '/images/rooms/detail-7.webp',
      '/images/rooms/detail-4.webp',
      '/images/rooms/detail-1.webp',
    ],
  },
  {
    id: 'terrace',
    name: 'Terrace Suite',
    nameEn: 'Terrace Suite',
    description:
      'Phòng tầng tum với sân thượng riêng, nơi ngồi ngắm hoàng hôn và nghe tiếng biển. Lựa chọn dành cho kỳ nghỉ chậm và riêng tư.',
    size: 30,
    bed: '1 giường King 1m8',
    maxAdults: 2,
    maxChildren: 1,
    basePrice: 1_150_000,
    weekendPrice: 1_300_000,
    amenities: ['Sân thượng riêng', 'Điều hoà', 'Wi-Fi', 'Smart TV', 'Minibar', 'Ghế thư giãn', 'View biển', 'Dọn phòng hằng ngày'],
    images: [
      '/images/rooms/p6-terrace.webp',
      '/images/rooms/p7-terrace.webp',
      '/images/rooms/pool.webp',
      '/images/rooms/detail-3.webp',
    ],
  },
]

const rooms: Room[] = [
  { id: 'r1', number: 'P1', name: 'Vườn Xanh', floor: 1, floorLabel: 'Tầng 1', typeId: 'garden', coverImage: '/images/rooms/p1-garden.webp', status: 'occupied', housekeeping: 'clean' },
  { id: 'r2', number: 'P2', name: 'Nắng Sớm', floor: 1, floorLabel: 'Tầng 1', typeId: 'garden', coverImage: '/images/rooms/p2-garden.webp', status: 'occupied', housekeeping: 'clean' },
  { id: 'r3', number: 'P3', name: 'Ban Công Gió', floor: 2, floorLabel: 'Tầng 2', typeId: 'deluxe', coverImage: '/images/rooms/p3-balcony.webp', status: 'occupied', housekeeping: 'clean' },
  { id: 'r4', number: 'P4', name: 'Mây Trắng', floor: 2, floorLabel: 'Tầng 2', typeId: 'deluxe', coverImage: '/images/rooms/p4-deluxe.webp', status: 'dirty', housekeeping: 'dirty' },
  { id: 'r5', number: 'P5', name: 'Gia Đình', floor: 2, floorLabel: 'Tầng 2', typeId: 'family', coverImage: '/images/rooms/p5-family.webp', status: 'available', housekeeping: 'clean' },
  { id: 'r6', number: 'P6', name: 'Sân Thượng', floor: 3, floorLabel: 'Tầng tum', typeId: 'terrace', coverImage: '/images/rooms/p6-terrace.webp', status: 'occupied', housekeeping: 'inspected' },
  { id: 'r7', number: 'P7', name: 'Hoàng Hôn', floor: 3, floorLabel: 'Tầng tum', typeId: 'terrace', coverImage: '/images/rooms/p7-terrace.webp', status: 'occupied', housekeeping: 'clean' },
]

const guests: Guest[] = [
  {
    id: 'g1',
    name: 'Nguyễn Thu Hà',
    phone: '0905 214 668',
    email: 'thuha.nguyen@gmail.com',
    nationality: 'Việt Nam',
    idNumber: '0512 004 118',
    tags: ['Khách quen', 'Thích tầng cao'],
    notes: 'Thích trà hoa cúc, ưu tiên phòng yên tĩnh.',
    createdAt: key(-320),
  },
  {
    id: 'g2',
    name: 'Trần Quốc Bảo',
    phone: '0912 734 510',
    email: 'quocbao.tran@gmail.com',
    nationality: 'Việt Nam',
    tags: ['Khách doanh nghiệp'],
    notes: 'Thanh toán chuyển khoản, cần hóa đơn VAT.',
    createdAt: key(-280),
  },
  {
    id: 'g3',
    name: 'Emma Wilson',
    phone: '+44 7700 900123',
    email: 'emma.wilson@example.com',
    nationality: 'Anh',
    idNumber: 'GB 548 992 11',
    tags: ['Khách quốc tế', 'Honeymoon'],
    notes: 'Đến muộn, cần hỗ trợ đặt xe sân bay.',
    createdAt: key(-210),
  },
  {
    id: 'g4',
    name: 'Lê Minh Anh',
    phone: '0938 662 147',
    email: 'minhanh.le@gmail.com',
    nationality: 'Việt Nam',
    tags: ['Khách quen', 'Gia đình'],
    notes: 'Có bé 4 tuổi, cần thêm gối nhỏ.',
    createdAt: key(-190),
  },
  {
    id: 'g5',
    name: 'Phạm Gia Hân',
    phone: '0977 831 205',
    email: 'giahan.pham@gmail.com',
    nationality: 'Việt Nam',
    tags: ['Zalo'],
    notes: 'Đặt qua Zalo, thích check-in sớm nếu phòng sẵn.',
    createdAt: key(-150),
  },
  {
    id: 'g6',
    name: 'David Nguyen',
    phone: '+1 415 555 0182',
    email: 'david.nguyen@example.com',
    nationality: 'Hoa Kỳ',
    idNumber: 'US 5521 8890',
    tags: ['Khách quốc tế'],
    notes: 'Ưu tiên tầng thấp, không dùng đồ minibar.',
    createdAt: key(-130),
  },
  {
    id: 'g7',
    name: 'Võ Hoài Nam',
    phone: '0903 447 812',
    email: 'hoainam.vo@gmail.com',
    nationality: 'Việt Nam',
    tags: ['Gia đình', 'Direct'],
    notes: 'Đi 4 người, cần 2 giường phụ.',
    createdAt: key(-110),
  },
  {
    id: 'g8',
    name: 'Sophie Martin',
    phone: '+33 6 12 34 56 78',
    email: 'sophie.martin@example.com',
    nationality: 'Pháp',
    idNumber: 'FR 17 884 221',
    tags: ['Khách quốc tế', 'Thích yên tĩnh'],
    notes: 'Dị ứng hải sản, cần ghi chú bữa sáng.',
    createdAt: key(-90),
  },
  {
    id: 'g9',
    name: 'Đặng Khánh Linh',
    phone: '0966 128 445',
    email: 'khanhlinh.dang@gmail.com',
    nationality: 'Việt Nam',
    tags: ['Khách quen'],
    notes: 'Thường đặt phòng ban công, thích hoa tươi.',
    createdAt: key(-70),
  },
  {
    id: 'g10',
    name: 'Hiroshi Tanaka',
    phone: '+81 90 1234 5678',
    email: 'hiroshi.tanaka@example.com',
    nationality: 'Nhật Bản',
    idNumber: 'JP 229 884 01',
    tags: ['Khách quốc tế'],
    notes: 'Cần hướng dẫn bằng tiếng Anh, đến muộn.',
    createdAt: key(-45),
  },
]

const sources: BookingSource[] = ['direct', 'walkin', 'booking', 'agoda', 'airbnb', 'zalo']
const methods: PaymentMethod[] = ['cash', 'transfer', 'card', 'vnpay']
const monthCode = format(today, 'yyMM')

const currentBookings: Booking[] = [
  {
    id: 'b1',
    code: `AT-${monthCode}-001`,
    guestId: 'g1',
    roomId: 'r1',
    checkIn: key(-2),
    checkOut: key(0),
    adults: 2,
    children: 0,
    source: 'direct',
    status: 'checked_in',
    nightlyRate: 650_000,
    total: 1_300_000,
    paid: 650_000,
    extras: [],
    notes: 'Khách trả phòng sau 12h, cần giữ hành lý.',
    createdAt: key(-12),
  },
  {
    id: 'b2',
    code: `AT-${monthCode}-002`,
    guestId: 'g2',
    roomId: 'r2',
    checkIn: key(-1),
    checkOut: key(2),
    adults: 2,
    children: 0,
    source: 'booking',
    status: 'checked_in',
    nightlyRate: 650_000,
    total: 1_950_000,
    paid: 1_300_000,
    extras: [{ id: 'e1', name: 'Ăn sáng', quantity: 2, price: 80_000 }],
    notes: 'Cần hóa đơn VAT, thanh toán chuyển khoản.',
    createdAt: key(-20),
  },
  {
    id: 'b3',
    code: `AT-${monthCode}-003`,
    guestId: 'g3',
    roomId: 'r3',
    checkIn: key(-3),
    checkOut: key(1),
    adults: 2,
    children: 0,
    source: 'agoda',
    status: 'checked_in',
    nightlyRate: 950_000,
    total: 3_800_000,
    paid: 3_800_000,
    extras: [],
    notes: 'Honeymoon, đã chuẩn bị hoa và thiệp chúc mừng.',
    createdAt: key(-40),
  },
  {
    id: 'b4',
    code: `AT-${monthCode}-004`,
    guestId: 'g4',
    roomId: 'r7',
    checkIn: key(-2),
    checkOut: key(2),
    adults: 2,
    children: 1,
    source: 'direct',
    status: 'checked_in',
    nightlyRate: 1_150_000,
    total: 4_600_000,
    paid: 2_300_000,
    extras: [],
    notes: 'Cần thêm gối nhỏ cho bé, đã đặt trước.',
    createdAt: key(-25),
  },
  {
    id: 'b5',
    code: `AT-${monthCode}-005`,
    guestId: 'g5',
    roomId: 'r6',
    checkIn: key(-1),
    checkOut: key(1),
    adults: 2,
    children: 0,
    source: 'zalo',
    status: 'checked_in',
    nightlyRate: 1_150_000,
    total: 2_300_000,
    paid: 2_300_000,
    extras: [],
    notes: 'Khách quen, đã thanh toán đủ.',
    createdAt: key(-15),
  },
  {
    id: 'b6',
    code: `AT-${monthCode}-006`,
    guestId: 'g6',
    roomId: 'r4',
    checkIn: key(0),
    checkOut: key(2),
    adults: 2,
    children: 0,
    source: 'booking',
    status: 'confirmed',
    nightlyRate: 950_000,
    total: 1_900_000,
    paid: 570_000,
    extras: [],
    notes: 'Đến khoảng 20:00, cần hỗ trợ giữ xe.',
    createdAt: key(-18),
  },
  {
    id: 'b7',
    code: `AT-${monthCode}-007`,
    guestId: 'g7',
    roomId: 'r5',
    checkIn: key(0),
    checkOut: key(3),
    adults: 4,
    children: 0,
    source: 'direct',
    status: 'confirmed',
    nightlyRate: 1_350_000,
    total: 4_050_000,
    paid: 0,
    extras: [{ id: 'e2', name: 'Giường phụ', quantity: 2, price: 150_000 }],
    notes: 'Gia đình 4 người, cần 2 giường phụ. Chưa đặt cọc.',
    createdAt: key(-8),
  },
  {
    id: 'b8',
    code: `AT-${monthCode}-008`,
    guestId: 'g8',
    roomId: 'r1',
    checkIn: key(1),
    checkOut: key(4),
    adults: 2,
    children: 0,
    source: 'airbnb',
    status: 'confirmed',
    nightlyRate: 650_000,
    total: 1_950_000,
    paid: 585_000,
    extras: [],
    notes: 'Dị ứng hải sản, ghi chú bữa sáng.',
    createdAt: key(-11),
  },
  {
    id: 'b9',
    code: `AT-${monthCode}-009`,
    guestId: 'g9',
    roomId: 'r3',
    checkIn: key(2),
    checkOut: key(5),
    adults: 2,
    children: 0,
    source: 'direct',
    status: 'confirmed',
    nightlyRate: 950_000,
    total: 2_850_000,
    paid: 855_000,
    extras: [],
    notes: 'Thích hoa tươi trong phòng.',
    createdAt: key(-6),
  },
  {
    id: 'b10',
    code: `AT-${monthCode}-010`,
    guestId: 'g10',
    roomId: 'r4',
    checkIn: key(4),
    checkOut: key(6),
    adults: 2,
    children: 0,
    source: 'agoda',
    status: 'pending',
    nightlyRate: 950_000,
    total: 1_900_000,
    paid: 0,
    extras: [],
    notes: 'Chờ khách xác nhận phương thức thanh toán.',
    createdAt: key(-2),
  },
  {
    id: 'b11',
    code: `AT-${monthCode}-011`,
    guestId: 'g1',
    roomId: 'r5',
    checkIn: key(5),
    checkOut: key(8),
    adults: 3,
    children: 1,
    source: 'booking',
    status: 'confirmed',
    nightlyRate: 1_350_000,
    total: 4_050_000,
    paid: 1_215_000,
    extras: [],
    notes: 'Khách quay lại, ưu tiên phòng yên tĩnh.',
    createdAt: key(-4),
  },
  {
    id: 'b12',
    code: `AT-${monthCode}-012`,
    guestId: 'g2',
    roomId: 'r6',
    checkIn: key(-6),
    checkOut: key(-3),
    adults: 2,
    children: 0,
    source: 'direct',
    status: 'checked_out',
    nightlyRate: 1_150_000,
    total: 3_450_000,
    paid: 3_450_000,
    extras: [],
    notes: 'Đã trả phòng, thanh toán đủ.',
    createdAt: key(-14),
  },
  {
    id: 'b13',
    code: `AT-${monthCode}-013`,
    guestId: 'g4',
    roomId: 'r2',
    checkIn: key(3),
    checkOut: key(5),
    adults: 2,
    children: 1,
    source: 'agoda',
    status: 'cancelled',
    nightlyRate: 650_000,
    total: 1_300_000,
    paid: 0,
    extras: [],
    notes: 'Khách hủy do thay đổi lịch trình.',
    createdAt: key(-9),
  },
  {
    id: 'b14',
    code: `AT-${monthCode}-014`,
    guestId: 'g6',
    roomId: 'r7',
    checkIn: key(-1),
    checkOut: key(1),
    adults: 2,
    children: 0,
    source: 'booking',
    status: 'no_show',
    nightlyRate: 1_150_000,
    total: 2_300_000,
    paid: 0,
    extras: [],
    notes: 'Không đến, đã liên hệ nhưng không phản hồi.',
    createdAt: key(-16),
  },
]

function makePayment(booking: Booking, amount: number, method: PaymentMethod, date: string, type: Payment['type']): Payment {
  return {
    id: `p-${booking.id}-${type}-${date}`,
    bookingId: booking.id,
    amount,
    method,
    type,
    date,
    note: type === 'deposit' ? 'Đặt cọc giữ phòng' : type === 'refund' ? 'Hoàn tiền cho khách' : 'Thanh toán tiền phòng',
    invoiceNo: `HD-${booking.code.replace('AT-', '')}`,
  }
}

const currentPayments: Payment[] = [
  makePayment(currentBookings[0], 650_000, 'cash', key(-2), 'deposit'),
  makePayment(currentBookings[1], 1_300_000, 'transfer', key(-1), 'deposit'),
  makePayment(currentBookings[2], 3_800_000, 'card', key(-3), 'payment'),
  makePayment(currentBookings[3], 2_300_000, 'transfer', key(-2), 'deposit'),
  makePayment(currentBookings[4], 2_300_000, 'vnpay', key(-1), 'payment'),
  makePayment(currentBookings[5], 570_000, 'transfer', key(-3), 'deposit'),
  makePayment(currentBookings[7], 585_000, 'card', key(-1), 'deposit'),
  makePayment(currentBookings[8], 855_000, 'cash', key(0), 'deposit'),
  makePayment(currentBookings[10], 1_215_000, 'transfer', key(-2), 'deposit'),
  makePayment(currentBookings[11], 3_450_000, 'cash', key(-3), 'payment'),
]

function pseudoRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function buildHistory() {
  const random = pseudoRandom(1801)
  const history: Booking[] = []
  const historyPayments: Payment[] = []
  let counter = 100

  for (const room of rooms) {
    const type = roomTypes.find((item) => item.id === room.typeId)
    if (!type) continue
    let cursor = addDays(today, -36)
    const limit = addDays(today, -6)

    while (differenceInCalendarDays(limit, cursor) >= 2) {
      const stay = 1 + Math.floor(random() * 3)
      const checkIn = cursor
      const checkOut = addDays(checkIn, stay)
      if (checkOut > limit) break
      const guest = guests[Math.floor(random() * guests.length)]
      const source = sources[Math.floor(random() * sources.length)]
      const weekendNights = Array.from({ length: stay }, (_, index) => isWeekend(addDays(checkIn, index))).filter(Boolean).length
      const nightlyRate = type.basePrice + (weekendNights > 0 ? Math.round(type.basePrice * 0.12) : 0)
      const total = nightlyRate * stay
      const booking: Booking = {
        id: `h-${room.id}-${counter}`,
        code: `AT-H${String(counter).padStart(3, '0')}`,
        guestId: guest.id,
        roomId: room.id,
        checkIn: toDateKey(checkIn),
        checkOut: toDateKey(checkOut),
        adults: 1 + Math.floor(random() * Math.min(3, type.maxAdults)),
        children: 0,
        source,
        status: 'checked_out',
        nightlyRate,
        total,
        paid: total,
        extras: [],
        notes: '',
        createdAt: toDateKey(addDays(checkIn, -7)),
      }
      history.push(booking)
      historyPayments.push(
        makePayment(
          booking,
          total,
          methods[Math.floor(random() * methods.length)],
          toDateKey(addDays(checkOut, -1)),
          'payment',
        ),
      )
      counter += 1
      cursor = addDays(checkOut, Math.floor(random() * 3))
    }
  }

  return { history, historyPayments }
}

const { history, historyPayments } = buildHistory()

const tasks: HousekeepingTask[] = [
  {
    id: 't1',
    roomId: 'r4',
    title: 'Dọn phòng gấp trước giờ nhận phòng',
    note: 'Khách đến lúc 20:00. Ưu tiên thay ga, khăn và kiểm tra điều hoà.',
    status: 'todo',
    priority: 'urgent',
    assignee: 'Phạm Tâm',
    createdAt: key(0),
  },
  {
    id: 't2',
    roomId: 'r1',
    title: 'Thay khăn và bổ sung nước',
    note: 'Khách trả phòng sau 12h, chỉ cần bổ sung nhanh.',
    status: 'todo',
    priority: 'high',
    assignee: 'Nguyễn Hoa',
    createdAt: key(0),
  },
  {
    id: 't3',
    roomId: 'r2',
    title: 'Dọn phòng hằng ngày',
    note: 'Khách đang ở, dọn sau 10:00.',
    status: 'doing',
    priority: 'normal',
    assignee: 'Phạm Tâm',
    createdAt: key(0),
  },
  {
    id: 't4',
    roomId: 'r6',
    title: 'Kiểm tra minibar & ban công',
    note: 'Đã kiểm tra, bổ sung 2 chai nước.',
    status: 'done',
    priority: 'normal',
    assignee: 'Nguyễn Hoa',
    createdAt: key(-1),
  },
  {
    id: 't5',
    roomId: 'r7',
    title: 'Vệ sinh ban công',
    note: 'Lau sàn và thay khăn bàn ngoài trời.',
    status: 'done',
    priority: 'low',
    assignee: 'Phạm Tâm',
    createdAt: key(-1),
  },
]

const saturday = nextSaturday(today)
const overrides: CalendarOverride[] = [
  { typeId: 'garden', date: toDateKey(addDays(saturday, -1)), price: 790_000 },
  { typeId: 'garden', date: toDateKey(saturday), price: 790_000 },
  { typeId: 'deluxe', date: toDateKey(saturday), price: 1_150_000 },
  { typeId: 'family', date: toDateKey(addDays(saturday, 7)), closed: true },
]

export function createSeedData() {
  const bookings = [...currentBookings, ...history]
  const payments = [...currentPayments, ...historyPayments]
  return {
    settings: { ...HOTEL_SETTINGS },
    roomTypes,
    rooms,
    guests,
    bookings,
    payments,
    tasks,
    calendarOverrides: overrides,
  }
}

export const seed = createSeedData()

export type SeedData = ReturnType<typeof createSeedData>

export function bookingNightsFromDates(checkIn: string, checkOut: string) {
  return nightsBetween(checkIn, checkOut)
}

export function settleDate(keyValue: string) {
  return parseISO(keyValue)
}
