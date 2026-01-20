import { useMemo, useCallback, useState } from 'react'
import { differenceInMinutes } from 'date-fns'
import { useTimeline } from '../../context/TimelineContext'
import { getEventLayout } from '../../utils/layoutUtils'
import type { TimelineEvent, EventStatus } from '../../types'
import styles from './GridEvent.module.css'

interface GridEventProps {
  event: TimelineEvent
}

const STATUS_COLORS: Record<EventStatus, { border: string; bg: string }> = {
  planned: { border: '#C4C4FF', bg: '#FFFFFF' },
  'in-progress': { border: '#7C7CFF', bg: '#FFFFFF' },
  delayed: { border: '#FF6B6B', bg: '#FFFFFF' },
  early: { border: '#4CAF50', bg: '#FFFFFF' },
  blocked: { border: '#8B0000', bg: '#5C1A1A' },
  completed: { border: '#CCCCCC', bg: '#F5F5F5' },
}

/**
 * Format duration in minutes to human-readable string
 * e.g., 90 -> "1h30", 45 -> "45min", 60 -> "1h"
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h${mins.toString().padStart(2, '0')}`
}

/**
 * Timer icon SVG component
 */
function TimerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 2h6" />
      <path d="M12 2v2" />
    </svg>
  )
}

export function GridEvent({ event }: GridEventProps) {
  const { config, onEventClick, onEventMove, onStatusChange, openEventModal, renderEvent, setDraggingEventId } = useTimeline()
  const [isDragging, setIsDragging] = useState(false)

  // Calculate position and dimensions
  const layout = useMemo(() => {
    return getEventLayout(event, config)
  }, [event, config])

  // Get colors based on status
  const colors = useMemo(() => {
    const status = event.status ?? 'planned'
    return STATUS_COLORS[status] ?? STATUS_COLORS.planned
  }, [event.status])

  // Calculate planned duration and duration modifier for delayed/early
  const durationInfo = useMemo(() => {
    const plannedMinutes = differenceInMinutes(event.endTime, event.startTime)
    const status = event.status ?? 'planned'
    
    // If actualDuration is set, calculate the difference
    if (event.actualDuration !== undefined) {
      const diff = event.actualDuration - plannedMinutes
      if (status === 'delayed' && diff > 0) {
        return {
          display: formatDuration(event.actualDuration),
          modifier: `(${diff} min. delayed)`,
          modifierType: 'delayed' as const,
        }
      }
      if (status === 'early' && diff < 0) {
        return {
          display: formatDuration(event.actualDuration),
          modifier: `(${Math.abs(diff)} min. early)`,
          modifierType: 'early' as const,
        }
      }
    }
    
    // For delayed events with actualEndTime, calculate from that
    if (status === 'delayed' && event.actualEndTime) {
      const actualMinutes = differenceInMinutes(event.actualEndTime, event.startTime)
      const diff = actualMinutes - plannedMinutes
      if (diff > 0) {
        return {
          display: formatDuration(actualMinutes),
          modifier: `(${diff} min. delayed)`,
          modifierType: 'delayed' as const,
        }
      }
    }
    
    // Default: just show planned duration
    return {
      display: formatDuration(plannedMinutes),
      modifier: null,
      modifierType: null,
    }
  }, [event])

  // Handle click
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent slot click
      onEventClick?.(event)
      
      // Open modal if onStatusChange is provided
      if (onStatusChange) {
        openEventModal(event)
      }
    },
    [onEventClick, onStatusChange, openEventModal, event]
  )

  // Determine if event can be dragged (not blocked, and onEventMove is provided)
  const isDraggable = event.status !== 'blocked' && !!onEventMove

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!isDraggable) {
        e.preventDefault()
        return
      }
      e.dataTransfer.setData('text/plain', event.id)
      e.dataTransfer.effectAllowed = 'move'
      setIsDragging(true)
      setDraggingEventId(event.id)
    },
    [event.id, isDraggable, setDraggingEventId]
  )

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setDraggingEventId(null)
  }, [setDraggingEventId])

  // Default render content
  const defaultRender = (
    <div className={styles.eventContent}>
      <span className={styles.eventTitle}>{event.title}</span>
      <div className={styles.eventDuration}>
        <TimerIcon className={styles.timerIcon} />
        <span className={styles.durationText}>
          {durationInfo.display}
          {durationInfo.modifier && (
            <span className={`${styles.durationModifier} ${styles[durationInfo.modifierType!]}`}>
              {durationInfo.modifier}
            </span>
          )}
        </span>
      </div>
    </div>
  )

  // Check for custom rendering
  const content = renderEvent ? renderEvent(event, defaultRender) : defaultRender

  return (
    <>
      {/* Main event block */}
      <div
        className={`${styles.event} ${isDragging ? styles.dragging : ''}`}
        style={{
          left: layout.left,
          width: layout.width,
          borderLeftColor: colors.border,
          backgroundColor: colors.bg,
        }}
        data-status={event.status ?? 'planned'}
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
      >
        {content}
      </div>

      {/* Overflow indicator for delayed events */}
      {layout.overflowWidth && (
        <div
          className={styles.overflow}
          style={{
            left: `calc(${layout.left} + ${layout.width})`,
            width: layout.overflowWidth,
          }}
        />
      )}
    </>
  )
}
