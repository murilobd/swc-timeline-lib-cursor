import { useMemo, useCallback } from 'react'
import { addMinutes } from 'date-fns'
import { useTimeline } from '../../context/TimelineContext'
import { GridEvent } from './GridEvent'
import type { Row } from '../../types'
import styles from './TimelineGrid.module.css'

interface GridRowProps {
  row: Row
}

export function GridRow({ row }: GridRowProps) {
  const { events, config, onSlotClick, totalGridWidth } = useTimeline()

  // Get events for this row
  const rowEvents = useMemo(() => {
    return events.filter((e) => e.rowId === row.id)
  }, [events, row.id])

  // Check if row is unavailable
  const isUnavailable =
    row.availability && row.availability.status !== 'available'

  // Handle slot click
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onSlotClick || isUnavailable) return

      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickPercent = clickX / totalGridWidth

      const totalMinutes = config.totalMinutes
      const minutesOffset = clickPercent * totalMinutes
      const slotMinutes =
        Math.floor(minutesOffset / config.slotDuration) * config.slotDuration

      const clickTime = addMinutes(config.startDate, slotMinutes)
      onSlotClick(row.id, clickTime)
    },
    [onSlotClick, isUnavailable, totalGridWidth, config, row.id]
  )

  return (
    <div
      className={styles.row}
      data-unavailable={isUnavailable}
      onClick={handleClick}
    >
      {isUnavailable ? (
        <div className={styles.unavailableRow}>
          <span className={styles.unavailableDash}>—</span>
          <span className={styles.unavailableLabel}>
            {row.availability?.label ?? 'Unavailable'}
          </span>
        </div>
      ) : (
        rowEvents.map((event) => <GridEvent key={event.id} event={event} />)
      )}
    </div>
  )
}
