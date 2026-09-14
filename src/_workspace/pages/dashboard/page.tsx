import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Activity, AlertTriangle, ArrowDownToLine, BarChart3, BriefcaseBusiness, CalendarClock, CheckCircle2, Clock3, RotateCcw, Target, TrendingUp, Users, type LucideIcon } from 'lucide-react'

import { mockCurrentUser, mockPeople } from '@/_workspace/data/mock-people'
import { loadMockRequests } from '@/_workspace/data/request-software/requestStore'
import { runMockTargetReminderCycle } from '@/_workspace/data/notification-settings'
import type { RequestPriority, SoftwareRequest } from '@/_workspace/pages/request-software/types'
import { PeopleMultiSelect, PeopleSelectionBar } from '@/_workspace/PeopleMultiSelect'
import { getPersonTheme } from '@/_workspace/person-theme'
import { getTeamMemberNames, loadTeams } from '@/_workspace/team-store'
import { TeamSelect } from '@/_workspace/TeamSelect'

import { calculateDashboardMetrics, daysUntilTarget, getRecentActivity, getScopedWork, getSixMonthTrend, getWorkOwner, type DashboardRange } from './dashboard-metrics'

type DashboardScope = 'my' | 'team'

const rangeLabels: Record<DashboardRange, string> = {
  month: 'This month',
  '30days': 'Last 30 days',
  year: 'This year',
  all: 'All time',
}

const priorityStyles: Record<RequestPriority, string> = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-blue-50 text-blue-700',
  High: 'bg-orange-50 text-orange-700',
  Urgent: 'bg-rose-50 text-rose-700',
}

