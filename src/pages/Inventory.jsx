import { useEffect, useState } from 'react'

import { Button, Drawer, Form, Input, Layout, Menu, ResizeBox, Select, Table, Tabs } from '@arco-design/web-react'
import { useSelector } from 'react-redux'

// 公共方法
import { downloadFile, formatNumber } from 'src/utils/common'

// 组件
import dayjs from 'dayjs'
import VoucherInfo from 'src/components/VoucherInfo'

const Inventory = () => {
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)
  const [supplierList, setSupplierList] = useState([])
  const [supplierKeys, setSupplierKeys] = useState()
  const [projectKey, setProjectKey] = useState()
  const [tableLoading, setTableLoading] = useState(false)

  const [balanceList, setBalanceList] = useState([])
  const [stockList, setStockList] = useState({})

  const [voucherVisible, setVoucherVisible] = useState(false)
  const [voucherParams, setVoucherParams] = useState()

  // 表头-库存余额概况
  const columns = [
    {
      title: '科目代码',
      dataIndex: 'code',
      align: 'center',
    },
    {
      title: '科目名称',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '期初余额',
      children: [
        {
          title: '借方',
          dataIndex: 'qc_borrow',
          align: 'center',
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
        {
          title: '贷方',
          dataIndex: 'qc_loan',
          align: 'center',
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
      ],
    },
    {
      title: '累计发生额',
      children: [
        {
          title: '借方',
          dataIndex: 'bq_borrow',
          align: 'center',
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
        {
          title: '贷方',
          dataIndex: 'bq_loan',
          align: 'center',
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
      ],
    },
    {
      title: '期末余额',
      children: [
        {
          title: '借方',
          dataIndex: 'qm_borrow',
          align: 'center',
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
        {
          title: '贷方',
          dataIndex: 'qm_loan',
          align: 'center',
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
      ],
    },
  ]

  // 表头-左
  const columnsLeft = [
    {
      title: '记账日期',
      dataIndex: 'bdate',
      align: 'center',
      width: 120,
      render: (text) => <>{text && dayjs(text).format('YYYY-MM-DD')}</>,
    },
    {
      title: '凭证号',
      dataIndex: 'vno',
      align: 'center',
      width: 140,
    },
    {
      title: '暂估入库',
      children: [
        {
          title: '入库金额',
          dataIndex: 'in_money',
          align: 'center',
          width: 130,
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
        {
          title: '回冲金额',
          dataIndex: 'in_ch_money',
          align: 'center',
          width: 130,
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
      ],
    },
    {
      title: '暂估出库',
      children: [
        {
          title: '出库金额',
          dataIndex: 'out_money',
          align: 'center',
          width: 130,
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
        {
          title: '回冲金额',
          dataIndex: 'out_ch_money',
          align: 'center',
          width: 130,
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
      ],
    },
    {
      title: '库存余额',
      dataIndex: 'balance',
      align: 'center',
      width: 130,
      render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
    },
  ]
  // 表头-右
  const columnsRight = [
    {
      title: '记账日期',
      dataIndex: 'bdate',
      align: 'center',
      width: 120,
      render: (text) => <>{text && dayjs(text).format('YYYY-MM-DD')}</>,
    },
    {
      title: '凭证号',
      dataIndex: 'vno',
      align: 'center',
      width: 140,
    },
    {
      title: '发票入库',
      children: [
        {
          title: '发票日期',
          dataIndex: 'fpdate',
          width: 120,
          render: (text) => <>{text && dayjs(text).format('YYYY-MM-DD')}</>,
        },
        {
          title: '发票号码',
          dataIndex: 'fpno',
          width: 200,
        },
        {
          title: '入库金额',
          dataIndex: 'in_money',
          align: 'center',
          width: 130,
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
      ],
    },
    {
      title: '发票出库',
      children: [
        {
          title: '回冲金额',
          dataIndex: 'in_ch_money',
          align: 'center',
          width: 130,
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
        {
          title: '出库金额',
          dataIndex: 'out_money',
          align: 'center',
          width: 130,
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
        {
          title: '回冲金额',
          dataIndex: 'out_ch_money',
          align: 'center',
          width: 130,
          render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
        },
      ],
    },
    {
      title: '库存余额',
      dataIndex: 'balance',
      align: 'center',
      width: 130,
      render: (text) => !!text && <div className={`text-right ${text < 0 ? 'text-red-500' : ''}`}>{formatNumber(text)}</div>,
    },
  ]

  // 选择供应商
  const onSelectItem = async (key, arr) => {
    setTableLoading(true)
    const item = arr?.find((item) => item.supplier_code === key)
    item.projectList = item?.projects?.map((item) => ({
      ...item,
      value: item.project_code,
      label: item.project_name,
    }))
    setSupplierKeys(item)

    if (key === '000000') {
      const { code, data } = await Http.post('/query/stock/balance/list', { groupid: currentCompany?.id })
      if (code === 200) {
        setBalanceList(data?.list || [])
      }
    } else {
      changeProject(item.projectList?.[0]?.value, key)
    }
    setTableLoading(false)
  }

  // 导出
  const onExport = async (key, id) => {
    const params = {
      groupid: currentCompany?.id,
      project_code: key,
      supplier_code: id,
    }
    const result = await Http.post('/query/stock/export2', params, {
      responseType: 'blob',
    })

    downloadFile(result, supplierKeys.supplier_name, 'xlsx')
  }
  // 选择项目
  const changeProject = async (key, id) => {
    setProjectKey(key)

    const params = {
      groupid: currentCompany?.id,
      project_code: key,
      supplier_code: id,
    }
    const { code, data } = await Http.post('/query/stock/list', params)
    if (code === 200) {
      setStockList(data)
    }
  }

  // 搜索供应商
  const onSearch = async (value) => {
    const params = { groupid: currentCompany?.id }
    if (value) {
      params.search_key = value
    }
    const { code, data } = await Http.post('/query/stock/supplier/list', params)
    if (code === 200) {
      const list = data?.list || []
      if (list.length > 0) {
        const arr = [{ supplier_name: '库存余额概况', supplier_code: '000000' }, ...list]
        setSupplierList(arr)
        onSelectItem(arr?.[1]?.supplier_code, arr)
      }
    }
  }

  useEffect(() => {
    if (currentCompany) {
      onSearch()
    }
  }, [currentCompany])

  // 行点击
  const onRowClick = (record) => {
    if (record.sort === 1) {
      const time = record?.vno?.split('-')
      setVoucherParams({
        id: record.pid,
        type: 2,
        isdrawer: 1,
        year: Number(time[1]),
        month: Number(time[2]),
      })
      setVoucherVisible(true)
    }
  }

  return (
    <>
      <Layout className='h-full w-full overflow-hidden'>
        <Layout.Sider width={260} className='h-full border-r border-neutral-200'>
          <Tabs className='receivable-tabs h-full' justify defaultActiveTab='1'>
            <Tabs.TabPane key='1' title='供应商'>
              <Input.Search size='small' searchButton allowClear placeholder='请输入供应商…' onSearch={onSearch} />
              <Menu
                className='h-[calc(100%-28px)]'
                selectedKeys={[supplierKeys?.supplier_code]}
                onClickMenuItem={(e) => onSelectItem(e, supplierList)}>
                {supplierList?.map((item) => (
                  <Menu.Item key={item.supplier_code} className='leading-9!'>
                    {item.supplier_name}
                  </Menu.Item>
                ))}
              </Menu>
            </Tabs.TabPane>
          </Tabs>
        </Layout.Sider>
        <Layout.Content className='h-full overflow-hidden p-5'>
          {supplierKeys?.supplier_code === '000000' ? (
            <Table
              rowKey='code'
              columns={columns}
              data={balanceList}
              loading={tableLoading}
              border={{ wrapper: true, cell: true }}
              pagination={false}
            />
          ) : (
            <>
              <Form className='pb-3' autoComplete='off' layout='inline' size='small'>
                <Form.Item label=' 项目'>
                  <Select
                    className='w-62.5!'
                    options={supplierKeys?.projectList}
                    value={projectKey}
                    onChange={(e) => changeProject(e, supplierKeys?.supplier_code)}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type='primary' onClick={() => onExport(projectKey, supplierKeys?.supplier_code)}>
                    导出
                  </Button>
                </Form.Item>
              </Form>
              <ResizeBox.Split
                id='page-inventory'
                max={0.8}
                min={0.2}
                panes={[
                  <Table
                    rowKey='vno'
                    size='small'
                    className='h-full'
                    loading={tableLoading}
                    columns={columnsLeft}
                    data={stockList?.stock_zg}
                    border={{ wrapper: true, cell: true }}
                    pagination={false}
                    scroll={{ x: 637, y: pageHeight - 154 }}
                    onRow={(record, index) => {
                      return {
                        onDoubleClick: () => onRowClick(record, index),
                      }
                    }}
                  />,
                  <Table
                    className='h-full'
                    rowKey='vno'
                    size='small'
                    columns={columnsRight}
                    loading={tableLoading}
                    data={stockList?.stock_fp}
                    border={{ wrapper: true, cell: true }}
                    pagination={false}
                    scroll={{ x: 1100, y: pageHeight - 154 }}
                    onRow={(record, index) => {
                      return {
                        onDoubleClick: () => onRowClick(record, index),
                      }
                    }}
                  />,
                ]}
              />
            </>
          )}
        </Layout.Content>
      </Layout>

      <Drawer width='80%' title={null} footer={null} visible={voucherVisible} onCancel={() => setVoucherVisible(false)}>
        <VoucherInfo voucherParams={voucherParams} />
      </Drawer>
    </>
  )
}
export default Inventory
