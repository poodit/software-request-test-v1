import type { SoftwareRequest } from '@/_workspace/pages/request-software/types'

import { softwareRequestMockData } from './mockData'

export const requestStorageKey = 'template-test.request-software.mock-requests.v10'

export function loadMockRequests(): SoftwareRequest[] {
  try {
    const storedRequests = window.localStorage.getItem(requestStorageKey)
    if (!storedRequests) return softwareRequestMockData

    const parsedRequests: unknown = JSON.parse(storedRequests)
    return Array.isArray(parsedRequests) ? parsedRequests as SoftwareRequest[] : softwareRequestMockData
  } catch {
    return softwareRequestMockData
  }
}

export function saveMockRequests(requests: SoftwareRequest[]) {
  window.localStorage.setItem(requestStorageKey, JSON.stringify(requests))
}
