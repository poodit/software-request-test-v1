import { useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2, ChevronDown, CircleAlert, Plus, Send, Trash2, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { findFlowSetting } from '@/_workspace/data/flow-settings'
import { findMockPerson, mockPersonNames, type MockPerson } from '@/_workspace/data/mock-people'

import type { ApprovalMethod, SoftwareRequest, SubmitRequestValues } from '../types'

import { RequestDialog } from './RequestDialog'

const people = mockPersonNames
const fieldClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--app-primary)_15%,transparent)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

export function SubmitRequestDialog({ request, onClose, onSubmit }: { request: SoftwareRequest; onClose: () => void; onSubmit: (values: SubmitRequestValues) => void }) {
  const [approvalMethod, setApprovalMethod] = useState<ApprovalMethod>(request.approvalMethod ?? 'flow')
  const [manualCheckers, setManualCheckers] = useState<string[]>(request.checkers?.length ? request.checkers : [''])
  const [manualApprovers, setManualApprovers] = useState<string[]>(request.approvers?.length ? request.approvers : [''])
  const [manualCc, setManualCc] = useState<string[]>(request.cc?.length ? request.cc : [''])
  const [programmerRecipients, setProgrammerRecipients] = useState<string[]>(request.programmerRecipients?.length ? request.programmerRecipients : [''])
  const [error, setError] = useState('')
  const useFlowSetting = approvalMethod === 'flow'
  const flowSetting = findFlowSetting(request.category)
  const selectedCheckers = useFlowSetting ? flowSetting?.checkers ?? [] : manualCheckers.filter(Boolean)
  const selectedApprovers = useFlowSetting ? flowSetting?.approvers ?? [] : manualApprovers.filter(Boolean)
  const selectedCc = useFlowSetting ? flowSetting?.cc ?? [] : manualCc.filter(Boolean)
  const selectedProgrammers = programmerRecipients.filter(Boolean)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (selectedApprovers.length === 0) {
      setError(useFlowSetting ? 'ไม่พบ Flow Setting ที่ใช้งานได้ กรุณาเลือกกำหนดเองหรือตั้งค่า Product นี้ใน Flow Setting' : 'กรุณาเลือก Approver อย่างน้อย 1 คนก่อนส่งคำขอ')
      return
    }
    if (selectedProgrammers.length === 0) {
      setError('กรุณาเลือก Programmer ที่ต้องการแจ้งเตือนอย่างน้อย 1 คนก่อนส่งคำขอ')
      return
    }
    onSubmit({ approvalMethod, checkers: selectedCheckers, approvers: selectedApprovers, cc: selectedCc, programmerRecipients: selectedProgrammers })
  }

  return (
    <RequestDialog
      title='Submit Request'
      onClose={onClose}
      maxWidthClassName='max-w-7xl'
      scrollContent
      footer={<><Button type='button' variant='outline' onClick={onClose}>Cancel</Button><Button type='submit' form='submit-request'><Send />Submit Request</Button></>}
    >
      <form id='submit-request' onSubmit={submit} className='grid gap-5 p-5 lg:grid-cols-[210px_minmax(0,1fr)]'>
        <aside className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm'>
          <p className='text-xs font-semibold text-[var(--app-primary)]'>Request summary</p>
          <dl className='mt-3 space-y-3'>
            <div><dt className='text-xs text-slate-500'>Request No.</dt><dd className='mt-0.5 font-semibold text-slate-800'>{request.requestNo}</dd></div>
            <div><dt className='text-xs text-slate-500'>Software Control No.</dt><dd className='mt-0.5 font-medium text-slate-800'>{request.softwareControlNo}</dd></div>
            <div><dt className='text-xs text-slate-500'>Software Name</dt><dd className='mt-0.5 font-medium text-slate-800'>{request.title}</dd></div>
            <div><dt className='text-xs text-slate-500'>Request mode / Type</dt><dd className='mt-0.5 font-medium text-slate-800'>{request.requestKind} / {request.requestType}</dd></div>
            <div><dt className='text-xs text-slate-500'>Product / Process</dt><dd className='mt-0.5 font-medium text-slate-800'>{request.category} / {request.process}</dd></div>
            <div><dt className='text-xs text-slate-500'>Version</dt><dd className='mt-0.5 font-medium text-slate-800'>{request.version}</dd></div>
          </dl>
        </aside>

        <div className='min-w-0'>
          <p className='text-sm font-semibold text-[var(--app-primary)]'>Approval Method</p>
          <div className='mt-3 grid gap-3 sm:grid-cols-2'>
            <label className={`cursor-pointer rounded-xl border p-4 ${useFlowSetting ? 'border-[var(--app-primary)] bg-[color-mix(in_srgb,var(--app-primary)_6%,white)] ring-1 ring-[var(--app-primary)]' : 'border-slate-200'}`}>
              <input className='sr-only' type='radio' name='approval-method' checked={useFlowSetting} onChange={() => { setApprovalMethod('flow'); setError('') }} />
              <span className='flex items-center gap-2 text-sm font-semibold text-slate-800'><CheckCircle2 className='size-4 text-[var(--app-primary)]' />Use Flow Setting</span>
              <span className='mt-1 block text-xs text-slate-500'>Use the standard Product routing.</span>
            </label>
            <label className={`cursor-pointer rounded-xl border p-4 ${!useFlowSetting ? 'border-[var(--app-primary)] bg-[color-mix(in_srgb,var(--app-primary)_6%,white)] ring-1 ring-[var(--app-primary)]' : 'border-slate-200'}`}>
              <input className='sr-only' type='radio' name='approval-method' checked={!useFlowSetting} onChange={() => { setApprovalMethod('manual'); setError('') }} />
              <span className='flex items-center gap-2 text-sm font-semibold text-slate-800'><UserRound className='size-4 text-[var(--app-primary)]' />Choose Manually</span>
              <span className='mt-1 block text-xs text-slate-500'>Choose the people for this request.</span>
            </label>
          </div>

          {useFlowSetting ? (
            <>
              <p className='mt-5 text-sm font-semibold text-slate-800'>Routing preview <span className='text-xs font-medium text-[var(--app-primary)]'>(Flow setting)</span></p>
              {!flowSetting && <p className='mt-1 text-xs font-medium text-rose-600'>No active Flow Setting for {request.category}.</p>}
              <div className='mt-3 space-y-2'>
                <RoutingPeople label='Checker' people={selectedCheckers} />
                <ArrowRight className='mx-auto size-4 rotate-90 text-[var(--app-primary)]' />
                <RoutingPeople label='Approver' people={selectedApprovers} required />
                <ArrowRight className='mx-auto size-4 rotate-90 text-[var(--app-primary)]' />
                <RoutingPeople label='CC' people={selectedCc} />
              </div>
            </>
          ) : (
            <>
              <p className='mt-5 text-sm font-semibold text-slate-800'>Manual routing</p>
              <div className='mt-3 space-y-3'>
                <ManualPeopleEditor label='Checker' values={manualCheckers} onChange={values => { setManualCheckers(values); setError('') }} />
                <ManualPeopleEditor label='Approver' values={manualApprovers} onChange={values => { setManualApprovers(values); setError('') }} required />
                <ManualPeopleEditor label='CC' values={manualCc} onChange={values => { setManualCc(values); setError('') }} />
              </div>
            </>
          )}
          <section className='mt-5 rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary-soft)] p-3'>
            <p className='text-sm font-semibold text-[var(--app-primary)]'>Programmer Notification <b className='text-rose-500'>*</b></p>
            <p className='mt-1 text-xs text-slate-600'>Recipients are notified about the request, but the work remains available in Get Request until a Programmer accepts it.</p>
            <div className='mt-3'><ManualPeopleEditor label='Programmer' values={programmerRecipients} onChange={values => { setProgrammerRecipients(values); setError('') }} required /></div>
          </section>
          <div className='mt-5 flex gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700'><CircleAlert className='mt-0.5 size-4 shrink-0' />After submission, the mock Excel file moves to the Submit folder and related users receive a notification.</div>
          {error && <p role='alert' className='mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'>{error}</p>}
        </div>
      </form>
    </RequestDialog>
  )
}

