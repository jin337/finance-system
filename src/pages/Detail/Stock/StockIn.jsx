import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Button, DatePicker, Form, Layout, Table } from '@arco-design/web-react'

// 公共方法
import { downloadFile, formatNumber } from 'src/utils/common'

// 组件
const StockIn = () => {
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)

  const [selectInfo, setSelectInfo] = useState()
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState([])

  // 表头
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'projectname',
      width: 210,
    },
    {
      title: '销售合同单号',
      dataIndex: 'xsdno',
      width: 160,
    },
    {
      title: '采购合同编号',
      dataIndex: 'cghtno',
      width: 190,
    },
    {
      title: '客户名称',
      dataIndex: 'customername',
      width: 210,
    },
    {
      title: '供应商名称',
      dataIndex: 'suppliername',
      width: 210,
    },
    {
      title: '发票类型',
      dataIndex: 'billtype',
      width: 140,
    },
    {
      title: '发票日期',
      dataIndex: 'fpdate',
      width: 120,
      align: 'center',
      render: (text) => <>{text && dayjs(text).format('YYYY-MM-DD')}</>,
    },
    {
      title: '发票编号',
      dataIndex: 'fpno',
      width: 200,
    },
    {
      title: '材料编码',
      dataIndex: 'devicecode',
      align: 'center',
      width: 90,
    },
    {
      title: '材料名称',
      dataIndex: 'devicename',
      width: 160,
    },
    {
      title: '规格型号',
      dataIndex: 'devicemode',
      width: 150,
    },
    {
      title: '品牌',
      dataIndex: 'devicebrand',
      align: 'center',
      width: 80,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      align: 'center',
      width: 80,
    },
    {
      title: '税率/征收率%',
      dataIndex: 'rate',
      align: 'center',
      width: 130,
    },
    {
      title: '本次入库数量',
      dataIndex: 'receivenums',
      align: 'center',
      width: 120,
      render: (text) => !!text && text,
    },
    {
      title: '单价(不含税)',
      dataIndex: 'price_norate',
      align: 'center',
      width: 140,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '金额(不含税)',
      dataIndex: 'totalmoney_norate',
      align: 'center',
      width: 140,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '税额',
      dataIndex: 'ratemoney',
      align: 'center',
      width: 140,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '价税合计',
      dataIndex: 'totalmoney',
      align: 'center',
      width: 140,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '出库类型',
      dataIndex: 'rktype',
      width: 90,
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
    const result = await Http.post('/query/asset/inventory/in/export', params, {
      responseType: 'blob',
    })

    downloadFile(result, '预付账款', 'xlsx')
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
    const { code, data } = await Http.post('/query/asset/inventory/in/list', params)
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

  useEffect(() => {
    if (currentCompany) {
      const item = {
        disabledDate: currentCompany.beginyearmonth,
        selectData: [currentCompany.beginyearmonth, dayjs().format('YYYY-MM')],
      }
      setSelectInfo(item)
      onSearch(item)
    }
  }, [currentCompany])

  return (
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
          scroll={{ x: true, y: pageHeight - 180 }}
          rowClassName={(record) => (record.pid === 0 && record.sort === 2 ? 'table-summary' : '')}
        />
      </Layout.Content>
    </Layout>
  )
}
export default StockIn
