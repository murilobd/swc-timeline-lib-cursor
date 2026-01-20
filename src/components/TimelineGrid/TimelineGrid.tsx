import { useMemo, useCallback } from 'react'
import { addMinutes, differenceInMinutes } from 'date-fns'
import { useTimeline } from '../../context/TimelineContext'
import { GridRow } from './GridRow'
import { getHourMarkers } from '../../utils/timeUtils'
import styles from './TimelineGrid.module.css'

export function TimelineGrid() {
  const { rows, periods, config, totalGridWidth, setScrollLeft, scrollContainerRef } =
    useTimeline()

  const hourMarkers = useMemo(() => {
    return getHourMarkers(config.startDate, config.endDate)
  }, [config.startDate, config.endDate])

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollLeft(e.currentTarget.scrollLeft)
    },
    [setScrollLeft]
  )

  const slotWidthPercent = 100 / config.hourCount

  // Calculate transition zones
  const transitionZones = useMemo(() => {
    const zones: { leftPercent: number; widthPercent: number; incomingLabels: Record<string, string> }[] = []
    const totalMinutes = config.totalMinutes

    for (let i = 0; i < periods.length - 1; i++) {
      const period = periods[i]
      const nextPeriod = periods[i + 1]
      const transitionDuration = period.transitionDuration ?? 15

      const transitionStart = period.endTime
      const transitionEnd = addMinutes(transitionStart, transitionDuration)

      if (transitionEnd < config.startDate || transitionStart > config.endDate) {
        continue
      }

      const startOffset = Math.max(0, differenceInMinutes(transitionStart, config.startDate))
      const endOffset = Math.min(totalMinutes, differenceInMinutes(transitionEnd, config.startDate))

      const leftPercent = (startOffset / totalMinutes) * 100
      const widthPercent = ((endOffset - startOffset) / totalMinutes) * 100

      zones.push({
        leftPercent,
        widthPercent,
        incomingLabels: nextPeriod.rowLabels,
      })
    }

    return zones
  }, [periods, config])

  return (
    <div
      ref={scrollContainerRef}
      className={styles.gridContainer}
      onScroll={handleScroll}
    >
      <div className={styles.grid} style={{ width: totalGridWidth }}>
        {/* Hour vertical lines */}
        <div className={styles.hourLines}>
          {hourMarkers.map((hourDate, index) => (
            <div
              key={hourDate.getTime()}
              className={styles.hourLine}
              style={{ left: `${index * slotWidthPercent}%` }}
            />
          ))}
        </div>

        {/* Transition zones */}
        {transitionZones.map((zone, idx) => (
          <div
            key={idx}
            className={styles.transitionZone}
            style={{
              left: `${zone.leftPercent}%`,
              width: `${zone.widthPercent}%`,
            }}
          >
            <div className={styles.transitionHeader}>Shift Handover</div>
            {rows.map((row) => {
              const incomingLabel = zone.incomingLabels[row.id]
              if (!incomingLabel) return null
              return (
                <div key={row.id} className={styles.transitionRow}>
                  <span className={styles.incomingName}>{incomingLabel}</span>
                </div>
              )
            })}
          </div>
        ))}

        {/* Rows */}
        <div className={styles.rows}>
          {rows.map((row) => (
            <GridRow key={row.id} row={row} />
          ))}
        </div>
      </div>
    </div>
  )
}
