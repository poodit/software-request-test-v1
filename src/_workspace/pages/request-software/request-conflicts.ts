import type { RequestStatus, SoftwareRequest } from './types'

const openRequestStatuses: RequestStatus[] = ['Waiting Submit', 'Waiting Approve', 'Pending', 'Approved', 'In Progress', 'Cancellation Requested', 'Waiting Software Confirm']

export function findOpenRequestsByControlNo(requests: SoftwareRequest[], controlNo: string, excludeRequestId?: number) {
  const normalizedControlNo = controlNo.trim().toLowerCase()

  return requests.filter(request =>
    request.id !== excludeRequestId
    && request.softwareControlNo?.toLowerCase() === normalizedControlNo
    && openRequestStatuses.includes(request.status)
  )
}
