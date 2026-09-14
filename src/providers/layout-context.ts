import { createContext, type Dispatch, type SetStateAction } from 'react'

export type MenuMode = 'vertical' | 'horizontal'

export type LayoutContextValue = {
  menuMode: MenuMode
  setMenuMode: Dispatch<SetStateAction<MenuMode>>
  isCollapsed: boolean
  setIsCollapsed: Dispatch<SetStateAction<boolean>>
  isContentWide: boolean
  setIsContentWide: Dispatch<SetStateAction<boolean>>
}

export const LayoutContext = createContext<LayoutContextValue | null>(null)
