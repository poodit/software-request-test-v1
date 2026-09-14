import { useState } from 'react'
import { Ban, CheckCircle2, CircleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RequestDialog } from '@/_workspace/pages/request-software/modal/RequestDialog'
import type { SoftwareRequest } from '@/_workspace/pages/request-software/types'

export function CancellationDecisionDialog({ request, onClose, onDecision }: { request: SoftwareRequest; onClose: () => void; onDecision: (request: SoftwareRequest, decision: 'accept' | 'decline', comment: string) => void }) {
  const [decision, setDecision] = useState<'accept' | 'decline'>('accept')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const submit = () => {
    if (decision === 'decline' && !comment.trim()) return setError('กรุณาระบุเหตุผลเมื่อต้องการปฏิเสธการยกเลิก')
    onDecision(request, decision, comment.trim())
  }

  return <RequestDialog title='Review Work Cancellation' onClose={onClose} maxWidthClassName='max-w-2xl' footer={<><Button type='button' variant='outline' onClick={onClose}>Close</Button><Button type='button' onClick={submit}>{decision === 'accept' ? <Ban /> : <CheckCircle2 />}{decision === 'accept' ? 'Accept cancellation' : 'Continue work'}</Button></>}>
    <div className='space-y-4 p-5'>
      <div className='flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900'><CircleAlert className='mt-0.5 size-5 shrink-0' /><div><p className='font-semibold'>{request.requestNo} · {request.title}</p><p className='mt-1 text-xs'>Requested by {request.cancellationRequestedBy}</p><p className='mt-2 rounded-lg bg-white/70 px-3 py-2 text-sm'>{request.cancellationReason}</p></div></div>
      <div className='grid gap-3 sm:grid-cols-2'><DecisionOption active={decision === 'accept'} title='Accept cancellation' detail='Stop work and move the request to Cancelled.' onClick={() => { setDecision('accept'); setError('') }} danger /><DecisionOption active={decision === 'decline'} title='Continue work' detail='Decline cancellation and restore In Progress.' onClick={() => { setDecision('decline'); setError('') }} /></div>
      <label className='block'><span className='mb-1.5 block text-sm font-medium text-slate-700'>Comment {decision === 'decline' && <b className='text-rose-500'>*</b>}</span><textarea value={comment} onChange={event => { setComment(event.target.value); setError('') }} rows={3} maxLength={500} placeholder={decision === 'decline' ? 'Explain why work should continue' : 'Optional handover or stopping note'} className='w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' /></label>
      {error && <p role='alert' className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'>{error}</p>}
    </div>
  </RequestDialog>
}

function DecisionOption({ active, title, detail, onClick, danger = false }: { active: boolean; title: string; detail: string; onClick: () => void; danger?: boolean }) {
  return <button type='button' onClick={onClick} className={`rounded-xl border p-3 text-left transition ${active ? danger ? 'border-rose-400 bg-rose-50 ring-1 ring-rose-300' : 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] ring-1 ring-[var(--app-primary)]' : 'border-slate-200'}`}><b className={`text-sm ${danger ? 'text-rose-700' : 'text-slate-800'}`}>{title}</b><span className='mt-1 block text-xs text-slate-500'>{detail}</span></button>
}
