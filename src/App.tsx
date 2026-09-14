import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { AppShell } from '@/components/layout/app-shell'
import DashboardPage from '@/_workspace/pages/dashboard/page'
import ApproveRequestPage from '@/_workspace/pages/approve-request/page'
import GetRequestPage from '@/_workspace/pages/programmer/get-request/page'
import MyWorkPage from '@/_workspace/pages/programmer/my-work/page'
import PlannerPage from '@/_workspace/pages/PlannerPage'
import TeamManagementPage from '@/_workspace/pages/TeamManagementPage'
import RequestHistoryPage from '@/_workspace/pages/request-software/RequestHistoryPage'
import RequestSoftwarePage from '@/_workspace/pages/request-software/page'
import FlowSettingPage from '@/_workspace/pages/system-setting/flow-setting/page'
import NotificationSettingPage from '@/_workspace/pages/system-setting/notification-setting/page'
import SoftwareMasterPage from '@/_workspace/pages/system-setting/software-master/page'
import { ensureCleanMockData } from '@/_workspace/mock-data-reset'

ensureCleanMockData()

function RoutedApplication() {
  return (
    <AppShell>
      <Routes>
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/request/software' element={<RequestSoftwarePage />} />
        <Route path='/request/history' element={<RequestHistoryPage />} />
        <Route path='/request/approve' element={<ApproveRequestPage />} />
        <Route path='/programmer/get-request' element={<GetRequestPage />} />
        <Route path='/programmer/my-work' element={<MyWorkPage />} />
        <Route path='/management/planner' element={<PlannerPage />} />
        <Route path='/management/teams' element={<TeamManagementPage />} />
        <Route path='/settings/flow' element={<FlowSettingPage />} />
        <Route path='/settings/software-master' element={<SoftwareMasterPage />} />
        <Route path='/settings/notification' element={<NotificationSettingPage />} />
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RoutedApplication />
    </BrowserRouter>
  )
}
