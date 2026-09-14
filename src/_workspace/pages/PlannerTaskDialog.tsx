import { useMemo, useState } from 'react'
import { Check, CircleUserRound, Clock3, Download, File, FileImage, Link2, MessageSquareText, Paperclip, Plus, Trash2, Upload } from 'lucide-react'

import { mockCurrentUser, mockPeople } from '@/_workspace/data/mock-people'
import type { SoftwareRequest } from '@/_workspace/pages/request-software/types'
import { RequestDialog } from '@/_workspace/pages/request-software/modal/RequestDialog'
import { Button } from '@/components/ui/button'

import type { PlannerAttachment, PlannerChecklistItem, PlannerComment, PlannerTask, PlannerTaskPriority, PlannerTaskStatus, PlannerTaskType } from './planner-types'

type ContentTab = 'details' | 'attachments'
type DiscussionTab = 'comments' | 'activity'
type MobileTab = ContentTab | DiscussionTab

export function PlannerTaskDialog({ task, requests, onClose, onSave }: { task?: PlannerTask; requests: SoftwareRequest[]; onClose: () => void; onSave: (task: PlannerTask) => void }) {
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const [defaultDueDate] = useState(() => { const date = new Date(); date.setDate(date.getDate() + 7); return date.toISOString().slice(0, 10) })
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [type, setType] = useState<PlannerTaskType>(task?.type ?? 'Project')
  const [plan, setPlan] = useState(task?.plan ?? 'Software Delivery')
  const [status, setStatus] = useState<PlannerTaskStatus>(task?.status ?? 'Not Started')
  const [priority, setPriority] = useState<PlannerTaskPriority>(task?.priority ?? 'Medium')
  const [assignee, setAssignee] = useState(task?.assignee ?? mockCurrentUser.name)
  const [startDate, setStartDate] = useState(task?.startDate ?? today)
  const [dueDate, setDueDate] = useState(task?.dueDate ?? defaultDueDate)
  const [estimateHours, setEstimateHours] = useState(task?.estimateHours?.toString() ?? '')
  const [linkedRequestId, setLinkedRequestId] = useState(task?.linkedRequestId?.toString() ?? '')
  const [labels, setLabels] = useState(task?.labels.join(', ') ?? '')
  const [checklist, setChecklist] = useState<PlannerChecklistItem[]>(task?.checklist ?? [])
  const [comments, setComments] = useState<PlannerComment[]>(task?.comments ?? [])
  const [attachments, setAttachments] = useState<PlannerAttachment[]>(task?.attachments ?? [])
  const [newChecklist, setNewChecklist] = useState('')
  const [newComment, setNewComment] = useState('')
  const [contentTab, setContentTab] = useState<ContentTab>('details')
  const [discussionTab, setDiscussionTab] = useState<DiscussionTab>('comments')
  const [mobileTab, setMobileTab] = useState<MobileTab>('details')
  const [error, setError] = useState('')
  const [attachmentError, setAttachmentError] = useState('')

  const linkedRequest = useMemo(() => requests.find(request => request.id === Number(linkedRequestId)), [linkedRequestId, requests])

  const addChecklist = () => {
    const value = newChecklist.trim()
    if (!value) return
    setChecklist(items => [...items, { id: `check-${Date.now()}`, title: value, completed: false }])
    setNewChecklist('')
  }

  const addComment = () => {
    const value = newComment.trim()
    if (!value) return
    setComments(items => [...items, { id: `comment-${Date.now()}`, author: mockCurrentUser.name, message: value, createdAt: new Date().toISOString() }])
    setNewComment('')
  }

  const addAttachments = (files: FileList | null) => {
    if (!files?.length) return
    setAttachmentError('')
    const availableSlots = Math.max(0, 6 - attachments.length)
    const selectedFiles = Array.from(files).slice(0, availableSlots)
    let remainingBytes = 2 * 1024 * 1024 - attachments.reduce((sum, item) => sum + item.size, 0)
    if (availableSlots === 0) return setAttachmentError('แนบไฟล์ได้สูงสุด 6 ไฟล์ต่อ Task')

    selectedFiles.forEach(file => {
      if (file.size > 750 * 1024) {
        setAttachmentError(`${file.name} มีขนาดเกิน 750 KB ซึ่งเป็นขีดจำกัดของ Mock`)
        return
      }
      if (file.size > remainingBytes) {
        setAttachmentError('ไฟล์แนบทั้งหมดมีขนาดรวมได้ไม่เกิน 2 MB ใน Mock นี้')
        return
      }
      remainingBytes -= file.size
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result !== 'string') return
        setAttachments(items => [...items, { id: `attachment-${Date.now()}-${file.name}`, name: file.name, type: file.type || 'application/octet-stream', size: file.size, dataUrl: reader.result as string, uploadedBy: mockCurrentUser.name, uploadedAt: new Date().toISOString() }])
      }
      reader.readAsDataURL(file)
    })
  }

  const submit = () => {
    if (!title.trim()) return setError('กรุณาระบุชื่องาน')
    if (!assignee) return setError('กรุณาเลือกผู้รับผิดชอบ')
    if (!startDate || !dueDate) return setError('กรุณาระบุ Start Date และ Due Date')
    if (new Date(`${dueDate}T12:00:00`) < new Date(`${startDate}T12:00:00`)) return setError('Due Date ต้องไม่อยู่ก่อน Start Date')

    const now = new Date().toISOString()
    const changes: string[] = []
    if (task && task.status !== status) changes.push(`changed status from ${task.status} to ${status}`)
    if (task && task.assignee !== assignee) changes.push(`reassigned task from ${task.assignee} to ${assignee}`)
    if (task && task.priority !== priority) changes.push(`changed priority from ${task.priority} to ${priority}`)
    if (task && task.startDate !== startDate) changes.push(`changed Start Date to ${formatDate(startDate)}`)
    if (task && task.dueDate !== dueDate) changes.push(`changed Due Date to ${formatDate(dueDate)}`)
    if (task && task.linkedRequestId !== (linkedRequestId ? Number(linkedRequestId) : undefined)) changes.push(linkedRequestId ? `linked task to ${linkedRequest?.requestNo ?? 'a Software Request'}` : 'removed the Software Request link')
    if (task && task.checklist.filter(item => item.completed).length !== checklist.filter(item => item.completed).length) changes.push(`updated checklist progress to ${checklist.filter(item => item.completed).length}/${checklist.length}`)
    if (task && comments.length > task.comments.length) changes.push(`added ${comments.length - task.comments.length} comment${comments.length - task.comments.length > 1 ? 's' : ''}`)
    if (task && attachments.length > (task.attachments?.length ?? 0)) changes.push(`added ${attachments.length - (task.attachments?.length ?? 0)} attachment${attachments.length - (task.attachments?.length ?? 0) > 1 ? 's' : ''}`)
    if (task && attachments.length < (task.attachments?.length ?? 0)) changes.push(`removed ${(task.attachments?.length ?? 0) - attachments.length} attachment${(task.attachments?.length ?? 0) - attachments.length > 1 ? 's' : ''}`)
    if (task && changes.length === 0) changes.push('updated task details')

    const activity = task
      ? [...task.activity, ...changes.map((action, index) => ({ id: `activity-${Date.now()}-${index}`, person: mockCurrentUser.name, action, createdAt: now }))]
      : [{ id: `activity-${Date.now()}`, person: mockCurrentUser.name, action: assignee === mockCurrentUser.name ? 'created this task' : `created and assigned this task to ${assignee}`, createdAt: now }]

    onSave({
      id: task?.id ?? `PLN-${Date.now()}`,
      title: title.trim(), description: description.trim(), type, plan, status, priority, assignee,
      createdBy: task?.createdBy ?? mockCurrentUser.name,
      startDate, dueDate,
      estimateHours: estimateHours ? Number(estimateHours) : undefined,
      linkedRequestId: linkedRequestId ? Number(linkedRequestId) : undefined,
      labels: labels.split(',').map(item => item.trim()).filter(Boolean), checklist, comments, attachments,
      activity,
      createdAt: task?.createdAt ?? now, updatedAt: now,
      completedAt: status === 'Completed' ? task?.completedAt ?? now : undefined,
    })
  }

  return (
    <RequestDialog title={task ? 'Task Detail' : 'Create Task'} onClose={onClose} maxWidthClassName='max-w-5xl' scrollContent footer={<><Button type='button' variant='outline' onClick={onClose}>Cancel</Button><Button type='button' onClick={submit}><Check />{task ? 'Save changes' : 'Create task'}</Button></>}>
      <div className='grid min-h-[560px] lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]'>
        <div className='border-b border-slate-200 p-5 lg:border-r lg:border-b-0'>
          <div className='mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 lg:hidden'>
            {(['details', 'attachments', 'comments', 'activity'] as MobileTab[]).map(item => <TabButton key={item} active={mobileTab === item} onClick={() => setMobileTab(item)}>{item === 'comments' ? `Chat (${comments.length})` : item}</TabButton>)}
          </div>
          <div className='mb-5 hidden w-fit gap-1 rounded-lg bg-slate-100 p-1 lg:flex'>
            <TabButton active={contentTab === 'details'} onClick={() => setContentTab('details')}>Task details</TabButton>
            <TabButton active={contentTab === 'attachments'} onClick={() => setContentTab('attachments')}><span className='flex items-center justify-center gap-1.5'><Paperclip className='size-3.5' />Attachments ({attachments.length})</span></TabButton>
          </div>

          <div className={`${mobileTab === 'details' ? 'space-y-5' : 'hidden'} ${contentTab === 'details' ? 'lg:block lg:space-y-5' : 'lg:hidden'}`}>
            <div>
              <label className='mb-1.5 block text-xs font-semibold text-slate-700'>Task title <span className='text-rose-500'>*</span></label>
              <input autoFocus value={title} onChange={event => setTitle(event.target.value)} placeholder='What needs to be done?' className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base font-medium text-slate-900 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' />
            </div>
            <div>
              <label className='mb-1.5 block text-xs font-semibold text-slate-700'>Description</label>
              <textarea value={description} onChange={event => setDescription(event.target.value)} rows={4} placeholder='Add requirement, expected result, links, or handover details...' className='w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]' />
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <Field label='Task type'><select value={type} onChange={event => setType(event.target.value as PlannerTaskType)} className={inputClass}><option>Project</option><option>Personal</option></select></Field>
              <Field label='Plan'><select value={plan} onChange={event => setPlan(event.target.value)} className={inputClass}><option>Software Delivery</option><option>Team Delivery</option><option>Personal Tasks</option><option>Operations</option></select></Field>
              <Field label='Status'><select value={status} onChange={event => setStatus(event.target.value as PlannerTaskStatus)} className={inputClass}><option>Not Started</option><option>In Progress</option><option>Blocked</option><option>Completed</option></select></Field>
              <Field label='Priority'><select value={priority} onChange={event => setPriority(event.target.value as PlannerTaskPriority)} className={inputClass}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></Field>
              <Field label='Assignee' required><select value={assignee} onChange={event => setAssignee(event.target.value)} className={inputClass}>{mockPeople.map(person => <option key={person.employeeCode}>{person.name}</option>)}</select></Field>
              <Field label='Estimated hours'><input type='number' min='0' value={estimateHours} onChange={event => setEstimateHours(event.target.value)} placeholder='e.g. 8' className={inputClass} /></Field>
              <Field label='Start Date' required><input type='date' value={startDate} onChange={event => setStartDate(event.target.value)} className={inputClass} /></Field>
              <Field label='Due Date' required><input type='date' value={dueDate} onChange={event => setDueDate(event.target.value)} className={inputClass} /></Field>
            </div>

            <div className='rounded-xl border border-slate-200 bg-slate-50/60 p-4'>
              <div className='mb-3 flex items-center gap-2'><Link2 className='size-4 text-[var(--app-primary)]' /><div><h3 className='text-sm font-semibold text-slate-800'>Linked Software Request</h3><p className='text-[11px] text-slate-400'>Optional for Personal tasks. Project tasks can be traced back to My Work.</p></div></div>
              <select value={linkedRequestId} onChange={event => setLinkedRequestId(event.target.value)} className={inputClass}><option value=''>No linked request</option>{requests.map(request => <option key={request.id} value={request.id}>{request.requestNo} - {request.title}</option>)}</select>
              {linkedRequest && <div className='mt-3 grid gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs sm:grid-cols-3'><div><span className='text-slate-400'>Request</span><p className='mt-0.5 font-semibold text-[var(--app-primary)]'>{linkedRequest.requestNo}</p></div><div><span className='text-slate-400'>Work status</span><p className='mt-0.5 font-medium text-slate-700'>{linkedRequest.status}</p></div><div><span className='text-slate-400'>Project Target</span><p className='mt-0.5 font-medium text-slate-700'>{linkedRequest.targetDate ? formatDate(linkedRequest.targetDate) : '-'}</p></div></div>}
              {linkedRequest?.targetDate && dueDate > linkedRequest.targetDate && <p className='mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-700'>This task ends after the Software Request Target Date ({formatDate(linkedRequest.targetDate)}). Confirm the plan or update the project target before assigning it.</p>}
            </div>

            <Field label='Labels'><input value={labels} onChange={event => setLabels(event.target.value)} placeholder='Frontend, API, Testing (separate with commas)' className={inputClass} /></Field>

            <div>
              <div className='mb-2 flex items-center justify-between'><h3 className='text-sm font-semibold text-slate-800'>Checklist</h3><span className='text-xs text-slate-400'>{checklist.filter(item => item.completed).length}/{checklist.length} completed</span></div>
              <div className='mb-2 h-1.5 overflow-hidden rounded-full bg-slate-100'><div className='h-full rounded-full bg-emerald-500 transition-all' style={{ width: `${checklist.length ? checklist.filter(item => item.completed).length / checklist.length * 100 : 0}%` }} /></div>
              <div className='space-y-2'>{checklist.map(item => <div key={item.id} className='flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2'><input type='checkbox' checked={item.completed} onChange={() => setChecklist(items => items.map(row => row.id === item.id ? { ...row, completed: !row.completed } : row))} className='size-4 accent-[var(--app-primary)]' /><span className={`flex-1 text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.title}</span><button type='button' aria-label='Remove checklist item' onClick={() => setChecklist(items => items.filter(row => row.id !== item.id))} className='rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600'><Trash2 className='size-3.5' /></button></div>)}</div>
              <div className='mt-2 flex gap-2'><input value={newChecklist} onChange={event => setNewChecklist(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addChecklist() } }} placeholder='Add checklist item...' className={`${inputClass} flex-1`} /><Button type='button' variant='outline' onClick={addChecklist}><Plus />Add</Button></div>
            </div>
            {error && <p className='rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700'>{error}</p>}
          </div>

          <div className={`${mobileTab === 'attachments' ? 'block' : 'hidden'} ${contentTab === 'attachments' ? 'lg:block' : 'lg:hidden'}`}><AttachmentsPanel attachments={attachments} error={attachmentError} onAdd={addAttachments} onRemove={id => setAttachments(items => items.filter(item => item.id !== id))} /></div>
          {mobileTab === 'comments' && <div className='lg:hidden'><CommentsPanel comments={comments} newComment={newComment} setNewComment={setNewComment} onAdd={addComment} /></div>}
          {mobileTab === 'activity' && <div className='lg:hidden'><ActivityPanel task={task} pendingChanges={getPendingActivityCount(task, comments, attachments)} /></div>}
        </div>

        <aside className='hidden bg-slate-50/60 p-5 lg:block'>
          <div className='mb-4 flex gap-1 rounded-lg bg-slate-200/70 p-1'>{(['comments', 'activity'] as DiscussionTab[]).map(item => <TabButton key={item} active={discussionTab === item} onClick={() => setDiscussionTab(item)}>{item === 'comments' ? `Task chat (${comments.length})` : 'Activity'}</TabButton>)}</div>
          {discussionTab === 'comments' ? <CommentsPanel comments={comments} newComment={newComment} setNewComment={setNewComment} onAdd={addComment} /> : <ActivityPanel task={task} pendingChanges={getPendingActivityCount(task, comments, attachments)} />}
        </aside>
      </div>
    </RequestDialog>
  )
}

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className='block'><span className='mb-1.5 block text-xs font-semibold text-slate-700'>{label}{required && <span className='text-rose-500'> *</span>}</span>{children}</label>
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type='button' onClick={onClick} className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold capitalize transition ${active ? 'bg-white text-[var(--app-primary)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{children}</button>
}

function CommentsPanel({ comments, newComment, setNewComment, onAdd }: { comments: PlannerComment[]; newComment: string; setNewComment: (value: string) => void; onAdd: () => void }) {
  return <div><div className='mb-4 flex items-center gap-2'><MessageSquareText className='size-4 text-[var(--app-primary)]' /><h3 className='text-sm font-semibold text-slate-800'>Discussion</h3></div><div className='max-h-80 space-y-3 overflow-y-auto pr-1'>{comments.length ? comments.map(comment => <div key={comment.id} className='flex gap-2.5'><span className='grid size-8 shrink-0 place-items-center rounded-full bg-[var(--app-primary-soft)] text-[10px] font-bold text-[var(--app-primary)]'>{initials(comment.author)}</span><div className='min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-3'><div className='flex items-center justify-between gap-2'><b className='truncate text-xs text-slate-800'>{comment.author}</b><time className='shrink-0 text-[10px] text-slate-400'>{formatDateTime(comment.createdAt)}</time></div><p className='mt-1.5 whitespace-pre-wrap text-xs leading-5 text-slate-600'>{comment.message}</p></div></div>) : <div className='rounded-lg border border-dashed border-slate-200 bg-white px-3 py-8 text-center text-xs text-slate-400'>No comments yet. Start the discussion here.</div>}</div><div className='mt-4 rounded-lg border border-slate-200 bg-white p-2'><textarea value={newComment} onChange={event => setNewComment(event.target.value)} rows={3} placeholder='Write a comment or progress update...' className='w-full resize-none px-1 py-1 text-xs text-slate-700 outline-none' /><div className='flex justify-end'><Button type='button' size='sm' onClick={onAdd} disabled={!newComment.trim()}><MessageSquareText />Comment</Button></div></div><p className='mt-2 text-[10px] text-slate-400'>Comments are stored with this mock task and become part of its history.</p></div>
}

function AttachmentsPanel({ attachments, error, onAdd, onRemove }: { attachments: PlannerAttachment[]; error: string; onAdd: (files: FileList | null) => void; onRemove: (id: string) => void }) {
  return <div><div className='mb-4 flex items-center gap-2'><Paperclip className='size-4 text-[var(--app-primary)]' /><div><h3 className='text-sm font-semibold text-slate-800'>Attachments</h3><p className='text-[10px] text-slate-400'>Images and small working files for this task.</p></div></div><label className='flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center transition hover:border-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]'><span className='mb-2 grid size-10 place-items-center rounded-full bg-white text-[var(--app-primary)] shadow-sm'><Upload className='size-5' /></span><b className='text-sm text-slate-700'>Choose files or images</b><span className='mt-1 text-[10px] text-slate-400'>Up to 6 files · 750 KB each · 2 MB total in this mock</span><input type='file' multiple accept='image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip' className='hidden' onChange={event => { onAdd(event.target.files); event.target.value = '' }} /></label>{error && <p className='mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700'>{error}</p>}<div className='mt-4 grid gap-3 sm:grid-cols-2'>{attachments.map(attachment => <article key={attachment.id} className='overflow-hidden rounded-xl border border-slate-200 bg-white'>{attachment.type.startsWith('image/') ? <a href={attachment.dataUrl} target='_blank' rel='noreferrer' className='block h-36 bg-slate-100'><img src={attachment.dataUrl} alt={attachment.name} className='size-full object-cover' /></a> : <div className='grid h-24 place-items-center bg-slate-50 text-slate-400'>{attachment.type.includes('pdf') ? <FileImage className='size-9' /> : <File className='size-9' />}</div>}<div className='p-3'><p title={attachment.name} className='truncate text-xs font-semibold text-slate-700'>{attachment.name}</p><p className='mt-1 text-[9px] text-slate-400'>{formatFileSize(attachment.size)} · {attachment.uploadedBy}</p><p className='text-[9px] text-slate-400'>{formatDateTime(attachment.uploadedAt)}</p><div className='mt-2 flex justify-end gap-1'><a href={attachment.dataUrl} download={attachment.name} className='grid size-7 place-items-center rounded-md text-slate-500 hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary)]' aria-label={`Download ${attachment.name}`}><Download className='size-3.5' /></a><button type='button' onClick={() => onRemove(attachment.id)} className='grid size-7 place-items-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600' aria-label={`Remove ${attachment.name}`}><Trash2 className='size-3.5' /></button></div></div></article>)}</div>{attachments.length === 0 && <p className='mt-4 rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400'>No attachments yet.</p>}<div className='mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[10px] leading-4 text-blue-700'><b>Mock behavior:</b> files are stored only in this browser. The real system should upload them to the project folder or file API and keep only the path and metadata here.</div></div>
}

function ActivityPanel({ task, pendingChanges }: { task?: PlannerTask; pendingChanges: number }) {
  if (!task) return <div className='rounded-lg border border-dashed border-slate-200 bg-white px-3 py-8 text-center text-xs text-slate-400'>Activity will appear after the task is created.</div>
  return <div><div className='mb-4 flex items-center gap-2'><Clock3 className='size-4 text-[var(--app-primary)]' /><div><h3 className='text-sm font-semibold text-slate-800'>Activity history</h3><p className='text-[10px] text-slate-400'>Recorded when the task is saved.</p></div></div>{pendingChanges > 0 && <p className='mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-medium text-amber-700'>{pendingChanges} unsaved collaboration update{pendingChanges > 1 ? 's' : ''}. Click Save changes to add them to Activity.</p>}<div className='space-y-0'>{[...task.activity].reverse().map((item, index) => <div key={item.id} className='relative flex gap-3 pb-5'><div className='relative z-10 grid size-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500'><CircleUserRound className='size-4' /></div>{index < task.activity.length - 1 && <span className='absolute top-8 left-4 h-[calc(100%-2rem)] w-px bg-slate-200' />}<div className='min-w-0 pt-0.5'><p className='text-xs leading-5 text-slate-600'><b className='text-slate-800'>{item.person}</b> {item.action}</p><time className='text-[10px] text-slate-400'>{formatDateTime(item.createdAt)}</time></div></div>)}</div></div>
}

function getPendingActivityCount(task: PlannerTask | undefined, comments: PlannerComment[], attachments: PlannerAttachment[]) { return task ? Math.max(0, comments.length - task.comments.length) + Math.abs(attachments.length - (task.attachments?.length ?? 0)) : 0 }
function formatFileSize(bytes: number) { return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(bytes < 102_400 ? 1 : 0)} KB` }
function initials(name: string) { return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() }
function formatDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
function formatDateTime(value: string) { return new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