export default function DashboardPage() {
  const [scope, setScope] = useState<DashboardScope>('my')
  const [range, setRange] = useState<DashboardRange>('year')
  const [selectedPeople, setSelectedPeople] = useState(() => mockPeople.map(person => person.name))
  const [teams] = useState(loadTeams)
  const [selectedTeamId, setSelectedTeamId] = useState('all')
  const requests = useMemo(() => loadMockRequests(), [])
  const allWork = useMemo(() => getScopedWork(requests), [requests])
  const scopedWork = useMemo(() => scope === 'my' ? getScopedWork(requests, mockCurrentUser.name) : allWork.filter(request => selectedPeople.includes(getWorkOwner(request) ?? '')), [allWork, requests, scope, selectedPeople])
  const metrics = useMemo(() => calculateDashboardMetrics(scopedWork, range), [range, scopedWork])
  const trend = useMemo(() => getSixMonthTrend(scopedWork), [scopedWork])
  const activity = useMemo(() => getRecentActivity(scopedWork, range, scope === 'my' ? mockCurrentUser.name : undefined), [range, scope, scopedWork])
  const attention = [...metrics.overdue, ...metrics.dueSoon].slice(0, 6)
  const rangeLabel = rangeLabels[range]
  const availablePeople = useMemo(() => { const names = new Set(getTeamMemberNames(selectedTeamId, teams)); return mockPeople.filter(person => names.has(person.name)) }, [selectedTeamId, teams])

  const changeTeam = (teamId: string) => {
    setSelectedTeamId(teamId)
    setSelectedPeople(getTeamMemberNames(teamId, teams))
  }

  useEffect(() => {
    runMockTargetReminderCycle(requests)
  }, [requests])

  return (
    <section className='page-container space-y-5'>
      <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
        <div className='flex flex-col justify-start gap-2 sm:flex-row sm:flex-wrap'>
          <div className='inline-flex w-full rounded-lg border border-slate-200 bg-white p-1 sm:w-auto'>
            <ScopeButton active={scope === 'my'} icon={BriefcaseBusiness} onClick={() => setScope('my')}>My Performance</ScopeButton>
            <ScopeButton active={scope === 'team'} icon={Users} onClick={() => setScope('team')}>Team Overview</ScopeButton>
          </div>
          {scope === 'team' && <TeamSelect teams={teams} value={selectedTeamId} onChange={changeTeam} className='w-full sm:w-56' />}
          {scope === 'team' && <PeopleMultiSelect selected={selectedPeople} onChange={setSelectedPeople} people={availablePeople} className='w-full sm:w-64' />}
          <select value={range} onChange={event => setRange(event.target.value as DashboardRange)} aria-label='Dashboard date range' className='h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)] sm:w-40'>
            {Object.entries(rangeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        {scope === 'team' && <div className='mt-3 flex flex-col justify-between gap-2 border-t border-slate-100 pt-3 lg:flex-row lg:items-center'><PeopleSelectionBar selected={selectedPeople} onChange={setSelectedPeople} label='People in this dashboard' /><p className='shrink-0 text-[10px] text-slate-400'>Top KPIs and charts show the combined total.</p></div>}
      </section>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <KpiCard label='Accepted' value={metrics.accepted} caption={rangeLabel} icon={ArrowDownToLine} tone='primary' />
        <KpiCard label='In Progress' value={metrics.active} caption='Current workload' icon={BriefcaseBusiness} tone='blue' />
        <KpiCard label='Finished Work' value={metrics.finished} caption={`${metrics.completed} software confirmed`} icon={CheckCircle2} tone='emerald' />
        <KpiCard label='Overdue' value={metrics.overdue.length} caption='Needs attention now' icon={AlertTriangle} tone={metrics.overdue.length ? 'rose' : 'slate'} />
      </div>

      {scope === 'team' && <PeopleComparison requests={allWork} people={selectedPeople} range={range} />}

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        <MiniMetric icon={Target} label='On-target rate' value={`${metrics.onTargetRate}%`} detail={`${metrics.onTarget} on time / ${metrics.completedLate} late`} />
        <MiniMetric icon={Clock3} label='Avg. lead time' value={`${metrics.averageLeadDays} days`} detail='Accept to Finish' />
        <MiniMetric icon={CalendarClock} label='Due within 7 days' value={metrics.dueSoon.length} detail='Current In Progress' />
        <MiniMetric icon={CheckCircle2} label='Waiting confirm' value={metrics.waitingConfirm} detail='Programmer already finished' />
        <MiniMetric icon={RotateCcw} label='Returned' value={metrics.returned} detail={`${metrics.targetChanges} Target Date changes`} />
      </div>

      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]'>
        <Panel title='Accepted vs Finished' subtitle='Last 6 months' icon={BarChart3}>
          <ThroughputChart trend={trend} />
        </Panel>
        <Panel title='Delivery performance' subtitle={rangeLabel} icon={Target}>
          <PerformanceDonut onTarget={metrics.onTarget} late={metrics.completedLate} rate={metrics.onTargetRate} />
        </Panel>
      </div>

      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]'>
        <Panel title='Needs your attention' subtitle={`${attention.length} visible items`} icon={AlertTriangle}>
          <AttentionList requests={attention} team={scope === 'team'} />
        </Panel>
        <Panel title='Active workload by priority' subtitle={`${metrics.active} current items`} icon={Activity}>
          <PriorityBreakdown requests={scopedWork.filter(request => request.status === 'In Progress')} />
        </Panel>
      </div>

      {scope === 'team' && <TeamPerformance requests={scopedWork} range={range} />}

      <Panel title='Recent activity' subtitle={rangeLabel} icon={TrendingUp}>
        {activity.length ? (
          <div className='divide-y divide-slate-100'>
            {activity.map(item => (
              <div key={item.id} className='grid gap-1 py-3 text-sm md:grid-cols-[145px_minmax(220px,1fr)_190px_170px] md:items-center'>
                <b className='text-[var(--app-primary)]'>{item.request.requestNo}</b>
                <div className='min-w-0'><p className='truncate font-medium text-slate-800'>{item.action}</p>{item.detail && <p className='mt-0.5 truncate text-xs text-slate-500'>{item.detail}</p>}</div>
                <span className='text-slate-600'>{item.person}</span>
                <time className='text-xs text-slate-400'>{formatDateTime(item.occurredAt)}</time>
              </div>
            ))}
          </div>
        ) : <EmptyState message='No activity was found in this period.' />}
      </Panel>

      <p className='text-right text-[11px] text-slate-400'>On Target compares Finish Work date with Target Date. Waiting Software Confirm is not counted as overdue.</p>
    </section>
  )
}

