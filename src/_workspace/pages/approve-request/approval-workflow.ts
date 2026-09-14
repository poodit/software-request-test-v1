import { getMockReviewFilePath } from '@/_workspace/data/request-software/mockFilePath'

import type { ApprovalAction, ApprovalStep, SoftwareRequest } from '../request-software/types'

export function getApprovalSteps(request: SoftwareRequest): ApprovalStep[] {
  if (request.approvalSteps?.length) {
    return [
      ...request.approvalSteps.filter(step => step.role === 'Checker'),
      ...request.approvalSteps.filter(step => step.role === 'Approver'),
    ]
  }

  return [
    ...(request.checkers ?? []).map((person, index) => ({
      id: `checker-${index + 1}`,
      role: 'Checker' as const,
      person,
      status: 'Pending' as const,
    })),
    ...(request.approvers ?? []).map((person, index) => ({
      id: `approver-${index + 1}`,
      role: 'Approver' as const,
      person,
      status: 'Pending' as const,
    })),
  ]
}

export function getCurrentApprovalStep(request: SoftwareRequest) {
  if (request.status !== 'Waiting Approve') return undefined
  return getApprovalSteps(request).find(step => step.status === 'Pending')
}

export function isApprovalComplete(request: SoftwareRequest) {
  return request.status === 'Approved'
}

export function applyApprovalAction(request: SoftwareRequest, action: ApprovalAction, comment = '', actor = ''): SoftwareRequest {
  const currentStep = getCurrentApprovalStep(request)
  if (!currentStep) return request
  if (actor && currentStep.person !== actor) return request

  const allowedActions: Record<typeof currentStep.role, ApprovalAction[]> = {
    Checker: ['Check', 'Review'],
    Approver: ['Approve', 'Review', 'Not Approve'],
  }
  if (!allowedActions[currentStep.role].includes(action)) return request

  const hasUncheckedChecker = getApprovalSteps(request).some(step => step.role === 'Checker' && step.status === 'Pending')
  if (currentStep.role === 'Approver' && hasUncheckedChecker) return request

  const decidedAt = new Date().toISOString()
  const historyItem = {
    id: `${request.id}-${Date.now()}`,
    role: currentStep.role,
    person: currentStep.person,
    action,
    comment: comment.trim() || undefined,
    decidedAt,
  }

  if (action === 'Review') {
    return {
      ...request,
      status: 'Review',
      filePath: getMockReviewFilePath(request.requestNo),
      approvalHistory: [...(request.approvalHistory ?? []), historyItem],
    }
  }

  if (action === 'Not Approve') {
    return {
      ...request,
      approvalSteps: getApprovalSteps(request).map(step => step.id === currentStep.id
        ? { ...step, status: 'Rejected' as const, decidedAt }
        : step),
      approvalHistory: [...(request.approvalHistory ?? []), historyItem],
      status: 'Rejected',
    }
  }

  const approvalSteps = getApprovalSteps(request).map(step => step.id === currentStep.id
    ? { ...step, status: 'Approved' as const, decidedAt }
    : step)

  return {
    ...request,
    approvalSteps,
    approvalHistory: [...(request.approvalHistory ?? []), historyItem],
    status: approvalSteps.some(step => step.status === 'Pending') ? 'Waiting Approve' : 'Approved',
    approvedAt: approvalSteps.some(step => step.status === 'Pending') ? request.approvedAt : decidedAt,
  }
}
