import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject
} from 'react'

const BOTTOM_THRESHOLD = 48

export function useAutoScroll(
  containerRef: RefObject<HTMLElement | null>
) {
  const [isFollowing, setIsFollowing] =
    useState(true)

  const isFollowingRef = useRef(true)

  const setFollowing = useCallback(
    (value: boolean) => {
      isFollowingRef.current = value
      setIsFollowing(value)
    },
    []
  )

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const container = containerRef.current

      if (!container) {
        return
      }

      container.scrollTo({
        top: container.scrollHeight,
        behavior
      })
    },
    [containerRef]
  )

  const resumeAutoScroll = useCallback(() => {
    setFollowing(true)
    scrollToBottom('smooth')
  }, [scrollToBottom, setFollowing])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const handleScroll = () => {
      const distance =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight

      const atBottom = distance <= BOTTOM_THRESHOLD

      if (atBottom) {
        if (!isFollowingRef.current) {
          setFollowing(true)
        }

        return
      }

      if (isFollowingRef.current) {
        setFollowing(false)
      }
    }

    container.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    )

    const handleWheel = (event: WheelEvent) => {
      if (
        event.deltaY < 0 &&
        container.scrollTop > 0 &&
        isFollowingRef.current
      ) {
        setFollowing(false)
      }
    }

    let touchY = 0

    const handleTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0
    }

    const handleTouchMove = (event: TouchEvent) => {
      const nextY =
        event.touches[0]?.clientY ?? 0

      if (
        nextY - touchY > 0 &&
        container.scrollTop > 0 &&
        isFollowingRef.current
      ) {
        setFollowing(false)
      }

      touchY = nextY
    }

    container.addEventListener(
      'wheel',
      handleWheel,
      { passive: true }
    )

    container.addEventListener(
      'touchstart',
      handleTouchStart,
      { passive: true }
    )

    container.addEventListener(
      'touchmove',
      handleTouchMove,
      { passive: true }
    )

    const observer = new MutationObserver(() => {
      if (isFollowingRef.current) {
        scrollToBottom()
      }
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    })

    return () => {
      container.removeEventListener(
        'scroll',
        handleScroll
      )
      container.removeEventListener(
        'wheel',
        handleWheel
      )
      container.removeEventListener(
        'touchstart',
        handleTouchStart
      )
      container.removeEventListener(
        'touchmove',
        handleTouchMove
      )
      observer.disconnect()
    }
  }, [
    containerRef,
    scrollToBottom,
    setFollowing
  ])

  return {
    isFollowing,
    resumeAutoScroll
  }
}
