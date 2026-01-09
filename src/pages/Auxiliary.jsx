import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { Button, Checkbox, DatePicker, Drawer, Form, Layout, Message, Modal, Select, Table } from '@arco-design/web-react'
import { IconExport, IconSearch } from '@arco-design/web-react/icon'
// 公共方法
import { downloadFile, formatNumber } from 'src/utils/common'

// 组件
import dayjs from 'dayjs'
import { useEffect } from 'react'
import VoucherInfo from 'src/components/VoucherInfo'
const Auxiliary = () => {
  const [searchForm] = Form.useForm()
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)
  const [table, setTable] = useState([])
  const [tableLoading, setTableLoading] = useState(false)

  const [siderTable, setSiderTable] = useState([])
  const [siderColumns, setSiderColumns] = useState([])
  const [siderTableLoading, setSiderTableLoading] = useState(false)
  const [searchKey, setSearchKey] = useState({})

  const [selectList, setSelectList] = useState([])
  const [groupList, setGroupList] = useState([])
  const [checkList, setCheckList] = useState([])
  const [assistList, setAssistList] = useState({})
  const [accountList, setAccountList] = useState([])

  const [visibleSearch, setVisibleSearch] = useState(false)
  const refWrapper = useRef()

  const [voucherVisible, setVoucherVisible] = useState(false)
  const [voucherKey, setVoucherKey] = useState('')

  // 表头
  const columns = [
    {
      title: '科目代码',
      dataIndex: 'code',
      align: 'center',
      width: 110,
    },
    {
      title: '科目名称',
      dataIndex: 'name',
      width: 150,
      ellipsis: true,
    },
    {
      title: '记账日期',
      dataIndex: 'pdate',
      align: 'center',
      width: 120,
    },
    {
      title: '期间',
      dataIndex: 'period',
      align: 'center',
      width: 90,
    },
    {
      title: '凭证类型',
      dataIndex: 'vtype',
      align: 'center',
      width: 90,
    },
    {
      title: '凭证号',
      dataIndex: 'vno',
      align: 'center',
      width: 130,
    },
    {
      title: '业务日期',
      dataIndex: 'bdate',
      align: 'center',
      width: 120,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      width: 180,
      ellipsis: true,
    },
    {
      title: '借方',
      dataIndex: 'borrow',
      align: 'center',
      width: 140,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '贷方',
      dataIndex: 'loan',
      align: 'center',
      width: 140,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '余额',
      dataIndex: 'balance',
      align: 'center',
      width: 180,
      className: 'balance-two',
      render: (text, record) => (
        <div className='flex justify-between'>
          <div className='balance-two-line'>{record.direct}</div>
          <div>{text && formatNumber(record.balance)}</div>
        </div>
      ),
    },
  ]

  const searchColumns = [
    {
      title: '核算项目',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '选择项',
      dataIndex: 'value',
      render: (_, record) => {
        return (
          <Select
            allowClear
            style={{ width: '100%' }}
            options={assistList[record.id]}
            placeholder='请选择'
            triggerProps={{ size: 'small' }}
            disabled={record.disabled}
            value={record.value}
            onChange={(e) => {
              const newItem = {
                ...record,
                value: e || '',
              }
              setCheckList((prev) => prev.map((item) => (item.id === newItem.id ? newItem : item)))
            }}
          />
        )
      },
    },
  ]

  // 行点击
  const onRowClick = (record) => {
    if (record.sort === 1) {
      setVoucherKey(record.pid)
      setVoucherVisible(true)
    }
  }

  // 表单监控
  const onValuesChange = (value, values) => {
    const key = Object.keys(value)[0]
    // 辅助帐
    if (key === 'assist') {
      if (values[key]) {
        const ids = values[key]?.split(',').map((e) => Number(e))
        setSelectList(ids)
      } else {
        setSelectList([])
        setCheckList((prev) => prev.map((item) => ({ ...item, disabled: false, value: null })))
      }
    }
  }

  // 侧边栏表格点击
  const onSiderRow = async (record) => {
    setTableLoading(true)
    const params = {
      ...searchKey,
      itemkey: record.id,
    }
    const { code, data, message } = await Http.post('/check/detail/list', params)
    if (code === 200) {
      const list = (data?.list || []).map((e, index) => ({ ...e, index_id: index }))
      setTable(list)
    } else {
      Message.error(message)
    }
    setTableLoading(false)
  }

  // 导出
  const onExport = (record, e) => {
    Modal.confirm({
      title: '提示',
      content: '确定导出当前辅助账明细？',
      onOk: async () => {
        const params = {
          ...searchKey,
          itemkey: record.id,
        }
        const result = await Http.post('/check/detail/export', params, {
          responseType: 'blob',
        })
        const fileName = record[e.id]
        downloadFile(result, fileName, 'xlsx')
      },
    })
  }
  // 提交搜索
  const submitSearch = async () => {
    setSiderTableLoading(true)
    const values = searchForm.getFields()
    if (values?.times) {
      const checks = checkList.filter((e) => selectList.includes(e.id)).map(({ disabled, ...item }) => item)
      const beginTime = values?.times[0].split('-')
      const endTime = values?.times[1].split('-')

      const params = {
        groupid: currentCompany.id,
        acccode: values.acccode,
        limitstatus: values.limitstatus,
        includecheckout: values.includecheckout,
        beginyear: Number(beginTime[0]),
        beginmonth: Number(beginTime[1]),
        endyear: Number(endTime[0]),
        endmonth: Number(endTime[1]),
        checks: checks,
      }

      setSearchKey(params)
      const { code, data, message } = await Http.post('/check/cond/list', params)
      if (code === 200) {
        const header = (data.header || []).map((e) => ({
          ...e,
          title: e.name,
          dataIndex: e.id,
          align: 'center',
          render: (text, record) => (
            <div className='group flex items-center justify-between gap-1 text-left'>
              {text}
              <span className='translate-x-2 cursor-pointer text-base text-blue-500 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100'>
                <IconExport onClick={() => onExport(record, e)} />
              </span>
            </div>
          ),
        }))
        setSiderColumns(header)

        const list = data?.list || []
        // 过滤掉没有数据的列
        const headerIds = data.header.map((item) => item.id)
        const filteredList = list.filter((item) => {
          const itemKeys = Object.keys(item).filter((key) => key !== 'id')
          return itemKeys.some((key) => headerIds.includes(parseInt(key)))
        })

        setSiderTable(filteredList)

        setVisibleSearch(false)
        setTable([])
      } else {
        Message.error(message)
      }
    }

    setSiderTableLoading(false)
  }

  // 搜索-科目
  const searchAccount = async () => {
    if (selectList?.length > 0) {
      const names = checkList.filter((e) => selectList.includes(e.id)).map((e) => e.code)
      const params = {
        names,
      }
      const { code, data } = await Http.post('/check/account/list', params)
      if (code === 200) {
        const list = (data?.list || []).map((e) => ({
          ...e,
          label: e.name,
          value: e.code,
        }))
        setAccountList(list)
      }
    } else {
      Message.warning('请至少选择一个核算项目')
    }
  }

  // 监控表格选择项
  const changeCheckbox = (values) => {
    if (!values?.length) return false
    const selectSet = new Set(values)
    const isExactMatch = (e) => e.ids?.length === values.length && e.ids.every((id) => selectSet.has(id))
    const exactMatchGroup = values.length > 1 ? groupList.find(isExactMatch) : groupList.find((e) => e.ids[0] === values[0])

    const newCheckList = [...checkList].map((e) => {
      return {
        ...e,
        disabled: !exactMatchGroup?.ids.includes(e.id),
      }
    })
    setCheckList(newCheckList)
    setSelectList(values)
  }

  // 获取多选框属性
  const getCheckboxProps = (record) => {
    if (!selectList?.length) return false
    const selectSet = new Set(selectList)
    const isExactMatch = (e) => e.ids?.length === selectList.length && e.ids.every((id) => selectSet.has(id))
    const exactMatchGroup = selectList.length > 1 ? groupList.find(isExactMatch) : null
    const relatedIds = exactMatchGroup
      ? exactMatchGroup.ids || []
      : [...new Set(groupList.filter((group) => group.ids?.some((id) => selectSet.has(id))).flatMap((group) => group.ids || []))]

    return !relatedIds.includes(record.id)
  }
  // 打开搜索
  const openSearch = () => {
    setVisibleSearch(true)

    if (siderColumns.length === 0) {
      setSelectList([])
      setAccountList([])
      setSearchKey({})
      searchForm.setFieldsValue({
        times: [dayjs().format('YYYY-MM'), dayjs().format('YYYY-MM')],
        limitstatus: false,
        includecheckout: false,
      })
    }
  }

  const getAssistList = async (key) => {
    const params = {
      haslevel: '0',
      typeid: key.id,
      name: '',
    }
    const { code, data } = await Http.post('assist/list', params)
    if (code === 200) {
      const list = (data?.list || []).map((e) => ({ ...e, value: e.code, label: e.name }))
      setAssistList((prev) => ({
        ...prev,
        [key.id]: list,
      }))
    }
  }
  const getCheckList = async () => {
    const { code, data } = await Http.post('/check/list')
    if (code === 200) {
      const list = (data?.list || []).map((e) => ({ id: e.id, name: e.code, disabled: false }))
      setCheckList(list)

      if (list.length > 0) {
        list.forEach((element) => {
          getAssistList(element)
        })
      }
    }
  }
  const getGroupList = async () => {
    const { code, data } = await Http.post('/check/grouplist')
    if (code === 200) {
      const list = (data?.list || []).map((e) => {
        return {
          ...e,
          value: e.ids,
          label: e.assist,
          ids: e.ids.split(',').map((e) => Number(e)),
        }
      })
      setGroupList(list)
    }
  }

  useEffect(() => {
    getGroupList()
    getCheckList()
  }, [])

  return (
    <>
      <Layout className='relative h-full w-full' ref={refWrapper}>
        <Layout.Sider
          width={260}
          className='relative h-full border-r border-neutral-200'
          resizeDirections={['right']}
          style={{ transform: 'scale(1)' }}>
          <Table
            size='small'
            rowKey={'id'}
            pagination={false}
            border={{ wrapper: true, cell: true }}
            scroll={{ y: pageHeight - 40 }}
            columns={siderColumns}
            data={siderTable}
            loading={siderTableLoading}
            onRow={(record, index) => {
              return {
                onDoubleClick: () => onSiderRow(record, index),
              }
            }}
          />
          <div className='fixed right-6 bottom-6 z-10'>
            <Button type='primary' size='large' shape='circle' icon={<IconSearch />} onClick={() => openSearch()} />
          </div>

          <Drawer
            width='36%'
            zIndex={10}
            title={null}
            placement='left'
            closable={false}
            visible={visibleSearch}
            getPopupContainer={() => refWrapper && refWrapper.current}
            onOk={submitSearch}
            onCancel={() => setVisibleSearch(false)}>
            <Form
              size='small'
              form={searchForm}
              autoComplete='off'
              labelCol={{ style: { flexBasis: 80 } }}
              wrapperCol={{ style: { flexBasis: `calc(100% - ${80}px)` } }}
              onValuesChange={onValuesChange}>
              <Form.Item label='会计期间' field='times'>
                <DatePicker.RangePicker
                  className='w-full'
                  allowClear={false}
                  mode='month'
                  placeholder={['开始年月', '结束年月']}
                  separator='至'
                  disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(currentCompany.beginyearmonth))}
                />
              </Form.Item>
              <Form.Item label='辅助帐' field='assist'>
                <Select options={groupList} placeholder='请输入凭证号' allowClear />
              </Form.Item>
              <Form.Item wrapperCol={{ span: 24 }} field='checks'>
                <Table
                  border={{ wrapper: true, cell: true }}
                  columns={searchColumns}
                  size='small'
                  data={checkList}
                  pagination={false}
                  rowKey={'id'}
                  rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectList,
                    onChange: (selectedRowKeys) => changeCheckbox(selectedRowKeys),
                    checkboxProps: (record) => {
                      return { disabled: getCheckboxProps(record) }
                    },
                  }}
                />
              </Form.Item>
              <Form.Item label='科目代码' field='acccode'>
                <div className='flex flex-nowrap items-baseline'>
                  <Select
                    allowClear
                    options={accountList}
                    onChange={(e) => searchForm.setFieldValue('acccode', e)}
                    placeholder='请输入凭证号'
                  />
                  <Button icon={<IconSearch />} onClick={searchAccount} />
                </div>
              </Form.Item>
              <Form.Item field='limitstatus' triggerPropName={'checked'}>
                <Checkbox>包含未过账凭证</Checkbox>
              </Form.Item>
              <Form.Item field='includecheckout' triggerPropName={'checked'}>
                <Checkbox>不包含结转损益凭证</Checkbox>
              </Form.Item>
            </Form>
          </Drawer>
        </Layout.Sider>
        <Layout.Content>
          <Table
            size='small'
            rowKey={'index_id'}
            loading={tableLoading}
            border={{ wrapper: true, cell: true }}
            columns={columns}
            data={table}
            pagination={false}
            scroll={{ x: true, y: pageHeight - 40 }}
            onRow={(record, index) => {
              return {
                onDoubleClick: () => onRowClick(record, index),
              }
            }}
            rowClassName={(record) =>
              record.pid === 0 && record.sort === 2
                ? 'table-summary'
                : record.pid === 0 && record.sort === 3
                  ? 'table-summary-all'
                  : ''
            }
          />
        </Layout.Content>
      </Layout>

      <VoucherInfo visible={voucherVisible} voucherKey={voucherKey} onCancel={() => setVoucherVisible(false)} />
    </>
  )
}
export default Auxiliary
