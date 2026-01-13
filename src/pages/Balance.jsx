import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { Button, Checkbox, DatePicker, Drawer, Input, Layout, Menu, Modal, Table } from '@arco-design/web-react'
import { IconCalendar, IconExport } from '@arco-design/web-react/icon'
import { useSelector } from 'react-redux'

import { downloadFile, formatNumber } from 'src/utils/common'

import status from 'src/assets/images/status.png'

// 组件
import VoucherInfo from 'src/components/VoucherInfo'

const Balance = () => {
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)
  const { menuSelect } = useSelector((state) => state.homeReducer)
  const [rangeValue, setRangeValue] = useState({})
  const [monthList, setMonthList] = useState([])

  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [iscurrent, setIscurrent] = useState(true)

  const [visibleDrawer, setVisibleDrawer] = useState(false)
  const [drawerData, setDrawerData] = useState([])

  const [voucherVisible, setVoucherVisible] = useState(false)
  const [voucherKey, setVoucherKey] = useState()

  // 输入框回车
  const onPressEnter = async (e) => {
    const value = e?.target.value || null

    setTableLoading(true)
    const params = {
      iscurrent: iscurrent,
      acccode: value,
      catid: menuSelect.catid,
      groupid: currentCompany?.id,
      year: Number(rangeValue.year),
      month: Number(rangeValue.month),
    }
    const { code, data } = await Http.post('/balance/list', params)
    if (code === 200) {
      setTableData(data?.list || [])
    }
    setTableLoading(false)
  }

  //  本期发生额-复选框
  const onChangeCheckbox = async (e) => {
    setIscurrent(e)

    setTableLoading(true)
    const params = {
      iscurrent: e,
      acccode: null,
      catid: menuSelect.catid,
      groupid: currentCompany?.id,
      year: Number(rangeValue.year),
      month: Number(rangeValue.month),
    }
    const { code, data } = await Http.post('/balance/list', params)
    if (code === 200) {
      setTableData(data?.list || [])
    }
    setTableLoading(false)
  }

  // 导出
  const onExport = (record) => {
    Modal.confirm({
      title: '提示',
      content: '确定导出 ' + record.name + ' 余额明细？',
      className: 'simpleModal',
      onOk: async () => {
        const params = {
          catid: menuSelect.catid,
          groupid: currentCompany?.id,
          year: Number(rangeValue.year),
          month: Number(rangeValue.month),
          acccode: record.code,
        }
        const result = await Http.post('/balance/detail/export', params, {
          responseType: 'blob',
        })

        const fileName =
          record.name + '(' + currentCompany.shortname + rangeValue.year + '年' + rangeValue.month + '月' + ')' + '余额明细'
        downloadFile(result, fileName, 'xlsx')
      },
    })
  }

  // 表头
  const columns = [
    {
      title: '科目代码',
      children: [
        {
          title: (
            <Input
              size='mini'
              allowClear
              placeholder='科目代码查询'
              onPressEnter={(e) => onPressEnter(e)}
              onClear={() => onPressEnter()}
            />
          ),
          dataIndex: 'code',
          className: 'search-input',
          width: 150,
        },
      ],
    },
    {
      title: '科目名称',
      dataIndex: 'name',
      width: 150,
      ellipsis: true,
      render: (text, record) => (
        <div className='group flex items-center justify-between gap-1 text-left'>
          {text}
          <span className='translate-x-2 cursor-pointer text-base text-blue-500 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100'>
            <IconExport onClick={() => onExport(record)} />
          </span>
        </div>
      ),
    },
    {
      title: '年初余额',
      children: [
        {
          title: '借方',
          dataIndex: 'nc_borrow',
          align: 'center',
          ellipsis: true,
          render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
        },
        {
          title: '贷方',
          dataIndex: 'nc_loan',
          align: 'center',
          ellipsis: true,
          render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
        },
      ],
    },
    {
      title: '期初余额',
      width: 190,
      children: [
        {
          title: '借方',
          dataIndex: 'qc_borrow',
          align: 'center',
          ellipsis: true,
          render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
        },
        {
          title: '贷方',
          dataIndex: 'qc_loan',
          align: 'center',
          ellipsis: true,
          render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
        },
      ],
    },
    {
      title: (
        <div className='flex justify-around'>
          <div>本期发生额</div>
          <Checkbox checked={iscurrent} onChange={(e) => onChangeCheckbox(e)} />
        </div>
      ),
      width: 190,
      children: [
        {
          title: '借方',
          dataIndex: 'bq_borrow',
          align: 'center',
          ellipsis: true,
          render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
        },
        {
          title: '贷方',
          dataIndex: 'bq_loan',
          align: 'center',
          ellipsis: true,
          render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
        },
      ],
    },
    {
      title: '本年累计',
      width: 190,
      children: [
        {
          title: '借方',
          dataIndex: 'bn_borrow',
          align: 'center',
          ellipsis: true,
          render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
        },
        {
          title: '贷方',
          dataIndex: 'bn_loan',
          align: 'center',
          ellipsis: true,
          render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
        },
      ],
    },
    {
      title: '期末余额',
      width: 190,
      children: [
        {
          title: '借方',
          dataIndex: 'qm_borrow',
          align: 'center',
          ellipsis: true,
          render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
        },
        {
          title: '贷方',
          dataIndex: 'qm_loan',
          align: 'center',
          ellipsis: true,
          render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
        },
      ],
    },
  ]

  const columnsDrawer = [
    {
      title: '记账日期',
      dataIndex: 'pdate',
      width: 140,
      align: 'center',
      render: (text) => <>{text && dayjs(text).format('YYYY-MM-DD')}</>,
    },
    {
      title: '凭证类型号',
      dataIndex: 'vtype',
      width: 150,
      align: 'center',
    },
    {
      title: '摘要',
      dataIndex: 'summary',
    },
    {
      title: '核算项目',
      dataIndex: 'itemname',
    },
    {
      title: '借方',
      dataIndex: 'borrow',
      width: 130,
      align: 'center',
      ellipsis: true,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '贷方',
      dataIndex: 'loan',
      width: 160,
      align: 'center',
      ellipsis: true,
      render: (text) => !!text && <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '余额',
      dataIndex: 'balance',
      width: 180,
      align: 'center',
      className: 'balance-two',
      render: (_, record) => (
        <div className='flex justify-between'>
          <div className='balance-two-line'>{record.direct}</div>
          <div>{formatNumber(record.balance)}</div>
        </div>
      ),
    },
  ]

  // 抽屉行点击
  const onRowDrawerClick = (record) => {
    if (record.sort === 1) {
      setVoucherKey(record.pid)
      setVoucherVisible(true)
    }
  }
  // 行点击
  const onRowClick = async (record) => {
    setVisibleDrawer(true)
    const params = {
      catid: menuSelect.catid,
      groupid: currentCompany?.id,
      year: Number(rangeValue.year),
      month: Number(rangeValue.month),
      acccode: record.code,
    }
    const { code, data } = await Http.post('/balance/detail/list', params)
    if (code === 200) {
      const list = (data?.list || []).map((e, i) => ({ ...e, index_id: i }))
      setDrawerData(list)
    }
  }

  // 月份切换
  const onSelectMonth = async (value, year) => {
    setTableLoading(true)
    setRangeValue((prev) => ({ ...prev, month: value }))
    const params = {
      iscurrent: iscurrent,
      acccode: null,
      catid: menuSelect.catid,
      groupid: currentCompany?.id,
      year: Number(year),
      month: Number(value),
    }
    const { code, data } = await Http.post('/balance/list', params)
    if (code === 200) {
      setTableData(data?.list || [])
    }
    setTableLoading(false)
  }

  // 年份切换
  const onChangeYear = async (value) => {
    setRangeValue((prev) => ({ ...prev, year: value }))

    const params = {
      catid: menuSelect.catid,
      groupid: currentCompany?.id,
      year: Number(value),
    }
    const { code, data } = await Http.post('/proof/month/list', params)
    if (code === 200) {
      const list = data?.list || []
      setMonthList(list)
      // 默认选择第一个月份
      onSelectMonth(list[0].month, Number(value))
    }
  }

  // 默认执行
  useEffect(() => {
    if (currentCompany) {
      onChangeYear(dayjs().format('YYYY'))
    }
  }, [currentCompany])

  return (
    <>
      <Layout className='h-full w-full'>
        <Layout.Sider width={114} className='h-full border-r border-neutral-200'>
          <DatePicker.YearPicker
            onChange={onChangeYear}
            disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(currentCompany.beginyearmonth))}
            value={String(rangeValue?.year)}
            triggerElement={
              <Button long>
                <IconCalendar />
                &nbsp;{rangeValue?.year || '请选择'}
              </Button>
            }
          />
          <Menu
            className='h-[calc(100%-105px)]'
            selectedKeys={[rangeValue?.month]}
            onClickMenuItem={(e) => onSelectMonth(e, rangeValue?.year)}>
            {monthList?.map((item) => (
              <Menu.Item key={item.month} className='flex items-center gap-1.5 leading-9!'>
                {item.month}月份
                {item.hasdata ? <img src={status} alt='' /> : null}
              </Menu.Item>
            ))}
          </Menu>
        </Layout.Sider>
        <Layout.Content className='h-full overflow-hidden'>
          <Table
            rowKey='code'
            size='small'
            border={{ wrapper: true, cell: true }}
            loading={tableLoading}
            data={tableData}
            columns={columns}
            pagination={false}
            scroll={{ y: pageHeight - 68 }}
            rowClassName={(record) => (record.leftmargin === 4 ? 'table-summary-sum' : '')}
            onRow={(record, index) => {
              return {
                onDoubleClick: () => onRowClick(record, index),
              }
            }}
          />
        </Layout.Content>
      </Layout>

      <Drawer
        width='80%'
        title={null}
        footer={null}
        visible={visibleDrawer}
        onCancel={() => {
          setVisibleDrawer(false)
        }}>
        <Table
          className='z-10'
          rowKey={'index_id'}
          size='small'
          border={{ wrapper: true, cell: true }}
          data={drawerData}
          columns={columnsDrawer}
          pagination={false}
          onRow={(record, index) => {
            return {
              onDoubleClick: () => onRowDrawerClick(record, index),
            }
          }}
        />
      </Drawer>

      <VoucherInfo visible={voucherVisible} voucherKey={voucherKey} onCancel={() => setVoucherVisible(false)} />
    </>
  )
}
export default Balance
