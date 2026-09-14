import { type ColDef, type ICellRendererParams } from 'ag-grid-community'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'

import { AppDataGrid } from '@/components/common/data-grid/app-data-grid'
import { RowActionsMenu, type RowActionItem } from '@/components/common/data-grid/row-actions-menu'
import { Button } from '@/components/ui/button'
import type { FlowSetting } from '@/_workspace/data/flow-settings'

type SearchResultProps = {
  settings: FlowSetting[]
  onView: (setting: FlowSetting) => void
  onEdit: (setting: FlowSetting) => void
  onDelete: (setting: FlowSetting) => void
  onAdd: () => void
}

export function SearchResult({ settings, onView, onEdit, onDelete, onAdd }: SearchResultProps) {
  const columnDefs = useMemo<ColDef<FlowSetting>[]>(() => [
    {
      colId: 'actions', headerName: 'Actions', width: 96, minWidth: 96, maxWidth: 96, sortable: false, filter: false, resizable: false,
      cellRenderer: ({ data }: ICellRendererParams<FlowSetting>) => {
        if (!data) return null
        const items: RowActionItem<FlowSetting>[] = [
          { key: 'edit', label: 'Edit flow setting', icon: Pencil, onSelect: onEdit },
          { key: 'delete', label: 'Delete flow setting', icon: Trash2, onSelect: onDelete, tone: 'danger' },
        ]
        return <RowActionsMenu row={data} viewLabel={`View ${data.product}`} onView={onView} items={items} />
      },
    },
    { field: 'product', headerName: 'Product', minWidth: 180, cellClass: 'font-medium' },
    { field: 'checkers', headerName: 'Checker', minWidth: 220, valueFormatter: params => params.value?.join(', ') || 'Not selected' },
    { field: 'approvers', headerName: 'Approver', minWidth: 220, valueFormatter: params => params.value?.join(', ') || 'Not selected', cellClass: 'font-medium' },
    { field: 'cc', headerName: 'CC', minWidth: 220, valueFormatter: params => params.value?.join(', ') || 'Not selected' },
    { field: 'active', headerName: 'Status', minWidth: 125, cellRenderer: ({ value }: ICellRendererParams<FlowSetting, boolean>) => <div className='flex h-full items-center'><span className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${value ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-slate-100 text-slate-600 ring-slate-500/20'}`}>{value ? 'Active' : 'Inactive'}</span></div> },
  ], [onDelete, onEdit, onView])

  return <AppDataGrid<FlowSetting> title='Flow settings' rowData={settings} columnDefs={columnDefs} defaultColDef={{ sortable: true, filter: true, resizable: true }} getRowId={params => String(params.data.id)} actions={<Button type='button' onClick={onAdd}><Plus />Add Flow Setting</Button>} />
}
