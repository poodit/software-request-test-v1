import {
  colorSchemeDark,
  colorSchemeLight,
  themeQuartz,
  type ColDef,
  type GetRowIdFunc,
  type GridReadyEvent,
  type RowClassParams,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { useAppearance } from '@/hooks/use-appearance'
import { cn } from '@/lib/utils'

type AppDataGridProps<TData> = {
  title: string
  rowData: TData[]
  columnDefs: ColDef<TData>[]
  getRowId: GetRowIdFunc<TData>
  actions?: ReactNode
  defaultColDef?: ColDef<TData>
  pageSizeOptions?: number[]
  initialPageSize?: number
  getRowClass?: (params: RowClassParams<TData>) => string | string[] | undefined
  onGridReady?: (event: GridReadyEvent<TData>) => void
}

export function AppDataGrid<TData>({
  title,
  rowData,
  columnDefs,
  getRowId,
  actions,
  defaultColDef,
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
  getRowClass,
  onGridReady,
}: AppDataGridProps<TData>) {
  const { isDark, primary } = useAppearance()
  const [pageSize, setPageSize] = useState(initialPageSize)

  const gridTheme = useMemo(
    () => themeQuartz
      .withPart(isDark ? colorSchemeDark : colorSchemeLight)
      .withParams({
        accentColor: primary.value,
        backgroundColor: isDark ? '#172033' : '#ffffff',
        foregroundColor: isDark ? '#e2e8f0' : '#334155',
        borderColor: isDark ? '#344054' : '#e2e8f0',
        headerBackgroundColor: isDark ? '#101828' : '#f8fafc',
        headerTextColor: isDark ? '#cbd5e1' : '#64748b',
        oddRowBackgroundColor: isDark ? 'rgba(255,255,255,0.018)' : 'rgba(15,23,42,0.018)',
        rowHoverColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(79,70,229,0.045)',
        borderRadius: 0,
        wrapperBorderRadius: 0,
        headerHeight: 44,
        rowHeight: 48,
        headerFontSize: 12,
        headerFontWeight: 600,
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        fontSize: 13,
      }),
    [isDark, primary.value]
  )

  return (
    <section className={cn(
      'overflow-hidden rounded-xl border shadow-sm',
      isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
    )}>
      <div className={cn(
        'flex flex-col gap-3 border-b px-5 py-4 lg:flex-row lg:items-center lg:justify-between',
        isDark ? 'border-slate-700' : 'border-slate-200'
      )}>
        <h2 className={cn('text-base font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>{title}</h2>
        {actions}
      </div>

      <div className={cn(
        'flex min-h-14 items-center border-b px-5 py-2',
        isDark ? 'border-slate-700 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-slate-50/70 text-slate-600'
      )}>
        <label className='flex items-center gap-2 text-sm'>
          <span>Show</span>
          <select
            aria-label='Rows per page'
            value={pageSize}
            onChange={event => setPageSize(Number(event.target.value))}
            className={cn(
              'h-9 rounded-lg border px-3 pr-8 text-sm font-medium outline-none transition focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--app-primary)_20%,transparent)]',
              isDark ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-700'
            )}
          >
            {pageSizeOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <span>Entries</span>
        </label>
      </div>

      <AgGridReact<TData>
        theme={gridTheme}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        getRowClass={getRowClass}
        onGridReady={onGridReady}
        domLayout='autoHeight'
        pagination
        paginationPageSize={pageSize}
        paginationPageSizeSelector={false}
        animateRows
      />
    </section>
  )
}
