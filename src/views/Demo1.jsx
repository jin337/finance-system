import dayjs from 'dayjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { Button, DatePicker, Drawer, Empty, Form, Input, InputNumber, Radio, Space, Table } from '@arco-design/web-react'
import { IconCheck, IconClose, IconMore } from '@arco-design/web-react/icon'

// 组件
import AccountInfo from 'src/components/AccountInfo'
import AssistInfo from 'src/components/AssistInfo'

// 公共方法
import { uuid } from 'src/utils/common'

// 页面数据
import proofInfo from 'src/db/proofInfo.json'

// 数据状态
const tylelist = [
  { id: '', name: '全部', color: '#606266' },
  { id: '-1', name: '暂存', color: '#df4126' },
  { id: '0', name: '待提交', color: '#D78400' },
  { id: '3', name: '待审核', color: '#606266' },
  { id: '1', name: '已审核', color: '#3F9D06' },
  { id: '2', name: '未通过', color: '#d9330d' },
  { id: '5', name: '作废', color: '#ddd' },
  { id: '999', name: '无附件', color: '#606266' },
  { id: '888', name: '关联交易', color: '#606266' },
]

// 数字转换
const transNum = (num, index) => {
  if (!num || num === 0) return ''
  const paddedNum = Number(num).toFixed(2).replace('.', '').padStart(11, 'X')
  const targetChar = paddedNum[paddedNum.length - 1 - index]
  return targetChar === 'X' || targetChar === '-' ? '' : targetChar || ''
}

