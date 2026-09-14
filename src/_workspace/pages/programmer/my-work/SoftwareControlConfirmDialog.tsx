import { useState } from 'react'
import { CircleAlert, FileCheck2, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { mockPeople } from '@/_workspace/data/mock-people'
import { CopyPathButton } from '@/_workspace/pages/request-software/modal/CopyPathButton'
import { RequestDialog } from '@/_workspace/pages/request-software/modal/RequestDialog'
import type { SoftwareRequest } from '@/_workspace/pages/request-software/types'

type SoftwareControlConfirmDialogProps = {
  request: SoftwareRequest
  onClose: () => void
  onConfirm: (request: SoftwareRequest, enteredControlNo: string, approvedBy: string) => void
}

export function SoftwareControlConfirmDialog({ request, onClose, onConfirm }: SoftwareControlConfirmDialogProps) {
  const [enteredControlNo, setEnteredControlNo] = useState('')
  const [approvedBy, setApprovedBy] = useState('')
  const [error, setError] = useState('')

  const confirm = () => {
    const controlNo = enteredControlNo.trim()
    if (!controlNo) return setError('กรุณากรอก Software Control No.')
    if (controlNo !== request.softwareControlNo?.trim()) return setError('Software Control No. ไม่ตรงกับโปรแกรมนี้ กรุณาตรวจสอบเลขควบคุมที่ถูกต้อง')
    if (!approvedBy) return setError('กรุณาเลือก Approved By')
    onConfirm(request, controlNo, approvedBy)
  }

  return (
    <RequestDialog title='Software Control Confirm' onClose={onClose} maxWidthClassName='max-w-2xl' footer={<><Button type='button' variant='outline' onClick={onClose}>Cancel</Button><Button type='button' onClick={confirm}><ShieldCheck />Confirm Software</Button></>}>
      <div className='space-y-5 p-5'>
        <div className='flex gap-3 rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary-soft)] p-4 text-sm text-slate-700'><FileCheck2 className='mt-0.5 size-5 shrink-0 text-[var(--app-primary)]' /><div><p className='font-semibold text-slate-900'>Verify the completed program</p><p className='mt-1 text-xs leading-5'>Enter the Software Control No. manually. The system will compare it with the control number assigned to this program before confirmation.</p></div></div>

        <dl className='grid gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm sm:grid-cols-2'>
          <Detail label='Request No.' value={request.requestNo} />
          <Detail label='Request Mode' value={request.requestKind} />
          <Detail label='Software' value={request.title} />
          <Detail label='Version' value={request.version} />
          <Detail label='Programmer' value={request.assignee} />
          <Detail label='Finished Date' value={request.finishedAt ? new Date(request.finishedAt).toLocaleString('en-GB') : '-'} />
        </dl>

        {request.filePath && <section className='rounded-xl border border-slate-200 p-4'><div className='flex items-center justify-between gap-3'><p className='text-sm font-semibold text-slate-800'>Completed document</p><CopyPathButton path={request.filePath} /></div><code className='mt-3 block break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600'>{request.filePath}</code></section>}

        <label className='block'><span className='mb-1.5 block text-sm font-medium text-slate-700'>Software Control No. <b className='text-rose-500'>*</b></span><input value={enteredControlNo} onChange={event => { setEnteredControlNo(event.target.value); setError('') }} autoComplete='off' placeholder='Enter the official Software Control No.' className='h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm uppercase outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' /><span className='mt-1.5 block text-xs text-slate-500'>This is a free-text field and must exactly match the program control number.</span></label>
        <label className='block'><span className='mb-1.5 block text-sm font-medium text-slate-700'>Approved By <b className='text-rose-500'>*</b></span><select value={approvedBy} onChange={event => { setApprovedBy(event.target.value); setError('') }} className='h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]'><option value=''>Select approver</option>{mockPeople.map(person => <option key={person.employeeCode} value={person.name}>{person.employeeCode} - {person.name}</option>)}</select></label>
        {error && <div role='alert' className='flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700'><CircleAlert className='size-4 shrink-0' />{error}</div>}
      </div>
    </RequestDialog>
  )
}

function Detail({ label, value }: { label: string; value?: string }) {
  return <div><dt className='text-xs text-slate-500'>{label}</dt><dd className='mt-1 font-medium text-slate-800'>{value || '-'}</dd></div>
}
