import { type ColDef, type GridApi, type ICellRendererParams } from 'ag-grid-community'
import { CircleAlert, ClipboardCheck, Download } from 'lucide-react'
import { useMemo, useRef } from 'react'

import { AppDataGrid } from '@/components/common/data-grid/app-data-grid'
import { RowActionsMenu, type RowActionItem } from '@/components/common/data-grid/row-actions-menu'
import { Button } from '@/components/ui/button'

import type { RequestPriority, SoftwareRequest } from '../request-software/types'
import { getCurrentApprovalStep } from './approval-workflow'

type SearchResultProps = {
  requests: SoftwareRequest[]
  onView: (request: SoftwareRequest) => void
  onReview: (request: SoftwareRequest) => void
}

const statusClassNames = {
  'Waiting Approve': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
} as const

const priorityClassNames: Record<RequestPriority, string> = {
  Low: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  Medium: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  High: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Urgent: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

export function SearchResult({ requests, onView, onReview }: SearchResultProps) {
  const gridApiRef = useRef<GridApi<SoftwareRequest> | null>(null)

  const columnDefs = useMemo<ColDef<SoftwareRequest>[]>(() => [
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
        const actions: RowActionItem<SoftwareRequest>[] = data.status === 'Waiting Approve'
          ? [{ key: 'review', label: 'Review request', icon: ClipboardCheck, onSelect: onReview }]
          : []
        return <RowActionsMenu row={data} viewLabel={`View ${data.requestNo}`} onView={onView} items={actions} />
      },
    },
    { field: 'requestNo', headerName: 'Request no.', minWidth: 145, cellClass: 'font-medium text-[var(--app-primary)]' },
    { field: 'softwareControlNo', headerName: 'Software Control No.', minWidth: 170, cellClass: 'font-medium' },
    { field: 'title', headerName: 'Software Name', minWidth: 210, flex: 1 },
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
    { field: 'category', headerName: 'Product', minWidth: 125 },
    { field: 'requester', headerName: 'Requester', minWidth: 190 },
    {
      colId: 'currentRole',
      headerName: 'Current step',
      minWidth: 130,
      valueGetter: params => params.data ? getCurrentApprovalStep(params.data)?.role ?? '-' : '-',
    },
    {
      colId: 'currentPerson',
      headerName: 'Waiting for',
      minWidth: 190,
      valueGetter: params => params.data ? getCurrentApprovalStep(params.data)?.person ?? '-' : '-',
      cellClass: 'font-medium',
    },
    {
      field: 'priority',
      headerName: 'Priority',
      minWidth: 115,
      cellRenderer: ({ value }: ICellRendererParams<SoftwareRequest, RequestPriority>) => value ? (
        <div className='flex h-full items-center'><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${priorityClassNames[value]}`}>{value}</span></div>
      ) : null,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 145,
      cellRenderer: ({ value }: ICellRendererParams<SoftwareRequest, SoftwareRequest['status']>) => value && value in statusClassNames ? (
        <div className='flex h-full items-center'><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusClassNames[value as keyof typeof statusClassNames]}`}>{value}</span></div>
      ) : null,
    },
    {
      field: 'submittedAt',
      headerName: 'Submitted date',
      minWidth: 170,
      valueFormatter: params => params.value ? new Date(params.value).toLocaleString('en-GB') : '-',
    },
  ], [onReview, onView])

  const defaultColDef = useMemo<ColDef<SoftwareRequest>>(() => ({ sortable: true, filter: true, resizable: true }), [])

  const exportData = () => gridApiRef.current?.exportDataAsCsv({
    fileName: `approval-requests-${new Date().toISOString().slice(0, 10)}.csv`,
    columnKeys: ['requestNo', 'softwareControlNo', 'title', 'requestType', 'category', 'requester', 'currentRole', 'currentPerson', 'priority', 'status', 'submittedAt'],
  })

  return (
    <AppDataGrid<SoftwareRequest>
      title='My approval requests'
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
