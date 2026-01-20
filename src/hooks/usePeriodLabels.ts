import { useMemo } from 'react'
import type { Period, Row } from '../types'
import { getActivePeriod, isInTransition } from '../utils/timeUtils'
import { formatRowLabel } from '../utils/layoutUtils'

interface UsePeriodLabelsOptions {
  rows: Row[]
  periods: Period[]
  referenceTime: Date
  isCollapsed: boolean
}

interface RowLabelInfo {
  rowId: string
  currentLabel: string
  displayLabel: string
  incomingLabel?: string
  displayIncoming?: string
  transitionProgress?: number
}

interface UsePeriodLabelsReturn {
  labels: RowLabelInfo[]
  isInTransition: boolean
  transitionProgress: number
}

export function usePeriodLabels({
  rows,
  periods,
  referenceTime,
  isCollapsed,
}: UsePeriodLabelsOptions): UsePeriodLabelsReturn {
  return useMemo(() => {
    const transition = isInTransition(referenceTime, periods)
    const activePeriod = getActivePeriod(referenceTime, periods)

    const labels: RowLabelInfo[] = rows.map((row) => {
      if (transition) {
        const outgoingLabel = transition.outgoing?.rowLabels[row.id] ?? ''
        const incomingLabel = transition.incoming?.rowLabels[row.id] ?? ''

        return {
          rowId: row.id,
          currentLabel: outgoingLabel,
          displayLabel: formatRowLabel(outgoingLabel, isCollapsed),
          incomingLabel,
          displayIncoming: formatRowLabel(incomingLabel, isCollapsed),
          transitionProgress: transition.progress,
        }
      }

      const currentLabel = activePeriod?.rowLabels[row.id] ?? ''

      return {
        rowId: row.id,
        currentLabel,
        displayLabel: formatRowLabel(currentLabel, isCollapsed),
      }
    })

    return {
      labels,
      isInTransition: transition !== null,
      transitionProgress: transition?.progress ?? 0,
    }
  }, [rows, periods, referenceTime, isCollapsed])
}
