import { useMemo } from 'react'
import { useTimeline } from '../../context/TimelineContext'
import { getPositionPercentage } from '../../utils/timeUtils'
import styles from './NowIndicator.module.css'

export function NowIndicator() {
  const { config, currentTime, rowColumnWidth } = useTimeline()

  // Check if current time is within the visible range
  const isVisible = useMemo(() => {
    return currentTime >= config.startDate && currentTime <= config.endDate
  }, [currentTime, config.startDate, config.endDate])

  // Calculate position percentage
  const leftPercent = useMemo(() => {
    if (!isVisible) return 0
    return getPositionPercentage(currentTime, config.startDate, config.endDate)
  }, [currentTime, config.startDate, config.endDate, isVisible])

  if (!config.showNowIndicator || !isVisible) {
    return null
  }

  return (
    <div
      className={styles.indicator}
      style={{
        left: `calc(${rowColumnWidth}px + ${leftPercent}%)`,
      }}
    >
      <div className={styles.dot} />
      <div className={styles.line} />
    </div>
  )
}
