import { useState, type FormEvent } from 'react'
import { CheckCircle2, Clock3, FileSpreadsheet, History, LockKeyhole, RotateCcw, Send, UserRound, XCircle, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { findMockPerson } from '@/_workspace/data/mock-people'
import { CopyPathButton } from '@/_workspace/pages/request-software/modal/CopyPathButton'
import { RequestDialog } from '@/_workspace/pages/request-software/modal/RequestDialog'
import type { ApprovalAction, ApprovalStep, SoftwareRequest } from '@/_workspace/pages/request-software/types'

import { getApprovalSteps, getCurrentApprovalStep } from '../approval-workflow'
import type { ApprovalDialogMode } from '../types'

type ApproveRequestDialogProps = {
  request: SoftwareRequest
  mode: ApprovalDialogMode
  onClose: () => void
  onDecision: (request: SoftwareRequest, action: ApprovalAction, comment: string) => void
}

export function ApproveRequestDialog({ request, mode, onClose, onDecision }: ApproveRequestDialogProps) {
  const steps = getApprovalSteps(request)
  const currentStep = getCurrentApprovalStep(request)
  const checkers = steps.filter(step => step.role === 'Checker')
  const approvers = steps.filter(step => step.role === 'Approver')
  const canReview = mode === 'review' && request.status === 'Waiting Approve' && Boolean(currentStep)
  const [action, setAction] = useState<ApprovalAction>(currentStep?.role === 'Checker' ? 'Check' : 'Approve')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const submitDecision = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentStep) return
    if ((action === 'Review' || action === 'Not Approve') && !comment.trim()) {
      setError('กรุณาระบุความคิดเห็นหรือเหตุผลในการส่งกลับแก้ไข')
      return
    }
    onDecision(request, action, comment)
  }

  return (
    <RequestDialog
      title={mode === 'review' ? 'Review Approval Request' : 'Approval Request Detail'}
      onClose={onClose}
      maxWidthClassName='max-w-7xl'
      scrollContent
      footer={canReview ? (
        <>
          <Button type='button' variant='outline' onClick={onClose}>Cancel</Button>
          <Button type='submit' form='approval-decision'><Send />Submit action</Button>
        </>
      ) : <Button type='button' variant='outline' onClick={onClose}>Close</Button>}
    >
      <div className='grid gap-5 p-5 lg:grid-cols-[230px_minmax(0,1fr)]'>
        <aside className='h-fit rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm'>
          <p className='text-[11px] font-semibold text-[var(--app-primary)]'>Request summary</p>
          <dl className='mt-2 divide-y divide-slate-100'>
            <SummaryItem label='Request No.' value={request.requestNo} emphasized />
            <SummaryItem label='Software Control No.' value={request.softwareControlNo} />
            <SummaryItem label='Software Name' value={request.title} />
            <SummaryItem label='Type' value={request.requestKind} badge />
            <SummaryItem label='Product' value={request.category} />
            <SummaryItem label='Process' value={request.process} />
            <SummaryItem label='Request Type' value={request.requestType} />
            <SummaryItem label='Version' value={request.version} />
            <SummaryItem label='Description' value={request.description} />
            <SummaryItem label='Status' value={request.status} />
          </dl>
        </aside>

        <div className='min-w-0'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <h3 className='text-base font-semibold text-slate-900'>Approval workflow</h3>
              <p className='mt-1 text-xs text-slate-500'>Checker steps are completed before Approver steps.</p>
            </div>
            {currentStep ? (
              <div className='rounded-lg border border-[var(--app-primary)] bg-[var(--app-primary-soft)] px-3 py-2 text-xs text-[var(--app-primary)]'>
                Current: <b>{currentStep.role}</b> · {currentStep.person}
              </div>
            ) : (
              <div className={`rounded-lg border px-3 py-2 text-xs font-medium ${request.status === 'Rejected' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{request.status}</div>
            )}
          </div>

          <section className='mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-3'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='flex min-w-0 items-center gap-3'>
                <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600'><FileSpreadsheet className='size-5' /></span>
                <div className='min-w-0'><p className='text-xs font-semibold text-slate-800'>Request document</p><code className='block truncate text-[11px] text-slate-500'>{request.filePath ?? '-'}</code></div>
              </div>
              {request.filePath && <CopyPathButton path={request.filePath} />}
            </div>
          </section>

          {canReview && currentStep && (
            <form id='approval-decision' onSubmit={submitDecision} className='mt-4 rounded-xl border border-slate-200 bg-white p-4'>
              <p className='text-sm font-semibold text-slate-800'>Your Action ({currentStep.role})</p>
              <div className={`mt-3 grid gap-3 ${currentStep.role === 'Approver' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                {currentStep.role === 'Checker' ? (
                  <>
                    <ActionOption action='Check' selected={action === 'Check'} title='Check' description='The document is complete.' icon={CheckCircle2} onSelect={setAction} />
                    <ActionOption action='Review' selected={action === 'Review'} title='Review' description='Return the request for correction.' icon={RotateCcw} onSelect={setAction} />
                  </>
                ) : (
                  <>
                    <ActionOption action='Approve' selected={action === 'Approve'} title='Approve' description='Approve and continue the workflow.' icon={CheckCircle2} onSelect={setAction} />
                    <ActionOption action='Review' selected={action === 'Review'} title='Review' description='Return the request for correction.' icon={RotateCcw} onSelect={setAction} />
                    <ActionOption action='Not Approve' selected={action === 'Not Approve'} title='Not Approve' description='Reject this request permanently.' icon={XCircle} onSelect={setAction} danger />
                  </>
                )}
              </div>
              <label className='mt-4 block'>
                <span className='mb-1.5 block text-xs font-medium text-slate-600'>Comment / Review Reason {(action === 'Review' || action === 'Not Approve') && <b className='text-rose-500'>*</b>}</span>
                <textarea value={comment} onChange={event => { setComment(event.target.value); setError('') }} rows={3} maxLength={1000} placeholder='Enter a comment or reason' className='w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' />
                <span className='mt-1 block text-right text-[10px] text-slate-400'>{comment.length}/1000</span>
              </label>
              {error && <p role='alert' className='mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'>{error}</p>}
            </form>
          )}

          <div className='mt-4 space-y-3'>
            <ApprovalGroup label='Checker' steps={checkers} currentStepId={currentStep?.id} optional />
            <div className='mx-auto h-5 w-px bg-[var(--app-primary)]' />
            <ApprovalGroup label='Approver' steps={approvers} currentStepId={currentStep?.id} />
            <div className='mx-auto h-5 w-px bg-slate-300' />
            <CcGroup people={request.cc ?? []} />
            <ApprovalHistory request={request} />
          </div>
        </div>
      </div>
    </RequestDialog>
  )
}

function SummaryItem({ label, value, emphasized = false, badge = false }: { label: string; value?: string; emphasized?: boolean; badge?: boolean }) {
  return (
    <div className='py-2'>
      <dt className='text-[11px] leading-4 text-slate-500'>{label}</dt>
      <dd className={`mt-0.5 break-words text-xs leading-5 text-slate-800 ${emphasized ? 'font-semibold' : 'font-medium'}`}>
        {badge && value ? <span className='inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700'>{value}</span> : value || '-'}
      </dd>
    </div>
  )
}

function ActionOption({ action, selected, title, description, icon: Icon, onSelect, danger = false }: { action: ApprovalAction; selected: boolean; title: string; description: string; icon: LucideIcon; onSelect: (action: ApprovalAction) => void; danger?: boolean }) {
  return (
    <label className={`cursor-pointer rounded-xl border p-3 transition ${selected ? danger ? 'border-rose-400 bg-rose-50 ring-1 ring-rose-300' : 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] ring-1 ring-[var(--app-primary)]' : 'border-slate-200 hover:bg-slate-50'}`}>
      <input type='radio' name='approval-action' value={action} checked={selected} onChange={() => onSelect(action)} className='sr-only' />
      <span className={`flex items-center gap-2 text-sm font-semibold ${danger ? 'text-rose-700' : 'text-slate-800'}`}><Icon className='size-4' />{title}</span>
      <span className='mt-1 block text-xs text-slate-500'>{description}</span>
    </label>
  )
}

function ApprovalGroup({ label, steps, currentStepId, optional = false }: { label: string; steps: ApprovalStep[]; currentStepId?: string; optional?: boolean }) {
  const groupStatus = steps.some(step => step.status === 'Rejected') ? 'Rejected' : steps.some(step => step.id === currentStepId) ? 'In progress' : steps.length > 0 && steps.every(step => step.status === 'Approved') ? 'Completed' : 'Waiting'
  const groupStatusClass = groupStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700' : groupStatus === 'In progress' ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]' : groupStatus === 'Rejected' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'
  return (
    <section className='overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50'>
      <div className='flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5'>
        <div className='flex items-center gap-2 text-sm font-semibold text-slate-800'><UserRound className='size-4 text-[var(--app-primary)]' />{label}{optional && <span className='text-xs font-normal text-slate-400'>(optional)</span>}</div>
        <div className='flex items-center gap-2'><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${groupStatusClass}`}>{groupStatus}</span><span className='rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600'>{steps.length} people</span></div>
      </div>
      <div className='max-h-[390px] space-y-2 overflow-y-auto p-2'>
        {steps.length > 0 ? steps.map((step, index) => <ApprovalPersonCard key={step.id} step={step} index={index} isCurrent={step.id === currentStepId} />) : <p className='px-2 py-3 text-xs text-slate-400'>No {label.toLowerCase()} selected.</p>}
      </div>
    </section>
  )
}

function ApprovalPersonCard({ step, index, isCurrent }: { step: ApprovalStep; index: number; isCurrent: boolean }) {
  const person = findMockPerson(step.person)
  const displayStatus = isCurrent ? step.role === 'Checker' ? 'Waiting Check' : 'Waiting Approve' : step.status === 'Pending' ? 'Waiting' : step.status
  const statusStyles = {
    'Waiting Check': 'bg-amber-50 text-orange-600 ring-orange-400/30',
    'Waiting Approve': 'bg-amber-50 text-orange-600 ring-orange-400/30',
    Waiting: 'bg-slate-100 text-slate-500 ring-slate-500/20',
    Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  }
  const StatusIcon = displayStatus === 'Approved' ? CheckCircle2 : displayStatus === 'Rejected' ? XCircle : isCurrent ? Clock3 : LockKeyhole
  const cardClass = step.status === 'Approved' ? 'border-emerald-300 bg-emerald-50/40' : step.status === 'Rejected' ? 'border-rose-300 bg-rose-50/40' : isCurrent ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] ring-1 ring-[var(--app-primary)]' : 'border-slate-200 bg-white'
  const indexClass = step.status === 'Approved' ? 'bg-emerald-500 text-white' : step.status === 'Rejected' ? 'bg-rose-500 text-white' : isCurrent ? 'bg-[var(--app-primary)] text-white' : 'bg-slate-100 text-slate-500'

  return (
    <article className={`overflow-hidden rounded-xl border ${cardClass}`}>
      <div className='grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2 p-2'>
        <span className={`flex h-10 items-center justify-center rounded-lg text-xs font-semibold ${indexClass}`}>{step.status === 'Approved' ? <CheckCircle2 className='size-5' /> : index + 1}</span>
        <div className={`flex h-10 items-center rounded-lg border px-3 text-sm font-medium ${isCurrent ? 'border-[var(--app-primary)] bg-white text-[var(--app-primary)]' : step.status === 'Approved' ? 'border-emerald-200 bg-white/80 text-emerald-800' : 'border-slate-200 bg-white text-slate-800'}`}>{step.person}</div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[displayStatus]}`}><StatusIcon className='size-3.5' />{displayStatus}</span>
      </div>
      {person ? (
        <div className={`overflow-x-auto border-t px-3 py-2.5 ${step.status === 'Approved' ? 'border-emerald-200 bg-emerald-50/50' : isCurrent ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)]' : 'border-slate-100 bg-slate-50/45'}`}>
          <div className='grid min-w-[850px] grid-cols-[minmax(260px,1.55fr)_repeat(4,minmax(120px,1fr))] items-center'>
            <div className='flex min-w-0 items-center gap-3 pr-4'>
              <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary)]'><UserRound className='size-5' /></span>
              <div className='min-w-0'>
                <div className='flex min-w-0 items-baseline gap-3'><p className='truncate text-sm font-semibold text-slate-800'>{person.name}</p><b className='shrink-0 text-sm text-emerald-600'>{person.employeeCode}</b></div>
                <p className='truncate text-[11px] text-slate-500'>{person.email}</p>
              </div>
            </div>
            <PersonDetail label='Section' value={person.section} />
            <PersonDetail label='Position' value={person.position} />
            <PersonDetail label='Position Code' value={person.positionCode} />
            <PersonDetail label='Department' value={person.department} />
          </div>
        </div>
      ) : <div className='border-t border-slate-100 px-4 py-3 text-xs text-slate-500'>Employee details are not available in mock data.</div>}
    </article>
  )
}

