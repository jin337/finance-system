import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { Button, DatePicker, Drawer, Layout, Menu, Table } from '@arco-design/web-react'
import { IconCalendar } from '@arco-design/web-react/icon'
import { useSelector } from 'react-redux'

import { formatNumber } from 'src/utils/common'

import status from 'src/assets/images/status.png'

const CashFlow = () => {
  const { menuSelect } = useSelector((state) => state.homeReducer)
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)
  const [rangeValue, setRangeValue] = useState({})
  const [monthList, setMonthList] = useState([])

  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState([])

  const [visibleDrawer, setVisibleDrawer] = useState(false)
  const [drawerData, setDrawerData] = useState([])

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      width: 70,
      align: 'center',
      render: (text, record, index) => index + 1,
    },
    {
      title: '名称',
      dataIndex: 'name',
      render: (text, record) => <div style={{ marginLeft: record.leftmargin * 10 + 'px' }}>{text}</div>,
    },
    {
      title: '行数',
      dataIndex: 'rownumber',
      width: 70,
      align: 'center',
    },
    {
      title: '本月数',
      dataIndex: 'byvalue',
      width: 200,
      align: 'center',
      render: (text) => <div className='text-right'>{formatNumber(text)}</div>,
    },
    {
      title: '本年数',
      dataIndex: 'bnvalue',
      width: 200,
      align: 'center',
      render: (text) => <div className='text-right'>{formatNumber(text)}</div>,
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
      dataIndex: 'vno',
      width: 140,
      align: 'center',
    },
    {
      title: '主表项目编码',
      dataIndex: 'cashcode',
    },
    {
      title: '主表项目名称',
      dataIndex: 'cashname',
    },
    {
      title: '流向',
      dataIndex: 'cashflowname',
      width: 130,
      align: 'center',
    },
    {
      title: '金额',
      dataIndex: 'money',
      width: 160,
      align: 'center',
      render: (text) => <div className='text-right'>{formatNumber(text)}</div>,
    },
  ]

  // 行点击
  const onRowClick = async (record) => {
    if (record.accounts) {
      setVisibleDrawer(true)
      const params = {
        groupid: currentCompany?.id,
        year: Number(rangeValue.year),
        month: Number(rangeValue.month),
        accounts: record.accounts,
      }
      const { code, data } = await Http.post('/cash/detail/list', params)
      if (code === 200) {
        setDrawerData(data?.list || [])
      }
    }
  }

  // 月份切换
  const onSelectMonth = async (value, year) => {
    setTableLoading(true)
    setRangeValue((prev) => ({ ...prev, month: value }))
    const params = {
      catid: menuSelect.catid,
      groupid: currentCompany?.id,
      year: Number(year),
      month: Number(value),
    }
    const { code, data } = await Http.post('/report/cash', params)
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
      setMonthList(data?.list || [])
      // 默认选择第一个月份
      onSelectMonth(String(dayjs().month() + 1), Number(value))
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
            rowKey='id'
            size='small'
            border={{ wrapper: true, cell: true }}
            loading={tableLoading}
            data={tableData}
            columns={columns}
            pagination={false}
            scroll={{ y: pageHeight - 34 }}
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
          rowKey='id'
          size='small'
          border={{ wrapper: true, cell: true }}
          data={drawerData}
          columns={columnsDrawer}
          pagination={false}
        />
      </Drawer>
    </>
  )
}
export default CashFlow
