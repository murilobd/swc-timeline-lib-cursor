import { TimelineProvider, useTimeline } from '../../context/TimelineContext'
import { TimelineHeader } from '../TimelineHeader'
import { RowColumn } from '../RowColumn'
import { TimelineGrid } from '../TimelineGrid'
import { NowIndicator } from '../NowIndicator'
import { EventModal } from '../EventModal'
import { CSS_VARS } from '../../utils/constants'
import type { TimelineProps } from '../../types'
import styles from './Timeline.module.css'

/**
 * Inner component that can access the context for modal rendering
 */
function TimelineContent() {
  const {
    modalEvent,
    isModalOpen,
    closeEventModal,
    onStatusChange,
  } = useTimeline()

  return (
    <>
      <TimelineHeader />
      <div className={styles.body}>
        <RowColumn />
        <TimelineGrid />
      </div>
      <NowIndicator />
      
      {/* Event Modal for status changes */}
      {isModalOpen && modalEvent && onStatusChange && (
        <EventModal
          event={modalEvent}
          onClose={closeEventModal}
          onSubmit={onStatusChange}
        />
      )}
    </>
  )
}

export function Timeline(props: TimelineProps) {
  const cssVars = CSS_VARS as React.CSSProperties

  return (
    <TimelineProvider {...props}>
      <div className={styles.timeline} style={cssVars}>
        <TimelineContent />
      </div>
    </TimelineProvider>
  )
}
