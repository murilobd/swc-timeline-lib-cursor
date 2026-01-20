# Timeline Library

A flexible, generic React + TypeScript timeline library for visualizing time-based data with rows, periods, and events.

## Features

- **Configurable Rows** - Each row can have an indicator and availability status
- **Dynamic Periods** - Time-bounded segments that define row labels (e.g., shift schedules)
- **Event Visualization** - Task/event blocks with multiple status states (planned, in-progress, delayed, early, blocked, completed)
- **Shift Handover** - Visual transition overlay when periods change
- **Now Indicator** - Real-time current time marker
- **Flexible Time Range** - Configurable start/end dates with French, 12h, or 24h time formats
- **Period Markers** - Secondary labels (T0, T1, T2...) relative to a reference time
- **Sticky Row Column** - Names remain visible on scroll with collapse animation
- **Custom Rendering** - Render props for events and row labels

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Usage

```tsx
import { Timeline } from './src'
import type { Row, Period, TimelineEvent, TimelineConfig } from './src/types'

const rows: Row[] = [
  { id: 'row-1', indicator: { color: '#4CAF50' } },
  { id: 'row-2', indicator: { color: '#4CAF50' }, availability: { status: 'absent', label: 'Out of office' } },
]

const periods: Period[] = [
  {
    id: 'morning-shift',
    startTime: new Date('2024-01-15T06:00:00'),
    endTime: new Date('2024-01-15T14:00:00'),
    transitionDuration: 15,
    rowLabels: {
      'row-1': 'William M.',
      'row-2': 'John F.',
    },
  },
]

const events: TimelineEvent[] = [
  {
    id: 'event-1',
    rowId: 'row-1',
    startTime: new Date('2024-01-15T10:00:00'),
    endTime: new Date('2024-01-15T11:30:00'),
    title: 'Task',
    status: 'delayed',
    actualEndTime: new Date('2024-01-15T12:00:00'), // Shows overflow
  },
]

const config: Partial<TimelineConfig> = {
  startDate: new Date('2024-01-15T06:00:00'),
  endDate: new Date('2024-01-15T22:00:00'),
  hourFormat: 'french', // "15h00"
  showNowIndicator: true,
  periodMarkers: {
    enabled: true,
    prefix: 'T',
    referenceTime: new Date('2024-01-15T06:00:00'),
  },
}

function App() {
  return (
    <Timeline
      rows={rows}
      periods={periods}
      events={events}
      config={config}
      onEventClick={(event) => console.log('Clicked:', event)}
      onSlotClick={(rowId, time) => console.log('Slot:', rowId, time)}
    />
  )
}
```

## Event Status Colors

| Status | Border Color | Description |
|--------|--------------|-------------|
| `planned` | Light purple | Future task |
| `in-progress` | Purple | Currently active |
| `delayed` | Red + overflow | Running past planned end |
| `early` | Green | Completed ahead of schedule |
| `blocked` | Dark red bg | Cannot proceed |
| `completed` | Gray | Finished |

## API

### TimelineProps

| Prop | Type | Description |
|------|------|-------------|
| `rows` | `Row[]` | Array of row definitions |
| `periods` | `Period[]` | Array of time periods with row labels |
| `events` | `TimelineEvent[]` | Array of events to display |
| `config` | `Partial<TimelineConfig>` | Timeline configuration |
| `onEventClick` | `(event: TimelineEvent) => void` | Event click handler |
| `onSlotClick` | `(rowId: string, time: Date) => void` | Empty slot click handler |
| `renderEvent` | `(event, defaultRender) => ReactNode` | Custom event rendering |
| `renderRowLabel` | `(row, label, isCollapsed) => ReactNode` | Custom row label rendering |

### TimelineConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `startDate` | `Date` | yesterday | Timeline start |
| `endDate` | `Date` | tomorrow+1 | Timeline end |
| `slotDuration` | `number` | 5 | Minutes per slot |
| `hourFormat` | `'12h' \| '24h' \| 'french'` | `'french'` | Time format |
| `showNowIndicator` | `boolean` | `true` | Show current time line |
| `autoScrollToNow` | `boolean` | `true` | Center on current time |
| `periodMarkers` | `PeriodMarkerConfig` | - | T0, T1, T2... labels |

## License

MIT
