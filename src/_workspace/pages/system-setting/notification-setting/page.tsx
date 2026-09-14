import { useMemo, useState } from 'react'
import { BellRing, Clock3, Mail, Play, Plus, Save, X } from 'lucide-react'

import { getUpcomingReminderCandidates, loadMockEmailLog, loadNotificationSettings, runMockTargetReminderCycle, saveNotificationSettings, type MockEmailNotification, type NotificationSettings } from '@/_workspace/data/notification-settings'
import { loadMockRequests } from '@/_workspace/data/request-software/requestStore'
import { Button } from '@/components/ui/button'

const presetDays = [10, 7, 5]

export default function NotificationSettingPage() {
  const requests = useMemo(() => loadMockRequests(), [])
  const [settings, setSettings] = useState<NotificationSettings>(loadNotificationSettings)
  const [log, setLog] = useState<MockEmailNotification[]>(loadMockEmailLog)
  const [message, setMessage] = useState('')
  const [customDay, setCustomDay] = useState('')
  const candidates = getUpcomingReminderCandidates(requests, settings)
  const customDays = settings.reminderDays.filter(day => !presetDays.includes(day))

  const toggleDay = (day: number) => setSettings(current => ({ ...current, reminderDays: current.reminderDays.includes(day) ? current.reminderDays.filter(value => value !== day) : [...current.reminderDays, day].sort((left, right) => right - left) }))
  const addCustomDay = () => {
    const day = Number(customDay)
    if (!Number.isInteger(day) || day < 1 || day > 365) return setMessage('กรุณากรอกจำนวนวันเป็นเลขจำนวนเต็มตั้งแต่ 1 ถึง 365 วัน')
    if (settings.reminderDays.includes(day)) return setMessage(`มีการตั้งค่าแจ้งเตือนล่วงหน้า ${day} วันแล้ว`)
    setSettings(current => ({ ...current, reminderDays: [...current.reminderDays, day].sort((left, right) => right - left) }))
    setCustomDay('')
    setMessage('')
  }
  const save = () => {
    if (!settings.reminderDays.length) return setMessage('กรุณาเลือกวันแจ้งเตือนอย่างน้อย 1 รายการ')
    if (!settings.notifyAssignee && !settings.notifyRequestOwner) return setMessage('กรุณาเลือกผู้รับการแจ้งเตือนอย่างน้อย 1 กลุ่ม')
    saveNotificationSettings(settings)
    setMessage('บันทึกการตั้งค่าการแจ้งเตือนเรียบร้อยแล้ว')
  }
  const runNow = () => {
    saveNotificationSettings(settings)
    const result = runMockTargetReminderCycle(requests, settings)
    setLog(result.log)
    setMessage(result.notifications.length ? `สร้างอีเมลแจ้งเตือนจำลอง ${result.notifications.length} รายการแล้ว` : 'วันนี้ไม่มีรายการที่ต้องแจ้งเตือน หรือรายการนี้เคยส่งแล้ว')
  }

  return <section className='page-container space-y-5'>
    {message && <div className='rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'>{message}</div>}
    <div className='grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]'>
      <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex items-center gap-3'><span className='flex size-10 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]'><BellRing className='size-5' /></span><div><h2 className='font-semibold text-slate-900'>Target Date reminder</h2><p className='text-xs text-slate-500'>Mock scheduler configuration</p></div></div>
        <label className='mt-5 flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-700'><span><b>Enable reminders</b><span className='mt-0.5 block text-xs font-normal text-slate-400'>Only In Progress work is evaluated.</span></span><input type='checkbox' checked={settings.enabled} onChange={event => setSettings({ ...settings, enabled: event.target.checked })} className='size-5 accent-[var(--app-primary)]' /></label>
        <div className='mt-5'><p className='text-sm font-semibold text-slate-800'>Send before Target Date</p><div className='mt-2 grid grid-cols-3 gap-2'>{presetDays.map(day => <button type='button' key={day} onClick={() => toggleDay(day)} className={`rounded-xl border px-3 py-3 text-center transition ${settings.reminderDays.includes(day) ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]' : 'border-slate-200 text-slate-500'}`}><b className='block text-xl'>{day}</b><span className='text-[10px]'>days before</span></button>)}</div></div>
        <div className='mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3'>
          <p className='text-sm font-semibold text-slate-800'>Custom reminder</p>
          <p className='mt-0.5 text-xs text-slate-400'>Add another number of days before Target Date, from 1 to 365 days.</p>
          <div className='mt-3 flex gap-2'>
            <label className='relative min-w-0 flex-1'><input type='number' min='1' max='365' step='1' value={customDay} onChange={event => { setCustomDay(event.target.value); setMessage('') }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addCustomDay() } }} placeholder='e.g. 14' aria-label='Custom reminder days before Target Date' className='h-10 w-full rounded-lg border border-slate-200 bg-white pr-14 pl-3 text-sm outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' /><span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400'>days</span></label>
            <Button type='button' variant='outline' onClick={addCustomDay}><Plus />Add</Button>
          </div>
          <div className='mt-3 flex min-h-7 flex-wrap gap-2'>
            {customDays.length ? customDays.map(day => <span key={day} className='inline-flex items-center gap-1 rounded-full border border-[var(--app-primary)] bg-white py-1 pr-1 pl-2.5 text-xs font-semibold text-[var(--app-primary)]'>{day} days before<button type='button' onClick={() => toggleDay(day)} aria-label={`Remove ${day} day reminder`} className='rounded-full p-0.5 hover:bg-[var(--app-primary-soft)]'><X className='size-3.5' /></button></span>) : <span className='text-xs text-slate-400'>No custom reminder days added.</span>}
          </div>
        </div>
        <div className='mt-5'><p className='text-sm font-semibold text-slate-800'>Recipients</p><label className='mt-2 flex items-center gap-2 text-sm text-slate-700'><input type='checkbox' checked={settings.notifyAssignee} onChange={event => setSettings({ ...settings, notifyAssignee: event.target.checked })} className='size-4 accent-[var(--app-primary)]' />Assigned Programmer</label><label className='mt-2 flex items-center gap-2 text-sm text-slate-700'><input type='checkbox' checked={settings.notifyRequestOwner} onChange={event => setSettings({ ...settings, notifyRequestOwner: event.target.checked })} className='size-4 accent-[var(--app-primary)]' />Current Request Owner</label></div>
        <div className='mt-6 flex flex-wrap gap-2'><Button type='button' onClick={save}><Save />Save settings</Button><Button type='button' variant='outline' onClick={runNow} className='border-[var(--app-primary)] text-[var(--app-primary)]'><Play />Run mock reminder</Button></div>
      </section>
      <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'><div className='flex items-center justify-between gap-3'><div><h2 className='font-semibold text-slate-900'>Due reminder preview</h2><p className='mt-1 text-xs text-slate-500'>Requests matching today and the selected reminder days.</p></div><span className='rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--app-primary)]'>{candidates.length} due</span></div><div className='mt-4 space-y-2'>{candidates.length ? candidates.map(candidate => <div key={candidate.eventKey} className='rounded-xl border border-slate-200 p-3'><div className='flex flex-wrap items-center justify-between gap-2'><b className='text-sm text-[var(--app-primary)]'>{candidate.request.requestNo}</b><span className='rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700'>{candidate.daysBefore} days before</span></div><p className='mt-1 text-sm font-medium text-slate-800'>{candidate.request.title}</p><p className='mt-1 text-xs text-slate-500'>Target: {candidate.request.targetDate} · To: {candidate.recipients.join(', ')}</p></div>) : <Empty message='No reminder matches today.' />}</div></section>
    </div>
    <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'><div className='flex items-center justify-between gap-3'><div className='flex items-center gap-2'><Mail className='size-5 text-[var(--app-primary)]' /><div><h2 className='font-semibold text-slate-900'>Mock email log</h2><p className='text-xs text-slate-500'>Each Request/Target Date/reminder day is sent only once.</p></div></div><span className='text-xs text-slate-400'>{log.length} records</span></div>{log.length ? <div className='mt-4 overflow-x-auto'><table className='w-full min-w-[850px] text-left text-sm'><thead><tr className='border-b border-slate-200 text-xs text-slate-500'><th className='pb-2 font-medium'>Sent at</th><th className='pb-2 font-medium'>Request</th><th className='pb-2 font-medium'>Subject</th><th className='pb-2 font-medium'>Recipients</th></tr></thead><tbody>{log.map(item => <tr key={item.id} className='border-b border-slate-100 last:border-0'><td className='py-3 text-xs text-slate-500'><Clock3 className='mr-1 inline size-3.5' />{new Date(item.sentAt).toLocaleString('en-GB')}</td><td className='py-3 font-semibold text-[var(--app-primary)]'>{item.requestNo}</td><td className='py-3 text-slate-700'>{item.subject}</td><td className='py-3 text-xs text-slate-500'>{item.recipients.join(', ')}</td></tr>)}</tbody></table></div> : <div className='mt-4'><Empty message='No mock reminder email has been generated.' /></div>}</section>
  </section>
}

function Empty({ message }: { message: string }) {
  return <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400'>{message}</div>
}
