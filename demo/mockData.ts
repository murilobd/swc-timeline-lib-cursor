import type { Row, Period, TimelineEvent, TimelineConfig } from '@/types'
import { startOfDay, addDays, addHours, addMinutes } from 'date-fns'

const today = startOfDay(new Date())
const yesterday = addDays(today, -1)
const tomorrow = addDays(today, 1)

export const mockRows: Row[] = [
  { id: 'row-1', indicator: { color: '#4CAF50' } },
  { id: 'row-2', indicator: { color: '#4CAF50' } },
  { id: 'row-3', indicator: { color: '#4CAF50' } },
  { id: 'row-4', indicator: { color: '#4CAF50' } },
  { id: 'row-5', indicator: { color: '#4CAF50' } },
  { id: 'row-6', indicator: { color: '#4CAF50' }, availability: { status: 'absent', label: 'out of office / absence / break' } },
  { id: 'row-7', indicator: { color: '#4CAF50' } },
]

// Morning shift: 0h00 - 8h00
// Afternoon shift: 8h00 - 16h00
// Night shift: 16h00 - 24h00

const morningShiftStart = addHours(today, 0)
const afternoonShiftStart = addHours(today, 8)
const nightShiftStart = addHours(today, 16)

export const mockPeriods: Period[] = [
  {
    id: 'morning-shift',
    startTime: morningShiftStart,
    endTime: afternoonShiftStart,
    transitionDuration: 15,
    rowLabels: {
      'row-1': 'William M.',
      'row-2': 'Myriam G.',
      'row-3': 'John F.',
      'row-4': 'Mohamed T.',
      'row-5': 'Mary V.',
      'row-6': 'Paul P.',
      'row-7': 'William M.',
    },
  },
  {
    id: 'afternoon-shift',
    startTime: afternoonShiftStart,
    endTime: nightShiftStart,
    transitionDuration: 15,
    rowLabels: {
      'row-1': 'Sophie A.',
      'row-2': 'Emmi Q.',
      'row-3': 'Henry K.',
      'row-4': 'Margareth L.',
      'row-5': 'Jenny M.',
      'row-6': 'Mary L.',
      'row-7': 'Sophie A.',
    },
  },
]

export const mockEvents: TimelineEvent[] = [
  {
    id: 'event-1',
    rowId: 'row-1',
    startTime: addHours(today, 10),
    endTime: addHours(today, 11.5),
    title: 'Task',
    status: 'delayed',
    actualEndTime: addHours(today, 12),
    actualDuration: 120, // Took 2h instead of 1h30 (30 min delayed)
  },
  {
    id: 'event-2',
    rowId: 'row-1',
    startTime: addHours(today, 12),
    endTime: addMinutes(addHours(today, 12), 45),
    title: 'Task',
    status: 'early',
    actualDuration: 30, // Finished 15 min early (planned 45min, took 30min)
  },
  {
    id: 'event-3',
    rowId: 'row-1',
    startTime: addHours(today, 13),
    endTime: addHours(today, 14),
    title: 'Task',
    status: 'in-progress',
  },
  {
    id: 'event-4',
    rowId: 'row-1',
    startTime: addHours(today, 14),
    endTime: addHours(today, 15),
    title: 'Task',
    status: 'planned',
  },
  {
    id: 'event-5',
    rowId: 'row-2',
    startTime: addHours(today, 10),
    endTime: addHours(today, 11),
    title: 'Task',
    status: 'completed',
  },
  {
    id: 'event-6',
    rowId: 'row-2',
    startTime: addHours(today, 11),
    endTime: addHours(today, 12.5),
    title: 'Task',
    status: 'delayed',
    actualEndTime: addHours(today, 13),
  },
  {
    id: 'event-7',
    rowId: 'row-2',
    startTime: addHours(today, 13.5),
    endTime: addMinutes(addHours(today, 13), 50),
    title: 'Task',
    status: 'planned',
  },
  {
    id: 'event-8',
    rowId: 'row-3',
    startTime: addHours(today, 10),
    endTime: addHours(today, 10.5),
    title: 'Task',
    status: 'completed',
  },
  {
    id: 'event-9',
    rowId: 'row-3',
    startTime: addHours(today, 11),
    endTime: addHours(today, 12),
    title: 'Task',
    status: 'completed',
  },
  {
    id: 'event-10',
    rowId: 'row-3',
    startTime: addHours(today, 12),
    endTime: addHours(today, 14),
    title: 'Task',
    status: 'blocked',
  },
  {
    id: 'event-11',
    rowId: 'row-3',
    startTime: addHours(today, 14),
    endTime: addHours(today, 15),
    title: 'Task',
    status: 'planned',
  },
  {
    id: 'event-12',
    rowId: 'row-4',
    startTime: addHours(today, 10.5),
    endTime: addHours(today, 12),
    title: 'Task',
    status: 'delayed',
    actualEndTime: addMinutes(addHours(today, 12), 30),
  },
  {
    id: 'event-13',
    rowId: 'row-4',
    startTime: addHours(today, 12),
    endTime: addHours(today, 13),
    title: 'Task',
    status: 'completed',
  },
  {
    id: 'event-14',
    rowId: 'row-4',
    startTime: addHours(today, 13),
    endTime: addHours(today, 14),
    title: 'Task',
    status: 'in-progress',
  },
  {
    id: 'event-15',
    rowId: 'row-5',
    startTime: addHours(today, 10),
    endTime: addMinutes(addHours(today, 10), 45),
    title: 'Task',
    status: 'early',
    actualDuration: 30, // Finished 15 min early
  },
  {
    id: 'event-16',
    rowId: 'row-5',
    startTime: addHours(today, 13),
    endTime: addHours(today, 14),
    title: 'Task',
    status: 'in-progress',
  },
  {
    id: 'event-17',
    rowId: 'row-7',
    startTime: addHours(today, 10),
    endTime: addHours(today, 11.5),
    title: 'Task',
    status: 'delayed',
    actualEndTime: addHours(today, 12),
  },
  {
    id: 'event-18',
    rowId: 'row-7',
    startTime: addHours(today, 12),
    endTime: addMinutes(addHours(today, 12), 45),
    title: 'Task',
    status: 'early',
    actualDuration: 35, // Finished 10 min early
  },
  {
    id: 'event-19',
    rowId: 'row-7',
    startTime: addHours(today, 13),
    endTime: addHours(today, 14),
    title: 'Task',
    status: 'in-progress',
  },
]

export function getDefaultConfig(): Partial<TimelineConfig> {
  return {
    startDate: addHours(yesterday, 0), // Start at 10h00 to see events and handover
    endDate: addHours(tomorrow, 24),   // End at 17h00 to fit on screen
    slotDuration: 5,
    hourFormat: 'french',
    showNowIndicator: true,
    autoScrollToNow: true,
    periodMarkers: {
      enabled: true,
      prefix: 'T',
      referenceTime: morningShiftStart,
    },
  }
}
