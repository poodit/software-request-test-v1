import { useMemo, useState } from 'react'
import { Pencil, Plus, Search } from 'lucide-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'

import { loadSoftwareCatalog, saveSoftwareCatalog, type SoftwareCatalogItem } from '@/_workspace/data/request-software/mockSoftwareCatalog'
import { RowActionsMenu, type RowActionItem } from '@/components/common/data-grid/row-actions-menu'
import { AppDataGrid } from '@/components/common/data-grid/app-data-grid'
import { Button } from '@/components/ui/button'

import { SoftwareMasterDialog } from './SoftwareMasterDialog'

export default function SoftwareMasterPage() {
  const [items, setItems] = useState<SoftwareCatalogItem[]>(loadSoftwareCatalog)
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [openItem, setOpenItem] = useState<SoftwareCatalogItem | 'new' | null>(null)
  const filteredItems = useMemo(() => {
    const search = appliedKeyword.trim().toLowerCase()
    return !search ? items : items.filter(item => [item.softwareControlNo, item.softwareName, item.product, item.process, item.currentVersion, item.status].some(value => value.toLowerCase().includes(search)))
  }, [appliedKeyword, items])
  const columns = useMemo<ColDef<SoftwareCatalogItem>[]>(() => [
    { colId: 'actions', headerName: 'Actions', width: 80, minWidth: 80, maxWidth: 80, sortable: false, filter: false, resizable: false, cellRenderer: ({ data }: ICellRendererParams<SoftwareCatalogItem>) => { if (!data) return null; const actions: RowActionItem<SoftwareCatalogItem>[] = [{ key: 'edit', label: 'Edit software master', icon: Pencil, onSelect: setOpenItem }]; return <RowActionsMenu row={data} viewLabel={`Edit ${data.softwareControlNo}`} onView={setOpenItem} items={actions} /> } },
    { field: 'softwareControlNo', headerName: 'Software Control No.', minWidth: 190, cellClass: 'font-semibold text-[var(--app-primary)]' },
    { field: 'softwareName', headerName: 'Software Name', minWidth: 240, flex: 1, cellClass: 'font-medium' },
    { field: 'product', headerName: 'Product', minWidth: 150 },
    { field: 'process', headerName: 'Process', minWidth: 170 },
    { field: 'currentVersion', headerName: 'Current Version', minWidth: 150, cellClass: 'font-medium' },
    { field: 'status', headerName: 'Status', minWidth: 130, cellRenderer: ({ value }: ICellRendererParams<SoftwareCatalogItem, SoftwareCatalogItem['status']>) => <div className='flex h-full items-center'><span className={`rounded-full px-2 py-1 text-xs font-medium ${value === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{value}</span></div> },
  ], [])

  const save = (nextItem: SoftwareCatalogItem, originalControlNo?: string) => {
    const nextItems = originalControlNo ? items.map(item => item.softwareControlNo === originalControlNo ? nextItem : item) : [nextItem, ...items]
    setItems(nextItems)
    saveSoftwareCatalog(nextItems)
    setOpenItem(null)
  }

  return (
    <section className='page-container space-y-5'>
      <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
        <h2 className='text-base font-semibold text-slate-900'>Search filters</h2>
        <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
          <input value={keyword} onChange={event => setKeyword(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') setAppliedKeyword(keyword) }} placeholder='Control no., software name, Product or Version' className='h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' />
          <Button type='button' onClick={() => setAppliedKeyword(keyword)}><Search />Search</Button>
          <Button type='button' variant='outline' onClick={() => { setKeyword(''); setAppliedKeyword('') }}>Clear</Button>
        </div>
      </section>
      <AppDataGrid<SoftwareCatalogItem> title='Software master records' rowData={filteredItems} columnDefs={columns} defaultColDef={{ sortable: true, filter: true, resizable: true }} getRowId={params => params.data.softwareControlNo} actions={<Button type='button' onClick={() => setOpenItem('new')}><Plus />Add Software</Button>} />
      {openItem && <SoftwareMasterDialog item={openItem === 'new' ? undefined : openItem} items={items} onClose={() => setOpenItem(null)} onSave={save} />}
    </section>
  )
}

