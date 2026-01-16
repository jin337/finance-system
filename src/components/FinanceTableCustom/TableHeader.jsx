import React, { useMemo } from 'react'

const TableHeader = ({ columns = [] }) => {
  const getMaxDepth = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return 1
    return Math.max(...arr.map((item) => (item?.children && Array.isArray(item.children) ? 1 + getMaxDepth(item.children) : 1)))
  }

  const processedItems = useMemo(() => {
    const transData = (arr) => {
      if (!Array.isArray(arr)) return []

      return arr.map((item) => {
        if (item?.children && Array.isArray(item.children) && item.children.length > 0) {
          return {
            ...item,
            colSpan: item.children.length,
          }
        }
        return {
          ...item,
          rowSpan: getMaxDepth(arr),
        }
      })
    }

    const list = transData(columns)
    const childList = list.flatMap((item) => item?.children || [])
    return [list, childList]
  }, [columns])

  const renderHeaderRows = useMemo(() => {
    return processedItems.map((tableRow, rowIndex) => (
      <tr key={`row-${rowIndex}`}>
        {tableRow.map((item, colIndex) => {
          const { title, children, dataIndex, ...rest } = item

          return (
            <th key={`${rowIndex}-${colIndex}-${title || 'default'}`} {...rest}>
              {title}
            </th>
          )
        })}
      </tr>
    ))
  }, [processedItems])

  return <>{renderHeaderRows}</>
}

export default React.memo(TableHeader)
