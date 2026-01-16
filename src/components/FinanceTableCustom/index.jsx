import { useState } from 'react'

//  组件
import EmptyRow from './EmptyRow'
import TableBody from './TableBody'
import TableHeader from './TableHeader'
import TableSummary from './TableSummary'

import './index.css'

const FinanceTableCustom = (props) => {
  const { columns = [], data = [], subject = [], onChange } = props
  const [activeId, setActiveId] = useState()

  // 数据处理
  const conversionValue = (value, children) => {
    const obj = {}
    let remainingValue = value * 100 // 放大 100 倍，避免浮点精度问题
    let hasNonZeroValue = false

    // 动态生成单位数组，单位值从大到小排列（亿 -> 分）
    const units = children.map((_, index) => Math.pow(10, children.length - index - 1))

    for (let i = 0; i < children.length; i++) {
      const { dataIndex } = children[i]
      const unitValue = units[i]

      // 计算当前层级的数值
      const count = Math.floor(remainingValue / unitValue)

      // 规则：前导零设为 null，后续零保留
      if (count === 0 && !hasNonZeroValue) {
        obj[dataIndex] = null
      } else {
        obj[dataIndex] = count
        if (count !== 0) hasNonZeroValue = true
      }

      // 更新剩余值
      remainingValue -= count * unitValue

      // 最后一层特殊处理：直接赋剩余值
      if (i === children.length - 1 && remainingValue > 0) {
        obj[dataIndex] += Math.round(remainingValue)
      }
    }

    return obj
  }

  return (
    <div className='create-table'>
      <table>
        <thead>
          <TableHeader columns={columns} />
        </thead>
        <tbody>
          <TableBody
            data={data}
            columns={columns}
            subject={subject}
            activeId={activeId}
            setActiveId={setActiveId}
            onChange={onChange}
            conversionValue={conversionValue}
          />
          {data?.length > 0 ? (
            <TableSummary data={data} columns={columns} conversionValue={conversionValue} />
          ) : (
            <EmptyRow onAdd={(e) => onChange('add', 0, e)} />
          )}
        </tbody>
      </table>
    </div>
  )
}

export default FinanceTableCustom
