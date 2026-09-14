import { useEffect, useMemo, useState } from 'react'

import { loadMockRequests, saveMockRequests } from '@/_workspace/data/request-software/requestStore'
import { mockCurrentUser } from '@/_workspace/data/mock-people'

import type { ApprovalAction, SoftwareRequest } from '../request-software/types'
import { applyApprovalAction, getCurrentApprovalStep } from './approval-workflow'
import { ApproveRequestDialog } from './modal/ApproveRequestDialog'
import { SearchFilters } from './SearchFilters'
import { SearchResult } from './SearchResult'
import type { ApprovalDialogMode, ApproveRequestSearchValues } from './types'

const emptySearchValues: ApproveRequestSearchValues = { keyword: '', role: '', priority: '' }

type OpenDialog = {
  request: SoftwareRequest
  mode: ApprovalDialogMode
}

export default function ApproveRequestPage() {
  const [requests, setRequests] = useState<SoftwareRequest[]>(loadMockRequests)
  const [searchValues, setSearchValues] = useState(emptySearchValues)
  const [appliedSearch, setAppliedSearch] = useState(emptySearchValues)
  const [openDialog, setOpenDialog] = useState<OpenDialog | null>(null)

  useEffect(() => {
    saveMockRequests(requests)
  }, [requests])

  const approvalRequests = useMemo(() => {
    const keyword = appliedSearch.keyword.trim().toLowerCase()

    return requests
      .filter(request => request.status === 'Waiting Approve')
      .filter(request => getCurrentApprovalStep(request)?.person === mockCurrentUser.name)
      .filter(request => {
        const currentStep = getCurrentApprovalStep(request)
        const matchesKeyword = !keyword || [request.requestNo, request.softwareControlNo, request.title, request.category, request.process, request.requester]
          .filter((value): value is string => Boolean(value))
          .some(value => value.toLowerCase().includes(keyword))
        const matchesRole = !appliedSearch.role || currentStep?.role === appliedSearch.role
        const matchesPriority = !appliedSearch.priority || request.priority === appliedSearch.priority
        return matchesKeyword && matchesRole && matchesPriority
      })
      .sort((left, right) => {
        const claimPriority = Number(right.requestType === 'Trouble Report/Customer Claim') - Number(left.requestType === 'Trouble Report/Customer Claim')
        if (claimPriority !== 0) return claimPriority
        return (right.submittedAt ?? '').localeCompare(left.submittedAt ?? '')
      })
  }, [appliedSearch, requests])

  const clearSearch = () => {
    setSearchValues(emptySearchValues)
    setAppliedSearch(emptySearchValues)
  }

  const updateRequest = (request: SoftwareRequest, action: ApprovalAction, comment: string) => {
    const updatedRequest = applyApprovalAction(request, action, comment, mockCurrentUser.name)
    const nextRequests = requests.map(item => item.id === updatedRequest.id ? updatedRequest : item)
    setRequests(nextRequests)
    saveMockRequests(nextRequests)
    setOpenDialog(null)
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
        requests={approvalRequests}
        onView={request => setOpenDialog({ request, mode: 'view' })}
        onReview={request => setOpenDialog({ request, mode: 'review' })}
      />

      {openDialog && (
        <ApproveRequestDialog
          request={openDialog.request}
          mode={openDialog.mode}
          onClose={() => setOpenDialog(null)}
          onDecision={updateRequest}
        />
      )}
    </section>
  )
}
