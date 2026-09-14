import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { useState } from 'react'

import { navigation, type NavigationItem } from '@/config/navigation'
import { appConfig } from '@/config/app'
import { cn } from '@/lib/utils'

type SidebarProps = {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onNavigate?: () => void
  mobile?: boolean
  dark?: boolean
}

function MenuLink({ item, collapsed, onNavigate }: { item: NavigationItem; collapsed: boolean; onNavigate?: () => void }) {
  const Icon = item.icon

  if (!item.href) return null

  return (
    <NavLink
      to={item.href}
      end={item.href === '/dashboard'}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors',
          collapsed && 'justify-center px-2',
          item.featured
            ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            : isActive
              ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
        )
      }
    >
      {Icon && <Icon className='size-5 shrink-0' strokeWidth={1.8} />}
      <span className={cn('truncate', collapsed && 'sr-only')}>{item.label}</span>
    </NavLink>
  )
}

function MenuGroup({ item, collapsed, onNavigate }: { item: NavigationItem; collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation()
  const containsActiveRoute = item.children?.some(child => child.href && location.pathname.startsWith(child.href)) ?? false
  const [isOpen, setIsOpen] = useState(containsActiveRoute)
  const Icon = item.icon

  if (item.section && !item.children) {
    return <p className={cn('px-2 pt-5 pb-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase', collapsed && 'sr-only')}>{item.section}</p>
  }

  if (!item.children) return <MenuLink item={item} collapsed={collapsed} onNavigate={onNavigate} />

  return (
    <div className='space-y-1'>
      <button
        type='button'
        title={collapsed ? item.label : undefined}
        onClick={() => setIsOpen(value => !value)}
        className={cn(
          'flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950',
          collapsed && 'justify-center px-2'
        )}
      >
        {Icon && <Icon className='size-5 shrink-0' strokeWidth={1.8} />}
        <span className={cn('flex-1 text-left', collapsed && 'sr-only')}>{item.label}</span>
        <ChevronDown className={cn('size-4 transition-transform', isOpen && 'rotate-180', collapsed && 'hidden')} />
      </button>
      {isOpen && !collapsed && (
        <div className='ml-4 space-y-0.5 border-l border-slate-200 pl-2'>
          {item.children.map(child => (
            <MenuLink key={child.href} item={child} collapsed={false} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ collapsed = false, onCollapsedChange, onNavigate, mobile = false, dark = false }: SidebarProps) {
  return (
    <aside
      className={cn(
        'app-shell-sidebar flex h-full flex-col transition-[width,background-color] duration-200',
        dark
          ? 'border-r border-white/10 bg-slate-950/[0.52] text-slate-100 backdrop-blur-[10px]'
          : 'border-r border-white/[0.16] bg-white/[0.66] text-slate-950 backdrop-blur-[10px]',
        mobile ? 'w-64' : collapsed ? 'w-20' : 'w-60'
      )}
    >
      <div className={cn('flex h-14 items-center px-4', collapsed && 'justify-center px-2')}>
        <div className='flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--app-primary)] text-xs font-bold text-white'>{appConfig.shortName}</div>
        <div className={cn('ml-3 min-w-0', collapsed && 'hidden')}>
          <p className='truncate text-sm font-semibold text-slate-900'>{appConfig.name}</p>
          <p className='text-[11px] text-slate-400'>{appConfig.version}</p>
        </div>
      </div>

      <nav className='flex-1 space-y-0.5 overflow-y-auto px-3 py-3'>
        {navigation.map(item => <MenuGroup key={item.label} item={item} collapsed={collapsed} onNavigate={onNavigate} />)}
      </nav>

      {!mobile && (
        <div className='border-t border-slate-200 p-2.5'>
          <button
            type='button'
            onClick={() => onCollapsedChange?.(!collapsed)}
            className='flex h-8 w-full items-center justify-center gap-2 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          >
            {collapsed ? <PanelLeftOpen className='size-5' /> : <PanelLeftClose className='size-5' />}
            <span className={collapsed ? 'sr-only' : ''}>Collapse menu</span>
          </button>
        </div>
      )}
    </aside>
  )
}
