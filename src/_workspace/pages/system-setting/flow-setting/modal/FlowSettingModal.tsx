import { useMemo, useState, type FormEvent } from "react";
import { GitCompareArrows, Mail, Plus, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FlowSetting } from "@/_workspace/data/flow-settings";
import {
  findMockPerson,
  mockPersonNames,
  type MockPerson,
} from "@/_workspace/data/mock-people";
import { RequestDialog } from "@/_workspace/pages/request-software/modal/RequestDialog";
import type { ApprovalRouteChangeReason, SoftwareRequest } from "@/_workspace/pages/request-software/types";

import { validateFlowSetting } from "../validationSchema";
import { getFlowParticipantChanges, previewPendingFlowUpdate } from "../flow-update";

type FlowSettingModalProps = {
  mode: "create" | "view" | "edit";
  setting?: FlowSetting;
  settings: FlowSetting[];
  requests: SoftwareRequest[];
  onClose: () => void;
  onSave: (values: Omit<FlowSetting, "id">, editingId?: number, updatePending?: { apply: boolean; reason?: ApprovalRouteChangeReason }) => void;
};
const routeChangeReasons: ApprovalRouteChangeReason[] = ["Employee Resigned", "Department Transfer", "Long-term Leave", "Responsibility Change", "Flow Correction"];
const products = ["980", "990", "Smart Factory"];
const fieldClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--app-primary)_15%,transparent)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const compactPersonFieldClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--app-primary)_15%,transparent)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export function FlowSettingModal({
  mode,
  setting,
  settings,
  requests,
  onClose,
  onSave,
}: FlowSettingModalProps) {
  const readOnly = mode === "view";
  const [product, setProduct] = useState(setting?.product ?? "");
  const [checkers, setCheckers] = useState(setting?.checkers ?? []);
  const [approvers, setApprovers] = useState(setting?.approvers ?? [""]);
  const [cc, setCc] = useState(setting?.cc ?? []);
  const [active, setActive] = useState(setting?.active ?? true);
  const [applyToPending, setApplyToPending] = useState(true);
  const [routeChangeReason, setRouteChangeReason] = useState<ApprovalRouteChangeReason | "">("");
  const [error, setError] = useState("");
  const title =
    mode === "create"
      ? "Add Flow Setting"
      : mode === "edit"
        ? "Edit Flow Setting"
        : "View Flow Setting";
  const draftValues = useMemo(() => ({
    product,
    checkers: checkers.filter(Boolean),
    approvers: approvers.filter(Boolean),
    cc: cc.filter(Boolean),
    active,
  }), [active, approvers, cc, checkers, product]);
  const participantChanges = useMemo(() => setting ? getFlowParticipantChanges(setting, draftValues) : [], [draftValues, setting]);
  const pendingImpacts = useMemo(() => setting ? previewPendingFlowUpdate(requests, setting, draftValues) : [], [draftValues, requests, setting]);
  const affectedStepCount = pendingImpacts.reduce((total, impact) => total + impact.changes.length, 0);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateFlowSetting(draftValues, settings, setting?.id);
    if (validationError) return setError(validationError);
    if (applyToPending && affectedStepCount > 0 && !routeChangeReason) return setError("กรุณาระบุเหตุผลเมื่อแก้ไขขั้นตอนของคำขอที่กำลังรอดำเนินการ");
    onSave(draftValues, setting?.id, { apply: applyToPending && affectedStepCount > 0, reason: routeChangeReason || undefined });
  };

  return (
    <RequestDialog
      title={title}
      onClose={onClose}
      maxWidthClassName="max-w-5xl"
      scrollContent
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {readOnly ? "Close" : "Cancel"}
          </Button>
          {!readOnly && (
            <Button type="submit" form="flow-setting-form">
              {mode === "create" ? "Add Flow Setting" : "Save changes"}
            </Button>
          )}
        </>
      }
    >
      <form id="flow-setting-form" onSubmit={submit} className="space-y-5 p-5">
        <label className="block max-w-sm">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
            Product <b className="text-rose-500">*</b>
          </span>
          <select
            disabled={readOnly}
            value={product}
            onChange={(event) => setProduct(event.target.value)}
            className={fieldClass}
          >
            <option value="">Select product</option>
            {products.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <div className="border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--app-primary)]">
                Approval workflow
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Add or remove people for each approval role.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {checkers.length + approvers.length + cc.length} people
            </span>
          </div>
          <div className="space-y-3">
            <PeopleEditor
              label="Checker"
              description="Optional review before approval"
              people={checkers}
              onChange={setCheckers}
              readOnly={readOnly}
            />
            <PeopleEditor
              label="Approver"
              description="At least one approver is required"
              people={approvers}
              onChange={setApprovers}
              required
              readOnly={readOnly}
            />
            <PeopleEditor
              label="CC"
              description="Optional notification recipients"
              people={cc}
              onChange={setCc}
              readOnly={readOnly}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            disabled={readOnly}
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="size-4 accent-[var(--app-primary)]"
          />
          Active Flow Setting
        </label>
        {mode === "edit" && participantChanges.length > 0 && (
          <section className="rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary-soft)] p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--app-primary)]"><GitCompareArrows className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">Apply Flow changes to pending requests</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">Only pending Checker/Approver steps in Waiting Approve requests are replaced. Completed actions and their original people remain unchanged. A duplicate pending step is removed when the replacement is already in the same role.</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {participantChanges.map(change => <span key={`${change.role}-${change.from}-${change.to}`} className="rounded-full border border-[var(--app-primary)] bg-white px-2.5 py-1 text-xs text-slate-700"><b>{change.role}:</b> {change.from} → {change.to}</span>)}
            </div>
            <label className="mt-4 flex items-start gap-2 rounded-lg border border-white/80 bg-white/70 p-3 text-sm text-slate-700">
              <input type="checkbox" checked={applyToPending} onChange={event => { setApplyToPending(event.target.checked); setError(""); }} className="mt-0.5 size-4 accent-[var(--app-primary)]" />
              <span><b>Update {affectedStepCount} pending step{affectedStepCount === 1 ? "" : "s"} in {pendingImpacts.length} request{pendingImpacts.length === 1 ? "" : "s"}</b><span className="mt-0.5 block text-xs text-slate-500">Current and future pending steps are included. Status remains Waiting Approve unless no pending step remains.</span></span>
            </label>
            {applyToPending && affectedStepCount > 0 && (
              <label className="mt-3 block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700">Change reason <b className="text-rose-500">*</b></span>
                <select value={routeChangeReason} onChange={event => { setRouteChangeReason(event.target.value as ApprovalRouteChangeReason); setError(""); }} className={fieldClass}>
                  <option value="">Select reason</option>
                  {routeChangeReasons.map(reason => <option key={reason}>{reason}</option>)}
                </select>
              </label>
            )}
            {pendingImpacts.length > 0 ? (
              <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">
                {pendingImpacts.map(impact => <div key={impact.request.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"><div className="flex flex-wrap items-center justify-between gap-2"><b className="text-[var(--app-primary)]">{impact.request.requestNo}</b><span className="text-slate-500">{impact.request.title}</span></div><div className="mt-1 flex flex-wrap gap-2">{impact.changes.map(change => <span key={`${change.role}-${change.from}`} className="text-slate-600">{change.role}: {change.from} → {change.to} <b className={change.wasCurrentStep ? "text-amber-600" : "text-slate-400"}>({change.wasCurrentStep ? "Current step" : "Upcoming step"})</b></span>)}</div></div>)}
              </div>
            ) : <p className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">ไม่มีคำขอสถานะ Waiting Approve ที่ได้รับผลกระทบ Flow ใหม่นี้จะใช้กับคำขอที่ส่งหลังจากนี้</p>}
            {applyToPending && affectedStepCount > 0 && <p className="mt-3 flex items-center gap-2 text-xs text-[var(--app-primary)]"><Mail className="size-4" />ระบบจะบันทึกอีเมลจำลองสำหรับผู้รับผิดชอบคนใหม่และเจ้าของคำขอที่เกี่ยวข้อง</p>}
          </section>
        )}
        {error && (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium text-rose-700">
            {error}
          </p>
        )}
      </form>
    </RequestDialog>
  );
}

function PeopleEditor({
  label,
  description,
  people: selectedPeople,
  onChange,
  required = false,
  readOnly,
}: {
  label: string;
  description: string;
  people: string[];
  onChange: (people: string[]) => void;
  required?: boolean;
  readOnly: boolean;
}) {
  const updatePerson = (index: number, value: string) =>
    onChange(
      selectedPeople.map((person, personIndex) =>
        personIndex === index ? value : person,
      ),
    );
  const removePerson = (index: number) =>
    onChange(selectedPeople.filter((_, personIndex) => personIndex !== index));
  const canRemove = !required || selectedPeople.length > 1;

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5">
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <UserRound className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5 text-slate-800">
              {label}
              {required && <b className="ml-1 text-rose-500">*</b>}
            </p>
            <p className="truncate text-[11px] leading-4 text-slate-500">
              {description}
            </p>
          </div>
        </div>
        {!readOnly && (
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label={`Add ${label}`}
            onClick={() => onChange([...selectedPeople, ""])}
            className="size-8 shrink-0 bg-white"
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      {selectedPeople.length === 0 ? (
        <p className="mt-2 rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2 text-xs text-slate-400">
          No {label.toLowerCase()} selected.
        </p>
      ) : (
        <div className="mt-2 max-h-[330px] space-y-2 overflow-y-auto pr-1">
          {selectedPeople.map((person, index) => (
            <PersonSelectionCard
              key={`${label}-${index}`}
              label={label}
              index={index}
              personName={person}
              readOnly={readOnly}
              canRemove={canRemove}
              onChange={(value) => updatePerson(index, value)}
              onRemove={() => removePerson(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PersonSelectionCard({
  label,
  index,
  personName,
  readOnly,
  canRemove,
  onChange,
  onRemove,
}: {
  label: string;
  index: number;
  personName: string;
  readOnly: boolean;
  canRemove: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  const person = findMockPerson(personName);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
          {index + 1}
        </span>

        <label className="min-w-0 flex-1">
          <span className="sr-only">
            {label} user {index + 1}
          </span>
          <select
            disabled={readOnly}
            value={personName}
            onChange={(event) => onChange(event.target.value)}
            className={compactPersonFieldClass}
          >
            <option value="">Select person</option>
            {mockPersonNames.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        {!readOnly && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!canRemove}
            aria-label={`Remove ${label}`}
            onClick={onRemove}
            className="h-9 shrink-0 border-rose-200 bg-rose-50/40 px-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 className="size-4" />
            <span>Delete</span>
          </Button>
        )}
      </div>

      {person && <PersonDetails person={person} />}
    </article>
  );
}

function PersonDetails({ person }: { person: MockPerson }) {
  return (
    <div className="overflow-x-auto bg-slate-50/45 px-3 py-2.5">
      <div
        className="min-w-[760px]"
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(260px, 1.55fr) repeat(4, minmax(105px, 1fr))",
          alignItems: "center",
        }}
      >
        <div className="flex min-w-0 items-center gap-3 pr-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <UserRound className="size-5" />
          </span>

          <div className="min-w-0">
            <div className="flex min-w-0 items-baseline gap-3">
              <p className="truncate text-sm font-semibold leading-5 text-slate-800">
                {person.name}
              </p>
              <b className="shrink-0 text-sm font-semibold text-emerald-600">
                {person.employeeCode}
              </b>
            </div>
            <p className="truncate text-[11px] leading-4 text-slate-500">
              {person.email}
            </p>
          </div>
        </div>

        <PersonDetail label="Section" value={person.section} />
        <PersonDetail label="Position" value={person.position} />
        <PersonDetail label="Position Code" value={person.positionCode} />
        <PersonDetail label="Department" value={person.department} />
      </div>
    </div>
  );
}

function PersonDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-l border-slate-200 px-4">
      <p className="text-[11px] leading-4 text-slate-500">{label}</p>
      <p className="truncate text-xs font-semibold leading-5 text-slate-700">
        {value}
      </p>
    </div>
  );
}
