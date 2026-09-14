import { type ColDef, type GridApi, type ICellRendererParams } from 'ag-grid-community'
import { CircleAlert, Download, Handshake } from 'lucide-react'
import { useMemo, useRef } from 'react'

import { AppDataGrid } from '@/components/common/data-grid/app-data-grid'
import { RowActionsMenu, type RowActionItem } from '@/components/common/data-grid/row-actions-menu'
import { Button } from '@/components/ui/button'

import type { RequestPriority, SoftwareRequest } from '../../request-software/types'

type SearchResultProps = {
  requests: SoftwareRequest[]
  onView: (request: SoftwareRequest) => void
  onAccept: (request: SoftwareRequest) => void
}

const priorityClassNames: Record<RequestPriority, string> = {
  Low: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  Medium: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  High: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Urgent: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

export function SearchResult({ requests, onView, onAccept }: SearchResultProps) {
  const gridApiRef = useRef<GridApi<SoftwareRequest> | null>(null)
  const columnDefs = useMemo<ColDef<SoftwareRequest>[]>(() => [
    {
      colId: 'actions', headerName: 'Actions', width: 96, minWidth: 96, maxWidth: 96, sortable: false, filter: false, resizable: false,
      cellRenderer: ({ data }: ICellRendererParams<SoftwareRequest>) => {
        if (!data) return null
        const actions: RowActionItem<SoftwareRequest>[] = [{ key: 'accept', label: 'Accept request', icon: Handshake, onSelect: onAccept }]
        return <RowActionsMenu row={data} viewLabel={`View ${data.requestNo}`} onView={onView} items={actions} />
      },
    },
    { field: 'requestNo', headerName: 'Request no.', minWidth: 145, cellClass: 'font-medium text-[var(--app-primary)]' },
    { field: 'softwareControlNo', headerName: 'Software Control No.', minWidth: 170, cellClass: 'font-medium' },
    { field: 'title', headerName: 'Software Name', minWidth: 230, flex: 1 },
    {
      field: 'requestType', headerName: 'Request Type', minWidth: 225,
      cellRenderer: ({ value }: ICellRendererParams<SoftwareRequest, SoftwareRequest['requestType']>) => value ? <div className='flex h-full items-center'><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${value === 'Trouble Report/Customer Claim' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' : 'bg-slate-100 text-slate-700 ring-slate-500/20'}`}>{value === 'Trouble Report/Customer Claim' && <CircleAlert className='size-3.5' />}{value}</span></div> : null,
    },
    { field: 'category', headerName: 'Product', minWidth: 130 },
    { field: 'process', headerName: 'Process', minWidth: 155 },
    { field: 'requester', headerName: 'Requested by', minWidth: 190 },
    {
      field: 'priority', headerName: 'Priority', minWidth: 115,
      cellRenderer: ({ value }: ICellRendererParams<SoftwareRequest, RequestPriority>) => value ? <div className='flex h-full items-center'><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${priorityClassNames[value]}`}>{value}</span></div> : null,
    },
    { field: 'approvedAt', headerName: 'Approved date', minWidth: 170, valueFormatter: params => params.value ? new Date(params.value).toLocaleString('en-GB') : '-' },
  ], [onAccept, onView])
  const defaultColDef = useMemo<ColDef<SoftwareRequest>>(() => ({ sortable: true, filter: true, resizable: true }), [])
  const exportData = () => gridApiRef.current?.exportDataAsCsv({ fileName: `approved-requests-${new Date().toISOString().slice(0, 10)}.csv` })

  return <AppDataGrid title='Approved requests' rowData={requests} columnDefs={columnDefs} defaultColDef={defaultColDef} getRowId={params => String(params.data.id)} getRowClass={params => params.data?.requestType === 'Trouble Report/Customer Claim' ? 'request-type-customer-claim' : undefined} onGridReady={event => { gridApiRef.current = event.api }} actions={<Button type='button' variant='outline' onClick={exportData} disabled={requests.length === 0} className='border-[var(--app-primary)] text-[var(--app-primary)]'><Download />Export</Button>} />
}
