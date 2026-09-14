import { Ban, CloudRain, Leaf, Snowflake } from 'lucide-react'

import { useAppearance } from '@/hooks/use-appearance'
import { cn } from '@/lib/utils'

const seasonalOptions = [
  { value: 'default', label: 'Default', Icon: Ban },
  { value: 'winter', label: 'Winter', Icon: Snowflake },
  { value: 'rainy', label: 'Rainy', Icon: CloudRain },
  { value: 'autumn', label: 'Autumn', Icon: Leaf },
] as const

const seasonalIntensityOptions = ['low', 'medium', 'high'] as const

export function SeasonalCustomizer() {
  const { isDark, seasonalTheme, setSeasonalTheme, seasonalIntensity, setSeasonalIntensity } = useAppearance()

  return (
    <div className={cn('absolute right-0 top-10 z-50 w-80 rounded-lg border p-3 shadow-xl', isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white')}>
      <p className={cn('mb-2 text-xs font-semibold', isDark ? 'text-slate-100' : 'text-slate-800')}>Seasonal effect</p>
      <div className='grid grid-cols-2 gap-1.5'>
        {seasonalOptions.map(({ value, label, Icon }) => (
          <button
            key={value}
            type='button'
            aria-pressed={seasonalTheme === value}
            onClick={() => setSeasonalTheme(value)}
            className={cn(
              'flex h-9 items-center gap-2 rounded-md border px-3 text-left text-xs font-medium transition-colors',
              seasonalTheme === value
                ? 'border-[var(--app-primary)] bg-[var(--app-primary)] text-white'
                : isDark
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            )}
          >
            <Icon className='size-4' />
            {label}
          </button>
        ))}
      </div>

      <p className={cn('mb-2 mt-3 text-xs font-semibold', isDark ? 'text-slate-100' : 'text-slate-800')}>Effect intensity</p>
      <div className={cn('grid grid-cols-3 overflow-hidden rounded-md border', isDark ? 'border-slate-600' : 'border-slate-300')}>
        {seasonalIntensityOptions.map(intensity => (
          <button
            key={intensity}
            type='button'
            disabled={seasonalTheme === 'default'}
            aria-pressed={seasonalIntensity === intensity}
            onClick={() => setSeasonalIntensity(intensity)}
            className={cn(
              'h-9 border-r text-xs font-medium capitalize transition-colors last:border-r-0 disabled:cursor-not-allowed disabled:opacity-40',
              isDark ? 'border-slate-600' : 'border-slate-300',
              seasonalIntensity === intensity && seasonalTheme !== 'default'
                ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
                : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            {intensity}
          </button>
        ))}
      </div>
    </div>
  )
}
