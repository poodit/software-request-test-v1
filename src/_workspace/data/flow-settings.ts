export type FlowSetting = {
  id: number
  product: string
  checkers: string[]
  approvers: string[]
  cc: string[]
  active: boolean
}

const flowSettingsStorageKey = 'template-test.flow-settings.v3'

export const defaultFlowSettings: FlowSetting[] = [
  { id: 1, product: '980', checkers: ['Alex Morgan'], approvers: ['Emma Wilson'], cc: ['Poodit Suwanprateep'], active: true },
  { id: 2, product: '990', checkers: ['Liam Carter'], approvers: ['Sophia Turner'], cc: ['Emma Wilson'], active: true },
  { id: 3, product: 'Smart Factory', checkers: ['Alex Morgan'], approvers: ['Sophia Turner'], cc: ['Poodit Suwanprateep'], active: true },
]

export function loadFlowSettings(): FlowSetting[] {
  try {
    const storedSettings = window.localStorage.getItem(flowSettingsStorageKey)
    if (!storedSettings) return defaultFlowSettings

    const parsedSettings: unknown = JSON.parse(storedSettings)
    return Array.isArray(parsedSettings) ? parsedSettings as FlowSetting[] : defaultFlowSettings
  } catch {
    return defaultFlowSettings
  }
}

export function saveFlowSettings(settings: FlowSetting[]) {
  window.localStorage.setItem(flowSettingsStorageKey, JSON.stringify(settings))
}

export function findFlowSetting(product?: string) {
  return loadFlowSettings().find(setting => setting.active && setting.product === product)
}
