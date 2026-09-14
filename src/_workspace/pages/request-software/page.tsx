import { useEffect, useMemo, useState } from 'react'

import { mockCurrentUser } from '@/_workspace/data/mock-people'
import { getMockCancelledFilePath, getMockRequestFilePath, getMockSubmittedFilePath } from '@/_workspace/data/request-software/mockFilePath'
import { loadMockRequests, saveMockRequests } from '@/_workspace/data/request-software/requestStore'
import { DeleteRequestDialog } from './modal/DeleteRequestDialog'
import { NewProgramModal } from './modal/NewProgramModal'
import { RequestCreatedDialog } from './modal/RequestCreatedDialog'
import { RequestSubmittedDialog } from './modal/RequestSubmittedDialog'
import { ReviseProgramModal } from './modal/ReviseProgramModal'
import { SoftwareControlCheckDialog } from './modal/SoftwareControlCheckDialog'
import { SubmitRequestDialog } from './modal/SubmitRequestDialog'
import { TransferRequestOwnerDialog } from './modal/TransferRequestOwnerDialog'
import { CancelRequestDialog } from './modal/CancelRequestDialog'
import { SearchFilters } from './SearchFilters'
import { SearchResult } from './SearchResult'
import { applyOwnerTransfer, getRequestOwner } from './owner-transfer'
import type { OwnerTransferReason, RequestFormValues, RequestModalMode, RequestSearchValues, SoftwareRequest, SubmitRequestValues } from './types'

const emptySearchValues: RequestSearchValues = { keyword: '', status: '', priority: '' }
type OpenModal = {
  mode: RequestModalMode
  request?: SoftwareRequest
}

type AddFlow = 'check' | 'new' | 'revise' | null

