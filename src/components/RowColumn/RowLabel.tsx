import { useMemo } from 'react'
import { useTimeline } from '../../context/TimelineContext'
import { getActivePeriod, isInTransition } from '../../utils/timeUtils'
import { formatRowLabel } from '../../utils/layoutUtils'
import type { Row } from '../../types'
import styles from './RowColumn.module.css'

interface RowLabelProps {
  row: Row
  isCollapsed: boolean
}

export function RowLabel({ row, isCollapsed }: RowLabelProps) {
  const { periods, currentTime, visibleRange, renderRowLabel } = useTimeline()

  // Get the label for this row at the visible time
  const visibleMidpoint = useMemo(() => {
    return new Date(
      (visibleRange.start.getTime() + visibleRange.end.getTime()) / 2
    )
  }, [visibleRange])

  // Check for transition
  const transition = useMemo(() => {
    return isInTransition(visibleMidpoint, periods)
  }, [visibleMidpoint, periods])

  // Get current period label
  const { currentLabel, incomingLabel } = useMemo(() => {
    if (transition) {
      const outgoingLabel = transition.outgoing?.rowLabels[row.id] ?? ''
      const incoming = transition.incoming?.rowLabels[row.id] ?? ''
      return {
        currentLabel: outgoingLabel,
        incomingLabel: incoming,
      }
    }

    const activePeriod = getActivePeriod(visibleMidpoint, periods)
    return {
      currentLabel: activePeriod?.rowLabels[row.id] ?? '',
      incomingLabel: undefined,
    }
  }, [row.id, visibleMidpoint, periods, transition])

  // Format the display name
  const displayLabel = formatRowLabel(currentLabel, isCollapsed)
  const displayIncoming = incomingLabel
    ? formatRowLabel(incomingLabel, isCollapsed)
    : undefined

  // Check if row is unavailable
  const isUnavailable =
    row.availability && row.availability.status !== 'available'

  // Custom rendering
  if (renderRowLabel) {
    const customRender = renderRowLabel(row, currentLabel, isCollapsed)
    if (customRender) {
      return <div className={styles.rowLabel}>{customRender}</div>
    }
  }

  return (
    <div className={styles.rowLabel} data-unavailable={isUnavailable}>
      {/* Status indicator */}
      {row.indicator && (
        <div
          className={styles.indicator}
          style={{ backgroundColor: row.indicator.color }}
          title={row.indicator.tooltip}
        />
      )}

      {/* Label content */}
      <div className={styles.labelContent}>
        {isUnavailable ? (
          <span className={styles.unavailableText}>
            {row.availability?.label ?? 'Unavailable'}
          </span>
        ) : (
          <>
            {/* Current label */}
            <span
              className={styles.labelText}
              style={{
                opacity: transition ? 1 - transition.progress : 1,
              }}
            >
              {displayLabel}
            </span>

            {/* Incoming label (during transition) */}
            {displayIncoming && transition && (
              <span
                className={styles.incomingLabel}
                style={{
                  opacity: transition.progress,
                  transform: `translateX(${(1 - transition.progress) * 20}px)`,
                }}
              >
                {displayIncoming}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
