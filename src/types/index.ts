import type { ReactNode } from 'react'

// Row indicator (status dot)
export interface RowIndicator {
  color: string
  tooltip?: string
}

// Row availability status
export interface RowAvailability {
  status: 'available' | 'absent' | 'break' | 'unavailable'
  label?: string // e.g., "out of office / absence / break"
}

// Core row type
export interface Row {
  id: string
  indicator?: RowIndicator
  availability?: RowAvailability
}

// Period defines row labels for a time range
export interface Period {
  id: string
  startTime: Date
  endTime: Date
  rowLabels: Record<string, string> // { rowId: "Label for this row" }
  transitionDuration?: number // minutes for overlap (default 15)
}

// Event status for visual styling
export type EventStatus =
  | 'planned'
  | 'in-progress'
  | 'delayed'
  | 'early'
  | 'blocked'
  | 'completed'

// Timeline event/task
export interface TimelineEvent {
  id: string
  rowId: string
  startTime: Date
  endTime: Date
  actualEndTime?: Date // For overflow visualization (delayed tasks)
  actualDuration?: number // Actual duration in minutes (for early/late calculation)
  title: string
  status?: EventStatus
  color?: string
  data?: unknown // Custom payload for renderEvent
}

// Status change result
export interface StatusChange {
  eventId: string
  newStatus: EventStatus
  actualDuration?: number // For delayed/early - actual duration in minutes
}

// Period markers configuration
export interface PeriodMarkerConfig {
  enabled: boolean
  prefix: string // e.g., "T" for "T0, T1, T2..."
  referenceTime: Date // Period start (T0)
}

// Infinite scroll configuration
export interface InfiniteScrollConfig {
  enabled: boolean
  loadMoreDays: number // days to load on scroll edge
}

// Timeline configuration
export interface TimelineConfig {
  startDate: Date
  endDate: Date
  slotDuration: number // minutes (default 5)
  hourFormat: '12h' | '24h' | 'french' // "3:00 PM" | "15:00" | "15h00"
  showNowIndicator: boolean
  autoScrollToNow: boolean
  infiniteScroll?: InfiniteScrollConfig
  periodMarkers?: PeriodMarkerConfig
}

// Visible time range
export interface VisibleRange {
  start: Date
  end: Date
}

// Event move result for drag-and-drop
export interface EventMove {
  eventId: string
  newStartTime: Date
  newEndTime: Date
}

// Main component props
export interface TimelineProps {
  rows: Row[]
  periods: Period[]
  events: TimelineEvent[]
  config: Partial<TimelineConfig>

  // Custom rendering
  renderEvent?: (event: TimelineEvent, defaultRender: ReactNode) => ReactNode
  renderRowLabel?: (
    row: Row,
    label: string,
    isCollapsed: boolean
  ) => ReactNode

  // Callbacks
  onEventClick?: (event: TimelineEvent) => void
  onSlotClick?: (rowId: string, time: Date) => void
  onScroll?: (visibleRange: VisibleRange) => void
  onEventMove?: (moves: EventMove[]) => void
  onStatusChange?: (change: StatusChange) => void

  // Layout
  rowColumnWidth?: { expanded: number; collapsed: number }
}

// Internal resolved config (with defaults applied)
export interface ResolvedTimelineConfig extends TimelineConfig {
  totalMinutes: number
  slotCount: number
  hourCount: number
}
