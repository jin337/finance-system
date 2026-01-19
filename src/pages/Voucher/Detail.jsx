import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router'

import {
  Button,
  Checkbox,
  DatePicker,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from '@arco-design/web-react'
import { IconClose, IconCopy, IconImport, IconLock, IconPaste, IconPlus, IconTag } from '@arco-design/web-react/icon'

// 组件
import CashInfo from 'src/components/CashInfo'
import FileInfo from 'src/components/FileInfo'

// 图片
import collection from 'src/assets/images/collection.png'
import handle from 'src/assets/images/handle.png'
import iscash from 'src/assets/images/iscash.png'
import pay from 'src/assets/images/pay.png'
import pay1 from 'src/assets/images/pay1.png'
import pay2 from 'src/assets/images/pay2.png'
import pay3 from 'src/assets/images/pay3.png'
import pay4 from 'src/assets/images/pay4.png'
import pay_collect from 'src/assets/images/pay_collect.png'
import rename from 'src/assets/images/rename.png'

// 数据状态
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
// 页面状态
const stateList = [
  { id: 1, name: '新建' },
  { id: 2, name: '查看' },
  { id: 3, name: '编辑' },
]
// 新建按钮
const buttonList = [
  {
    id: '3',
    name: '银行收款',
    icon: pay,
  },
  {
    id: '2',
    name: '付款',
    icon: iscash,
  },
  {
    id: '6',
    name: '开票收入',
    icon: collection,
  },
  {
    id: '9',
    name: '应收票据',
    icon: pay3,
  },
  {
    id: '8',
    name: '应付票据',
    icon: pay4,
  },
  {
    id: '4',
    name: '入库',
    icon: pay1,
  },
  {
    id: '1',
    name: '计提',
    icon: handle,
  },
  {
    id: '5',
    name: '出库',
    icon: pay2,
  },
  {
    id: '7',
    name: '收据收入',
    icon: pay_collect,
  },
  {
    id: '10',
    name: '财务调账',
    icon: rename,
  },
  {
    id: 'add',
    name: '手动录入',
    icon: rename,
  },
]

// 数字转换
const transNum = (num, index) => {
  if (!num || num === 0) return ''
  const paddedNum = Number(num).toFixed(2).replace('.', '').padStart(11, 'X')
  const targetChar = paddedNum[paddedNum.length - 1 - index]
  return targetChar === 'X' || targetChar === '-' ? '' : targetChar || ''
}
const VoucherDetail = () => {
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)

  const [pageForm] = Form.useForm()
  const [selectForm] = Form.useForm()
  const params = useParams()
  const location = useLocation()
  const { id } = params
  const { state } = location

  const [pageProof, setPageProof] = useState()
  const [pageBill, setPageBill] = useState()
  const [pageType, setPageType] = useState()

  const [tableData, setTableData] = useState([])
  const [selectRow, setSelectRow] = useState()

  const [visibleCash, setVisibleCash] = useState(false)
  const [visibleImg, setVisibleImg] = useState(false)

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      width: 75,
      align: 'center',
      render: (text, record, index) => index + 1,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      editable: true,
    },
    {
      title: '科目',
      dataIndex: 'cashcode',
      render: (text, record) => {
        return record?.acccode + record?.accfullname
      },
    },
    {
      title: '借方',
      dataIndex: 'borrow',
      align: 'center',
      children: [
        {
          title: '亿',
          dataIndex: 'borrow_10',
          align: 'center',
          className: 'row-money border-l! border-neutral-200!',
          width: 30,
          render: (_, record) => (
            <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 10)}</span>
          ),
        },
        {
          title: '千',
          dataIndex: 'borrow_9',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 9)}</span>,
        },
        {
          title: '百',
          dataIndex: 'borrow_8',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 8)}</span>,
        },
        {
          title: '十',
          dataIndex: 'borrow_7',
          align: 'center',
          className: 'row-money row-blue',
          width: 30,
          render: (_, record) => <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 7)}</span>,
        },
        {
          title: '万',
          dataIndex: 'borrow_6',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 6)}</span>,
        },
        {
          title: '千',
          dataIndex: 'borrow_5',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 5)}</span>,
        },
        {
          title: '百',
          dataIndex: 'borrow_4',
          align: 'center',
          className: 'row-money row-blue',
          width: 30,
          render: (_, record) => <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 4)}</span>,
        },
        {
          title: '十',
          dataIndex: 'borrow_3',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 3)}</span>,
        },
        {
          title: '元',
          dataIndex: 'borrow_2',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 2)}</span>,
        },
        {
          title: '角',
          dataIndex: 'borrow_1',
          align: 'center',
          className: 'row-money row-red',
          width: 30,
          render: (_, record) => <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 1)}</span>,
        },
        {
          title: '分',
          dataIndex: 'borrow_0',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 0)}</span>,
        },
      ],
    },
    {
      title: '贷方',
      dataIndex: 'loan',
      align: 'center',
      children: [
        {
          title: '亿',
          dataIndex: 'loan_10',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 10)}</span>,
        },
        {
          title: '千',
          dataIndex: 'loan_9',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 9)}</span>,
        },
        {
          title: '百',
          dataIndex: 'loan_8',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 8)}</span>,
        },
        {
          title: '十',
          dataIndex: 'loan_7',
          align: 'center',
          className: 'row-money row-blue',
          width: 30,
          render: (_, record) => <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 7)}</span>,
        },
        {
          title: '万',
          dataIndex: 'loan_6',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 6)}</span>,
        },
        {
          title: '千',
          dataIndex: 'loan_5',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 5)}</span>,
        },
        {
          title: '百',
          dataIndex: 'loan_4',
          align: 'center',
          className: 'row-money row-blue',
          width: 30,
          render: (_, record) => <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 4)}</span>,
        },
        {
          title: '十',
          dataIndex: 'loan_3',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 3)}</span>,
        },
        {
          title: '元',
          dataIndex: 'loan_2',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 2)}</span>,
        },
        {
          title: '角',
          dataIndex: 'loan_1',
          align: 'center',
          className: 'row-money row-red',
          width: 30,
          render: (_, record) => <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 1)}</span>,
        },
        {
          title: '分',
          dataIndex: 'loan_0',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 0)}</span>,
        },
      ],
    },
  ]

  // 页面数据
  const getPageInfo = async (id) => {
    const { code, data } = await Http.post(`/proof/info/${id}`)
    if (code === 200) {
      let { proof, bill, ...rest } = data || {}
      const { entrys, ...restProof } = proof

      const key = buttonlist.find((item) => String(item.id) == String(restProof.status)) || {}

      setPageBill(bill)
      setPageProof(() => ({
        ...restProof,
        status_name: key?.name,
        status_color: key?.color,
      }))

      const stateInfo = stateList.find((item) => String(item.id) === String(state.type))
      setPageType(() => ({
        ...rest,
        ...stateInfo,
      }))

      pageForm.setFieldsValue({ ...proof, range: `${restProof?.year}年${restProof?.month}期` })

      setTableData(entrys || [])
    }
  }

  useEffect(() => {
    setTableData([])
    setPageProof()
    setPageType()
    setPageBill()
    setSelectRow()

    if (id !== 'create') {
      getPageInfo(id)
    } else {
      const stateInfo = stateList.find((item) => String(item.id) === String(1))
      setPageType(stateInfo)
    }
  }, [id])

  return (
    <>
      <Layout>
        <Layout.Header className='flex items-center justify-between border-b border-neutral-200 px-5 py-3'>
          <Space size='medium'>
            <div className='space-x-1 text-base'>{pageType?.name}凭证</div>
            <div className='space-x-1 text-base'>{pageProof?.vno}</div>
            {pageType?.id !== 1 && <Tag color={pageProof?.status_color}>{pageProof?.status_name}</Tag>}
            {pageType?.is_cash_check && (
              <Button type='primary' size='mini' onClick={() => setVisibleCash(true)}>
                现金流量
              </Button>
            )}
          </Space>
          <Space>
            {pageType?.id !== 2 && (
              <>
                <Button type='primary' status='success' size='small'>
                  凭证暂存
                </Button>
                <Button type='primary' size='small'>
                  凭证保存
                </Button>
              </>
            )}

            {pageType?.id === 2 && (
              <>
                {[-1, 0, 2].includes(pageProof.status) && <Button size='small'>编辑</Button>}
                {pageProof.status === 3 && <Button size='small'>审核</Button>}
              </>
            )}

            <Button size='small'>{pageType?.id === 2 ? '返回' : '取消'}</Button>
          </Space>
        </Layout.Header>
        <Layout.Content>
          <div className='flex justify-between p-3 pb-1'>
            <Form layout='inline' size='small' form={pageForm} disabled={pageType?.id === 2}>
              <Form.Item label='记账日期' field={'bdate'} rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item label='业务日期' field={'bdate'} rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item label='附件张数' field={'attachs'}>
                <Input.Group compact className='w-45!'>
                  <Input disabled value={pageProof?.attachs} style={{ width: '66%' }} />
                  <Button type='primary' onClick={() => setVisibleImg(true)}>
                    附件
                  </Button>
                </Input.Group>
              </Form.Item>
              <Form.Item label='业务类型' field={'vtype'} rules={[{ required: true }]}>
                <Select options={['记', '收', '付', '借']} className='w-32!' />
              </Form.Item>
              <Form.Item label='会计期间' field={'range'} rules={[{ required: true }]} disabled>
                <Input />
              </Form.Item>
              <Form.Item label='参考信息' field={'rmsg'}>
                <Input />
              </Form.Item>
              <Form.Item field={'isrelatetrans'} triggerPropName='checked'>
                <Checkbox>是否是关联交易</Checkbox>
              </Form.Item>
            </Form>
          </div>

          <div className='flex border border-neutral-200'>
            <div className='flex-1'>
              <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-2.5'>
                <div className='text-base'>分录</div>
                {pageType?.id === 1 && (
                  <Space size='large'>
                    {buttonList.map((e) => (
                      <div key={e.id} className='flex cursor-pointer items-center gap-1 text-blue-600'>
                        <img src={e.icon} alt='' /> {e.name}
                      </div>
                    ))}
                  </Space>
                )}
                {pageType?.id === 2 && (
                  <Space>
                    <Button.Group>
                      <Button type='primary' size='small' icon={<IconTag />}>
                        {pageBill?.modename}
                      </Button>
                      <Button type='outline' size='small'>
                        <Typography.Text copyable={!['无引单', '自动生成'].includes(pageBill?.sericnum)}>
                          {pageBill?.sericnum}
                        </Typography.Text>
                      </Button>
                    </Button.Group>

                    <Dropdown
                      droplist={
                        <Menu>
                          <Menu.Item key='1'>带金额复制</Menu.Item>
                          <Menu.Item key='2'>不带金额复制</Menu.Item>
                        </Menu>
                      }
                      position='br'>
                      <Tooltip content='复制'>
                        <Button type='text' size='small'>
                          <IconCopy />
                        </Button>
                      </Tooltip>
                    </Dropdown>

                    <Tooltip content='锁定配置'>
                      <Button type='text' size='small'>
                        <IconLock />
                      </Button>
                    </Tooltip>
                  </Space>
                )}
                {pageType?.id === 3 && (
                  <Space>
                    <Button.Group>
                      <Button type='primary' size='small' icon={<IconTag />}>
                        {pageBill?.modename}
                      </Button>
                      <Button type='outline' size='small'>
                        {pageBill?.sericnum}
                      </Button>
                      <Button type='primary' size='small'>
                        <IconClose />
                      </Button>
                    </Button.Group>

                    <Tooltip content='黏贴'>
                      <Button type='text' size='small'>
                        <IconPaste />
                      </Button>
                    </Tooltip>
                    <Tooltip content='新增'>
                      <Button type='text' size='small'>
                        <IconPlus />
                      </Button>
                    </Tooltip>
                    <Tooltip content='插入'>
                      <Button type='text' size='small'>
                        <IconImport />
                      </Button>
                    </Tooltip>
                    <Tooltip content='删除'>
                      <Button type='text' size='small'>
                        <IconClose />
                      </Button>
                    </Tooltip>
                  </Space>
                )}
              </div>
              <Table
                size='small'
                rowKey={'id'}
                border={false}
                borderCell
                pagination={false}
                columns={columns}
                data={tableData}
                scroll={{ y: pageHeight - 372 }}
                rowClassName={(record) => ['h-15', record.id === selectRow?.id && 'table-select'].join(' ')}
                onRow={(record) => {
                  return {
                    onClick: () => {
                      selectForm.resetFields()
                      setSelectRow(() => {
                        const item = record.assistitems
                        item.direct = record.borrow !== 0 && record.loan === 0 ? 1 : 2
                        item.items = Array.isArray(item.items)
                          ? item.items.map((e) => ({
                              ...e,
                              value: `${e.itemcode || ''}-${e.itemname || ''}`,
                            }))
                          : []

                        // 异步更新表单值
                        Promise.resolve().then(() => {
                          selectForm.setFieldsValue({
                            ...item,
                            acccode: record.acccode,
                            project_off_set: record.project_off_set,
                          })
                        })

                        return record
                      })
                    },
                  }
                }}
              />
              <div className='flex justify-between border-t border-neutral-200 p-3'>
                <div>
                  合计：
                  <span className='font-bold text-blue-600'>
                    {pageProof?.total < 0 && '负'} {pageProof?.totalcn || '零元整'}
                  </span>
                </div>
                <Space size='large'>
                  <div>
                    借方：<span className='font-bold text-blue-600'>{pageProof?.borrow || '0.00'}</span>
                  </div>
                  <div>
                    贷方：<span className='font-bold text-blue-600'>{pageProof?.loan || '0.00'}</span>
                  </div>
                </Space>
              </div>
            </div>
            {selectRow?.id && selectRow?.assistitems?.eid !== 0 && (
              <div className='w-1/5 border-l border-neutral-200'>
                <div className='border-b border-neutral-200 px-4 py-3 text-base'>辅助账</div>
                <Form
                  form={selectForm}
                  size='small'
                  autoComplete='off'
                  className='p-4 pl-0'
                  labelCol={{ style: { flexBasis: 110 } }}
                  wrapperCol={{ style: { flexBasis: `calc(100% - ${110}px)` } }}
                  disabled={pageType?.id === 2}>
                  <Form.Item label='业务日期' field={'bdate'} rules={[{ required: true }]}>
                    <DatePicker className='w-full!' />
                  </Form.Item>
                  <Form.Item label='方向' field={'direct'} rules={[{ required: true }]}>
                    <Radio.Group>
                      <Radio value={1}>借</Radio>
                      <Radio value={2}>贷</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item label='到期日期' field={'edate'} rules={[{ required: true }]} hidden={selectRow?.isbj !== 1}>
                    <DatePicker className='w-full!' />
                  </Form.Item>
                  <Form.Item label='本位币金额' field={'money'} rules={[{ required: true }]}>
                    <InputNumber
                      min={0}
                      prefix='¥'
                      allowClear
                      formatter={(value) => {
                        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }}
                    />
                  </Form.Item>
                  <Form.Item shouldUpdate noStyle>
                    {(values) => {
                      return values?.items?.map((item, index) => (
                        <Form.Item key={index} label={item.typename} field={`items[${index}].value`}>
                          <Input placeholder='请输入' />
                        </Form.Item>
                      ))
                    }}
                  </Form.Item>
                  <Form.Item label='摘要' field={'summary'} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                    <Input.TextArea rows={2} autoSize />
                  </Form.Item>
                  <Form.Item shouldUpdate noStyle>
                    {(values) => {
                      if (['1221.003', '2241.005'].includes(values.acccode)) {
                        console.log(values)
                        return values?.project_off_set?.map((item, index) => (
                          <>
                            <Form.Item
                              triggerPropName='checked'
                              label={<></>}
                              style={{ marginTop: 20 }}
                              field={`project_off_set[${index}].id`}>
                              <Checkbox>冲抵项目款</Checkbox>
                            </Form.Item>
                            <Form.Item
                              label='供应商'
                              field={`project_off_set[${index}].suppliername`}
                              rules={[{ required: true }]}>
                              <Input placeholder='请输入' />
                            </Form.Item>
                            <Form.Item label='项目' field={`project_off_set[${index}].projectname`} rules={[{ required: true }]}>
                              <Input placeholder='请输入' />
                            </Form.Item>
                            <Form.Item label='合同号' field={`project_off_set[${index}].contractno`} rules={[{ required: true }]}>
                              <Input placeholder='请输入' />
                            </Form.Item>
                          </>
                        ))
                      }
                    }}
                  </Form.Item>
                </Form>
              </div>
            )}
          </div>

          <Form className='p-3' size='small' layout='inline' form={pageForm} disabled>
            <Form.Item label='会计主管' field={'chargename'}>
              <Input placeholder='请输入' className='w-20!' />
            </Form.Item>
            <Form.Item label='审核' field={'checkername'}>
              <Input placeholder='请输入' className='w-20!' />
            </Form.Item>
            <Form.Item label='记账' field={'bookkeepername'}>
              <Input placeholder='请输入' className='w-20!' />
            </Form.Item>
            <Form.Item label='出纳' field={'cashiername'}>
              <Input placeholder='请输入' className='w-20!' />
            </Form.Item>
            <Form.Item label='制单人' field={'markername'} rules={[{ required: true }]}>
              <Input placeholder='请输入' className='w-20!' />
            </Form.Item>
          </Form>
        </Layout.Content>
      </Layout>

      {/* 现金流量 */}
      <CashInfo
        visible={visibleCash}
        cashParams={pageProof}
        onCancel={() => {
          setVisibleCash(false)
        }}
      />

      {/* 附件清单 */}
      <FileInfo
        visible={visibleImg}
        fileParams={pageProof}
        tableTyle={{ finish: false, ischeckout: pageProof?.ischeckout, status: pageProof?.status }}
        onCancel={() => {
          setVisibleImg(false)
        }}
      />
    </>
  )
}
export default VoucherDetail
