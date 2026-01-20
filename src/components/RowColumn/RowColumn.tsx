import { useTimeline } from '../../context/TimelineContext'
import { RowLabel } from './RowLabel'
import styles from './RowColumn.module.css'

export function RowColumn() {
  const { rows, rowColumnWidth, isCollapsed } = useTimeline()

  return (
    <div
      className={styles.rowColumn}
      style={{ width: rowColumnWidth }}
      data-collapsed={isCollapsed}
    >
      {rows.map((row) => (
        <RowLabel key={row.id} row={row} isCollapsed={isCollapsed} />
      ))}
    </div>
  )
}
