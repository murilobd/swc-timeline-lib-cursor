import { differenceInMinutes, addMinutes } from 'date-fns'
import type { TimelineEvent, ResolvedTimelineConfig, EventMove } from '../types'

/**
 * Calculate event position and dimensions
 */
export function getEventLayout(
  event: TimelineEvent,
  config: ResolvedTimelineConfig
): {
  left: string
  width: string
  overflowWidth?: string
} {
  const { startDate, endDate } = config
  const totalMinutes = differenceInMinutes(endDate, startDate)
  
  const startOffset = differenceInMinutes(event.startTime, startDate)
  const plannedDuration = differenceInMinutes(event.endTime, event.startTime)
  
  const left = `${(startOffset / totalMinutes) * 100}%`
  const width = `${(plannedDuration / totalMinutes) * 100}%`
  
  // Calculate overflow for delayed events
  let overflowWidth: string | undefined
  if (event.actualEndTime && event.actualEndTime > event.endTime) {
    const overflowDuration = differenceInMinutes(
      event.actualEndTime,
      event.endTime
    )
    overflowWidth = `${(overflowDuration / totalMinutes) * 100}%`
  }
  
  return { left, width, overflowWidth }
}

/**
 * Calculate the scroll position to center a specific time
 */
export function getScrollPositionForTime(
  time: Date,
  config: ResolvedTimelineConfig,
  containerWidth: number,
  totalGridWidth: number
): number {
  const { startDate, endDate } = config
  const totalMinutes = differenceInMinutes(endDate, startDate)
  const timeOffset = differenceInMinutes(time, startDate)
  
  const timePosition = (timeOffset / totalMinutes) * totalGridWidth
  const centerOffset = containerWidth / 2
  
  return Math.max(0, timePosition - centerOffset)
}

/**
 * Calculate time from scroll position
 */
export function getTimeFromScrollPosition(
  scrollLeft: number,
  config: ResolvedTimelineConfig,
  totalGridWidth: number
): Date {
  const { startDate, endDate } = config
  const totalMinutes = differenceInMinutes(endDate, startDate)
  
  const scrollPercentage = scrollLeft / totalGridWidth
  const minutesOffset = scrollPercentage * totalMinutes
  
  return new Date(startDate.getTime() + minutesOffset * 60 * 1000)
}

/**
 * Get visible time range based on scroll position
 */
export function getVisibleRange(
  scrollLeft: number,
  containerWidth: number,
  config: ResolvedTimelineConfig,
  totalGridWidth: number
): { start: Date; end: Date } {
  const startTime = getTimeFromScrollPosition(scrollLeft, config, totalGridWidth)
  const endTime = getTimeFromScrollPosition(
    scrollLeft + containerWidth,
    config,
    totalGridWidth
  )
  
  return { start: startTime, end: endTime }
}

/**
 * Calculate grid width in pixels based on configuration
 */
export function calculateGridWidth(
  config: ResolvedTimelineConfig,
  slotWidth: number
): number {
  return config.slotCount * slotWidth
}

/**
 * Format name based on collapsed state
 */
export function formatRowLabel(
  fullName: string,
  isCollapsed: boolean
): string {
  if (!fullName) return ''
  
  const parts = fullName.trim().split(' ')
  
  if (parts.length === 1) {
    return isCollapsed ? parts[0].charAt(0) + '.' : parts[0]
  }
  
  const firstName = parts[0]
  const lastInitial = parts[parts.length - 1].charAt(0)
  
  if (isCollapsed) {
    return `${firstName.charAt(0)}.${lastInitial}.`
  }
  
  return `${firstName} ${lastInitial}.`
}

/**
 * Calculate cascade effect when moving an event to a new time.
 * Returns null if drop position overlaps an existing task.
 * Returns { moves, blocked: true } if cascade would push a blocked task.
 * Returns { moves, blocked: false } with all affected events on success.
 */
export function calculateCascade(
  movedEventId: string,
  newStartTime: Date,
  rowEvents: TimelineEvent[]
): { moves: EventMove[]; blocked: boolean } | null {
  // Find the moved event
  const movedEvent = rowEvents.find((e) => e.id === movedEventId)
  if (!movedEvent) return null

  // Calculate moved event duration
  const duration = differenceInMinutes(movedEvent.endTime, movedEvent.startTime)
  const newEndTime = addMinutes(newStartTime, duration)

  // Get other events in the row (excluding the moved one)
  const otherEvents = rowEvents.filter((e) => e.id !== movedEventId)

  // Check if drop position overlaps any existing task
  for (const event of otherEvents) {
    // Overlap: newStartTime falls inside another event's time range
    if (newStartTime >= event.startTime && newStartTime < event.endTime) {
      return null // Invalid drop position
    }
  }

  // Build list of moves, starting with the moved event
  const moves: EventMove[] = [
    {
      eventId: movedEventId,
      newStartTime,
      newEndTime,
    },
  ]

  // Get events that start at or after the moved event's new position
  // and sort by their original start time
  const eventsToCheck = otherEvents
    .filter((e) => e.startTime >= newStartTime)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  // Track the end time of the last placed event
  let lastEndTime = newEndTime

  for (const event of eventsToCheck) {
    const eventDuration = differenceInMinutes(event.endTime, event.startTime)

    // Check if this event overlaps with the last placed event
    if (event.startTime < lastEndTime) {
      // This event needs to be pushed
      if (event.status === 'blocked') {
        // Cannot push a blocked event
        return { moves: [], blocked: true }
      }

      // Push the event to start at lastEndTime
      const pushedStartTime = lastEndTime
      const pushedEndTime = addMinutes(pushedStartTime, eventDuration)

      moves.push({
        eventId: event.id,
        newStartTime: pushedStartTime,
        newEndTime: pushedEndTime,
      })

      lastEndTime = pushedEndTime
    } else {
      // No overlap, this event stays where it is
      lastEndTime = event.endTime
    }
  }

  return { moves, blocked: false }
}
