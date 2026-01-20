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
  

## Reference

- Use HOW-TO-DEV.md as a reference for the architecture and logic behind project implementation
- Use README.md for more general information of how to run and use the library

## Commit messages

- Use [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) structure to do commits
- Single line with short description of what has changed
- Add some [Emoji](https://gitmoji.dev/) before the message to simplify the understandig of what the commit is about


## Implementation of a plan

- Whenever it's implementing a plan, when a task is done, do a commit before moving on