export default function RequestSoftwarePage() {
  const [requests, setRequests] = useState<SoftwareRequest[]>(loadMockRequests)
  const [searchValues, setSearchValues] = useState(emptySearchValues)
  const [appliedSearch, setAppliedSearch] = useState(emptySearchValues)
  const [openModal, setOpenModal] = useState<OpenModal | null>(null)
  const [addFlow, setAddFlow] = useState<AddFlow>(null)
  const [checkedControlNo, setCheckedControlNo] = useState('')
  const [createdRequest, setCreatedRequest] = useState<SoftwareRequest | null>(null)
  const [requestToSubmit, setRequestToSubmit] = useState<SoftwareRequest | null>(null)
  const [submittedRequest, setSubmittedRequest] = useState<SoftwareRequest | null>(null)
  const [requestToDelete, setRequestToDelete] = useState<SoftwareRequest | null>(null)
  const [requestToTransfer, setRequestToTransfer] = useState<SoftwareRequest | null>(null)
  const [requestToCancel, setRequestToCancel] = useState<SoftwareRequest | null>(null)

  useEffect(() => {
    saveMockRequests(requests)
  }, [requests])

  const filteredRequests = useMemo(() => {
    const keyword = appliedSearch.keyword.trim().toLowerCase()

    return requests.filter(request => getRequestOwner(request) === mockCurrentUser.name).filter(request => {
      const matchesKeyword = !keyword || [request.requestNo, request.softwareControlNo, request.title, request.category, request.process, request.requester, getRequestOwner(request)]
        .filter((value): value is string => Boolean(value))
        .some(value => value.toLowerCase().includes(keyword))
      const matchesStatus = !appliedSearch.status || request.status === appliedSearch.status
      const matchesPriority = !appliedSearch.priority || request.priority === appliedSearch.priority

      return matchesKeyword && matchesStatus && matchesPriority
    }).sort((left, right) => {
      const leftIsClaim = left.requestType === 'Trouble Report/Customer Claim'
      const rightIsClaim = right.requestType === 'Trouble Report/Customer Claim'
      return Number(rightIsClaim) - Number(leftIsClaim)
    })
  }, [appliedSearch, requests])

  const clearSearch = () => {
    setSearchValues(emptySearchValues)
    setAppliedSearch(emptySearchValues)
  }

  const createRequest = (values: RequestFormValues) => {
    const id = Math.max(0, ...requests.map(request => request.id)) + 1
    const requestNo = `SR-2026-${String(id).padStart(3, '0')}`
    const createdRequest: SoftwareRequest = {
      id,
      requestNo,
      requester: mockCurrentUser.name,
      owner: mockCurrentUser.name,
      status: 'Waiting Submit',
      requestedAt: new Date().toISOString().slice(0, 10),
      ...values,
      softwareControlNo: values.softwareControlNo === 'Generated on create' ? `SC-${String(10000 + id)}` : values.softwareControlNo,
      version: values.version ?? '1.0.0',
      requestKind: values.requestKind ?? 'New',
      filePath: getMockRequestFilePath(requestNo),
    }

    setRequests(current => [createdRequest, ...current])
    setCreatedRequest(createdRequest)
    setAddFlow(null)
  }

  const saveRequest = (values: RequestFormValues) => {
    if (openModal?.mode === 'edit' && openModal.request) {
      setRequests(current => current.map(request => request.id === openModal.request?.id ? { ...request, ...values } : request))
    }

    setOpenModal(null)
  }

  const deleteRequest = () => {
    if (!requestToDelete) return

    setRequests(current => current.filter(request => request.id !== requestToDelete.id))
    setRequestToDelete(null)
  }

  const transferOwner = (request: SoftwareRequest, newOwner: string, reason: OwnerTransferReason, remark: string) => {
    const updatedRequest = applyOwnerTransfer(request, newOwner, reason, remark, mockCurrentUser.name)
    const nextRequests = requests.map(item => item.id === updatedRequest.id ? updatedRequest : item)
    setRequests(nextRequests)
    saveMockRequests(nextRequests)
    setRequestToTransfer(null)
  }

  const openSubmitDialog = (request: SoftwareRequest) => {
    setOpenModal(null)
    setRequestToSubmit(request)
  }

  const submitRequest = (request: SoftwareRequest, values: SubmitRequestValues) => {
    const submitted: SoftwareRequest = {
      ...request,
      ...values,
      status: 'Waiting Approve',
      submittedAt: new Date().toISOString(),
      filePath: getMockSubmittedFilePath(request.requestNo),
      approvalSteps: [
        ...values.checkers.map((person, index) => ({ id: `checker-${index + 1}`, role: 'Checker' as const, person, status: 'Pending' as const })),
        ...values.approvers.map((person, index) => ({ id: `approver-${index + 1}`, role: 'Approver' as const, person, status: 'Pending' as const })),
      ],
      submissionNotifiedPeople: Array.from(new Set([...values.checkers, ...values.approvers, ...values.cc, ...values.programmerRecipients])),
    }
    setRequests(current => current.map(item => item.id === request.id ? submitted : item))
    setRequestToSubmit(null)
    setSubmittedRequest(submitted)
  }

  const cancelRequest = (request: SoftwareRequest, reason: string) => {
    const occurredAt = new Date().toISOString()
    const isAssigned = request.status === 'In Progress' && Boolean(request.assignee)
    const notifiedPeople = Array.from(new Set([request.assignee, request.owner ?? request.requester, ...(request.programmerRecipients ?? [])].filter((person): person is string => Boolean(person))))
    const nextRequests = requests.map(item => item.id === request.id ? {
      ...item,
      status: isAssigned ? 'Cancellation Requested' as const : 'Cancelled' as const,
      cancellationRequestedAt: occurredAt,
      cancellationRequestedBy: mockCurrentUser.name,
      cancellationReason: reason,
      cancelledAt: isAssigned ? undefined : occurredAt,
      cancelledBy: isAssigned ? undefined : mockCurrentUser.name,
      filePath: isAssigned ? item.filePath : getMockCancelledFilePath(item.requestNo),
      cancellationHistory: [...(item.cancellationHistory ?? []), { id: `${item.id}-cancel-${Date.now()}`, action: isAssigned ? 'Requested' as const : 'Cancelled' as const, person: mockCurrentUser.name, reason, occurredAt, notifiedPeople }],
    } : item)
    setRequests(nextRequests)
    saveMockRequests(nextRequests)
    setRequestToCancel(null)
  }

  return (
    <section className='page-container space-y-5'>
      <SearchFilters
        values={searchValues}
        onChange={setSearchValues}
        onSearch={() => setAppliedSearch(searchValues)}
        onClear={clearSearch}
      />
      <SearchResult
        requests={filteredRequests}
        onView={request => setOpenModal({ mode: 'view', request })}
        onEdit={request => setOpenModal({ mode: 'edit', request })}
        onDelete={request => setRequestToDelete(request)}
        onSubmit={openSubmitDialog}
        onTransfer={setRequestToTransfer}
        onCancel={setRequestToCancel}
        onAdd={() => { setCheckedControlNo(''); setAddFlow('check') }}
      />

      {openModal?.request && (openModal.request.requestKind === 'Revise'
        ? <ReviseProgramModal mode={openModal.mode} request={openModal.request} requests={requests} onClose={() => setOpenModal(null)} onSave={saveRequest} onSubmitRequest={() => openSubmitDialog(openModal.request!)} />
        : <NewProgramModal mode={openModal.mode} request={openModal.request} requests={requests} onClose={() => setOpenModal(null)} onSave={saveRequest} onSubmitRequest={() => openSubmitDialog(openModal.request!)} />
      )}
      {addFlow === 'check' && <SoftwareControlCheckDialog requests={requests} onClose={() => setAddFlow(null)} onStartNew={controlNo => { setCheckedControlNo(controlNo); setAddFlow('new') }} onStartRevise={controlNo => { setCheckedControlNo(controlNo); setAddFlow('revise') }} />}
      {addFlow === 'new' && <NewProgramModal requests={requests} initialControlNo={checkedControlNo} onClose={() => setAddFlow(null)} onBack={() => setAddFlow('check')} onSwitchToRevise={controlNo => { setCheckedControlNo(controlNo); setAddFlow('revise') }} onSave={createRequest} />}
      {addFlow === 'revise' && <ReviseProgramModal requests={requests} initialControlNo={checkedControlNo} onClose={() => setAddFlow(null)} onBack={() => setAddFlow('check')} onSave={createRequest} />}
      {createdRequest && <RequestCreatedDialog request={createdRequest} onClose={() => setCreatedRequest(null)} />}
      {requestToSubmit && <SubmitRequestDialog request={requestToSubmit} onClose={() => setRequestToSubmit(null)} onSubmit={values => submitRequest(requestToSubmit, values)} />}
      {submittedRequest && <RequestSubmittedDialog request={submittedRequest} onClose={() => setSubmittedRequest(null)} />}
      {requestToDelete && <DeleteRequestDialog request={requestToDelete} onClose={() => setRequestToDelete(null)} onConfirm={deleteRequest} />}
      {requestToTransfer && <TransferRequestOwnerDialog request={requestToTransfer} onClose={() => setRequestToTransfer(null)} onTransfer={transferOwner} />}
      {requestToCancel && <CancelRequestDialog request={requestToCancel} onClose={() => setRequestToCancel(null)} onConfirm={cancelRequest} />}
    </section>
  )
}
