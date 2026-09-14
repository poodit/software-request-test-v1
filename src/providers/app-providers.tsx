import type { ReactNode } from 'react'

import { AppearanceProvider } from '@/providers/appearance-provider'
import { LayoutProvider } from '@/providers/layout-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LayoutProvider>
      <AppearanceProvider>{children}</AppearanceProvider>
    </LayoutProvider>
  )
}