const Demo1 = () => {
  const { currentCompany } = useSelector((state) => state.commonReducer)
  // 页面整体数据
  const [pageForm] = Form.useForm()
  const [pageProof, setPageProof] = useState({})

  // table数据
  const [tableForm] = Form.useForm()
  const [tableData, setTableData] = useState([])
  const [selectList, setSelectList] = useState([])

  // 选中行数据
  const [selectRow, setSelectRow] = useState()
  // 编辑行数据
  const [isEditRows, setIsEditRows] = useState([])

  // 会计科目选择
  const [accountParams, setAccountParams] = useState({})
  const [visibleAccount, setVisibleAccount] = useState(false)

  // 辅助账选择
  const [assistForm] = Form.useForm()
  const [visibleAssist, setVisibleAssist] = useState(false)
  const [assistParams, setAssistParams] = useState({})

  // 保存-辅助账选择
  const onSaveAssist = async () => {
    const values = await assistForm.validate()
    const newSelelct = {
      ...selectRow,
      borrow: values.direct === 1 ? values.money : 0,
      loan: values.direct === 2 ? values.money : 0,
      assistitems: values,
    }
    // 更新tableData中的对应行
    setTableData((prev) => prev.map((item) => (item.id === newSelelct.id ? newSelelct : item)))

    //取消行编辑状态
    setIsEditRows(isEditRows.filter((id) => id !== newSelelct.id))
  }
  // 监控辅助账数据（节流版）
  const throttleRef = useRef(null)
  const onChangeAssist = useCallback(
    (v, vs) => {
      // 使用 useRef 实现节流
      if (!throttleRef.current) {
        throttleRef.current = setTimeout(() => {
          const key = Object.keys(v)[0]
          if (key === 'direct' || key === 'money') {
            const newValues = {
              [`borrow-${selectRow.id}`]: vs.direct === 1 ? vs.money : 0,
              [`loan-${selectRow.id}`]: vs.direct === 2 ? vs.money : 0,
            }
            // 更新tableForm
            tableForm.setFieldsValue(newValues)
            // 更新tableData中的对应行
            const newRow = {
              ...selectRow,
              borrow: vs.direct === 1 ? vs.money : 0,
              loan: vs.direct === 2 ? vs.money : 0,
              assistitems: {
                ...selectRow.assistitems,
                money: vs.money,
              },
            }
            setTableData((prev) => prev.map((item) => (item.id === newRow.id ? newRow : item)))
          }
          throttleRef.current = null
        }, 300) // 300ms 节流间隔
      }
    },
    [selectRow, tableForm]
  )

  // 确认-辅助账选择
  const onAssistEntry = (record) => {
    const newItem = {
      ...assistParams,
      itemcode: record.code,
      itemfullname: record.fullname,
      itemid: record.id,
      itemname: record.name,
      codeName: record.code ? `${record.code || ''}-${record.name || ''}` : '',
    }

    // 更新数据
    const updateSelectRowWithNewItem = (newItem) => {
      const values = assistForm.getFields()
      const updatedItems = values.items.map((item) => (item.typeid === newItem.typeid ? newItem : item))
      return {
        ...selectRow,
        borrow: values.direct === 1 ? values.money : 0,
        loan: values.direct === 2 ? values.money : 0,
        assistitems: {
          ...values,
          items: updatedItems,
        },
      }
    }
    const updatedSelectRow = updateSelectRowWithNewItem(newItem)

    // 更新assistForm
    assistForm.setFieldsValue(updatedSelectRow.assistitems)
    // 更新选中行数据
    onSelectRow(updatedSelectRow)
    // 更新tableData中的对应行
    setTableData((prev) => prev.map((item) => (item.id === updatedSelectRow.id ? updatedSelectRow : item)))
    // 关闭弹窗
    setVisibleAssist(false)
    // 清空参数
    setAssistParams(null)
  }

  // 打开-辅助账选择
  const openAssist = (record) => {
    setAssistParams(record)
    setVisibleAssist(true)
  }

  // 确认-会计科目选择
  const onAccountEntry = async (record) => {
    const { code, data } = await Http.post(`/account/${record.id}`)
    if (code === 200) {
      const direct = data.direct == '借' ? 1 : 2
      const amount = selectRow.borrow || selectRow.loan
      const newAcc = {
        ...selectRow,
        acccode: data.code,
        accfullname: data.fullname,
        accname: data.name,
        accfullnameCode: `${data.code} ${data.fullname}`,
        classid: data.classid,
        isbj: data.isbj,
        borrow: direct === 1 ? amount : 0,
        loan: direct === 2 ? amount : 0,
        assistitems: data.assistitems.length
          ? {
              bdate: pageForm.getFieldValue('bdate'),
              summary: selectRow.summary,
              money: amount || '',
              direct: direct,
              items: (data.assistitems || []).map((e) => ({
                typename: e.name,
                typeid: e.id,
                limitgroup: e.limitgroup,
                sourcetype: e.sourcetype,
              })),
            }
          : {},
      }

      // 更新tableData中的对应行
      setTableData((prev) => prev.map((item) => (item.id === selectRow.id ? newAcc : item)))
      // 更新selectRow
      setSelectRow(newAcc)
      // 更新tableForm
      tableForm.setFieldsValue({
        [`accfullnameCode-${selectRow.id}`]: newAcc.accfullnameCode,
        [`borrow-${selectRow.id}`]: newAcc.borrow,
        [`loan-${selectRow.id}`]: newAcc.loan,
      })

      assistForm.setFieldsValue(newAcc.assistitems)

      // 关闭弹窗
      setVisibleAccount(false)
      // 请款参数
      setAccountParams(null)
    }
  }

  // 打开-会计科目选择
  const openAccount = (record) => {
    const params = {
      shortname: currentCompany?.shortname,
      classid: record.classid,
    }
    setAccountParams(params)
    setVisibleAccount(true)
  }

  // 保存表单数据
  const onSaveTable = () => {
    console.log('保存表单数据', tableData)
  }

  // 新增行数据
  const onNewRow = () => {
    const newRow = {
      id: 'index_id_' + uuid(),
      summary: tableData[tableData?.length - 1]?.summary || '',
      accfullnameCode: '',
      authtype: 0,
      autobuild: 1,
      assistitems: null,
    }
    // 添加新行数据
    setTableData([...tableData, newRow])
    // 添加编辑状态
    setIsEditRows([...isEditRows, newRow.id])
  }

  // 保存行数据
  const onSaveRow = async (record) => {
    const fields = [`summary-${record.id}`, `accfullnameCode-${record.id}`, `borrow-${record.id}`, `loan-${record.id}`]
    const rowData = await tableForm.validate(fields)

    // 查找当前记录在tableData中的索引
    const rowIndex = tableData.findIndex((item) => item.id === record.id)
    if (rowIndex !== -1) {
      // 更新数据
      const updatedRecord = {
        ...tableData[rowIndex],
        summary: rowData[`summary-${record.id}`],
        accfullnameCode: rowData[`accfullnameCode-${record.id}`],
        borrow: rowData[`borrow-${record.id}`],
        loan: rowData[`loan-${record.id}`],
      }

      // 更新整个数据数组
      const newTableData = [...tableData]
      newTableData[rowIndex] = updatedRecord

      // 更新tableData状态
      setTableData(newTableData)

      // 移除编辑状态
      setIsEditRows((prev) => prev.filter((id) => id !== record.id))
    }
  }

  // 取消行编辑
  const onCancelRow = (record) => {
    // 从编辑状态中移除
    setIsEditRows((prev) => prev.filter((id) => id !== record.id))

    // 取消选中状态
    setSelectRow(undefined)

    // 重置表单字段到原始值
    const currentRecord = (pageProof?.entrys || [])?.find((item) => item.id === record.id)
    if (currentRecord) {
      tableForm.setFieldsValue({
        [`summary-${record.id}`]: currentRecord.summary,
        [`accfullnameCode-${record.id}`]: `${currentRecord.acccode} ${currentRecord.accfullname}`,
        [`borrow-${record.id}`]: currentRecord.borrow,
        [`loan-${record.id}`]: currentRecord.loan,
      })
      setTableData((prev) =>
        prev.map((item) =>
          item.id === record.id
            ? {
                ...currentRecord,
                accfullnameCode: `${item.acccode} ${item.accfullname}`,
              }
            : item
        )
      )
    } else {
      setTableData((prev) => prev.filter((item) => item.id !== record.id))
    }
  }

  // 借贷输入框校验 借方和贷方至少有一项不为0
  const validateDebitCredit = (record) => [
    {
      validator(_, cb) {
        const borrow = tableForm.getFieldValue(`borrow-${record.id}`)
        const loan = tableForm.getFieldValue(`loan-${record.id}`)
        if ((!borrow || borrow === 0) && (!loan || loan === 0)) {
          return cb('借贷必须输入一个')
        } else {
          return cb()
        }
      },
    },
  ]

  // 表格列
  const columns = [
    {
      title: '序号',
      dataIndex: 'order',
      width: 75,
      align: 'center',
      render: (text, record, index) =>
        isEditRows.includes(record.id) ? (
          <Space>
            <IconCheck className='text-xl! text-blue-600!' onClick={() => onSaveRow(record)} />
            <IconClose className='text-xl! text-red-600!' onClick={() => onCancelRow(record)} />
          </Space>
        ) : (
          index + 1
        ),
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      render: (text, record) =>
        isEditRows.includes(record.id) ? (
          <Form.Item
            className='mb-0!'
            field={`summary-${record.id}`}
            rules={[{ required: true, message: '摘要不能为空' }]}
            initialValue={text}>
            <Input.TextArea rows={1} />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: '科目',
      dataIndex: 'accfullnameCode',
      width: 360,
      render: (text, record) =>
        isEditRows.includes(record.id) && [0, 2].includes(record?.authtype) ? (
          <Form.Item required className='mb-0!'>
            <div className='flex items-center gap-2'>
              <Form.Item
                className='mb-0! flex-1'
                field={`accfullnameCode-${record.id}`}
                rules={[{ required: true, message: '科目不能为空' }]}
                initialValue={text}>
                <Input.TextArea rows={2} />
              </Form.Item>
              <IconMore className='text-xl!' onClick={() => openAccount(record)} />
            </div>
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: '借方',
      dataIndex: 'borrow',
      align: 'center',
      children: [
        {
          title: '亿',
          dataIndex: 'borrow_10',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.borrow, 10),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 11

              const auxiliary = record?.assistitems?.items && record?.assistitems?.items?.length > 0 ? 1 : 0
              const isLoanFilled = tableForm.getFieldValue(`loan-${record.id}`)

              obj.children = (
                <Form.Item
                  className='mb-0!'
                  field={`borrow-${record.id}`}
                  initialValue={record?.borrow}
                  rules={validateDebitCredit(record)}
                  disabled={auxiliary === 1 || isLoanFilled}>
                  <InputNumber
                    className='w-full'
                    prefix={'¥'}
                    hideControl
                    autoComplete='off'
                    precision={1}
                    step={0.01}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              )
            }
            return obj
          },
        },
        {
          title: '千',
          dataIndex: 'borrow_9',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.borrow, 9),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '百',
          dataIndex: 'borrow_8',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.borrow, 9),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '十',
          dataIndex: 'borrow_7',
          className: 'row-money row-blue',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.borrow, 7),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '万',
          dataIndex: 'borrow_6',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.borrow, 6),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '千',
          dataIndex: 'borrow_5',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.borrow, 5),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '百',
          dataIndex: 'borrow_4',
          className: 'row-money row-blue',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.borrow, 4),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '十',
          dataIndex: 'borrow_3',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.borrow, 3),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '元',
          dataIndex: 'borrow_2',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.borrow, 2),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '角',
          dataIndex: 'borrow_1',
          className: 'row-money row-red',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.borrow, 1),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '分',
          dataIndex: 'borrow_0',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.borrow, 0),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
      ],
    },
    {
      title: '贷方',
      dataIndex: 'loan',
      align: 'center',
      children: [
        {
          title: '亿',
          dataIndex: 'loan_10',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.loan, 10),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 11
              const auxiliary = record?.assistitems?.items && record?.assistitems?.items?.length > 0 ? 1 : 0
              const isBorrowFilled = tableForm.getFieldValue(`borrow-${record.id}`)
              obj.children = (
                <Form.Item
                  className='mb-0!'
                  field={`loan-${record.id}`}
                  initialValue={record?.loan}
                  rules={validateDebitCredit(record)}
                  disabled={auxiliary === 1 || isBorrowFilled}>
                  <InputNumber
                    className='w-full'
                    prefix={'¥'}
                    hideControl
                    autoComplete='off'
                    precision={1}
                    step={0.01}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              )
            }
            return obj
          },
        },
        {
          title: '千',
          dataIndex: 'loan_9',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.loan, 9),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '百',
          dataIndex: 'loan_8',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.loan, 8),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '十',
          dataIndex: 'loan_7',
          className: 'row-money row-blue',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.loan, 7),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '万',
          dataIndex: 'loan_6',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.loan, 6),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '千',
          dataIndex: 'loan_5',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.loan, 5),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '百',
          dataIndex: 'loan_4',
          className: 'row-money row-blue',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.loan, 4),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '十',
          dataIndex: 'loan_3',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.loan, 3),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '元',
          dataIndex: 'loan_2',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.loan, 2),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '角',
          dataIndex: 'loan_1',
          className: 'row-money row-red',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.loan, 1),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '分',
          dataIndex: 'loan_0',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: transNum(record?.loan, 0),
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
      ],
    },
  ]

  // 行选择
  const onSelectRow = (record) => {
    // 设置选中行
    setSelectRow(record)
    // 处理辅助账信息
    const assistInfo = record?.assistitems
    const updatedAssistItems = {
      ...assistInfo,
      direct: record?.borrow !== 0 ? 1 : 2,
      items: (assistInfo?.items || [])?.map((item) => ({
        ...item,
        codeName: item?.itemid ? `${item?.itemcode}-${item?.itemname}` : '',
      })),
    }
    assistForm.setFieldsValue(updatedAssistItems)
  }

  // 行编辑
  const onEditRow = (record) => {
    setIsEditRows((prev) => [...prev, record.id])
  }

  // 页面加载时执行
  useEffect(() => {
    const { proof } = proofInfo
    const { entrys, ...restProof } = proof

    const newEntrys = entrys.map((item) => {
      return {
        ...item,
        accfullnameCode: `${item.acccode} ${item.accfullname}`,
      }
    })
    setTableData(newEntrys)
    tableForm.setFieldsValue({ entrys: newEntrys })

    const key = tylelist.find((item) => String(item.id) == String(restProof.status)) || {}
    const itemProof = {
      ...proof,
      status_name: key?.name,
      status_color: key?.color,
      range: `${restProof?.year}年${restProof?.month}期`,
      disabledDate: [
        dayjs(`${restProof?.year}-${restProof?.month}`).endOf('month').format('YYYY-MM-DD'),
        dayjs(`${restProof?.year}-${restProof?.month}`).startOf('month').format('YYYY-MM-DD'),
      ],
      defaultStart: dayjs(`${restProof?.year}-${restProof?.month}`).format('YYYY-MM-DD'),
    }

    setPageProof(itemProof)
    pageForm.setFieldsValue(itemProof)
  }, [])

  return (
    <>
      <div className='p-5!'>
        <div>
          <Space className='mb-4 flex w-full justify-end'>
            <Button onClick={onNewRow}>新增</Button>
            <Button onClick={onSaveTable}>保存</Button>
          </Space>
        </div>
        <div className='flex'>
          <Form className='flex-1' autoComplete='off' form={tableForm} wrapperCol={{ span: 24 }}>
            <Table
              rowKey='id'
              borderCell
              pagination={false}
              columns={columns}
              data={tableData}
              scroll={{ y: 500 }}
              summary={() => (
                <Table.Summary fixed='bottom'>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}>
                      合计：<span className='font-bold text-blue-600'>{pageProof.totalcn || '-'}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={11} className='text-right!'>
                      借方：<span className='font-bold text-blue-600'>{pageProof.borrow || '-'}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={11} className='text-right!'>
                      贷方：<span className='font-bold text-blue-600'>{pageProof.loan || '-'}</span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
              rowClassName={(record) =>
                [
                  'h-15',
                  record.id === selectRow?.id ? 'table-select' : '',
                  isEditRows.includes(record.id) ? 'table-edit' : '',
                ].join(' ')
              }
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectList,
                onChange: (e) => setSelectList(e),
              }}
              onRow={(record) => ({
                onClick: () => onSelectRow(record),
                onDoubleClick: () => onEditRow(record),
              })}
            />
          </Form>

          {tableData.length > 0 && (
            <div className='w-90 border-l border-neutral-200'>
              <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-3'>
                <div className='text-base'>辅助账</div>
                {isEditRows.includes(selectRow?.id) && selectRow?.assistitems?.items?.length > 0 && (
                  <Button type='primary' size='small' onClick={onSaveAssist}>
                    确定
                  </Button>
                )}
              </div>
              {selectRow && selectRow?.assistitems?.items?.length > 0 ? (
                <Form
                  form={assistForm}
                  size='small'
                  layout='vertical'
                  autoComplete='off'
                  className='overflow-y-auto p-4'
                  labelCol={{ style: { flexBasis: 110 } }}
                  wrapperCol={{ style: { flexBasis: `calc(100% - ${110}px)` } }}
                  validateMessages={{ required: (_, { label }) => `${label}不能为空` }}
                  disabled={!isEditRows.includes(selectRow?.id)}
                  onChange={(v, vs) => onChangeAssist(v, vs)}>
                  <Form.Item label='业务日期' field={'bdate'} rules={[{ required: true }]}>
                    <DatePicker className='w-full!' defaultPickerValue={pageProof?.defaultStart} />
                  </Form.Item>
                  <Form.Item label='方向' field={'direct'} rules={[{ required: true }]}>
                    <Radio.Group>
                      <Radio value={1}>借</Radio>
                      <Radio value={2}>贷</Radio>
                    </Radio.Group>
                  </Form.Item>
                  {selectRow?.isbj === 1 && (
                    <Form.Item label='到期日期' field={'edate'} rules={[{ required: true }]}>
                      <DatePicker className='w-full!' />
                    </Form.Item>
                  )}
                  <Form.Item
                    label='本位币金额'
                    field={'money'}
                    rules={[
                      { required: true },
                      {
                        validator: (value, cb) => {
                          if (value === '' || value === null || value === undefined || isNaN(value)) {
                            return cb('本位币金额不能为空')
                          }
                          return cb()
                        },
                      },
                    ]}>
                    <InputNumber
                      hideControl
                      prefix='¥'
                      autoComplete='off'
                      precision={1}
                      step={0.01}
                      formatter={(value) => value && `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                  <Form.Item shouldUpdate noStyle>
                    {(values) =>
                      (values?.items || [])?.map((item, index) => (
                        <Form.Item
                          key={index}
                          label={item.typename}
                          field={`items[${index}].codeName`}
                          rules={[{ required: true }]}>
                          <Input
                            placeholder='请输入'
                            suffix={
                              <IconMore
                                disabled={!isEditRows.includes(selectRow?.id)}
                                onClick={() => isEditRows.includes(selectRow?.id) && openAssist(item)}
                              />
                            }
                          />
                        </Form.Item>
                      ))
                    }
                  </Form.Item>
                  <Form.Item label='摘要' field={'summary'} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                  </Form.Item>
                  <Form.Item shouldUpdate noStyle>
                    {(values) => {
                      if (['1221.003', '2241.005'].includes(selectRow.acccode)) {
                        return values?.project_off_set?.map((item, index) => (
                          <>
                            <Form.Item triggerPropName='checked' style={{ marginTop: 20 }} field={`project_off_set[${index}].id`}>
                              <Checkbox>冲抵项目款</Checkbox>
                            </Form.Item>
                            <Form.Item
                              label='供应商'
                              field={`project_off_set[${index}].suppliername`}
                              rules={[{ required: true }]}>
                              <Input placeholder='请输入' />
                            </Form.Item>
                            <Form.Item label='项目' field={`project_off_set[${index}].projectname`} rules={[{ required: true }]}>
                              <Input placeholder='请输入' />
                            </Form.Item>
                            <Form.Item label='合同号' field={`project_off_set[${index}].contractno`} rules={[{ required: true }]}>
                              <Input placeholder='请输入' />
                            </Form.Item>
                          </>
                        ))
                      }
                    }}
                  </Form.Item>
                </Form>
              ) : (
                <Empty />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 会计科目 */}
      <Drawer visible={visibleAccount} width={'52%'} title='会计科目选择' footer={null} onCancel={() => setVisibleAccount(false)}>
        {visibleAccount && <AccountInfo accountParams={accountParams} onSelect={onAccountEntry} />}
      </Drawer>

      {/* 辅助账 */}
      <Drawer
        visible={visibleAssist}
        width={'52%'}
        title={assistParams?.typename}
        footer={null}
        onCancel={() => setVisibleAssist(false)}>
        {visibleAssist && <AssistInfo assistParams={{ ...assistParams, groupid: 1 }} onSelect={onAssistEntry} />}
      </Drawer>
    </>
  )
}
export default Demo1
