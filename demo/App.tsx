import { Timeline } from '@/index'
import { mockRows, mockPeriods, mockEvents, getDefaultConfig } from './mockData'

function App() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Timeline
        rows={mockRows}
        periods={mockPeriods}
        events={mockEvents}
        config={getDefaultConfig()}
        onEventClick={(event) => console.log('Event clicked:', event)}
        onSlotClick={(rowId, time) => console.log('Slot clicked:', rowId, time)}
      />
    </div>
  )
}

export default App
