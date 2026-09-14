import type { SoftwareRequest, WorkHistoryItem } from '@/_workspace/pages/request-software/types'

export type DashboardRange = 'month' | '30days' | 'year' | 'all'

export type DashboardMetrics = {
  accepted: number
  active: number
  finished: number
  completed: number
  onTarget: number
  completedLate: number
  onTargetRate: number
  overdue: SoftwareRequest[]
  dueSoon: SoftwareRequest[]
  waitingConfirm: number
  returned: number
  targetChanges: number
  averageLeadDays: number
}

export type DashboardActivity = {
  id: string
  request: SoftwareRequest
  action: string
  person: string
  occurredAt: string
  detail?: string
}

export const toDateKey = (value?: string) => value?.slice(0, 10) ?? ''

export function getWorkOwner(request: SoftwareRequest) {
  if (request.assignee) return request.assignee
  const accepted = [...(request.workHistory ?? [])].reverse().find(item => item.action === 'Accepted')
  return accepted?.person
}

export function getAcceptedAt(request: SoftwareRequest) {
  if (request.acceptedAt) return request.acceptedAt
  return [...(request.workHistory ?? [])].reverse().find(item => item.action === 'Accepted')?.occurredAt
}

export function getScopedWork(requests: SoftwareRequest[], person?: string) {
  return requests.filter(request => {
    if (!request.acceptedAt && !request.workHistory?.some(item => item.action === 'Accepted')) return false
    return !person || getWorkOwner(request) === person || request.workHistory?.some(item => item.person === person && item.action === 'Accepted')
  })
}

export function isInDashboardRange(value: string | undefined, range: DashboardRange, now = new Date()) {
  if (!value) return false
  if (range === 'all') return true
  const dateKey = toDateKey(value)
  const year = String(now.getFullYear())
  const month = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`
  if (range === 'month') return dateKey.startsWith(month)
  if (range === 'year') return dateKey.startsWith(year)

  const date = new Date(value)
  const start = new Date(now)
  start.setDate(start.getDate() - 29)
  start.setHours(0, 0, 0, 0)
  return date >= start && date <= now
}

export function calculateDashboardMetrics(work: SoftwareRequest[], range: DashboardRange, now = new Date()): DashboardMetrics {
  const today = localDateKey(now)
  const active = work.filter(request => request.status === 'In Progress')
  const finished = work.filter(request => isInDashboardRange(request.finishedAt, range, now))
  const deliveriesWithTarget = finished.filter(request => request.targetDate)
  const onTarget = deliveriesWithTarget.filter(request => toDateKey(request.finishedAt) <= request.targetDate!).length
  const completedLate = deliveriesWithTarget.filter(request => toDateKey(request.finishedAt) > request.targetDate!).length
  const overdue = active.filter(request => Boolean(request.targetDate && request.targetDate < today)).sort(sortByTargetDate)
  const dueSoon = active.filter(request => {
    if (!request.targetDate || request.targetDate < today) return false
    const days = daysBetween(today, request.targetDate)
    return days >= 0 && days <= 7
  }).sort(sortByTargetDate)
  const leadTimes = finished.flatMap(request => (request.actualStartDate || request.acceptedAt) && request.finishedAt
    ? [Math.max(0, daysBetween(request.actualStartDate ?? toDateKey(request.acceptedAt), toDateKey(request.finishedAt)))]
    : [])

  return {
    accepted: work.filter(request => isInDashboardRange(getAcceptedAt(request), range, now)).length,
    active: active.length,
    finished: finished.length,
    completed: work.filter(request => isInDashboardRange(request.completedAt, range, now)).length,
    onTarget,
    completedLate,
    onTargetRate: deliveriesWithTarget.length ? Math.round((onTarget / deliveriesWithTarget.length) * 100) : 0,
    overdue,
    dueSoon,
    waitingConfirm: work.filter(request => request.status === 'Waiting Software Confirm').length,
    returned: work.reduce((total, request) => total + (request.workHistory ?? []).filter(item => item.action === 'Returned' && isInDashboardRange(item.occurredAt, range, now)).length, 0),
    targetChanges: work.reduce((total, request) => total + (request.workHistory ?? []).filter(item => item.action === 'Target Date Updated' && isInDashboardRange(item.occurredAt, range, now)).length, 0),
    averageLeadDays: leadTimes.length ? Math.round((leadTimes.reduce((sum, days) => sum + days, 0) / leadTimes.length) * 10) / 10 : 0,
  }
}

export function getRecentActivity(work: SoftwareRequest[], range: DashboardRange, person?: string, now = new Date()): DashboardActivity[] {
  const events: DashboardActivity[] = []

  work.forEach(request => {
    const owner = getWorkOwner(request) ?? request.assignee ?? '-'
    const acceptedAt = getAcceptedAt(request)
    if (acceptedAt && (!person || owner === person)) events.push({ id: `${request.id}-accepted`, request, action: 'Accepted work', person: owner, occurredAt: acceptedAt, detail: request.targetDate ? `Target Date: ${request.targetDate}` : undefined })
    if (request.finishedAt && (!person || owner === person)) events.push({ id: `${request.id}-finished`, request, action: 'Finished work', person: owner, occurredAt: request.finishedAt, detail: request.lateCompletionReason })
    if (request.completedAt && (!person || owner === person)) events.push({ id: `${request.id}-completed`, request, action: 'Software confirmed', person: request.softwareControlConfirmedBy ?? owner, occurredAt: request.completedAt })
    ;(request.workHistory ?? []).filter(item => item.action === 'Returned' || item.action === 'Target Date Updated').forEach(item => {
      if (!person || item.person === person) events.push(historyToActivity(request, item))
    })
  })

  return events.filter(event => isInDashboardRange(event.occurredAt, range, now)).sort((left, right) => right.occurredAt.localeCompare(left.occurredAt)).slice(0, 8)
}

export function getSixMonthTrend(work: SoftwareRequest[], now = new Date()) {
  return Array.from({ length: 6 }, (_, reverseIndex) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - reverseIndex), 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    return {
      key,
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      accepted: work.filter(request => toDateKey(getAcceptedAt(request)).startsWith(key)).length,
      finished: work.filter(request => toDateKey(request.finishedAt).startsWith(key)).length,
    }
  })
}

export function daysUntilTarget(targetDate?: string, now = new Date()) {
  return targetDate ? daysBetween(localDateKey(now), targetDate) : 0
}

function historyToActivity(request: SoftwareRequest, item: WorkHistoryItem): DashboardActivity {
  return { id: item.id, request, action: item.action, person: item.person, occurredAt: item.occurredAt, detail: item.detail }
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function daysBetween(from: string, to: string) {
  return Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000)
}

function sortByTargetDate(left: SoftwareRequest, right: SoftwareRequest) {
  return (left.targetDate ?? '').localeCompare(right.targetDate ?? '')
}
