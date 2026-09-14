import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, CircleAlert, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { findSoftwareByControlNo, getNextVersion, type SoftwareCatalogItem } from '@/_workspace/data/request-software/mockSoftwareCatalog'
import { findOpenRequestsByControlNo } from '../request-conflicts'
import { requestTypeOptions, type RequestFormValues, type RequestModalMode, type RequestPriority, type SoftwareRequest, type SoftwareRequestType } from '../types'

import { RequestDialog } from './RequestDialog'
import { RequestFilePath } from './RequestFilePath'

type ReviseProgramModalProps = {
  mode?: 'create' | RequestModalMode
  request?: SoftwareRequest
  requests: SoftwareRequest[]
  initialControlNo?: string
  onClose: () => void
  onBack?: () => void
  onSave: (values: RequestFormValues) => void
  onSubmitRequest?: () => void
}

type VersionLevel = 'Low' | 'Medium' | 'High'

const fieldClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--app-primary)_15%,transparent)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'
const levelLabels: Record<VersionLevel, string> = {
  Low: 'Patch update',
  Medium: 'Improvement',
  High: 'Major change',
}
const priorityByLevel: Record<VersionLevel, RequestPriority> = { Low: 'Low', Medium: 'Medium', High: 'High' }

function fallbackCatalogItem(request: SoftwareRequest): SoftwareCatalogItem {
  return {
    softwareControlNo: request.softwareControlNo ?? '',
    softwareName: request.title,
    product: request.category,
    process: request.process ?? '',
    currentVersion: request.version ?? '1.0.0',
    status: 'Active',
  }
}

