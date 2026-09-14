export type RequestStatus = 'Waiting Submit' | 'Waiting Approve' | 'Review' | 'Pending' | 'Approved' | 'In Progress' | 'Cancellation Requested' | 'Waiting Software Confirm' | 'Completed' | 'Rejected' | 'Cancelled'
export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
export type SoftwareRequestKind = 'New' | 'Revise'
export type ApprovalMethod = 'flow' | 'manual'
export type WorkStartMode = 'Current' | 'Backdate'
export type ApprovalRole = 'Checker' | 'Approver'
export type ApprovalStepStatus = 'Pending' | 'Approved' | 'Rejected'
export type ApprovalStep = {
  id: string
  role: ApprovalRole
  person: string
  status: ApprovalStepStatus
  decidedAt?: string
}
export type ApprovalAction = 'Check' | 'Approve' | 'Review' | 'Not Approve'
export type ApprovalHistoryItem = {
  id: string
  role: ApprovalRole
  person: string
  action: ApprovalAction
  comment?: string
  decidedAt: string
}
export type ApprovalRouteChangeReason = 'Employee Resigned' | 'Department Transfer' | 'Long-term Leave' | 'Responsibility Change' | 'Flow Correction'
export type ApprovalRouteHistoryItem = {
  id: string
  role: ApprovalRole
  from: string
  to: string
  reason: ApprovalRouteChangeReason
  changedBy: string
  changedAt: string
  wasCurrentStep: boolean
  notifiedPeople: string[]
}
export type OwnerTransferReason = 'Resigned' | 'Department Transfer' | 'Long-term Leave' | 'Responsibility Change'
export type OwnerTransferHistoryItem = {
  id: string
  from: string
  to: string
  reason: OwnerTransferReason
  remark?: string
  transferredBy: string
  transferredAt: string
  notifiedPeople: string[]
}
export type CancellationHistoryAction = 'Requested' | 'Cancelled' | 'Declined'
export type CancellationHistoryItem = {
  id: string
  action: CancellationHistoryAction
  person: string
  reason: string
  occurredAt: string
  notifiedPeople: string[]
}
export type WorkHistoryAction = 'Accepted' | 'Target Date Updated' | 'Returned' | 'Finished' | 'Software Confirmed'
export type WorkHistoryItem = {
  id: string
  action: WorkHistoryAction
  person: string
  occurredAt: string
  detail?: string
}
export type SubmitRequestValues = {
  approvalMethod: ApprovalMethod
  checkers: string[]
  approvers: string[]
  cc: string[]
  programmerRecipients: string[]
}
export const requestTypeOptions = ['General', 'Trouble Report/Customer Claim', 'Install New Product/Type'] as const
export type SoftwareRequestType = typeof requestTypeOptions[number]

export type SoftwareRequest = {
  id: number
  requestNo: string
  title: string
  requester: string
  owner?: string
  category: string
  priority: RequestPriority
  status: RequestStatus
  requestedAt: string
  filePath?: string
  softwareControlNo?: string
  process?: string
  requestType?: SoftwareRequestType
  description?: string
  version?: string
  versionLevel?: 'Low' | 'Medium' | 'High'
  requestKind?: SoftwareRequestKind
  approvalMethod?: ApprovalMethod
  checkers?: string[]
  approvers?: string[]
  cc?: string[]
  programmerRecipients?: string[]
  submissionNotifiedPeople?: string[]
  approvalSteps?: ApprovalStep[]
  approvalHistory?: ApprovalHistoryItem[]
  approvalRouteHistory?: ApprovalRouteHistoryItem[]
  submittedAt?: string
  approvedAt?: string
  acceptedAt?: string
  workStartMode?: WorkStartMode
  actualStartDate?: string
  workStartBackdateReason?: string
  targetDate?: string
  targetDateReason?: string
  assignee?: string
  ownerTransferHistory?: OwnerTransferHistoryItem[]
  cancellationHistory?: CancellationHistoryItem[]
  cancellationRequestedAt?: string
  cancellationRequestedBy?: string
  cancellationReason?: string
  cancelledAt?: string
  cancelledBy?: string
  workHistory?: WorkHistoryItem[]
  finishedAt?: string
  completedAt?: string
  completionNote?: string
  lateCompletionReason?: string
  confirmedSoftwareControlNo?: string
  softwareControlApprovedBy?: string
  softwareControlConfirmedBy?: string
  softwareControlConfirmedAt?: string
}

export type RequestSearchValues = {
  keyword: string
  status: RequestStatus | ''
  priority: RequestPriority | ''
}

export type RequestFormValues = {
  title: string
  category: string
  priority: RequestPriority
  description?: string
  process?: string
  requestType?: SoftwareRequestType
  softwareControlNo?: string
  versionLevel?: 'Low' | 'Medium' | 'High'
  version?: string
  requestKind?: SoftwareRequestKind
}

export type RequestModalMode = 'view' | 'edit'
