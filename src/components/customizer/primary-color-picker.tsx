import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type PrimaryColorPickerProps = {
  value: string
  isDark: boolean
  onCommit: (value: string) => void
}

const isHexColor = (value: string) => /^#[\da-fA-F]{6}$/.test(value)

export function PrimaryColorPicker({ value, isDark, onCommit }: PrimaryColorPickerProps) {
  const [draftColor, setDraftColor] = useState(value)

  useEffect(() => {
    if (draftColor === value || !isHexColor(draftColor)) return

    const timer = window.setTimeout(() => onCommit(draftColor), 180)

    return () => window.clearTimeout(timer)
  }, [draftColor, onCommit, value])

  const commitDraftColor = () => {
    if (isHexColor(draftColor)) onCommit(draftColor)
  }

  return (
    <div className='flex items-center gap-2'>
      <input
        type='color'
        value={isHexColor(draftColor) ? draftColor : value}
        onChange={event => setDraftColor(event.target.value)}
        onBlur={commitDraftColor}
        className='size-9 cursor-pointer rounded border-0 bg-transparent p-0'
      />
      <input
        value={draftColor.toUpperCase()}
        onChange={event => setDraftColor(event.target.value.trim())}
        onBlur={commitDraftColor}
        aria-label='Primary color hex value'
        className={cn(
          'h-9 w-full rounded-md border px-2 font-mono text-xs uppercase outline-none focus:border-[var(--app-primary)]',
          isDark ? 'border-slate-600 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
        )}
      />
    </div>
  )
}
