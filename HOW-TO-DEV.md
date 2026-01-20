# Timeline Library - Developer Guide

This document explains the internal architecture, data flow, and how to modify each part of the timeline library.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [File Relationships](#file-relationships)
4. [Step-by-Step: How It Works](#step-by-step-how-it-works)
5. [How to Modify](#how-to-modify)
6. [Adding New Features](#adding-new-features)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Timeline.tsx                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    TimelineProvider                          │ │
│  │         (Context: config, scroll, currentTime)               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │                    TimelineHeader                        │ │ │
│  │  │              (Time labels + Period markers)              │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │  ┌───────────┬─────────────────────────────────────────────┐ │ │
│  │  │ RowColumn │              TimelineGrid                    │ │ │
│  │  │ (Sticky)  │  ┌─────────────────────────────────────────┐ │ │ │
│  │  │           │  │ GridRow → GridEvent → GridEvent → ...   │ │ │ │
│  │  │ RowLabel  │  ├─────────────────────────────────────────┤ │ │ │
│  │  │ RowLabel  │  │ GridRow → GridEvent → ...               │ │ │ │
│  │  │ RowLabel  │  ├─────────────────────────────────────────┤ │ │ │
│  │  │ ...       │  │ ...                                     │ │ │ │
│  │  └───────────┴─────────────────────────────────────────────┘ │ │
│  │                        NowIndicator                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer          | Files                             | Purpose                                             |
| -------------- | --------------------------------- | --------------------------------------------------- |
| **Components** | `src/components/*`                | UI rendering, user interactions                     |
| **Context**    | `src/context/TimelineContext.tsx` | Shared state, configuration, callbacks              |
| **Hooks**      | `src/hooks/*`                     | Reusable stateful logic (scroll, time, labels)      |
| **Utils**      | `src/utils/*`                     | Pure functions (time math, positioning, formatting) |
| **Types**      | `src/types/index.ts`              | TypeScript interfaces and types                     |

---

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                           Consumer App                            │
│                                                                    │
│   <Timeline                                                        │
│     rows={rows}          ──┐                                       │
│     periods={periods}      │  Props flow DOWN                      │
│     events={events}        │                                       │
│     config={config}        │                                       │
│     onEventClick={fn}    ──┘  Callbacks flow UP                    │
│   />                                                               │
└──────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                      TimelineContext.tsx                          │
│                                                                    │
│   1. Receives props from Timeline                                  │
│   2. Resolves config defaults (startDate, endDate, etc.)          │
│   3. Manages state: scrollLeft, isCollapsed, currentTime          │
│   4. Calculates derived values: totalGridWidth, visibleRange      │
│   5. Provides everything to children via useTimeline() hook       │
└──────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Components                                 │
│                                                                    │
│   Each component calls useTimeline() to access:                   │
│   - Data: rows, periods, events, config                           │
│   - State: scrollLeft, isCollapsed, currentTime                   │
│   - Actions: setScrollLeft, scrollToTime                          │
│   - Callbacks: onEventClick, onSlotClick                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## File Relationships

### Core Files Map

```
src/
├── index.ts                          # Public API exports
│
├── types/
│   └── index.ts                      # All TypeScript interfaces
│       ├── Row, RowIndicator, RowAvailability
│       ├── Period
│       ├── TimelineEvent, EventStatus
│       ├── TimelineConfig, ResolvedTimelineConfig
│       └── TimelineProps
│
├── context/
│   └── TimelineContext.tsx           # Shared state provider
│       ├── TimelineProvider          # Context provider component
│       └── useTimeline()             # Hook to consume context
│
├── utils/
│   ├── constants.ts                  # Default values, colors, CSS vars
│   ├── timeUtils.ts                  # Time formatting, calculations
│   │   ├── formatTime(), formatHour()
│   │   ├── getHourMarkers()
│   │   ├── getPositionPercentage()
│   │   ├── getActivePeriod()
│   │   └── isInTransition()
│   └── layoutUtils.ts                # Position calculations
│       ├── getEventLayout()
│       ├── formatRowLabel()
│       └── getScrollPositionForTime()
│
├── hooks/
│   ├── useTimelineScroll.ts          # Scroll state + auto-center
│   ├── useNowIndicator.ts            # Current time tracking
│   ├── usePeriodLabels.ts            # Label resolution per row
│   └── useTimelineLayout.ts          # Event positioning cache
│
└── components/
    ├── Timeline/                     # Main entry point
    │   └── Timeline.tsx              # Wraps everything in Provider
    │
    ├── TimelineHeader/               # Top row with time labels
    │   └── TimelineHeader.tsx        # Renders hour markers + T0/T1/T2
    │
    ├── RowColumn/                    # Left sticky column
    │   ├── RowColumn.tsx             # Container for all row labels
    │   └── RowLabel.tsx              # Single row label with transition
    │
    ├── TimelineGrid/                 # Main scrollable area
    │   ├── TimelineGrid.tsx          # Grid container + hour lines
    │   ├── GridRow.tsx               # Single row track
    │   └── GridEvent.tsx             # Event/task card
    │
    └── NowIndicator/                 # Current time line
        └── NowIndicator.tsx          # Purple vertical line
```

### Dependency Graph

```
Timeline.tsx
    │
    ├── uses → TimelineProvider (from context)
    │              │
    │              └── provides → useTimeline() hook
    │
    ├── renders → TimelineHeader.tsx
    │                 └── calls → useTimeline()
    │                 └── calls → timeUtils.getHourMarkers()
    │
    ├── renders → RowColumn.tsx
    │                 └── calls → useTimeline()
    │                 └── renders → RowLabel.tsx
    │                                   └── calls → timeUtils.getActivePeriod()
    │                                   └── calls → layoutUtils.formatRowLabel()
    │
    ├── renders → TimelineGrid.tsx
    │                 └── calls → useTimeline()
    │                 └── renders → GridRow.tsx
    │                                   └── renders → GridEvent.tsx
    │                                                     └── calls → layoutUtils.getEventLayout()
    │
    └── renders → NowIndicator.tsx
                      └── calls → useTimeline()
                      └── calls → timeUtils.getPositionPercentage()
```

---

## Step-by-Step: How It Works

### 1. Initialization (Consumer → Timeline → Context)

**File:** `src/components/Timeline/Timeline.tsx`

```typescript
export function Timeline(props: TimelineProps) {
  return (
    <TimelineProvider {...props}>    {/* Step 1: Wrap in context */}
      <div className={styles.timeline}>
        <TimelineHeader />            {/* Step 2: Render header */}
        <div className={styles.body}>
          <RowColumn />               {/* Step 3: Render row labels */}
          <TimelineGrid />            {/* Step 4: Render grid + events */}
          <NowIndicator />            {/* Step 5: Render now line */}
        </div>
      </div>
    </TimelineProvider>
  )
}
```

### 2. Context Setup (Resolving Config)

**File:** `src/context/TimelineContext.tsx`

```typescript
// Config resolution with defaults
const config = useMemo<ResolvedTimelineConfig>(() => {
  const startDate = partialConfig.startDate ?? addDays(today, -1)
  const endDate = partialConfig.endDate ?? addDays(today, 2)
  const slotDuration = partialConfig.slotDuration ?? 5  // 5 minutes

  // Calculate derived values
  const totalMinutes = differenceInMinutes(endDate, startDate)
  const slotCount = Math.ceil(totalMinutes / slotDuration)
  const hourCount = Math.ceil(totalMinutes / 60)

  return { startDate, endDate, slotDuration, totalMinutes, slotCount, hourCount, ... }
}, [partialConfig])
```

### 3. Time Header Rendering

**File:** `src/components/TimelineHeader/TimelineHeader.tsx`

```typescript
// Get all hour markers within the time range
const hourMarkers = getHourMarkers(config.startDate, config.endDate)
// → [Date(10:00), Date(11:00), Date(12:00), ...]

// For each hour, render time + period marker
hourMarkers.map((hourDate) => {
  const timeLabel = formatHour(hourDate, 'french')  // "10h00"
  const periodMarker = getPeriodMarker(hourDate, referenceTime, 'T')  // "T4"
  return <div>{timeLabel}<br/>{periodMarker}</div>
})
```

### 4. Row Label Resolution

**File:** `src/components/RowColumn/RowLabel.tsx`

```typescript
// Get the active period based on visible time
const activePeriod = getActivePeriod(visibleMidpoint, periods)

// Get label for this row from the active period
const label = activePeriod?.rowLabels[row.id]  // "William M."

// Format based on collapsed state
const displayLabel = formatRowLabel(label, isCollapsed)
// isCollapsed=false → "William M."
// isCollapsed=true  → "W.M."
```

### 5. Event Positioning

**File:** `src/utils/layoutUtils.ts`

```typescript
function getEventLayout(event, config) {
  const totalMinutes = differenceInMinutes(config.endDate, config.startDate)
  
  // Event starts at 10:00, timeline starts at 06:00
  // Offset = 4 hours = 240 minutes
  const startOffset = differenceInMinutes(event.startTime, config.startDate)
  
  // Event duration = 1.5 hours = 90 minutes
  const duration = differenceInMinutes(event.endTime, event.startTime)
  
  // Timeline is 16 hours = 960 minutes
  // left = 240/960 = 25%
  // width = 90/960 = 9.375%
  return {
    left: `${(startOffset / totalMinutes) * 100}%`,
    width: `${(duration / totalMinutes) * 100}%`,
  }
}
```

### 6. Scroll Handling

**File:** `src/components/TimelineGrid/TimelineGrid.tsx`

```typescript
const handleScroll = (e) => {
  const scrollLeft = e.currentTarget.scrollLeft
  setScrollLeft(scrollLeft)  // Update context
  
  // Context automatically:
  // 1. Updates visibleRange
  // 2. Sets isCollapsed = scrollLeft > 50
  // 3. Triggers onScroll callback
}
```

### 7. Event Status Styling

**File:** `src/components/TimelineGrid/GridEvent.tsx`

```typescript
const STATUS_COLORS = {
  'planned':     { border: '#C4C4FF', bg: '#FFFFFF' },
  'in-progress': { border: '#7C7CFF', bg: '#FFFFFF' },
  'delayed':     { border: '#FF6B6B', bg: '#FFFFFF' },
  'early':       { border: '#4CAF50', bg: '#FFFFFF' },
  'blocked':     { border: '#8B0000', bg: '#5C1A1A' },
  'completed':   { border: '#CCCCCC', bg: '#F5F5F5' },
}

// Apply colors based on status
<div style={{
  borderLeftColor: STATUS_COLORS[event.status].border,
  backgroundColor: STATUS_COLORS[event.status].bg,
}} />
```

---

## How to Modify

### Change Time Format

**File:** `src/utils/timeUtils.ts`

```typescript
// Modify formatHour() function
export function formatHour(date: Date, hourFormat: TimelineConfig['hourFormat']): string {
  switch (hourFormat) {
    case '12h':
      return format(date, 'h a')        // "10 AM"
    case '24h':
      return format(date, 'HH:00')      // "10:00"
    case 'french':
      return format(date, "HH'h'00")    // "10h00"
    // Add new format:
    case 'custom':
      return format(date, 'HH.mm')      // "10.00"
  }
}
```

### Change Event Colors

**File:** `src/components/TimelineGrid/GridEvent.tsx`

```typescript
const STATUS_COLORS: Record<EventStatus, { border: string; bg: string }> = {
  planned: { border: '#C4C4FF', bg: '#FFFFFF' },
  // Change delayed to orange:
  delayed: { border: '#FFA500', bg: '#FFF3E0' },
  // ...
}
```

Or use CSS variables in `src/utils/constants.ts`:

```typescript
export const COLORS = {
  statusDelayed: '#FF6B6B',  // Change this
  // ...
}
```

### Change Row Height

**File:** `src/utils/constants.ts`

```typescript
export const DEFAULT_ROW_HEIGHT = 96  // Change to 80, 120, etc.
```

And in CSS modules:

```css
.rowLabel {
  height: var(--timeline-row-height, 96px);  /* Uses CSS variable */
}
```

### Add a New Event Status

1. **Update types** - `src/types/index.ts`:

```typescript
export type EventStatus =
  | 'planned'
  | 'in-progress'
  | 'delayed'
  | 'early'
  | 'blocked'
  | 'completed'
  | 'paused'  // ← Add new status
```

2. **Add color** - `src/components/TimelineGrid/GridEvent.tsx`:

```typescript
const STATUS_COLORS = {
  // ...existing...
  paused: { border: '#FFC107', bg: '#FFFDE7' },  // ← Add colors
}
```

3. **Add CSS** - `src/components/TimelineGrid/GridEvent.module.css`:

```css
.event[data-status="paused"] {
  border-style: dashed;  /* Optional: add unique styling */
}
```

### Change Collapse Threshold

**File:** `src/utils/constants.ts`

```typescript
// Row column collapses when scrolled past this pixel value
export const SCROLL_COLLAPSE_THRESHOLD = 50  // Change to 100, 200, etc.
```

### Modify Period Marker Logic

**File:** `src/utils/timeUtils.ts`

```typescript
export function getPeriodMarker(
  hourDate: Date,
  referenceTime: Date,
  prefix: string
): string {
  const hoursDiff = Math.floor(differenceInMinutes(hourDate, referenceTime) / 60)
  
  // Current: "T0", "T1", "T2"...
  // Change to: "Hour 1", "Hour 2"...
  return `Hour ${hoursDiff + 1}`
}
```

### Add Custom Event Rendering

**Consumer usage:**

```tsx
<Timeline
  renderEvent={(event, defaultRender) => (
    <div className="my-custom-event">
      <img src={event.data.icon} />
      <span>{event.title}</span>
      <span>{event.data.assignee}</span>
    </div>
  )}
/>
```

**The hook is already in place** - `src/components/TimelineGrid/GridEvent.tsx`:

```typescript
const content = renderEvent 
  ? renderEvent(event, defaultRender) 
  : defaultRender
```

---

## Adding New Features

### Add Zoom Controls

1. **Add state to context** - `src/context/TimelineContext.tsx`:

```typescript
const [zoomLevel, setZoomLevel] = useState(1)  // 1 = 100%

// Modify slot width calculation
const totalGridWidth = config.slotCount * 12 * zoomLevel
```

2. **Add zoom buttons** - Create `src/components/ZoomControls/ZoomControls.tsx`:

```typescript
export function ZoomControls() {
  const { zoomLevel, setZoomLevel } = useTimeline()
  return (
    <div>
      <button onClick={() => setZoomLevel(z => z * 1.2)}>+</button>
      <button onClick={() => setZoomLevel(z => z / 1.2)}>-</button>
    </div>
  )
}
```

3. **Add to Timeline** - `src/components/Timeline/Timeline.tsx`:

```typescript
<TimelineProvider {...props}>
  <ZoomControls />  {/* Add here */}
  <TimelineHeader />
  ...
</TimelineProvider>
```

### Add Drag-and-Drop Events

1. **Add handlers to GridEvent** - `src/components/TimelineGrid/GridEvent.tsx`:

```typescript
const handleDragStart = (e: React.DragEvent) => {
  e.dataTransfer.setData('eventId', event.id)
}

<div
  draggable
  onDragStart={handleDragStart}
  // ...existing props
/>
```

2. **Add drop zone to GridRow** - `src/components/TimelineGrid/GridRow.tsx`:

```typescript
const handleDrop = (e: React.DragEvent) => {
  const eventId = e.dataTransfer.getData('eventId')
  const dropTime = calculateTimeFromPosition(e.clientX)
  onEventMove?.(eventId, row.id, dropTime)
}
```

3. **Add callback to props** - `src/types/index.ts`:

```typescript
interface TimelineProps {
  // ...existing...
  onEventMove?: (eventId: string, newRowId: string, newTime: Date) => void
}
```

### Add Tooltips

1. **Create Tooltip component** - `src/components/Tooltip/Tooltip.tsx`

2. **Wrap GridEvent** - `src/components/TimelineGrid/GridEvent.tsx`:

```typescript
<Tooltip content={`${event.title} - ${formatTime(event.startTime)}`}>
  <div className={styles.event}>
    {/* existing content */}
  </div>
</Tooltip>
```

---

## Quick Reference

| To change...       | Edit file...                                                  |
| ------------------ | ------------------------------------------------------------- |
| Time format        | `src/utils/timeUtils.ts` → `formatHour()`                     |
| Event colors       | `src/components/TimelineGrid/GridEvent.tsx` → `STATUS_COLORS` |
| Row height         | `src/utils/constants.ts` → `DEFAULT_ROW_HEIGHT`               |
| Grid colors        | `src/utils/constants.ts` → `COLORS`                           |
| Collapse threshold | `src/utils/constants.ts` → `SCROLL_COLLAPSE_THRESHOLD`        |
| Default config     | `src/context/TimelineContext.tsx` → config resolution         |
| Event positioning  | `src/utils/layoutUtils.ts` → `getEventLayout()`               |
| Name formatting    | `src/utils/layoutUtils.ts` → `formatRowLabel()`               |
| Period markers     | `src/utils/timeUtils.ts` → `getPeriodMarker()`                |
| Add new types      | `src/types/index.ts`                                          |

---

## Testing Changes

```bash
# Start dev server with hot reload
npm run dev

# The demo at http://localhost:5174 will update automatically

# Check TypeScript errors
npx tsc --noEmit

# Check linting
npm run lint
```
