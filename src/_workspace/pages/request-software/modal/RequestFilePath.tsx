import { FolderOpen } from 'lucide-react'

import { getMockRequestFilePath } from '@/_workspace/data/request-software/mockFilePath'
import type { SoftwareRequest } from '../types'

import { CopyPathButton } from './CopyPathButton'

export function RequestFilePath({ request }: { request: SoftwareRequest }) {
  const filePath = request.filePath ?? getMockRequestFilePath(request.requestNo)

  return (
    <div className='mt-5 border-t border-slate-100 pt-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <p className='text-sm font-semibold text-[var(--app-primary)]'>Request file</p>
          <p className='mt-1 text-xs text-slate-500'>Update the Excel file before submitting this request.</p>
        </div>
        <CopyPathButton path={filePath} />
      </div>
      <div className='mt-3 flex gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600'><FolderOpen className='mt-0.5 size-4 shrink-0 text-slate-400' /><code className='break-all'>{filePath}</code></div>
    </div>
  )
}
