import { type ColDef, type GridApi, type ICellRendererParams } from 'ag-grid-community'
import { CircleAlert, Pencil, Send, Trash2, UserRoundCog, XCircle } from 'lucide-react'
import { useMemo, useRef } from 'react'

import { AppDataGrid } from '@/components/common/data-grid/app-data-grid'
import { RowActionsMenu, type RowActionItem } from '@/components/common/data-grid/row-actions-menu'

import { SearchResultActions } from './SearchResultActions'
import { getRequestOwner } from './owner-transfer'
import type { RequestPriority, SoftwareRequest } from './types'

type SearchResultProps = {
  requests: SoftwareRequest[]
  onView: (request: SoftwareRequest) => void
  onEdit: (request: SoftwareRequest) => void
  onDelete: (request: SoftwareRequest) => void
  onSubmit: (request: SoftwareRequest) => void
  onTransfer: (request: SoftwareRequest) => void
  onCancel: (request: SoftwareRequest) => void
  onAdd: () => void
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

export function SearchResult({ requests, onView, onEdit, onDelete, onSubmit, onTransfer, onCancel, onAdd }: SearchResultProps) {
  const gridApiRef = useRef<GridApi<SoftwareRequest> | null>(null)

  const columnDefs = useMemo<ColDef<SoftwareRequest>[]>(
    () => [
      {
        colId: 'actions',
        headerName: 'Actions',
        width: 96,
        minWidth: 96,
        maxWidth: 96,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: ({ data }: ICellRendererParams<SoftwareRequest>) => {
          if (!data) return null

          const canEditRequest = data.status === 'Waiting Submit' || data.status === 'Review'
          const actions: RowActionItem<SoftwareRequest>[] = []
          if (canEditRequest) actions.push(
            { key: 'edit', label: 'Edit request', icon: Pencil, onSelect: onEdit },
            { key: 'submit', label: data.status === 'Review' ? 'Resubmit request' : 'Submit request', icon: Send, onSelect: onSubmit },
          )
          if (data.status === 'Waiting Submit') actions.push({ key: 'delete', label: 'Delete draft', icon: Trash2, onSelect: onDelete, tone: 'danger' })
          if (data.status === 'Review' || data.status === 'Waiting Approve' || (data.status === 'Approved' && !data.assignee) || data.status === 'In Progress') actions.push({ key: 'cancel', label: data.status === 'In Progress' ? 'Request cancellation' : 'Cancel request', icon: XCircle, onSelect: onCancel, tone: 'danger' })
          if (!['Completed', 'Rejected', 'Cancelled', 'Cancellation Requested'].includes(data.status)) actions.push({ key: 'transfer', label: 'Transfer owner', icon: UserRoundCog, onSelect: onTransfer })

          return <RowActionsMenu row={data} viewLabel={`View ${data.requestNo}`} onView={onView} items={actions} />
        },
      },
      { field: 'requestNo', headerName: 'Request no.', minWidth: 145, cellClass: 'font-medium text-[var(--app-primary)]' },
      { field: 'softwareControlNo', headerName: 'Software Control No.', minWidth: 170, cellClass: 'font-medium' },
      { field: 'title', headerName: 'Software Name', minWidth: 220, flex: 1 },
      { field: 'requestKind', headerName: 'Request mode', minWidth: 130 },
      {
        field: 'requestType',
        headerName: 'Request Type',
        minWidth: 225,
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
      { field: 'process', headerName: 'Process', minWidth: 160 },
      { field: 'version', headerName: 'Version', minWidth: 110 },
      { field: 'requester', headerName: 'Requester', minWidth: 190 },
      { colId: 'owner', headerName: 'Current Owner', minWidth: 190, valueGetter: params => params.data ? getRequestOwner(params.data) : '-' },
      {
        field: 'priority',
        headerName: 'Priority',
        minWidth: 115,
        cellRenderer: ({ value }: ICellRendererParams<SoftwareRequest, RequestPriority>) => value ? (
          <div className='flex h-full items-center'>
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${priorityClassNames[value]}`}>{value}</span>
          </div>
        ) : null,
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 200,
        cellRenderer: ({ value }: ICellRendererParams<SoftwareRequest, SoftwareRequest['status']>) => value ? (
          <div className='flex h-full items-center'>
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusClassNames[value]}`}>{value}</span>
          </div>
        ) : null,
      },
      { field: 'requestedAt', headerName: 'Requested date', minWidth: 145 },
    ],
    [onCancel, onDelete, onEdit, onSubmit, onTransfer, onView]
  )

  const defaultColDef = useMemo<ColDef<SoftwareRequest>>(
    () => ({ sortable: true, filter: true, resizable: true }),
    []
  )

  const exportData = () => {
    gridApiRef.current?.exportDataAsCsv({
      fileName: `software-requests-${new Date().toISOString().slice(0, 10)}.csv`,
      columnKeys: ['requestNo', 'softwareControlNo', 'title', 'requestKind', 'category', 'process', 'version', 'requestType', 'requester', 'owner', 'priority', 'status', 'requestedAt'],
    })
  }

  return (
    <AppDataGrid<SoftwareRequest>
      title='Search result'
      rowData={requests}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      getRowId={params => String(params.data.id)}
      getRowClass={params => params.data?.requestType === 'Trouble Report/Customer Claim' ? 'request-type-customer-claim' : undefined}
      onGridReady={event => { gridApiRef.current = event.api }}
      actions={
        <SearchResultActions totalCount={requests.length} onAdd={onAdd} onExport={exportData} />
      }
    />
  )
}
