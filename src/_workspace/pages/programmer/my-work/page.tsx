import { useEffect, useMemo, useState } from 'react'

import { mockCurrentUser } from '@/_workspace/data/mock-people'
import { getMockCancelledFilePath, getMockDoneFilePath, getMockSubmittedFilePath } from '@/_workspace/data/request-software/mockFilePath'
import { loadMockRequests, saveMockRequests } from '@/_workspace/data/request-software/requestStore'

import type { SoftwareRequest } from '../../request-software/types'
import { SearchFilters, type MyWorkSearchValues } from './SearchFilters'
import { SearchResult } from './SearchResult'
import { ReturnWorkDialog } from './ReturnWorkDialog'
import { SoftwareControlConfirmDialog } from './SoftwareControlConfirmDialog'
import { WorkRequestDialog } from './WorkRequestDialog'
import { CancellationDecisionDialog } from './CancellationDecisionDialog'

const emptySearchValues: MyWorkSearchValues = { keyword: '', status: '', priority: '' }

export default function MyWorkPage() {
  const [requests, setRequests] = useState<SoftwareRequest[]>(loadMockRequests)
  const [searchValues, setSearchValues] = useState(emptySearchValues)
  const [appliedSearch, setAppliedSearch] = useState(emptySearchValues)
  const [openWork, setOpenWork] = useState<{ request: SoftwareRequest; mode: 'view' | 'manage' } | null>(null)
  const [returnRequest, setReturnRequest] = useState<SoftwareRequest | null>(null)
  const [confirmRequest, setConfirmRequest] = useState<SoftwareRequest | null>(null)
  const [cancellationRequest, setCancellationRequest] = useState<SoftwareRequest | null>(null)

  useEffect(() => {
    saveMockRequests(requests)
  }, [requests])

  const workItems = useMemo(() => {
    const keyword = appliedSearch.keyword.trim().toLowerCase()

    return requests
      .filter(request => request.assignee === mockCurrentUser.name && (request.status === 'In Progress' || request.status === 'Cancellation Requested' || request.status === 'Waiting Software Confirm' || request.status === 'Completed'))
      .filter(request => {
        const matchesKeyword = !keyword || [request.requestNo, request.softwareControlNo, request.title, request.category, request.process, request.requester]
          .filter((value): value is string => Boolean(value))
          .some(value => value.toLowerCase().includes(keyword))
        const matchesStatus = !appliedSearch.status || request.status === appliedSearch.status
        const matchesPriority = !appliedSearch.priority || request.priority === appliedSearch.priority
        return matchesKeyword && matchesStatus && matchesPriority
      })
      .sort((left, right) => {
        const statusOrder = { 'Cancellation Requested': 0, 'In Progress': 1, 'Waiting Software Confirm': 2, Completed: 3 } as const
        return statusOrder[left.status as keyof typeof statusOrder] - statusOrder[right.status as keyof typeof statusOrder] || (right.acceptedAt ?? '').localeCompare(left.acceptedAt ?? '')
      })
  }, [appliedSearch, requests])

  const updateRequest = (request: SoftwareRequest, changes: Partial<SoftwareRequest>) => {
    const nextRequests = requests.map(item => item.id === request.id ? { ...item, ...changes } : item)
    setRequests(nextRequests)
    saveMockRequests(nextRequests)
    setOpenWork(null)
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
      <SearchResult
        requests={workItems}
        onView={request => setOpenWork({ request, mode: 'view' })}
        onManage={request => setOpenWork({ request, mode: 'manage' })}
        onReturn={setReturnRequest}
        onConfirmSoftware={setConfirmRequest}
        onReviewCancellation={setCancellationRequest}
      />

      {openWork && (
        <WorkRequestDialog
          request={openWork.request}
          mode={openWork.mode}
          onClose={() => setOpenWork(null)}
          onSave={(request, targetDate, targetDateReason) => {
            const occurredAt = new Date().toISOString()
            updateRequest(request, { targetDate, targetDateReason, workHistory: [...(request.workHistory ?? []), { id: `${request.id}-${Date.now()}`, action: 'Target Date Updated', person: mockCurrentUser.name, occurredAt, detail: `Target Date: ${targetDate}` }] })
          }}
          onFinish={(request, targetDate, completionNote, targetDateReason, lateCompletionReason) => {
            const finishedAt = new Date().toISOString()
            updateRequest(request, {
            status: 'Waiting Software Confirm',
            targetDate,
            targetDateReason,
            completionNote,
            lateCompletionReason,
            finishedAt,
            filePath: getMockDoneFilePath(request.requestNo),
            workHistory: [...(request.workHistory ?? []), { id: `${request.id}-${Date.now()}`, action: 'Finished', person: mockCurrentUser.name, occurredAt: finishedAt, detail: [completionNote && `Summary: ${completionNote}`, lateCompletionReason && `Late reason: ${lateCompletionReason}`].filter(Boolean).join('; ') || undefined }],
          })}}
        />
      )}
      {returnRequest && <ReturnWorkDialog request={returnRequest} onClose={() => setReturnRequest(null)} onReturn={(request, reason) => {
        const occurredAt = new Date().toISOString()
        const nextRequests = requests.map(item => item.id === request.id ? {
          ...item,
          status: 'Approved' as const,
          assignee: undefined,
          acceptedAt: undefined,
          targetDate: undefined,
          targetDateReason: undefined,
          workStartMode: undefined,
          actualStartDate: undefined,
          workStartBackdateReason: undefined,
          filePath: getMockSubmittedFilePath(request.requestNo),
          workHistory: [...(request.workHistory ?? []), { id: `${request.id}-${Date.now()}`, action: 'Returned' as const, person: mockCurrentUser.name, occurredAt, detail: reason }],
        } : item)
        setRequests(nextRequests)
        saveMockRequests(nextRequests)
        setReturnRequest(null)
      }} />}
      {confirmRequest && <SoftwareControlConfirmDialog request={confirmRequest} onClose={() => setConfirmRequest(null)} onConfirm={(request, enteredControlNo, approvedBy) => {
        const confirmedAt = new Date().toISOString()
        const nextRequests = requests.map(item => item.id === request.id ? {
          ...item,
          status: 'Completed' as const,
          completedAt: confirmedAt,
          confirmedSoftwareControlNo: enteredControlNo,
          softwareControlApprovedBy: approvedBy,
          softwareControlConfirmedBy: mockCurrentUser.name,
          softwareControlConfirmedAt: confirmedAt,
          workHistory: [...(request.workHistory ?? []), { id: `${request.id}-${Date.now()}`, action: 'Software Confirmed' as const, person: mockCurrentUser.name, occurredAt: confirmedAt, detail: `Software Control: ${enteredControlNo}; Approved By: ${approvedBy}` }],
        } : item)
        setRequests(nextRequests)
        saveMockRequests(nextRequests)
        setConfirmRequest(null)
      }} />}
      {cancellationRequest && <CancellationDecisionDialog request={cancellationRequest} onClose={() => setCancellationRequest(null)} onDecision={(request, decision, comment) => {
        const occurredAt = new Date().toISOString()
        const accepted = decision === 'accept'
        const notifiedPeople = Array.from(new Set([request.owner ?? request.requester, ...(request.programmerRecipients ?? [])]))
        const nextRequests = requests.map(item => item.id === request.id ? {
          ...item,
          status: accepted ? 'Cancelled' as const : 'In Progress' as const,
          cancelledAt: accepted ? occurredAt : item.cancelledAt,
          cancelledBy: accepted ? mockCurrentUser.name : item.cancelledBy,
          filePath: accepted ? getMockCancelledFilePath(item.requestNo) : item.filePath,
          cancellationHistory: [...(item.cancellationHistory ?? []), { id: `${item.id}-cancel-decision-${Date.now()}`, action: accepted ? 'Cancelled' as const : 'Declined' as const, person: mockCurrentUser.name, reason: comment || (accepted ? 'Programmer accepted the cancellation request.' : 'Work will continue.'), occurredAt, notifiedPeople }],
        } : item)
        setRequests(nextRequests)
        saveMockRequests(nextRequests)
        setCancellationRequest(null)
      }} />}
    </section>
  )
}
