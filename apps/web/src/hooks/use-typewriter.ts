import { useEffect, useRef, useState } from 'react'

const BASE_CHARS_PER_SECOND = 42
const CATCH_UP_FACTOR = 3
const MAX_CHARS_PER_SECOND = 600

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function useTypewriter(
  text: string,
  active = true
): string {
  const [displayed, setDisplayed] = useState(() =>
    active ? '' : text
  )

  const indexRef = useRef(
    active ? 0 : text.length
  )

  const carryRef = useRef(0)

  const hasAnimatedRef = useRef(active)

  useEffect(() => {
    if (active) {
      hasAnimatedRef.current = true
    }

    if (indexRef.current > text.length) {
      indexRef.current = 0
      carryRef.current = 0
      setDisplayed('')
    }

    const shouldAnimate =
      hasAnimatedRef.current &&
      !prefersReducedMotion()

    if (
      !shouldAnimate ||
      indexRef.current >= text.length
    ) {
      indexRef.current = text.length
      setDisplayed(text)
      return
    }

    let frame = 0
    let lastTime = performance.now()

    const tick = (now: number) => {
      const backlog =
        text.length - indexRef.current

      const elapsed =
        Math.max(now - lastTime, 0) / 1000

      lastTime = now

      const charsPerSecond = Math.min(
        MAX_CHARS_PER_SECOND,
        BASE_CHARS_PER_SECOND +
          backlog * CATCH_UP_FACTOR
      )

      carryRef.current +=
        charsPerSecond * elapsed

      const step = Math.floor(carryRef.current)

      if (step > 0) {
        carryRef.current -= step

        indexRef.current = Math.min(
          text.length,
          indexRef.current + step
        )

        setDisplayed(
          text.slice(0, indexRef.current)
        )
      }

      if (indexRef.current < text.length) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [active, text])

  return displayed
}
