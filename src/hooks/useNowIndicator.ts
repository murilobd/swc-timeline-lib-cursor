import { useState, useEffect, useMemo } from 'react'
import type { ResolvedTimelineConfig } from '../types'
import { getPositionPercentage } from '../utils/timeUtils'

interface UseNowIndicatorOptions {
  config: ResolvedTimelineConfig
  updateInterval?: number // milliseconds, default 60000 (1 minute)
}

interface UseNowIndicatorReturn {
  currentTime: Date
  isVisible: boolean
  positionPercent: number
}

export function useNowIndicator({
  config,
  updateInterval = 60000,
}: UseNowIndicatorOptions): UseNowIndicatorReturn {
  const [currentTime, setCurrentTime] = useState(() => new Date())

  // Update current time at interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, updateInterval)

    return () => clearInterval(interval)
  }, [updateInterval])

  // Check if current time is within the visible range
  const isVisible = useMemo(() => {
    return currentTime >= config.startDate && currentTime <= config.endDate
  }, [currentTime, config.startDate, config.endDate])

  // Calculate position percentage
  const positionPercent = useMemo(() => {
    if (!isVisible) return 0
    return getPositionPercentage(currentTime, config.startDate, config.endDate)
  }, [currentTime, config.startDate, config.endDate, isVisible])

  return {
    currentTime,
    isVisible,
    positionPercent,
  }
}
