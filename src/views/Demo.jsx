import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Button, DatePicker, Drawer, Empty, Form, Input, InputNumber, Radio, Space, Table } from '@arco-design/web-react'
import { IconCheck, IconClose, IconDragDotVertical, IconMore } from '@arco-design/web-react/icon'

// 拖拽
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 组件
import AccountInfo from 'src/components/AccountInfo'
import AssistInfo from 'src/components/AssistInfo'

// 公共方法
import { uuid } from 'src/utils/common'
// 数字转换
const transNum = (num, index) => {
  if (!num || num === 0) return ''
  const paddedNum = Number(num).toFixed(2).replace('.', '').padStart(11, 'X')
  const targetChar = paddedNum[paddedNum.length - 1 - index]
  return targetChar === 'X' || targetChar === '-' ? '' : targetChar || ''
}
// 移除 acccode 前缀
const removeAccCodeFromFullname = (fullname, code) => {
  if (!fullname || !code) return fullname
  const regex = new RegExp(`^${code}\\s*`, 'g')
  return fullname.replace(regex, '')
}

// 拼接 acccode 和 fullname
const addAccCodeToFullname = (fullname, code) => {
  if (!code) return fullname
  const cleanFullname = removeAccCodeFromFullname(fullname, code)
  return `${code} ${cleanFullname}`
}

