import { useState } from 'react'
import { CircleAlert, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { SoftwareRequest } from '../types'
import { RequestDialog } from './RequestDialog'

export function CancelRequestDialog({ request, onClose, onConfirm }: { request: SoftwareRequest; onClose: () => void; onConfirm: (request: SoftwareRequest, reason: string) => void }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const requiresProgrammerDecision = request.status === 'In Progress'
  const confirm = () => {
    if (!reason.trim()) return setError('กรุณาระบุเหตุผลที่ยกเลิกคำขอ')
    onConfirm(request, reason.trim())
  }

  return <RequestDialog title={requiresProgrammerDecision ? 'Request Work Cancellation' : 'Cancel Request'} onClose={onClose} maxWidthClassName='max-w-xl' footer={<><Button type='button' variant='outline' onClick={onClose}>Keep request</Button><Button type='button' variant='destructive' onClick={confirm}><XCircle />{requiresProgrammerDecision ? 'Send cancellation request' : 'Cancel request'}</Button></>}>
    <div className='space-y-4 p-5'>
      <div className={`flex gap-3 rounded-xl border p-4 text-sm ${requiresProgrammerDecision ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-rose-200 bg-rose-50 text-rose-800'}`}><CircleAlert className='mt-0.5 size-5 shrink-0' /><div><p className='font-semibold'>{request.requestNo} · {request.title}</p><p className='mt-1 text-xs leading-5'>{requiresProgrammerDecision ? `This work is assigned to ${request.assignee}. The status changes to Cancellation Requested until the Programmer decides.` : 'The request will move to Cancelled and remain available in Request History for audit.'}</p></div></div>
      <label className='block'><span className='mb-1.5 block text-sm font-medium text-slate-700'>Cancellation reason <b className='text-rose-500'>*</b></span><textarea value={reason} onChange={event => { setReason(event.target.value); setError('') }} rows={4} maxLength={1000} placeholder='Explain why this request should be cancelled' className='w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' /><span className='mt-1 block text-right text-[10px] text-slate-400'>{reason.length}/1000</span></label>
      {error && <p role='alert' className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'>{error}</p>}
    </div>
  </RequestDialog>
}