function RoutingPeople({ label, people, required = false }: { label: string; people: string[]; required?: boolean }) {
  return (
    <section className='overflow-hidden rounded-xl border border-slate-200 bg-slate-50/40'>
      <div className='flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2'>
        <div className='flex items-center gap-1 text-xs font-semibold text-[var(--app-primary)]'>
          <UserRound className='size-3.5' />
          {label}
          {required && <b className='text-rose-500'>*</b>}
        </div>
        <span className='rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600'>{people.length} people</span>
      </div>
      <div className='max-h-[390px] space-y-2 overflow-y-auto p-2'>
        {people.length > 0 ? people.map((person, index) => (
          <PersonPreviewCard key={`${person}-${index}`} index={index} personName={person} />
        )) : <p className={`px-1 py-2 text-xs ${required ? 'font-medium text-rose-500' : 'text-slate-400'}`}>{required ? 'At least one person is required' : 'Not selected'}</p>}
      </div>
    </section>
  )
}

function ManualPeopleEditor({ label, values, onChange, required = false }: { label: string; values: string[]; onChange: (values: string[]) => void; required?: boolean }) {
  const addPerson = () => onChange([...values, ''])
  const updatePerson = (index: number, person: string) => onChange(values.map((value, valueIndex) => valueIndex === index ? person : value))
  const removePerson = (index: number) => {
    const nextValues = values.filter((_, valueIndex) => valueIndex !== index)
    onChange(nextValues.length > 0 ? nextValues : [''])
  }

  return (
    <section className='rounded-xl border border-slate-200 bg-slate-50/50 p-3'>
      <div className='mb-2 flex items-center justify-between gap-2'>
        <div>
          <p className='text-xs font-semibold text-slate-700'>{label} {required && <b className='text-rose-500'>*</b>}</p>
          <p className='text-[10px] text-slate-400'>{required ? 'At least one person is required' : 'Optional'}</p>
        </div>
        <Button type='button' variant='outline' size='icon-sm' aria-label={`Add ${label}`} onClick={addPerson} disabled={values.length >= people.length}>
          <Plus className='size-4' />
        </Button>
      </div>
      <div className='max-h-[440px] space-y-2 overflow-y-auto pr-1'>
        {values.map((value, index) => (
          <article key={index} className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
            <div className='grid grid-cols-[36px_minmax(0,1fr)_40px] gap-2 p-2'>
              <span className='flex h-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600'>{index + 1}</span>
              <select value={value} onChange={event => updatePerson(index, event.target.value)} className={fieldClass} aria-label={`${label} ${index + 1}`}>
                <option value=''>Select person</option>
                {people.map(person => <option key={person} value={person} disabled={values.some((selectedPerson, selectedIndex) => selectedIndex !== index && selectedPerson === person)}>{person}</option>)}
              </select>
              <Button type='button' variant='outline' size='icon-sm' aria-label={`Remove ${label} ${index + 1}`} onClick={() => removePerson(index)} className='h-10 border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600'>
                <Trash2 className='size-4' />
              </Button>
            </div>
            {value && <PersonDetails personName={value} />}
          </article>
        ))}
      </div>
    </section>
  )
}

