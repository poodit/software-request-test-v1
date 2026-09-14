import { ChevronLeft, ChevronRight, LogOut, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

const userGroups = [
  'Programmer',
  'Programmer_Admin',
  'Employee',
  'HR Admin',
  'FM_Repair_Request_Technician',
  'FM_Repair_Request_Production',
  'PC',
  'BP',
  'SMART_Admin',
  'FMS_production',
  'FMS_technician',
  'DFB Chip',
]

type ProfileMenuProps = {
  dark: boolean
  onGroupChange?: (group: string) => void
}

export function ProfileMenu({ dark, onGroupChange }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isChoosingGroup, setIsChoosingGroup] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(() => localStorage.getItem('software-request.user-group') ?? userGroups[0])

  const chooseGroup = (group: string) => {
    localStorage.setItem('software-request.user-group', group)
    setSelectedGroup(group)
    setIsChoosingGroup(false)
    onGroupChange?.(group)
  }

  const surfaceClass = dark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
  const mutedTextClass = dark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className='relative'>
      <button type='button' onClick={() => setIsOpen(value => !value)} aria-expanded={isOpen} className='flex items-center gap-3 rounded-md px-1.5 py-1 text-left hover:bg-slate-100 app-dark:hover:bg-slate-800'>
        <div className='hidden sm:block'>
          <p className={cn('text-sm font-medium', dark ? 'text-slate-100' : 'text-slate-800')}>S00811 <span className={mutedTextClass}>MR.POODIT</span></p>
          <p className='text-xs text-[var(--app-primary)]'>✦ {selectedGroup}</p>
        </div>
        <div className='flex size-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-sm font-semibold text-[var(--app-primary)]'>PS</div>
      </button>

      {isOpen && (
        <div className={cn('absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-lg border shadow-xl', surfaceClass)}>
          {isChoosingGroup ? (
            <>
              <button type='button' onClick={() => setIsChoosingGroup(false)} className={cn('flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-medium', dark ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50')}>
                <ChevronLeft className='size-4' />
                Choose user group
              </button>
              <div className='max-h-96 overflow-y-auto p-2'>
                {userGroups.map(group => (
                  <button
                    key={group}
                    type='button'
                    onClick={() => chooseGroup(group)}
                    className={cn(
                      'flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                      selectedGroup === group
                        ? 'bg-[var(--app-primary-soft)] font-medium text-[var(--app-primary)]'
                        : dark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                    )}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={cn('border-b px-4 py-4', dark ? 'border-slate-700' : 'border-slate-200')}>
                <p className='text-sm font-semibold'>MR.POODIT SUWANPRATEEP</p>
                <p className={cn('mt-1 text-xs', mutedTextClass)}>SOFTWARE - S3 (SENIOR ENGINEER)</p>
              </div>
              <div className='p-3'>
                <button type='button' onClick={() => setIsChoosingGroup(true)} className='flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]'>
                  <span className='flex items-center gap-2'><Sparkles className='size-4' /> Merge Menu</span>
                  <ChevronRight className='size-4' />
                </button>
                <p className={cn('px-3 pt-2 text-xs', mutedTextClass)}>Current group: {selectedGroup}</p>
                <button type='button' className='mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600'>
                  Logout <LogOut className='size-4' />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
