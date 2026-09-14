import { ChevronDown, ImageIcon, Paintbrush, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

import { BackgroundCustomizer } from '@/components/customizer/background-customizer'
import { PrimaryColorCustomizer } from '@/components/customizer/primary-color-customizer'
import { SeasonalCustomizer } from '@/components/customizer/seasonal-customizer'
import { ThemeTransitionCustomizer } from '@/components/customizer/theme-transition-customizer'
import { AnimatedThemeToggle } from '@/components/layout/animated-theme-toggle'
import { primaryOptions, type PrimaryOption } from '@/config/theme'
import { useAppearance } from '@/hooks/use-appearance'
import { cn } from '@/lib/utils'

type ToolbarPanel = 'seasonal' | 'background' | 'color' | 'transition' | null

const seasonalLabels = {
  default: 'Default',
  winter: 'Winter',
  rainy: 'Rainy',
  autumn: 'Autumn',
} as const

export function AppearanceToolbar() {
  const { isDark, setIsDark, primary, setPrimary, themeTransitionImage, seasonalTheme } = useAppearance()
  const [activePanel, setActivePanel] = useState<ToolbarPanel>(null)

  useEffect(() => {
    const closePanel = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-toolbar-popover]')) return
      setActivePanel(null)
    }
    const closePanelWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePanel(null)
    }

    document.addEventListener('pointerdown', closePanel)
    document.addEventListener('keydown', closePanelWithKeyboard)

    return () => {
      document.removeEventListener('pointerdown', closePanel)
      document.removeEventListener('keydown', closePanelWithKeyboard)
    }
  }, [])

  const togglePanel = (panel: Exclude<ToolbarPanel, null>) => {
    setActivePanel(current => current === panel ? null : panel)
  }

  const selectPrimaryOption = (option: PrimaryOption) => setPrimary(option)
  const iconButtonClass = cn(
    'rounded-md p-1.5 transition-colors',
    isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
  )

  return (
    <>
      <div className={cn('hidden items-center gap-0.5 border-r px-1.5 lg:flex', isDark ? 'border-slate-500/90' : 'border-slate-400/80')}>
        <div className='relative' data-toolbar-popover>
          <button
            type='button'
            title={`Seasonal effect: ${seasonalLabels[seasonalTheme]}`}
            aria-label={`Open seasonal effect picker. Current effect: ${seasonalLabels[seasonalTheme]}`}
            aria-expanded={activePanel === 'seasonal'}
            onClick={() => togglePanel('seasonal')}
            className={cn(iconButtonClass, activePanel === 'seasonal' && 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]')}
          >
            <Sparkles className='size-4' />
          </button>
          {activePanel === 'seasonal' && <SeasonalCustomizer />}
        </div>

        <div className='relative' data-toolbar-popover>
          <button
            type='button'
            aria-label='Open page background picker'
            aria-expanded={activePanel === 'background'}
            onClick={() => togglePanel('background')}
            className={cn(iconButtonClass, activePanel === 'background' && 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]')}
          >
            <ImageIcon className='size-4' />
          </button>
          {activePanel === 'background' && <BackgroundCustomizer />}
        </div>

        <div className='relative' data-toolbar-popover>
          <button
            type='button'
            aria-label='Open primary color picker'
            aria-expanded={activePanel === 'color'}
            onClick={() => togglePanel('color')}
            className={cn(iconButtonClass, activePanel === 'color' && 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]')}
          >
            <Paintbrush className='size-4' />
          </button>
          {activePanel === 'color' && <PrimaryColorCustomizer />}
        </div>

        {primaryOptions.map(option => (
          <button
            key={option.name}
            type='button'
            title={`Use ${option.name} as the primary color`}
            aria-label={`Use ${option.name} as the primary color`}
            aria-pressed={primary.value === option.value}
            onClick={() => selectPrimaryOption(option)}
            className={cn('size-6 rounded-md border-2 border-white shadow-sm outline outline-1', primary.value === option.value ? 'outline-[var(--app-primary)]' : 'outline-slate-200')}
            style={{ backgroundColor: option.value }}
          />
        ))}
      </div>

      <div className='flex items-center'>
        <AnimatedThemeToggle isDark={isDark} onThemeChange={setIsDark} imageUrl={themeTransitionImage} className={iconButtonClass} />
        <div className='relative' data-toolbar-popover>
          <button
            type='button'
            title='Change theme transition image'
            aria-label='Open theme transition image picker'
            aria-expanded={activePanel === 'transition'}
            onClick={() => togglePanel('transition')}
            className={cn(
              'rounded-md p-1 transition-colors',
              isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
              activePanel === 'transition' && 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
            )}
          >
            <ChevronDown className={cn('size-3.5 transition-transform', activePanel === 'transition' && 'rotate-180')} />
          </button>
          {activePanel === 'transition' && <ThemeTransitionCustomizer />}
        </div>
      </div>
    </>
  )
}
