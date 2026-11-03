import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentPropsWithoutRef, ElementRef, HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-ink-900/45 backdrop-blur-[3px] print:hidden', className)}
    {...props}
  />
))
DialogOverlay.displayName = 'DialogOverlay'

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideClose?: boolean }
>(({ className, children, hideClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 max-h-[92svh] w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/60 bg-sand-50 p-0 shadow-lift outline-none sm:max-h-[90vh]',
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-ink-500 shadow-sm transition hover:bg-white hover:text-ink-900 print:hidden">
          <X className="h-4 w-4" />
          <span className="sr-only">Đóng</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = 'DialogContent'

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1.5 px-5 pb-2 pt-6 sm:px-6', className)} {...props} />
}

export function DialogTitle({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('font-display text-xl font-semibold tracking-[-0.03em] text-ink-900', className)} {...props} />
}

export function DialogDescription({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-xs leading-relaxed text-ink-500 sm:text-sm', className)} {...props} />
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'sticky bottom-0 flex flex-col-reverse gap-2 border-t border-sand-200/70 bg-sand-50/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-6',
        className,
      )}
      {...props}
    />
  )
}

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export const SheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-white/60 bg-sand-50 p-0 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-lift outline-none',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] z-10 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-ink-500 shadow-sm transition hover:bg-white hover:text-ink-900">
        <X className="h-4 w-4" />
        <span className="sr-only">Đóng</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
SheetContent.displayName = 'SheetContent'

export function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-2 px-5 pb-4 pt-6 sm:px-7', className)} {...props} />
}

export function SheetTitle({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900', className)} {...props} />
}

export function SheetDescription({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-sm leading-relaxed text-ink-500', className)} {...props} />
}

export function SheetBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 space-y-5 px-5 pb-6 sm:px-7', className)} {...props} />
}

export function SheetFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'sticky bottom-0 mt-auto flex flex-col-reverse gap-2 border-t border-sand-200/70 bg-sand-50/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-7',
        className,
      )}
      {...props}
    />
  )
}
