import { useTimeline } from '../../context/TimelineContext'
import { RowLabel } from './RowLabel'
import styles from './RowColumn.module.css'

export function RowColumn() {
  const { rows, rowColumnWidth, isCollapsed, isRowColumnHovered, setRowColumnHovered } = useTimeline()

  // Show expanded content when hovered, even if scroll position is collapsed
  const effectiveCollapsed = isCollapsed && !isRowColumnHovered

  return (
    <div
      className={styles.rowColumn}
      style={{ width: rowColumnWidth }}
      data-collapsed={effectiveCollapsed}
      onMouseEnter={() => setRowColumnHovered(true)}
      onMouseLeave={() => setRowColumnHovered(false)}
    >
      {rows.map((row) => (
        <RowLabel key={row.id} row={row} isCollapsed={effectiveCollapsed} />
      ))}
    </div>
  )
}
