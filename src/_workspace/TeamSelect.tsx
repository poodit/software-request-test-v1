import { Layers3 } from 'lucide-react'

import type { WorkTeam } from '@/_workspace/team-types'

export function TeamSelect({ teams, value, onChange, className = '' }: { teams: WorkTeam[]; value: string; onChange: (teamId: string) => void; className?: string }) {
  const activeTeams = teams.filter(team => team.active)
  return <label className={`relative flex h-10 min-w-44 items-center ${className}`}><Layers3 className='pointer-events-none absolute left-3 size-4 text-[var(--app-primary)]' /><select aria-label='Team filter' value={value} onChange={event => onChange(event.target.value)} className='h-full w-full appearance-none rounded-lg border border-slate-200 bg-white pr-8 pl-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-[var(--app-primary)] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]'><option value='all'>All teams</option>{activeTeams.map(team => <option key={team.id} value={team.id}>{team.name} ({team.members.length})</option>)}</select><span className='pointer-events-none absolute right-3 text-[10px] text-slate-400'>▼</span></label>
}

