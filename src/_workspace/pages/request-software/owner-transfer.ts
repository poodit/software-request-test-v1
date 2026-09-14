import { findMockPerson } from '@/_workspace/data/mock-people'

import type { OwnerTransferReason, SoftwareRequest } from './types'

export function getRequestOwner(request: SoftwareRequest) {
  return request.owner ?? request.requester
}

export function applyOwnerTransfer(
  request: SoftwareRequest,
  newOwner: string,
  reason: OwnerTransferReason,
  remark: string,
  actor: string,
): SoftwareRequest {
  const currentOwner = getRequestOwner(request)
  if (!newOwner || newOwner === currentOwner || !findMockPerson(newOwner)) return request

  const transferredAt = new Date().toISOString()
  const currentApprovalPerson = request.approvalSteps?.find(step => step.status === 'Pending')?.person
  const notifiedPeople = Array.from(new Set([
    newOwner,
    ...(findMockPerson(currentOwner) ? [currentOwner] : []),
    ...(currentApprovalPerson ? [currentApprovalPerson] : []),
    ...(request.assignee ? [request.assignee] : []),
  ]))

  return {
    ...request,
    owner: newOwner,
    ownerTransferHistory: [
      ...(request.ownerTransferHistory ?? []),
      {
        id: `${request.id}-${Date.now()}`,
        from: currentOwner,
        to: newOwner,
        reason,
        remark: remark.trim() || undefined,
        transferredBy: actor,
        transferredAt,
        notifiedPeople,
      },
    ],
  }
}
