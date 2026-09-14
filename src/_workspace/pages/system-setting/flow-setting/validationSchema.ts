import type { FlowSetting } from '@/_workspace/data/flow-settings'

export function validateFlowSetting(values: Omit<FlowSetting, 'id'>, settings: FlowSetting[], editingId?: number) {
  if (!values.product || values.approvers.length === 0) return 'กรุณาเลือก Product และ Approver อย่างน้อย 1 คน'
  if (settings.some(setting => setting.id !== editingId && setting.product === values.product)) return 'Product นี้มี Flow Setting อยู่แล้ว'
  return undefined
}
