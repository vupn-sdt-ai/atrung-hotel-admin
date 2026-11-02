import { Badge } from '../ui/badge'
import {
  BOOKING_STATUS_CLASSES,
  BOOKING_STATUS_LABELS,
  HOUSEKEEPING_CLASSES,
  HOUSEKEEPING_LABELS,
  ROOM_STATUS_CLASSES,
  ROOM_STATUS_LABELS,
} from '../../lib/constants'
import type { BookingStatus, HousekeepingStatus, RoomStatus } from '../../types'
import { cn } from '../../lib/utils'

export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return <Badge className={cn('border', BOOKING_STATUS_CLASSES[status], className)}>{BOOKING_STATUS_LABELS[status]}</Badge>
}

export function RoomStatusBadge({ status, className }: { status: RoomStatus; className?: string }) {
  return <Badge className={cn('border', ROOM_STATUS_CLASSES[status], className)}>{ROOM_STATUS_LABELS[status]}</Badge>
}

export function HousekeepingBadge({ status, className }: { status: HousekeepingStatus; className?: string }) {
  return <Badge className={cn('border', HOUSEKEEPING_CLASSES[status], className)}>{HOUSEKEEPING_LABELS[status]}</Badge>
}
