import { useState } from 'react'
import { CircleAlert, Undo2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RequestDialog } from '@/_workspace/pages/request-software/modal/RequestDialog'
import type { SoftwareRequest } from '@/_workspace/pages/request-software/types'

type ReturnWorkDialogProps = {
  request: SoftwareRequest
  onClose: () => void
  onReturn: (request: SoftwareRequest, reason: string) => void
}

export function ReturnWorkDialog({ request, onClose, onReturn }: ReturnWorkDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const returnWork = () => {
    if (!reason.trim()) return setError('กรุณาระบุเหตุผลที่ส่งงานกลับ')
    onReturn(request, reason.trim())
  }

  return (
    <RequestDialog title='Return Work' onClose={onClose} maxWidthClassName='max-w-lg' footer={<><Button type='button' variant='outline' onClick={onClose}>Cancel</Button><Button type='button' variant='destructive' onClick={returnWork}><Undo2 />Return to Get Request</Button></>}>
      <div className='space-y-4 p-5'>
        <div className='flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900'><CircleAlert className='mt-0.5 size-5 shrink-0' /><div><p className='font-semibold'>This does not cancel the request.</p><p className='mt-1 text-xs leading-5'>The request will return to Approved and become available in Get Request for another programmer.</p></div></div>
        <dl className='grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm sm:grid-cols-2'><Detail label='Request No.' value={request.requestNo} /><Detail label='Software' value={request.title} /><Detail label='Current Assignee' value={request.assignee} /><Detail label='Target Date' value={request.targetDate} /></dl>
        <label className='block'><span className='mb-1.5 block text-sm font-medium text-slate-700'>Return reason <b className='text-rose-500'>*</b></span><textarea value={reason} onChange={event => { setReason(event.target.value); setError('') }} rows={4} maxLength={500} placeholder='Explain why the work is being returned' className='w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' /><span className='mt-1 block text-right text-[10px] text-slate-400'>{reason.length}/500</span></label>
        {error && <p role='alert' className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'>{error}</p>}
      </div>
    </RequestDialog>
  )
}

function Detail({ label, value }: { label: string; value?: string }) {
  return <div><dt className='text-xs text-slate-500'>{label}</dt><dd className='mt-1 font-medium text-slate-800'>{value || '-'}</dd></div>
}
