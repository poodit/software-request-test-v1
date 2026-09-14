import { useState, type FormEvent } from 'react'
import { CalendarDays, CircleAlert, FileSpreadsheet, Handshake } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CopyPathButton } from '@/_workspace/pages/request-software/modal/CopyPathButton'
import { RequestDialog } from '@/_workspace/pages/request-software/modal/RequestDialog'
import type { SoftwareRequest, WorkStartMode } from '@/_workspace/pages/request-software/types'

export type AcceptWorkValues = {
  targetDate: string
  targetDateReason?: string
  workStartMode: WorkStartMode
  actualStartDate: string
  workStartBackdateReason?: string
}

type AcceptRequestDialogProps = {
  request: SoftwareRequest
  mode: 'view' | 'accept'
  onClose: () => void
  onAccept: (request: SoftwareRequest, values: AcceptWorkValues) => void
}

const now = new Date()
const minimumTargetDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

export function AcceptRequestDialog({ request, mode, onClose, onAccept }: AcceptRequestDialogProps) {
  const [targetDate, setTargetDate] = useState('')
  const [targetDateReason, setTargetDateReason] = useState('')
  const [workStartMode, setWorkStartMode] = useState<WorkStartMode>('Current')
  const [actualStartDate, setActualStartDate] = useState(minimumTargetDate)
  const [workStartBackdateReason, setWorkStartBackdateReason] = useState('')
  const [error, setError] = useState('')
  const isBackdated = Boolean(targetDate && targetDate < minimumTargetDate)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!targetDate) {
      setError('กรุณาระบุ Target Date')
      return
    }
    if (isBackdated && !targetDateReason.trim()) {
      setError('กรุณาระบุเหตุผลเมื่อเลือก Target Date ย้อนหลัง')
      return
    }
    if (workStartMode === 'Backdate' && (!actualStartDate || actualStartDate >= minimumTargetDate)) {
      setError('วันที่เริ่มงานย้อนหลังต้องอยู่ก่อนวันปัจจุบัน')
      return
    }
    if (workStartMode === 'Backdate' && !workStartBackdateReason.trim()) {
      setError('กรุณาระบุเหตุผลเมื่อใช้วันที่เริ่มงานย้อนหลัง')
      return
    }
    onAccept(request, {
      targetDate,
      targetDateReason: targetDateReason.trim() || undefined,
      workStartMode,
      actualStartDate: workStartMode === 'Current' ? minimumTargetDate : actualStartDate,
      workStartBackdateReason: workStartMode === 'Backdate' ? workStartBackdateReason.trim() : undefined,
    })
  }

  return (
    <RequestDialog title={mode === 'accept' ? 'Accept Request' : 'Request Detail'} onClose={onClose} maxWidthClassName='max-w-xl' footer={mode === 'accept' ? <><Button type='button' variant='outline' onClick={onClose}>Cancel</Button><Button type='submit' form='accept-request'><Handshake />Accept Work</Button></> : <Button type='button' variant='outline' onClick={onClose}>Close</Button>}>
      <form id='accept-request' onSubmit={submit} className='space-y-5 p-5'>
        <div className='flex gap-3 rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary-soft)] p-4 text-sm text-slate-700'>
          {mode === 'accept' ? <Handshake className='mt-0.5 size-5 shrink-0 text-[var(--app-primary)]' /> : <FileSpreadsheet className='mt-0.5 size-5 shrink-0 text-[var(--app-primary)]' />}
          <div><p className='font-semibold text-slate-900'>{mode === 'accept' ? 'Accept this request' : 'Request details'}</p><p className='mt-1 text-xs leading-5'>{mode === 'accept' ? 'Confirm the request details and set a Target Date before receiving the work.' : 'Review the request details and document path. No data can be changed in View mode.'}</p></div>
        </div>

        <dl className='grid gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm sm:grid-cols-2'>
          <Detail label='Request No.' value={request.requestNo} emphasized />
          <Detail label='Control No.' value={request.softwareControlNo} />
          <Detail label='Software' value={request.title} />
          <Detail label='Version' value={request.version} />
          <Detail label='Request Type' value={request.requestType} />
          <Detail label='Requested By' value={request.requester} />
          <Detail label='Approved Date' value={request.approvedAt ? new Date(request.approvedAt).toLocaleString('en-GB') : '-'} />
        </dl>

        <section className='rounded-xl border border-slate-200 bg-slate-50/50 p-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex min-w-0 items-center gap-3'>
              <span className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600'><FileSpreadsheet className='size-5' /></span>
              <div className='min-w-0'>
                <p className='text-sm font-semibold text-slate-800'>Request Document</p>
                <p className='mt-0.5 text-xs text-slate-500'>Open this path to review the program request details before accepting the work.</p>
              </div>
            </div>
            {request.filePath && <CopyPathButton path={request.filePath} />}
          </div>
          <code className='mt-3 block break-all rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-600'>{request.filePath ?? 'No request document path.'}</code>
        </section>

        {mode === 'accept' && (
          <>
            <section className='rounded-xl border border-slate-200 p-4'>
              <p className='text-sm font-semibold text-slate-800'>Work Start Date <b className='text-rose-500'>*</b></p>
              <p className='mt-1 text-xs text-slate-500'>Choose Backdate only when work started before this request was recorded.</p>
              <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                {(['Current', 'Backdate'] as WorkStartMode[]).map(option => <label key={option} className={`cursor-pointer rounded-lg border px-3 py-2.5 text-sm ${workStartMode === option ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] font-semibold text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]' : 'border-slate-200 text-slate-600'}`}><input type='radio' name='work-start-mode' checked={workStartMode === option} onChange={() => { setWorkStartMode(option); if (option === 'Current') setActualStartDate(minimumTargetDate); setError('') }} className='mr-2 accent-[var(--app-primary)]' />{option}</label>)}
              </div>
              <label className='mt-3 block'><span className='mb-1.5 block text-xs font-medium text-slate-600'>Actual Start Date <b className='text-rose-500'>*</b></span><input type='date' max={workStartMode === 'Backdate' ? minimumTargetDate : undefined} disabled={workStartMode === 'Current'} value={actualStartDate} onChange={event => { setActualStartDate(event.target.value); setError('') }} className='h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none disabled:bg-slate-50 disabled:text-slate-500' /></label>
              {workStartMode === 'Backdate' && <label className='mt-3 block'><span className='mb-1.5 block text-xs font-medium text-slate-700'>Backdate reason <b className='text-rose-500'>*</b></span><textarea value={workStartBackdateReason} onChange={event => { setWorkStartBackdateReason(event.target.value); setError('') }} rows={2} maxLength={500} placeholder='Explain why work started before the request was recorded' className='w-full resize-none rounded-lg border border-amber-300 bg-amber-50/40 px-3 py-2 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' /></label>}
            </section>
            <label className='block'>
              <span className='mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700'><CalendarDays className='size-4 text-[var(--app-primary)]' />Target Date <b className='text-rose-500'>*</b></span>
              <input type='date' value={targetDate} onChange={event => { setTargetDate(event.target.value); setError('') }} className='h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' />
              <span className='mt-1.5 block text-xs text-slate-500'>Past dates are allowed, but a reason must be recorded.</span>
            </label>
            {isBackdated && (
              <div className='rounded-xl border border-amber-300 bg-amber-50 p-3'>
                <div className='flex gap-2 text-xs text-amber-800'><CircleAlert className='size-4 shrink-0' /><p><b>Backdated Target Date</b><br />Explain why this request is being recorded with a past target date.</p></div>
                <label className='mt-3 block'><span className='mb-1.5 block text-xs font-medium text-slate-700'>Backdate reason <b className='text-rose-500'>*</b></span><textarea value={targetDateReason} onChange={event => { setTargetDateReason(event.target.value); setError('') }} rows={3} maxLength={500} placeholder='Enter the reason for using a past date' className='w-full resize-none rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' /><span className='mt-1 block text-right text-[10px] text-slate-400'>{targetDateReason.length}/500</span></label>
              </div>
            )}
            {error && <p role='alert' className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'>{error}</p>}
          </>
        )}
      </form>
    </RequestDialog>
  )
}

function Detail({ label, value, emphasized = false }: { label: string; value?: string; emphasized?: boolean }) {
  return <div><dt className='text-xs text-slate-500'>{label}</dt><dd className={`mt-0.5 break-words text-sm text-slate-800 ${emphasized ? 'font-semibold text-[var(--app-primary)]' : 'font-medium'}`}>{value || '-'}</dd></div>
}
