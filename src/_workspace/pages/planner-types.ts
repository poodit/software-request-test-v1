export type PlannerView = 'board' | 'list' | 'calendar'
export type PlannerScope = 'my' | 'team'
export type PlannerTaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Completed'
export type PlannerTaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
export type PlannerTaskType = 'Project' | 'Personal'

export type PlannerChecklistItem = { id: string; title: string; completed: boolean }
export type PlannerComment = { id: string; author: string; message: string; createdAt: string }
export type PlannerActivity = { id: string; person: string; action: string; createdAt: string }
export type PlannerAttachment = { id: string; name: string; type: string; size: number; dataUrl: string; uploadedBy: string; uploadedAt: string }

export type PlannerTask = {
  id: string
  title: string
  description: string
  type: PlannerTaskType
  plan: string
  status: PlannerTaskStatus
  priority: PlannerTaskPriority
  assignee: string
  createdBy: string
  startDate: string
  dueDate: string
  estimateHours?: number
  linkedRequestId?: number
  labels: string[]
  checklist: PlannerChecklistItem[]
  comments: PlannerComment[]
  attachments?: PlannerAttachment[]
  activity: PlannerActivity[]
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type PlannerTaskDraft = Omit<PlannerTask, 'id' | 'comments' | 'activity' | 'createdAt' | 'updatedAt' | 'completedAt'>
