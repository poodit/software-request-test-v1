import { useEffect, useMemo, useState } from 'react'
import { Edit3, Layers3, Plus, Search, ShieldCheck, UserRoundCheck, UsersRound } from 'lucide-react'

import { mockPeople } from '@/_workspace/data/mock-people'
import { TeamDialog } from '@/_workspace/TeamDialog'
import { loadTeams, saveTeams } from '@/_workspace/team-store'
import type { WorkTeam } from '@/_workspace/team-types'
import { Button } from '@/components/ui/button'

export default function TeamManagementPage() {
  const [teams, setTeams] = useState<WorkTeam[]>(loadTeams)
  const [query, setQuery] = useState('')
  const [editingTeam, setEditingTeam] = useState<WorkTeam | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => { saveTeams(teams) }, [teams])

  const visibleTeams = useMemo(() => {
    const value = query.trim().toLowerCase()
    return teams.filter(team => !value || [team.code, team.name, team.description, team.leader, ...team.members].some(item => item.toLowerCase().includes(value)))
  }, [query, teams])
  const activeTeams = teams.filter(team => team.active)
  const activeMembers = new Set(activeTeams.flatMap(team => team.members))
  const crossTeamMembers = mockPeople.filter(person => activeTeams.filter(team => team.members.includes(person.name)).length > 1)

  const saveTeam = (team: WorkTeam) => {
    setTeams(items => items.some(item => item.id === team.id) ? items.map(item => item.id === team.id ? team : item) : [...items, team])
    setCreating(false)
    setEditingTeam(null)
  }

  return (
    <section className='page-container space-y-5'>
      <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
        <div className='flex flex-col justify-end gap-2 sm:flex-row'>
          <label className='relative min-w-0 flex-1'>
            <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400' />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder='Search team, leader, or member...' className='h-10 w-full rounded-lg border border-slate-200 pr-3 pl-9 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' />
          </label>
          <Button size='lg' onClick={() => setCreating(true)}><Plus />Create Team</Button>
        </div>
      </section>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <Metric icon={Layers3} label='Active teams' value={activeTeams.length} detail={`${teams.length - activeTeams.length} inactive`} />
        <Metric icon={UsersRound} label='Team members' value={activeMembers.size} detail={`${mockPeople.length} people available`} />
        <Metric icon={UserRoundCheck} label='Cross-team members' value={crossTeamMembers.length} detail='Assigned to more than one team' />
        <Metric icon={ShieldCheck} label='Team leaders' value={new Set(activeTeams.map(team => team.leader)).size} detail='Responsible managers' />
      </div>

      <section className='rounded-xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex items-center justify-between border-b border-slate-200 p-4'>
          <h2 className='text-sm font-semibold text-slate-900'>Teams and groups</h2>
          <span className='text-xs text-slate-400'>{visibleTeams.length} records</span>
        </div>
        <div className='grid gap-4 p-4 lg:grid-cols-2'>
          {visibleTeams.map(team => <TeamCard key={team.id} team={team} onEdit={() => setEditingTeam(team)} />)}
          {visibleTeams.length === 0 && <div className='col-span-full rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-400'>No teams match this search.</div>}
        </div>
      </section>

      {(creating || editingTeam) && <TeamDialog team={editingTeam ?? undefined} onClose={() => { setCreating(false); setEditingTeam(null) }} onSave={saveTeam} />}
    </section>
  )
}

function TeamCard({ team, onEdit }: { team: WorkTeam; onEdit: () => void }) {
  const leader = mockPeople.find(person => person.name === team.leader)
  return <article className={`overflow-hidden rounded-xl border bg-white shadow-sm ${team.active ? 'border-slate-200' : 'border-slate-200 opacity-65'}`}><div className='h-1.5' style={{ backgroundColor: team.color }} /><div className='p-4'><div className='flex items-start justify-between gap-3'><div className='flex min-w-0 items-center gap-3'><span className='grid size-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-white' style={{ backgroundColor: team.color }}>{team.code}</span><div className='min-w-0'><div className='flex items-center gap-2'><h3 className='truncate text-base font-semibold text-slate-900'>{team.name}</h3><span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${team.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{team.active ? 'Active' : 'Inactive'}</span></div><p className='mt-0.5 line-clamp-1 text-xs text-slate-400'>{team.description}</p></div></div><Button type='button' variant='outline' size='sm' onClick={onEdit}><Edit3 />Edit</Button></div><div className='mt-4 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2'><div><p className='text-[9px] font-medium uppercase tracking-wide text-slate-400'>Team Leader</p><p className='mt-1 text-xs font-semibold text-slate-700'>{team.leader}</p><p className='text-[9px] text-slate-400'>{leader?.position}</p></div><div><p className='text-[9px] font-medium uppercase tracking-wide text-slate-400'>Deputy / Backup</p><p className='mt-1 text-xs font-semibold text-slate-700'>{team.deputy ?? '-'}</p></div></div><div className='mt-4'><div className='mb-2 flex items-center justify-between'><p className='text-xs font-semibold text-slate-700'>Members</p><span className='text-[10px] text-slate-400'>{team.members.length} people</span></div><div className='flex flex-wrap gap-1.5'>{team.members.map(member => <span key={member} title={member} className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pr-2 pl-1 text-[9px] font-medium text-slate-600'><span className='grid size-5 place-items-center rounded-full bg-slate-100 text-[7px] font-bold'>{initials(member)}</span>{member}</span>)}</div></div></div></article>
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Layers3; label: string; value: number; detail: string }) { return <article className='flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'><span className='grid size-10 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]'><Icon className='size-5' /></span><div><p className='text-[10px] font-medium text-slate-500'>{label}</p><p className='text-2xl font-semibold text-slate-900'>{value}</p><p className='text-[9px] text-slate-400'>{detail}</p></div></article> }
function initials(name: string) { return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() }

