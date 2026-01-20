import { useMemo } from 'react'
import { useTimeline } from '../../context/TimelineContext'
import { getPositionPercentage } from '../../utils/timeUtils'
import styles from './NowIndicator.module.css'

export function NowIndicator() {
  const { config, currentTime, rowColumnWidth, totalGridWidth, scrollLeft } = useTimeline()

  // Check if current time is within the visible range
  const isVisible = useMemo(() => {
    return currentTime >= config.startDate && currentTime <= config.endDate
  }, [currentTime, config.startDate, config.endDate])

  // Calculate position in pixels relative to grid, accounting for scroll
  const leftPosition = useMemo(() => {
    if (!isVisible) return 0
    const positionPercent = getPositionPercentage(currentTime, config.startDate, config.endDate)
    const positionInGrid = (positionPercent / 100) * totalGridWidth
    return rowColumnWidth + positionInGrid - scrollLeft
  }, [currentTime, config.startDate, config.endDate, isVisible, totalGridWidth, rowColumnWidth, scrollLeft])

  if (!config.showNowIndicator || !isVisible) {
    return null
  }

  return (
    <>
      <div
        className={styles.dot}
        style={{ left: leftPosition }}
      />
      <div
        className={styles.line}
        style={{ left: leftPosition }}
      />
    </>
  )
}
