import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

// 拖拽
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Message,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from '@arco-design/web-react'

import {
  IconCheck,
  IconClose,
  IconCopy,
  IconDoubleDown,
  IconDoubleUp,
  IconDragDotVertical,
  IconImport,
  IconLock,
  IconMore,
  IconPaste,
  IconPlus,
  IconSync,
  IconTag,
} from '@arco-design/web-react/icon'

// 组件
import AccountInfo from 'src/components/Accountinfo'
import AssistInfo from 'src/components/AssistInfo'
import BillInfo from 'src/components/BillInfo'
import CashInfo from 'src/components/CashInfo'
import FileInfo from 'src/components/FileInfo'

// 公共方法
import { localGetItem, localSetItem, numberToChinese, uuid } from 'src/utils/common'

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
const tylelist = [
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
  { id: 4, name: '新建' },
]
// 新建按钮
const buttonList = [
  {
    type: 3,
    name: '银行收款',
    icon: pay,
  },
  {
    type: 2,
    name: '付款',
    icon: iscash,
  },
  {
    type: 6,
    name: '开票收入',
    icon: collection,
  },
  {
    type: 9,
    name: '应收票据',
    icon: pay3,
  },
  {
    type: 8,
    name: '应付票据',
    icon: pay4,
  },
  {
    type: 4,
    name: '入库',
    icon: pay1,
  },
  {
    type: 1,
    name: '计提',
    icon: handle,
  },
  {
    type: 5,
    name: '出库',
    icon: pay2,
  },
  {
    type: 7,
    name: '收据收入',
    icon: pay_collect,
  },
  {
    type: 10,
    name: '财务调账',
    icon: rename,
  },
  {
    type: 'add',
    name: '手动录入',
    icon: rename,
  },
]

// 数字转换
const transNum = (num, index) => {
  if (!num || num === 0) return ''
  const paddedNum = Number(num).toFixed(2).replace('.', '').padStart(11, 'X')
  const targetChar = paddedNum[paddedNum.length - 1 - index]
  return targetChar === 'X' || targetChar
}

