import { mockCurrentUser } from '@/_workspace/data/mock-people'

import type { PlannerTask } from './planner-types'

const plannerStorageKey = 'template-test.planner.mock-tasks.v2'

function dateFromToday(offset: number) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

function timestampFromToday(offset: number, hour = 9) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function createMockTasks(): PlannerTask[] {
  return [
    {
      id: 'PLN-001', title: 'Design alarm dashboard wireframe', description: 'Prepare responsive screens and confirm the alarm severity hierarchy with the requester.', type: 'Project', plan: 'Software Delivery', status: 'In Progress', priority: 'High', assignee: mockCurrentUser.name, createdBy: 'Emma Wilson', startDate: dateFromToday(-3), dueDate: dateFromToday(2), estimateHours: 12, linkedRequestId: 5, labels: ['UI/UX', 'Frontend'],
      checklist: [{ id: 'cl-1', title: 'Review existing alarm screen', completed: true }, { id: 'cl-2', title: 'Create desktop wireframe', completed: true }, { id: 'cl-3', title: 'Create mobile states', completed: false }, { id: 'cl-4', title: 'Requester review', completed: false }],
      comments: [{ id: 'cm-1', author: 'Emma Wilson', message: 'Please include the acknowledgement state in the first review.', createdAt: timestampFromToday(-2, 14) }, { id: 'cm-2', author: mockCurrentUser.name, message: 'Desktop flow is ready. I am working on the mobile states.', createdAt: timestampFromToday(-1, 10) }],
      activity: [{ id: 'ac-1', person: 'Emma Wilson', action: 'created and assigned this task', createdAt: timestampFromToday(-3) }, { id: 'ac-2', person: mockCurrentUser.name, action: 'moved task to In Progress', createdAt: timestampFromToday(-2) }], createdAt: timestampFromToday(-3), updatedAt: timestampFromToday(-1, 10),
    },
    {
      id: 'PLN-002', title: 'Implement maintenance reminder scheduler', description: 'Create reminder rules and mock the notification schedule before connecting the mail service.', type: 'Project', plan: 'Software Delivery', status: 'Not Started', priority: 'Medium', assignee: mockCurrentUser.name, createdBy: 'Emma Wilson', startDate: dateFromToday(1), dueDate: dateFromToday(7), estimateHours: 18, linkedRequestId: 21, labels: ['Backend', 'Notification'],
      checklist: [{ id: 'cl-5', title: 'Define reminder intervals', completed: false }, { id: 'cl-6', title: 'Create scheduler', completed: false }, { id: 'cl-7', title: 'Add notification log', completed: false }], comments: [], activity: [{ id: 'ac-3', person: 'Emma Wilson', action: 'created and assigned this task', createdAt: timestampFromToday(-1) }], createdAt: timestampFromToday(-1), updatedAt: timestampFromToday(-1),
    },
    {
      id: 'PLN-003', title: 'Resolve quality escalation API dependency', description: 'The production API contract is incomplete. Coordinate with the integration team and document the agreed payload.', type: 'Project', plan: 'Software Delivery', status: 'Blocked', priority: 'Urgent', assignee: mockCurrentUser.name, createdBy: mockCurrentUser.name, startDate: dateFromToday(-5), dueDate: dateFromToday(-1), estimateHours: 8, linkedRequestId: 20, labels: ['API', 'Blocked'],
      checklist: [{ id: 'cl-8', title: 'List missing fields', completed: true }, { id: 'cl-9', title: 'Confirm contract with integration team', completed: false }], comments: [{ id: 'cm-3', author: mockCurrentUser.name, message: 'Waiting for the production API owner to confirm the response fields.', createdAt: timestampFromToday(-1, 16) }], activity: [{ id: 'ac-4', person: mockCurrentUser.name, action: 'marked task as Blocked', createdAt: timestampFromToday(-1, 16) }], createdAt: timestampFromToday(-5), updatedAt: timestampFromToday(-1, 16),
    },
    {
      id: 'PLN-004', title: 'Regression test permission matrix', description: 'Test administrator and department user roles before Software Control confirmation.', type: 'Project', plan: 'Software Delivery', status: 'Completed', priority: 'Medium', assignee: mockCurrentUser.name, createdBy: mockCurrentUser.name, startDate: dateFromToday(-12), dueDate: dateFromToday(-8), estimateHours: 6, linkedRequestId: 6, labels: ['Testing'],
      checklist: [{ id: 'cl-10', title: 'Admin role', completed: true }, { id: 'cl-11', title: 'Department role', completed: true }, { id: 'cl-12', title: 'Record evidence', completed: true }], comments: [], activity: [{ id: 'ac-5', person: mockCurrentUser.name, action: 'completed this task', createdAt: timestampFromToday(-9, 15) }], createdAt: timestampFromToday(-12), updatedAt: timestampFromToday(-9, 15), completedAt: timestampFromToday(-9, 15),
    },
    {
      id: 'PLN-005', title: 'Prepare weekly development update', description: 'Summarize delivery progress, risks, and next-week capacity for the team meeting.', type: 'Personal', plan: 'Personal Tasks', status: 'Not Started', priority: 'Low', assignee: mockCurrentUser.name, createdBy: mockCurrentUser.name, startDate: dateFromToday(2), dueDate: dateFromToday(3), estimateHours: 2, labels: ['Meeting'], checklist: [], comments: [], activity: [{ id: 'ac-6', person: mockCurrentUser.name, action: 'created this personal task', createdAt: timestampFromToday(0) }], createdAt: timestampFromToday(0), updatedAt: timestampFromToday(0),
    },
    {
      id: 'PLN-006', title: 'Supplier portal database schema', description: 'Design supplier, document, and approval tables for the first implementation sprint.', type: 'Project', plan: 'Team Delivery', status: 'In Progress', priority: 'High', assignee: 'Alex Morgan', createdBy: 'Emma Wilson', startDate: dateFromToday(-2), dueDate: dateFromToday(5), estimateHours: 16, linkedRequestId: 14, labels: ['Database'], checklist: [{ id: 'cl-13', title: 'Entity relationship draft', completed: true }, { id: 'cl-14', title: 'Index review', completed: false }], comments: [], activity: [{ id: 'ac-7', person: 'Emma Wilson', action: 'assigned this task to Alex Morgan', createdAt: timestampFromToday(-2) }], createdAt: timestampFromToday(-2), updatedAt: timestampFromToday(-2),
    },
    {
      id: 'PLN-007', title: 'Review label print acceptance criteria', description: 'Confirm printer model, label size, retry behavior, and acceptance test cases.', type: 'Project', plan: 'Team Delivery', status: 'Not Started', priority: 'Medium', assignee: 'Liam Carter', createdBy: 'Emma Wilson', startDate: dateFromToday(0), dueDate: dateFromToday(4), estimateHours: 4, linkedRequestId: 4, labels: ['Requirement'], checklist: [], comments: [], activity: [{ id: 'ac-8', person: 'Emma Wilson', action: 'assigned this task to Liam Carter', createdAt: timestampFromToday(-1) }], createdAt: timestampFromToday(-1), updatedAt: timestampFromToday(-1),
    },
  ]
}

export function loadPlannerTasks(): PlannerTask[] {
  try {
    const stored = window.localStorage.getItem(plannerStorageKey)
    if (!stored) return createMockTasks()
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed as PlannerTask[] : createMockTasks()
  } catch {
    return createMockTasks()
  }
}

export function savePlannerTasks(tasks: PlannerTask[]) {
  window.localStorage.setItem(plannerStorageKey, JSON.stringify(tasks))
}
