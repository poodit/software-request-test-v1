import type { FlowSetting } from '@/_workspace/data/flow-settings'
import type { ApprovalRole, ApprovalRouteChangeReason, SoftwareRequest } from '@/_workspace/pages/request-software/types'

export type FlowParticipantChange = {
  role: ApprovalRole
  from: string
  to: string
}

export type PendingFlowImpact = {
  request: SoftwareRequest
  changes: Array<FlowParticipantChange & { wasCurrentStep: boolean }>
}

type FlowSettingValues = Omit<FlowSetting, 'id'>

export function getFlowParticipantChanges(current: FlowSetting, next: FlowSettingValues): FlowParticipantChange[] {
  return [
    ...getRoleChanges('Checker', current.checkers, next.checkers),
    ...getRoleChanges('Approver', current.approvers, next.approvers),
  ]
}

function getRoleChanges(role: ApprovalRole, currentPeople: string[], nextPeople: string[]): FlowParticipantChange[] {
  const removed = currentPeople.filter(person => !nextPeople.includes(person))
  const added = nextPeople.filter(person => !currentPeople.includes(person))

  if (removed.length === 0 || removed.length !== added.length) return []
  return removed.map((person, index) => ({ role, from: person, to: added[index] }))
}

export function previewPendingFlowUpdate(requests: SoftwareRequest[], current: FlowSetting, next: FlowSettingValues): PendingFlowImpact[] {
  const participantChanges = getFlowParticipantChanges(current, next)
  if (participantChanges.length === 0) return []

  return requests.flatMap(request => {
    if (request.status !== 'Waiting Approve' || request.approvalMethod !== 'flow' || request.category !== current.product) return []

    const steps = request.approvalSteps ?? []
    const currentStepId = steps.find(step => step.status === 'Pending')?.id
    const changes = participantChanges.flatMap(change => {
      const hasPendingOldPerson = steps.some(step => step.role === change.role && step.person === change.from && step.status === 'Pending')
      if (!hasPendingOldPerson) return []
      return [{ ...change, wasCurrentStep: steps.some(step => step.id === currentStepId && step.role === change.role && step.person === change.from) }]
    })

    return changes.length > 0 ? [{ request, changes }] : []
  })
}

export function applyPendingFlowUpdate(
  requests: SoftwareRequest[],
  current: FlowSetting,
  next: FlowSettingValues,
  reason: ApprovalRouteChangeReason,
  actor: string,
) {
  const impacts = previewPendingFlowUpdate(requests, current, next)
  const impactByRequestId = new Map(impacts.map(impact => [impact.request.id, impact]))
  const changedAt = new Date().toISOString()

  const updatedRequests = requests.map(request => {
    const impact = impactByRequestId.get(request.id)
    if (!impact) return request

    const originalSteps = request.approvalSteps ?? []
    const approvalSteps = originalSteps.flatMap(step => {
      if (step.status !== 'Pending') return step
      const change = impact.changes.find(item => item.role === step.role && item.from === step.person)
      if (!change) return step
      const replacementAlreadyExists = originalSteps.some(other => other.id !== step.id && other.role === step.role && other.person === change.to)
      return replacementAlreadyExists ? [] : [{ ...step, person: change.to }]
    })
    const notifiedPeople = Array.from(new Set([
      ...impact.changes.map(change => change.to),
      request.owner ?? request.requester,
      ...(request.cc ?? []),
    ]))

    return {
      ...request,
      approvalSteps,
      checkers: approvalSteps.filter(step => step.role === 'Checker').map(step => step.person),
      approvers: approvalSteps.filter(step => step.role === 'Approver').map(step => step.person),
      status: approvalSteps.length > 0 && approvalSteps.every(step => step.status === 'Approved') ? 'Approved' as const : request.status,
      approvedAt: approvalSteps.length > 0 && approvalSteps.every(step => step.status === 'Approved') ? changedAt : request.approvedAt,
      approvalRouteHistory: [
        ...(request.approvalRouteHistory ?? []),
        ...impact.changes.map((change, index) => ({
          id: `${request.id}-route-${Date.now()}-${index}`,
          role: change.role,
          from: change.from,
          to: change.to,
          reason,
          changedBy: actor,
          changedAt,
          wasCurrentStep: change.wasCurrentStep,
          notifiedPeople,
        })),
      ],
    }
  })

  return { requests: updatedRequests, affectedRequests: impacts.length, affectedSteps: impacts.reduce((total, impact) => total + impact.changes.length, 0) }
}
