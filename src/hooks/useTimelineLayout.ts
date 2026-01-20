import { useMemo } from 'react'
import { differenceInMinutes } from 'date-fns'
import type { TimelineEvent, ResolvedTimelineConfig } from '../types'

interface EventLayout {
  id: string
  left: string
  width: string
  overflowWidth?: string
}

interface UseTimelineLayoutOptions {
  events: TimelineEvent[]
  config: ResolvedTimelineConfig
}

interface UseTimelineLayoutReturn {
  eventLayouts: Map<string, EventLayout>
  getEventLayout: (eventId: string) => EventLayout | undefined
}

export function useTimelineLayout({
  events,
  config,
}: UseTimelineLayoutOptions): UseTimelineLayoutReturn {
  const eventLayouts = useMemo(() => {
    const layouts = new Map<string, EventLayout>()
    const { startDate, endDate } = config
    const totalMinutes = differenceInMinutes(endDate, startDate)

    for (const event of events) {
      const startOffset = differenceInMinutes(event.startTime, startDate)
      const plannedDuration = differenceInMinutes(event.endTime, event.startTime)

      const left = `${(startOffset / totalMinutes) * 100}%`
      const width = `${(plannedDuration / totalMinutes) * 100}%`

      let overflowWidth: string | undefined
      if (event.actualEndTime && event.actualEndTime > event.endTime) {
        const overflowDuration = differenceInMinutes(
          event.actualEndTime,
          event.endTime
        )
        overflowWidth = `${(overflowDuration / totalMinutes) * 100}%`
      }

      layouts.set(event.id, {
        id: event.id,
        left,
        width,
        overflowWidth,
      })
    }

    return layouts
  }, [events, config])

  const getEventLayout = (eventId: string) => eventLayouts.get(eventId)

  return {
    eventLayouts,
    getEventLayout,
  }
}
