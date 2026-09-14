import type { ChangeEvent } from 'react'

import { useAppearance } from '@/hooks/use-appearance'
import { cn } from '@/lib/utils'

export function ThemeTransitionCustomizer() {
  const { isDark, themeTransitionImage, setThemeTransitionImage } = useAppearance()

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file?.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setThemeTransitionImage(reader.result)
    }
    reader.readAsDataURL(file)
    event.currentTarget.value = ''
  }

  return (
    <div className={cn('absolute right-0 top-10 z-50 w-64 rounded-lg border p-3 shadow-xl', isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white')}>
      <p className={cn('mb-2 text-xs font-semibold', isDark ? 'text-slate-100' : 'text-slate-800')}>Theme transition image</p>
      {themeTransitionImage ? (
        <div className={cn('mb-2 grid h-24 place-items-center overflow-hidden rounded-md border p-2', isDark ? 'border-slate-600 bg-slate-900' : 'border-slate-200 bg-slate-50')}>
          <img src={themeTransitionImage} alt='Theme transition preview' className='size-full object-contain' />
        </div>
      ) : (
        <div className={cn('mb-2 grid h-16 place-items-center rounded-md border text-xs', isDark ? 'border-slate-600 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500')}>
          Default FITEL robot
        </div>
      )}
      <label className='flex h-9 cursor-pointer items-center justify-center rounded-md bg-[var(--app-primary-soft)] px-3 text-xs font-medium text-[var(--app-primary)] hover:opacity-80'>
        Choose transition image
        <input type='file' accept='image/png,image/jpeg,image/webp,image/gif' onChange={selectImage} className='sr-only' />
      </label>
      {themeTransitionImage && (
        <button
          type='button'
          onClick={() => setThemeTransitionImage(undefined)}
          className={cn('mt-1.5 w-full rounded-md px-3 py-2 text-xs', isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100')}
        >
          Use default FITEL robot
        </button>
      )}
      <p className={cn('mt-2 text-[10px] leading-4', isDark ? 'text-slate-400' : 'text-slate-500')}>Transparent PNG or WebP works best.</p>
    </div>
  )
}
