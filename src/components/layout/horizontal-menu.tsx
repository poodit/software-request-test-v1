import { NavLink } from 'react-router'

import { navigation } from '@/config/navigation'
import { cn } from '@/lib/utils'

const horizontalItems = navigation.flatMap(item => item.children?.filter(child => child.href) ?? (item.href ? [item] : []))

export function HorizontalMenu({ dark = false, backgroundVisible = false }: { dark?: boolean; backgroundVisible?: boolean }) {
  return (
    <nav className={cn('app-shell-horizontal-menu border-b px-4 lg:px-8', backgroundVisible ? dark ? 'border-white/10 bg-slate-950/[0.52] backdrop-blur-[10px]' : 'border-white/[0.16] bg-white/[0.66] backdrop-blur-[10px]' : 'border-slate-200 bg-white')}>
      <div className='flex h-12 items-stretch gap-1 overflow-x-auto'>
        {horizontalItems.map(item => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.href}
              to={item.href!}
              end={item.href === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-[var(--app-primary)] text-[var(--app-primary)]'
                    : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900'
                )
              }
            >
              {Icon && <Icon className='size-4' strokeWidth={1.8} />}
              {item.label}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
