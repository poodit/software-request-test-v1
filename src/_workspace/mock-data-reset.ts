const resetMarkerKey = 'template-test.clean-data.fictional-teams.v1'

const dataKeyPrefixes = [
  'template-test.request-software.',
  'template-test.planner.',
  'template-test.flow-settings.',
  'template-test.notification-settings.',
  'template-test.mock-email-log.',
  'template-test.software-master.',
  'template-test.teams.',
]

export function ensureCleanMockData() {
  if (window.localStorage.getItem(resetMarkerKey) === 'complete') return
  Object.keys(window.localStorage)
    .filter(key => dataKeyPrefixes.some(prefix => key.startsWith(prefix)))
    .forEach(key => window.localStorage.removeItem(key))
  window.localStorage.setItem(resetMarkerKey, 'complete')
}

