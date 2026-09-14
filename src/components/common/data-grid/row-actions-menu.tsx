import { Menu } from '@base-ui/react/menu'
import { EllipsisVertical, Eye, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type RowActionItem<T> = {
  key: string
  label: string
  icon: LucideIcon
  onSelect: (row: T) => void
  tone?: 'default' | 'danger'
  disabled?: boolean
}

type RowActionsMenuProps<T> = {
  row: T
  viewLabel: string
  onView: (row: T) => void
  items?: RowActionItem<T>[]
}

export function RowActionsMenu<T>({ row, viewLabel, onView, items = [] }: RowActionsMenuProps<T>) {
  return (
    <div className='flex h-full items-center gap-1'>
      <button
        type='button'
        title={viewLabel}
        aria-label={viewLabel}
        onClick={() => onView(row)}
        className='rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[var(--app-primary)]'
      >
        <Eye className='size-4' />
      </button>

      {items.length > 0 && (
        <Menu.Root modal={false}>
          <Menu.Trigger
            aria-label='More actions'
            className='rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[var(--app-primary)]'
          >
            <EllipsisVertical className='size-4' />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner side='bottom' align='start' sideOffset={6} className='z-50'>
              <Menu.Popup className='min-w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg outline-none dark:border-slate-700 dark:bg-slate-900'>
                {items.map(item => {
                  const Icon = item.icon
                  return (
                    <Menu.Item
                      key={item.key}
                      disabled={item.disabled}
                      onClick={() => item.onSelect(row)}
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none transition-colors data-highlighted:bg-slate-100 data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:data-highlighted:bg-slate-800',
                        item.tone === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
                      )}
                    >
                      <Icon className='size-4' />
                      {item.label}
                    </Menu.Item>
                  )
                })}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      )}
    </div>
  )
}
