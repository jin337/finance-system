import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  Button,
  Checkbox,
  Drawer,
  Grid,
  Input,
  InputNumber,
  Message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from '@arco-design/web-react'
import { IconMore } from '@arco-design/web-react/icon'

// 公共方法
import { formatNumber, uuid } from 'src/utils/common'
const CashInfo = ({ visible = false, cashParams, onCancel }) => {
  const { account, currentCompany } = useSelector((state) => state.commonReducer)
  const [visibleDrawer, setVisibleDrawer] = useState(false)

  const [tableData, setTableData] = useState([])
  const [tableCashData, setTableCashData] = useState([])
  const [tableOptions, setTableOptions] = useState([])
  const [accountMony, setAccountMony] = useState({})
  const [selectList, setSelectList] = useState([])

  // 项目选择
  const [visibleProjectList, setVisibleProjectList] = useState(false)
  const [cashProjectList, setCashProjectList] = useState([])
  const [selectProject, setSelectProject] = useState({})
  const [isExpand, setIsExpand] = useState(true)
  const [isExpandKeys, setIsExpandKeys] = useState([])

  // 保存
  const submitCash = async () => {
    if (accountMony.money !== accountMony.cashflowmoney) {
      Message.error('当前凭证现金类科目净额与现金流量配置额不一致!')
      return
    }

    const cashData = []
    tableData.forEach((m) => {
      if (m.cashflow && m.eid) {
        cashData.push({
          eid: m.eid,
          cashcode: m.cashcode,
          cashname: m.cashname,
          cashflow: m.cashflow,
          direct: m.direct,
          money: m.money || 0,
          createid: m.createid,
          createname: m.createname,
        })
      }
    })
    const params = {
      groupid: currentCompany?.id,
      year: cashParams.year,
      month: cashParams.month,
      pid: cashParams.id,
      cashflow: cashData,
    }
    const { code } = await Http.post('/proof/cash/set', params)
    if (code === 200) {
      Message.success('指定成功')
    } else {
      Message.error('指定凭证现金流量出错了')
    }
    handleCancel()
  }

  // 项目选择
  const onSubmitSelect = () => {
    const { index, ...rest } = selectProject
    let data = []

    if (index === 'all') {
      data = [...tableData].map((item) => ({
        ...item,
        ...rest,
        money: rest.cashflow === 2 ? Math.abs(item.money) : -Math.abs(item.money),
      }))
    } else {
      data = [...tableData].map((item, i) =>
        i === index ? { ...item, ...rest, money: rest.cashflow === 2 ? Math.abs(item.money) : -Math.abs(item.money) } : item
      )
    }
    setTableData(data)
    setVisibleProjectList(false)

    let total = 0
    data.forEach((m) => {
      if (m.cashflow && m.eid) {
        total += Math.abs(m.money)
      }
    })
    setAccountMony((prev) => ({
      ...prev,
      cashflowmoney: total,
    }))
  }

  // 删行
  const handleDelete = () => {
    Modal.confirm({
      title: '警告',
      content: '请确认是否删除?',
      className: 'simpleModal',
      onOk: async () => {
        const filteredData = tableData.filter((item) => !selectList.includes(item.eid))
        setTableData(filteredData)
        setSelectList([])
      },
    })
  }
  // 增行
  const handleAdd = () => {
    const newRow = {
      id: uuid(),
      createid: account?.id,
      createname: account?.user_name,
    }

    setTableData((prev) => [...prev, newRow])

    const uniqueList = processUniqueList(tableCashData)
    setTableOptions(uniqueList)
  }
  // 清空
  const handleClear = async () => {
    const { code } = await Http.post(`/proof/cash/clear/${cashParams.id}`)
    if (code === 200) {
      setAccountMony((prev) => {
        return {
          ...prev,
          cashflowmoney: 0,
        }
      })
      setTableData([])
      setSelectList([])
      Message.success('清空成功')
    } else {
      Message.error('清空失败')
    }
  }
  // 载入
  const handleLoad = () => {
    const list = []
    tableCashData.forEach((element) => {
      const item = {
        ...element,
        id: uuid(),
        createid: account?.id,
        createname: account?.user_name,
      }
      list.push(item)
    })
    setTableData(list)

    const uniqueList = processUniqueList(tableCashData)
    setTableOptions(uniqueList)
  }

  const columnsProject = [
    {
      title: '编号',
      dataIndex: 'code',
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 300,
      ellipsis: true,
    },
    {
      title: '流向',
      dataIndex: 'cashflowname',
      width: 90,
    },
  ]

  // 主表项目选择
  const getCashProjectList = async (record, index) => {
    setSelectProject({
      ...record,
      index: index,
    })

    const { code, data } = await Http.post('/cash/project/list')
    if (code === 200) {
      const list = data?.list || []
      setCashProjectList(list)
      setVisibleProjectList(true)

      // 递归查找所有 children 长度大于 0 的节点 ID
      const getIdsWithChildren = (nodes) => {
        return nodes.reduce((acc, node) => {
          if (node.children && node.children.length > 0) {
            acc.push(node.id)
            acc.push(...getIdsWithChildren(node.children)) // 递归处理子节点
          }
          return acc
        }, [])
      }

      const idsWithChildren = getIdsWithChildren(list)
      setIsExpandKeys(idsWithChildren)
      setIsExpand(true)
    }
  }

  // 表格列
  const columns = [
    {
      title: '序号',
      dataIndex: '',
      width: 70,
      align: 'center',
      render: (_, record, index) => index + 1,
    },
    {
      title: '对方科目',
      dataIndex: 'acccode',
      width: 270,
      render: (text, record, index) => (
        <Select
          options={tableOptions}
          defaultValue={text}
          renderFormat={(_, value) => value + record?.accfullname}
          style={{ maxWidth: 235 }}
          triggerProps={{
            autoAlignPopupWidth: false,
            autoAlignPopupMinWidth: true,
            position: 'bl',
          }}
          onChange={(e) => {
            const item = tableOptions.find((item) => item?.acccode === e)
            setTableData((prev) => prev.map((t, i) => (i === index ? { ...t, ...item } : t)))
          }}
        />
      ),
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      ellipsis: true,
    },
    {
      title: '方向',
      dataIndex: 'direct',
      width: 70,
      align: 'center',
    },
    {
      title: '主表项目',
      dataIndex: 'account_name',
      render: (_, record, index) => (
        <div className='flex items-center justify-between gap-2'>
          <Input.TextArea rows={1} height={'auto'} value={record?.cashcode && record?.cashcode + record?.cashname} />
          <IconMore className='cursor-pointer' onClick={() => getCashProjectList(record, index)} />
        </div>
      ),
    },
    {
      title: '流向',
      dataIndex: 'cashflowname',
      width: 70,
      align: 'center',
    },
    {
      title: '金额',
      dataIndex: 'money',
      width: 150,
      render: (_, record) => (
        <InputNumber
          value={record?.money}
          prefix='¥'
          formatter={(value) => {
            return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }}
        />
      ),
    },
  ]
  const processUniqueList = (arr) => {
    return Array.from(
      new Map(
        arr.map((item) => [
          item.cashcode,
          {
            ...item,
            value: item.acccode,
            label: (
              <div className='flex items-center justify-between gap-2'>
                <span>{item.accfullname}</span>
                <span>{item.acccode}</span>
              </div>
            ),
          },
        ])
      ).values()
    )
  }

  // 获取现金流量表
  const getCashTable = async (id, arr) => {
    const params = {
      pid: id,
    }
    const { code, data } = await Http.post(`/proof/cash/list`, params)
    if (code === 200) {
      const list = data?.list || []

      // 只保留两个数组中都有相同 eid 的项
      const mergedList = list
        .map((item) => {
          const matchedItem = arr.find((arrItem) => arrItem.eid === item.eid)
          return matchedItem ? { ...item, ...matchedItem } : null
        })
        .filter(Boolean) // 移除未匹配的项
      setTableData(mergedList)

      const uniqueList = processUniqueList(mergedList)
      setTableOptions(uniqueList)

      let total = 0
      mergedList.forEach((m) => {
        if (m.cashflow && m.eid) {
          const money = m.cashflow === accountMony.cashflowType ? Math.abs(m.money) : -Math.abs(m.money)
          total += money
        }
      })
      setAccountMony((prev) => ({
        ...prev,
        cashflowmoney: total,
      }))
    }
  }

  // 获取现金流量表信息
  const getCashInfo = async (item) => {
    const { code, data } = await Http.post(`/proof/cash/account/${item.id}`)
    if (code === 200) {
      const list = data?.side_cash_account || []

      const account = data?.cash_account || {}
      const type = account.direct === '借' ? 1 : 2
      account.cashflowname = type === 1 ? '流入' : '流出'
      account.cashflowType = type
      setAccountMony(account)
      setTableCashData(list)
      getCashTable(item.id, list)
    }
  }

  // 显示
  useEffect(() => {
    setVisibleDrawer(!!visible)

    if (visible && cashParams.id) {
      getCashInfo(cashParams)
    }
  }, [visible, cashParams])

  // 关闭
  const handleCancel = () => {
    setTableOptions([])
    setTableCashData([])
    setTableData([])
    setAccountMony({})
    setVisibleProjectList(false)
    setCashProjectList([])
    setSelectProject([])
    setIsExpand(true)
    setIsExpandKeys([])
    setSelectList([])

    setVisibleDrawer(false)
    if (onCancel) onCancel()
  }

  return (
    <>
      <Drawer
        width='90%'
        title={'现金流量指定'}
        visible={visibleDrawer}
        okText='保存'
        okButtonProps={{ disabled: tableData.length <= 0 }}
        onOk={submitCash}
        onCancel={handleCancel}>
        <Grid.Row>
          <Grid.Col span={12}>
            当前凭证现金类科目净额：
            <Tag size='large'>
              <span className='mr-2'>{accountMony?.direct}</span>
              {formatNumber(accountMony?.money)}
            </Tag>
          </Grid.Col>
          <Grid.Col span={12}>
            当前现金流量指定：
            <Tag size='large'>
              <span className='mr-2'>{accountMony?.cashflowname}</span>
              {formatNumber(accountMony?.cashflowmoney)}
            </Tag>
          </Grid.Col>
        </Grid.Row>
        <Space size='large' className='my-5'>
          <Button type='secondary' disabled={tableData.length >= tableCashData.length} onClick={handleLoad}>
            载入
          </Button>
          <Button type='secondary' disabled={tableData.length >= tableCashData.length} onClick={handleAdd}>
            增行
          </Button>
          <Button type='secondary' disabled={selectList.length <= 0} onClick={handleDelete}>
            删行
          </Button>
          <Button type='secondary' disabled={tableData.length <= 0} onClick={handleClear}>
            清空
          </Button>
          <Button type='secondary' disabled={selectList.length <= 0} onClick={() => getCashProjectList({}, 'all')}>
            批量配置主表项目
          </Button>
        </Space>
        <Table
          rowKey={'eid'}
          size='small'
          pagination={false}
          border={{ wrapper: true, cell: true }}
          columns={columns}
          data={tableData}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectList,
            onChange: (selectedRowKeys) => setSelectList(selectedRowKeys),
          }}
        />
      </Drawer>

      {/* 主表项目选择 */}
      <Drawer
        width='50%'
        title={'主表项目选择'}
        visible={visibleProjectList}
        onCancel={() => setVisibleProjectList(false)}
        okText='确认选择'
        onOk={onSubmitSelect}>
        <Checkbox checked={isExpand} onChange={setIsExpand}>
          全部展开
        </Checkbox>
        <Table
          className='mt-3'
          expandedRowKeys={isExpand ? isExpandKeys : []}
          rowKey='id'
          size='small'
          border={{ wrapper: true, cell: true }}
          columns={columnsProject}
          data={cashProjectList}
          rowClassName={(record) => record.code === selectProject?.cashcode && 'table-select'}
          onRow={(record) => {
            return {
              onDoubleClick: () => {
                if (record.sublevel === record.level) {
                  const selectRow = {
                    cashcode: record.code,
                    cashname: record.name,
                    cashflowname: record.cashflowname,
                    cashflow: record.cashflow,
                  }
                  setSelectProject((prev) => ({
                    ...prev,
                    ...selectRow,
                  }))
                  onSubmitSelect(selectRow)
                }
              },
              onClick: () => {
                if (record.sublevel === record.level) {
                  const selectRow = {
                    cashcode: record.code,
                    cashname: record.name,
                    cashflowname: record.cashflowname,
                    cashflow: record.cashflow,
                  }
                  setSelectProject((prev) => ({
                    ...prev,
                    ...selectRow,
                  }))
                }
              },
            }
          }}
        />
      </Drawer>
    </>
  )
}

export default CashInfo
