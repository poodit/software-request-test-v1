import { useState } from 'react'
import { CalendarDays, CheckCircle2, CircleAlert, FileSpreadsheet, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CopyPathButton } from '@/_workspace/pages/request-software/modal/CopyPathButton'
import { RequestDialog } from '@/_workspace/pages/request-software/modal/RequestDialog'
import type { SoftwareRequest } from '@/_workspace/pages/request-software/types'

type WorkRequestDialogProps = {
  request: SoftwareRequest
  mode: 'view' | 'manage'
  onClose: () => void
  onSave: (request: SoftwareRequest, targetDate: string, targetDateReason?: string) => void
  onFinish: (request: SoftwareRequest, targetDate: string, workSummary?: string, targetDateReason?: string, lateCompletionReason?: string) => void
}

const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

export function WorkRequestDialog({ request, mode, onClose, onSave, onFinish }: WorkRequestDialogProps) {
  const [targetDate, setTargetDate] = useState(request.targetDate ?? '')
  const [targetDateReason, setTargetDateReason] = useState(request.targetDateReason ?? '')
  const [completionNote, setCompletionNote] = useState(request.completionNote ?? '')
  const [lateCompletionReason, setLateCompletionReason] = useState(request.lateCompletionReason ?? '')
  const [error, setError] = useState('')
  const isManage = mode === 'manage' && request.status === 'In Progress'
  const isPastTargetDate = Boolean(targetDate && targetDate < today)
  const isNewBackdatedTarget = isPastTargetDate && targetDate !== request.targetDate

  const validate = (isFinishing: boolean) => {
    if (!targetDate) {
      setError('กรุณาระบุ Target Date')
      return false
    }
    if (isNewBackdatedTarget && !targetDateReason.trim()) {
      setError('กรุณาระบุเหตุผลเมื่อเลือก Target Date ย้อนหลัง')
      return false
    }
    if (isFinishing && isPastTargetDate && !lateCompletionReason.trim()) {
      setError('งานเสร็จหลัง Target Date กรุณาระบุเหตุผลที่ล่าช้า')
      return false
    }
    setError('')
    return true
  }

  const save = () => {
    if (validate(false)) onSave(request, targetDate, targetDateReason.trim() || undefined)
  }

  const finish = () => {
    if (validate(true)) onFinish(request, targetDate, completionNote.trim() || undefined, targetDateReason.trim() || undefined, lateCompletionReason.trim() || undefined)
  }

  const footer = isManage ? (
    <>
      <Button type='button' variant='outline' onClick={onClose}>Cancel</Button>
      <Button type='button' variant='outline' onClick={save} className='border-[var(--app-primary)] text-[var(--app-primary)]'><Save />Save changes</Button>
      <Button type='button' onClick={finish}><CheckCircle2 />Finish Work</Button>
    </>
  ) : <Button type='button' variant='outline' onClick={onClose}>Close</Button>

  return (
    <RequestDialog title={isManage ? 'Update Work' : 'Work Detail'} onClose={onClose} maxWidthClassName='max-w-3xl' scrollContent footer={footer}>
      <div className='space-y-5 p-5'>
        <div className='flex gap-3 rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary-soft)] p-4 text-sm text-slate-700'>
          {request.status === 'Completed' ? <CheckCircle2 className='mt-0.5 size-5 shrink-0 text-emerald-600' /> : <FileSpreadsheet className='mt-0.5 size-5 shrink-0 text-[var(--app-primary)]' />}
          <div>
            <div className='flex flex-wrap items-center gap-2'><p className='font-semibold text-slate-900'>{request.title}</p><StatusBadge status={request.status} /></div>
            <p className='mt-1 text-xs leading-5'>{isManage ? 'Update the Target Date or record completion after the work is finished.' : 'View the work information and request document.'}</p>
          </div>
        </div>

        <dl className='grid gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3'>
          <Detail label='Request No.' value={request.requestNo} emphasized />
          <Detail label='Control No.' value={request.softwareControlNo} />
          <Detail label='Version' value={request.version} />
          <Detail label='Request Type' value={request.requestType} />
          <Detail label='Requested By' value={request.requester} />
          <Detail label='Assigned To' value={request.assignee} />
          <Detail label='Accepted Date' value={formatDateTime(request.acceptedAt)} />
          <Detail label='Work Start Mode' value={request.workStartMode} />
          <Detail label='Actual Start Date' value={request.actualStartDate} />
          <Detail label='Finished Date' value={formatDateTime(request.finishedAt)} />
          <Detail label='Completed Date' value={formatDateTime(request.completedAt)} />
          <Detail label='Priority' value={request.priority} />
        </dl>

        <section className='rounded-xl border border-slate-200 bg-slate-50/50 p-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex min-w-0 items-center gap-3'>
              <span className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600'><FileSpreadsheet className='size-5' /></span>
              <div className='min-w-0'><p className='text-sm font-semibold text-slate-800'>Request Document</p><p className='mt-0.5 text-xs text-slate-500'>Copy this path to open the request document and program details.</p></div>
            </div>
            {request.filePath && <CopyPathButton path={request.filePath} />}
          </div>
          <code className='mt-3 block break-all rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-600'>{request.filePath ?? 'No request document path.'}</code>
        </section>

        {isManage ? (
          <section className='space-y-4 rounded-xl border border-slate-200 p-4'>
            <label className='block'>
              <span className='mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700'><CalendarDays className='size-4 text-[var(--app-primary)]' />Target Date <b className='text-rose-500'>*</b></span>
              <input type='date' value={targetDate} onChange={event => { setTargetDate(event.target.value); setError('') }} className='h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' />
            </label>
            {isNewBackdatedTarget && (
              <div className='rounded-xl border border-amber-300 bg-amber-50 p-3'>
                <div className='flex gap-2 text-xs text-amber-800'><CircleAlert className='size-4 shrink-0' /><p><b>Backdated Target Date</b><br />A reason is required because the selected Target Date is in the past.</p></div>
                <label className='mt-3 block'><span className='mb-1.5 block text-xs font-medium text-slate-700'>Backdate reason <b className='text-rose-500'>*</b></span><textarea value={targetDateReason} onChange={event => { setTargetDateReason(event.target.value); setError('') }} rows={2} maxLength={500} className='w-full resize-none rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' /></label>
              </div>
            )}
            <label className='block'>
              <span className='mb-1.5 block text-sm font-medium text-slate-700'>Work summary <span className='font-normal text-slate-400'>(optional)</span></span>
              <textarea value={completionNote} onChange={event => { setCompletionNote(event.target.value); setError('') }} rows={3} maxLength={1000} placeholder='Summarize completed work, testing, or handover details (optional)' className='w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' />
              <span className='mt-1 block text-right text-[10px] text-slate-400'>{completionNote.length}/1000</span>
            </label>
            {isPastTargetDate && (
              <div className='rounded-xl border border-amber-300 bg-amber-50 p-3'>
                <div className='flex gap-2 text-xs text-amber-800'><CircleAlert className='size-4 shrink-0' /><p><b>Finish after Target Date</b><br />A reason is required only when you click Finish Work.</p></div>
                <label className='mt-3 block'><span className='mb-1.5 block text-xs font-medium text-slate-700'>Late completion reason <b className='text-rose-500'>*</b></span><textarea value={lateCompletionReason} onChange={event => { setLateCompletionReason(event.target.value); setError('') }} rows={2} maxLength={500} placeholder='Explain why the work was completed after the Target Date' className='w-full resize-none rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' /></label>
              </div>
            )}
            {error && <p role='alert' className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'>{error}</p>}
          </section>
        ) : (
          <div className='space-y-4'>
            {request.status === 'Cancellation Requested' && <div className='rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900'><b>Cancellation requested by {request.cancellationRequestedBy}</b><p className='mt-1 text-xs leading-5'>{request.cancellationReason}</p></div>}
            <dl className='grid gap-4 rounded-xl border border-slate-200 p-4 text-sm sm:grid-cols-2'>
              <Detail label='Target Date' value={request.targetDate} />
              <Detail label='Backdate Reason' value={request.targetDateReason} />
              {request.workStartBackdateReason && <div className='sm:col-span-2'><Detail label='Work Start Backdate Reason' value={request.workStartBackdateReason} /></div>}
              <div className='sm:col-span-2'><Detail label='Work Summary' value={request.completionNote} /></div>
              {request.lateCompletionReason && <div className='sm:col-span-2'><Detail label='Late Completion Reason' value={request.lateCompletionReason} /></div>}
            </dl>
            {request.status === 'Completed' && <dl className='grid gap-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-sm sm:grid-cols-2'><Detail label='Confirmed Software Control' value={request.confirmedSoftwareControlNo} /><Detail label='Approved By' value={request.softwareControlApprovedBy} /><Detail label='Confirmed By' value={request.softwareControlConfirmedBy} /><Detail label='Confirmed Date' value={formatDateTime(request.softwareControlConfirmedAt)} /></dl>}
            {request.cancellationHistory?.length ? <section className='rounded-xl border border-slate-200 p-4'><h3 className='text-sm font-semibold text-slate-800'>Cancellation history</h3><div className='mt-3 divide-y divide-slate-100'>{[...request.cancellationHistory].reverse().map(item => <div key={item.id} className='py-2 text-xs'><div className='flex flex-wrap items-center gap-2'><b className='text-slate-700'>{item.action}</b><span className='text-slate-500'>{item.person}</span><time className='text-slate-400'>{formatDateTime(item.occurredAt)}</time></div><p className='mt-1 text-slate-600'>{item.reason}</p></div>)}</div></section> : null}
          </div>
        )}
        {request.workHistory?.length ? <section className='rounded-xl border border-slate-200 p-4'><h3 className='text-sm font-semibold text-slate-800'>Work history</h3><ol className='mt-3 space-y-3'>{[...request.workHistory].reverse().map(item => <li key={item.id} className='flex gap-3 text-xs'><span className='mt-1 size-2 shrink-0 rounded-full bg-[var(--app-primary)]' /><div><div className='flex flex-wrap items-center gap-x-2'><b className='text-slate-800'>{item.action}</b><span className='text-slate-500'>{item.person}</span><span className='text-slate-400'>{formatDateTime(item.occurredAt)}</span></div>{item.detail && <p className='mt-1 text-slate-600'>{item.detail}</p>}</div></li>)}</ol></section> : null}
      </div>
    </RequestDialog>
  )
}

function StatusBadge({ status }: { status: SoftwareRequest['status'] }) {
  const className = status === 'Completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : status === 'Waiting Software Confirm' ? 'bg-cyan-50 text-cyan-700 ring-cyan-600/20' : status === 'Cancellation Requested' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20'
  return <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ${className}`}>{status}</span>
}

function Detail({ label, value, emphasized = false }: { label: string; value?: string; emphasized?: boolean }) {
  return <div><dt className='text-xs text-slate-500'>{label}</dt><dd className={`mt-0.5 break-words text-sm ${emphasized ? 'font-semibold text-[var(--app-primary)]' : 'font-medium text-slate-800'}`}>{value || '-'}</dd></div>
}

function formatDateTime(value?: string) {
  return value ? new Date(value).toLocaleString('en-GB') : '-'
}
