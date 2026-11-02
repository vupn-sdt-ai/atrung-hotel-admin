import { useEffect, useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useHotelStore } from '../../store/useHotelStore'
import type { HousekeepingStatus, RoomStatus } from '../../types'
import { HOUSEKEEPING_LABELS, ROOM_STATUS_LABELS } from '../../lib/constants'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Field, Input, Select, Textarea } from '../ui/field'

export function RoomEditDialog({ roomId, open, onOpenChange }: { roomId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const rooms = useHotelStore((state) => state.rooms)
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const updateRoom = useHotelStore((state) => state.updateRoom)
  const updateRoomType = useHotelStore((state) => state.updateRoomType)
  const room = rooms.find((item) => item.id === roomId)
  const type = room ? roomTypes.find((item) => item.id === room.typeId) : undefined
  const [name, setName] = useState('')
  const [basePrice, setBasePrice] = useState(0)
  const [weekendPrice, setWeekendPrice] = useState(0)
  const [size, setSize] = useState(0)
  const [bed, setBed] = useState('')
  const [maxAdults, setMaxAdults] = useState(2)
  const [maxChildren, setMaxChildren] = useState(1)
  const [description, setDescription] = useState('')
  const [amenities, setAmenities] = useState('')
  const [cover, setCover] = useState('')
  const [status, setStatus] = useState<RoomStatus>('available')
  const [housekeeping, setHousekeeping] = useState<HousekeepingStatus>('clean')

  useEffect(() => {
    if (!open || !room || !type) return
    setName(room.name)
    setBasePrice(type.basePrice)
    setWeekendPrice(type.weekendPrice)
    setSize(type.size)
    setBed(type.bed)
    setMaxAdults(type.maxAdults)
    setMaxChildren(type.maxChildren)
    setDescription(type.description)
    setAmenities(type.amenities.join(', '))
    setCover(room.coverImage ?? type.images[0] ?? '')
    setStatus(room.status)
    setHousekeeping(room.housekeeping)
  }, [open, roomId])

  if (!room || !type) return null

  const save = () => {
    const nextImages = [cover, ...type.images.filter((image) => image !== cover)].filter(Boolean)
    updateRoomType(type.id, {
      basePrice,
      weekendPrice,
      size,
      bed,
      maxAdults,
      maxChildren,
      description,
      amenities: amenities.split(',').map((item) => item.trim()).filter(Boolean),
      images: nextImages,
    })
    updateRoom(room.id, { name, status, housekeeping, coverImage: cover })
    toast.success(`Đã cập nhật ${room.number}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa {room.number}</DialogTitle>
          <DialogDescription>Giá và mô tả áp dụng cho loại phòng {type.name}. Trạng thái áp dụng riêng phòng này.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 px-5 py-4 sm:px-6 sm:grid-cols-2">
          <Field label="Tên phòng">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Ảnh bìa">
            <Select value={cover} onChange={(event) => setCover(event.target.value)}>
              {[...new Set([room.coverImage, ...type.images].filter((image): image is string => Boolean(image)))].map((image) => <option key={image} value={image}>{image.split('/').pop()}</option>)}
            </Select>
          </Field>
          <Field label="Giá ngày thường">
            <Input type="number" min={0} step={50_000} value={basePrice} onChange={(event) => setBasePrice(Number(event.target.value))} />
          </Field>
          <Field label="Giá cuối tuần">
            <Input type="number" min={0} step={50_000} value={weekendPrice} onChange={(event) => setWeekendPrice(Number(event.target.value))} />
          </Field>
          <Field label="Diện tích (m²)">
            <Input type="number" min={0} value={size} onChange={(event) => setSize(Number(event.target.value))} />
          </Field>
          <Field label="Giường">
            <Input value={bed} onChange={(event) => setBed(event.target.value)} />
          </Field>
          <Field label="Người lớn tối đa">
            <Input type="number" min={1} value={maxAdults} onChange={(event) => setMaxAdults(Number(event.target.value))} />
          </Field>
          <Field label="Trẻ em tối đa">
            <Input type="number" min={0} value={maxChildren} onChange={(event) => setMaxChildren(Number(event.target.value))} />
          </Field>
          <Field label="Trạng thái phòng">
            <Select value={status} onChange={(event) => setStatus(event.target.value as RoomStatus)}>
              {Object.entries(ROOM_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </Field>
          <Field label="Buồng phòng">
            <Select value={housekeeping} onChange={(event) => setHousekeeping(event.target.value as HousekeepingStatus)}>
              {Object.entries(HOUSEKEEPING_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Mô tả">
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Tiện nghi" hint="Phân tách bằng dấu phẩy">
              <Input value={amenities} onChange={(event) => setAmenities(event.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2 flex items-center gap-3 rounded-2xl border border-sand-200 bg-white/50 p-3">
            <img src={cover} alt="" className="h-16 w-24 rounded-xl object-cover" />
            <div className="text-[10px] text-ink-500">
              <p className="flex items-center gap-1 font-semibold text-ink-800"><ImageIcon className="h-3.5 w-3.5" /> Ảnh đang chọn</p>
              <p className="mt-1">Ảnh demo từ thư viện. Khi có ảnh thật, chỉ cần thay file trong thư mục public/images.</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={save}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
