import type { ComponentPropsWithoutRef } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { Moon, Sun } from 'lucide-react'

import { cn } from '@/lib/utils'

import styles from './animated-theme-toggle.module.css'

type AnimationPhase = 'idle' | 'dance' | 'merge' | 'wave'
type ThemeMode = 'light' | 'dark'

type ThemeViewTransition = {
  ready: Promise<void>
  finished: Promise<void>
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateTheme: () => void) => ThemeViewTransition
}

type AnimatedThemeToggleProps = Omit<ComponentPropsWithoutRef<'button'>, 'onClick'> & {
  isDark: boolean
  onThemeChange: (isDark: boolean) => void
  imageUrl?: string
  duration?: number
}

const danceDuration = 560
const mergeDuration = 200

export function AnimatedThemeToggle({
  isDark,
  onThemeChange,
  imageUrl,
  className,
  duration = 900,
  ...props
}: AnimatedThemeToggleProps) {
  const timersRef = useRef<number[]>([])
  const mountedRef = useRef(true)
  const [phase, setPhase] = useState<AnimationPhase>('idle')
  const [targetMode, setTargetMode] = useState<ThemeMode>('dark')
  const isAnimating = phase !== 'idle'

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout)
    timersRef.current = []
  }, [])

  const applyTheme = useCallback((nextMode: ThemeMode) => {
    onThemeChange(nextMode === 'dark')
    document.documentElement.classList.toggle('dark', nextMode === 'dark')
  }, [onThemeChange])

  const runWaveTransition = useCallback(async (nextMode: ThemeMode) => {
    const transitionDocument = document as DocumentWithViewTransition
    const startViewTransition = transitionDocument.startViewTransition?.bind(transitionDocument)

    if (!startViewTransition) {
      applyTheme(nextMode)
      setPhase('idle')
      return
    }

    let themeWasApplied = false

    try {
      const transition = startViewTransition(() => {
        flushSync(() => {
          setPhase('wave')
          applyTheme(nextMode)
          themeWasApplied = true
        })
      })

      await transition.ready

      const waveRadius = Math.hypot(window.innerWidth / 2, window.innerHeight / 2)
      const wave = document.documentElement.animate(
        { clipPath: ['circle(54px at 50% 50%)', `circle(${waveRadius}px at 50% 50%)`] },
        {
          duration,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'both',
          pseudoElement: '::view-transition-new(root)',
        },
      )

      await Promise.allSettled([wave.finished, transition.finished])
    } catch {
      if (!themeWasApplied) applyTheme(nextMode)
    } finally {
      if (mountedRef.current) setPhase('idle')
    }
  }, [applyTheme, duration])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      clearTimers()
    }
  }, [clearTimers])

  const toggleTheme = () => {
    if (isAnimating) return

    const nextMode: ThemeMode = isDark ? 'light' : 'dark'

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyTheme(nextMode)
      return
    }

    clearTimers()
    setTargetMode(nextMode)
    setPhase('dance')
    timersRef.current.push(
      window.setTimeout(() => setPhase('merge'), danceDuration),
      window.setTimeout(() => void runWaveTransition(nextMode), danceDuration + mergeDuration),
    )
  }

  const label = `Switch to ${isDark ? 'light' : 'dark'} mode`

  return (
    <>
      <button
        {...props}
        type='button'
        title={label}
        aria-label={label}
        aria-pressed={isDark}
        aria-disabled={isAnimating}
        className={cn(styles.toggleButton, className)}
        onClick={toggleTheme}
      >
        <span className={styles.iconWrap} aria-hidden='true'>
          {isDark ? <Sun className='size-4' /> : <Moon className='size-4' />}
        </span>
      </button>

      {(phase === 'dance' || phase === 'merge') && createPortal(
        <div className={styles.transitionLayer} data-phase={phase} data-target-theme={targetMode} aria-hidden='true'>
          <div className={styles.mascotStage}>
            <span className={`${styles.sparkle} ${styles.sparkleLeft}`} />
            <span className={`${styles.sparkle} ${styles.sparkleRight}`} />
            {imageUrl ? (
              <div className={styles.customImageWrap}>
                <img src={imageUrl} alt='' className={styles.customImage} />
              </div>
            ) : (
              <div className={styles.mascot}>
                <span className={styles.antennaRack}>
                  <span className={`${styles.antenna} ${styles.antennaShort}`} />
                  <span className={`${styles.antenna} ${styles.antennaMedium}`} />
                  <span className={`${styles.antenna} ${styles.antennaTall}`} />
                </span>
                <span className={`${styles.ear} ${styles.earLeft}`} />
                <span className={`${styles.ear} ${styles.earRight}`} />
                <span className={`${styles.arm} ${styles.armLeft}`} />
                <span className={`${styles.arm} ${styles.armRight}`} />
                <span className={`${styles.leg} ${styles.legLeft}`} />
                <span className={`${styles.leg} ${styles.legRight}`} />
                <span className={styles.facePanel} />
                <span className={`${styles.eye} ${styles.eyeLeft}`} />
                <span className={`${styles.eye} ${styles.eyeRight}`} />
                <span className={styles.cheekLeft} />
                <span className={styles.cheekRight} />
                <span className={styles.smile} />
                <span className={styles.chestPanel}>
                  <span className={styles.chestMark}>FITEL</span>
                  <span className={styles.chestLight} />
                </span>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
