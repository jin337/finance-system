import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  Button,
  DatePicker,
  Dropdown,
  Input,
  Layout,
  Menu,
  Message,
  Modal,
  Radio,
  Select,
  Space,
  Table,
} from '@arco-design/web-react'
import {
  IconCalendar,
  IconExport,
  IconFile,
  IconFilePdf,
  IconPrinter,
  IconRedo,
  IconSubscribeAdd,
} from '@arco-design/web-react/icon'
// 公共方法
import { downloadFile, formatNumber } from 'src/utils/common'

import status from 'src/assets/images/status.png'

const buttonlist = [
  { id: '', name: '全部', color: '#606266' },
  { id: '-1', name: '暂存', color: '#df4126' },
  { id: '0', name: '待提交', color: '#D78400' },
  { id: '3', name: '待审核', color: '#606266' },
  { id: '1', name: '已审核', color: '#3F9D06' },
  { id: '2', name: '未通过', color: '#d9330d' },
  { id: '5', name: '作废', color: '#ddd' },
  { id: '999', name: '无附件', color: '#606266' },
  { id: '888', name: '关联交易', color: '#606266' },
]
const searchoptions = [
  { value: '0', label: '凭证号' },
  { value: '1', label: '摘要' },
  { value: '2', label: '金额' },
  { value: '3', label: '审批单据号' },
]
const exportMenu = [
  {
    id: 1,
    name: '余额表-实时数据',
    url: '/export/temp/balance',
  },
  {
    id: 2,
    name: '余额表-结转数据',
    url: '/export/balance',
    filter: {
      isFinish: true,
    },
  },
  {
    id: 3,
    name: '财务报表',
    url: '/report/export',
    filter: {
      isFinish: true,
    },
  },
  {
    id: 4,
    name: '财务季度报表',
    url: '/report/quarter/export',
    filter: {
      isFinish: true,
      isQuarter: true,
    },
  },
  {
    id: 5,
    name: '财务报表-纳税报送',
    url: '/report/tax/export',
    filter: {
      isFinish: true,
      isQuarter: true,
    },
  },
  {
    id: 6,
    name: '合并快报底稿',
    url: '/report/marge_export',
    filter: {
      isFinish: false,
      isAdmin: true,
    },
  },
  {
    id: 7,
    name: '合并报表底稿',
    url: '/report/marge_export',
    filter: {
      isFinish: true,
      isAdmin: true,
    },
  },
  {
    id: 8,
    name: '现金流量报表',
    url: '/report/cash/export',
  },
  {
    id: 9,
    name: '凭证时序簿',
    url: '/proof/export',
  },
  {
    id: 10,
    name: '费用清单',
    url: '/proof/cost/export',
  },
  {
    id: 11,
    name: '应付票据清单',
    url: '/billpay/export',
  },
  {
    id: 12,
    name: '月报',
    url: '/proof/month/report',
    filter: {
      isFinish: true,
    },
  },
]
const Voucher = () => {
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)
  const { menuSelect } = useSelector((state) => state.homeReducer)
  const [monthList, setMonthList] = useState([])

  const [tableData, setTableData] = useState({ list: [], page: 1, pageSize: 10, total: 0 })
  const [selectList, setSelectList] = useState([])
  const [tableLoading, setTableLoading] = useState(false)
  const [tableTyle, setTableTyle] = useState({})
  const [searchData, setSearchData] = useState({
    type: '0',
    status: '',
  })

  // 生成结转凭证&&撤销结转&&月度结转
  const onCheckout = async (type) => {
    const list = [
      {
        id: 0,
        url: '/proof/undocheckout',
        name: '撤销结转',
      },
      {
        id: 1,
        url: '/proof/build/checkproof',
        name: '生成结转凭证',
      },
      {
        id: 2,
        url: '/proof/checkout',
        name: '月度结转',
      },
    ]
    const item = list.find((item) => item.id === type)
    if (!item) return

    const params = {
      groupid: currentCompany.id,
      catid: menuSelect.catid,
      year: Number(searchData.year),
      month: Number(searchData.month),
    }
    const { code, message } = await Http.post(item.url, params)
    if (code === 200) {
      changeTableData(tableData.page, tableData.pageSize, searchData)
      Message.success(`${item.name}成功`)
    } else {
      Message.error(message || `${item.name}出错了`)
    }
  }
  // 单个打印
  const openPdf = async (record) => {
    const result = await Http.post(
      `/proof/print/${record.id}`,
      {},
      {
        responseType: 'arraybuffer',
      }
    )
    const binaryData = []
    binaryData.push(result)
    const pdfUrl = window.URL.createObjectURL(new Blob(binaryData, { type: 'application/pdf' }))
    window.open(pdfUrl)
  }
  // 多个打印
  const openPdfs = async () => {
    const params = {
      proofid: selectList,
      groupid: currentCompany.id,
    }
    const result = await Http.post('/proof/prints', params, {
      responseType: 'arraybuffer',
    })
    const binaryData = []
    binaryData.push(result)
    const pdfUrl = window.URL.createObjectURL(new Blob(binaryData, { type: 'application/pdf' }))
    window.open(pdfUrl)
  }

  // 表头
  const columns = [
    {
      title: '凭证号',
      dataIndex: 'vno',
      width: 170,
      sorter: true,
      filters: [
        {
          text: '全部',
          value: '0',
        },
        {
          text: '凭证已生成',
          value: '1',
        },
        {
          text: '凭证未生成',
          value: '2',
        },
      ],
      filterMultiple: false,
      render: (text, record) => (
        <div className='flex items-center gap-1'>
          {record.isbuild === 1 && <IconFilePdf style={{ color: '#ff4400', fontSize: '16px' }} />}
          {record.isbuild === 0 && <IconFile style={{ color: '#165dff', fontSize: '16px' }} />}
          {text}
          {record.status === 1 && (
            <IconPrinter
              onClick={() => openPdf(record)}
              className='cursor-pointer'
              style={{ color: '#165dff', fontSize: '16px' }}
            />
          )}
        </div>
      ),
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      ellipsis: true,
      width: 250,
    },
    {
      title: '记账日期',
      dataIndex: 'pdate',
      width: 110,
    },
    {
      title: '合计',
      dataIndex: 'total',
      align: 'right',
      width: 130,
      render: (text) => formatNumber(text),
    },
    {
      title: '现金流量',
      dataIndex: 'cashed',
      align: 'center',
      width: 100,
      filters: [
        {
          text: '全部',
          value: '0',
        },
        {
          text: '已指定',
          value: '1',
        },
        {
          text: '待指定',
          value: '2',
        },
      ],
      filterMultiple: false,
      render: (_, record) => {
        if (!record.iscash) return ''
        return record.cashed === 0 ? <div className='text-red-600'>待指定</div> : <div className='text-green-600'>已指定</div>
      },
    },
    {
      title: '制单人',
      dataIndex: 'markername',
      align: 'center',
      width: 80,
    },
    {
      title: '审单人',
      dataIndex: 'checkername',
      align: 'center',
      width: 80,
    },
    {
      title: '附件补充',
      dataIndex: 'attachs',
      align: 'center',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 80,
      render: (text) => {
        const item = buttonlist.find((e) => e.id === String(text))
        return item ? <div style={{ color: item.color }}>{item.name}</div> : ''
      },
    },
    {
      title: '操作',
      dataIndex: 'name',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button type='test'>提交</Button>
          <Button type='test'>查看</Button>
          {/* <Button type='test'>编辑</Button>
          <Button type='test'>审核</Button>
          <Button type='test'>生成</Button>
          <Button type='test'>删除</Button>
          <Button type='test'>作废</Button>
          <Button type='test'>撤销</Button>
          <Button type='test'>日志</Button> */}
        </Space>
      ),
    },
  ]

  // 获取页面数据
  const changeTableData = async (page, pageSize, values) => {
    setTableData({ list: [], page: 1, pageSize: 10, total: 0 })
    setTableLoading(true)
    setSelectList([])

    setSearchData(values)

    const params = {
      groupid: currentCompany.id,
      catid: menuSelect.catid,
      year: Number(values.year),
      month: Number(values.month),
      searchtype: values.type,
      searchvalue: values.value,
      status: values.status,
      sort: values.sort,
      isbuild: values.isBuild,
      cashtype: values.isCashType,
      page_no: page,
      page_size: pageSize,
    }
    const { code, data } = await Http.post('/proof/list', params)
    if (code === 200) {
      setTableData({
        pageSize: 10,
        list: data.list,
        page: data.page,
        total: data.total,
      })
      setTableTyle({ ...data.check, finish: data.finish })
    }
    setTableLoading(false)
  }

  // 监控表格变化
  const changeTable = (pagination, sorter, filters, { action }) => {
    const values = {
      ...searchData,
    }
    // 排序
    if (action === 'sort') {
      const sort = {
        ascend: 'seqno asc',
        descend: 'seqno desc',
      }
      values.sort = sort[sorter.direction] || 'seqno asc'

      onChangeSearch(values)
    }
    // 过滤
    if (action === 'filter') {
      values.isBuild = filters['vno'] || null
      values.isCashType = filters['cashed'] || null

      onChangeSearch(values)
    }
    // 翻页
    if (action === 'paginate') {
      changeTableData(pagination.current, pagination.pageSize, values)
    }
  }
  // 导出
  const onExport = async (item, params) => {
    const result = await Http.post(item.url, params, { responseType: 'blob' })
    downloadFile(result, item.name, 'xlsx')
  }
  // 导出处理
  const onExportList = async (key) => {
    const item = exportMenu.find((e) => String(e.id) === key)
    if (!item) return

    let params = {
      groupid: currentCompany.id,
      catid: menuSelect.catid,
      year: Number(searchData.year),
      month: Number(searchData.month),
    }

    if (item.id === 6) {
      params.isflash = 1
    }

    if (item.id === 9 || item.id === 10) {
      const onChangeMonth = (e) => {
        params.month = e === 1 ? Number(searchData.month) : 0
      }

      Modal.confirm({
        className: 'hideModalTitle',
        simple: true,
        content: (
          <Radio.Group defaultValue='1' onChange={onChangeMonth}>
            <Radio value='1'>本月({searchData.year + '-' + searchData.month}月)</Radio>
            <Radio value='2'>本年({searchData.year}年)</Radio>
          </Radio.Group>
        ),
        onOk: () => {
          onExport(item, params)
        },
      })
    } else {
      onExport(item, params)
    }
  }
  // 改变数据
  const onChangeSearch = (items) => {
    const values = {
      ...searchData,
      ...items,
    }
    setSearchData(values)
    changeTableData(tableData.page, tableData.pageSize, values)
  }

  // 年份切换
  const onChangeYear = async (value) => {
    setSearchData((prev) => ({ ...prev, year: value }))

    const params = {
      catid: menuSelect.catid,
      groupid: currentCompany?.id,
      year: Number(value),
    }
    const { code, data } = await Http.post('/proof/month/list', params)
    if (code === 200) {
      setMonthList(data?.list || [])
      // 默认选择第一个月份
      onChangeSearch({ year: Number(value), month: String(dayjs().month() + 1) })
    }
  }

  // 默认执行
  useEffect(() => {
    if (currentCompany) {
      onChangeYear(dayjs().format('YYYY'))
    }
  }, [currentCompany])

  return (
    <Layout className='h-full w-full'>
      <Layout.Sider width={114} className='h-full border-r border-neutral-200'>
        <DatePicker.YearPicker
          value={String(searchData?.year)}
          onChange={onChangeYear}
          disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(currentCompany.beginyearmonth))}
          triggerElement={
            <Button long>
              <IconCalendar />
              &nbsp;{searchData?.year || '请选择'}
            </Button>
          }
        />
        <Menu
          className='h-[calc(100%-105px)]'
          selectedKeys={[searchData?.month]}
          onClickMenuItem={(e) => onChangeSearch({ year: searchData?.year, month: e })}>
          {monthList?.map((item) => (
            <Menu.Item key={item.month} className='flex items-center gap-1.5 leading-9!'>
              {item.month}月份
              {item.hasdata ? <img src={status} alt='' /> : null}
            </Menu.Item>
          ))}
        </Menu>
      </Layout.Sider>
      <Layout className='h-full overflow-hidden'>
        <Layout.Header className='border-b border-neutral-200 px-5 py-4'>
          <Space size='large'>
            {buttonlist.map((item) => (
              <Button
                shape='round'
                key={item.id || '000'}
                type={searchData.status === item.id ? 'primary' : 'secondary'}
                onClick={() => onChangeSearch({ status: item.id })}>
                {item.name}
              </Button>
            ))}
          </Space>
        </Layout.Header>
        <Layout.Header className='flex items-center justify-between border-b border-neutral-200 px-5 py-4'>
          <Space size='large'>
            {!tableTyle.finish && (
              <>
                {tableTyle.ischeckout === 0 && (
                  <>
                    <Button shape='round' type='primary' icon={<IconSubscribeAdd />}>
                      新建凭证
                    </Button>
                    <Button shape='round' type='primary' icon={<IconSubscribeAdd />} onClick={() => onCheckout(1)}>
                      生成转接凭证
                    </Button>
                  </>
                )}
                {tableTyle.status === 1 && tableTyle.ischeckout === 1 && (
                  <Button shape='round' type='primary' icon={<IconSubscribeAdd />} onClick={() => onCheckout(2)}>
                    月度结转
                  </Button>
                )}
              </>
            )}

            {tableTyle.finish && tableTyle.ischeckout === 1 && tableTyle.status === 1 && (
              <Button shape='round' type='primary' icon={<IconRedo />} onClick={() => onCheckout(0)}>
                撤销结转
              </Button>
            )}

            <Input.Group compact className='w-100!'>
              <Select
                options={searchoptions}
                defaultValue={searchData?.type}
                placeholder='请选择'
                style={{ width: '30%' }}
                onChange={(e) => setSearchData((prev) => ({ ...prev, type: e }))}
              />
              <Input.Search
                searchButton
                allowClear
                style={{ width: '70%' }}
                placeholder='查询'
                onSearch={(e) => onChangeSearch({ value: e })}
                onClear={() => onChangeSearch({ value: null })}
              />
            </Input.Group>

            {selectList.length > 0 && (
              <Button shape='round' type='primary' status='success' icon={<IconPrinter />} onClick={openPdfs}>
                打印凭证({selectList.length}/{tableData.pageSize})
              </Button>
            )}
          </Space>
          <Dropdown
            trigger='click'
            position='br'
            droplist={
              <Menu onClickMenuItem={onExportList} className='max-h-full!'>
                {exportMenu.map((item) => {
                  if (!item.filter) {
                    return <Menu.Item key={item.id}>{item.name}</Menu.Item>
                  }

                  const { isFinish, isAdmin, isQuarter } = item.filter
                  const needQuarter = [3, 6, 9, 12].includes(Number(searchData?.month))
                  const needAdmin = currentCompany?.id === 1

                  // 检查是否满足显示条件
                  const shouldShow =
                    (isFinish === undefined || isFinish === tableTyle.finish) &&
                    (isAdmin === undefined || isAdmin === needAdmin) &&
                    (isQuarter === undefined || isQuarter === needQuarter)

                  return shouldShow ? <Menu.Item key={item.id}>{item.name}</Menu.Item> : null
                })}
              </Menu>
            }>
            <Button shape='round' icon={<IconExport />}>
              导出
            </Button>
          </Dropdown>
        </Layout.Header>
        <Layout.Content className='h-full overflow-auto'>
          <Table
            size='small'
            rowKey='id'
            columns={columns}
            data={tableData.list}
            loading={tableLoading}
            pagination={{ shshowTotal: true, pageSize: tableData.pageSize, current: tableData.page, total: tableData.total }}
            onChange={changeTable}
            scroll={{ x: true, y: pageHeight - 184 }}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectList,
              onChange: (selectedRowKeys) => setSelectList(selectedRowKeys),
            }}
          />
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
export default Voucher
