import { useEffect, useMemo, useState } from 'react'

import { mockCurrentUser } from '@/_workspace/data/mock-people'
import { loadMockRequests, saveMockRequests } from '@/_workspace/data/request-software/requestStore'
import { ApproveRequestDialog } from '@/_workspace/pages/approve-request/modal/ApproveRequestDialog'

import { NewProgramModal } from './modal/NewProgramModal'
import { ReviseProgramModal } from './modal/ReviseProgramModal'
import { TransferRequestOwnerDialog } from './modal/TransferRequestOwnerDialog'
import { ReplaceApprovalParticipantDialog } from './modal/ReplaceApprovalParticipantDialog'
import { replacePendingApprovalParticipant } from './approval-participant-replacement'
import { applyOwnerTransfer, getRequestOwner } from './owner-transfer'
import { RequestHistoryResult } from './RequestHistoryResult'
import { SearchFilters } from './SearchFilters'
import type { ApprovalRouteChangeReason, OwnerTransferReason, RequestSearchValues, SoftwareRequest } from './types'

const emptySearchValues: RequestSearchValues = { keyword: '', status: '', priority: '' }

export default function RequestHistoryPage() {
  const [requests, setRequests] = useState<SoftwareRequest[]>(loadMockRequests)
  const [searchValues, setSearchValues] = useState(emptySearchValues)
  const [appliedSearch, setAppliedSearch] = useState(emptySearchValues)
  const [openRequest, setOpenRequest] = useState<SoftwareRequest | null>(null)
  const [openWorkflow, setOpenWorkflow] = useState<SoftwareRequest | null>(null)
  const [requestToTransfer, setRequestToTransfer] = useState<SoftwareRequest | null>(null)
  const [requestToReplaceParticipant, setRequestToReplaceParticipant] = useState<SoftwareRequest | null>(null)

  useEffect(() => {
    saveMockRequests(requests)
  }, [requests])

  const filteredRequests = useMemo(() => {
    const keyword = appliedSearch.keyword.trim().toLowerCase()

    return requests.filter(request => {
      const matchesKeyword = !keyword || [request.requestNo, request.softwareControlNo, request.title, request.category, request.process, request.requester, getRequestOwner(request)]
        .filter((value): value is string => Boolean(value))
        .some(value => value.toLowerCase().includes(keyword))
      const matchesStatus = !appliedSearch.status || request.status === appliedSearch.status
      const matchesPriority = !appliedSearch.priority || request.priority === appliedSearch.priority
      return matchesKeyword && matchesStatus && matchesPriority
    }).sort((left, right) => right.id - left.id)
  }, [appliedSearch, requests])

  const transferOwner = (request: SoftwareRequest, newOwner: string, reason: OwnerTransferReason, remark: string) => {
    const updatedRequest = applyOwnerTransfer(request, newOwner, reason, remark, mockCurrentUser.name)
    const nextRequests = requests.map(item => item.id === updatedRequest.id ? updatedRequest : item)
    setRequests(nextRequests)
    saveMockRequests(nextRequests)
    setRequestToTransfer(null)
  }

  const replaceParticipant = (request: SoftwareRequest, stepId: string, replacement: string, reason: ApprovalRouteChangeReason) => {
    const updated = replacePendingApprovalParticipant(request, stepId, replacement, reason, mockCurrentUser.name)
    const nextRequests = requests.map(item => item.id === updated.id ? updated : item)
    setRequests(nextRequests)
    saveMockRequests(nextRequests)
    setRequestToReplaceParticipant(null)
  }

  return (
    <section className='page-container space-y-5'>
      <SearchFilters
        values={searchValues}
        onChange={setSearchValues}
        onSearch={() => setAppliedSearch(searchValues)}
        onClear={() => {
          setSearchValues(emptySearchValues)
          setAppliedSearch(emptySearchValues)
        }}
      />
      <RequestHistoryResult requests={filteredRequests} onView={setOpenRequest} onViewWorkflow={setOpenWorkflow} onTransfer={setRequestToTransfer} onReplaceParticipant={setRequestToReplaceParticipant} />

      {openRequest && (openRequest.requestKind === 'Revise'
        ? <ReviseProgramModal mode='view' request={openRequest} requests={requests} onClose={() => setOpenRequest(null)} onSave={() => setOpenRequest(null)} />
        : <NewProgramModal mode='view' request={openRequest} requests={requests} onClose={() => setOpenRequest(null)} onSave={() => setOpenRequest(null)} />
      )}
      {requestToTransfer && <TransferRequestOwnerDialog request={requestToTransfer} onClose={() => setRequestToTransfer(null)} onTransfer={transferOwner} />}
      {openWorkflow && <ApproveRequestDialog request={openWorkflow} mode='view' onClose={() => setOpenWorkflow(null)} onDecision={() => undefined} />}
      {requestToReplaceParticipant && <ReplaceApprovalParticipantDialog request={requestToReplaceParticipant} onClose={() => setRequestToReplaceParticipant(null)} onReplace={replaceParticipant} />}
    </section>
  )
}
