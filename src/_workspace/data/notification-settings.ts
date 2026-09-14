import type { SoftwareRequest } from '@/_workspace/pages/request-software/types'

export type NotificationSettings = {
  enabled: boolean
  reminderDays: number[]
  notifyAssignee: boolean
  notifyRequestOwner: boolean
}

export type MockEmailNotification = {
  id: string
  eventKey: string
  requestNo: string
  softwareName: string
  targetDate: string
  daysBefore: number
  recipients: string[]
  sentAt: string
  subject: string
}

const settingsKey = 'template-test.notification-settings.v1'
const logKey = 'template-test.mock-email-log.v1'

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  reminderDays: [10, 7, 5],
  notifyAssignee: true,
  notifyRequestOwner: true,
}

export function loadNotificationSettings(): NotificationSettings {
  try {
    const stored = window.localStorage.getItem(settingsKey)
    return stored ? { ...defaultNotificationSettings, ...JSON.parse(stored) as NotificationSettings } : defaultNotificationSettings
  } catch {
    return defaultNotificationSettings
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  window.localStorage.setItem(settingsKey, JSON.stringify(settings))
}

export function loadMockEmailLog(): MockEmailNotification[] {
  try {
    const stored = window.localStorage.getItem(logKey)
    const parsed: unknown = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed as MockEmailNotification[] : []
  } catch {
    return []
  }
}

export function getUpcomingReminderCandidates(requests: SoftwareRequest[], settings: NotificationSettings, now = new Date()) {
  const today = localDateKey(now)
  return requests.flatMap(request => {
    if (!settings.enabled || request.status !== 'In Progress' || !request.targetDate || !request.assignee) return []
    const daysBefore = daysBetween(today, request.targetDate)
    if (!settings.reminderDays.includes(daysBefore)) return []
    const recipients = Array.from(new Set([
      settings.notifyAssignee ? request.assignee : undefined,
      settings.notifyRequestOwner ? request.owner ?? request.requester : undefined,
    ].filter((person): person is string => Boolean(person))))
    if (!recipients.length) return []
    return [{ request, daysBefore, recipients, eventKey: `${request.id}-${request.targetDate}-${daysBefore}` }]
  })
}

export function runMockTargetReminderCycle(requests: SoftwareRequest[], settings = loadNotificationSettings(), now = new Date()) {
  const currentLog = loadMockEmailLog()
  const existingKeys = new Set(currentLog.map(item => item.eventKey))
  const sentAt = now.toISOString()
  const notifications: MockEmailNotification[] = getUpcomingReminderCandidates(requests, settings, now)
    .filter(candidate => !existingKeys.has(candidate.eventKey))
    .map(candidate => ({
      id: `reminder-${candidate.eventKey}`,
      eventKey: candidate.eventKey,
      requestNo: candidate.request.requestNo,
      softwareName: candidate.request.title,
      targetDate: candidate.request.targetDate!,
      daysBefore: candidate.daysBefore,
      recipients: candidate.recipients,
      sentAt,
      subject: `[Target Date Reminder] ${candidate.request.requestNo} is due in ${candidate.daysBefore} days`,
    }))

  const nextLog = [...notifications, ...currentLog]
  window.localStorage.setItem(logKey, JSON.stringify(nextLog))
  return { notifications, log: nextLog }
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function daysBetween(from: string, to: string) {
  return Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000)
}
