import { RotateCcw, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { RequestPriority } from '../../request-software/types'

export type MyWorkSearchValues = {
  keyword: string
  status: '' | 'In Progress' | 'Cancellation Requested' | 'Waiting Software Confirm' | 'Completed'
  priority: RequestPriority | ''
}

type SearchFiltersProps = {
  values: MyWorkSearchValues
  onChange: (values: MyWorkSearchValues) => void
  onSearch: () => void
  onClear: () => void
}

const priorities: RequestPriority[] = ['Low', 'Medium', 'High', 'Urgent']

export function SearchFilters({ values, onChange, onSearch, onClear }: SearchFiltersProps) {
  const fieldClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]'

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
      <h2 className='text-base font-semibold text-slate-900'>Search filters</h2>
      <div className='mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_240px_240px]'>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-medium text-slate-600'>Keyword</span>
          <input value={values.keyword} onChange={event => onChange({ ...values, keyword: event.target.value })} onKeyDown={event => { if (event.key === 'Enter') onSearch() }} placeholder='Request no., control no., software name or requester' className={fieldClass} />
        </label>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-medium text-slate-600'>Status</span>
          <select value={values.status} onChange={event => onChange({ ...values, status: event.target.value as MyWorkSearchValues['status'] })} className={fieldClass}>
            <option value=''>All status</option>
            <option value='In Progress'>In Progress</option>
            <option value='Cancellation Requested'>Cancellation Requested</option>
            <option value='Waiting Software Confirm'>Waiting Software Confirm</option>
            <option value='Completed'>Completed</option>
          </select>
        </label>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-medium text-slate-600'>Priority</span>
          <select value={values.priority} onChange={event => onChange({ ...values, priority: event.target.value as MyWorkSearchValues['priority'] })} className={fieldClass}>
            <option value=''>All priority</option>
            {priorities.map(priority => <option key={priority}>{priority}</option>)}
          </select>
        </label>
      </div>
      <div className='mt-4 flex gap-2'>
        <Button type='button' onClick={onSearch}><Search />Search</Button>
        <Button type='button' variant='outline' onClick={onClear}><RotateCcw />Clear</Button>
      </div>
    </section>
  )
}
