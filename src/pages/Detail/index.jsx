import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router'

import { Button, DatePicker, Form, Layout, Table } from '@arco-design/web-react'

// 公共方法
import { downloadFile, formatNumber } from 'src/utils/common'

// 组件
import VoucherInfo from 'src/components/VoucherInfo'

const list = [
  {
    name: '应收票据',
    path: '/detail/bill-receive',
    link: '/query/asset/bill/receive/list',
    export: '/query/asset/bill/receive/export',
  },
  {
    name: '应收账款',
    path: '/detail/account-receive',
    link: '/query/asset/account/receive/list',
    export: '/query/asset/account/receive/export',
  },
  {
    name: '其他应收款',
    path: '/detail/ohter-receive',
    link: '/query/asset/ohter/receive/list',
    export: '/query/asset/ohter/receive/export',
  },
  {
    name: '预付账款',
    path: '/detail/prepay',
    link: '/query/asset/prepay/list',
    export: '/query/asset/prepay/export',
  },
  {
    name: '长期待摊费用',
    path: '/detail/longterm',
    link: '/query/asset/longterm/list',
    export: '/query/asset/longterm/export',
  },
  {
    name: '固定资产折旧',
    path: '/detail/depreciation',
    link: '/query/asset/depreciation/list',
    export: '/query/asset/depreciation/export',
  },
  {
    title: '短期借款',
    path: '/detail/shortbrrow',
    link: '/query/liability/shortbrrow/list',
    export: '/query/liability/shortbrrow/export',
  },
  {
    title: '应付票据',
    path: '/detail/bill-pay',
    link: '/query/liability/bill/pay/list',
    export: '/query/liability/bill/pay/export',
  },
  {
    title: '应付账款',
    path: '/detail/account-pay',
    link: '/query/liability/account/pay/list',
    export: '/query/liability/account/pay/export',
  },
  {
    title: '预收账款',
    path: '/detail/account-receive',
    link: '/query/liability/account/receive/list',
    export: '/query/liability/account/receive/export',
  },
  {
    title: '应付工资',
    path: '/detail/wages-pay',
    link: '/query/liability/wages/pay/list',
    export: '/query/liability/wages/pay/export',
  },
  {
    title: '销售费用',
    path: '/detail/expense-sell',
    link: '/query/expense/sell/list',
    export: '/query/expense/sell/export',
  },
  {
    title: '管理费用',
    path: '/detail/expense-manage',
    link: '/query/expense/manage/list',
    export: '/query/expense/manage/export',
  },
  {
    title: '研发费用',
    path: '/detail/expense-develop',
    link: '/query/expense/develop/list',
    export: '/query/expense/develop/export',
  },
  {
    title: '财务费用',
    path: '/detail/expense-exp',
    link: '/query/expense/exp/list',
    export: '/query/expense/exp/export',
  },
]
// 组件
const Detail = () => {
  const location = useLocation()
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)

  const [selectInfo, setSelectInfo] = useState()
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState([])

  const [voucherVisible, setVoucherVisible] = useState(false)
  const [voucherKey, setVoucherKey] = useState()

  // 表头
  const columns = [
    {
      title: '期间',
      dataIndex: 'period',
      align: 'center',
      width: 90,
      render: (_, record) => (record.year ? `${record.year}.${record.month}` : ''),
    },
    {
      title: '凭证号',
      dataIndex: 'vno',
      align: 'center',
      width: 140,
    },
    {
      title: '科目代码',
      dataIndex: 'account_code',
      align: 'center',
      width: 110,
    },
    {
      title: '科目名称',
      dataIndex: 'account_name',
    },
    {
      title: '摘要',
      dataIndex: 'summary',
    },
    {
      title: '核算项目',
      dataIndex: 'itemname',
      render: (text) =>
        text &&
        text.split('##').map((item, index) => (
          <div key={`${item}-${index}`} className='flex items-baseline gap-1.5'>
            <div className='min-h-2 min-w-2 bg-gray-500'></div>
            {item}
          </div>
        )),
    },
    {
      title: '借方',
      dataIndex: 'borrow',
      align: 'center',
      width: 130,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '贷方',
      dataIndex: 'loan',
      align: 'center',
      width: 130,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
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
          <div>{!!record.balance && formatNumber(record.balance)}</div>
        </div>
      ),
    },
  ]

  // 导出
  const onExport = async (values) => {
    const begin = dayjs(values.selectData[0]).format('YYYY-MM').split('-')
    const end = dayjs(values.selectData[1]).format('YYYY-MM').split('-')
    const params = {
      groupid: currentCompany.id,
      beginyear: Number(begin[0]),
      beginmonth: Number(begin[1]),
      endyear: Number(end[0]),
      endmonth: Number(end[1]),
    }
    const result = await Http.post(values.export, params, {
      responseType: 'blob',
    })

    downloadFile(result, values.name, 'xlsx')
  }

  // 搜索
  const onSearch = async (values) => {
    setTableLoading(true)
    const begin = dayjs(values.selectData[0]).format('YYYY-MM').split('-')
    const end = dayjs(values.selectData[1]).format('YYYY-MM').split('-')
    const params = {
      groupid: currentCompany.id,
      beginyear: Number(begin[0]),
      beginmonth: Number(begin[1]),
      endyear: Number(end[0]),
      endmonth: Number(end[1]),
    }
    const { code, data } = await Http.post(values.link, params)
    if (code === 200) {
      const list = (data?.list || []).map((e, i) => ({ ...e, index_id: i }))
      setTableData(list)
    }
    setTimeout(() => {
      setTableLoading(false)
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
  const onRowClick = (record) => {
    if (record.sort === 1) {
      setVoucherKey(record.pid)
      setVoucherVisible(true)
    }
  }

  useEffect(() => {
    if (currentCompany) {
      const path = location.pathname
      const item = list.find((e) => e.path === path)
      if (item) {
        const info = {
          ...item,
          disabledDate: currentCompany.beginyearmonth,
          selectData: [currentCompany.beginyearmonth, dayjs().format('YYYY-MM')],
        }
        setSelectInfo(info)
        onSearch(info)
      }
    }
  }, [currentCompany, location.pathname])

  return (
    <>
      <Layout className='h-full w-full'>
        <Layout.Header className='px-5 pt-5 pb-3'>
          <Form autoComplete='off' layout='inline' size='small'>
            <Form.Item label='查询区间'>
              <DatePicker.RangePicker
                mode='month'
                placeholder={['开始年月', '结束年月']}
                style={{ width: 200 }}
                allowClear={false}
                value={selectInfo?.selectData}
                disabledDate={(e) => e.isBefore(dayjs(selectInfo?.disabledDate))}
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
            loading={tableLoading}
            border={{ wrapper: true, cell: true }}
            columns={columns}
            data={tableData}
            pagination={false}
            scroll={{ x: true, y: pageHeight - 182 }}
            onRow={(record, index) => {
              return {
                onDoubleClick: () => onRowClick(record, index),
              }
            }}
            rowClassName={(record) => (record.pid === 0 && record.sort === 2 ? 'table-summary' : '')}
          />
        </Layout.Content>
      </Layout>

      <VoucherInfo visible={voucherVisible} voucherKey={voucherKey} onCancel={() => setVoucherVisible(false)} />
    </>
  )
}
export default Detail
