import { Maximize, Minimize } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type BrowserFullscreenToggleProps = {
  className?: string
}

export function BrowserFullscreenToggle({ className }: BrowserFullscreenToggleProps) {
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement))
  const [isSupported] = useState(() => Boolean(document.fullscreenEnabled && document.documentElement.requestFullscreen))

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!isSupported) return

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Browsers can reject fullscreen when the document is not active.
    }
  }

  const label = isFullscreen ? 'Exit browser fullscreen' : 'Browser fullscreen'

  return (
    <button
      type='button'
      title={label}
      aria-label={label}
      aria-pressed={isFullscreen}
      disabled={!isSupported}
      onClick={() => void toggleFullscreen()}
      className={cn(className, !isSupported && 'cursor-not-allowed opacity-40')}
    >
      {isFullscreen ? <Minimize className='size-4' /> : <Maximize className='size-4' />}
    </button>
  )
}
