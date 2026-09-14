import { Moon, Sun } from 'lucide-react'

export function ThemeTransition({ dark, imageUrl }: { dark: boolean; imageUrl?: string }) {
  const Icon = dark ? Moon : Sun

  return (
    <div aria-hidden='true' className='theme-transition fixed inset-0 z-0 grid place-items-center overflow-hidden'>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=''
          className={`theme-transition-art h-[72vh] w-[72vw] max-h-[780px] max-w-[980px] object-contain ${dark ? 'theme-transition-art-dark' : 'theme-transition-art-light'}`}
        />
      ) : (
        <div className='theme-transition-icon grid size-20 place-items-center rounded-full bg-[var(--app-primary)] text-white shadow-2xl'>
          <Icon className='size-9' />
        </div>
      )}
    </div>
  )
}
