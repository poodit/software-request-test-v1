import { useMemo, useState, type ReactNode } from 'react'

import { LayoutContext, type MenuMode } from '@/providers/layout-context'

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [menuMode, setMenuMode] = useState<MenuMode>('vertical')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isContentWide, setIsContentWide] = useState(false)

  const value = useMemo(
    () => ({ menuMode, setMenuMode, isCollapsed, setIsCollapsed, isContentWide, setIsContentWide }),
    [isCollapsed, isContentWide, menuMode]
  )

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}
