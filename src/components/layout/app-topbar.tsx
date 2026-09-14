import { Menu, MoveHorizontal, PanelLeft, PanelTop, Search } from 'lucide-react'
import { useState } from 'react'

import { AppearanceToolbar } from '@/components/customizer/appearance-toolbar'
import { AppBreadcrumb } from '@/components/layout/app-breadcrumb'
import { BrowserFullscreenToggle } from '@/components/layout/browser-fullscreen-toggle'
import { ProfileMenu } from '@/components/layout/profile-menu'
import { appConfig } from '@/config/app'
import { useAppearance } from '@/hooks/use-appearance'
import { useLayout } from '@/hooks/use-layout'
import { cn } from '@/lib/utils'

import { WorkspaceSearchDialog } from './workspace-search-dialog'

export function AppTopbar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { isDark } = useAppearance()
  const { menuMode, setMenuMode, isContentWide, setIsContentWide } = useLayout()
  const [isAppSearchOpen, setIsAppSearchOpen] = useState(false)

  const iconButtonClass = cn(
    'rounded-md p-1.5 transition-colors',
    isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
  )

  return (
    <div className='sticky top-0 z-20 px-4 pt-3 sm:px-6 lg:px-8'>
      <header
        className={cn(
          'app-shell-header flex h-16 items-center gap-2 rounded-xl border px-4 shadow-[0_6px_18px_rgb(15_23_42_/_0.10)] backdrop-blur-[14px] lg:px-6',
          isDark ? 'border-white/10 bg-slate-950/[0.52]' : 'border-white/[0.16] bg-white/[0.66]'
        )}
      >
        <button type='button' aria-label='Open navigation menu' onClick={onOpenMobileMenu} className={cn(iconButtonClass, 'lg:hidden')}>
          <Menu className='size-5' />
        </button>

        {menuMode === 'horizontal' ? (
          <div className='hidden min-w-0 items-center gap-3 lg:flex'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-primary)] text-sm font-bold text-white'>{appConfig.shortName}</div>
            <div className='flex min-w-0 items-baseline gap-2 whitespace-nowrap'>
              <span className={cn('truncate text-lg font-bold', isDark ? 'text-white' : 'text-slate-900')}>{appConfig.name}</span>
              <span className={cn('text-xs font-semibold', isDark ? 'text-slate-400' : 'text-slate-500')}>{appConfig.version}</span>
              <span className='text-sm font-bold text-rose-500'>Status: {appConfig.environment}</span>
            </div>
          </div>
        ) : <AppBreadcrumb inTopbar />}

        <button type='button' aria-label='Search applications' onClick={() => setIsAppSearchOpen(true)} className={cn(iconButtonClass, 'ml-auto')}><Search className='size-4' /></button>

        <div className={cn('hidden items-center gap-0.5 border-r pr-1.5 lg:flex', isDark ? 'border-slate-500/90' : 'border-slate-400/80')}>
          <div className={cn('flex items-center rounded-md border p-0.5', isDark ? 'border-slate-700' : 'border-slate-200')}>
            <button type='button' aria-label='Use vertical menu' aria-pressed={menuMode === 'vertical'} onClick={() => setMenuMode('vertical')} className={cn(iconButtonClass, menuMode === 'vertical' && 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]')}>
              <PanelLeft className='size-4' />
            </button>
            <button type='button' aria-label='Use horizontal menu' aria-pressed={menuMode === 'horizontal'} onClick={() => setMenuMode('horizontal')} className={cn(iconButtonClass, menuMode === 'horizontal' && 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]')}>
              <PanelTop className='size-4' />
            </button>
          </div>
          <button type='button' aria-label='Toggle full-width application shell' aria-pressed={isContentWide} onClick={() => setIsContentWide(value => !value)} className={cn(iconButtonClass, isContentWide && 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]')}>
            <MoveHorizontal className='size-4' />
          </button>
          <BrowserFullscreenToggle className={iconButtonClass} />
        </div>

        <AppearanceToolbar />
        <ProfileMenu dark={isDark} />
      </header>
      {isAppSearchOpen && <WorkspaceSearchDialog dark={isDark} onClose={() => setIsAppSearchOpen(false)} />}
    </div>
  )
}