function ScopeButton({ active, icon: Icon, onClick, children }: { active: boolean; icon: LucideIcon; onClick: () => void; children: string }) {
  return <button type='button' onClick={onClick} className={`flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${active ? 'bg-[var(--app-primary)] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><Icon className='size-4' />{children}</button>
}

const toneStyles = {
  primary: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]',
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-500',
} as const

function KpiCard({ label, value, caption, icon: Icon, tone }: { label: string; value: number; caption: string; icon: LucideIcon; tone: keyof typeof toneStyles }) {
  return <article className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'><div className='flex items-start justify-between gap-3'><div><p className='text-xs font-medium text-slate-500'>{label}</p><p className='mt-2 text-3xl font-semibold tracking-tight text-slate-900'>{value}</p><p className='mt-1 text-xs text-slate-400'>{caption}</p></div><span className={`flex size-10 items-center justify-center rounded-xl ${toneStyles[tone]}`}><Icon className='size-5' /></span></div></article>
}

function MiniMetric({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string | number; detail: string }) {
  return <article className='flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm'><span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)]'><Icon className='size-4.5' /></span><div className='min-w-0'><p className='truncate text-[11px] text-slate-500'>{label}</p><p className='text-lg font-semibold leading-6 text-slate-900'>{value}</p><p className='truncate text-[10px] text-slate-400'>{detail}</p></div></article>
}

function PeopleComparison({ requests, people, range }: { requests: SoftwareRequest[]; people: string[]; range: DashboardRange }) {
  if (!people.length) return <EmptyState message='Select at least one person to compare performance.' />
  return <section><div className='mb-2 flex items-end justify-between'><div><h2 className='text-sm font-semibold text-slate-900'>Performance by person</h2><p className='text-[10px] text-slate-400'>Each color stays consistent across the team view.</p></div><span className='text-[10px] text-slate-400'>{rangeLabels[range]}</span></div><div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>{people.map(name => { const person = mockPeople.find(item => item.name === name); const metrics = calculateDashboardMetrics(getScopedWork(requests, name), range); const theme = getPersonTheme(name); return <article key={name} className='relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm'><span className={`absolute inset-x-0 top-0 h-1 ${theme.bar}`} /><div className='flex items-center gap-2.5'><span className={`grid size-9 shrink-0 place-items-center rounded-full text-[10px] font-bold ${theme.avatar}`}>{initials(name)}</span><div className='min-w-0'><p className='truncate text-xs font-semibold text-slate-800'>{name}</p><p className='truncate text-[9px] text-slate-400'>{person?.position ?? 'Team member'}</p></div></div><div className='mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-100 pt-3'><PersonMetric label='Accepted' value={metrics.accepted} /><PersonMetric label='In progress' value={metrics.active} tone='text-blue-600' /><PersonMetric label='Finished' value={metrics.finished} tone='text-emerald-600' /><PersonMetric label='Overdue' value={metrics.overdue.length} tone={metrics.overdue.length ? 'text-rose-600' : 'text-slate-700'} /></div><div className='mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2'><span className='text-[9px] text-slate-400'>On-target rate</span><b className='text-xs text-[var(--app-primary)]'>{metrics.onTargetRate}%</b></div></article> })}</div></section>
}

function PersonMetric({ label, value, tone = 'text-slate-700' }: { label: string; value: number; tone?: string }) { return <div><p className='text-[9px] text-slate-400'>{label}</p><p className={`text-base font-semibold ${tone}`}>{value}</p></div> }

function Panel({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: LucideIcon; children: React.ReactNode }) {
  return <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'><div className='flex items-center justify-between gap-3 border-b border-slate-100 pb-3'><div className='flex items-center gap-2'><span className='flex size-8 items-center justify-center rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)]'><Icon className='size-4' /></span><div><h2 className='text-sm font-semibold text-slate-900'>{title}</h2><p className='text-[11px] text-slate-400'>{subtitle}</p></div></div></div><div className='pt-4'>{children}</div></section>
}

function ThroughputChart({ trend }: { trend: ReturnType<typeof getSixMonthTrend> }) {
  const maximum = Math.max(1, ...trend.flatMap(item => [item.accepted, item.finished]))
  return <div><div className='flex h-44 items-end justify-around gap-3 border-b border-slate-200 px-2'>{trend.map(item => <div key={item.key} className='flex h-full flex-1 items-end justify-center gap-1.5'><ChartBar label={`${item.label}: ${item.accepted} accepted`} value={item.accepted} maximum={maximum} className='bg-[var(--app-primary)]' /><ChartBar label={`${item.label}: ${item.finished} finished`} value={item.finished} maximum={maximum} className='bg-emerald-400' /></div>)}</div><div className='flex justify-around px-2 pt-2'>{trend.map(item => <span key={item.key} className='flex-1 text-center text-[10px] font-medium text-slate-500'>{item.label}</span>)}</div><div className='mt-3 flex justify-center gap-5 text-xs text-slate-500'><span className='flex items-center gap-1.5'><i className='size-2.5 rounded-sm bg-[var(--app-primary)]' />Accepted</span><span className='flex items-center gap-1.5'><i className='size-2.5 rounded-sm bg-emerald-400' />Finished</span></div></div>
}

function ChartBar({ label, value, maximum, className }: { label: string; value: number; maximum: number; className: string }) {
  return <div title={label} className={`relative min-h-1 w-full max-w-7 rounded-t-md transition-all ${className}`} style={{ height: `${Math.max(4, (value / maximum) * 140)}px` }}>{value > 0 && <span className='absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-600'>{value}</span>}</div>
}

function PerformanceDonut({ onTarget, late, rate }: { onTarget: number; late: number; rate: number }) {
  const total = onTarget + late
  const circumference = 251.2
  const offset = circumference - (rate / 100) * circumference
  return <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'><div className='relative size-40'><svg viewBox='0 0 100 100' className='size-full -rotate-90'><circle cx='50' cy='50' r='40' fill='none' stroke='#fee2e2' strokeWidth='10' /><circle cx='50' cy='50' r='40' fill='none' stroke='var(--app-primary)' strokeWidth='10' strokeLinecap='round' strokeDasharray={circumference} strokeDashoffset={total ? offset : circumference} /></svg><div className='absolute inset-0 flex flex-col items-center justify-center'><b className='text-2xl text-slate-900'>{rate}%</b><span className='text-[10px] text-slate-400'>On Target</span></div></div><div className='space-y-3 text-sm'><LegendDot color='bg-[var(--app-primary)]' label='On Target' value={onTarget} /><LegendDot color='bg-rose-300' label='Completed Late' value={late} /><p className='border-t border-slate-100 pt-2 text-xs text-slate-400'>{total} finished with Target Date</p></div></div>
}

function LegendDot({ color, label, value }: { color: string; label: string; value: number }) {
  return <div className='flex min-w-40 items-center gap-2'><span className={`size-2.5 rounded-full ${color}`} /><span className='flex-1 text-slate-600'>{label}</span><b className='text-slate-800'>{value}</b></div>
}

function AttentionList({ requests, team }: { requests: SoftwareRequest[]; team: boolean }) {
  if (!requests.length) return <EmptyState message='No overdue work or deadline within the next 7 days.' />
  const today = new Date()
  return <div className='space-y-2'>{requests.map(request => {
    const days = daysUntilTarget(request.targetDate, today)
    const overdue = days < 0
    return <Link key={request.id} to={team ? '/request/history' : '/programmer/my-work'} className='grid gap-2 rounded-lg border border-slate-200 px-3 py-2.5 transition hover:border-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] sm:grid-cols-[130px_minmax(180px,1fr)_160px_auto] sm:items-center'><b className='text-sm text-[var(--app-primary)]'>{request.requestNo}</b><div className='min-w-0'><p className='truncate text-sm font-medium text-slate-800'>{request.title}</p><p className='truncate text-[11px] text-slate-400'>{getWorkOwner(request) ?? '-'}</p></div><span className='text-xs text-slate-500'>Target: {request.targetDate}</span><span className={`w-fit rounded-full px-2 py-1 text-[10px] font-semibold ${overdue ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{overdue ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `Due in ${days} days`}</span></Link>
  })}</div>
}

