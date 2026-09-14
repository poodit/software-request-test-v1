import { ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { useLocation } from 'react-router'

import { navigation } from '@/config/navigation'
import { useAppearance } from '@/hooks/use-appearance'
import { cn } from '@/lib/utils'

export function AppBreadcrumb({ inTopbar = false }: { inTopbar?: boolean }) {
  const { isDark } = useAppearance()
  const { pathname } = useLocation()
  const breadcrumbs = useMemo(() => {
    const currentIndex = navigation.findIndex(item => item.href === pathname)
    const currentItem = navigation[currentIndex]
    if (currentItem) {
      const section = navigation.slice(0, currentIndex).findLast(item => item.section)?.section
      return section && section !== currentItem.label ? [section, currentItem.label] : [currentItem.label]
    }

    const parentIndex = navigation.findIndex(item => item.children?.some(child => child.href === pathname))
    const parent = navigation[parentIndex]
    const child = parent?.children?.find(item => item.href === pathname)
    if (!parent || !child) return ['Workspace']

    const section = navigation.slice(0, parentIndex).findLast(item => item.section)?.section
    return [section, parent.label, child.label].filter((item): item is string => Boolean(item))
  }, [pathname])

  return (
    <nav
      aria-label='Breadcrumb'
      className={cn(
        'flex min-w-0 items-center gap-1 text-sm',
        inTopbar
          ? 'flex-1'
          : cn(
              'h-10 rounded-lg border px-3 shadow-sm backdrop-blur-[10px]',
              isDark ? 'border-white/10 bg-slate-950/[0.5]' : 'border-white/[0.16] bg-white/[0.58]'
            )
      )}
    >
      {breadcrumbs.map((breadcrumb, index) => (
        <span key={breadcrumb} className='flex min-w-0 items-center gap-1'>
          {index > 0 && <ChevronRight className={cn('size-4 shrink-0', isDark ? 'text-slate-500' : 'text-slate-400')} />}
          <span
            className={cn(
              'truncate',
              index === breadcrumbs.length - 1
                ? (isDark ? 'font-semibold text-slate-100' : 'font-semibold text-slate-800')
                : (isDark ? 'text-slate-400' : 'text-slate-500')
            )}
          >
            {breadcrumb}
          </span>
        </span>
      ))}
    </nav>
  )
}
