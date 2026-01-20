import { useMemo } from 'react'
import { useTimeline } from '../../context/TimelineContext'
import { getHourMarkers, formatHour, getPeriodMarker } from '../../utils/timeUtils'
import styles from './TimelineHeader.module.css'

export function TimelineHeader() {
  const { config, rowColumnWidth, totalGridWidth, scrollLeft } = useTimeline()

  const hourMarkers = useMemo(() => {
    return getHourMarkers(config.startDate, config.endDate)
  }, [config.startDate, config.endDate])

  const slotWidthPercent = 100 / config.hourCount

  return (
    <div className={styles.header}>
      {/* Spacer for row column */}
      <div
        className={styles.rowColumnSpacer}
        style={{ width: rowColumnWidth }}
      />

      {/* Time labels */}
      <div
        className={styles.timeLabels}
        style={{
          width: totalGridWidth,
          transform: `translateX(-${scrollLeft}px)`,
        }}
      >
        {hourMarkers.map((hourDate, index) => {
          const timeLabel = formatHour(hourDate, config.hourFormat)
          const periodMarker =
            config.periodMarkers?.enabled && config.periodMarkers.referenceTime
              ? getPeriodMarker(
                  hourDate,
                  config.periodMarkers.referenceTime,
                  config.periodMarkers.prefix
                )
              : null

          return (
            <div
              key={hourDate.getTime()}
              className={styles.hourColumn}
              style={{
                width: `${slotWidthPercent}%`,
                left: `${index * slotWidthPercent}%`,
              }}
            >
              <div className={styles.timeLabel}>{timeLabel}</div>
              {periodMarker !== null && (
                <div className={styles.periodMarker}>{periodMarker}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
