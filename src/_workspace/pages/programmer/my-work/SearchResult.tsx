import { type ColDef, type GridApi, type ICellRendererParams } from 'ag-grid-community'
import { CircleAlert, Download, PencilLine, ShieldCheck, Undo2, XCircle } from 'lucide-react'
import { useMemo, useRef } from 'react'

import { AppDataGrid } from '@/components/common/data-grid/app-data-grid'
import { RowActionsMenu, type RowActionItem } from '@/components/common/data-grid/row-actions-menu'
import { Button } from '@/components/ui/button'

import type { RequestPriority, SoftwareRequest } from '../../request-software/types'

type SearchResultProps = {
  requests: SoftwareRequest[]
  onView: (request: SoftwareRequest) => void
  onManage: (request: SoftwareRequest) => void
  onReturn: (request: SoftwareRequest) => void
  onConfirmSoftware: (request: SoftwareRequest) => void
  onReviewCancellation: (request: SoftwareRequest) => void
}

const priorityClassNames: Record<RequestPriority, string> = {
  Low: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  Medium: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  High: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Urgent: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const statusClassNames = {
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'Cancellation Requested': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Waiting Software Confirm': 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
} as const

export function SearchResult({ requests, onView, onManage, onReturn, onConfirmSoftware, onReviewCancellation }: SearchResultProps) {
  const gridApiRef = useRef<GridApi<SoftwareRequest> | null>(null)
  const columnDefs = useMemo<ColDef<SoftwareRequest>[]>(() => [
    {
      colId: 'actions', headerName: 'Actions', width: 96, minWidth: 96, maxWidth: 96, sortable: false, filter: false, resizable: false,
      cellRenderer: ({ data }: ICellRendererParams<SoftwareRequest>) => {
        if (!data) return null
        const actions: RowActionItem<SoftwareRequest>[] = []
        if (data.status === 'In Progress') actions.push(
          { key: 'manage', label: 'Update work', icon: PencilLine, onSelect: onManage },
          { key: 'return', label: 'Return work', icon: Undo2, onSelect: onReturn, tone: 'danger' },
        )
        if (data.status === 'Waiting Software Confirm') actions.push({ key: 'confirm-software', label: 'Software Control Confirm', icon: ShieldCheck, onSelect: onConfirmSoftware })
        if (data.status === 'Cancellation Requested') actions.push({ key: 'review-cancellation', label: 'Review cancellation', icon: XCircle, onSelect: onReviewCancellation })
        return <RowActionsMenu row={data} viewLabel={`View ${data.requestNo}`} onView={onView} items={actions} />
      },
    },
    { field: 'requestNo', headerName: 'Request no.', minWidth: 145, cellClass: 'font-medium text-[var(--app-primary)]' },
    { field: 'softwareControlNo', headerName: 'Software Control No.', minWidth: 175, cellClass: 'font-medium' },
    { field: 'title', headerName: 'Software Name', minWidth: 230, flex: 1 },
    { field: 'requestType', headerName: 'Request Type', minWidth: 220 },
    { field: 'requester', headerName: 'Requester', minWidth: 190 },
    {
      field: 'priority', headerName: 'Priority', minWidth: 115,
      cellRenderer: ({ value }: ICellRendererParams<SoftwareRequest, RequestPriority>) => value ? <div className='flex h-full items-center'><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${priorityClassNames[value]}`}>{value}</span></div> : null,
    },
    {
      field: 'targetDate', headerName: 'Target Date', minWidth: 165,
      cellRenderer: ({ data, value }: ICellRendererParams<SoftwareRequest, string>) => {
        const acceptedDate = data?.acceptedAt?.slice(0, 10)
        const isBackdated = Boolean(value && acceptedDate && value < acceptedDate)
        return <div className='flex h-full items-center gap-2'><span className='font-medium'>{value || '-'}</span>{isBackdated && <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20'><CircleAlert className='size-3' />Backdated</span>}</div>
      },
    },
    { field: 'acceptedAt', headerName: 'Accepted date', minWidth: 175, valueFormatter: params => params.value ? new Date(params.value).toLocaleString('en-GB') : '-' },
    {
      field: 'status', headerName: 'Status', minWidth: 205,
      cellRenderer: ({ value }: ICellRendererParams<SoftwareRequest, SoftwareRequest['status']>) => value && value in statusClassNames ? <div className='flex h-full items-center'><span className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusClassNames[value as keyof typeof statusClassNames]}`}>{value}</span></div> : null,
    },
    { field: 'completedAt', headerName: 'Completed date', minWidth: 175, valueFormatter: params => params.value ? new Date(params.value).toLocaleString('en-GB') : '-' },
  ], [onConfirmSoftware, onManage, onReturn, onReviewCancellation, onView])
  const defaultColDef = useMemo<ColDef<SoftwareRequest>>(() => ({ sortable: true, filter: true, resizable: true }), [])

  const exportData = () => gridApiRef.current?.exportDataAsCsv({
    fileName: `my-work-${new Date().toISOString().slice(0, 10)}.csv`,
    columnKeys: ['requestNo', 'softwareControlNo', 'title', 'requestType', 'requester', 'priority', 'targetDate', 'acceptedAt', 'status', 'completedAt'],
  })

  return <AppDataGrid title='My work' rowData={requests} columnDefs={columnDefs} defaultColDef={defaultColDef} getRowId={params => String(params.data.id)} onGridReady={event => { gridApiRef.current = event.api }} actions={<Button type='button' variant='outline' onClick={exportData} disabled={requests.length === 0} className='border-[var(--app-primary)] text-[var(--app-primary)]'><Download />Export</Button>} />
}
