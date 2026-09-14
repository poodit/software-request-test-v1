import type { ApprovalRouteChangeReason, SoftwareRequest } from './types'

export function replacePendingApprovalParticipant(request: SoftwareRequest, stepId: string, replacement: string, reason: ApprovalRouteChangeReason, actor: string): SoftwareRequest {
  if (request.status !== 'Waiting Approve') return request
  const originalSteps = request.approvalSteps ?? []
  const target = originalSteps.find(step => step.id === stepId && step.status === 'Pending')
  if (!target || target.person === replacement) return request

  const currentStepId = originalSteps.find(step => step.status === 'Pending')?.id
  const duplicateReplacement = originalSteps.some(step => step.id !== target.id && step.role === target.role && step.person === replacement)
  const changedAt = new Date().toISOString()
  const approvalSteps = originalSteps.flatMap(step => {
    if (step.id !== target.id) return [step]
    return duplicateReplacement ? [] : [{ ...step, person: replacement }]
  })
  const isComplete = approvalSteps.length > 0 && approvalSteps.every(step => step.status === 'Approved')
  const notifiedPeople = Array.from(new Set([replacement, request.owner ?? request.requester, ...(request.cc ?? [])]))

  return {
    ...request,
    approvalSteps,
    checkers: approvalSteps.filter(step => step.role === 'Checker').map(step => step.person),
    approvers: approvalSteps.filter(step => step.role === 'Approver').map(step => step.person),
    status: isComplete ? 'Approved' : request.status,
    approvedAt: isComplete ? changedAt : request.approvedAt,
    approvalRouteHistory: [
      ...(request.approvalRouteHistory ?? []),
      {
        id: `${request.id}-manual-route-${Date.now()}`,
        role: target.role,
        from: target.person,
        to: replacement,
        reason,
        changedBy: actor,
        changedAt,
        wasCurrentStep: target.id === currentStepId,
        notifiedPeople,
      },
    ],
  }
}
