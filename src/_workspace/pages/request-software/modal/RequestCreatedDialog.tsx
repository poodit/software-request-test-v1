import { CheckCircle2, FileSpreadsheet } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { getMockRequestFilePath } from '@/_workspace/data/request-software/mockFilePath'
import type { SoftwareRequest } from '../types'

import { CopyPathButton } from './CopyPathButton'
import { RequestDialog } from './RequestDialog'

export function RequestCreatedDialog({ request, onClose }: { request: SoftwareRequest; onClose: () => void }) {
  const filePath = request.filePath ?? getMockRequestFilePath(request.requestNo)

  return (
    <RequestDialog title='Request created' onClose={onClose} maxWidthClassName='max-w-xl' footer={<Button type='button' onClick={onClose}>Done</Button>}>
      <div className='space-y-4 p-5'>
        <div className='flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800'><CheckCircle2 className='mt-0.5 size-5 shrink-0' /><div><p className='font-semibold'>{request.requestNo} was created successfully.</p><p className='mt-1 text-sm'>Mock Excel file was created in the Waiting Submit folder.</p></div></div>
        <div className='rounded-xl border border-slate-200 p-4'>
          <div className='flex items-center justify-between gap-3'><div className='flex items-center gap-2 text-sm font-semibold text-slate-800'><FileSpreadsheet className='size-4 text-emerald-600' />Request file path</div><CopyPathButton path={filePath} /></div>
          <code className='mt-3 block break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600'>{filePath}</code>
        </div>
        <p className='text-xs leading-5 text-slate-500'>Next: complete the Excel file and coordinate with the related users, then open this request and click Submit.</p>
      </div>
    </RequestDialog>
  )
}
