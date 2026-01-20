import { differenceInMinutes } from 'date-fns'
import type { TimelineEvent, ResolvedTimelineConfig } from '../types'

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
