import { createContext, type Dispatch, type SetStateAction } from 'react'

import type { SeasonalTheme, SeasonalThemeIntensity } from '@/components/layout/seasonal-theme-layer'
import type { PrimaryOption } from '@/config/theme'

export type BackgroundSettings = {
  image?: string
  opacity: number
  shading: number
  positionPreset: string
  positionX: number
  positionY: number
  size: 'cover' | 'contain'
  blur: number
}

export type AppearanceContextValue = {
  isDark: boolean
  setIsDark: Dispatch<SetStateAction<boolean>>
  primary: PrimaryOption
  setPrimary: Dispatch<SetStateAction<PrimaryOption>>
  themeTransitionImage?: string
  setThemeTransitionImage: Dispatch<SetStateAction<string | undefined>>
  background: BackgroundSettings
  setBackground: Dispatch<SetStateAction<BackgroundSettings>>
  seasonalTheme: SeasonalTheme
  setSeasonalTheme: Dispatch<SetStateAction<SeasonalTheme>>
  seasonalIntensity: SeasonalThemeIntensity
  setSeasonalIntensity: Dispatch<SetStateAction<SeasonalThemeIntensity>>
}

export const AppearanceContext = createContext<AppearanceContextValue | null>(null)