function PersonDetail({ label, value }: { label: string; value: string }) {
  return <div className='min-w-0 border-l border-slate-200 px-4'><p className='text-[11px] text-slate-500'>{label}</p><p className='truncate text-xs font-semibold leading-5 text-slate-700'>{value}</p></div>
}

function CcGroup({ people }: { people: string[] }) {
  return (
    <section className='rounded-xl border border-slate-200 bg-slate-50/50 p-3'>
      <div className='flex items-center justify-between gap-2'><div className='flex items-center gap-2 text-sm font-semibold text-slate-800'><UserRound className='size-4 text-[var(--app-primary)]' />CC <span className='text-xs font-normal text-slate-400'>(notification only)</span></div><span className='rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600'>{people.length} people</span></div>
      <div className='mt-2 flex flex-wrap gap-2'>{people.length > 0 ? people.map(person => <span key={person} className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700'>{person}</span>) : <span className='text-xs text-slate-400'>No CC selected.</span>}</div>
    </section>
  )
}

function ApprovalHistory({ request }: { request: SoftwareRequest }) {
  const history = request.approvalHistory ?? []
  const routeHistory = request.approvalRouteHistory ?? []
  const cancellationHistory = request.cancellationHistory ?? []
  return (
    <section className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
      <div className='flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5'><div className='flex items-center gap-2 text-sm font-semibold text-slate-800'><History className='size-4 text-[var(--app-primary)]' />Workflow history</div><span className='text-xs text-slate-400'>{history.length + routeHistory.length + cancellationHistory.length} records</span></div>
      {history.length > 0 ? (
        <div className='divide-y divide-slate-100'>
          {[...history].reverse().map(item => (
            <div key={item.id} className='grid gap-1 px-3 py-2.5 text-xs md:grid-cols-[120px_180px_130px_minmax(0,1fr)_160px] md:items-center'>
              <b className='text-slate-700'>{item.action}</b><span className='text-slate-600'>{item.person}</span><span className='text-slate-500'>{item.role}</span><span className='text-slate-500'>{item.comment || '-'}</span><time className='text-slate-400'>{new Date(item.decidedAt).toLocaleString('en-GB')}</time>
            </div>
          ))}
        </div>
      ) : <p className='px-3 py-4 text-xs text-slate-400'>No action has been recorded yet.</p>}
      {routeHistory.length > 0 && (
        <div className='border-t border-slate-200 bg-[var(--app-primary-soft)]'>
          <p className='px-3 pt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--app-primary)]'>Flow route changes</p>
          <div className='divide-y divide-slate-200/70'>
            {[...routeHistory].reverse().map(item => <div key={item.id} className='grid gap-1 px-3 py-2.5 text-xs md:grid-cols-[110px_minmax(220px,1fr)_150px_minmax(150px,1fr)_160px] md:items-center'><b className='text-slate-700'>{item.role}</b><span className='text-slate-700'>{item.from} → {item.to}</span><span className='text-slate-500'>{item.reason}</span><span className='text-slate-500'>Changed by {item.changedBy}{item.wasCurrentStep ? ' (current step)' : ' (upcoming step)'}</span><time className='text-slate-400'>{new Date(item.changedAt).toLocaleString('en-GB')}</time></div>)}
          </div>
        </div>
      )}
      {cancellationHistory.length > 0 && <div className='border-t border-slate-200 bg-rose-50/50'><p className='px-3 pt-3 text-[11px] font-semibold uppercase tracking-wide text-rose-600'>Cancellation history</p><div className='divide-y divide-rose-100'>{[...cancellationHistory].reverse().map(item => <div key={item.id} className='grid gap-1 px-3 py-2.5 text-xs md:grid-cols-[110px_170px_minmax(0,1fr)_160px] md:items-center'><b className='text-rose-700'>{item.action}</b><span className='text-slate-600'>{item.person}</span><span className='text-slate-600'>{item.reason}</span><time className='text-slate-400'>{new Date(item.occurredAt).toLocaleString('en-GB')}</time></div>)}</div></div>}
    </section>
  )
}
