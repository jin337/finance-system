import { useState } from 'react'

import { Button, DatePicker, Form, Input, InputTag, Layout, Message, Select, Table } from '@arco-design/web-react'
import { useSelector } from 'react-redux'

// 公共方法
import { downloadFile, formatNumber } from 'src/utils/common'

// 组件
import dayjs from 'dayjs'
import VoucherInfo from 'src/components/VoucherInfo'

const Expense = () => {
  const [searchForm] = Form.useForm()
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)

  const [voucherVisible, setVoucherVisible] = useState(false)
  const [voucherKey, setVoucherKey] = useState()

  const [tableLoading, setTableLoading] = useState(false)
  const [tableList, setTableList] = useState([])

  // 表头
  const columns = [
    {
      title: '经办人',
      dataIndex: 'receiver',
      align: 'center',
      width: 80,
    },
    {
      title: '业务日期',
      dataIndex: 'bdate',
      align: 'center',
      width: 120,
      render: (text) => <>{text && dayjs(text).format('YYYY-MM-DD')}</>,
    },
    {
      title: '凭证号',
      dataIndex: 'vno',
      align: 'center',
      width: 130,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
    },
    {
      title: '费用类型',
      dataIndex: 'fylx',
      width: 200,
    },
    {
      title: '费用类别',
      dataIndex: 'fytype',
      width: 120,
    },
    {
      title: '金额',
      dataIndex: 'money',
      align: 'center',
      width: 130,
      render: (text) => <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '余额',
      dataIndex: 'balance',
      align: 'center',
      width: 130,
      render: (text) => <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '审批单号',
      dataIndex: 'sericnum',
      width: 160,
    },
  ]

  // 行点击
  const onRowClick = (record) => {
    if (record.sort === 1) {
      setVoucherKey(record.pid)
      setVoucherVisible(true)
    }
  }

  // 导出
  const onExport = () => {
    searchForm.validate().then(async (values) => {
      if (values.search_key == null) {
        Message.error('请输入综合查询条件')
        return false
      }
      const params = {
        groupid: currentCompany.id,
        search_key: values.search_key,
      }
      if (values?.date_range) {
        params.begin_date = values.date_range[0]
        params.end_date = values.date_range[1]
      }
      const result = await Http.post('/query/expense/export', params, {
        responseType: 'blob',
      })

      downloadFile(result, '流动资产与债务', 'xlsx')
    })
  }

  // 查询
  const onSearch = () => {
    searchForm.validate().then(async (values) => {
      const searchKey = Array.isArray(values.search_key) ? values.search_key.join(' ') : ''
      const params = {
        groupid: currentCompany.id,
        search_key: searchKey,
        receiver: values.receiver,
        account_type: values.account_type,
      }
      if (values?.date_range) {
        params.begin_date = values.date_range[0]
        params.end_date = values.date_range[1]
      }
      setTableLoading(true)
      const { code, data } = await Http.post('/query/expense/list', params)
      if (code === 200) {
        const list = (data?.list || []).map((e, i) => ({ ...e, index_id: i }))
        setTableList(list)
      }
      setTableLoading(false)
    })
  }

  return (
    <>
      <Layout className='h-full overflow-hidden'>
        <Layout.Header className='px-5 pt-5 pb-3'>
          <Form autoComplete='off' layout='inline' size='small' form={searchForm}>
            <Form.Item label='区间' field='date_range'>
              <DatePicker.RangePicker
                style={{ width: 250 }}
                disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(currentCompany.beginyearmonth))}
              />
            </Form.Item>
            <Form.Item label='经办人' field='receiver'>
              <Input allowClear placeholder='请输入' style={{ width: 80 }} />
            </Form.Item>
            <Form.Item label='查询项' field='search_key'>
              <InputTag allowClear placeholder='请输入' maxTagCount='responsive' style={{ width: 150 }} />
            </Form.Item>
            <Form.Item label='费用类型' field='account_type'>
              <Select
                allowClear
                mode='multiple'
                options={['销售费用', '管理费用', '研发费用', '财务费用']}
                maxTagCount={1}
                placeholder='请选择'
                style={{ width: 170 }}
              />
            </Form.Item>
            <Form.Item>
              <Button type='primary' onClick={() => onSearch()}>
                查询
              </Button>
            </Form.Item>
            <Form.Item>
              <Button type='primary' onClick={() => onExport()} disabled={!tableList.length}>
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
            data={tableList}
            pagination={false}
            scroll={{ x: 1300, y: pageHeight - 104 }}
            onRow={(record, index) => {
              return {
                onDoubleClick: () => onRowClick(record, index),
              }
            }}
          />
        </Layout.Content>
      </Layout>

      <VoucherInfo visible={voucherVisible} voucherKey={voucherKey} onCancel={() => setVoucherVisible(false)} />
    </>
  )
}
export default Expense
