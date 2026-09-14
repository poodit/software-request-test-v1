import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, BarChart3, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleDot, Clock3, Columns3, GripVertical, List, MessageSquareText, Paperclip, Plus, Search, UserRound, Users } from 'lucide-react'

import { mockCurrentUser, mockPeople } from '@/_workspace/data/mock-people'
import { loadMockRequests } from '@/_workspace/data/request-software/requestStore'
import type { SoftwareRequest } from '@/_workspace/pages/request-software/types'
import { PeopleMultiSelect, PeopleSelectionBar } from '@/_workspace/PeopleMultiSelect'
import { getPersonTheme } from '@/_workspace/person-theme'
import { getTeamMemberNames, loadTeams } from '@/_workspace/team-store'
import { TeamSelect } from '@/_workspace/TeamSelect'
import { Button } from '@/components/ui/button'

import { loadPlannerTasks, savePlannerTasks } from './planner-store'
import type { PlannerScope, PlannerTask, PlannerTaskPriority, PlannerTaskStatus, PlannerView } from './planner-types'
import { PlannerTaskDialog } from './PlannerTaskDialog'

const statuses: PlannerTaskStatus[] = ['Not Started', 'In Progress', 'Blocked', 'Completed']

const statusStyle: Record<PlannerTaskStatus, { badge: string; dot: string; column: string }> = {
  'Not Started': { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', column: 'border-slate-200' },
  'In Progress': { badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500', column: 'border-blue-200' },
  Blocked: { badge: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500', column: 'border-rose-200' },
  Completed: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', column: 'border-emerald-200' },
}

const priorityStyle: Record<PlannerTaskPriority, string> = {
  Low: 'bg-slate-100 text-slate-600', Medium: 'bg-blue-50 text-blue-700', High: 'bg-orange-50 text-orange-700', Urgent: 'bg-rose-50 text-rose-700',
}

export default function PlannerPage() {
  const [referenceDate] = useState(() => new Date())
  const [tasks, setTasks] = useState<PlannerTask[]>(loadPlannerTasks)
  const [view, setView] = useState<PlannerView>('board')
  const [scope, setScope] = useState<PlannerScope>('my')
  const [selectedPeople, setSelectedPeople] = useState(() => mockPeople.map(person => person.name))
  const [teams] = useState(loadTeams)
  const [selectedTeamId, setSelectedTeamId] = useState('all')
  const [plan, setPlan] = useState('All plans')
  const [query, setQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState<PlannerTask | null>(null)
  const [creatingTask, setCreatingTask] = useState(false)
  const [calendarCursor, setCalendarCursor] = useState(() => { const today = new Date(); return new Date(today.getFullYear(), today.getMonth(), 1) })
  const requests = useMemo(() => loadMockRequests(), [])

  useEffect(() => { savePlannerTasks(tasks) }, [tasks])

  const planOptions = useMemo(() => ['All plans', ...Array.from(new Set(tasks.map(task => task.plan)))], [tasks])
  const availablePeople = useMemo(() => { const names = new Set(getTeamMemberNames(selectedTeamId, teams)); return mockPeople.filter(person => names.has(person.name)) }, [selectedTeamId, teams])
  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return tasks
      .filter(task => scope === 'my' ? task.assignee === mockCurrentUser.name : task.type !== 'Personal' && selectedPeople.includes(task.assignee))
      .filter(task => plan === 'All plans' || task.plan === plan)
      .filter(task => !normalizedQuery || [task.title, task.description, task.assignee, task.plan, ...task.labels].some(value => value.toLowerCase().includes(normalizedQuery)))
      .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
  }, [plan, query, scope, selectedPeople, tasks])

  const nowKey = referenceDate.toISOString().slice(0, 10)
  const weekDate = new Date(referenceDate)
  weekDate.setDate(weekDate.getDate() + 7)
  const weekKey = weekDate.toISOString().slice(0, 10)
  const activeTasks = visibleTasks.filter(task => task.status !== 'Completed')
  const overdue = activeTasks.filter(task => task.dueDate < nowKey)
  const dueSoon = activeTasks.filter(task => task.dueDate >= nowKey && task.dueDate <= weekKey)
  const completed = visibleTasks.filter(task => task.status === 'Completed')

  const updateStatus = (task: PlannerTask, status: PlannerTaskStatus) => {
    if (task.status === status) return
    const now = new Date().toISOString()
    setTasks(items => items.map(item => item.id === task.id ? { ...item, status, updatedAt: now, completedAt: status === 'Completed' ? now : undefined, activity: [...item.activity, { id: `activity-${Date.now()}`, person: mockCurrentUser.name, action: `moved task from ${item.status} to ${status}`, createdAt: now }] } : item))
  }

  const saveTask = (task: PlannerTask) => {
    setTasks(items => items.some(item => item.id === task.id) ? items.map(item => item.id === task.id ? task : item) : [task, ...items])
    setCreatingTask(false)
    setSelectedTask(null)
  }

  const changeTeam = (teamId: string) => {
    setSelectedTeamId(teamId)
    setSelectedPeople(getTeamMemberNames(teamId, teams))
  }

  return (
    <section className='page-container space-y-5'>
      <section className='rounded-xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex flex-col gap-3 border-b border-slate-200 p-3 xl:flex-row xl:items-center'>
          <div className='inline-flex w-fit rounded-lg bg-slate-100 p-1'>
            <ScopeButton active={scope === 'my'} icon={UserRound} onClick={() => setScope('my')}>My tasks</ScopeButton>
            <ScopeButton active={scope === 'team'} icon={Users} onClick={() => setScope('team')}>Team plan</ScopeButton>
          </div>
          {scope === 'team' && <TeamSelect teams={teams} value={selectedTeamId} onChange={changeTeam} className='w-fit' />}
          {scope === 'team' && <PeopleMultiSelect selected={selectedPeople} onChange={setSelectedPeople} people={availablePeople} className='w-fit' />}
          {scope === 'my' && <div className='flex flex-1 flex-col gap-2 sm:flex-row'>
            <label className='relative flex-1'><Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400' /><input value={query} onChange={event => setQuery(event.target.value)} placeholder='Search task, project, person, label...' className='h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' /></label>
            <select value={plan} onChange={event => setPlan(event.target.value)} className='h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[var(--app-primary)]'>{planOptions.map(item => <option key={item}>{item}</option>)}</select>
          </div>}
          <div className='inline-flex w-fit rounded-lg border border-slate-200 bg-white p-1 xl:ml-auto'>
            <ViewButton active={view === 'board'} icon={Columns3} onClick={() => setView('board')}>Board</ViewButton>
            <ViewButton active={view === 'list'} icon={List} onClick={() => setView('list')}>List</ViewButton>
            <ViewButton active={view === 'calendar'} icon={CalendarDays} onClick={() => setView('calendar')}>Calendar</ViewButton>
          </div>
          <Button type='button' onClick={() => setCreatingTask(true)}><Plus />Create Task</Button>
        </div>

        {scope === 'team' && <div className='grid gap-2 border-b border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_220px]'>
          <label className='relative'><Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400' /><input value={query} onChange={event => setQuery(event.target.value)} placeholder='Search task, project, person, label...' className='h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' /></label>
          <select value={plan} onChange={event => setPlan(event.target.value)} className='h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[var(--app-primary)]'>{planOptions.map(item => <option key={item}>{item}</option>)}</select>
        </div>}

        {scope === 'team' && <div className='border-b border-slate-200 bg-slate-50/60 px-4 py-2.5'><PeopleSelectionBar selected={selectedPeople} onChange={setSelectedPeople} label='Task owners shown' /></div>}
      </section>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <Metric icon={CircleDot} label='Active tasks' value={activeTasks.length} detail={scope === 'my' ? 'Assigned to me' : 'Across the team'} tone='primary' />
        <Metric icon={CalendarDays} label='Due within 7 days' value={dueSoon.length} detail='Plan time before the deadline' tone='blue' />
        <Metric icon={AlertTriangle} label='Overdue' value={overdue.length} detail={overdue.length ? 'Action or re-plan required' : 'No overdue tasks'} tone={overdue.length ? 'rose' : 'slate'} />
        <Metric icon={CheckCircle2} label='Completed' value={completed.length} detail={`${visibleTasks.length ? Math.round(completed.length / visibleTasks.length * 100) : 0}% of visible tasks`} tone='emerald' />
      </div>

      <section className='rounded-xl border border-slate-200 bg-white shadow-sm'>
        {view === 'board' && <BoardView tasks={visibleTasks} requests={requests} onOpen={setSelectedTask} onStatusChange={updateStatus} onCreate={() => setCreatingTask(true)} />}
        {view === 'list' && <ListView tasks={visibleTasks} requests={requests} onOpen={setSelectedTask} />}
        {view === 'calendar' && <CalendarView tasks={visibleTasks} requests={requests} cursor={calendarCursor} setCursor={setCalendarCursor} onOpen={setSelectedTask} />}
      </section>

      {scope === 'team' && <TeamWorkload tasks={visibleTasks} />}

      {(creatingTask || selectedTask) && <PlannerTaskDialog task={selectedTask ?? undefined} requests={requests} onClose={() => { setCreatingTask(false); setSelectedTask(null) }} onSave={saveTask} />}
    </section>
  )
}

function BoardView({ tasks, requests, onOpen, onStatusChange, onCreate }: { tasks: PlannerTask[]; requests: SoftwareRequest[]; onOpen: (task: PlannerTask) => void; onStatusChange: (task: PlannerTask, status: PlannerTaskStatus) => void; onCreate: () => void }) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<PlannerTaskStatus | null>(null)

  const dropTask = (status: PlannerTaskStatus) => {
    const task = tasks.find(item => item.id === draggedTaskId)
    if (task) onStatusChange(task, status)
    setDraggedTaskId(null)
    setDragOverStatus(null)
  }

  return <div className='grid gap-3 overflow-x-auto p-3 xl:grid-cols-4'>{statuses.map(status => { const columnTasks = tasks.filter(task => task.status === status); return <section key={status} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDragOverStatus(status) }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOverStatus(null) }} onDrop={event => { event.preventDefault(); dropTask(status) }} className={`min-w-[280px] rounded-xl border bg-slate-50/70 transition ${statusStyle[status].column} ${dragOverStatus === status ? 'ring-2 ring-[var(--app-primary)] ring-offset-2' : ''}`}><header className='flex items-center justify-between border-b border-slate-200/80 px-3 py-3'><div className='flex items-center gap-2'><span className={`size-2.5 rounded-full ${statusStyle[status].dot}`} /><h2 className='text-sm font-semibold text-slate-800'>{status}</h2><span className='rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500'>{columnTasks.length}</span></div><button type='button' aria-label={`Add ${status} task`} onClick={onCreate} className='rounded-md p-1 text-slate-400 hover:bg-white hover:text-[var(--app-primary)]'><Plus className='size-4' /></button></header><div className={`min-h-36 max-h-[650px] space-y-2 overflow-y-auto p-2.5 transition ${dragOverStatus === status ? 'bg-[var(--app-primary-soft)]/40' : ''}`}>{columnTasks.map(task => <TaskCard key={task.id} task={task} request={findRequest(requests, task)} dragging={draggedTaskId === task.id} onDragStart={event => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', task.id); setDraggedTaskId(task.id) }} onDragEnd={() => { setDraggedTaskId(null); setDragOverStatus(null) }} onOpen={() => onOpen(task)} onStatusChange={value => onStatusChange(task, value)} />)}{columnTasks.length === 0 && !draggedTaskId && <button type='button' onClick={onCreate} className='w-full rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-8 text-xs text-slate-400 hover:border-[var(--app-primary)] hover:text-[var(--app-primary)]'>+ Add task</button>}{columnTasks.length === 0 && draggedTaskId && <div className='grid min-h-28 place-items-center rounded-lg border-2 border-dashed border-[var(--app-primary)] bg-white/70 text-xs font-medium text-[var(--app-primary)]'>Drop task here</div>}</div></section> })}</div>
}

function TaskCard({ task, request, dragging, onDragStart, onDragEnd, onOpen, onStatusChange }: { task: PlannerTask; request?: SoftwareRequest; dragging: boolean; onDragStart: React.DragEventHandler<HTMLElement>; onDragEnd: () => void; onOpen: () => void; onStatusChange: (status: PlannerTaskStatus) => void }) {
  const completedChecks = task.checklist.filter(item => item.completed).length
  const overdue = task.status !== 'Completed' && task.dueDate < new Date().toISOString().slice(0, 10)
  const personTheme = getPersonTheme(task.assignee)
  return <article draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onOpen} className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition active:cursor-grabbing ${dragging ? 'scale-95 opacity-40' : 'hover:-translate-y-0.5 hover:border-[var(--app-primary)] hover:shadow-md'}`}><div className='mb-2 flex items-start justify-between gap-2'><div className='flex flex-wrap gap-1'>{task.labels.slice(0, 2).map(label => <span key={label} className='rounded bg-[var(--app-primary-soft)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--app-primary)]'>{label}</span>)}</div><div className='flex items-center gap-1'><span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${priorityStyle[task.priority]}`}>{task.priority}</span><GripVertical className='size-4 text-slate-300' /></div></div><h3 className='line-clamp-2 text-sm font-semibold leading-5 text-slate-800'>{task.title}</h3>{request && <p className='mt-1.5 truncate text-[10px] font-semibold text-[var(--app-primary)]'>{request.requestNo} · {request.title}</p>}<div className='mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500'><span className={`flex items-center gap-1 font-medium ${overdue ? 'text-rose-600' : ''}`}><CalendarDays className='size-3' />{formatDate(task.dueDate)}{overdue && ' · Overdue'}</span><span title={task.assignee} className={`inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border py-0.5 pr-2 pl-0.5 font-semibold ${personTheme.chip}`}><span className={`grid size-5 shrink-0 place-items-center rounded-full text-[8px] font-bold ${personTheme.avatar}`}>{initials(task.assignee)}</span><span className='truncate'>{task.assignee}</span></span></div><div className='mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400'><div className='flex gap-3'>{task.checklist.length > 0 && <span className='flex items-center gap-1'><CheckCircle2 className='size-3' />{completedChecks}/{task.checklist.length}</span>}{task.comments.length > 0 && <span className='flex items-center gap-1'><MessageSquareText className='size-3' />{task.comments.length}</span>}{(task.attachments?.length ?? 0) > 0 && <span className='flex items-center gap-1'><Paperclip className='size-3' />{task.attachments?.length}</span>}{task.estimateHours && <span className='flex items-center gap-1'><Clock3 className='size-3' />{task.estimateHours}h</span>}</div><select value={task.status} aria-label='Change task status' onMouseDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()} onChange={event => onStatusChange(event.target.value as PlannerTaskStatus)} className='max-w-28 cursor-pointer rounded border border-slate-200 bg-white px-1 py-0.5 text-[9px] font-medium text-slate-600 outline-none'>{statuses.map(item => <option key={item}>{item}</option>)}</select></div></article>
}

function ListView({ tasks, requests, onOpen }: { tasks: PlannerTask[]; requests: SoftwareRequest[]; onOpen: (task: PlannerTask) => void }) {
  if (!tasks.length) return <Empty />
  return <div className='overflow-x-auto'><table className='w-full min-w-[980px] text-left text-sm'><thead className='bg-slate-50 text-xs text-slate-500'><tr><th className='px-4 py-3 font-medium'>Task name</th><th className='px-4 py-3 font-medium'>Source</th><th className='px-4 py-3 font-medium'>Assignee</th><th className='px-4 py-3 font-medium'>Schedule</th><th className='px-4 py-3 font-medium'>Priority</th><th className='px-4 py-3 font-medium'>Status</th><th className='px-4 py-3 text-center font-medium'>Progress</th></tr></thead><tbody className='divide-y divide-slate-100'>{tasks.map(task => { const request = findRequest(requests, task); const checks = task.checklist.length ? Math.round(task.checklist.filter(item => item.completed).length / task.checklist.length * 100) : task.status === 'Completed' ? 100 : 0; const personTheme = getPersonTheme(task.assignee); return <tr key={task.id} onClick={() => onOpen(task)} className='cursor-pointer hover:bg-[var(--app-primary-soft)]'><td className='px-4 py-3'><p className='max-w-sm truncate font-medium text-slate-800'>{task.title}</p><p className='mt-0.5 text-[10px] text-slate-400'>{task.plan} · {task.type}</p></td><td className='px-4 py-3'>{request ? <div><p className='font-semibold text-[var(--app-primary)]'>{request.requestNo}</p><p className='max-w-48 truncate text-[10px] text-slate-400'>{request.title}</p></div> : <span className='text-xs text-slate-400'>Personal task</span>}</td><td className='px-4 py-3'><span className={`inline-flex items-center gap-1.5 rounded-full border py-1 pr-2 pl-1 text-[10px] font-semibold ${personTheme.chip}`}><span className={`grid size-5 place-items-center rounded-full text-[7px] ${personTheme.avatar}`}>{initials(task.assignee)}</span>{task.assignee}</span></td><td className='px-4 py-3 text-xs text-slate-500'>{formatDate(task.startDate)} – {formatDate(task.dueDate)}</td><td className='px-4 py-3'><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${priorityStyle[task.priority]}`}>{task.priority}</span></td><td className='px-4 py-3'><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle[task.status].badge}`}>{task.status}</span></td><td className='px-4 py-3'><div className='mx-auto w-20'><div className='mb-1 flex justify-between text-[9px] text-slate-400'><span>{checks}%</span><span>{task.checklist.filter(item => item.completed).length}/{task.checklist.length}</span></div><div className='h-1.5 overflow-hidden rounded-full bg-slate-100'><div className='h-full rounded-full bg-[var(--app-primary)]' style={{ width: `${checks}%` }} /></div></div></td></tr> })}</tbody></table></div>
}

