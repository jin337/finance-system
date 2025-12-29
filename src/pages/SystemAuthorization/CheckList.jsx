import { Checkbox } from '@arco-design/web-react'
import { useEffect, useState } from 'react'

// 提取公共逻辑到独立函数
const getSelectedValues = (data, selectedState) => {
  // 收集所有被选中的子项ID
  const ids = Object.values(selectedState).flat()

  // 建立id到value的映射
  const idToValueMap = {}
  if (data && Array.isArray(data)) {
    data.forEach((module) => {
      if (module.children && Array.isArray(module.children)) {
        module.children.forEach((child) => {
          idToValueMap[child.id] = child.value
        })
      }
    })
  }

  // 根据ids获取对应的value值
  return ids.map((id) => idToValueMap[id]).filter(Boolean)
}

const CheckList = ({ data, onChange }) => {
  const [list, setList] = useState([])
  const [selectedState, setSelectedState] = useState({}) // 用于跟踪选中状态

  // 处理模块全选/取消全选
  const onModuleCheck = (moduleId, checked, group) => {
    const allValues = group.map((item) => item.value)
    const newValues = checked ? allValues : []
    changeSelect(moduleId, newValues)
  }

  // 处理权限变更
  const changeSelect = (moduleId, selectedValues) => {
    // 更新选中状态
    const updatedSelectedState = {
      ...selectedState,
      [moduleId]: selectedValues,
    }

    setSelectedState(updatedSelectedState)

    if (onChange) {
      const idList = getSelectedValues(data, updatedSelectedState)
      onChange(moduleId, selectedValues, idList)
    }
  }

  // 生成权限列表
  const generateList = (arr) => {
    const list = arr.map((item) => {
      const group = item.children.map((child) => ({
        label: child.title,
        value: child.id,
      }))

      // 使用选中状态或默认值
      const groupGranted = selectedState[item.id] ?? item.children.filter((child) => child.granted === 1).map((child) => child.id)

      // 计算选中和半选状态
      const checkedAll = groupGranted.length === group.length && group.length > 0
      const indeterminate = groupGranted.length > 0 && groupGranted.length < group.length

      return {
        id: item.id,
        label: (
          <Checkbox
            checked={checkedAll}
            indeterminate={indeterminate}
            onChange={(checked) => onModuleCheck(item.id, checked, group)}>
            {item.title}
          </Checkbox>
        ),
        value: (
          <Checkbox.Group value={groupGranted} className='mt-2' onChange={(values) => changeSelect(item.id, values)}>
            {group.map((option) => (
              <Checkbox key={option.value} value={option.value} className='mb-2'>
                {option.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        ),
      }
    })

    setList(list)
  }

  // 初始化选中状态
  useEffect(() => {
    if (data && data.length > 0) {
      const initialState = {}
      data.forEach((item) => {
        initialState[item.id] = item.children.filter((child) => child.granted === 1).map((child) => child.id)
      })
      setSelectedState(initialState)
    } else {
      setSelectedState({})
    }
  }, [data])

  useEffect(() => {
    if (data && data.length > 0) {
      generateList(data)
    } else {
      setList([])
    }
  }, [data, selectedState])

  // 组件加载完毕执行一次
  useEffect(() => {
    // 只有当数据存在且选中状态已经初始化才执行
    if (data && data.length > 0 && Object.keys(selectedState).length > 0) {
      const idList = getSelectedValues(data, selectedState)

      // 调用onChange回调，传入null表示初始化
      if (onChange) {
        onChange(null, null, idList)
      }
    }
  }, [data, selectedState]) // 依赖项为data和selectedState

  return list
}

export default CheckList
