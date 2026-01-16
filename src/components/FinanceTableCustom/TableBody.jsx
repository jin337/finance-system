import { Fragment, memo, useCallback, useEffect, useState } from 'react'
import TableRow from './TableRow'

const TableBody = memo((props) => {
  const { data = [], columns = [], subject = [], activeId, setActiveId, onChange, conversionValue } = props
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  // 使用useCallback优化数据处理函数
  const processData = useCallback(
    (item) => {
      try {
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
      } catch (err) {
        console.error('处理行数据时出错：', err)
        return item
      }
    },
    [columns, conversionValue]
  )

  useEffect(() => {
    try {
      // 批量处理数据以减少状态更新
      const processedData = data.map(processData)
      setItems(processedData)
      setError(null)
    } catch (err) {
      setError('处理表数据时出错')
      console.error('表数据处理错误：', err)
    }
  }, [data, processData])

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
    <tr key={rowData.id || rowIndex}>
      {columns.map((col, colIndex) => (
        <Fragment key={`${rowIndex}-${colIndex}-${col.dataIndex || 'default'}`}>
          <TableRow
            rowData={rowData}
            col={col}
            rowIndex={rowIndex}
            colIndex={colIndex}
            subject={subject}
            activeId={activeId}
            setActiveId={setActiveId}
            onChange={onChange}
          />
        </Fragment>
      ))}
    </tr>
  ))
})

TableBody.displayName = 'TableBody'

export default TableBody
