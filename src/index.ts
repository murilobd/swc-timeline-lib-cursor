// Main component
export { Timeline } from './components/Timeline'

// Types
export type {
  Row,
  RowIndicator,
  RowAvailability,
  Period,
  TimelineEvent,
  EventStatus,
  TimelineConfig,
  TimelineProps,
  VisibleRange,
  PeriodMarkerConfig,
  InfiniteScrollConfig,
  ResolvedTimelineConfig,
} from './types'

// Hooks (for advanced usage)
export {
  useTimelineScroll,
  useNowIndicator,
  usePeriodLabels,
  useTimelineLayout,
} from './hooks'

// Context (for advanced customization)
export { useTimeline, TimelineProvider } from './context/TimelineContext'

// Utilities
export {
  formatTime,
  formatHour,
  getPeriodMarker,
  getHourMarkers,
  getPositionPercentage,
  getWidthPercentage,
  getActivePeriod,
  isInTransition,
  formatDuration,
} from './utils/timeUtils'

export {
  getEventLayout,
  formatRowLabel,
  getScrollPositionForTime,
  getVisibleRange,
} from './utils/layoutUtils'

export { COLORS, CSS_VARS } from './utils/constants'
