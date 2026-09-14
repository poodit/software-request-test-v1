import { type ColDef, type GridApi, type ICellRendererParams } from 'ag-grid-community'
import { CircleAlert, Download, UserRoundCog, Workflow } from 'lucide-react'
import { useMemo, useRef } from 'react'

import { AppDataGrid } from '@/components/common/data-grid/app-data-grid'
import { RowActionsMenu, type RowActionItem } from '@/components/common/data-grid/row-actions-menu'
import { Button } from '@/components/ui/button'

import type { RequestPriority, SoftwareRequest } from './types'
import { getRequestOwner } from './owner-transfer'

type RequestHistoryResultProps = {
  requests: SoftwareRequest[]
  onView: (request: SoftwareRequest) => void
  onViewWorkflow: (request: SoftwareRequest) => void
  onTransfer: (request: SoftwareRequest) => void
  onReplaceParticipant: (request: SoftwareRequest) => void
}

const statusClassNames: Record<SoftwareRequest['status'], string> = {
  'Waiting Submit': 'bg-violet-50 text-violet-700 ring-violet-600/20',
  'Waiting Approve': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Review: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'Cancellation Requested': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Waiting Software Confirm': 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  Completed: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Cancelled: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

const priorityClassNames: Record<RequestPriority, string> = {
  Low: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  Medium: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  High: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Urgent: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

export function RequestHistoryResult({ requests, onView, onViewWorkflow, onTransfer, onReplaceParticipant }: RequestHistoryResultProps) {
  const gridApiRef = useRef<GridApi<SoftwareRequest> | null>(null)
  const columnDefs = useMemo<ColDef<SoftwareRequest>[]>(() => [
    {
      colId: 'actions', headerName: 'Actions', width: 72, minWidth: 72, maxWidth: 72, sortable: false, filter: false, resizable: false,
      cellRenderer: ({ data }: ICellRendererParams<SoftwareRequest>) => {
        if (!data) return null
        const actions: RowActionItem<SoftwareRequest>[] = []
        if (data.approvalSteps?.length || data.approvalHistory?.length || data.approvalRouteHistory?.length || data.cancellationHistory?.length) actions.push({ key: 'workflow', label: 'View workflow history', icon: Workflow, onSelect: onViewWorkflow })
        if (data.status === 'Waiting Approve' && data.approvalMethod === 'manual' && data.approvalSteps?.some(step => step.status === 'Pending')) actions.push({ key: 'replace-participant', label: 'Replace pending participant', icon: UserRoundCog, onSelect: onReplaceParticipant })
        if (!['Completed', 'Rejected', 'Cancelled', 'Cancellation Requested'].includes(data.status)) actions.push({ key: 'transfer', label: 'Transfer owner', icon: UserRoundCog, onSelect: onTransfer })
        return <RowActionsMenu row={data} viewLabel={`View ${data.requestNo}`} onView={onView} items={actions} />
      },
    },
    { field: 'requestNo', headerName: 'Request no.', minWidth: 145, cellClass: 'font-medium text-[var(--app-primary)]' },
    { field: 'softwareControlNo', headerName: 'Software Control No.', minWidth: 175, cellClass: 'font-medium' },
    { field: 'title', headerName: 'Software Name', minWidth: 220, flex: 1 },
    { field: 'requestKind', headerName: 'Request mode', minWidth: 130 },
    {
      field: 'requestType', headerName: 'Request Type', minWidth: 225,
      cellRenderer: ({ value }: ICellRendererParams<SoftwareRequest, SoftwareRequest['requestType']>) => value ? (
        <div className='flex h-full items-center'>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${value === 'Trouble Report/Customer Claim' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' : 'bg-slate-100 text-slate-700 ring-slate-500/20'}`}>
            {value === 'Trouble Report/Customer Claim' && <CircleAlert className='size-3.5' />}
            {value}
          </span>
        </div>
      ) : null,
    },
    { field: 'category', headerName: 'Product', minWidth: 135 },
    { field: 'process', headerName: 'Process', minWidth: 155 },
    { field: 'requester', headerName: 'Requester', minWidth: 190 },
    { colId: 'owner', headerName: 'Current Owner', minWidth: 190, valueGetter: params => params.data ? getRequestOwner(params.data) : '-' },
    {
      field: 'priority', headerName: 'Priority', minWidth: 115,
      cellRenderer: ({ value }: ICellRendererParams<SoftwareRequest, RequestPriority>) => value ? <div className='flex h-full items-center'><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${priorityClassNames[value]}`}>{value}</span></div> : null,
    },
    {
      field: 'status', headerName: 'Status', minWidth: 200,
      cellRenderer: ({ value }: ICellRendererParams<SoftwareRequest, SoftwareRequest['status']>) => value ? <div className='flex h-full items-center'><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusClassNames[value]}`}>{value}</span></div> : null,
    },
    { field: 'requestedAt', headerName: 'Requested date', minWidth: 145 },
  ], [onReplaceParticipant, onTransfer, onView, onViewWorkflow])
  const defaultColDef = useMemo<ColDef<SoftwareRequest>>(() => ({ sortable: true, filter: true, resizable: true }), [])

  const exportData = () => gridApiRef.current?.exportDataAsCsv({
    fileName: `request-history-${new Date().toISOString().slice(0, 10)}.csv`,
    columnKeys: ['requestNo', 'softwareControlNo', 'title', 'requestKind', 'requestType', 'category', 'process', 'requester', 'owner', 'priority', 'status', 'requestedAt'],
  })

  return (
    <AppDataGrid<SoftwareRequest>
      title='Request history'
      rowData={requests}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      getRowId={params => String(params.data.id)}
      getRowClass={params => params.data?.requestType === 'Trouble Report/Customer Claim' ? 'request-type-customer-claim' : undefined}
      onGridReady={event => { gridApiRef.current = event.api }}
      actions={<Button type='button' variant='outline' onClick={exportData} disabled={requests.length === 0} className='border-[var(--app-primary)] text-[var(--app-primary)]'><Download />Export</Button>}
    />
  )
}
