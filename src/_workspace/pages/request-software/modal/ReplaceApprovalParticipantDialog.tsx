import { useState } from 'react'
import { ArrowRight, Mail, UserRoundCog } from 'lucide-react'

import { mockPeople } from '@/_workspace/data/mock-people'
import { Button } from '@/components/ui/button'

import type { ApprovalRouteChangeReason, SoftwareRequest } from '../types'
import { RequestDialog } from './RequestDialog'

const reasons: ApprovalRouteChangeReason[] = ['Employee Resigned', 'Department Transfer', 'Long-term Leave', 'Responsibility Change', 'Flow Correction']

export function ReplaceApprovalParticipantDialog({ request, onClose, onReplace }: { request: SoftwareRequest; onClose: () => void; onReplace: (request: SoftwareRequest, stepId: string, replacement: string, reason: ApprovalRouteChangeReason) => void }) {
  const pendingSteps = (request.approvalSteps ?? []).filter(step => step.status === 'Pending')
  const currentStepId = pendingSteps[0]?.id
  const [stepId, setStepId] = useState(currentStepId ?? '')
  const [replacement, setReplacement] = useState('')
  const [reason, setReason] = useState<ApprovalRouteChangeReason | ''>('')
  const [error, setError] = useState('')
  const selectedStep = pendingSteps.find(step => step.id === stepId)

  const replace = () => {
    if (!stepId) return setError('กรุณาเลือกขั้นตอนที่ยังรอดำเนินการ')
    if (!replacement) return setError('กรุณาเลือกผู้รับผิดชอบคนใหม่')
    if (!reason) return setError('กรุณาระบุเหตุผลที่เปลี่ยนผู้รับผิดชอบ')
    onReplace(request, stepId, replacement, reason)
  }

  return <RequestDialog title='Replace Pending Participant' onClose={onClose} maxWidthClassName='max-w-2xl' footer={<><Button type='button' variant='outline' onClick={onClose}>Cancel</Button><Button type='button' onClick={replace}><UserRoundCog />Replace participant</Button></>}>
    <div className='space-y-4 p-5'>
      <div className='rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary-soft)] p-4'><p className='text-sm font-semibold text-slate-900'>{request.requestNo} · {request.title}</p><p className='mt-1 text-xs leading-5 text-slate-600'>Only Pending steps can be replaced. Completed Checker/Approver actions and their original people remain in Workflow History.</p></div>
      <label className='block'><span className='mb-1.5 block text-xs font-medium text-slate-600'>Pending Step <b className='text-rose-500'>*</b></span><select value={stepId} onChange={event => { setStepId(event.target.value); setReplacement(''); setError('') }} className={fieldClass}><option value=''>Select step</option>{pendingSteps.map((step, index) => <option key={step.id} value={step.id}>{step.role} · {step.person} · {step.id === currentStepId ? 'Current step' : `Upcoming step ${index + 1}`}</option>)}</select></label>
      {selectedStep && <div className='grid items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_auto_1fr]'><div><p className='text-[11px] text-slate-500'>Current participant</p><p className='mt-1 text-sm font-semibold text-slate-800'>{selectedStep.person}</p><span className='mt-1 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700'>{selectedStep.id === currentStepId ? 'Current step' : 'Upcoming step'}</span></div><ArrowRight className='mx-auto size-5 text-[var(--app-primary)]' /><label><span className='mb-1.5 block text-[11px] text-slate-500'>Replace with <b className='text-rose-500'>*</b></span><select value={replacement} onChange={event => { setReplacement(event.target.value); setError('') }} className={fieldClass}><option value=''>Select employee</option>{mockPeople.filter(person => person.name !== selectedStep.person).map(person => <option key={person.employeeCode} value={person.name}>{person.employeeCode} - {person.name}</option>)}</select></label></div>}
      <label className='block'><span className='mb-1.5 block text-xs font-medium text-slate-600'>Change Reason <b className='text-rose-500'>*</b></span><select value={reason} onChange={event => { setReason(event.target.value as ApprovalRouteChangeReason); setError('') }} className={fieldClass}><option value=''>Select reason</option>{reasons.map(option => <option key={option}>{option}</option>)}</select></label>
      <p className='flex gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700'><Mail className='mt-0.5 size-4 shrink-0' />A mock email notification will be recorded for the replacement, request owner, and CC recipients.</p>
      {error && <p role='alert' className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'>{error}</p>}
    </div>
  </RequestDialog>
}

const fieldClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]'
