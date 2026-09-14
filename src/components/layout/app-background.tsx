import { useAppearance } from '@/hooks/use-appearance'

export function AppBackground() {
  const { isDark, background } = useAppearance()
  const { image, opacity, shading, positionX, positionY, size, blur } = background

  if (!image) return null

  const panTransform = `translate(${(50 - positionX) * 0.12}%, ${(50 - positionY) * 0.12}%)`

  return (
    <div aria-hidden='true' className='pointer-events-none absolute inset-0 z-0 overflow-hidden' style={{ opacity: opacity / 100 }}>
      <div className='absolute -inset-8 scale-110 bg-cover bg-center bg-no-repeat opacity-70 blur-2xl' style={{ backgroundImage: `url("${image}")` }} />
      <div
        className='relative size-full origin-center bg-no-repeat'
        style={{
          backgroundImage: `url("${image}")`,
          backgroundPosition: `${positionX}% ${positionY}%`,
          backgroundSize: size,
          filter: blur ? `blur(${blur}px)` : undefined,
          transform: panTransform,
        }}
      />
      <div
        className='absolute inset-0'
        style={{ backgroundColor: isDark ? `rgb(15 23 42 / ${shading / 100})` : `rgb(255 255 255 / ${shading / 100})` }}
      />
    </div>
  )
}
