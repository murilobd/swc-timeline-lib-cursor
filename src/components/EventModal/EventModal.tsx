import { useState, useCallback, useEffect, useMemo } from 'react'
import { differenceInMinutes } from 'date-fns'
import type { TimelineEvent, EventStatus, StatusChange } from '../../types'
import styles from './EventModal.module.css'

interface EventModalProps {
  event: TimelineEvent
  onClose: () => void
  onSubmit: (change: StatusChange) => void
}

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'early', label: 'Early' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
]

/**
 * Format duration in minutes to human-readable string
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

export function EventModal({ event, onClose, onSubmit }: EventModalProps) {
  const plannedDuration = useMemo(() => {
    return differenceInMinutes(event.endTime, event.startTime)
  }, [event.startTime, event.endTime])

  const [selectedStatus, setSelectedStatus] = useState<EventStatus>(
    event.status ?? 'planned'
  )
  const [actualDuration, setActualDuration] = useState<number>(
    event.actualDuration ?? plannedDuration
  )

  // Reset actual duration when status changes (only for delayed/early)
  useEffect(() => {
    if (selectedStatus !== 'delayed' && selectedStatus !== 'early') {
      setActualDuration(plannedDuration)
    }
  }, [selectedStatus, plannedDuration])

  // Calculate duration difference for indicator
  const durationDiff = useMemo(() => {
    const diff = actualDuration - plannedDuration
    if (diff > 0) {
      return { value: diff, type: 'delayed' as const }
    }
    if (diff < 0) {
      return { value: Math.abs(diff), type: 'early' as const }
    }
    return null
  }, [actualDuration, plannedDuration])

  // Handle overlay click (close modal)
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  // Handle keyboard escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Handle submit
  const handleSubmit = useCallback(() => {
    const change: StatusChange = {
      eventId: event.id,
      newStatus: selectedStatus,
    }

    // Include actualDuration for delayed/early statuses
    if (selectedStatus === 'delayed' || selectedStatus === 'early') {
      change.actualDuration = actualDuration
    }

    onSubmit(change)
    onClose()
  }, [event.id, selectedStatus, actualDuration, onSubmit, onClose])

  // Check if actual duration input should be shown
  const showDurationInput = selectedStatus === 'delayed' || selectedStatus === 'early'

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{event.title}</h2>
          <p className={styles.subtitle}>
            Update task status and duration
          </p>
        </div>

        <div className={styles.body}>
          {/* Status Selection */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Status</div>
            <div className={styles.statusGrid}>
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.statusButton} ${
                    selectedStatus === option.value ? styles.selected : ''
                  }`}
                  data-status={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Section */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Duration</div>
            <div className={styles.durationSection}>
              <div className={styles.durationRow}>
                <span className={styles.durationLabel}>Planned duration</span>
                <span className={styles.durationValue}>
                  {formatDuration(plannedDuration)}
                </span>
              </div>

              {showDurationInput && (
                <div className={styles.durationRow}>
                  <span className={styles.durationLabel}>Actual duration</span>
                  <div className={styles.durationInputGroup}>
                    <input
                      type="number"
                      className={styles.durationInput}
                      value={actualDuration}
                      onChange={(e) =>
                        setActualDuration(Math.max(1, parseInt(e.target.value) || 0))
                      }
                      min={1}
                    />
                    <span className={styles.durationUnit}>min</span>
                  </div>
                </div>
              )}

              {showDurationInput && durationDiff && (
                <div className={styles.durationRow}>
                  <span className={styles.durationLabel}>Difference</span>
                  <span
                    className={`${styles.diffIndicator} ${styles[durationDiff.type]}`}
                  >
                    {durationDiff.type === 'delayed' ? '+' : '-'}
                    {durationDiff.value} min {durationDiff.type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={`${styles.button} ${styles.buttonCancel}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles.buttonSubmit}`}
            onClick={handleSubmit}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
