import { useMemo, useState } from 'react'
import { ArrowRight, Check, ClipboardList, Plus, Sparkles, Timer, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useHotelStore } from '../store/useHotelStore'
import type { TaskPriority, TaskStatus } from '../types'
import { TASK_PRIORITY_CLASSES, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../lib/constants'
import { cn } from '../lib/utils'
import { PageHeader } from '../components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Avatar } from '../components/ui/primitives'
import { StatCard } from '../components/shared/data-display'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Field, Input, Select, Textarea } from '../components/ui/field'

const columns: { status: TaskStatus; title: string; icon: typeof ClipboardList }[] = [
  { status: 'todo', title: 'Cần làm', icon: ClipboardList },
  { status: 'doing', title: 'Đang dọn', icon: Timer },
  { status: 'done', title: 'Hoàn tất', icon: Check },
]

export function HousekeepingPage() {
  const rooms = useHotelStore((state) => state.rooms)
  const roomTypes = useHotelStore((state) => state.roomTypes)
  const tasks = useHotelStore((state) => state.tasks)
  const updateTaskStatus = useHotelStore((state) => state.updateTaskStatus)
  const addTask = useHotelStore((state) => state.addTask)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? '')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [assignee, setAssignee] = useState('Phạm Tâm')
  const [note, setNote] = useState('')

  const stats = useMemo(() => ({
    todo: tasks.filter((task) => task.status === 'todo').length,
    doing: tasks.filter((task) => task.status === 'doing').length,
    done: tasks.filter((task) => task.status === 'done').length,
    dirty: rooms.filter((room) => room.status === 'dirty').length,
  }), [tasks, rooms])

  const submit = () => {
    if (!title.trim() || !roomId) {
      toast.error('Nhập tên việc và chọn phòng')
      return
    }
    addTask({ roomId, title, note, status: 'todo', priority, assignee })
    toast.success('Đã thêm việc buồng phòng')
    setOpen(false)
    setTitle('')
    setNote('')
    setPriority('normal')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Housekeeping"
        title="Buồng phòng"
        description="Bảng việc theo trạng thái, ưu tiên phòng có khách đến trong ngày."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Thêm việc</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Cần làm" value={`${stats.todo}`} sub="việc đang chờ" icon={ClipboardList} tone="gold" />
        <StatCard label="Đang dọn" value={`${stats.doing}`} sub="nhân viên đang xử lý" icon={Timer} tone="sea" />
        <StatCard label="Hoàn tất" value={`${stats.done}`} sub="trong ngày" icon={Check} tone="sage" />
        <StatCard label="Phòng cần dọn" value={`${stats.dirty}`} sub="ưu tiên trước 14:00" icon={Sparkles} tone="terra" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const list = tasks.filter((task) => task.status === column.status)
          return (
            <Card key={column.status} className={cn(column.status === 'done' && 'opacity-80')}>
              <CardHeader className="flex-row items-center justify-start gap-2">
                <span className={cn('grid h-8 w-8 place-items-center rounded-xl', column.status === 'todo' ? 'bg-gold-100 text-warning-600' : column.status === 'doing' ? 'bg-sea-100 text-sea-800' : 'bg-success-100 text-success-600')}>
                  <column.icon className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-base">{column.title}</CardTitle>
                  <p className="text-[10px] text-ink-400">{list.length} việc</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-3">
                {list.length === 0 && <p className="rounded-2xl border border-dashed border-sand-300 p-5 text-center text-[11px] text-ink-400">Không có việc</p>}
                {list.map((task) => {
                  const room = rooms.find((item) => item.id === task.roomId)
                  const type = room ? roomTypes.find((item) => item.id === room.typeId) : undefined
                  const nextStatus: TaskStatus = task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo'
                  return (
                    <div key={task.id} className="rounded-2xl border border-sand-200/70 bg-white/55 p-3 transition hover:bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-sand-100 font-display text-sm font-semibold text-ink-900">{room?.number}</span>
                          <div>
                            <p className="text-[11px] font-semibold text-ink-900">{room?.number} · {room?.name}</p>
                            <p className="text-[9px] text-ink-400">{type?.name} · {room?.floorLabel}</p>
                          </div>
                        </div>
                        <Badge className={cn('border-0', TASK_PRIORITY_CLASSES[task.priority])}>{TASK_PRIORITY_LABELS[task.priority]}</Badge>
                      </div>
                      <p className="mt-2.5 text-xs font-semibold text-ink-900">{task.title}</p>
                      {task.note && <p className="mt-1 text-[10px] leading-relaxed text-ink-500">{task.note}</p>}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-ink-500"><Avatar name={task.assignee} size="sm" className="h-6 w-6 text-[8px]" /> {task.assignee}</span>
                        <Button size="sm" variant={task.status === 'done' ? 'ghost' : 'outline'} onClick={() => updateTaskStatus(task.id, nextStatus)}>
                          {task.status === 'done' ? <><Sparkles className="h-3 w-3" /> Mở lại</> : <>{TASK_STATUS_LABELS[nextStatus]} <ArrowRight className="h-3 w-3" /></>}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-sea-50/70">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sea-700 text-sand-50"><UserRound className="h-4 w-4" /></span>
            <div>
              <p className="text-xs font-semibold text-ink-900">Giao việc từ điện thoại</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-ink-500">Nhân viên buồng phòng có thể mở PWA, nhận việc và đổi trạng thái ngay tại phòng.</p>
            </div>
          </div>
          <Badge tone="sea">PWA ready</Badge>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm việc buồng phòng</DialogTitle>
            <DialogDescription>Tạo việc dọn phòng, kiểm tra hoặc bảo trì.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-5 pb-5 sm:px-6">
            <Field label="Tên việc" required><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Dọn phòng trước giờ nhận khách" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phòng">
                <Select value={roomId} onChange={(event) => setRoomId(event.target.value)}>
                  {rooms.map((room) => <option key={room.id} value={room.id}>{room.number} · {room.name}</option>)}
                </Select>
              </Field>
              <Field label="Ưu tiên">
                <Select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
                  {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Người phụ trách"><Input value={assignee} onChange={(event) => setAssignee(event.target.value)} /></Field>
            <Field label="Ghi chú"><Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: khách cần thêm 2 khăn tắm..." /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={submit}>Thêm việc</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
