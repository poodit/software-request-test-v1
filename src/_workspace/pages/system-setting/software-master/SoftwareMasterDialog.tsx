import { useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'

import type { SoftwareCatalogItem } from '@/_workspace/data/request-software/mockSoftwareCatalog'
import { RequestDialog } from '@/_workspace/pages/request-software/modal/RequestDialog'
import { Button } from '@/components/ui/button'

export function SoftwareMasterDialog({ item, items, onClose, onSave }: { item?: SoftwareCatalogItem; items: SoftwareCatalogItem[]; onClose: () => void; onSave: (item: SoftwareCatalogItem, originalControlNo?: string) => void }) {
  const [softwareControlNo, setSoftwareControlNo] = useState(item?.softwareControlNo ?? '')
  const [softwareName, setSoftwareName] = useState(item?.softwareName ?? '')
  const [product, setProduct] = useState(item?.product ?? '')
  const [process, setProcess] = useState(item?.process ?? '')
  const [currentVersion, setCurrentVersion] = useState(item?.currentVersion ?? '1.0.0')
  const [status, setStatus] = useState<SoftwareCatalogItem['status']>(item?.status ?? 'Active')
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedControlNo = softwareControlNo.trim().toUpperCase()
    if (!normalizedControlNo || !softwareName.trim() || !product || !process || !currentVersion.trim()) return setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน')
    if (!/^\d+\.\d+\.\d+$/.test(currentVersion.trim())) return setError('Version ต้องอยู่ในรูปแบบ Major.Minor.Patch เช่น 1.0.0')
    if (items.some(existing => existing.softwareControlNo.toLowerCase() === normalizedControlNo.toLowerCase() && existing.softwareControlNo !== item?.softwareControlNo)) return setError('Software Control No. นี้มีอยู่ในระบบแล้ว')
    onSave({ softwareControlNo: normalizedControlNo, softwareName: softwareName.trim(), product, process, currentVersion: currentVersion.trim(), status }, item?.softwareControlNo)
  }

  return <RequestDialog title={item ? 'Edit Software Master' : 'Add Software Master'} onClose={onClose} maxWidthClassName='max-w-2xl' footer={<><Button type='button' variant='outline' onClick={onClose}>Cancel</Button><Button type='submit' form='software-master-form'><Save />{item ? 'Save changes' : 'Add software'}</Button></>}>
    <form id='software-master-form' onSubmit={submit} className='space-y-4 p-5'>
      <div className='rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary-soft)] p-4 text-sm text-slate-700'><b className='text-[var(--app-primary)]'>Editable master data</b><p className='mt-1 text-xs leading-5'>Changes are stored in Mock LocalStorage and are used immediately by New and Revise Request validation.</p></div>
      <div className='grid gap-4 sm:grid-cols-2'><Field label='Software Control No.' required><input value={softwareControlNo} onChange={event => { setSoftwareControlNo(event.target.value); setError('') }} placeholder='SC-00000' className={fieldClass} /></Field><Field label='Current Version' required><input value={currentVersion} onChange={event => { setCurrentVersion(event.target.value); setError('') }} placeholder='1.0.0' className={fieldClass} /></Field></div>
      <Field label='Software Name' required><input value={softwareName} onChange={event => { setSoftwareName(event.target.value); setError('') }} placeholder='Enter software name' className={fieldClass} /></Field>
      <div className='grid gap-4 sm:grid-cols-2'><Field label='Product' required><select value={product} onChange={event => { setProduct(event.target.value); setError('') }} className={fieldClass}><option value=''>Select product</option><option>980</option><option>990</option><option>Smart Factory</option></select></Field><Field label='Process' required><select value={process} onChange={event => { setProcess(event.target.value); setError('') }} className={fieldClass}><option value=''>Select process</option><option>Check Flow</option><option>Approval Flow</option><option>Production Flow</option></select></Field></div>
      <Field label='Status' required><select value={status} onChange={event => setStatus(event.target.value as SoftwareCatalogItem['status'])} className={fieldClass}><option>Active</option><option>Inactive</option></select></Field>
      {error && <p role='alert' className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700'>{error}</p>}
    </form>
  </RequestDialog>
}

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className='block'><span className='mb-1.5 block text-xs font-medium text-slate-600'>{label}{required && <b className='ml-1 text-rose-500'>*</b>}</span>{children}</label>
}

const fieldClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]'
