import type { LucideIcon } from 'lucide-react'
import {
  BriefcaseBusiness,
  CalendarDays,
  Download,
  FileText,
  History,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  BellRing,
  Database,
  Workflow,
  UsersRound,
} from 'lucide-react'

export type NavigationItem = {
  label: string
  href?: string
  icon?: LucideIcon
  children?: NavigationItem[]
  section?: string
  featured?: boolean
}

export const navigation: NavigationItem[] = [
  { label: 'Dashboard', section: 'Dashboard' },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Request', section: 'Request' },
  { label: 'Request Software', href: '/request/software', icon: FileText },
  { label: 'Request History', href: '/request/history', icon: History },
  { label: 'Approve Request', href: '/request/approve', icon: ShieldCheck },
  { label: 'Programmer', section: 'Programmer' },
  { label: 'Get Request', href: '/programmer/get-request', icon: Download },
  { label: 'My Work', href: '/programmer/my-work', icon: BriefcaseBusiness },
  { label: 'Management', section: 'Management' },
  { label: 'Planner', href: '/management/planner', icon: CalendarDays },
  { label: 'Team Management', href: '/management/teams', icon: UsersRound },
  { label: 'Settings', section: 'Settings' },
  {
    label: 'System Setting',
    icon: Settings,
    children: [
      { label: 'Software Master', href: '/settings/software-master', icon: Database },
      { label: 'Flow Setting', href: '/settings/flow', icon: Workflow },
      { label: 'Notification Setting', href: '/settings/notification', icon: BellRing },
    ],
  },
]
