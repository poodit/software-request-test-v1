import { useCallback, useState } from 'react'

import { PrimaryColorPicker } from '@/components/customizer/primary-color-picker'
import { primaryOptions, type PrimaryOption } from '@/config/theme'
import { useAppearance } from '@/hooks/use-appearance'
import { cn } from '@/lib/utils'

export function PrimaryColorCustomizer() {
  const { isDark, primary, setPrimary } = useAppearance()
  const [pickerResetKey, setPickerResetKey] = useState(0)

  const setCustomPrimary = useCallback(
    (value: string) => setPrimary({ name: 'Custom', value, soft: `${value}1a` }),
    [setPrimary]
  )

  const selectOption = (option: PrimaryOption) => {
    setPrimary(option)
    setPickerResetKey(key => key + 1)
  }

  return (
    <div className={cn('absolute right-0 top-10 z-50 w-64 rounded-lg border p-3 shadow-xl', isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white')}>
      <p className={cn('mb-2 text-xs font-semibold', isDark ? 'text-slate-100' : 'text-slate-800')}>Primary color</p>
      <PrimaryColorPicker key={pickerResetKey} value={primary.value} isDark={isDark} onCommit={setCustomPrimary} />
      <div className='mt-3 flex gap-2'>
        {primaryOptions.map(option => (
          <button
            key={option.name}
            type='button'
            aria-label={`Use ${option.name} primary color`}
            onClick={() => selectOption(option)}
            className='size-6 rounded-full ring-2 ring-white outline outline-1 outline-slate-300'
            style={{ backgroundColor: option.value }}
          />
        ))}
      </div>
    </div>
  )
}
