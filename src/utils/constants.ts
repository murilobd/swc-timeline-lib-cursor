// Default timeline dimensions
export const DEFAULT_ROW_HEIGHT = 96
export const DEFAULT_SLOT_WIDTH = 12
export const DEFAULT_HEADER_HEIGHT = 48
export const DEFAULT_ROW_COLUMN_WIDTH_EXPANDED = 120
export const DEFAULT_ROW_COLUMN_WIDTH_COLLAPSED = 48
export const DEFAULT_SLOT_DURATION = 5 // minutes
export const DEFAULT_TRANSITION_DURATION = 15 // minutes

// Scroll threshold for collapsing row column
export const SCROLL_COLLAPSE_THRESHOLD = 50

// Colors
export const COLORS = {
  accent: '#7C7CFF',
  accentLight: '#E8E8FF',
  grid: '#E5E5E5',
  gridLight: '#F5F5F5',
  text: '#333333',
  textMuted: '#999999',
  white: '#FFFFFF',
  
  // Status colors
  statusScheduled: '#7C7CFF',
  statusInProgress: '#7C7CFF',
  statusDelayed: '#FF6B6B',
  statusEarly: '#4CAF50',
  statusBlocked: '#8B0000',
  statusCompleted: '#CCCCCC',
  
  // Indicator
  indicatorDefault: '#4CAF50',
} as const

// CSS custom properties
export const CSS_VARS = {
  '--timeline-accent': COLORS.accent,
  '--timeline-accent-light': COLORS.accentLight,
  '--timeline-grid': COLORS.grid,
  '--timeline-grid-light': COLORS.gridLight,
  '--timeline-text': COLORS.text,
  '--timeline-text-muted': COLORS.textMuted,
  '--timeline-row-height': `${DEFAULT_ROW_HEIGHT}px`,
  '--timeline-slot-width': `${DEFAULT_SLOT_WIDTH}px`,
  '--timeline-header-height': `${DEFAULT_HEADER_HEIGHT}px`,
} as const