const proofInfo = {
  bill: {
    id: 2335,
    groupid: 1,
    sericnum: 'BX-CL-20260114-001',
    billid: 431,
    modeid: 316,
    modecode: 'sedclfybx',
    modename: '费用报销-车辆费用',
    modetable: 'sedclfybx',
    summary: '费用报销-车辆费用',
    bankid: 1,
    bankaccount: '125916592910222',
    bankname: '招商银行股份有限公司南京城西支行',
    bankcode: '1001',
    projectcode: '0',
    projectname: '',
    costcentercode: '6002',
    costcentername: '销售部',
    staffcode: '10020',
    staffname: '吕添添',
    suppliercode: '',
    suppliername: '',
    customercode: '10020',
    customername: '吕添添',
    pid: 2876,
    year: 2026,
    month: 1,
    seqno: 44,
    vno: '记-2026-1-44',
    bdate: '2026-01-23T00:00:00+08:00',
    pdate: '2026-01-23T00:00:00+08:00',
    attachs: 0,
    entrytype: 2,
    paytype: 2,
    paytypename: '银行电汇',
    paybillno: '',
    contractno: '',
    edate: '2026-01-26T00:00:00+08:00',
    entrymoney: 1879.61,
    entrymoneycn: '',
    totalmoney_notrate: 0,
    totalmoney_addtrate: 0,
    totalmoney_vvtrate: 0,
    sqd_sericnum: '',
    isprepay: 0,
    makercode: '',
    markername: '',
    createdt: '2026-01-26T16:12:31+08:00',
    totalmoney: 0,
    socialmoney: 0,
    publicmoney: 0,
    ratemoney: 0,
    payee_bankid: 0,
    payee_bankaccount: '',
    payee_bankname: '',
    payee_bankcode: '',
    assist: {
      4: {
        typename: '银行账户',
        itemid: 1,
        itemcode: '1001',
        itemname: '招商银行股份有限公司南京城西支行',
      },
      6: {
        typename: '成本中心',
        itemid: 94,
        itemcode: '6002',
        itemname: '销售部',
      },
      7: {
        typename: '职员',
        itemid: 128,
        itemcode: '10020',
        itemname: '吕添添',
      },
    },
    notattachproofs: null,
    taxtype: 0,
    sbynmoney: 0,
    sbylmoney: 0,
    sbsymoney: 0,
    sbgsmoney: 0,
    sbsyumoney: 0,
    sbgrsbmoney: 0,
    gr_ynmoney: 0,
    gr_ylmoney: 0,
    gr_symoney: 0,
    gr_gjjmoney: 0,
    gs_gjjmoney: 0,
    costtypecode: '',
    costtypename: '',
    adjustratemoney: 0,
    bankpay: 0,
    ctpay: 0,
    ctpaytype: '',
    ctprepay: 0,
    zz_rate: 0,
    cswh_rate: 0,
    jyfbj_rate: 0,
    tfjyfj_rate: 0,
    yhs_rate: 0,
    clgz_rate: 0,
    cc_rate: 0,
    xf_rate: 0,
    yy_rate: 0,
    fc_rate: 0,
    q_rate: 0,
    tdzz_rate: 0,
    tdsy_rate: 0,
    gjbh_rate: 0,
    g_rate: 0,
    zy_rate: 0,
    qt_rate: 0,
    gdzc_type: '',
    house_zj: 0,
    office_zj: 0,
    traffic_zj: 0,
    ohter_zj: 0,
    qy_gzxj_rate: 0,
    qy_zgfnf_rate: 0,
    qy_zgjyjf_rate: 0,
    qy_bcynyl_rate: 0,
    qy_ywzd_rate: 0,
    qy_ghjf_rate: 0,
    qy_dzzjf_rate: 0,
    qy_ggf_rate: 0,
    qy_gyxjz_rate: 0,
    qy_yffy_rate: 0,
    qy_sxf_rate: 0,
    qy_zrj_rate: 0,
    brachflag: '',
    pay_split_infos: null,
    stocktype: 0,
    stockin: [],
    stockout: [],
    income: null,
    cbtypecode: '',
    yearmonth: '',
    cost_total: null,
    detail_list: null,
    srlx: '',
    srtype: '',
    add_tax_type: '',
  },
  cash_has_set: false,
  is_cash_check: true,
  proof: {
    id: 2876,
    groupid: 1,
    year: 2026,
    month: 1,
    catid: 2,
    seqno: 44,
    vno: '记-2026-1-44',
    vname: '2026年1月份-44号凭证',
    bdate: '2026-01-23T00:00:00+08:00',
    pdate: '2026-01-23T00:00:00+08:00',
    vtype: '记',
    rmsg: '',
    attachs: 17,
    isrelatetrans: 0,
    stocktype: 0,
    stockpzid: 0,
    borrow: 1879.61,
    loan: 1879.61,
    total: 1879.61,
    totalcn: '壹仟捌佰柒拾玖元陆角壹分',
    makerid: 0,
    markername: '王婷',
    chargeid: 0,
    chargename: '',
    checkerid: 0,
    checkername: '',
    bookkeeperid: 0,
    bookkeepername: '',
    cashierid: 0,
    cashiername: '',
    status: 0,
    createdt: '2026-01-26T16:12:30+08:00',
    isbuild: 0,
    fileurl: '',
    filepath: '',
    ischeckout: '0',
    entrys: [
      {
        id: 16162,
        pid: 2876,
        summary: '车辆费用-过桥过路费-粤BD27Q6-宿迁出差',
        classid: 6,
        acccode: '6601.007.003',
        accname: '过路过桥费',
        accfullname: '销售费用_车辆费用_过路过桥费',
        borrow: 123,
        loan: 0,
        edate: '',
        isbj: 0,
        sort: 1,
        authtype: 0,
        autobuild: 1,
        assistitems: {
          id: 9194,
          pid: 2876,
          eid: 16162,
          bdate: '2025-12-18T00:00:00+08:00',
          money: 123,
          summary: '车辆费用-过桥过路费-粤BD27Q6-宿迁出差',
          items: [
            {
              pid: 2876,
              eid: 16162,
              aid: 9194,
              typeid: 6,
              typename: '成本中心',
              limitgroup: '1',
              sourcetype: 0,
              itemid: 94,
              itemcode: '6002',
              itemname: '销售部',
              itemfullname: '',
            },
          ],
        },
      },
      {
        id: 16163,
        pid: 2876,
        summary: '车辆费用-过桥过路费-粤BD27Q6-接人',
        classid: 6,
        acccode: '6601.007.003',
        accname: '过路过桥费',
        accfullname: '销售费用_车辆费用_过路过桥费',
        borrow: 20,
        loan: 0,
        edate: '',
        isbj: 0,
        sort: 2,
        authtype: 0,
        autobuild: 1,
        assistitems: {
          id: 9195,
          pid: 2876,
          eid: 16163,
          bdate: '2026-01-26T00:00:00+08:00',
          money: 20,
          summary: '车辆费用-过桥过路费-粤BD27Q6-接人',
          items: [
            {
              pid: 2876,
              eid: 16163,
              aid: 9195,
              typeid: 6,
              typename: '成本中心',
              limitgroup: '1',
              sourcetype: 0,
              itemid: 94,
              itemcode: '6002',
              itemname: '销售部',
              itemfullname: '',
            },
          ],
        },
      },
      {
        id: 16164,
        pid: 2876,
        summary: '车辆费用-维修费-粤BD27Q6-维修费',
        classid: 6,
        acccode: '6601.007.004',
        accname: '维修费',
        accfullname: '销售费用_车辆费用_维修费',
        borrow: 5,
        loan: 0,
        edate: '',
        isbj: 0,
        sort: 3,
        authtype: 0,
        autobuild: 1,
        assistitems: {
          id: 9196,
          pid: 2876,
          eid: 16164,
          bdate: '2025-12-11T00:00:00+08:00',
          money: 5,
          summary: '车辆费用-维修费-粤BD27Q6-维修费',
          items: [
            {
              pid: 2876,
              eid: 16164,
              aid: 9196,
              typeid: 6,
              typename: '成本中心',
              limitgroup: '1',
              sourcetype: 0,
              itemid: 94,
              itemcode: '6002',
              itemname: '销售部',
              itemfullname: '',
            },
          ],
        },
      },
      {
        id: 16165,
        pid: 2876,
        summary: '车辆费用-其他-粤BD27Q6-12月份洗车费',
        classid: 6,
        acccode: '6601.007.999',
        accname: '其他',
        accfullname: '销售费用_车辆费用_其他',
        borrow: 75,
        loan: 0,
        edate: '',
        isbj: 0,
        sort: 4,
        authtype: 0,
        autobuild: 1,
        assistitems: {
          id: 9197,
          pid: 2876,
          eid: 16165,
          bdate: '2025-12-08T00:00:00+08:00',
          money: 75,
          summary: '车辆费用-其他-粤BD27Q6-12月份洗车费',
          items: [
            {
              pid: 2876,
              eid: 16165,
              aid: 9197,
              typeid: 6,
              typename: '成本中心',
              limitgroup: '1',
              sourcetype: 0,
              itemid: 94,
              itemcode: '6002',
              itemname: '销售部',
              itemfullname: '',
            },
          ],
        },
      },
      {
        id: 16166,
        pid: 2876,
        summary: '车辆费用-其他-苏A3AQ08-12月份洗车费',
        classid: 6,
        acccode: '6601.007.999',
        accname: '其他',
        accfullname: '销售费用_车辆费用_其他',
        borrow: 25,
        loan: 0,
        edate: '',
        isbj: 0,
        sort: 5,
        authtype: 0,
        autobuild: 1,
        assistitems: {
          id: 9198,
          pid: 2876,
          eid: 16166,
          bdate: '2025-12-08T00:00:00+08:00',
          money: 25,
          summary: '车辆费用-其他-苏A3AQ08-12月份洗车费',
          items: [
            {
              pid: 2876,
              eid: 16166,
              aid: 9198,
              typeid: 6,
              typename: '成本中心',
              limitgroup: '1',
              sourcetype: 0,
              itemid: 94,
              itemcode: '6002',
              itemname: '销售部',
              itemfullname: '',
            },
          ],
        },
      },
      {
        id: 16167,
        pid: 2876,
        summary: '车辆费用-加油费-粤BD27Q6-12月份公司日常加油费',
        classid: 6,
        acccode: '6601.007.002',
        accname: '加油费',
        accfullname: '销售费用_车辆费用_加油费',
        borrow: 1631.61,
        loan: 0,
        edate: '',
        isbj: 0,
        sort: 6,
        authtype: 0,
        autobuild: 1,
        assistitems: {
          id: 9199,
          pid: 2876,
          eid: 16167,
          bdate: '2025-12-19T00:00:00+08:00',
          money: 1631.61,
          summary: '车辆费用-加油费-粤BD27Q6-12月份公司日常加油费',
          items: [
            {
              pid: 2876,
              eid: 16167,
              aid: 9199,
              typeid: 6,
              typename: '成本中心',
              limitgroup: '1',
              sourcetype: 0,
              itemid: 94,
              itemcode: '6002',
              itemname: '销售部',
              itemfullname: '',
            },
          ],
        },
      },
      {
        id: 16168,
        pid: 2876,
        summary: '车辆费用-费用报销-车辆费用',
        classid: 1,
        acccode: '1002.001',
        accname: '人民币',
        accfullname: '银行存款_人民币',
        borrow: 0,
        loan: 1879.61,
        edate: '',
        isbj: 0,
        sort: 7,
        authtype: 0,
        autobuild: 1,
        assistitems: {
          id: 9200,
          pid: 2876,
          eid: 16168,
          bdate: '2026-01-23T00:00:00+08:00',
          money: 1879.61,
          summary: '车辆费用-费用报销-车辆费用',
          items: [
            {
              pid: 2876,
              eid: 16168,
              aid: 9200,
              typeid: 4,
              typename: '银行账户',
              limitgroup: '1',
              sourcetype: 0,
              itemid: 1,
              itemcode: '1001',
              itemname: '招商银行股份有限公司南京城西支行',
              itemfullname: '',
            },
          ],
        },
      },
    ],
    fileids: null,
    files: null,
    sessionno: '',
    banktype: 0,
    stockin: null,
  },
}

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

