import { useState } from 'react'
import { ArrowRight, BellRing, UserRoundCog } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { findMockPerson, mockPeople } from '@/_workspace/data/mock-people'

import { getRequestOwner } from '../owner-transfer'
import type { OwnerTransferReason, SoftwareRequest } from '../types'
import { RequestDialog } from './RequestDialog'

type TransferRequestOwnerDialogProps = {
  request: SoftwareRequest
  onClose: () => void
  onTransfer: (request: SoftwareRequest, newOwner: string, reason: OwnerTransferReason, remark: string) => void
}

const reasons: OwnerTransferReason[] = ['Resigned', 'Department Transfer', 'Long-term Leave', 'Responsibility Change']

export function TransferRequestOwnerDialog({ request, onClose, onTransfer }: TransferRequestOwnerDialogProps) {
  const currentOwner = getRequestOwner(request)
  const [newOwner, setNewOwner] = useState('')
  const [reason, setReason] = useState<OwnerTransferReason | ''>('')
  const [remark, setRemark] = useState('')
  const [error, setError] = useState('')
  const ownerIsActive = Boolean(findMockPerson(currentOwner))

  const transfer = () => {
    if (!newOwner) return setError('กรุณาเลือกผู้รับโอนงาน')
    if (!reason) return setError('กรุณาระบุเหตุผลที่โอนงาน')
    onTransfer(request, newOwner, reason, remark)
  }

  return (
    <RequestDialog
      title='Transfer Request Owner'
      onClose={onClose}
      maxWidthClassName='max-w-xl'
      footer={<><Button type='button' variant='outline' onClick={onClose}>Cancel</Button><Button type='button' onClick={transfer}><UserRoundCog />Transfer</Button></>}
    >
      <div className='space-y-5 p-5'>
        <div className='rounded-xl border border-slate-200 bg-slate-50/60 p-4'>
          <dl className='grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2'>
            <Detail label='Request No.' value={request.requestNo} />
            <Detail label='Control No.' value={request.softwareControlNo} />
            <Detail label='Software' value={request.title} />
            <div><dt className='text-xs text-slate-500'>Current Owner</dt><dd className='mt-1 flex items-center gap-2 font-medium text-slate-800'>{currentOwner}<span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ownerIsActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{ownerIsActive ? 'Active' : 'Inactive'}</span></dd></div>
          </dl>
        </div>

        <div className='flex items-center gap-3 rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary-soft)] p-3 text-sm'>
          <span className='font-medium text-slate-700'>{currentOwner}</span><ArrowRight className='size-4 text-[var(--app-primary)]' /><span className='font-semibold text-[var(--app-primary)]'>{newOwner || 'Select new owner'}</span>
        </div>

        <label className='block'>
          <span className='mb-1.5 block text-sm font-medium text-slate-700'>Transfer To <b className='text-rose-500'>*</b></span>
          <select value={newOwner} onChange={event => { setNewOwner(event.target.value); setError('') }} className='h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]'>
            <option value=''>Select employee</option>
            {mockPeople.filter(person => person.name !== currentOwner).map(person => <option key={person.employeeCode} value={person.name}>{person.employeeCode} - {person.name}</option>)}
          </select>
        </label>
        <label className='block'>
          <span className='mb-1.5 block text-sm font-medium text-slate-700'>Reason <b className='text-rose-500'>*</b></span>
          <select value={reason} onChange={event => { setReason(event.target.value as OwnerTransferReason); setError('') }} className='h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]'>
            <option value=''>Select reason</option>
            {reasons.map(item => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className='block'>
          <span className='mb-1.5 block text-sm font-medium text-slate-700'>Remark <span className='font-normal text-slate-400'>(optional)</span></span>
          <textarea value={remark} onChange={event => setRemark(event.target.value)} rows={3} maxLength={500} placeholder='Additional transfer details' className='w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' />
          <span className='mt-1 block text-right text-[10px] text-slate-400'>{remark.length}/500</span>
        </label>
        <div className='flex gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-800'><BellRing className='mt-0.5 size-4 shrink-0' /><p>The new owner and related current actors will receive an in-app/email notification. Original requester information remains unchanged.</p></div>
        {request.ownerTransferHistory?.length ? (
          <section className='rounded-xl border border-slate-200 p-4'>
            <p className='text-sm font-semibold text-slate-800'>Latest transfer</p>
            {request.ownerTransferHistory.slice(-1).map(item => <dl key={item.id} className='mt-3 grid gap-3 text-xs sm:grid-cols-2'><Detail label='From / To' value={`${item.from} → ${item.to}`} /><Detail label='Reason' value={item.reason} /><Detail label='Transferred By' value={item.transferredBy} /><Detail label='Transferred Date' value={new Date(item.transferredAt).toLocaleString('en-GB')} /></dl>)}
          </section>
        ) : null}
        {error && <p role='alert' className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'>{error}</p>}
      </div>
    </RequestDialog>
  )
}

function Detail({ label, value }: { label: string; value?: string }) {
  return <div><dt className='text-xs text-slate-500'>{label}</dt><dd className='mt-1 font-medium text-slate-800'>{value || '-'}</dd></div>
}
