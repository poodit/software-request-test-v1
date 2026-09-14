import { useEffect, useMemo, useState } from "react";

import {
  loadFlowSettings,
  saveFlowSettings,
  type FlowSetting,
} from "@/_workspace/data/flow-settings";
import { mockCurrentUser } from "@/_workspace/data/mock-people";
import {
  loadMockRequests,
  saveMockRequests,
} from "@/_workspace/data/request-software/requestStore";
import { Button } from "@/components/ui/button";
import { RequestDialog } from "@/_workspace/pages/request-software/modal/RequestDialog";
import type { ApprovalRouteChangeReason, SoftwareRequest } from "@/_workspace/pages/request-software/types";

import { SearchFilters, type FlowSettingSearchValues } from "./SearchFilters";
import { SearchResult } from "./SearchResult";
import { FlowSettingModal } from "./modal/FlowSettingModal";
import { applyPendingFlowUpdate } from "./flow-update";

type DialogState = {
  mode: "create" | "view" | "edit";
  setting?: FlowSetting;
} | null;
const emptySearchValues: FlowSettingSearchValues = { keyword: "", active: "" };

export default function FlowSettingPage() {
  const [settings, setSettings] = useState<FlowSetting[]>(loadFlowSettings);
  const [requests, setRequests] = useState<SoftwareRequest[]>(loadMockRequests);
  const [searchValues, setSearchValues] = useState(emptySearchValues);
  const [appliedSearch, setAppliedSearch] = useState(emptySearchValues);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [settingToDelete, setSettingToDelete] = useState<FlowSetting | null>(
    null,
  );
  const [updateSummary, setUpdateSummary] = useState<{ requests: number; steps: number } | null>(null);

  useEffect(() => saveFlowSettings(settings), [settings]);
  useEffect(() => saveMockRequests(requests), [requests]);

  const filteredSettings = useMemo(() => {
    const keyword = appliedSearch.keyword.trim().toLowerCase();
    return settings.filter((setting) => {
      const matchesKeyword =
        !keyword ||
        [setting.product, ...setting.checkers, ...setting.approvers, ...setting.cc]
          .some((value) => value.toLowerCase().includes(keyword));
      const matchesStatus =
        !appliedSearch.active ||
        (appliedSearch.active === "active" ? setting.active : !setting.active);
      return matchesKeyword && matchesStatus;
    });
  }, [appliedSearch, settings]);

  const saveSetting = (values: Omit<FlowSetting, "id">, editingId?: number, updatePending?: { apply: boolean; reason?: ApprovalRouteChangeReason }) => {
    const currentSetting = editingId ? settings.find(setting => setting.id === editingId) : undefined;
    if (currentSetting && updatePending?.apply && updatePending.reason) {
      const result = applyPendingFlowUpdate(requests, currentSetting, values, updatePending.reason, mockCurrentUser.name);
      setRequests(result.requests);
      saveMockRequests(result.requests);
      setUpdateSummary({ requests: result.affectedRequests, steps: result.affectedSteps });
    } else {
      setUpdateSummary(null);
    }
    setSettings((current) =>
      editingId
        ? current.map((setting) =>
            setting.id === editingId ? { ...values, id: editingId } : setting,
          )
        : [
            ...current,
            {
              ...values,
              id: Math.max(0, ...current.map((setting) => setting.id)) + 1,
            },
          ],
    );
    setDialog(null);
  };

  return (
    <section className="page-container space-y-5">
      {updateSummary && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Flow saved and {updateSummary.steps} pending step{updateSummary.steps === 1 ? "" : "s"} across {updateSummary.requests} request{updateSummary.requests === 1 ? "" : "s"} were reassigned. Mock email notifications were recorded for the new participants.
        </div>
      )}
      <SearchFilters
        values={searchValues}
        onChange={setSearchValues}
        onSearch={() => setAppliedSearch(searchValues)}
        onClear={() => {
          setSearchValues(emptySearchValues);
          setAppliedSearch(emptySearchValues);
        }}
      />
      <SearchResult
        settings={filteredSettings}
        onView={(setting) => setDialog({ mode: "view", setting })}
        onEdit={(setting) => setDialog({ mode: "edit", setting })}
        onDelete={setSettingToDelete}
        onAdd={() => setDialog({ mode: "create" })}
      />
      {dialog && (
        <FlowSettingModal
          mode={dialog.mode}
          setting={dialog.setting}
          settings={settings}
          requests={requests}
          onClose={() => setDialog(null)}
          onSave={saveSetting}
        />
      )}
      {settingToDelete && (
        <RequestDialog
          title="Delete Flow Setting"
          onClose={() => setSettingToDelete(null)}
          maxWidthClassName="max-w-md"
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSettingToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setSettings((current) =>
                    current.filter(
                      (setting) => setting.id !== settingToDelete.id,
                    ),
                  );
                  setSettingToDelete(null);
                }}
              >
                Delete
              </Button>
            </>
          }
        >
          <div className="p-5 text-sm text-slate-600">
            Delete Flow Setting for{" "}
            <b className="text-slate-900">
              {settingToDelete.product}
            </b>
            ? Requests can no longer use this route until a new active setting
            is added.
          </div>
        </RequestDialog>
      )}
    </section>
  );
}
