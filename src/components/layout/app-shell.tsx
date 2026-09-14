import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

import { AppBackground } from '@/components/layout/app-background'
import { AppBreadcrumb } from '@/components/layout/app-breadcrumb'
import { AppTopbar } from '@/components/layout/app-topbar'
import { HorizontalMenu } from '@/components/layout/horizontal-menu'
import { SeasonalThemeLayer } from '@/components/layout/seasonal-theme-layer'
import { Sidebar } from '@/components/layout/sidebar'
import { appConfig } from '@/config/app'
import { useAppearance } from '@/hooks/use-appearance'
import { useLayout } from '@/hooks/use-layout'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: ReactNode }) {
  const { isDark, primary, seasonalTheme, seasonalIntensity } = useAppearance()
  const { menuMode, isCollapsed, setIsCollapsed, isContentWide } = useLayout()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--app-primary', primary.value)
    root.style.setProperty('--app-primary-soft', primary.soft)
    root.style.setProperty('--primary', primary.value)
  }, [primary.soft, primary.value])

  const appStyle = {
    '--app-primary': primary.value,
    '--app-primary-soft': primary.soft,
    '--primary': primary.value,
  } as CSSProperties

  return (
    <div
      style={appStyle}
      data-seasonal-theme={seasonalTheme}
      className={cn('app-shell relative isolate min-h-screen', isDark ? 'app-dark bg-slate-950 text-slate-100' : 'bg-slate-50', isContentWide && 'app-fluid')}
    >
      <AppBackground />
      <SeasonalThemeLayer theme={seasonalTheme} intensity={seasonalIntensity} isDark={isDark} />

      {menuMode === 'vertical' && (
        <div className='fixed inset-y-0 left-0 z-30 hidden lg:block'>
          <Sidebar collapsed={isCollapsed} onCollapsedChange={setIsCollapsed} dark={isDark} />
        </div>
      )}

      {isMobileMenuOpen && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <button
            type='button'
            aria-label='Close navigation menu'
            className='absolute inset-0 bg-slate-950/30'
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className='relative h-full w-64 shadow-xl'>
            <Sidebar mobile onNavigate={() => setIsMobileMenuOpen(false)} dark={isDark} />
          </div>
        </div>
      )}

      <div
        className={cn(
          'relative z-10 min-h-screen transition-[padding] duration-300 ease-in-out',
          menuMode === 'vertical' ? (isCollapsed ? 'lg:pl-20' : 'lg:pl-60') : ''
        )}
      >
        <div
          className='mx-auto min-h-screen w-full transition-[max-width] duration-500 ease-in-out'
          style={{ maxWidth: isContentWide ? '100%' : `${appConfig.compactShellWidth}px` }}
        >
          <AppTopbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
          {menuMode === 'horizontal' && (
            <div className='px-4 pt-2 sm:px-6 lg:px-8'>
              <AppBreadcrumb />
            </div>
          )}
          {menuMode === 'horizontal' && (
            <div className='sticky top-[76px] z-20 px-4 pt-2 sm:px-6 lg:px-8'>
              <HorizontalMenu dark={isDark} backgroundVisible />
            </div>
          )}
          <main className={cn('p-4 sm:p-6 lg:p-8', menuMode === 'horizontal' && 'pt-4 sm:pt-4 lg:pt-4')}>{children}</main>
        </div>
      </div>
    </div>
  )
}
