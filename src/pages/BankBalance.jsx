import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { Button, DatePicker, Form, Layout, Table, Tabs } from '@arco-design/web-react'
import { useSelector } from 'react-redux'

// 公共方法
import { downloadFile, formatNumber } from 'src/utils/common'

// 组件
import VoucherInfo from 'src/components/VoucherInfo'

const BankBalance = () => {
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)

  const [tableLoading, setTableLoading] = useState(false)
  const [titleData, setTitleData] = useState([])

  const [selectInfo, setSelectInfo] = useState()
  const [tableDetail, setTableDetail] = useState([])
  const [tableDetailLoading, setTableDetailLoading] = useState(false)

  const [voucherVisible, setVoucherVisible] = useState(false)
  const [voucherKey, setVoucherKey] = useState()

  // 表格列定义
  const columnsList = [
    {
      title: '银行账户',
      dataIndex: 'itemname',
      align: 'center',
      render: (_, record) => (
        <div className={['cursor-pointer', 'text-left', record?.code === selectInfo?.code ? 'text-blue-600' : ''].join(' ')}>
          <div>{record.name}</div>
          <div className='mt-1'>
            余额：<span className='font-semibold'>{formatNumber(record.balance) || '0.00'}</span>
          </div>
        </div>
      ),
    },
  ]

  const columnsDetail = [
    {
      title: '期间',
      dataIndex: 'period',
      align: 'center',
      width: 100,
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
      width: 140,
    },
    {
      title: '记账日期',
      dataIndex: 'pdate',
      align: 'center',
      width: 140,
      render: (text) => <>{text && dayjs(text).format('YYYY-MM-DD')}</>,
    },
    {
      title: '业务日期',
      dataIndex: 'bdate',
      align: 'center',
      width: 140,
      render: (text) => <>{text && dayjs(text).format('YYYY-MM-DD')}</>,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      ellipsis: true,
    },
    {
      title: '借方',
      dataIndex: 'borrow',
      align: 'center',
      width: 130,
      render: (text) => <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '贷方',
      dataIndex: 'loan',
      align: 'center',
      width: 130,
      render: (text) => <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '余额',
      dataIndex: 'balance',
      align: 'center',
      width: 180,
      className: 'balance-two',
      render: (_, record) => (
        <div className='flex justify-between'>
          <div className='balance-two-line'>{record.direct}</div>
          <div>{formatNumber(record.balance)}</div>
        </div>
      ),
    },
  ]

  // 行点击
  const onRowClick = (record) => {
    if (record.sort === 1) {
      setVoucherKey(record.pid)
      setVoucherVisible(true)
    }
  }

  // 改变数据
  const onChangeData = (e) => {
    setSelectInfo((prev) => ({
      ...prev,
      selectData: e,
    }))
  }

  // 导出
  const onExport = async (item) => {
    const begin = dayjs(item.selectData[0]).format('YYYY-MM').split('-')
    const end = dayjs(item.selectData[1]).format('YYYY-MM').split('-')

    const params = {
      groupid: currentCompany?.id,
      itemkey: item.itemkey,
      beginyear: Number(begin[0]),
      beginmonth: Number(begin[1]),
      endyear: Number(end[0]),
      endmonth: Number(end[1]),
    }

    const result = await Http.post('/bank/balance/export', params, {
      responseType: 'blob',
    })

    const fileName = `银行存款余额表_${item.name}`
    downloadFile(result, fileName, 'xlsx')
  }

  // 查询
  const onSearch = async (item) => {
    setTableDetailLoading(true)
    const begin = dayjs(item.selectData[0]).format('YYYY-MM').split('-')
    const end = dayjs(item.selectData[1]).format('YYYY-MM').split('-')

    const params = {
      groupid: currentCompany?.id,
      itemkey: item.itemkey,
      beginyear: Number(begin[0]),
      beginmonth: Number(begin[1]),
      endyear: Number(end[0]),
      endmonth: Number(end[1]),
    }
    const { code, data } = await Http.post('/bank/balance/list', params)
    if (code === 200) {
      const list = (data?.list || []).map((e, i) => ({ ...e, index_id: i }))
      setTableDetail(list)
    }
    setTimeout(() => {
      setTableDetailLoading(false)
    }, 100)
  }

  // 行点击
  const onRowTitleClick = (record) => {
    setSelectInfo(record)
    onSearch(record)
  }

  // 获取银行
  const getBankList = async () => {
    setTableLoading(true)
    const { code, data } = await Http.post('/bank/list', { groupid: currentCompany?.id })
    if (code === 200) {
      const list = (data?.list || []).map((e) => ({
        ...e,
        selectData: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      }))
      setTitleData(list)
      // 默认点击第一项
      onRowTitleClick(list[0])
    }
    setTableLoading(false)
  }

  useEffect(() => {
    if (currentCompany) {
      getBankList()
    }
  }, [currentCompany])

  return (
    <>
      <Layout className='h-full w-full'>
        <Layout.Sider width={260} className='h-full border-r border-neutral-200' resizeDirections={['right']}>
          <Tabs className='receivable-tabs h-full' justify defaultActiveTab='1'>
            <Tabs.TabPane key='1' title='银行账户' className='overflow-y-auto px-4' style={{ height: pageHeight - 70 + 'px' }}>
              <Table
                size='small'
                rowKey={'itemkey'}
                columns={columnsList}
                data={titleData}
                loading={tableLoading}
                showHeader={false}
                pagination={false}
                onRow={(record, index) => {
                  return {
                    onClick: () => onRowTitleClick(record, index),
                  }
                }}
              />
            </Tabs.TabPane>
          </Tabs>
        </Layout.Sider>
        <Layout className='h-full overflow-hidden'>
          <Layout.Header className='px-5 pt-5 pb-3'>
            <Form autoComplete='off' layout='inline' size='small'>
              <Form.Item label='查询区间'>
                <DatePicker.RangePicker
                  mode='month'
                  placeholder={['开始年月', '结束年月']}
                  style={{ width: 200 }}
                  allowClear={false}
                  value={selectInfo?.selectData}
                  onChange={onChangeData}
                  disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(currentCompany.beginyearmonth))}
                />
              </Form.Item>
              <Form.Item>
                <Button type='primary' onClick={() => onSearch(selectInfo)}>
                  查询
                </Button>
              </Form.Item>
              <Form.Item>
                <Button type='primary' onClick={() => onExport(selectInfo)}>
                  导出
                </Button>
              </Form.Item>
            </Form>
          </Layout.Header>
          <Layout.Content className='px-5'>
            <Table
              size='small'
              rowKey={'index_id'}
              loading={tableDetailLoading}
              border={{ wrapper: true, cell: true }}
              columns={columnsDetail}
              data={tableDetail}
              pagination={false}
              scroll={{ x: 1400, y: pageHeight - 120 }}
              onRow={(record, index) => {
                return {
                  onDoubleClick: () => onRowClick(record, index),
                }
              }}
              rowClassName={(record) => (record.pid === 0 && record.sort === 2 ? 'table-summary' : '')}
            />
          </Layout.Content>
        </Layout>
      </Layout>

      <VoucherInfo visible={voucherVisible} voucherKey={voucherKey} onCancel={() => setVoucherVisible(false)} />
    </>
  )
}
export default BankBalance