const Demo = () => {
  const { currentCompany } = useSelector((state) => state.commonReducer)
  const [type, setType] = useState(1)
  const [tableForm] = Form.useForm()
  const [pageForm] = Form.useForm()
  const [assistForm] = Form.useForm()

  const [pageProof, setPageProof] = useState()

  const [tableData, setTableData] = useState([])
  const [isEditRows, setIsEditRows] = useState([])
  const [selectRow, setSelectRow] = useState()

  const [selectList, setSelectList] = useState([])

  const [accountParams, setAccountParams] = useState({})
  const [visibleAccount, setVisibleAccount] = useState(false)

  const [visibleAssist, setVisibleAssist] = useState(false)
  const [assistParams, setAssistParams] = useState({})

  const columns = [
    {
      title: '序号',
      dataIndex: 'order',
      width: 75,
      align: 'center',
      render: (text, record, index) =>
        isEditRows.includes(record.id) ? (
          <Space>
            <IconCheck className='text-xl! text-blue-600!' onClick={() => onSaveRow(record, 1)} />
            <IconClose className='text-xl! text-red-600!' onClick={() => onCancelRow(record)} />
          </Space>
        ) : (
          index + 1
        ),
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      render: (text, record) =>
        isEditRows.includes(record.id) ? (
          <Form.Item className='mb-0!' field={`summary-${record.id}`} rules={[{ required: true, message: '摘要不能为空' }]}>
            <Input.TextArea rows={1} />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: '科目',
      dataIndex: 'accfullname',
      width: 360,
      render: (text, record) =>
        isEditRows.includes(record.id) ? (
          <div className='flex items-center gap-2'>
            <Form.Item
              className='mb-0! flex-1'
              field={`accfullname-${record.id}`}
              rules={[{ required: true, message: '科目不能为空' }]}>
              <Input.TextArea className='flex-1' />
            </Form.Item>
            <Form.Item className='mb-0! w-5!'>
              <IconMore className='text-xl!' onClick={() => openAccount(record)} />
            </Form.Item>
          </div>
        ) : (
          addAccCodeToFullname(text, record.acccode)
        ),
    },
    {
      title: '借方',
      dataIndex: 'borrow',
      align: 'center',
      children: [
        {
          title: '亿',
          dataIndex: 'borrow_10',
          className: 'row-money border-l! border-neutral-200!',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 10)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              const auxiliary = record?.assistitems?.items && record?.assistitems?.items?.length > 0 ? 1 : 0
              const isLoanFilled = tableForm.getFieldValue(`loan-${record.id}`)

              obj.props.colSpan = 11
              obj.children = (
                <Form.Item
                  className='mb-0!'
                  field={`borrow-${record.id}`}
                  rules={validateDebitCredit(record)}
                  disabled={auxiliary === 1 || isLoanFilled}>
                  <InputNumber
                    className='w-full'
                    prefix={'¥'}
                    hideControl
                    autoComplete='off'
                    precision={1}
                    step={0.01}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              )
            }
            return obj
          },
        },
        {
          title: '千',
          dataIndex: 'borrow_9',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 9)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '百',
          dataIndex: 'borrow_8',
          className: 'row-money',
          width: 20,

          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 8)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '十',
          dataIndex: 'borrow_7',
          className: 'row-money row-blue',
          width: 20,

          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 7)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '万',
          dataIndex: 'borrow_6',
          className: 'row-money',
          width: 20,

          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 6)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '千',
          dataIndex: 'borrow_5',
          className: 'row-money',
          width: 20,

          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 5)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '百',
          dataIndex: 'borrow_4',
          className: 'row-money row-blue',
          width: 20,

          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 4)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '十',
          dataIndex: 'borrow_3',
          className: 'row-money',
          width: 20,

          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 3)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '元',
          dataIndex: 'borrow_2',
          className: 'row-money',
          width: 20,

          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 2)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '角',
          dataIndex: 'borrow_1',
          className: 'row-money row-red',
          width: 20,

          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 1)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '分',
          dataIndex: 'borrow_0',
          className: 'row-money',
          width: 20,

          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 0)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
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
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 10)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              const auxiliary = record?.assistitems?.items && record?.assistitems?.items?.length > 0 ? 1 : 0
              const isBorrowFilled = tableForm.getFieldValue(`borrow-${record.id}`)

              obj.props.colSpan = 11
              obj.children = (
                <Form.Item
                  className='mb-0!'
                  field={`loan-${record.id}`}
                  rules={validateDebitCredit(record)}
                  disabled={auxiliary === 1 || isBorrowFilled}>
                  <InputNumber
                    className='w-full'
                    prefix={'¥'}
                    hideControl
                    autoComplete='off'
                    precision={1}
                    step={0.01}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              )
            }
            return obj
          },
        },
        {
          title: '千',
          dataIndex: 'loan_9',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 9)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '百',
          dataIndex: 'loan_8',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 8)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '十',
          dataIndex: 'loan_7',
          className: 'row-money row-blue',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 7)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '万',
          dataIndex: 'loan_6',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 6)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '千',
          dataIndex: 'loan_5',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 5)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '百',
          dataIndex: 'loan_4',
          className: 'row-money row-blue',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 4)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '十',
          dataIndex: 'loan_3',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 3)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '元',
          dataIndex: 'loan_2',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 2)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '角',
          dataIndex: 'loan_1',
          className: 'row-money row-red',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 1)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
        {
          title: '分',
          dataIndex: 'loan_0',
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 0)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 0
            }
            return obj
          },
        },
      ],
    },
  ]

  // 借贷输入框校验
  const validateDebitCredit = (record) => [
    {
      validator(_, cb) {
        const borrow = tableForm.getFieldValue(`borrow-${record.id}`)
        const loan = tableForm.getFieldValue(`loan-${record.id}`)

        if (!borrow && !loan) {
          return cb('借贷必须输入一个')
        } else {
          return cb()
        }
      },
    },
  ]
  // 取消行编辑
  const onCancelRow = (record) => {
    const oldTableData = [...pageProof.entrys]
    const resetRow = oldTableData.find((item) => item.id === record.id)

    setTableData((prev) => prev.map((e) => (e.id === record.id ? resetRow : e)))
    setIsEditRows((prev) => prev.filter((id) => id !== record.id))
  }
  // 保存行数据
  const onSaveRow = async (record, type) => {
    const rowFields = [`summary-${record.id}`, `accfullname-${record.id}`, `borrow-${record.id}`, `loan-${record.id}`]
    const row = await tableForm.validate(rowFields)

    let editRow = { ...record }

    if (!selectRow.accfullname && (!selectRow?.borrow || !selectRow?.loan)) {
      editRow = {
        ...selectRow,
        summary: row[`summary-${record.id}`],
        accfullname: row[`accfullname-${record.id}`],
        borrow: row[`borrow-${record.id}`] || 0,
        loan: row[`loan-${record.id}`] || 0,
      }
    }

    setTableData((prev) => prev.map((item) => (item.id === editRow.id ? editRow : item)))

    // 关闭编辑
    if (type) {
      setIsEditRows((prev) => prev.filter((id) => id !== record.id))
    }
  }
  // 辅助账保存
  const onSaveAssist = (assistData, type) => {
    const rowData = {
      ...selectRow,
      borrow: assistData.direct === 1 ? Number(assistData.money) : 0,
      loan: assistData.direct === 2 ? Number(assistData.money) : 0,
      assistitems: assistData,
    }
    // 保存行数据
    onSaveRow(rowData, type)
  }
  // 确认-辅助账选择
  const onAssistEntry = (record) => {
    const newItem = {
      ...assistParams,
      itemcode: record.code,
      itemfullname: record.fullname,
      itemid: record.id,
      itemname: record.name,
      codeName: record.code ? `${record.code || ''}-${record.name || ''}` : '',
    }
    // 更新数据
    const updateSelectRowWithNewItem = (newItem) => {
      const values = assistForm.getFields()
      const updatedItems = values.items.map((item) => (item.typeid === newItem.typeid ? newItem : item))
      return {
        ...selectRow,
        assistitems: {
          ...values,
          items: updatedItems,
        },
      }
    }
    const updatedSelectRow = updateSelectRowWithNewItem(newItem)

    onRowSelect(updatedSelectRow)

    setTableData((prev) => {
      const index = prev.findIndex((row) => row.id === updatedSelectRow.id)
      if (index !== -1) {
        const newData = [...prev]
        newData[index] = updatedSelectRow
        return newData
      }
      return prev
    })
    setVisibleAssist(false)
    setAssistParams(null)
  }
  // 打开-辅助账选择
  const openAssist = (record) => {
    setAssistParams(record)
    setVisibleAssist(true)
  }
  // 确认-会计科目选择
  const onAccountEntry = async (record) => {
    const NowRow = accountParams.record
    const { code, data } = await Http.post(`/account/${record.id}`)
    if (code === 200) {
      const direct = data.direct == '借' ? 1 : 2
      const item = {
        id: NowRow.id,
        acccode: data.code,
        accfullname: data.fullname,
        accname: data.name,
        assistitems: {
          bdate: pageForm.getFieldValue('bdate'),
          summary: NowRow.summary,
          money: direct === 1 ? Number(NowRow.borrow) : Number(NowRow.loan),
          items: (data.assistitems || []).map((e) => ({
            typename: e.name,
            typeid: e.id,
            value: null,
          })),
        },
        authtype: NowRow.authtype,
        autobuild: NowRow.autobuild,
        borrow: direct === 1 ? Number(NowRow.borrow) : 0,
        brachflag: '',
        classid: data.classid,
        edate: '',
        isbj: data.isbj,
        loan: direct === 2 ? Number(NowRow.loan) : 0,
        project_off_set: NowRow.project_off_set,
        summary: NowRow.summary,
      }
      setTableData((prev) => prev.map((e) => (e.id === NowRow.id ? item : e)))
      // 选择
      onRowSelect(item)
      // 编辑
      onRowEdit(item)
      // 关闭弹窗
      setVisibleAccount(false)
      // 请款参数
      setAccountParams(null)
    }
  }
  // 打开-会计科目选择
  const openAccount = async (record) => {
    const params = {
      shortname: currentCompany?.shortname,
      classid: record.classid,
      record: record,
    }
    setAccountParams(params)
    setVisibleAccount(true)
  }

  // 表格行
  const EditableRow = (props) => {
    const { record, index, ...rest } = props
    const { setNodeRef, transform, transition } = useSortable({ id: record.id, index })

    return <tr index={index} {...rest} ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} />
  }
  // 行-选择
  const onRowSelect = (record, e) => {
    const targetElement = e?.target
    const isCheckboxClick = targetElement
      ? targetElement?.classList.contains('arco-table-checkbox') ||
        targetElement?.classList.contains('arco-checkbox-mask') ||
        targetElement?.closest('.arco-table-checkbox')
      : false
    // 排除干扰点击

    if (!isCheckboxClick) {
      assistForm.resetFields()

      setSelectRow(() => {
        const item = record?.assistitems
        if (item) {
          item.direct = record.borrow !== 0 && record.loan === 0 ? 1 : 2
          item.items = Array.isArray(item.items)
            ? item.items.map((e) => ({
                ...e,
                codeName: e.itemcode ? `${e.itemcode || ''}-${e.itemname || ''}` : '',
              }))
            : []
          // 异步更新表单值
          Promise.resolve().then(() => {
            assistForm.setFieldsValue(item)
          })
        }
        return record
      })
    }
  }
  // 行-编辑
  const onRowEdit = (record) => {
    if (type === 2) {
      setIsEditRows((prev) => [...prev, record.id])

      // 构造表单数据
      const formData = {
        [`summary-${record.id}`]: record.summary,
        [`accfullname-${record.id}`]: addAccCodeToFullname(record.accfullname, record.acccode),
        [`borrow-${record.id}`]: record.borrow,
        [`loan-${record.id}`]: record.loan,
      }

      // 设置表单值
      tableForm.setFieldsValue(formData)
    }
  }

  // 新增行
  const onAddRow = () => {
    const id = 'index_id_' + uuid()
    const newRow = {
      id,
      summary: tableData[tableData?.length - 1]?.summary || '',
      authtype: 0,
      autobuild: 1,
      assistitems: null,
    }
    const newTableData = [...tableData, newRow]
    setTableData(newTableData)

    onRowEdit(newRow)
  }
  // 状态修改
  const onEdit = async (type) => {
    setType(type)

    // 保存表
    if (type === 1) {
      setIsEditRows([])
    }
  }
  // 拖拽元素
  const SortableItem = (props) => {
    const { id, children } = props
    const { attributes, listeners } = useSortable({ id })

    return (
      <div {...attributes} {...listeners}>
        {children}
      </div>
    )
  }
  // 结束拖拽
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setTableData((prev) => {
        const activeIndex = prev.findIndex((item) => item.id === active.id)
        const overIndex = prev.findIndex((item) => item.id === over.id)
        const newItems = [...prev]
        newItems.splice(activeIndex, 1)
        newItems.splice(overIndex, 0, prev[activeIndex])

        const updatedItems = newItems.map((item, index) => ({
          ...item,
          sort: index + 1,
        }))

        return updatedItems
      })
    }
  }

  useEffect(() => {
    const { proof } = proofInfo
    const { entrys, ...restProof } = proof
    setTableData(entrys)

    const key = buttonlist.find((item) => String(item.id) == String(restProof.status)) || {}
    const itemProof = {
      ...proof,
      status_name: key?.name,
      status_color: key?.color,
      range: `${restProof?.year}年${restProof?.month}期`,
      disabledDate: [
        dayjs(`${restProof?.year}-${restProof?.month}`).endOf('month').format('YYYY-MM-DD'), // 最后一天
        dayjs(`${restProof?.year}-${restProof?.month}`).startOf('month').format('YYYY-MM-DD'), // 第一天
      ],
      defaultStart: dayjs(`${restProof?.year}-${restProof?.month}`).format('YYYY-MM-DD'),
    }
    setPageProof(itemProof)
    pageForm.setFieldsValue(itemProof)
  }, [])

  return (
    <div className='p-5'>
      <div className='mb-4 text-right'>
        {type === 1 && (
          <Button type='primary' onClick={() => onEdit(2)}>
            编辑
          </Button>
        )}
        {type === 2 && (
          <Space>
            <Button type='secondary' onClick={onAddRow}>
              新增
            </Button>
            <Button type='secondary' onClick={() => onEdit(1)}>
              保存
            </Button>
          </Space>
        )}
      </div>

      <div className='flex'>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} coordinates={sortableKeyboardCoordinates}>
          <SortableContext items={tableData.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <Form className='w-full' form={tableForm} autoComplete='off' wrapperCol={{ span: 24 }}>
              <Table
                size='small'
                rowKey={'id'}
                border
                borderCell
                pagination={false}
                columns={columns}
                data={tableData}
                rowClassName={(record) =>
                  [
                    'h-15',
                    record.id === selectRow?.id ? 'table-select' : '',
                    isEditRows.includes(record.id) ? 'table-edit' : '',
                  ].join(' ')
                }
                rowSelection={{
                  type: 'checkbox',
                  selectedRowKeys: selectList,
                  onChange: (e) => setSelectList(e),
                  renderCell: (originNode, _, record) =>
                    type === 1 ? (
                      originNode
                    ) : (
                      <SortableItem id={record.id}>
                        <IconDragDotVertical className='cursor-move text-xl!' />
                      </SortableItem>
                    ),
                }}
                onRow={(record) => ({
                  onDoubleClick: () => onRowEdit(record),
                  onClick: (e) => onRowSelect(record, e),
                })}
                components={{
                  body: {
                    row: EditableRow,
                  },
                }}
              />
            </Form>
          </SortableContext>
        </DndContext>

        {tableData.length > 0 && (
          <div className='w-90 border-l border-neutral-200'>
            <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-3'>
              <div className='text-base'>辅助账</div>
              {isEditRows.includes(selectRow?.id) && selectRow?.assistitems?.items?.length > 0 && (
                <Button type='primary' size='small' onClick={() => onSaveAssist(assistForm.getFields(), 1)}>
                  确定
                </Button>
              )}
            </div>
            {selectRow && selectRow?.assistitems?.items?.length > 0 ? (
              <Form
                onBlur={() => onSaveAssist(assistForm.getFields(), 0)}
                form={assistForm}
                size='small'
                layout='vertical'
                autoComplete='off'
                className='overflow-y-auto p-4'
                labelCol={{ style: { flexBasis: 110 } }}
                wrapperCol={{ style: { flexBasis: `calc(100% - ${110}px)` } }}
                validateMessages={{ required: (_, { label }) => `${label}不能为空` }}
                disabled={!isEditRows.includes(selectRow?.id)}>
                <Form.Item label='业务日期' field={'bdate'} rules={[{ required: true }]}>
                  <DatePicker className='w-full!' defaultPickerValue={pageProof?.defaultStart} />
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
                <Form.Item
                  label='本位币金额'
                  field={'money'}
                  rules={[
                    { required: true },
                    {
                      validator: (value, cb) => {
                        if (value === '' || value === null || value === undefined || isNaN(value)) {
                          return cb('本位币金额不能为空')
                        }
                        return cb()
                      },
                    },
                  ]}>
                  <InputNumber
                    hideControl
                    prefix='¥'
                    autoComplete='off'
                    precision={1}
                    step={0.01}
                    formatter={(value) => value && `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
                <Form.Item shouldUpdate noStyle>
                  {(values) =>
                    (values?.items || [])?.map((item, index) => (
                      <Form.Item
                        key={index}
                        label={item.typename}
                        field={`items[${index}].codeName`}
                        rules={[{ required: true }]}>
                        <Input
                          placeholder='请输入'
                          suffix={
                            <IconMore
                              disabled={!isEditRows.includes(selectRow?.id)}
                              onClick={() => isEditRows.includes(selectRow?.id) && openAssist(item)}
                            />
                          }
                        />
                      </Form.Item>
                    ))
                  }
                </Form.Item>
                <Form.Item label='摘要' field={'summary'} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                  <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                </Form.Item>
                <Form.Item shouldUpdate noStyle>
                  {(values) => {
                    if (['1221.003', '2241.005'].includes(selectRow.acccode)) {
                      return values?.project_off_set?.map((item, index) => (
                        <>
                          <Form.Item triggerPropName='checked' style={{ marginTop: 20 }} field={`project_off_set[${index}].id`}>
                            <Checkbox>冲抵项目款</Checkbox>
                          </Form.Item>
                          <Form.Item label='供应商' field={`project_off_set[${index}].suppliername`} rules={[{ required: true }]}>
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
            ) : (
              <Empty />
            )}
          </div>
        )}
      </div>

      {/* 会计科目 */}
      <Drawer visible={visibleAccount} width={'52%'} title='会计科目选择' footer={null} onCancel={() => setVisibleAccount(false)}>
        {visibleAccount && <AccountInfo accountParams={accountParams} onSelect={onAccountEntry} />}
      </Drawer>

      {/* 辅助账 */}
      <Drawer
        visible={visibleAssist}
        width={'52%'}
        title={assistParams?.typename}
        footer={null}
        onCancel={() => setVisibleAssist(false)}>
        {visibleAssist && <AssistInfo assistParams={{ ...assistParams, groupid: 1 }} onSelect={onAssistEntry} />}
      </Drawer>
    </div>
  )
}

export default Demo
