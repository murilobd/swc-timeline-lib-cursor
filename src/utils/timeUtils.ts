import {
  differenceInMinutes,
  format,
  addMinutes,
  startOfHour,
  isWithinInterval,
  getHours,
  getMinutes,
} from 'date-fns'
import type { TimelineConfig, Period } from '../types'

/**
 * Format time based on the configured format
 */
export function formatTime(
  date: Date,
  hourFormat: TimelineConfig['hourFormat']
): string {
  switch (hourFormat) {
    case '12h':
      return format(date, 'h:mm a')
    case '24h':
      return format(date, 'HH:mm')
    case 'french':
      return format(date, "HH'h'mm").replace(':00', '00')
    default:
      return format(date, 'HH:mm')
  }
}

/**
 * Format hour for header display
 */
export function formatHour(
  date: Date,
  hourFormat: TimelineConfig['hourFormat']
): string {
  switch (hourFormat) {
    case '12h':
      return format(date, 'h a')
    case '24h':
      return format(date, 'HH:00')
    case 'french':
      return format(date, "HH'h'00")
    default:
      return format(date, 'HH:00')
  }
}

/**
 * Calculate period marker (T0, T1, T2, etc.) for a given hour
 * Cycles from T0 to T7, then restarts at T0
 */
export function getPeriodMarker(
  hourDate: Date,
  referenceTime: Date,
  prefix: string
): string {
  const hoursDiff = Math.floor(
    differenceInMinutes(hourDate, referenceTime) / 60
  )
  
  // Cycle 0-7, handling negative numbers correctly
  const marker = ((hoursDiff % 8) + 8) % 8
  
  return `${prefix}${marker}`
}

/**
 * Get all hour markers within a time range
 */
export function getHourMarkers(startDate: Date, endDate: Date): Date[] {
  const markers: Date[] = []
  let current = startOfHour(startDate)
  
  // If start is not on the hour, move to next hour
  if (current < startDate) {
    current = addMinutes(current, 60)
  }
  
  while (current <= endDate) {
    markers.push(current)
    current = addMinutes(current, 60)
  }
  
  return markers
}

/**
 * Calculate position percentage within the timeline
 */
export function getPositionPercentage(
  time: Date,
  startDate: Date,
  endDate: Date
): number {
  const totalMinutes = differenceInMinutes(endDate, startDate)
  const offset = differenceInMinutes(time, startDate)
  return (offset / totalMinutes) * 100
}

/**
 * Calculate width percentage for a duration
 */
export function getWidthPercentage(
  startTime: Date,
  endTime: Date,
  totalStartDate: Date,
  totalEndDate: Date
): number {
  const totalMinutes = differenceInMinutes(totalEndDate, totalStartDate)
  const duration = differenceInMinutes(endTime, startTime)
  return (duration / totalMinutes) * 100
}

/**
 * Get the active period for a given time
 */
export function getActivePeriod(
  time: Date,
  periods: Period[]
): Period | undefined {
  return periods.find((p) =>
    isWithinInterval(time, { start: p.startTime, end: p.endTime })
  )
}

/**
 * Check if we're in a transition window between periods
 */
export function isInTransition(
  time: Date,
  periods: Period[]
): { outgoing?: Period; incoming?: Period; progress: number } | null {
  for (let i = 0; i < periods.length - 1; i++) {
    const current = periods[i]
    const next = periods[i + 1]
    const transitionDuration = current.transitionDuration ?? 15
    
    const transitionStart = addMinutes(current.endTime, -transitionDuration)
    const transitionEnd = addMinutes(next.startTime, transitionDuration)
    
    if (isWithinInterval(time, { start: transitionStart, end: transitionEnd })) {
      const totalTransitionMinutes = differenceInMinutes(
        transitionEnd,
        transitionStart
      )
      const elapsed = differenceInMinutes(time, transitionStart)
      const progress = elapsed / totalTransitionMinutes
      
      return {
        outgoing: current,
        incoming: next,
        progress: Math.min(1, Math.max(0, progress)),
      }
    }
  }
  
  return null
}

/**
 * Get current time rounded to nearest slot
 */
export function getCurrentTimeSlot(slotDuration: number): Date {
  const now = new Date()
  const minutes = getMinutes(now)
  const roundedMinutes = Math.floor(minutes / slotDuration) * slotDuration
  
  const result = new Date(now)
  result.setMinutes(roundedMinutes)
  result.setSeconds(0)
  result.setMilliseconds(0)
  
  return result
}

/**
 * Convert time to slot index
 */
export function timeToSlotIndex(
  time: Date,
  startDate: Date,
  slotDuration: number
): number {
  const minutes = differenceInMinutes(time, startDate)
  return Math.floor(minutes / slotDuration)
}

/**
 * Convert slot index to time
 */
export function slotIndexToTime(
  slotIndex: number,
  startDate: Date,
  slotDuration: number
): Date {
  return addMinutes(startDate, slotIndex * slotDuration)
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`
}
