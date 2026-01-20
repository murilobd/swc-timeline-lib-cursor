import { useState, useCallback } from 'react'
import { Timeline } from '@/index'
import type { EventMove, TimelineEvent } from '@/types'
import { mockRows, mockPeriods, mockEvents, getDefaultConfig } from './mockData'

function App() {
  const [events, setEvents] = useState<TimelineEvent[]>(mockEvents)

  // Handle event move (drag-and-drop with cascade)
  const handleEventMove = useCallback((moves: EventMove[]) => {
    console.log('Events moved:', moves)
    
    setEvents((prevEvents) => {
      return prevEvents.map((event) => {
        const move = moves.find((m) => m.eventId === event.id)
        if (move) {
          return {
            ...event,
            startTime: move.newStartTime,
            endTime: move.newEndTime,
          }
        }
        return event
      })
    })
  }, [])

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Timeline
        rows={mockRows}
        periods={mockPeriods}
        events={events}
        config={getDefaultConfig()}
        onEventClick={(event) => console.log('Event clicked:', event)}
        onSlotClick={(rowId, time) => console.log('Slot clicked:', rowId, time)}
        onEventMove={handleEventMove}
      />
    </div>
  )
}

export default App
