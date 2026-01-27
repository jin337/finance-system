import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { Button, DatePicker, Drawer, Form, Layout, Table, Tabs, Tooltip, Typography } from '@arco-design/web-react'
import { useSelector } from 'react-redux'

// 公共方法
import { downloadFile, formatNumber } from 'src/utils/common'

// 组件
import VoucherInfo from 'src/components/VoucherInfo'

const list = [
  {
    key: '1',
    title: '供应商',
    sub: '应付余额',
    list: '/inout/supplier/list',
    detail: '/inout/supplier/detail',
    export: '/inout/supplier/export',
    datelimit: {},
    listInfo: [],
  },
  {
    key: '2',
    title: '客户',
    sub: '应收余额',
    list: '/inout/customer/list',
    detail: '/inout/customer/detail',
    export: '/inout/customer/export',
    datelimit: {},
    listInfo: [],
  },
  {
    key: '3',
    title: '个人',
    sub: '来往余额',
    list: '/inout/person/list',
    detail: '/inout/person/detail',
    export: '/inout/person/export',
    datelimit: {},
    listInfo: [],
  },
]

const Receivable = () => {
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)

  const [receivableList, setReceivableList] = useState(list)
  const [tableLoading, setTableLoading] = useState(false)

  const [selectInfo, setSelectInfo] = useState()
  const [tableDetail, setTableDetail] = useState([])
  const [tableDetailLoading, setTableDetailLoading] = useState(false)

  const [voucherVisible, setVoucherVisible] = useState(false)
  const [voucherParams, setVoucherParams] = useState()

  // 表格列定义
  const columnsList = [
    {
      title: 'Name',
      dataIndex: 'itemname',
      render: (_, record) => (
        <div className={['cursor-pointer', record?.itemcode === selectInfo?.itemcode ? 'text-blue-600' : ''].join(' ')}>
          <div>{record.itemname}</div>
          <div className='mt-1'>
            {record.sub}：<span className='font-semibold'>{formatNumber(record.balance) || '0.00'}</span>
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
      title: '科目名称',
      dataIndex: 'fullname',
      render: (text) => (
        <Tooltip content={text}>
          <Typography.Text ellipsis className='mb-0!'>
            {text}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      render: (text) => (
        <Tooltip content={text}>
          <Typography.Text ellipsis className='mb-0!'>
            {text}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: '借方',
      dataIndex: 'borrow',
      align: 'center',
      width: 140,
      render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
    },
    {
      title: '贷方',
      dataIndex: 'loan',
      align: 'center',
      width: 140,
      render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
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
          <div className={`${text < 0 ? 'text-red-500' : ''}`}>{!!text && formatNumber(text)}</div>
        </div>
      ),
    },
  ]

  // 行点击
  const onRowClick = (record) => {
    if (record.sort === 1) {
      const time = record?.period?.split('.')
      setVoucherParams({
        id: record.pid,
        type: 2,
        isdrawer: 1,
        year: Number(time[0]),
        month: Number(time[1]),
      })
      setVoucherVisible(true)
    }
  }

  // 导出
  const onExport = async (item) => {
    const begin = dayjs(item.selectData[0]).format('YYYY-MM').split('-')
    const end = dayjs(item.selectData[1]).format('YYYY-MM').split('-')

    const params = {
      groupid: currentCompany?.id,
      itemcode: item.itemcode,
      beginyear: Number(begin[0]),
      beginmonth: Number(begin[1]),
      endyear: Number(end[0]),
      endmonth: Number(end[1]),
    }
    const result = await Http.post(item.export, params, {
      responseType: 'blob',
    })

    downloadFile(result, item.itemname + '-应收应付查询', 'xlsx')
  }

  // 查询
  const onSearch = async (item) => {
    setTableDetailLoading(true)
    const begin = dayjs(item.selectData[0]).format('YYYY-MM').split('-')
    const end = dayjs(item.selectData[1]).format('YYYY-MM').split('-')

    const params = {
      groupid: currentCompany?.id,
      itemcode: item.itemcode,
      beginyear: Number(begin[0]),
      beginmonth: Number(begin[1]),
      endyear: Number(end[0]),
      endmonth: Number(end[1]),
    }
    const { code, data } = await Http.post(item.detail, params)
    if (code === 200) {
      const list = (data?.list || []).map((e, i) => ({ ...e, index_id: i }))
      setTableDetail(list)
    }
    setTimeout(() => {
      setTableDetailLoading(false)
    }, 100)
  }

  // 改变数据
  const onChangeData = (e) => {
    setSelectInfo((prev) => ({
      ...prev,
      selectData: e,
    }))
  }
  // 行点击
  const onRowTitleClick = (record) => {
    setSelectInfo(record)
    onSearch(record)
  }

  // 切换标签
  const onChangeTab = async (key) => {
    setTableLoading(true)
    const item = receivableList.find((item) => item.key === key)
    const { code, data } = await Http.post(item.list, { groupid: currentCompany?.id })
    if (code === 200) {
      item.datelimit = data?.datelimit || {}
      item.listInfo = (data?.list || []).map((e) => ({
        ...e,
        ...item,
        disabledDate: `${item.datelimit.beginyear}-${item.datelimit.beginmonth}-01`,
        selectData: [`${item.datelimit.beginyear}-${item.datelimit.beginmonth}-01`, dayjs().format('YYYY-MM-DD')],
      }))
      setReceivableList((prev) => prev.map((prevItem) => (prevItem.key === key ? { ...prevItem, ...item } : prevItem)))

      // 默认点击第一项
      onRowTitleClick(item.listInfo[0])
    }
    setTableLoading(false)
  }

  useEffect(() => {
    if (currentCompany) {
      onChangeTab('1')
    }
  }, [currentCompany])

  return (
    <>
      <Layout className='h-full w-full'>
        <Layout.Sider width={260} className='h-full border-r border-neutral-200' resizeDirections={['right']}>
          <Tabs className='receivable-tabs h-full' justify defaultActiveTab='1' onChange={onChangeTab}>
            {receivableList.map((item) => (
              <Tabs.TabPane
                key={item.key}
                title={item.title}
                className='overflow-y-auto px-4 pb-4'
                style={{ height: pageHeight - 56 + 'px' }}>
                <Table
                  size='small'
                  rowKey={'itemcode'}
                  columns={columnsList}
                  data={item?.listInfo}
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
            ))}
          </Tabs>
        </Layout.Sider>
        <Layout className='h-full overflow-hidden'>
          <Layout.Header className='p-5 pb-3'>
            <Form autoComplete='off' layout='inline' size='small'>
              <Form.Item label='查询区间'>
                <DatePicker.RangePicker
                  mode='month'
                  placeholder={['开始年月', '结束年月']}
                  style={{ width: 200 }}
                  disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(selectInfo?.disabledDate))}
                  allowClear={false}
                  value={selectInfo?.selectData}
                  onChange={onChangeData}
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

      <Drawer width='80%' title={null} footer={null} visible={voucherVisible} onCancel={() => setVoucherVisible(false)}>
        <VoucherInfo voucherParams={voucherParams} />
      </Drawer>
    </>
  )
}
export default Receivable
