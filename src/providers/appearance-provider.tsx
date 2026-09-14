import { useEffect, useMemo, useState, type ReactNode } from 'react'

import type { SeasonalTheme, SeasonalThemeIntensity } from '@/components/layout/seasonal-theme-layer'
import { primaryOptions } from '@/config/theme'
import { AppearanceContext, type BackgroundSettings } from '@/providers/appearance-context'

const seasonalThemeStorageKey = 'software-request.seasonal-theme'
const seasonalIntensityStorageKey = 'software-request.seasonal-intensity'

const getStoredSeasonalTheme = (): SeasonalTheme => {
  const stored = localStorage.getItem(seasonalThemeStorageKey)

  return stored === 'winter' || stored === 'rainy' || stored === 'autumn' ? stored : 'default'
}

const getStoredSeasonalIntensity = (): SeasonalThemeIntensity => {
  const stored = localStorage.getItem(seasonalIntensityStorageKey)

  return stored === 'low' || stored === 'high' ? stored : 'medium'
}

const initialBackground: BackgroundSettings = {
  opacity: 100,
  shading: 55,
  positionPreset: 'center',
  positionX: 50,
  positionY: 50,
  size: 'cover',
  blur: 0,
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [primary, setPrimary] = useState(primaryOptions[0])
  const [themeTransitionImage, setThemeTransitionImage] = useState<string>()
  const [background, setBackground] = useState(initialBackground)
  const [seasonalTheme, setSeasonalTheme] = useState<SeasonalTheme>(getStoredSeasonalTheme)
  const [seasonalIntensity, setSeasonalIntensity] = useState<SeasonalThemeIntensity>(getStoredSeasonalIntensity)

  useEffect(() => {
    localStorage.setItem(seasonalThemeStorageKey, seasonalTheme)
  }, [seasonalTheme])

  useEffect(() => {
    localStorage.setItem(seasonalIntensityStorageKey, seasonalIntensity)
  }, [seasonalIntensity])

  const value = useMemo(
    () => ({
      isDark,
      setIsDark,
      primary,
      setPrimary,
      themeTransitionImage,
      setThemeTransitionImage,
      background,
      setBackground,
      seasonalTheme,
      setSeasonalTheme,
      seasonalIntensity,
      setSeasonalIntensity,
    }),
    [background, isDark, primary, seasonalIntensity, seasonalTheme, themeTransitionImage]
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}
