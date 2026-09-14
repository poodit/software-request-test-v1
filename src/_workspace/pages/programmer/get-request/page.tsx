import { useEffect, useMemo, useState } from 'react'

import { mockCurrentUser } from '@/_workspace/data/mock-people'
import { getMockProgrammerFilePath } from '@/_workspace/data/request-software/mockFilePath'
import { loadMockRequests, saveMockRequests } from '@/_workspace/data/request-software/requestStore'
import { isApprovalComplete } from '@/_workspace/pages/approve-request/approval-workflow'

import type { SoftwareRequest } from '../../request-software/types'
import { AcceptRequestDialog, type AcceptWorkValues } from './modal/AcceptRequestDialog'
import { SearchFilters, type GetRequestSearchValues } from './SearchFilters'
import { SearchResult } from './SearchResult'

const emptySearchValues: GetRequestSearchValues = { keyword: '', priority: '' }

export default function GetRequestPage() {
  const [requests, setRequests] = useState<SoftwareRequest[]>(loadMockRequests)
  const [searchValues, setSearchValues] = useState(emptySearchValues)
  const [appliedSearch, setAppliedSearch] = useState(emptySearchValues)
  const [openRequest, setOpenRequest] = useState<{ request: SoftwareRequest; mode: 'view' | 'accept' } | null>(null)

  useEffect(() => {
    saveMockRequests(requests)
  }, [requests])

  const approvedRequests = useMemo(() => {
    const keyword = appliedSearch.keyword.trim().toLowerCase()

    return requests.filter(request => isApprovalComplete(request) && !request.assignee).filter(request => {
      const matchesKeyword = !keyword || [request.requestNo, request.softwareControlNo, request.title, request.category, request.process, request.requester]
        .filter((value): value is string => Boolean(value))
        .some(value => value.toLowerCase().includes(keyword))
      const matchesPriority = !appliedSearch.priority || request.priority === appliedSearch.priority
      return matchesKeyword && matchesPriority
    }).sort((left, right) => {
      const claimPriority = Number(right.requestType === 'Trouble Report/Customer Claim') - Number(left.requestType === 'Trouble Report/Customer Claim')
      return claimPriority || (right.approvedAt ?? '').localeCompare(left.approvedAt ?? '')
    })
  }, [appliedSearch, requests])

  const acceptRequest = (request: SoftwareRequest, values: AcceptWorkValues) => {
    const acceptedAt = new Date().toISOString()
    const nextRequests: SoftwareRequest[] = requests.map(item => item.id === request.id ? {
      ...item,
      status: 'In Progress',
      assignee: mockCurrentUser.name,
      targetDate: values.targetDate,
      targetDateReason: values.targetDateReason,
      workStartMode: values.workStartMode,
      actualStartDate: values.actualStartDate,
      workStartBackdateReason: values.workStartBackdateReason,
      acceptedAt,
      filePath: getMockProgrammerFilePath(request.requestNo, mockCurrentUser.name),
      workHistory: [...(request.workHistory ?? []), { id: `${request.id}-${Date.now()}`, action: 'Accepted', person: mockCurrentUser.name, occurredAt: acceptedAt, detail: `Work Start: ${values.actualStartDate} (${values.workStartMode}); Target Date: ${values.targetDate}${values.workStartBackdateReason ? `; Backdate reason: ${values.workStartBackdateReason}` : ''}` }],
    } : item)
    setRequests(nextRequests)
    saveMockRequests(nextRequests)
    setOpenRequest(null)
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
      <SearchResult requests={approvedRequests} onView={request => setOpenRequest({ request, mode: 'view' })} onAccept={request => setOpenRequest({ request, mode: 'accept' })} />
      {openRequest && <AcceptRequestDialog request={openRequest.request} mode={openRequest.mode} onClose={() => setOpenRequest(null)} onAccept={acceptRequest} />}
    </section>
  )
}