function PersonPreviewCard({ index, personName }: { index: number; personName: string }) {
  return (
    <article className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
      <div className='grid grid-cols-[36px_minmax(0,1fr)] gap-2 p-2'>
        <span className='flex h-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600'>{index + 1}</span>
        <div className={`${fieldClass} flex items-center justify-between gap-3`}>
          <span>{personName}</span>
          <ChevronDown className='size-4 shrink-0 text-slate-500' />
        </div>
      </div>
      <PersonDetails personName={personName} />
    </article>
  )
}

function PersonDetails({ personName }: { personName: string }) {
  const person = findMockPerson(personName)
  if (!person) return <div className='border-t border-slate-100 px-4 py-3 text-xs text-slate-500'>No employee details found.</div>

  return (
    <div className='overflow-x-auto border-t border-slate-100 bg-slate-50/45 px-3 py-2.5'>
      <div
        className='min-w-[850px]'
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 1.55fr) repeat(4, minmax(120px, 1fr))',
          alignItems: 'center',
        }}
      >
        <div className='flex min-w-0 items-center gap-3 pr-4'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary)]'>
            <UserRound className='size-5' />
          </span>
          <div className='min-w-0'>
            <div className='flex min-w-0 items-baseline gap-3'>
              <p className='truncate text-sm font-semibold leading-5 text-slate-800'>{person.name}</p>
              <b className='shrink-0 text-sm font-semibold text-emerald-600'>{person.employeeCode}</b>
            </div>
            <p className='truncate text-[11px] leading-4 text-slate-500'>{person.email}</p>
          </div>
        </div>
        <PersonDetail label='Section' value={person.section} />
        <PersonDetail label='Position' value={person.position} />
        <PersonDetail label='Position Code' value={person.positionCode} />
        <PersonDetail label='Department' value={person.department} />
      </div>
    </div>
  )
}

function PersonDetail({ label, value }: { label: string; value: MockPerson[keyof MockPerson] }) {
  return (
    <div className='min-w-0 border-l border-slate-200 px-4'>
      <p className='text-[11px] leading-4 text-slate-500'>{label}</p>
      <p className='truncate text-xs font-semibold leading-5 text-slate-700'>{value}</p>
    </div>
  )
}