function CalendarView({ tasks, requests, cursor, setCursor, onOpen }: { tasks: PlannerTask[]; requests: SoftwareRequest[]; cursor: Date; setCursor: (date: Date) => void; onOpen: (task: PlannerTask) => void }) {
  const days = getCalendarDays(cursor)
  const todayKey = new Date().toISOString().slice(0, 10)
  return <div><header className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3'><div><h2 className='text-base font-semibold text-slate-800'>{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2><p className='text-[10px] text-slate-400'>Tasks appear throughout their planned Start–Due window.</p></div><div className='flex items-center gap-1'><Button type='button' variant='outline' size='sm' onClick={() => { const now = new Date(); setCursor(new Date(now.getFullYear(), now.getMonth(), 1)) }}>Today</Button><Button type='button' variant='ghost' size='icon-sm' aria-label='Previous month' onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><ChevronLeft /></Button><Button type='button' variant='ghost' size='icon-sm' aria-label='Next month' onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><ChevronRight /></Button></div></header><div className='grid grid-cols-7 border-b border-slate-200 bg-slate-50'>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className='px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400'>{day}</div>)}</div><div className='grid grid-cols-7'>{days.map(day => { const key = toDateKey(day); const dayTasks = tasks.filter(task => task.startDate <= key && task.dueDate >= key); const currentMonth = day.getMonth() === cursor.getMonth(); return <div key={key} className={`min-h-28 border-r border-b border-slate-100 p-1.5 last:border-r-0 ${currentMonth ? 'bg-white' : 'bg-slate-50/70'}`}><div className={`mb-1 grid size-6 place-items-center rounded-full text-[10px] font-semibold ${key === todayKey ? 'bg-[var(--app-primary)] text-white' : currentMonth ? 'text-slate-600' : 'text-slate-300'}`}>{day.getDate()}</div><div className='space-y-1'>{dayTasks.slice(0, 3).map(task => { const request = findRequest(requests, task); const boundary = task.startDate === key ? 'Start' : task.dueDate === key ? 'Due' : ''; const personTheme = getPersonTheme(task.assignee); return <button type='button' key={task.id} title={`${task.assignee}: ${task.title}${request ? ` (${request.requestNo})` : ''}`} onClick={() => onOpen(task)} className={`flex w-full items-center gap-1 truncate rounded px-1 py-1 text-left text-[9px] font-medium ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : task.status === 'Blocked' ? 'bg-rose-50 text-rose-700' : 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]'}`}><span className={`grid size-4 shrink-0 place-items-center rounded-full text-[6px] font-bold ${personTheme.avatar}`}>{initials(task.assignee)}</span><span className='truncate'>{boundary && <b>{boundary} · </b>}{task.title}</span></button>})}{dayTasks.length > 3 && <p className='px-1 text-[9px] text-slate-400'>+{dayTasks.length - 3} more</p>}</div></div> })}</div></div>
}

function TeamWorkload({ tasks }: { tasks: PlannerTask[] }) {
  const rows = mockPeople.map(person => { const personTasks = tasks.filter(task => task.assignee === person.name && task.status !== 'Completed'); const hours = personTasks.reduce((sum, task) => sum + (task.estimateHours ?? 0), 0); return { person, tasks: personTasks.length, hours, blocked: personTasks.filter(task => task.status === 'Blocked').length } }).filter(row => row.tasks > 0)
  const maxHours = Math.max(1, ...rows.map(row => row.hours))
  return <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'><div className='mb-4 flex items-center gap-2'><span className='grid size-8 place-items-center rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)]'><BarChart3 className='size-4' /></span><div><h2 className='text-sm font-semibold text-slate-900'>Team workload</h2><p className='text-[10px] text-slate-400'>Estimated effort for active tasks in the current filter.</p></div></div><div className='grid gap-3 lg:grid-cols-2'>{rows.map(row => <div key={row.person.employeeCode} className='rounded-lg border border-slate-200 p-3'><div className='mb-2 flex items-center justify-between gap-3'><div><p className='text-xs font-semibold text-slate-800'>{row.person.name}</p><p className='text-[10px] text-slate-400'>{row.person.position}</p></div><div className='text-right'><b className='text-sm text-slate-800'>{row.hours}h</b><p className='text-[9px] text-slate-400'>{row.tasks} active{row.blocked ? ` · ${row.blocked} blocked` : ''}</p></div></div><div className='h-2 overflow-hidden rounded-full bg-slate-100'><div className={`h-full rounded-full ${row.blocked ? 'bg-rose-500' : 'bg-[var(--app-primary)]'}`} style={{ width: `${row.hours / maxHours * 100}%` }} /></div></div>)}</div></section>
}

const metricTones = { primary: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]', blue: 'bg-blue-50 text-blue-600', rose: 'bg-rose-50 text-rose-600', slate: 'bg-slate-100 text-slate-500', emerald: 'bg-emerald-50 text-emerald-600' } as const
function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof CircleDot; label: string; value: number; detail: string; tone: keyof typeof metricTones }) { return <article className='flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${metricTones[tone]}`}><Icon className='size-5' /></span><div className='min-w-0'><p className='text-[11px] font-medium text-slate-500'>{label}</p><p className='text-2xl font-semibold text-slate-900'>{value}</p><p className='truncate text-[10px] text-slate-400'>{detail}</p></div></article> }
function ScopeButton({ active, icon: Icon, onClick, children }: { active: boolean; icon: typeof UserRound; onClick: () => void; children: ReactNode }) { return <button type='button' onClick={onClick} className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition ${active ? 'bg-white text-[var(--app-primary)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><Icon className='size-3.5' />{children}</button> }
function ViewButton({ active, icon: Icon, onClick, children }: { active: boolean; icon: typeof Columns3; onClick: () => void; children: ReactNode }) { return <button type='button' onClick={onClick} className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold transition ${active ? 'bg-[var(--app-primary)] text-white' : 'text-slate-500 hover:bg-slate-50'}`}><Icon className='size-3.5' />{children}</button> }
function Empty() { return <div className='p-6'><div className='rounded-lg border border-dashed border-slate-200 bg-slate-50 py-14 text-center text-sm text-slate-400'>No tasks match the current filters.</div></div> }
function findRequest(requests: SoftwareRequest[], task: PlannerTask) { return requests.find(request => request.id === task.linkedRequestId) }
function initials(name: string) { return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() }
function formatDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) }
function toDateKey(date: Date) { const year = date.getFullYear(); const month = `${date.getMonth() + 1}`.padStart(2, '0'); const day = `${date.getDate()}`.padStart(2, '0'); return `${year}-${month}-${day}` }
function getCalendarDays(cursor: Date) { const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1); const start = new Date(first); start.setDate(first.getDate() - first.getDay()); return Array.from({ length: 42 }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day }) }
