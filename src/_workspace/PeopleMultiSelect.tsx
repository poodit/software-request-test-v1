import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Users, X } from 'lucide-react'

import { mockPeople, type MockPerson } from '@/_workspace/data/mock-people'
import { getPersonTheme } from '@/_workspace/person-theme'

export function PeopleMultiSelect({ selected, onChange, people = mockPeople, className = '' }: { selected: string[]; onChange: (people: string[]) => void; people?: MockPerson[]; className?: string }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const allSelected = selected.length === people.length
  const label = selected.length === 0 ? 'Select people' : allSelected ? `All people (${selected.length})` : selected.length === 1 ? selected[0] : `${selected.length} people selected`

  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter(item => item !== name) : [...selected, name])

  return <div ref={containerRef} className={`relative ${className}`}><button type='button' aria-haspopup='listbox' aria-expanded={open} onClick={() => setOpen(value => !value)} className={`flex h-10 min-w-48 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-medium shadow-sm outline-none transition ${selected.length ? 'border-slate-200 text-slate-700 hover:border-[var(--app-primary)]' : 'border-amber-300 text-amber-700 ring-2 ring-amber-100'}`}><Users className='size-4 text-[var(--app-primary)]' /><span className='min-w-0 flex-1 truncate text-left'>{label}</span><ChevronDown className={`size-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} /></button>{open && <div className='absolute top-[calc(100%+0.4rem)] right-0 z-40 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl'><div className='flex items-center justify-between border-b border-slate-100 px-3 py-2.5'><div><p className='text-xs font-semibold text-slate-800'>People to include</p><p className='text-[10px] text-slate-400'>Metrics and work items follow this selection.</p></div><button type='button' aria-label='Close people filter' onClick={() => setOpen(false)} className='rounded p-1 text-slate-400 hover:bg-slate-100'><X className='size-4' /></button></div><div role='listbox' aria-multiselectable='true' className='max-h-72 overflow-y-auto p-2'>{people.map(person => { const active = selected.includes(person.name); const theme = getPersonTheme(person.name); return <button type='button' role='option' aria-selected={active} key={person.employeeCode} onClick={() => toggle(person.name)} className={`mb-1 flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition last:mb-0 ${active ? 'bg-[var(--app-primary-soft)]' : 'hover:bg-slate-50'}`}><span className={`grid size-5 shrink-0 place-items-center rounded border ${active ? 'border-[var(--app-primary)] bg-[var(--app-primary)] text-white' : 'border-slate-300 bg-white'}`}>{active && <Check className='size-3.5' />}</span><span className={`grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${theme.avatar}`}>{initials(person.name)}</span><span className='min-w-0 flex-1'><b className='block truncate text-xs text-slate-800'>{person.name}</b><small className='block truncate text-[9px] text-slate-400'>{person.position} · {person.department}</small></span></button> })}</div><div className='flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2'><button type='button' onClick={() => onChange([])} className='text-[11px] font-medium text-slate-500 hover:text-rose-600'>Clear</button><button type='button' onClick={() => onChange(people.map(person => person.name))} className='text-[11px] font-semibold text-[var(--app-primary)]'>Select all</button></div></div>}</div>
}

export function PeopleSelectionBar({ selected, onChange, label = 'Showing' }: { selected: string[]; onChange: (people: string[]) => void; label?: string }) {
  return <div className='flex flex-wrap items-center gap-2'><span className='mr-1 text-[11px] font-semibold text-slate-500'>{label}:</span>{selected.length ? selected.map(name => { const theme = getPersonTheme(name); return <span key={name} className={`inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-1 text-[10px] font-semibold ${theme.chip}`}><span className={`grid size-5 place-items-center rounded-full text-[8px] font-bold ${theme.avatar}`}>{initials(name)}</span>{name}<button type='button' aria-label={`Remove ${name} from filter`} onClick={() => onChange(selected.filter(item => item !== name))} className='ml-0.5 rounded-full p-0.5 opacity-60 hover:bg-white hover:opacity-100'><X className='size-3' /></button></span> }) : <span className='rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-700'>No people selected</span>}</div>
}

function initials(name: string) { return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() }
