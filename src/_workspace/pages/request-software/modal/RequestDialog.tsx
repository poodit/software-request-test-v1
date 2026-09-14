import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

type RequestDialogProps = {
  title: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  maxWidthClassName?: string
  scrollContent?: boolean
}

export function RequestDialog({ title, children, footer, onClose, maxWidthClassName = 'max-w-2xl', scrollContent = false }: RequestDialogProps) {
  const titleId = useId()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <div className='fixed inset-0 z-[100] grid min-h-dvh place-items-center overflow-hidden p-4 sm:p-6'>
      <button type='button' aria-label='Close request dialog' onClick={onClose} className='absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]' />
      <div role='dialog' aria-modal='true' aria-labelledby={titleId} className={`relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${maxWidthClassName}`}>
        <div className='flex shrink-0 items-center justify-between border-b border-white/15 bg-[var(--app-primary)] px-5 py-4 text-white'>
          <h2 id={titleId} className='text-lg font-semibold text-white'>{title}</h2>
          <Button type='button' variant='ghost' size='icon-sm' aria-label='ปิดหน้าต่าง' onClick={onClose} className='text-white hover:bg-white/15 hover:text-white'><X className='size-4' /></Button>
        </div>
        <div className={`min-h-0 overflow-y-auto overscroll-contain ${scrollContent ? 'flex-1' : ''}`}>{children}</div>
        {footer && <div className='flex shrink-0 justify-end gap-2 border-t border-slate-200 px-5 py-4'>{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
