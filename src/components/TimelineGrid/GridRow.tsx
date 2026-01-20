import { useMemo, useCallback, useState } from 'react'
import { addMinutes } from 'date-fns'
import { useTimeline } from '../../context/TimelineContext'
import { calculateCascade } from '../../utils/layoutUtils'
import { GridEvent } from './GridEvent'
import type { Row } from '../../types'
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

  // Calculate valid drop zones (one per available slot)
  const dropZones = useMemo<DropZone[]>(() => {
    if (!draggingEvent) return []

    const zones: DropZone[] = []
    const slotWidth = 12 // DEFAULT_SLOT_WIDTH

    // Check each slot in the timeline
    for (let slotIdx = 0; slotIdx < config.slotCount; slotIdx++) {
      const slotStartTime = addMinutes(config.startDate, slotIdx * config.slotDuration)
      
      // Use calculateCascade to check if this is a valid drop position
      const result = calculateCascade(draggingEvent.id, slotStartTime, rowEvents)
      
      // If result is not null and not blocked, this is a valid drop position
      if (result !== null && !result.blocked) {
        zones.push({
          left: slotIdx * slotWidth,
          width: slotWidth,
        })
      }
    }

    return zones
  }, [draggingEvent, rowEvents, config])

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
