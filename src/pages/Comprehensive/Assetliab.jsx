import { useState } from 'react'

import { Button, DatePicker, Form, Input, Layout, Message, Table } from '@arco-design/web-react'
import { useSelector } from 'react-redux'

// 公共方法
import { downloadFile, formatNumber } from 'src/utils/common'

// 组件
import dayjs from 'dayjs'
import VoucherInfo from 'src/components/VoucherInfo'

const Assetliab = () => {
  const [searchForm] = Form.useForm()
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)

  const [voucherVisible, setVoucherVisible] = useState(false)
  const [voucherKey, setVoucherKey] = useState()

  const [tableLoading, setTableLoading] = useState(false)
  const [tableList, setTableList] = useState([])

  // 表头
  const columns = [
    {
      title: '来往明细',
      children: [
        {
          title: '银行名称',
          dataIndex: 'bankname',
          width: 150,
        },
        {
          title: '交易日',
          dataIndex: 'bdate',
          align: 'center',
          width: 120,
          render: (text) => <>{text && dayjs(text).format('YYYY-MM-DD')}</>,
        },
        {
          title: '借方金额',
          dataIndex: 'borrow',
          align: 'center',
          width: 130,
          render: (text) => <div className='text-right'>{formatNumber(text)}</div>,
        },
        {
          title: '贷方金额',
          dataIndex: 'loan',
          align: 'center',
          width: 130,
          render: (text) => <div className='text-right'>{formatNumber(text)}</div>,
        },
        {
          title: '借方余额',
          dataIndex: 'balance',
          align: 'center',
          width: 130,
          render: (text) => <div className='text-right'>{formatNumber(text)}</div>,
        },
      ],
    },
    {
      title: '名称',
      dataIndex: 'itemname',
      render: (text) => (
        <div className='flex items-center gap-1.5'>
          <div className='size-2 bg-gray-500'></div>
          {text}
        </div>
      ),
    },
    {
      title: '凭证编号',
      dataIndex: 'vno',
      width: 140,
    },
    {
      title: '凭证摘要',
      dataIndex: 'summary',
    },
    {
      title: '借贷方向',
      dataIndex: 'direct',
      width: 90,
      align: 'center',
    },
    {
      title: '科目名称',
      dataIndex: 'account_name',
      width: 100,
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
      const result = await Http.post('/query/assetliab/export', params, {
        responseType: 'blob',
      })

      downloadFile(result, '流动资产与债务', 'xlsx')
    })
  }

  // 查询
  const onSearch = () => {
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
      setTableList([])
      setTableLoading(true)
      const { code, data } = await Http.post('/query/assetliab/list', params)
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
            <Form.Item label='查询区间' field='date_range'>
              <DatePicker.RangePicker style={{ width: 250 }} />
            </Form.Item>
            <Form.Item label='综合查询' field='search_key'>
              <Input allowClear placeholder='请输入' onClear={() => setTableList([])} />
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
            scroll={{ x: 1300, y: pageHeight - 136 }}
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
export default Assetliab