function PriorityBreakdown({ requests }: { requests: SoftwareRequest[] }) {
  const priorities: RequestPriority[] = ['Urgent', 'High', 'Medium', 'Low']
  const maximum = Math.max(1, ...priorities.map(priority => requests.filter(request => request.priority === priority).length))
  return <div className='space-y-3'>{priorities.map(priority => { const count = requests.filter(request => request.priority === priority).length; return <div key={priority}><div className='mb-1.5 flex items-center justify-between text-xs'><span className={`rounded-full px-2 py-0.5 font-medium ${priorityStyles[priority]}`}>{priority}</span><b className='text-slate-700'>{count}</b></div><div className='h-2 overflow-hidden rounded-full bg-slate-100'><div className='h-full rounded-full bg-[var(--app-primary)]' style={{ width: `${(count / maximum) * 100}%` }} /></div></div>})}</div>
}

function TeamPerformance({ requests, range }: { requests: SoftwareRequest[]; range: DashboardRange }) {
  const rows = mockPeople.map(person => {
    const work = getScopedWork(requests, person.name)
    return { person, metrics: calculateDashboardMetrics(work, range), work }
  }).filter(row => row.work.length > 0)
  return <Panel title='Team performance' subtitle={`${rows.length} people with assigned work`} icon={Users}><div className='overflow-x-auto'><table className='w-full min-w-[820px] text-left text-sm'><thead><tr className='border-b border-slate-200 text-xs text-slate-500'><th className='pb-2 font-medium'>Programmer</th><th className='pb-2 text-center font-medium'>Accepted</th><th className='pb-2 text-center font-medium'>In Progress</th><th className='pb-2 text-center font-medium'>Finished</th><th className='pb-2 text-center font-medium'>On Target</th><th className='pb-2 text-center font-medium'>Overdue</th><th className='pb-2 text-center font-medium'>Avg. Lead Time</th></tr></thead><tbody>{rows.map(({ person, metrics }) => <tr key={person.employeeCode} className='border-b border-slate-100 last:border-0'><td className='py-3'><div className='font-medium text-slate-800'>{person.name}</div><div className='text-[11px] text-slate-400'>{person.employeeCode} · {person.position}</div></td><td className='py-3 text-center font-medium text-slate-700'>{metrics.accepted}</td><td className='py-3 text-center font-medium text-blue-600'>{metrics.active}</td><td className='py-3 text-center font-medium text-emerald-600'>{metrics.finished}</td><td className='py-3 text-center'><span className='rounded-full bg-[var(--app-primary-soft)] px-2 py-1 text-xs font-semibold text-[var(--app-primary)]'>{metrics.onTargetRate}%</span></td><td className='py-3 text-center font-medium text-rose-600'>{metrics.overdue.length}</td><td className='py-3 text-center text-slate-600'>{metrics.averageLeadDays} days</td></tr>)}</tbody></table></div></Panel>
}

function EmptyState({ message }: { message: string }) {
  return <div className='rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-400'>{message}</div>
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

function initials(name: string) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
}
