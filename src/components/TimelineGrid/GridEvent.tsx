import { useMemo, useCallback, useState } from 'react'
import { useTimeline } from '../../context/TimelineContext'
import { getEventLayout } from '../../utils/layoutUtils'
import type { TimelineEvent, EventStatus } from '../../types'
import styles from './GridEvent.module.css'

interface GridEventProps {
  event: TimelineEvent
}

const STATUS_COLORS: Record<EventStatus, { border: string; bg: string }> = {
  scheduled: { border: '#C4C4FF', bg: '#FFFFFF' },
  'in-progress': { border: '#7C7CFF', bg: '#FFFFFF' },
  delayed: { border: '#FF6B6B', bg: '#FFFFFF' },
  early: { border: '#4CAF50', bg: '#FFFFFF' },
  blocked: { border: '#8B0000', bg: '#5C1A1A' },
  completed: { border: '#CCCCCC', bg: '#F5F5F5' },
}

export function GridEvent({ event }: GridEventProps) {
  const { config, onEventClick, onEventMove, renderEvent, setDraggingEventId } = useTimeline()
  const [isDragging, setIsDragging] = useState(false)

  // Calculate position and dimensions
  const layout = useMemo(() => {
    return getEventLayout(event, config)
  }, [event, config])

  // Get colors based on status
  const colors = useMemo(() => {
    const status = event.status ?? 'scheduled'
    return STATUS_COLORS[status] ?? STATUS_COLORS.scheduled
  }, [event.status])

  // Handle click
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent slot click
      onEventClick?.(event)
    },
    [onEventClick, event]
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
        data-status={event.status ?? 'scheduled'}
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
            backgroundColor: '#FF6B6B',
          }}
        />
      )}
    </>
  )
}
