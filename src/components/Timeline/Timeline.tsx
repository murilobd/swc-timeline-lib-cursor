import { TimelineProvider } from '../../context/TimelineContext'
import { TimelineHeader } from '../TimelineHeader'
import { RowColumn } from '../RowColumn'
import { TimelineGrid } from '../TimelineGrid'
import { NowIndicator } from '../NowIndicator'
import { CSS_VARS } from '../../utils/constants'
import type { TimelineProps } from '../../types'
import styles from './Timeline.module.css'

export function Timeline(props: TimelineProps) {
  const cssVars = CSS_VARS as React.CSSProperties

  return (
    <TimelineProvider {...props}>
      <div className={styles.timeline} style={cssVars}>
        <TimelineHeader />
        <div className={styles.body}>
          <RowColumn />
          <TimelineGrid />
          <NowIndicator />
        </div>
      </div>
    </TimelineProvider>
  )
}