const VoucherInfo = ({ voucherParams, onBack, onReview }) => {
  const { pageHeight, isAdmin, currentCompany } = useSelector((state) => state.commonReducer)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const [pageForm] = Form.useForm()
  const [tableForm] = Form.useForm()

  const [pageProof, setPageProof] = useState()
  const [pageBill, setPageBill] = useState()
  const [pageType, setPageType] = useState()

  const [tableData, setTableData] = useState([])
  const [tableLoading, setTableLoading] = useState(false)
  const [selectRow, setSelectRow] = useState()
  const [selectList, setSelectList] = useState([])
  const [isEditRows, setIsEditRows] = useState([])

  const [visibleCash, setVisibleCash] = useState(false)
  const [visibleImg, setVisibleImg] = useState(false)

  const [sessionnoId, setSessionId] = useState()

  // 新建账单选择
  const [visibleBill, setVisibleBill] = useState(false)
  const [billParams, setBillParams] = useState({})

  // 会计科目选择
  const [visibleAccount, setVisibleAccount] = useState(false)
  const [accountParams, setAccountParams] = useState({})

  // 辅助账
  const [assistForm] = Form.useForm()
  const [visibleAssist, setVisibleAssist] = useState(false)
  const [assistParams, setAssistParams] = useState()

  // 表格列
  const columns = [
    {
      title: '序号',
      dataIndex: 'order',
      width: 75,
      align: 'center',
      render: (text, record, index) =>
        isEditRows.includes(record.id) ? (
          <Space>
            <IconCheck className='text-xl! text-blue-600!' onClick={() => onSaveRow(record)} />
            <IconClose className='text-xl! text-red-600!' onClick={() => onCancelRow(record)} />
          </Space>
        ) : (
          index + 1
        ),
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      width: window.innerWidth < 1600 ? 200 : 'auto',
      render: (text, record) =>
        isEditRows.includes(record.id) ? (
          <Form.Item
            className='mb-0!'
            field={`summary-${record.id}`}
            rules={[{ required: true, message: '摘要不能为空' }]}
            initialValue={text}>
            <Input.TextArea rows={1} />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: '科目',
      dataIndex: 'accfullnameCode',
      width: window.innerWidth < 1600 ? 200 : 300,
      render: (text, record) =>
        isEditRows.includes(record.id) && [0, 2].includes(record?.authtype) ? (
          <Form.Item required className='mb-0!'>
            <div className='flex items-center gap-2'>
              <Form.Item
                className='mb-0! flex-1'
                field={`accfullnameCode-${record.id}`}
                rules={[{ required: true, message: '科目不能为空' }]}
                initialValue={text}>
                <Input.TextArea rows={2} onPressEnter={() => onPressEnter(record)} />
              </Form.Item>
              <IconMore className='text-xl!' onClick={() => openAccount(record)} />
            </div>
          </Form.Item>
        ) : (
          text
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
              children: <span className={record.borrow < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.borrow, 10)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 11

              const auxiliary = record?.assistitems?.items && record?.assistitems?.items?.length > 0 ? 1 : 0
              obj.children = (
                <Form.Item shouldUpdate noStyle>
                  {(values) => {
                    return (
                      <Form.Item
                        className='mb-0!'
                        field={`borrow-${record.id}`}
                        initialValue={record?.borrow}
                        rules={validateDebitCredit(record)}
                        disabled={auxiliary === 1 || values[`loan-${record.id}`]}>
                        <InputNumber
                          className='w-full'
                          prefix={'¥'}
                          hideControl
                          autoComplete='off'
                          precision={1}
                          step={0.01}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          onDoubleClick={() => {
                            const num = values[`borrow-${record.id}`]
                            if (!!num && num !== 0) {
                              tableForm.setFieldValue(`loan-${record.id}`, num)
                              tableForm.setFieldValue(`borrow-${record.id}`, 0)
                            }
                          }}
                        />
                      </Form.Item>
                    )
                  }}
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
              children: <span className={record.borrow < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.borrow, 9)}</span>,
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
              children: <span className={record.borrow < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.borrow, 8)}</span>,
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
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record.borrow < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.borrow, 7)}</span>,
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
              children: <span className={record.borrow < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.borrow, 6)}</span>,
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
              children: <span className={record.borrow < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.borrow, 5)}</span>,
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
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record.borrow < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.borrow, 4)}</span>,
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
              children: <span className={record.borrow < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.borrow, 3)}</span>,
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
              children: <span className={record.borrow < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.borrow, 2)}</span>,
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
              children: <span className={record.borrow < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.borrow, 1)}</span>,
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
              children: <span className={record.borrow < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.borrow, 0)}</span>,
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
              children: <span className={record.loan < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.loan, 10)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 11

              const auxiliary = record?.assistitems?.items && record?.assistitems?.items?.length > 0 ? 1 : 0
              obj.children = (
                <Form.Item shouldUpdate noStyle>
                  {(values) => {
                    return (
                      <Form.Item
                        className='mb-0!'
                        field={`loan-${record.id}`}
                        initialValue={record?.loan}
                        rules={validateDebitCredit(record)}
                        disabled={auxiliary === 1 || values[`borrow-${record.id}`]}>
                        <InputNumber
                          className='w-full'
                          prefix={'¥'}
                          hideControl
                          autoComplete='off'
                          precision={1}
                          step={0.01}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          onDoubleClick={() => {
                            const num = values[`loan-${record.id}`]
                            if (!!num && num !== 0) {
                              tableForm.setFieldValue(`borrow-${record.id}`, num)
                              tableForm.setFieldValue(`loan-${record.id}`, 0)
                            }
                          }}
                        />
                      </Form.Item>
                    )
                  }}
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
              children: <span className={record.loan < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.loan, 9)}</span>,
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
              children: <span className={record.loan < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.loan, 8)}</span>,
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
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record.loan < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.loan, 7)}</span>,
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
              children: <span className={record.loan < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.loan, 6)}</span>,
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
              children: <span className={record.loan < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.loan, 5)}</span>,
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
          className: 'row-money',
          width: 20,
          render: (_, record) => {
            const obj = {
              children: <span className={record.loan < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.loan, 4)}</span>,
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
              children: <span className={record.loan < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.loan, 3)}</span>,
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
              children: <span className={record.loan < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.loan, 2)}</span>,
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
              children: <span className={record.loan < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.loan, 1)}</span>,
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
              children: <span className={record.loan < 0 ? 'text-red-600' : 'text-blue-600'}>{transNum(record?.loan, 0)}</span>,
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
  // 保存&暂存
  const submitBill = async (type) => {
    // -1 暂存凭证 0凭证保存
    const values = await pageForm.validate()

    if (tableData.length <= 0) {
      Message.error('分录不能为空')
      return
    }
    if (isEditRows.length > 0) {
      Message.error('存在未保存的分录')
      return
    }

    // 获取附件id
    const fileids = []
    const fileParams = {
      groupid: voucherParams.groupid,
      catid: voucherParams.catid,
      year: voucherParams.year,
      month: voucherParams.month,
      pid: voucherParams.id,
      sessionno: sessionnoId,
    }
    const { code, data } = await Http.post('/file/list', fileParams)
    if (code === 200) {
      const list = (data?.list || []).map((e) => e.id)
      fileids.push(...list)
    }

    const entrys = [] // 分录信息
    tableData.forEach((e, i) => {
      entrys.push({
        acccode: e.acccode,
        accname: e.accname,
        accfullname: e.accfullname,
        borrow: e.borrow,
        loan: e.loan,
        summary: e.summary,
        sort: i + 1,
        classid: e.classid,
        isbj: e.isbj,
        edate: e.edate,
        authtype: e.authtype,
        autobuild: e.autobuild,
        brachflag: e.brachflag || '',
        assistitems: e.assistitems || null,
        project_off_set: e.project_off_set || null,
      })
    })

    const params = {
      groupid: voucherParams.groupid, // 机构id
      year: voucherParams.year, // 年
      month: voucherParams.month, // 月
      catid: voucherParams.catid, // 目录id
      bdate: values.bdate, // 业务日期
      pdate: values.pdate, // 记账日期
      vtype: values.vtype, // 凭证类型
      rmsg: values.rmsg || '', // 参考信息
      attachs: values.attachs, // 附件张数
      isrelatetrans: values.isrelatetrans ? 1 : 0, // 是否关联
      markername: values.markername, // 制单人
      chargename: values.chargename || '', // 会计主管
      checkername: values.checkername || '', // 审核人
      bookkeepername: values.bookkeepername || '', // 记账人
      cashiername: values.cashiername || '', // 出纳人
      seqno: pageProof.seqno, // 凭证序号
      vno: pageProof.vno, // 凭证号
      ...getTotals(tableForm.getFieldsValue()),
      stocktype: pageProof.stocktype, // 出入库类型 0=非出入库凭证1=入库2=出库
      stockpzid: pageProof.stockpzid, // 出入库关联凭证
      sessionno: sessionnoId,
      bill: pageBill,
      entrys: entrys,
      fileids: fileids, // 已上传文件id列表
      isdraft: type,
    }
    if (voucherParams?.id) {
      params.id = voucherParams.id
    }
    console.log(params)
    // const url = voucherParams?.id ? '/proof/update' : '/proof/new'
    // const { code: Billcode, data: Billdata, message } = await Http.post(url, params)
    // if (Billcode === 200) {
    //   onEditType(1)
    //   //新增
    //   if (voucherParams.type === 1) {
    //     getPageInfo(Billdata.pid)
    //   } else {
    //     getPageInfo(voucherParams.id)
    //   }
    // } else {
    //   Message.error(message || '新增凭证出错了')
    // }
  }
  // 借贷输入框校验 借方和贷方至少有一项不为0
  const validateDebitCredit = (record) => [
    {
      validator(_, cb) {
        const borrow = tableForm.getFieldValue(`borrow-${record.id}`)
        const loan = tableForm.getFieldValue(`loan-${record.id}`)
        if ((!borrow || borrow === 0) && (!loan || loan === 0)) {
          return cb('借贷必须输入一个')
        } else {
          return cb()
        }
      },
    },
  ]
  // 取消行编辑
  const onCancelRow = (record) => {
    // 从编辑状态中移除
    setIsEditRows((prev) => prev.filter((id) => id !== record.id))

    // 取消选中状态
    setSelectRow(undefined)

    // 重置表单字段到原始值
    const currentRecord = record.oldRow
    if (currentRecord) {
      tableForm.setFieldsValue({
        [`summary-${record.id}`]: currentRecord.summary,
        [`accfullnameCode-${record.id}`]: currentRecord.accfullnameCode,
        [`borrow-${record.id}`]: currentRecord.borrow,
        [`loan-${record.id}`]: currentRecord.loan,
      })
      setTableData((prev) => prev.map((item) => (item.id === record.id ? currentRecord : item)))
    } else {
      const list = [`summary-${record.id}`, `accfullnameCode-${record.id}`, `borrow-${record.id}`, `loan-${record.id}`]
      tableForm.clearFields(list)
      setTableData((prev) => prev.filter((item) => item.id !== record.id))
    }
  }
  // 保存行数据
  const onSaveRow = async (record) => {
    const fields = [`summary-${record.id}`, `accfullnameCode-${record.id}`, `borrow-${record.id}`, `loan-${record.id}`]
    const rowData = await tableForm.validate(fields)

    // 查找当前记录在tableData中的索引
    const rowIndex = tableData.findIndex((item) => item.id === record.id)
    if (rowIndex !== -1) {
      // 更新数据
      const updatedRecord = {
        ...tableData[rowIndex],
        summary: rowData[`summary-${record.id}`],
        accfullnameCode: rowData[`accfullnameCode-${record.id}`],
        borrow: rowData[`borrow-${record.id}`],
        loan: rowData[`loan-${record.id}`],
      }

      // 更新整个数据数组
      const newTableData = [...tableData]
      newTableData[rowIndex] = {
        ...updatedRecord,
        oldRow: updatedRecord,
      }

      // 更新tableData状态
      setTableData(newTableData)

      // 移除编辑状态
      setIsEditRows((prev) => prev.filter((id) => id !== record.id))
    }
  }
  // 保存-辅助账选择
  const onSaveAssist = async () => {
    const values = await assistForm.validate()
    const newSelelct = {
      ...selectRow,
      borrow: values.direct === 1 ? values.money : 0,
      loan: values.direct === 2 ? values.money : 0,
      assistitems: values,
    }
    // 更新tableData中的对应行
    setTableData((prev) => prev.map((item) => (item.id === newSelelct.id ? newSelelct : item)))

    //取消行编辑状态
    setIsEditRows(isEditRows.filter((id) => id !== newSelelct.id))
  }
  // 监控辅助账数据（防抖版）
  const throttleRef = useRef(null)
  const onChangeAssist = useCallback(
    (v, vs) => {
      // 清除之前的定时器，实现防抖（Debounce），确保最后一次修改生效
      if (throttleRef.current) {
        clearTimeout(throttleRef.current)
      }

      throttleRef.current = setTimeout(() => {
        if (!selectRow?.id) return

        const { direct, money } = vs
        const borrow = direct === 1 ? Number(money) || 0 : 0
        const loan = direct === 2 ? Number(money) || 0 : 0

        const key = Object.keys(v)[0]
        // 当修改方向或金额时，同步更新主表单的借贷列
        if (key === 'direct' || key === 'money') {
          tableForm.setFieldsValue({
            [`borrow-${selectRow.id}`]: borrow,
            [`loan-${selectRow.id}`]: loan,
          })
        }

        const updatedRow = {
          ...selectRow,
          borrow,
          loan,
          assistitems: {
            ...vs,
            money: Number(money) || 0,
          },
        }

        // 同步更新表格数据和当前选中行，确保 UI 一致性
        setTableData((prev) => prev.map((item) => (item.id === updatedRow.id ? updatedRow : item)))
        setSelectRow(updatedRow)

        throttleRef.current = null
      }, 300)
    },
    [selectRow, tableForm]
  )
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
        borrow: values.direct === 1 ? values.money : 0,
        loan: values.direct === 2 ? values.money : 0,
        assistitems: {
          ...values,
          items: updatedItems,
        },
      }
    }
    const updatedSelectRow = updateSelectRowWithNewItem(newItem)

    // 更新assistForm
    assistForm.setFieldsValue(updatedSelectRow.assistitems)
    // 更新选中行数据
    onRowSelect(updatedSelectRow)
    // 更新tableData中的对应行
    setTableData((prev) => prev.map((item) => (item.id === updatedSelectRow.id ? updatedSelectRow : item)))
    // 关闭弹窗
    setVisibleAssist(false)
    // 清空参数
    setAssistParams(null)
  }
  // 打开-辅助账选择
  const openAssist = (record) => {
    setAssistParams(record)
    setVisibleAssist(true)
  }

  // 转换科目数据
  const transAccount = (data) => {
    const borrow = tableForm.getFieldValue(`borrow-${selectRow.id}`)
    const loan = tableForm.getFieldValue(`loan-${selectRow.id}`)
    const summary = tableForm.getFieldValue(`summary-${selectRow.id}`)

    const direct = data.direct == '借' ? 1 : 2
    const amount = borrow || loan
    const newAcc = {
      ...selectRow,
      acccode: data.code,
      accfullname: data.fullname,
      accname: data.name,
      accfullnameCode: `${data.code} ${data.fullname}`,
      classid: data.classid,
      isbj: data.isbj,
      borrow: direct === 1 ? amount : 0,
      loan: direct === 2 ? amount : 0,
      assistitems:
        data.assistitems?.length > 0
          ? {
            bdate: pageForm.getFieldValue('bdate'),
            summary: summary,
            money: amount || '',
            direct: direct,
            items: (data.assistitems || []).map((e) => ({
              typename: e.name,
              typeid: e.id,
              limitgroup: e.limitgroup,
              sourcetype: e.sourcetype,
            })),
          }
          : null,
    }

    // 更新tableData中的对应行
    setTableData((prev) => prev.map((item) => (item.id === selectRow.id ? newAcc : item)))
    // 更新selectRow
    setSelectRow(newAcc)
    // 更新tableForm
    tableForm.setFieldsValue({
      [`accfullnameCode-${selectRow.id}`]: newAcc.accfullnameCode,
      [`borrow-${selectRow.id}`]: newAcc.borrow,
      [`loan-${selectRow.id}`]: newAcc.loan,
    })

    assistForm.setFieldsValue(newAcc.assistitems)

    // 关闭弹窗
    setVisibleAccount(false)
    // 请款参数
    setAccountParams(null)
  }

  // 按下回车键-选择科目
  const onPressEnter = async (record) => {
    const value = tableForm.getFieldValue(`accfullnameCode-${record.id}`)
    const params = {
      code: value,
    }
    const { code, data, message } = await Http.post(`/account/code`, params)
    if (code === 200) {
      transAccount(data)
    } else {
      Message.error(message || '查询科目出错了')
    }
  }
  // 确认-科目选择
  const onAccountEntry = async (record) => {
    const { code, data, message } = await Http.post(`/account/${record.id}`)
    if (code === 200) {
      transAccount(data)
    } else {
      Message.error(message || '查询科目出错了')
    }
  }
  // 打开-科目选择
  const openAccount = (record) => {
    const params = {
      shortname: currentCompany?.shortname,
      classid: record.classid,
    }
    setAccountParams(params)
    setVisibleAccount(true)
  }
  // 确认-账单选择
  const onBillEntry = async (params) => {
    const { code, data, message } = await Http.post('/bill/entry', params)
    if (code === 200) {
      const { bill, entrys } = data
      setPageBill(bill)
      const entrysTable = entrys.map((e, i) => ({
        ...e,
        id: 'index_id_' + i,
        autobuild: 1,
        accfullnameCode: `${e.acccode} ${e.accfullname}`,
      }))
      setTableData(entrysTable)

      const newEntrys = [...(pageProof?.entrys || []), ...entrysTable]
      const values = newEntrys.reduce((acc, item) => {
        if (item?.id) {
          acc[`summary-${item.id}`] = item.summary
          acc[`accfullnameCode-${item.id}`] = item.accfullnameCode
          acc[`borrow-${item.id}`] = item.borrow
          acc[`loan-${item.id}`] = item.loan
        }
        return acc
      }, {})
      tableForm.setFieldsValue(values)

      setPageProof((prev) => ({ ...prev, entrys: newEntrys }))

      onEditType(3)
      setVisibleBill(false)
    } else {
      Message.error(message)
    }
  }
  // 打开-账单选择
  const openBill = async (item) => {
    if (item.type === 'add') {
      onEditType(3)
      setPageBill({
        sericnum: '无引单',
        modename: '手动录入',
        modecode: 'handle',
        groupid: voucherParams.groupid,
      })

      onAddRow()
    } else {
      setVisibleBill(true)
      const params = {
        ...item,
        year: voucherParams.year,
        month: voucherParams.month,
        groupid: voucherParams.groupid,
      }
      setBillParams(params)
    }
  }
  // 删除-已存在的账单
  const clearBill = () => {
    setPageBill()
    onEditType(0)
    setTableData([])
    setSelectRow()
    setIsEditRows([])

    assistForm.resetFields()
    tableForm.clearFields()
  }
  //行-新增
  const onAddRow = () => {
    const newRow = {
      id: 'index_id_' + uuid(),
      summary: tableData[tableData?.length - 1]?.summary || '',
      accfullnameCode: '',
      authtype: 0,
      autobuild: 1,
      assistitems: null,
    }
    const newTableData = [...tableData, newRow]
    setTableData(newTableData)
    setSelectRow(newRow)
    setIsEditRows((prev) => [...prev, newRow.id])
  }
  //行-插入
  const onInsertRow = (record) => {
    if (tableData.length === 0 || !record) {
      onAddRow()
    } else {
      let index = tableData?.findIndex((e) => e.id === record?.id)
      if (index !== -1) {
        const newRow = {
          id: 'index_id_' + uuid(),
          summary: tableData[tableData?.length - 1]?.summary || '',
          accfullnameCode: '',
          authtype: 0,
          autobuild: 1,
          assistitems: null,
        }

        const newTableData = [...tableData.slice(0, index), newRow, ...tableData.slice(index)]
        setTableData(newTableData)
        setSelectRow(newRow)
        setIsEditRows((prev) => [...prev, newRow.id])
      } else {
        onAddRow()
      }
    }
  }
  // 行-删除
  const onDeleteRow = (record) => {
    if (record?.id) {
      const list = tableData.filter((e) => e.id !== record?.id)
      setTableData(list)
    } else {
      Message.error('请选择要删除的行！')
    }
  }
  // 行-编辑
  const onRowEdit = (record) => {
    if ([3, 4].includes(pageType?.id)) {
      setIsEditRows((prev) => (prev.includes(record.id) ? prev : [...prev, record.id]))
      // 延迟聚焦摘要输入框
      setTimeout(() => {
        const input = document.getElementById(`summary-${record.id}_input`)
        input && input.focus()
      }, 100)
    }
  }
  // 行-选择
  const onRowSelect = (record, e) => {
    // 排除干扰点击
    const targetElement = e?.target

    // 检查是否点击的是输入框或其相关元素
    const isInputClick = targetElement
      ? targetElement?.tagName === 'INPUT' ||
      targetElement?.tagName === 'TEXTAREA' ||
      targetElement?.closest('input') ||
      targetElement?.closest('textarea') ||
      targetElement?.classList.contains('arco-input') ||
      targetElement?.closest('.arco-input')
      : false

    const isCheckboxClick = targetElement
      ? targetElement?.classList.contains('arco-checkbox') ||
      targetElement?.classList.contains('arco-checkbox-input') ||
      targetElement?.closest('.arco-checkbox')
      : false

    // 排除输入框和复选框的点击
    if (isInputClick || isCheckboxClick) return

    // 防止重复点击同一行
    if (record?.id === selectRow?.id) return

    // 设置选中行
    setSelectRow(record)

    // 初始化辅助账表单数据
    const assistInfo = record?.assistitems
    if (assistInfo) {
      const updatedAssistItems = {
        ...assistInfo,
        direct: record?.borrow !== 0 ? 1 : 2,
        items: (assistInfo?.items || [])?.map((item) => ({
          ...item,
          codeName: item?.itemid ? `${item?.itemcode}-${item?.itemname}` : '',
        })),
      }
      assistForm.setFieldsValue(updatedAssistItems)
    } else {
      assistForm.resetFields()
    }
  }

  // 黏贴
  const onPaste = () => {
    const copyInfo = localGetItem('VOUCHER-COPYPASTE') || []
    const newData = copyInfo.map((e) => ({
      ...e,
      autobuild: 0,
    }))
    const ids = newData.map((e) => e.id)
    setIsEditRows((prev) => [...prev, ...ids])
    setTableData((prev) => {
      return [...newData, ...prev]
    })
  }
  // 获取附件数量
  const getFileCount = async () => {
    if (!sessionnoId) {
      return
    }
    const params = {
      groupid: voucherParams?.groupid,
      pid: voucherParams?.id || null,
      sessionno: sessionnoId,
    }
    const { code, data } = await Http.post('/file/counts', params)
    if (code === 200) {
      setPageProof((prev) => ({
        ...prev,
        attachs: data?.counts || 0,
      }))
    }
  }
  // 获取凭证号
  const getProofNumber = async () => {
    const params = {
      groupid: voucherParams?.groupid,
      year: voucherParams?.year,
      month: voucherParams?.month,
      catid: voucherParams?.catid,
    }
    const { code, data } = await Http.post('/proof/number', params)
    if (code === 200) {
      const vno = `记-${params.year}-${params.month}-${data?.reqno}`
      setPageProof((prev) => ({
        ...prev,
        vno,
        seqno: data?.reqno,
      }))
    }
  }
  // 新建凭证
  const getCreate = async () => {
    const { type, user_name, ...params } = voucherParams
    const stateInfo = stateList.find((item) => String(item.id) === String(type))
    setPageType(stateInfo)

    const item = {
      vtype: '记',
      range: `${params?.year}年${params?.month}期`,
      disabledDate: [
        dayjs(`${params?.year}-${params?.month}`).endOf('month').format('YYYY-MM-DD'), // 最后一天
        dayjs(`${params?.year}-${params?.month}`).startOf('month').format('YYYY-MM-DD'), // 第一天
      ],
      defaultStart: dayjs(`${params?.year}-${params?.month}`).format('YYYY-MM-DD'),
      attachs: 0,
      markername: user_name,
      year: params?.year,
      month: params?.month,
      catid: params?.catid,
    }

    setPageProof(item)
    pageForm.setFieldsValue(item)

    const UUID = uuid()
    setSessionId(UUID)

    getProofNumber()
    getFileCount()
  }
  // 页面状态改变
  const onEditType = (type) => {
    // 0新建 1查看 2编辑 3新建编辑
    const item = stateList[type]
    setPageType((prev) => ({
      ...prev,
      ...item,
    }))
  }
  // 锁定配置
  const onLock = () => {
    if (selectList.length === 0) {
      Message.warning('请至少选择一条分录')
    } else {
      let value = null
      Modal.confirm({
        title: null,
        icon: null,
        content: (
          <Form autoComplete='off' className='pt-4'>
            <Form.Item label='权限配置'>
              <Select
                placeholder='请选择'
                options={[
                  { label: '不锁定', value: '0' },
                  { label: '全部锁定', value: '1' },
                  { label: '金额锁定', value: '2' },
                  { label: '金额与科目锁定', value: '3' },
                ]}
                onChange={(e) => (value = e)}
              />
            </Form.Item>
          </Form>
        ),
        className: 'simpleModal',
        onOk: async () => {
          if (value !== null) {
            const params = {
              pid: pageProof.id,
              auth_type: value,
              eneidtrys: selectList,
            }
            const { code, message } = await Http.post('/proof/authtype/set', params)
            if (code !== 200) {
              Message.error(message || '锁定配置出错了')
            }
          } else {
            Message.warning('未选择权限配置')
          }
        },
      })
    }
  }
  // 复制
  const onCopy = (e) => {
    if (selectList.length === 0) {
      Message.warning('请至少选择一条分录')
    } else {
      const copyData = e === '2' ? tableData.map((item) => ({ ...item, borrow: '', loan: '' })) : [...tableData]
      localSetItem('VOUCHER-COPYPASTE', copyData, 30 * 24 * 60 * 60 * 1000) // 有效期30天
      const typeName = e === '2' ? '不带金额' : '带金额'
      Message.success(`${typeName}复制成功，数据有效期为30天`)
    }
  }
  // 页面数据
  const getPageInfo = async (id) => {
    setTableLoading(true)
    const { code, data } = await Http.post(`/proof/info/${id}`)
    if (code === 200) {
      let { proof, bill, ...rest } = data || {}

      setPageBill(bill)

      const stateInfo = stateList.find((item) => String(item.id) === String(voucherParams.type))
      setPageType(() => ({
        ...rest,
        ...stateInfo,
      }))

      const { entrys, ...restProof } = proof

      const newEntrys = entrys.map((item) => {
        return {
          ...item,
          accfullnameCode: `${item.acccode} ${item.accfullname}`,
        }
      })
      const values = newEntrys.reduce((acc, item) => {
        if (item?.id) {
          acc[`summary-${item.id}`] = item.summary
          acc[`accfullnameCode-${item.id}`] = item.accfullnameCode
          acc[`borrow-${item.id}`] = item.borrow
          acc[`loan-${item.id}`] = item.loan
        }
        return acc
      }, {})
      tableForm.setFieldsValue(values)
      setTableData(newEntrys || [])

      const key = tylelist.find((item) => String(item.id) == String(restProof.status)) || {}
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
    }

    setTableLoading(false)
  }
  // 表格行
  const EditableRow = (props) => {
    const { record, index, ...rest } = props
    const { setNodeRef, transform, transition } = useSortable({ id: record.id, index })

    return <tr index={index} {...rest} ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} />
  }
  // 拖拽元素
  const SortableItem = ({ id, children }) => {
    const { attributes, listeners } = useSortable({
      id,
    })

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
        return newItems
      })
    }
  }
  // 计算页面合计
  const getTotals = (vs) => {
    let totalBorrow = 0
    let totalLoan = 0

    Object.entries(vs || {}).forEach(([key, val]) => {
      if (key.startsWith('borrow-')) {
        totalBorrow += Number(val) || 0
      }
      if (key.startsWith('loan-')) {
        totalLoan += Number(val) || 0
      }
    })

    const totalBorrowStr = totalBorrow.toFixed(2)
    const totalLoanStr = totalLoan.toFixed(2)

    return {
      totalcn: numberToChinese(totalBorrowStr),
      total: totalBorrowStr,
      borrow: totalBorrowStr,
      loan: totalLoanStr,
    }
  }

  // 页面高度
  const pageHeightSum = useMemo(() => {
    let h = pageHeight
    if (voucherParams?.isdrawer === 1) {
      h = pageHeight + 108
    }
    return h - (isCollapsed ? 210 : 298)
  }, [isCollapsed, voucherParams?.isdrawer])

  // 滚动高度
  const scrollYSum = useMemo(() => {
    let h = pageHeight
    if (voucherParams?.isdrawer === 1) {
      h = pageHeight + 108
    }
    return h - 372
  }, [voucherParams?.isdrawer])

  // 页面默认执行，依赖 voucherParams
  useEffect(() => {
    setTableData([])
    setPageProof()
    setPageType()
    setPageBill()
    setSelectRow()
    setSelectList([])
    setIsEditRows([])

    pageForm.resetFields()
    assistForm.resetFields()
    tableForm.clearFields()

    if (voucherParams?.type) {
      const { id, type } = voucherParams
      if (type === 1) {
        getCreate()
      } else {
        getPageInfo(id)
      }
    }
  }, [voucherParams])

  return (
    <>
      <Layout>
        <Layout.Header className='flex items-center justify-between px-5 py-3'>
          <Space size='medium'>
            <div className='space-x-1 text-base'>{pageType?.name}凭证</div>
            <div className='space-x-1 text-base'>{pageProof?.vno}</div>
            {pageProof?.vno && pageType?.id !== 2 && <IconSync className='cursor-pointer text-base!' />}
            {![1, 4].includes(pageType?.id) && <Tag color={pageProof?.status_color}>{pageProof?.status_name}</Tag>}
            {pageType?.id === 2 && pageType?.is_cash_check && (
              <Button type='primary' size='mini' onClick={() => setVisibleCash(true)}>
                现金流量
              </Button>
            )}
          </Space>
          <Space className='pr-12'>
            {pageType?.id !== 2 && (
              <Space>
                <Button type='primary' status='success' size='small' onClick={() => submitBill(-1)}>
                  凭证暂存
                </Button>
                <Button type='primary' size='small' onClick={() => submitBill(0)}>
                  凭证保存
                </Button>
              </Space>
            )}

            {pageType?.id === 2 && (
              <Space>
                {[-1, 0, 2, 3].includes(pageProof?.status) && (
                  <Button type='primary' status='success' size='small' onClick={() => onEditType(2)}>
                    编辑
                  </Button>
                )}
                {pageProof?.status === 3 && (
                  <Button size='small' type='primary' onClick={() => onReview({ id: pageProof.id })}>
                    审核
                  </Button>
                )}
              </Space>
            )}

            {/* 是否是弹窗 */}
            {voucherParams?.isdrawer !== 1 && (
              <Button size='small' onClick={onBack}>
                {pageType?.id === 2 ? '返回' : '取消'}
              </Button>
            )}
          </Space>
        </Layout.Header>
        <Layout.Content className='relative'>
          {isCollapsed ? (
            <Tooltip content='向下折叠' position='bottom'>
              <div className='absolute -top-7.25 right-2.5 cursor-pointer rounded-t border border-b-0 border-neutral-200 px-3 text-xl text-blue-500'>
                <IconDoubleDown onClick={() => setIsCollapsed(false)} />
              </div>
            </Tooltip>
          ) : (
            <div className='relative flex justify-between border-t border-neutral-200 p-3 pb-1'>
              <Form
                layout='inline'
                size='small'
                autoComplete='off'
                form={pageForm}
                disabled={pageType?.id === 2}
                validateMessages={{ required: (_, { label }) => `${label}不能为空` }}>
                <Form.Item label='记账日期' field={'pdate'} rules={[{ required: true }]}>
                  <DatePicker
                    defaultPickerValue={pageProof?.defaultStart}
                    disabledDate={(e) =>
                      e.isAfter(dayjs(pageProof?.disabledDate[0])) || e.isBefore(dayjs(pageProof?.disabledDate[1]))
                    }
                  />
                </Form.Item>
                <Form.Item label='业务日期' field={'bdate'} rules={[{ required: true }]}>
                  <DatePicker
                    defaultPickerValue={pageProof?.defaultStart}
                    disabledDate={(e) =>
                      e.isAfter(dayjs(pageProof?.disabledDate[0])) || e.isBefore(dayjs(pageProof?.disabledDate[1]))
                    }
                  />
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
                  <Select options={['记']} className='w-32!' />
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

              <Tooltip content='向上折叠'>
                <div
                  className='absolute right-2.5 bottom-0 cursor-pointer rounded-t border border-b-0 border-neutral-200 px-3 text-xl text-blue-500'
                  onClick={() => setIsCollapsed(true)}>
                  <IconDoubleUp />
                </div>
              </Tooltip>
            </div>
          )}

          <div className='flex border border-neutral-200'>
            <div className='flex-1'>
              <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-2.5'>
                <div className='text-base'>分录</div>
                {/* 新建 */}
                {pageType?.id === 1 && (
                  <Space size='large'>
                    {buttonList.map((e) => (
                      <div
                        key={e.type}
                        className='flex cursor-pointer items-center gap-1 text-blue-600'
                        onClick={() => openBill(e)}>
                        <img src={e.icon} alt='' /> {e.name}
                      </div>
                    ))}
                  </Space>
                )}
                {/* 查看 */}
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
                        <Menu onClickMenuItem={(e) => onCopy(e)}>
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

                    {isAdmin && (
                      <Tooltip content='锁定配置'>
                        <Button type='text' size='small' onClick={() => onLock()}>
                          <IconLock />
                        </Button>
                      </Tooltip>
                    )}
                  </Space>
                )}
                {/* 编辑 & 新建编辑*/}
                {[3, 4].includes(pageType?.id) && (
                  <Space>
                    <Button.Group>
                      <Button type='primary' size='small' icon={<IconTag />}>
                        {pageBill?.modename}
                      </Button>
                      <Button type='outline' size='small'>
                        {pageBill?.sericnum}
                      </Button>
                      <Button type='primary' size='small' onClick={() => clearBill()}>
                        <IconClose />
                      </Button>
                    </Button.Group>

                    <Tooltip content='黏贴'>
                      <Button type='text' size='small' onClick={() => onPaste()}>
                        <IconPaste />
                      </Button>
                    </Tooltip>
                    <Tooltip content='新增'>
                      <Button type='text' size='small' onClick={() => onAddRow()}>
                        <IconPlus />
                      </Button>
                    </Tooltip>
                    <Tooltip content='插入'>
                      <Button type='text' size='small' onClick={() => onInsertRow(selectRow)}>
                        <IconImport />
                      </Button>
                    </Tooltip>
                    <Tooltip content='删除'>
                      <Button type='text' size='small' onClick={() => onDeleteRow(selectRow)}>
                        <IconClose />
                      </Button>
                    </Tooltip>
                  </Space>
                )}
              </div>

              {/* 表格 */}
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} coordinates={sortableKeyboardCoordinates}>
                <SortableContext items={tableData.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                  <Form autoComplete='off' form={tableForm} className='w-full' wrapperCol={{ span: 24 }}>
                    <Table
                      size='small'
                      rowKey={'id'}
                      border={false}
                      borderCell
                      pagination={false}
                      loading={tableLoading}
                      columns={columns}
                      data={tableData}
                      style={{ height: pageHeightSum }}
                      scroll={{ y: scrollYSum, x: true }}
                      rowClassName={(record) => {
                        const baseClass = 'h-15'
                        const selectedClass = record.id === selectRow?.id ? ' table-select' : ''
                        const editingClass = isEditRows.includes(record.id) ? ' table-edit' : ''
                        return baseClass + selectedClass + editingClass
                      }}
                      rowSelection={{
                        type: 'checkbox',
                        selectedRowKeys: selectList,
                        onChange: (e) => setSelectList(e),
                        renderCell: (originNode, _, record) =>
                          pageType?.id === 2 ? (
                            originNode
                          ) : (
                            <SortableItem id={record.id}>
                              <IconDragDotVertical className='cursor-move text-xl!' />
                            </SortableItem>
                          ),
                      }}
                      onRow={(record) => ({
                        onClick: (e) => onRowSelect(record, e),
                        onDoubleClick: () => onRowEdit(record),
                      })}
                      components={{
                        body: {
                          row: EditableRow,
                        },
                      }}
                    />
                    <Form.Item shouldUpdate noStyle>
                      {(values) => {
                        const totals = getTotals(values)
                        return (
                          <div className='flex justify-between border-t border-neutral-200 p-3'>
                            <div>
                              合计：
                              <span className='font-bold text-blue-600'>
                                {Number(totals.total) < 0 && '负'} {totals.totalcn || '零元整'}
                              </span>
                            </div>
                            <Space size='large'>
                              <div>
                                借方：<span className='font-bold text-blue-600'>{totals.borrow || '0.00'}</span>
                              </div>
                              <div>
                                贷方：<span className='font-bold text-blue-600'>{totals.loan || '0.00'}</span>
                              </div>
                            </Space>
                          </div>
                        )
                      }}
                    </Form.Item>
                  </Form>
                </SortableContext>
              </DndContext>
            </div>
            {tableData.length > 0 && (
              <div className='w-90 border-l border-neutral-200'>
                <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-3'>
                  <div className='text-base'>辅助账</div>
                  {isEditRows.includes(selectRow?.id) && selectRow?.assistitems?.items?.length > 0 && (
                    <Button type='primary' size='small' onClick={onSaveAssist}>
                      确定
                    </Button>
                  )}
                </div>
                {selectRow && selectRow?.assistitems?.items?.length > 0 ? (
                  <Form
                    form={assistForm}
                    size='small'
                    layout='vertical'
                    autoComplete='off'
                    style={{ height: pageHeightSum + 48 }}
                    className='overflow-y-auto p-4'
                    labelCol={{ style: { flexBasis: 110 } }}
                    wrapperCol={{ style: { flexBasis: `calc(100% - ${110}px)` } }}
                    validateMessages={{ required: (_, { label }) => `${label}不能为空` }}
                    disabled={!isEditRows.includes(selectRow?.id)}
                    onChange={(v, vs) => onChangeAssist(v, vs)}>
                    <Form.Item label='业务日期' field={'bdate'} rules={[{ required: true }]}>
                      <DatePicker className='w-full!' defaultPickerValue={pageProof?.defaultStart} />
                    </Form.Item>
                    <Form.Item label='方向' field={'direct'} rules={[{ required: true }]}>
                      <Radio.Group>
                        <Radio value={1}>借</Radio>
                        <Radio value={2}>贷</Radio>
                      </Radio.Group>
                    </Form.Item>
                    {selectRow?.isbj === 1 && (
                      <Form.Item label='到期日期' field={'edate'} rules={[{ required: true }]}>
                        <DatePicker className='w-full!' />
                      </Form.Item>
                    )}
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
                              <Form.Item
                                triggerPropName='checked'
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
                              <Form.Item
                                label='项目'
                                field={`project_off_set[${index}].projectname`}
                                rules={[{ required: true }]}>
                                <Input placeholder='请输入' />
                              </Form.Item>
                              <Form.Item
                                label='合同号'
                                field={`project_off_set[${index}].contractno`}
                                rules={[{ required: true }]}>
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

          <Form className='p-3' size='small' layout='inline' autoComplete='off' form={pageForm} disabled={pageType?.id === 2}>
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
              <Input placeholder='请输入' className='w-20!' disabled />
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
      <Drawer width={'50%'} title='附件清单' visible={visibleImg} footer={null} onCancel={() => setVisibleImg(false)}>
        <FileInfo
          fileParams={{
            ...pageProof,
            isdrawer: 1
          }}
          tableTyle={{ finish: false, ischeckout: pageProof?.ischeckout, status: pageProof?.status }}
          onCancel={(isSave) => isSave && getFileCount()}
        />
      </Drawer>

      {/* 账单 */}
      <Drawer
        visible={visibleBill}
        width={'80%'}
        title={billParams?.name + '单查询'}
        footer={null}
        onCancel={() => setVisibleBill(false)}>
        {visibleBill && <BillInfo billParams={billParams} onSelect={onBillEntry} />}
      </Drawer>

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
        {visibleAssist && (
          <AssistInfo assistParams={{ ...assistParams, groupid: voucherParams?.groupid }} onSelect={onAssistEntry} />
        )}
      </Drawer>
    </>
  )
}
export default VoucherInfo
