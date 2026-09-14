import { Download, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type SearchResultActionsProps = {
  totalCount: number
  onAdd: () => void
  onExport: () => void
}

export function SearchResultActions({
  totalCount,
  onAdd,
  onExport,
}: SearchResultActionsProps) {
  return (
    <div className='flex flex-wrap items-center justify-end gap-2'>
      <Button type='button' variant='outline' onClick={onExport} disabled={totalCount === 0} className='border-[var(--app-primary)] text-[var(--app-primary)]'>
        <Download />
        Export
      </Button>
      <Button type='button' onClick={onAdd}>
        <Plus />
        Add New
      </Button>
    </div>
  )
}
