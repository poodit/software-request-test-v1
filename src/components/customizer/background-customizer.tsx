import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react'

import { useAppearance } from '@/hooks/use-appearance'
import { cn } from '@/lib/utils'

const backgroundPositions: Record<string, [number, number]> = {
  center: [50, 50],
  top: [50, 0],
  bottom: [50, 100],
  left: [0, 50],
  right: [100, 50],
}

export function BackgroundCustomizer() {
  const { isDark, background, setBackground } = useAppearance()
  const { image, opacity, shading, positionPreset, positionX, positionY, size, blur } = background
  const panTransform = `translate(${(50 - positionX) * 0.12}%, ${(50 - positionY) * 0.12}%)`

  const updateBackground = (changes: Partial<typeof background>) => {
    setBackground(current => ({ ...current, ...changes }))
  }

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file?.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') updateBackground({ image: reader.result })
    }
    reader.readAsDataURL(file)
    event.currentTarget.value = ''
  }

  const setPositionPreset = (preset: string) => {
    const [x, y] = backgroundPositions[preset] ?? [50, 50]

    updateBackground({ positionPreset: preset, positionX: x, positionY: y })
  }

  const movePreview = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))

    updateBackground({ positionPreset: 'custom', positionX: Math.round(x), positionY: Math.round(y) })
  }

  const labelClass = cn('text-xs font-medium', isDark ? 'text-slate-200' : 'text-slate-700')
  const fieldClass = cn(
    'mt-1 h-8 w-full rounded-md border px-2 text-xs outline-none focus:border-[var(--app-primary)]',
    isDark ? 'border-slate-600 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-700'
  )

  return (
    <div className={cn('absolute right-0 top-10 z-50 max-h-[calc(100vh-5rem)] w-80 overflow-y-auto rounded-lg border p-3 shadow-xl', isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white')}>
      <p className={cn('mb-2 text-xs font-semibold', isDark ? 'text-slate-100' : 'text-slate-800')}>Page background</p>

      {image && (
        <div
          role='slider'
          aria-label='Drag to reposition background image'
          aria-valuetext={`X ${positionX}%, Y ${positionY}%`}
          tabIndex={0}
          onPointerDown={event => {
            event.currentTarget.setPointerCapture(event.pointerId)
            movePreview(event)
          }}
          onPointerMove={event => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) movePreview(event)
          }}
          onPointerUp={event => event.currentTarget.releasePointerCapture(event.pointerId)}
          className='relative mb-2 h-24 w-full cursor-grab overflow-hidden rounded-md border border-slate-200 bg-slate-100 active:cursor-grabbing'
        >
          <div className='absolute -inset-4 scale-110 bg-cover bg-center bg-no-repeat opacity-70 blur-xl' style={{ backgroundImage: `url("${image}")` }} />
          <div
            className='absolute inset-0 origin-center bg-center bg-no-repeat'
            style={{ backgroundImage: `url("${image}")`, backgroundSize: size, transform: panTransform }}
          />
          <span className='absolute inset-x-0 bottom-0 bg-slate-950/60 px-2 py-1 text-center text-[10px] font-medium text-white'>
            Drag to reposition · X {positionX}% / Y {positionY}%
          </span>
        </div>
      )}

      <label className='flex h-9 cursor-pointer items-center justify-center rounded-md bg-[var(--app-primary-soft)] px-3 text-xs font-medium text-[var(--app-primary)] hover:opacity-80'>
        Choose background
        <input type='file' accept='image/*' onChange={selectImage} className='sr-only' />
      </label>

      {image && (
        <>
          <div className={cn('mt-3 space-y-3 border-t pt-3', isDark ? 'border-slate-700' : 'border-slate-200')}>
            <label className='block'>
              <span className={cn('flex items-center justify-between', labelClass)}><span>Opacity</span><span>{opacity}%</span></span>
              <input type='range' min='0' max='100' value={opacity} onChange={event => updateBackground({ opacity: Number(event.target.value) })} className='mt-1.5 w-full accent-[var(--app-primary)]' />
            </label>
            <label className='block'>
              <span className={cn('flex items-center justify-between', labelClass)}><span>Background shading</span><span>{shading}%</span></span>
              <input type='range' min='0' max='80' value={shading} onChange={event => updateBackground({ shading: Number(event.target.value) })} className='mt-1.5 w-full accent-[var(--app-primary)]' />
            </label>
            <div className='grid grid-cols-2 gap-2'>
              <label className='block'>
                <span className={labelClass}>Position</span>
                <select value={positionPreset} onChange={event => setPositionPreset(event.target.value)} className={fieldClass}>
                  <option value='center'>Center</option>
                  <option value='top'>Top</option>
                  <option value='bottom'>Bottom</option>
                  <option value='left'>Left</option>
                  <option value='right'>Right</option>
                  <option value='custom'>Custom</option>
                </select>
              </label>
              <label className='block'>
                <span className={labelClass}>Fit</span>
                <select value={size} onChange={event => updateBackground({ size: event.target.value as 'cover' | 'contain' })} className={fieldClass}>
                  <option value='cover'>Cover</option>
                  <option value='contain'>Contain</option>
                </select>
              </label>
            </div>
            <label className='block'>
              <span className={cn('flex items-center justify-between', labelClass)}><span>Blur</span><span>{blur}px</span></span>
              <input type='range' min='0' max='16' value={blur} onChange={event => updateBackground({ blur: Number(event.target.value) })} className='mt-1.5 w-full accent-[var(--app-primary)]' />
            </label>
          </div>
          <button type='button' onClick={() => updateBackground({ image: undefined })} className={cn('mt-3 w-full rounded-md px-3 py-2 text-xs', isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100')}>
            Remove background
          </button>
        </>
      )}
    </div>
  )
}
