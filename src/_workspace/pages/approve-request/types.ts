import type { ApprovalRole, RequestPriority } from '../request-software/types'

export type ApproveRequestSearchValues = {
  keyword: string
  role: ApprovalRole | ''
  priority: RequestPriority | ''
}

export type ApprovalDialogMode = 'view' | 'review'
