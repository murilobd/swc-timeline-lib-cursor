import { useMemo, useCallback, useState } from 'react'
import { addMinutes, differenceInMinutes } from 'date-fns'
import { useTimeline } from '../../context/TimelineContext'
import { calculateCascade } from '../../utils/layoutUtils'
import { GridEvent } from './GridEvent'
import type { Row, TimelineEvent } from '../../types'
import styles from './TimelineGrid.module.css'

interface GridRowProps {
  row: Row
}

interface DropZone {
  left: number
  width: number
}

export function GridRow({ row }: GridRowProps) {
  const { events, config, onSlotClick, onEventMove, totalGridWidth, draggingEventId } = useTimeline()
  const [isDragOver, setIsDragOver] = useState(false)

  // Get events for this row
  const rowEvents = useMemo(() => {
    return events.filter((e) => e.rowId === row.id)
  }, [events, row.id])

  // Get the event being dragged (if it belongs to this row)
  const draggingEvent = useMemo(() => {
    if (!draggingEventId) return null
    return rowEvents.find((e) => e.id === draggingEventId) ?? null
  }, [draggingEventId, rowEvents])

  // Calculate valid drop zones
  const dropZones = useMemo<DropZone[]>(() => {
    if (!draggingEvent) return []

    const zones: DropZone[] = []
    const dragDuration = differenceInMinutes(draggingEvent.endTime, draggingEvent.startTime)
    const slotWidth = 12 // DEFAULT_SLOT_WIDTH
    const minWidth = Math.max(slotWidth, (dragDuration / config.slotDuration) * slotWidth)

    // Get other events (excluding the one being dragged), sorted by start time
    const otherEvents = rowEvents
      .filter((e) => e.id !== draggingEvent.id)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

    // Helper to convert time to pixel position
    const timeToPixel = (time: Date): number => {
      const minutesFromStart = differenceInMinutes(time, config.startDate)
      return (minutesFromStart / config.totalMinutes) * totalGridWidth
    }

    // Helper to check if a position is valid (doesn't overlap any task)
    const isValidPosition = (startTime: Date): boolean => {
      const endTime = addMinutes(startTime, dragDuration)
      for (const event of otherEvents) {
        // Skip blocked events - they can be pushed if cascade allows
        if (event.status === 'blocked') {
          // If dropping before or on a blocked event, check cascade
          if (startTime < event.endTime && endTime > event.startTime) {
            return false // Direct overlap with blocked event
          }
        } else {
          // For regular events, check if drop position overlaps
          if (startTime < event.endTime && endTime > event.startTime) {
            return false // Overlap
          }
        }
      }
      return true
    }

    // Add zone at timeline start if valid
    if (isValidPosition(config.startDate)) {
      const firstEvent = otherEvents[0]
      const endPixel = firstEvent ? timeToPixel(firstEvent.startTime) : totalGridWidth
      zones.push({
        left: 0,
        width: Math.min(endPixel, minWidth),
      })
    }

    // Add zones after each event ends
    for (let i = 0; i < otherEvents.length; i++) {
      const event = otherEvents[i] as TimelineEvent
      const nextEvent = otherEvents[i + 1]
      
      // The drop zone starts at the end of this event
      const zoneStart = event.endTime
      const zoneEnd = nextEvent ? nextEvent.startTime : config.endDate

      // Check if there's enough space and position is valid
      if (isValidPosition(zoneStart)) {
        const leftPixel = timeToPixel(zoneStart)
        const rightPixel = timeToPixel(zoneEnd)
        const availableWidth = rightPixel - leftPixel

        if (availableWidth > 0) {
          zones.push({
            left: leftPixel,
            width: Math.min(availableWidth, minWidth),
          })
        }
      }
    }

    return zones
  }, [draggingEvent, rowEvents, config, totalGridWidth])

  // Check if row is unavailable
  const isUnavailable =
    row.availability && row.availability.status !== 'available'

  // Calculate time from X position (snapped to slot)
  const getTimeFromPosition = useCallback(
    (clientX: number, rect: DOMRect): Date => {
      const clickX = clientX - rect.left
      const clickPercent = clickX / totalGridWidth
      const totalMinutes = config.totalMinutes
      const minutesOffset = clickPercent * totalMinutes
      const slotMinutes =
        Math.floor(minutesOffset / config.slotDuration) * config.slotDuration
      return addMinutes(config.startDate, slotMinutes)
    },
    [totalGridWidth, config]
  )

  // Handle slot click
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onSlotClick || isUnavailable) return
      const rect = e.currentTarget.getBoundingClientRect()
      const clickTime = getTimeFromPosition(e.clientX, rect)
      onSlotClick(row.id, clickTime)
    },
    [onSlotClick, isUnavailable, getTimeFromPosition, row.id]
  )

  // Handle drag over
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (isUnavailable || !onEventMove) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setIsDragOver(true)
    },
    [isUnavailable, onEventMove]
  )

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)

      if (isUnavailable || !onEventMove) return

      const eventId = e.dataTransfer.getData('text/plain')
      if (!eventId) return

      // Check if the dragged event belongs to this row
      const draggedEvent = rowEvents.find((ev) => ev.id === eventId)
      if (!draggedEvent) return // Event not in this row, ignore

      const rect = e.currentTarget.getBoundingClientRect()
      const dropTime = getTimeFromPosition(e.clientX, rect)

      // Calculate cascade effect
      const result = calculateCascade(eventId, dropTime, rowEvents)

      if (result === null) {
        // Invalid drop position (overlaps existing task)
        return
      }

      if (result.blocked) {
        // Cascade would push a blocked task
        return
      }

      // Call the callback with all moves
      onEventMove(result.moves)
    },
    [isUnavailable, onEventMove, rowEvents, getTimeFromPosition]
  )

  return (
    <div
      className={styles.row}
      data-unavailable={isUnavailable}
      data-drag-over={isDragOver}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUnavailable ? (
        <div className={styles.unavailableRow}>
          <span className={styles.unavailableDash}>—</span>
          <span className={styles.unavailableLabel}>
            {row.availability?.label ?? 'Unavailable'}
          </span>
        </div>
      ) : (
        <>
          {/* Drop zone indicators */}
          {dropZones.map((zone, idx) => (
            <div
              key={`dropzone-${idx}`}
              className={styles.dropZone}
              style={{
                left: zone.left,
                width: zone.width,
              }}
            />
          ))}
          {/* Events */}
          {rowEvents.map((event) => <GridEvent key={event.id} event={event} />)}
        </>
      )}
    </div>
  )
}
