import { CheckCircle2, FileSpreadsheet, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { getMockSubmittedFilePath } from '@/_workspace/data/request-software/mockFilePath'
import type { SoftwareRequest } from '../types'

import { CopyPathButton } from './CopyPathButton'
import { RequestDialog } from './RequestDialog'

export function RequestSubmittedDialog({ request, onClose }: { request: SoftwareRequest; onClose: () => void }) {
  const filePath = request.filePath ?? getMockSubmittedFilePath(request.requestNo)

  return <RequestDialog title='Request submitted' onClose={onClose} maxWidthClassName='max-w-xl' footer={<Button type='button' onClick={onClose}>Done</Button>}>
    <div className='space-y-4 p-5'>
      <div className='flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800'><CheckCircle2 className='mt-0.5 size-5 shrink-0' /><div><p className='font-semibold'>{request.requestNo} was submitted successfully.</p><p className='mt-1 text-sm'>Status is now Waiting Approve.</p></div></div>
      <div className='grid gap-3 rounded-xl border border-slate-200 p-4 text-sm'><p><b>Checker:</b> {request.checkers?.join(', ') || 'Not selected'}</p><p><b>Approver:</b> {request.approvers?.join(', ')}</p><p><b>CC:</b> {request.cc?.join(', ') || 'Not selected'}</p><p><b>Programmer Notification:</b> {request.programmerRecipients?.join(', ') || 'Not selected'}</p><p className='flex items-center gap-2 text-slate-600'><Mail className='size-4 text-[var(--app-primary)]' />Mock notification email recorded for {request.submissionNotifiedPeople?.length ?? 0} related users.</p></div>
      <div className='rounded-xl border border-slate-200 p-4'><div className='flex items-center justify-between gap-3'><div className='flex items-center gap-2 text-sm font-semibold text-slate-800'><FileSpreadsheet className='size-4 text-emerald-600' />Submit file path</div><CopyPathButton path={filePath} /></div><code className='mt-3 block break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600'>{filePath}</code></div>
    </div>
  </RequestDialog>
}
