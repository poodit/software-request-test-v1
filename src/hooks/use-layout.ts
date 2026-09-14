import { useContext } from 'react'

import { LayoutContext } from '@/providers/layout-context'

export function useLayout() {
  const context = useContext(LayoutContext)

  if (!context) throw new Error('useLayout must be used inside LayoutProvider')

  return context
}