export function ReviseProgramModal({ mode = 'create', request, requests, initialControlNo, onClose, onBack, onSave, onSubmitRequest }: ReviseProgramModalProps) {
  const isCreate = mode === 'create'
  const readOnly = mode === 'view'
  const isVerifiedFromCheck = isCreate && Boolean(initialControlNo)
  const isControlNoLocked = readOnly || !isCreate || isVerifiedFromCheck
  const startingControlNo = request?.softwareControlNo ?? initialControlNo ?? ''
  const initialCatalog = request ? findSoftwareByControlNo(startingControlNo) ?? fallbackCatalogItem(request) : findSoftwareByControlNo(startingControlNo)
  const [controlNo, setControlNo] = useState(startingControlNo)
  const [catalogItem, setCatalogItem] = useState<SoftwareCatalogItem | undefined>(initialCatalog)
  const [level, setLevel] = useState<VersionLevel>(request?.versionLevel ?? 'Medium')
  const [requestType, setRequestType] = useState<SoftwareRequestType>(request?.requestType ?? 'General')
  const [description, setDescription] = useState(request?.description ?? '')
  const [error, setError] = useState('')

  const newVersion = useMemo(
    () => catalogItem ? getNextVersion(catalogItem.currentVersion, level) : '',
    [catalogItem, level]
  )
  const openRequests = useMemo(
    () => catalogItem ? findOpenRequestsByControlNo(requests, catalogItem.softwareControlNo, request?.id) : [],
    [catalogItem, request?.id, requests]
  )
  const isBlockedByOpenRequest = openRequests.length > 0
  const fieldsDisabled = readOnly || isBlockedByOpenRequest

  const search = () => {
    if (!controlNo.trim()) {
      setError('กรุณากรอก Software Control No. ก่อนค้นหา')
      setCatalogItem(undefined)
      return
    }

    const foundSoftware = findSoftwareByControlNo(controlNo)
    setCatalogItem(foundSoftware)
    setError(foundSoftware ? '' : 'ไม่พบ Software Control No. นี้ในทะเบียนโปรแกรม')
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!catalogItem) {
      setError('กรุณาค้นหาและเลือกโปรแกรมที่มีอยู่ก่อนสร้างคำขอ')
      return
    }
    onSave({
      title: catalogItem.softwareName,
      category: catalogItem.product,
      priority: requestType === 'Trouble Report/Customer Claim' ? 'Urgent' : priorityByLevel[level],
      description: description.trim(),
      requestType,
      process: catalogItem.process,
      softwareControlNo: catalogItem.softwareControlNo,
      versionLevel: level,
      version: newVersion,
      requestKind: 'Revise',
    })
  }

  const title = isCreate ? 'Revise Program Request' : mode === 'edit' ? `Edit Revise Program · ${request?.requestNo}` : `View Revise Program · ${request?.requestNo}`

  return (
    <RequestDialog
      title={title}
      onClose={onClose}
      maxWidthClassName='max-w-3xl'
      footer={
        <>
          {isCreate && onBack && <Button type='button' variant='ghost' onClick={onBack}><ArrowLeft />Back to Control No. check</Button>}
          <Button type='button' variant='outline' onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
          {readOnly && (request?.status === 'Waiting Submit' || request?.status === 'Review') && onSubmitRequest && <Button type='button' onClick={onSubmitRequest}>{request.status === 'Review' ? 'Resubmit Request' : 'Submit Request'}</Button>}
          {!readOnly && <Button type='submit' form='revise-program-request' disabled={isBlockedByOpenRequest}>{isCreate ? 'Create Request' : 'Save changes'}</Button>}
        </>
      }
    >
      <form id='revise-program-request' onSubmit={submit} className='p-5'>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-medium text-slate-600'>Software Control No. <b className='text-rose-500'>*</b></span>
          <div className='flex gap-2'>
            <input autoFocus={!isControlNoLocked} disabled={isControlNoLocked} value={controlNo} onChange={event => { setControlNo(event.target.value); setCatalogItem(undefined); setError('') }} className={fieldClass} placeholder='e.g. SC-00125' />
            {isCreate && !isVerifiedFromCheck && <Button type='button' onClick={search}><Search />Search</Button>}
          </div>
        </label>
        {catalogItem && (
          <>
            {isBlockedByOpenRequest && <div role='alert' className='mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 font-medium text-amber-800'><CircleAlert className='mt-0.5 size-4 shrink-0' /><span>โปรแกรมนี้มีคำขอที่กำลังดำเนินการ: {openRequests.map(item => `${item.requestNo} (${item.status})`).join(', ')} จึงยังไม่สามารถสร้างคำขอ Revise เพิ่มได้</span></div>}
            <dl className='mt-3 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 text-sm sm:grid-cols-3'>
              <div className='bg-white p-3'><dt className='text-xs text-slate-500'>Software Name</dt><dd className='mt-1 font-medium text-slate-800'>{catalogItem.softwareName}</dd></div>
              <div className='bg-white p-3'><dt className='text-xs text-slate-500'>Product / Process</dt><dd className='mt-1 font-medium text-slate-800'>{catalogItem.product} / {catalogItem.process}</dd></div>
              <div className='bg-white p-3'><dt className='text-xs text-slate-500'>Current Version</dt><dd className='mt-1 font-medium text-slate-800'>{catalogItem.currentVersion}</dd></div>
            </dl>
            <fieldset className='mt-5' disabled={fieldsDisabled}>
              <legend className='mb-2 text-xs font-medium text-slate-600'>Version Level <b className='text-rose-500'>*</b></legend>
              <div className='grid gap-2 sm:grid-cols-3'>
                {(Object.keys(levelLabels) as VersionLevel[]).map(option => (
                  <label key={option} className={`rounded-lg border p-3 transition ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${level === option ? 'border-[var(--app-primary)] bg-[color-mix(in_srgb,var(--app-primary)_6%,white)] ring-1 ring-[var(--app-primary)]' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type='radio' name='version-level' value={option} checked={level === option} onChange={() => setLevel(option)} className='sr-only' />
                    <span className='text-sm font-semibold text-slate-800'>{option}</span>
                    <span className='mt-1 block text-xs text-slate-500'>{levelLabels[option]}: {catalogItem.currentVersion} → {getNextVersion(catalogItem.currentVersion, option)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className='mt-4 grid gap-4 sm:grid-cols-2'>
              <label className='block'><span className='mb-1.5 block text-xs font-medium text-slate-600'>New Version</span><input readOnly value={newVersion} className={`${fieldClass} bg-slate-50 text-slate-500`} /></label>
              <label className='block'><span className='mb-1.5 block text-xs font-medium text-slate-600'>Request Type</span><select disabled={fieldsDisabled} value={requestType} onChange={event => setRequestType(event.target.value as SoftwareRequestType)} className={fieldClass}>{requestTypeOptions.map(option => <option key={option}>{option}</option>)}</select></label>
            </div>
            {requestType === 'Trouble Report/Customer Claim' && <div role='alert' className='mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'><CircleAlert className='size-4 shrink-0' />Customer Claim เป็นงานเร่งด่วน ระบบจะกำหนด Priority เป็น Urgent อัตโนมัติ</div>}
            <label className='mt-4 block'><span className='mb-1.5 block text-xs font-medium text-slate-600'>Description</span><textarea disabled={fieldsDisabled} value={description} onChange={event => setDescription(event.target.value)} className='min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500' placeholder='Describe the requested change...' /></label>
            {readOnly && request && <RequestFilePath request={request} />}
          </>
        )}
        {error && <div role='alert' className='mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-5 font-medium text-rose-700'><CircleAlert className='mt-0.5 size-4 shrink-0' /><span>{error}</span></div>}
      </form>
    </RequestDialog>
  )
}
