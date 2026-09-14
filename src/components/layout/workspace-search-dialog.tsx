import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Grid2X2, Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'

const applications = [
  'Security Center System',
  'Smart FFT',
  'Health Care System',
  'Leave System',
  'Material Control System',
  'Cycle Time System',
  'Environment Monitoring',
  'Machine-Monitor-General',
]

type WorkspaceSearchDialogProps = {
  dark: boolean
  onClose: () => void
}

export function WorkspaceSearchDialog({ dark, onClose }: WorkspaceSearchDialogProps) {
  const [query, setQuery] = useState('')
  const filteredApplications = useMemo(
    () => applications.filter(application => application.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  )

  return createPortal(
    <div className='fixed inset-0 z-[100] flex items-start justify-center px-4 pt-6 sm:pt-10'>
      <button type='button' aria-label='Close app search' className='absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]' onClick={onClose} />
      <div className='relative w-full max-w-6xl'>
      <section role='dialog' aria-modal='true' aria-labelledby='app-search-title' className={cn('flex max-h-[calc(100vh-3rem)] w-full flex-col overflow-hidden rounded-xl border shadow-2xl', dark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-900')}>
        <div className={cn('flex flex-wrap items-center gap-3 border-b px-5 py-4', dark ? 'border-slate-700' : 'border-slate-200')}>
          <h2 id='app-search-title' className='mr-auto text-2xl font-semibold'>My Apps</h2>
          <label className={cn('flex h-10 w-full max-w-xs items-center gap-2 rounded-lg border px-3 sm:w-64', dark ? 'border-slate-600 bg-slate-900' : 'border-slate-200 bg-slate-50')}>
            <Search className='size-4 text-slate-400' />
            <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder='Search app...' className={cn('min-w-0 flex-1 bg-transparent text-sm outline-none', dark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400')} />
          </label>
          <button type='button' aria-label='Close app search' onClick={onClose} className={cn('grid size-8 place-items-center rounded-md transition-colors', dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100')}><X className='size-5' /></button>
        </div>
        <div className='grid min-h-64 grid-cols-1 gap-4 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-4'>
          {filteredApplications.map(application => (
            <button key={application} type='button' className={cn('flex min-h-28 flex-col items-center justify-center gap-3 rounded-lg border p-4 text-center text-sm font-semibold transition hover:border-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]', dark ? 'border-slate-600 text-slate-100' : 'border-slate-200 text-slate-800')}>
              <span className='grid size-12 place-items-center rounded-full bg-[color-mix(in_srgb,var(--app-primary)_18%,transparent)] text-[var(--app-primary)]'><Grid2X2 className='size-5' /></span>
              {application}
            </button>
          ))}
          {filteredApplications.length === 0 && <p className='col-span-full py-10 text-center text-sm text-slate-500'>No applications found.</p>}
        </div>
        <div className={cn('flex justify-end border-t px-5 py-3', dark ? 'border-slate-700' : 'border-slate-200')}><button type='button' onClick={onClose} className={cn('rounded-lg px-3 py-2 text-sm font-medium', dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100')}>Close</button></div>
      </section>
      </div>
    </div>,
    document.body
  )
}
