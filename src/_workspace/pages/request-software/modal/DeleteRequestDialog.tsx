import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { SoftwareRequest } from '../types'

import { RequestDialog } from './RequestDialog'

export function DeleteRequestDialog({ request, onClose, onConfirm }: { request: SoftwareRequest; onClose: () => void; onConfirm: () => void }) {
  return (
    <RequestDialog title='Delete request?' onClose={onClose} maxWidthClassName='max-w-md' footer={<><Button type='button' variant='outline' onClick={onClose}>Cancel</Button><Button type='button' variant='destructive' onClick={onConfirm}><Trash2 />Delete</Button></>}>
      <div className='p-5 text-sm leading-6 text-slate-600'>Delete <b className='text-slate-900'>{request.requestNo}</b>? This removes it from the local mock request list.</div>
    </RequestDialog>
  )
}
