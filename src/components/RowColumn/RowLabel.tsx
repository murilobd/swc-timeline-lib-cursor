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
  const { periods, visibleRange, renderRowLabel } = useTimeline()

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
  const displayLabel = formatRowLabel(currentLabel, false) // Always use full format for text
  const displayIncoming = incomingLabel
    ? formatRowLabel(incomingLabel, false)
    : undefined

  // Get initials for collapsed avatar
  const initials = useMemo(() => {
    if (!currentLabel) return ''
    const parts = currentLabel.trim().split(' ')
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }, [currentLabel])

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

  // Collapsed view: show avatar badge with initials
  if (isCollapsed) {
    return (
      <div className={styles.rowLabel} data-unavailable={isUnavailable}>
        {isUnavailable ? (
          <div className={styles.avatarBadge}>
            <span className={styles.avatarInitials}>—</span>
          </div>
        ) : (
          <div className={styles.avatarBadge}>
            <span className={styles.avatarInitials}>{initials}</span>
          </div>
        )}
      </div>
    )
  }

  // Expanded view: show indicator + full name
  return (
    <div className={styles.rowLabel} data-unavailable={isUnavailable}>
      {/* Status indicator */}
      {row.indicator && (
        <div className={styles.indicator} title={row.indicator.tooltip}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle
              cx="8"
              cy="8"
              r="5"
              fill="#5718B0"
              stroke="#B3A8E6"
              strokeWidth="6"
            />
          </svg>
        </div>
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
