import { useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, CircleAlert, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { findSoftwareByControlNo } from '@/_workspace/data/request-software/mockSoftwareCatalog'
import { findOpenRequestsByControlNo } from '../request-conflicts'
import { requestTypeOptions, type RequestFormValues, type RequestModalMode, type RequestPriority, type SoftwareRequest, type SoftwareRequestType } from '../types'

import { RequestDialog } from './RequestDialog'
import { RequestFilePath } from './RequestFilePath'

type NewProgramModalProps = {
  mode?: 'create' | RequestModalMode
  request?: SoftwareRequest
  requests: SoftwareRequest[]
  initialControlNo?: string
  onClose: () => void
  onBack?: () => void
  onSwitchToRevise?: (controlNo: string) => void
  onSave: (values: RequestFormValues) => void
  onSubmitRequest?: () => void
}

type ControlNoStatus = 'idle' | 'available' | 'exists'

const fieldClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--app-primary)_15%,transparent)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

export function NewProgramModal({ mode = 'create', request, requests, initialControlNo, onClose, onBack, onSwitchToRevise, onSave, onSubmitRequest }: NewProgramModalProps) {
  const isCreate = mode === 'create'
  const readOnly = mode === 'view'
  const isVerifiedFromCheck = isCreate && Boolean(initialControlNo)
  const isControlNoLocked = readOnly || !isCreate || isVerifiedFromCheck
  const [controlNo, setControlNo] = useState(request?.softwareControlNo ?? initialControlNo ?? '')
  const [controlNoStatus, setControlNoStatus] = useState<ControlNoStatus>(request || initialControlNo ? 'available' : 'idle')
  const [openRequests, setOpenRequests] = useState<SoftwareRequest[]>([])
  const [softwareName, setSoftwareName] = useState(request?.title ?? '')
  const [product, setProduct] = useState(request?.category ?? '')
  const [process, setProcess] = useState(request?.process ?? '')
  const [requestType, setRequestType] = useState<SoftwareRequestType>(request?.requestType ?? 'General')
  const [description, setDescription] = useState(request?.description ?? '')
  const [error, setError] = useState('')
  const version = request?.version ?? '1.0.0'
  const isExistingControlNo = controlNoStatus === 'exists'
  const fieldsDisabled = readOnly || isExistingControlNo

  const checkControlNo = () => {
    if (!controlNo.trim()) {
      setError('กรุณากรอก Software Control No. ก่อนตรวจสอบ')
      return
    }

    const existingSoftware = findSoftwareByControlNo(controlNo)
    const existingRequests = findOpenRequestsByControlNo(requests, controlNo, request?.id)
    setOpenRequests(existingRequests)
    setControlNoStatus(existingSoftware || existingRequests.length > 0 ? 'exists' : 'available')
    setError('')
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isCreate && controlNoStatus !== 'available') {
      setError('กรุณาตรวจสอบ Software Control No. ก่อนสร้างโปรแกรมใหม่')
      return
    }
    if (!softwareName.trim() || !product || !process) {
      setError('กรุณากรอก Software Name, Product และ Process ให้ครบถ้วน')
      return
    }

    onSave({
      title: softwareName.trim(),
      category: product,
      priority: requestType === 'Trouble Report/Customer Claim' ? 'Urgent' : (request?.priority ?? 'Medium') as RequestPriority,
      description: description.trim(),
      requestType,
      process,
      softwareControlNo: controlNo.trim(),
      version,
      requestKind: 'New',
    })
  }

  const title = isCreate ? 'New Program Request' : mode === 'edit' ? `Edit New Program · ${request?.requestNo}` : `View New Program · ${request?.requestNo}`

  return (
    <RequestDialog
      title={title}
      onClose={onClose}
      footer={
        <>
          {isCreate && onBack && <Button type='button' variant='ghost' onClick={onBack}><ArrowLeft />Back to Control No. check</Button>}
          <Button type='button' variant='outline' onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
          {readOnly && (request?.status === 'Waiting Submit' || request?.status === 'Review') && onSubmitRequest && <Button type='button' onClick={onSubmitRequest}>{request.status === 'Review' ? 'Resubmit Request' : 'Submit Request'}</Button>}
          {!readOnly && <Button type='submit' form='new-program-request' disabled={isExistingControlNo}>{isCreate ? 'Create Request' : 'Save changes'}</Button>}
        </>
      }
    >
      <form id='new-program-request' onSubmit={submit} className='p-5'>
        <p className='mb-4 text-sm font-semibold text-[var(--app-primary)]'>Software information</p>
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='block'>
            <span className='mb-1.5 block text-xs font-medium text-slate-600'>Software Control No. <b className='text-rose-500'>*</b></span>
            <div className='flex gap-2'>
              <input autoFocus={!isControlNoLocked} disabled={isControlNoLocked} value={controlNo} onChange={event => { setControlNo(event.target.value); setControlNoStatus('idle'); setOpenRequests([]); setError('') }} className={fieldClass} placeholder='e.g. SC-00125' />
              {isCreate && !isVerifiedFromCheck && <Button type='button' onClick={checkControlNo}><Search />Check</Button>}
            </div>
          </label>
          <label className='block'>
            <span className='mb-1.5 block text-xs font-medium text-slate-600'>Software Name <b className='text-rose-500'>*</b></span>
            <input disabled={fieldsDisabled} value={softwareName} onChange={event => setSoftwareName(event.target.value)} className={fieldClass} placeholder='e.g. Check Status' />
          </label>
          {isCreate && controlNoStatus === 'available' && <div className='sm:col-span-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700'><CheckCircle2 className='size-4' />Software Control No. นี้สามารถใช้สร้างโปรแกรมใหม่ได้</div>}
          {isCreate && controlNoStatus === 'exists' && <div role='alert' className='sm:col-span-2 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 font-medium text-amber-800'><CircleAlert className='size-4 shrink-0' /><span>{openRequests.length > 0 ? <>Software Control No. นี้มีคำขอที่กำลังดำเนินการ: {openRequests.map(item => `${item.requestNo} (${item.status})`).join(', ')}</> : <>Software Control No. นี้มีอยู่ในทะเบียนโปรแกรมแล้ว</>} จึงไม่สามารถสร้างคำขอโปรแกรมใหม่ได้</span>{findSoftwareByControlNo(controlNo) && onSwitchToRevise && <Button type='button' size='xs' variant='outline' onClick={() => onSwitchToRevise(controlNo)} className='ml-auto border-amber-300 bg-white text-amber-800 hover:bg-amber-100'>ไปหน้า Revise</Button>}</div>}
          <label className='block'>
            <span className='mb-1.5 block text-xs font-medium text-slate-600'>Product <b className='text-rose-500'>*</b></span>
            <select disabled={fieldsDisabled} value={product} onChange={event => setProduct(event.target.value)} className={fieldClass}><option value=''>Select product</option><option>980</option><option>990</option><option>Smart Factory</option></select>
          </label>
          <label className='block'>
            <span className='mb-1.5 block text-xs font-medium text-slate-600'>Process <b className='text-rose-500'>*</b></span>
            <select disabled={fieldsDisabled} value={process} onChange={event => setProcess(event.target.value)} className={fieldClass}><option value=''>Select process</option><option>Check Flow</option><option>Approval Flow</option><option>Production Flow</option></select>
          </label>
          <label className='block'>
            <span className='mb-1.5 block text-xs font-medium text-slate-600'>Request Type</span>
            <select disabled={fieldsDisabled} value={requestType} onChange={event => setRequestType(event.target.value as SoftwareRequestType)} className={fieldClass}>{requestTypeOptions.map(option => <option key={option}>{option}</option>)}</select>
          </label>
          <label className='block'>
            <span className='mb-1.5 block text-xs font-medium text-slate-600'>Description</span>
            <textarea disabled={fieldsDisabled} value={description} onChange={event => setDescription(event.target.value)} className='min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500' placeholder='Describe the requested program...' />
          </label>
        </div>
        {requestType === 'Trouble Report/Customer Claim' && <div role='alert' className='mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'><CircleAlert className='size-4 shrink-0' />Customer Claim เป็นงานเร่งด่วน ระบบจะกำหนด Priority เป็น Urgent อัตโนมัติ</div>}
        <div className='mt-5 border-t border-slate-100 pt-4'>
          <p className='mb-2 text-sm font-semibold text-[var(--app-primary)]'>Version information</p>
          <span className='flex h-10 max-w-xs items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500'>{version}</span>
        </div>
        {readOnly && request && <RequestFilePath request={request} />}
        {error && <div role='alert' className='mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-5 font-medium text-rose-700'><CircleAlert className='mt-0.5 size-4 shrink-0' /><span>{error}</span></div>}
      </form>
    </RequestDialog>
  )
}
