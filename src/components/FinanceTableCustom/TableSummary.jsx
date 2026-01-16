import { Fragment, memo, useCallback, useEffect, useState } from 'react'

const TableSummary = memo((props) => {
  const { data = [], columns = [], conversionValue } = props
  const [items, setItems] = useState([])
  const [summaryColumns, setSummaryColumns] = useState([])
  const [error, setError] = useState(null)

  const processColumns = useCallback(() => {
    try {
      const summary = columns.map((e) => e.children && e.dataIndex).filter(Boolean)
      const summaryArr = columns.filter((e) => summary.includes(e.dataIndex))
      const operateArr = columns.filter((e) => e.dataIndex === 'operate')
      const num = columns.length - operateArr.length - summaryArr.length
      return [...operateArr, { title: '合计:', dataIndex: 'summary', colSpan: num }, ...summaryArr]
    } catch (err) {
      setError('错误')
      console.error('错误:', err)
      return []
    }
  }, [columns])

  const processData = useCallback(() => {
    try {
      const summary = columns.map((e) => e.children && e.dataIndex).filter(Boolean)
      const newData = summary.reduce((acc, key) => {
        acc[key] = data.reduce((sum, item) => {
          const value = item[key] || 0
          return sum + (typeof value === 'number' ? value : 0)
        }, 0)
        return acc
      }, {})

      return [newData].map((item) => {
        const newItem = { ...item }
        columns.forEach((col) => {
          if (col.children) {
            const dataIndex = col.dataIndex
            const value = newItem[dataIndex]
            const children = col.children

            if (typeof value !== 'undefined') {
              const processed = conversionValue(value, children)
              delete newItem[dataIndex]
              Object.assign(newItem, processed)
            }
          }
        })
        return newItem
      })
    } catch (err) {
      setError('Error processing data')
      console.error('Data processing error:', err)
      return []
    }
  }, [data, columns, conversionValue])

  useEffect(() => {
    setSummaryColumns(processColumns())
  }, [processColumns])

  useEffect(() => {
    setItems(processData())
  }, [processData])

  if (error) {
    return (
      <tr>
        <td colSpan={columns.length} className='error-message'>
          {error}
        </td>
      </tr>
    )
  }

  return items.map((rowData, rowIndex) => (
    <tr key={rowIndex}>
      {summaryColumns.map((col, colIndex) => (
        <Fragment key={colIndex}>
          {col.children ? (
            <td colSpan={col.children.length} className='edit-box'>
              <div className='show'>
                {col.children.map((child, childIndex) => (
                  <Fragment key={childIndex}>
                    <div className='num'>{rowData[child.dataIndex]}</div>
                  </Fragment>
                ))}
              </div>
            </td>
          ) : (
            <td key={col.dataIndex} colSpan={col?.colSpan} className='edit-box'>
              {col.title}
            </td>
          )}
        </Fragment>
      ))}
    </tr>
  ))
})

TableSummary.displayName = 'TableSummary'

export default TableSummary
