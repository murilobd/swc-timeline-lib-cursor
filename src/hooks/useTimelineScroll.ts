import { useCallback, useEffect, useRef, useState } from 'react'
import { differenceInMinutes } from 'date-fns'
import type { ResolvedTimelineConfig, VisibleRange } from '../types'
import { SCROLL_COLLAPSE_THRESHOLD } from '../utils/constants'

interface UseTimelineScrollOptions {
  config: ResolvedTimelineConfig
  totalGridWidth: number
  autoScrollToNow: boolean
  onScroll?: (visibleRange: VisibleRange) => void
}

interface UseTimelineScrollReturn {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  scrollLeft: number
  isCollapsed: boolean
  visibleRange: VisibleRange
  setScrollLeft: (value: number) => void
  scrollToTime: (time: Date) => void
}

export function useTimelineScroll({
  config,
  totalGridWidth,
  autoScrollToNow,
  onScroll,
}: UseTimelineScrollOptions): UseTimelineScrollReturn {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeftState] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Calculate visible range
  const getVisibleRange = useCallback(
    (currentScrollLeft: number): VisibleRange => {
      const containerWidth = scrollContainerRef.current?.clientWidth ?? 1000
      const scrollPercentage = currentScrollLeft / totalGridWidth
      const visiblePercentage = containerWidth / totalGridWidth

      const startOffset = scrollPercentage * config.totalMinutes
      const visibleMinutes = visiblePercentage * config.totalMinutes

      const start = new Date(
        config.startDate.getTime() + startOffset * 60 * 1000
      )
      const end = new Date(start.getTime() + visibleMinutes * 60 * 1000)

      return { start, end }
    },
    [config, totalGridWidth]
  )

  const [visibleRange, setVisibleRange] = useState<VisibleRange>(() =>
    getVisibleRange(0)
  )

  // Set scroll left with collapse detection
  const setScrollLeft = useCallback(
    (value: number) => {
      setScrollLeftState(value)
      setIsCollapsed(value > SCROLL_COLLAPSE_THRESHOLD)

      const newVisibleRange = getVisibleRange(value)
      setVisibleRange(newVisibleRange)
      onScroll?.(newVisibleRange)
    },
    [getVisibleRange, onScroll]
  )

  // Scroll to specific time
  const scrollToTime = useCallback(
    (time: Date) => {
      if (!scrollContainerRef.current) return

      const containerWidth = scrollContainerRef.current.clientWidth
      const timeOffset = differenceInMinutes(time, config.startDate)
      const timePosition = (timeOffset / config.totalMinutes) * totalGridWidth
      const targetScroll = timePosition - containerWidth / 2

      scrollContainerRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      })
    },
    [config, totalGridWidth]
  )

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (autoScrollToNow) {
      const timeout = setTimeout(() => {
        scrollToTime(new Date())
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [autoScrollToNow, scrollToTime])

  return {
    scrollContainerRef,
    scrollLeft,
    isCollapsed,
    visibleRange,
    setScrollLeft,
    scrollToTime,
  }
}
