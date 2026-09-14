import { useState } from 'react'
import { CheckCircle2, CircleAlert, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { findSoftwareByControlNo } from '@/_workspace/data/request-software/mockSoftwareCatalog'
import { findOpenRequestsByControlNo } from '../request-conflicts'
import type { SoftwareRequest } from '../types'

import { RequestDialog } from './RequestDialog'

type CheckResult =
  | { type: 'new'; controlNo: string }
  | { type: 'revise'; controlNo: string; softwareName: string }
  | { type: 'blocked'; controlNo: string; requests: SoftwareRequest[] }
  | null

type SoftwareControlCheckDialogProps = {
  requests: SoftwareRequest[]
  onClose: () => void
  onStartNew: (controlNo: string) => void
  onStartRevise: (controlNo: string) => void
}

export function SoftwareControlCheckDialog({ requests, onClose, onStartNew, onStartRevise }: SoftwareControlCheckDialogProps) {
  const [controlNo, setControlNo] = useState('')
  const [result, setResult] = useState<CheckResult>(null)
  const [error, setError] = useState('')

  const check = () => {
    if (!controlNo.trim()) {
      setError('กรุณากรอก Software Control No. ก่อนตรวจสอบ')
      setResult(null)
      return
    }

    const openRequests = findOpenRequestsByControlNo(requests, controlNo)
    if (openRequests.length > 0) {
      setResult({ type: 'blocked', controlNo: controlNo.trim(), requests: openRequests })
      setError('')
      return
    }

    const existingSoftware = findSoftwareByControlNo(controlNo)
    setResult(existingSoftware
      ? { type: 'revise', controlNo: existingSoftware.softwareControlNo, softwareName: existingSoftware.softwareName }
      : { type: 'new', controlNo: controlNo.trim() })
    setError('')
  }

  return (
    <RequestDialog title='สร้างคำขอโปรแกรม' onClose={onClose} maxWidthClassName='max-w-xl' footer={<Button type='button' variant='outline' onClick={onClose}>ยกเลิก</Button>}>
      <div className='space-y-4 p-5'>
        <div>
          <p className='text-sm font-semibold text-[var(--app-primary)]'>ตรวจสอบ Software Control No.</p>
          <p className='mt-1 text-sm text-slate-500'>ระบบจะตรวจสอบทะเบียนโปรแกรมและคำขอที่ยังดำเนินการอยู่พร้อมกัน</p>
        </div>
        <label className='block'>
          <span className='mb-1.5 block text-xs font-medium text-slate-600'>Software Control No. <b className='text-rose-500'>*</b></span>
          <div className='flex gap-2'>
            <input autoFocus value={controlNo} onChange={event => { setControlNo(event.target.value); setResult(null); setError('') }} onKeyDown={event => { if (event.key === 'Enter') check() }} placeholder='e.g. SC-00125' className='h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--app-primary)_15%,transparent)]' />
            <Button type='button' onClick={check}><Search />ตรวจสอบ</Button>
          </div>
        </label>
        {error && <div role='alert' className='flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700'><CircleAlert className='mt-1 size-4 shrink-0' /><span>{error}</span></div>}
        {result?.type === 'blocked' && <div role='alert' className='flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800'><CircleAlert className='mt-0.5 size-4 shrink-0' /><span>โปรแกรมนี้มีคำขอที่ยังดำเนินการอยู่: <b>{result.requests.map(item => `${item.requestNo} (${item.status})`).join(', ')}</b> กรุณารอให้คำขอดังกล่าวเสร็จสิ้นก่อนสร้างคำขอใหม่</span></div>}
        {result?.type === 'revise' && <div className='flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800'><CheckCircle2 className='size-4 shrink-0' /><span>พบ <b>{result.softwareName}</b> ในทะเบียนโปรแกรม</span><Button type='button' size='sm' onClick={() => onStartRevise(result.controlNo)} className='ml-auto'>สร้างคำขอแก้ไข</Button></div>}
        {result?.type === 'new' && <div className='flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800'><CheckCircle2 className='size-4 shrink-0' /><span>ไม่พบโปรแกรมหรือคำขอที่กำลังดำเนินการสำหรับ Control No. นี้</span><Button type='button' size='sm' onClick={() => onStartNew(result.controlNo)} className='ml-auto'>สร้างโปรแกรมใหม่</Button></div>}
        <p className='rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500'>ข้อมูลสำหรับทดสอบ: <b>SC-00331</b> มีคำขอที่กำลังดำเนินการ, <b>SC-00999</b> สำหรับ Revise และ <b>SC-10001</b> สำหรับ New</p>
      </div>
    </RequestDialog>
  )
}
