import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
  type RefObject,
} from 'react'
import { differenceInMinutes, addDays, startOfDay } from 'date-fns'
import type {
  Row,
  Period,
  TimelineEvent,
  TimelineConfig,
  ResolvedTimelineConfig,
  VisibleRange,
  EventMove,
} from '../types'
import {
  DEFAULT_SLOT_DURATION,
  DEFAULT_ROW_COLUMN_WIDTH_EXPANDED,
  DEFAULT_ROW_COLUMN_WIDTH_COLLAPSED,
  SCROLL_COLLAPSE_THRESHOLD,
} from '../utils/constants'

interface TimelineContextValue {
  // Data
  rows: Row[]
  periods: Period[]
  events: TimelineEvent[]
  config: ResolvedTimelineConfig

  // State
  currentTime: Date
  scrollLeft: number
  isCollapsed: boolean
  isRowColumnHovered: boolean
  visibleRange: VisibleRange
  draggingEventId: string | null

  // Refs
  scrollContainerRef: RefObject<HTMLDivElement | null>

  // Layout
  rowColumnWidth: number
  totalGridWidth: number

  // Actions
  setScrollLeft: (value: number) => void
  scrollToTime: (time: Date) => void
  setRowColumnHovered: (value: boolean) => void
  setDraggingEventId: (eventId: string | null) => void

  // Callbacks from props
  onEventClick?: (event: TimelineEvent) => void
  onSlotClick?: (rowId: string, time: Date) => void
  onScroll?: (visibleRange: VisibleRange) => void
  onEventMove?: (moves: EventMove[]) => void

  // Custom rendering
  renderEvent?: (event: TimelineEvent, defaultRender: ReactNode) => ReactNode
  renderRowLabel?: (row: Row, label: string, isCollapsed: boolean) => ReactNode
}

const TimelineContext = createContext<TimelineContextValue | null>(null)

interface TimelineProviderProps {
  children: ReactNode
  rows: Row[]
  periods: Period[]
  events: TimelineEvent[]
  config: Partial<TimelineConfig>
  onEventClick?: (event: TimelineEvent) => void
  onSlotClick?: (rowId: string, time: Date) => void
  onScroll?: (visibleRange: VisibleRange) => void
  onEventMove?: (moves: EventMove[]) => void
  renderEvent?: (event: TimelineEvent, defaultRender: ReactNode) => ReactNode
  renderRowLabel?: (row: Row, label: string, isCollapsed: boolean) => ReactNode
  rowColumnWidth?: { expanded: number; collapsed: number }
}

export function TimelineProvider({
  children,
  rows,
  periods,
  events,
  config: partialConfig,
  onEventClick,
  onSlotClick,
  onScroll,
  onEventMove,
  renderEvent,
  renderRowLabel,
  rowColumnWidth: rowColumnWidthConfig,
}: TimelineProviderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Resolve config with defaults
  const config = useMemo<ResolvedTimelineConfig>(() => {
    const today = startOfDay(new Date())
    const startDate = partialConfig.startDate ?? addDays(today, -1)
    const endDate = partialConfig.endDate ?? addDays(today, 2)
    const slotDuration = partialConfig.slotDuration ?? DEFAULT_SLOT_DURATION

    const totalMinutes = differenceInMinutes(endDate, startDate)
    const slotCount = Math.ceil(totalMinutes / slotDuration)
    const hourCount = Math.ceil(totalMinutes / 60)

    return {
      startDate,
      endDate,
      slotDuration,
      hourFormat: partialConfig.hourFormat ?? 'french',
      showNowIndicator: partialConfig.showNowIndicator ?? true,
      autoScrollToNow: partialConfig.autoScrollToNow ?? true,
      infiniteScroll: partialConfig.infiniteScroll,
      periodMarkers: partialConfig.periodMarkers,
      totalMinutes,
      slotCount,
      hourCount,
    }
  }, [partialConfig])

  // Current time state (updates every minute)
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Scroll state
  const [scrollLeft, setScrollLeftState] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isRowColumnHovered, setRowColumnHovered] = useState(false)

  // Drag state
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null)

  // Row column width
  const expandedWidth =
    rowColumnWidthConfig?.expanded ?? DEFAULT_ROW_COLUMN_WIDTH_EXPANDED
  const collapsedWidth =
    rowColumnWidthConfig?.collapsed ?? DEFAULT_ROW_COLUMN_WIDTH_COLLAPSED

  // Expand on hover or when not collapsed
  const rowColumnWidth = (isCollapsed && !isRowColumnHovered) ? collapsedWidth : expandedWidth

  // Calculate total grid width (12px per slot)
  const totalGridWidth = useMemo(() => {
    return config.slotCount * 12 // DEFAULT_SLOT_WIDTH
  }, [config.slotCount])

  // Visible range calculation
  const visibleRange = useMemo<VisibleRange>(() => {
    const containerWidth = scrollContainerRef.current?.clientWidth ?? 1000
    const scrollPercentage = scrollLeft / totalGridWidth
    const visiblePercentage = containerWidth / totalGridWidth

    const startOffset = scrollPercentage * config.totalMinutes
    const visibleMinutes = visiblePercentage * config.totalMinutes

    const start = new Date(
      config.startDate.getTime() + startOffset * 60 * 1000
    )
    const end = new Date(start.getTime() + visibleMinutes * 60 * 1000)

    return { start, end }
  }, [scrollLeft, totalGridWidth, config])

  // Set scroll left with collapse detection
  const setScrollLeft = useCallback(
    (value: number) => {
      setScrollLeftState(value)
      setIsCollapsed(value > SCROLL_COLLAPSE_THRESHOLD)
      onScroll?.(visibleRange)
    },
    [onScroll, visibleRange]
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
    if (config.autoScrollToNow) {
      // Small delay to ensure container is rendered
      const timeout = setTimeout(() => {
        scrollToTime(new Date())
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [config.autoScrollToNow, scrollToTime])

  const value = useMemo<TimelineContextValue>(
    () => ({
      rows,
      periods,
      events,
      config,
      currentTime,
      scrollLeft,
      isCollapsed,
      isRowColumnHovered,
      visibleRange,
      draggingEventId,
      scrollContainerRef,
      rowColumnWidth,
      totalGridWidth,
      setScrollLeft,
      scrollToTime,
      setRowColumnHovered,
      setDraggingEventId,
      onEventClick,
      onSlotClick,
      onScroll,
      onEventMove,
      renderEvent,
      renderRowLabel,
    }),
    [
      rows,
      periods,
      events,
      config,
      currentTime,
      scrollLeft,
      isCollapsed,
      isRowColumnHovered,
      visibleRange,
      draggingEventId,
      rowColumnWidth,
      totalGridWidth,
      setScrollLeft,
      scrollToTime,
      setRowColumnHovered,
      onEventClick,
      onSlotClick,
      onScroll,
      onEventMove,
      renderEvent,
      renderRowLabel,
    ]
  )

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  )
}

export function useTimeline(): TimelineContextValue {
  const context = useContext(TimelineContext)
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider')
  }
  return context
}
