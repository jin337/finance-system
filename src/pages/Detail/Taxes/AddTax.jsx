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
    name: '应交增值税-销项-简易征收',
    path: '/detail/taxes/addtaxin',
    link: 'query/liability/taxes/addtaxin/list',
    export: 'query/liability/taxes/addtaxin/export',
    sname: '收票单位',
  },
  {
    name: '应交增值税-销项-一般征收',
    path: '/detail/taxes/addtaxin-jy',
    link: 'query/liability/taxes/addtaxin/jy/list',
    export: 'query/liability/taxes/addtaxin/jy/export',
    sname: '收票单位',
  },
  {
    name: '应交增值税-进项',
    path: '/detail/taxes/addtaxout',
    link: 'query/liability/taxes/addtaxout/list',
    export: 'query/liability/taxes/addtaxout/export',
    sname: '开票单位',
  },
]
// 组件
const TemplateOne = () => {
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
      title: '发票日期',
      dataIndex: 'fpdate',
      align: 'center',
      width: 120,
      render: (text) => !!text && dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '发票号码',
      dataIndex: 'fpno',
    },
    {
      title: '发票类型',
      dataIndex: 'billtype',
    },
    {
      title: selectInfo?.sname || '收票单位',
      dataIndex: 'fpgroup',
      align: 'center',
    },
    {
      title: '项目名称',
      dataIndex: 'productname',
    },
    {
      title: '规格型号',
      dataIndex: 'modetype',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      align: 'center',
      width: 70,
    },
    {
      title: '数量',
      dataIndex: 'nums',
      align: 'center',
      width: 70,
    },
    {
      title: '单价(不含税)',
      dataIndex: 'price',
      align: 'center',
      width: 130,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '金额(不含税)',
      dataIndex: 'noratemoney',
      align: 'center',
      width: 130,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '税率/征收率',
      dataIndex: 'rate',
      align: 'center',
      width: 110,
    },
    {
      title: '税额',
      dataIndex: 'ratemoney',
      align: 'center',
      width: 130,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '价税合计',
      dataIndex: 'money',
      align: 'center',
      width: 130,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
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
                disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(selectInfo?.disabledDate))}
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
export default TemplateOne
