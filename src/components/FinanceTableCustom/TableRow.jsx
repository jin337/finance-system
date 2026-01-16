import { Input, InputNumber, Select, Tooltip } from '@arco-design/web-react'
import { IconDelete, IconPlusCircle } from '@arco-design/web-react/icon'
import { Fragment, memo, useCallback, useEffect, useRef } from 'react'
//  组件

const OperateButtons = memo(({ onAdd, onDelete }) => (
  <div className='operate'>
    <div className='btn'>
      <Tooltip mini position='right' content='从下方插入行'>
        <IconPlusCircle onClick={onAdd} />
      </Tooltip>
      <IconDelete onClick={onDelete} />
    </div>
  </div>
))

const EditableCell = memo(({ type, inputRef, onBlur, onChange, options }) => {
  switch (type) {
    case 'number':
      return <InputNumber ref={inputRef} onBlur={onBlur} onChange={onChange} />
    case 'select':
      return <Select ref={inputRef} onBlur={onBlur} onChange={onChange} options={options} />
    default:
      return <Input ref={inputRef} onBlur={onBlur} onChange={onChange} />
  }
})

const TableRow = memo(({ rowData, col, rowIndex, colIndex, subject, activeId, setActiveId, onChange }) => {
  const boxId = `${rowIndex}-${colIndex}`
  const inputRef = useRef(null)

  useEffect(() => {
    if (activeId === boxId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeId, boxId])

  const handleChange = useCallback(
    (e) => {
      const names = `${rowIndex}-${col.dataIndex}`
      onChange('edit', names, e)
    },
    [rowIndex, col.dataIndex, onChange]
  )

  const handleAdd = useCallback(
    (e) => {
      e.stopPropagation()
      onChange('add', rowIndex, e)
    },
    [rowIndex, onChange]
  )

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation()
      onChange('delete', rowIndex, e)
    },
    [rowIndex, onChange]
  )

  const handleBlur = useCallback(() => {
    setActiveId()
  }, [setActiveId])

  const handleCellClick = useCallback(() => {
    setActiveId(boxId)
  }, [boxId, setActiveId])

  // 渲染数字单元格
  const renderNumberCell = useCallback(
    () => (
      <td colSpan={col.children.length} className={`edit-box ${activeId === boxId ? 'active' : ''}`} onClick={handleCellClick}>
        <div className='edit'>
          <EditableCell type='number' inputRef={inputRef} onBlur={handleBlur} onChange={handleChange} />
        </div>
        <div className='show'>
          {col.children.map((child, childIndex) => (
            <Fragment key={childIndex}>
              <div className='num'>{rowData[child.dataIndex]}</div>
            </Fragment>
          ))}
        </div>
      </td>
    ),
    [activeId, boxId, col.children, rowData, handleCellClick, handleBlur, handleChange]
  )

  // 渲染普通单元格
  const renderRegularCell = useCallback(() => {
    const isFirstColumn = colIndex === 0
    const isSecondColumn = colIndex === 1
    const cellValue = isSecondColumn ? subject?.find((e) => e.value === rowData[col.dataIndex])?.label : rowData[col.dataIndex]

    return (
      <td className={`edit-box ${activeId === boxId ? 'active' : ''}`} onClick={handleCellClick}>
        {isFirstColumn && <OperateButtons onAdd={handleAdd} onDelete={handleDelete} />}
        <div className='edit'>
          <EditableCell
            type={isSecondColumn ? 'select' : 'input'}
            inputRef={inputRef}
            onBlur={handleBlur}
            onChange={handleChange}
            options={isSecondColumn ? subject : undefined}
          />
        </div>
        <div className='show'>
          <div className='num'>{cellValue}</div>
        </div>
      </td>
    )
  }, [
    activeId,
    boxId,
    colIndex,
    col.dataIndex,
    rowData,
    subject,
    handleCellClick,
    handleAdd,
    handleDelete,
    handleBlur,
    handleChange,
  ])

  return col.children ? renderNumberCell() : renderRegularCell()
})

export default TableRow
