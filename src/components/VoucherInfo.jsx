import dayjs from 'dayjs'
import { createContext, useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const EditableContext = createContext({})

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
  Tree,
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
import CashInfo from 'src/components/CashInfo'
import FileInfo from 'src/components/FileInfo'
// 拖拽
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 公共方法
import { formatNumber, localGetItem, localSetItem, numberToChinese, uuid } from 'src/utils/common'

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
  return targetChar === 'X' || targetChar === '-' ? '' : targetChar || ''
}

// 获取有子项的key
const getChildrenId = (list, key) => {
  return list.reduce((acc, item) => {
    if (item.children && item.children.length > 1) {
      acc.push(item[key])
    }

    if (item.children && Array.isArray(item.children)) {
      acc = acc.concat(getChildrenId(item.children, key))
    }

    return acc
  }, [])
}

const VoucherInfo = ({ voucherParams, onBack, onReview }) => {
  const { pageHeight, isAdmin, currentCompany } = useSelector((state) => state.commonReducer)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const [pageForm] = Form.useForm()
  const [selectForm] = Form.useForm()

  const [pageProof, setPageProof] = useState()
  const [pageBill, setPageBill] = useState()
  const [pageType, setPageType] = useState()

  const [tableData, setTableData] = useState([])
  const [selectRow, setSelectRow] = useState()
  const [selectList, setSelectList] = useState([])
  const [isEditRows, setIsEditRows] = useState([])

  const [visibleCash, setVisibleCash] = useState(false)
  const [visibleImg, setVisibleImg] = useState(false)

  const [sessionnoId, setSessionId] = useState()
  const [billType, setBillType] = useState({})
  const [billList, setBillList] = useState([])
  const [visibleBill, setVisibleBill] = useState(false)
  const [billForm] = Form.useForm()

  const [visibleAccount, setVisibleAccount] = useState(false)
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountClassList, setAccountClassList] = useState([])
  const [accountList, setAccountList] = useState([])
  const [accountForm] = Form.useForm()
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState()
  const [selectRowAccount, setSelectRowAccount] = useState()

  const columns = [
    {
      title: '序号',
      dataIndex: 'order',
      width: 75,
      align: 'center',
      render: (text, record, index) => index + 1,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
    },
    {
      title: '科目',
      dataIndex: 'acccode',
      render: (text, record) => (record?.acccode ? record?.acccode + record?.accfullname : ''),
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
          width: 30,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.borrow <= 0 ? 'text-red-500' : ''}>{transNum(record?.borrow, 10)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 11
            }
            return obj
          },
        },
        {
          title: '千',
          dataIndex: 'borrow_9',
          className: 'row-money',
          width: 30,
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
          width: 30,

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
          width: 30,

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
          width: 30,

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
          width: 30,

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
          width: 30,

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
          width: 30,

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
          width: 30,

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
          width: 30,

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
          width: 30,

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
          width: 30,
          render: (_, record) => {
            const obj = {
              children: <span className={record?.loan <= 0 ? 'text-red-500' : ''}>{transNum(record?.loan, 10)}</span>,
              props: {},
            }
            if (isEditRows.includes(record.id)) {
              obj.props.colSpan = 11
            }
            return obj
          },
        },
        {
          title: '千',
          dataIndex: 'loan_9',
          className: 'row-money',
          width: 30,
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
          width: 30,
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
          width: 30,
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
          width: 30,
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
          width: 30,
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
          width: 30,
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
          width: 30,
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
          width: 30,
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
          width: 30,
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
          width: 30,
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

  // 会计科目选择
  const onSelectRowAccount = async (record) => {
    const { code, data } = await Http.post(`/account/${record.id}`)
    if (code === 200) {
      const { code, fullname, name, ...rest } = data
      const item = {
        ...selectRow,
        ...rest,
        acccode: code,
        accfullname: fullname,
        accname: name,
      }
      setSelectRow(item)
      setTableData((prev) => prev.map((e) => (e.id === selectRow.id ? item : e)))

      setVisibleAccount(false)
    }
  }
  // 会计科目勾选项监控
  const onChangeAccount = (v, vs) => {
    const key = Object?.keys(v)[0]
    if (key === 'open') {
      const keys = getChildrenId(accountList, 'id')
      setExpandedRowKeys(vs?.open ? keys : [])
    } else {
      getAccountList(selectedKeys)
    }
  }

  // 展开关闭
  const onExpand = (e, expanded) => {
    setExpandedRowKeys((prev) => (expanded ? [...prev, e.id] : prev.filter((id) => id !== e.id)))
  }
  // 会计科目
  const getAccountList = async (classid) => {
    if (classid !== 0) {
      accountForm.setFieldValue('open', false)
      setAccountLoading(true)
      setSelectedKeys(classid)
      setExpandedRowKeys([])

      const values = accountForm.getFields()
      const params = {
        classid: classid,
        haslevel: values?.haslevel ? '1' : '0',
        isuse: values?.isuse ? '1' : null,
      }
      const { code, data } = await Http.post('/account/list', params)
      if (code === 200) {
        const list = data?.list || []
        setAccountList(list)
      }
      setAccountLoading(false)
    }
  }
  // 会计类别
  const openAccount = async (record) => {
    const { code, data } = await Http.post(`/account/class/list`)
    if (code === 200) {
      const list = data.list || []
      const treeData = [
        {
          id: 0,
          name: currentCompany.shortname,
          children: list,
        },
      ]
      setAccountClassList(treeData)

      accountForm.setFieldValue('haslevel', true)
      const key = record?.classid ? record?.classid : list[0].id
      getAccountList(key)

      setSelectRowAccount()
      setTimeout(() => {
        setVisibleAccount(true)
      }, 200)
    }
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
  // 表格行
  const EditableRow = (props) => {
    const { record, index, ...rest } = props
    const [newData, setNewData] = useState({})
    // 保存行和编辑行的函数
    const onSaveRow = () => {
      const item = { ...record, ...newData }
      setTableData((prev) => prev.map((e) => (e.id === item?.id ? item : e)))
      setIsEditRows((prev) => prev.filter((e) => e !== item.id))
    }
    // 修改数据
    const changeEdit = (key, e) => {
      setNewData((prev) => ({
        ...prev,
        [key]: e,
      }))
    }

    const { setNodeRef, transform, transition } = useSortable({
      id: record.id,
      index,
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      userSelect: 'none',
    }

    return (
      <EditableContext.Provider value={{ onSaveRow, changeEdit }}>
        <tr index={index} {...rest} ref={setNodeRef} style={style} />
      </EditableContext.Provider>
    )
  }

  // 单元格
  const EditableCell = (props) => {
    const { children, className, rowData, column } = props
    const { onSaveRow, changeEdit } = useContext(EditableContext)
    // 取消行
    const onRemoveRow = () => {
      const isTemporaryId = rowData?.id && typeof rowData.id === 'string' && rowData.id.includes('index_id_')

      if (isTemporaryId) {
        onDeleteRow(rowData)
      } else {
        setIsEditRows((prev) => prev.filter((e) => e !== rowData.id))
      }
    }

    if (isEditRows.includes(rowData.id)) {
      // 序号
      if (column.dataIndex === 'order') {
        return (
          <Space>
            <IconCheck className='text-xl! text-blue-600!' onClick={() => onSaveRow()} />
            <IconClose className='text-xl! text-red-600!' onClick={() => onRemoveRow()} />
          </Space>
        )
      }
      // 摘要
      if (column.dataIndex === 'summary') {
        // autoFocus
        return <Input defaultValue={rowData[column.dataIndex]} onChange={(e) => changeEdit(column.dataIndex, e)} />
      }
      // 科目
      if (column.dataIndex === 'acccode' && [0, 2].includes(rowData?.authtype)) {
        return (
          <div className='flex items-center gap-2'>
            <Input.TextArea
              defaultValue={rowData[column.dataIndex] ? rowData[column.dataIndex] + rowData?.accfullname : ''}
              className='flex-1'
              onChange={(e) => changeEdit(column.dataIndex, e)}
            />
            <IconMore className='text-xl!' onClick={() => openAccount(rowData)} />
          </div>
        )
      }
      // 借方
      if (column.dataIndex === 'borrow_10') {
        const key = column.dataIndex.split('_')[0]
        // const direct = rowData?.assistitems?.direct

        return <Input defaultValue={rowData[key] || ''} onChange={(e) => changeEdit(key, e)} />
      }
      // 贷方
      if (column.dataIndex === 'loan_10') {
        const key = column.dataIndex.split('_')[0]
        // const direct = rowData?.assistitems?.direct

        return <Input defaultValue={rowData[key] || ''} onChange={(e) => changeEdit(key, e)} />
      }
    }
    return <div className={className}>{children}</div>
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

  // 保存&暂存
  const submitBill = async (type) => {
    // -1 暂存凭证 0凭证保存
    const values = await pageForm.validate()

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

    const url = voucherParams?.id ? '/proof/update' : '/proof/new'
    const params = {
      groupid: voucherParams.groupid, // 机构id
      year: voucherParams.year, // 年
      month: voucherParams.month, // 月
      catid: voucherParams.catid, // 目录id
      bdate: values.bdate, // 业务日期
      pdate: values.pdate, // 记账日期
      vtype: values.vtype, // 凭证类型
      rmsg: values.rmsg, // 参考信息
      attachs: values.attachs, // 附件张数
      isrelatetrans: values.isrelatetrans ? 1 : 0, // 是否关联
      markername: values.markername, // 制单人
      chargename: values.chargename, // 会计主管
      checkername: values.checkername, // 审核人
      bookkeepername: values.bookkeepername, // 记账人
      cashiername: values.cashiername, // 出纳人
      seqno: pageProof.seqno, // 凭证序号
      vno: pageProof.vno, // 凭证号
      borrow: Number(pageProof.borrow), // 借方合计
      loan: Number(pageProof.loan), // 贷方合计
      total: Number(pageProof.total), // 合计
      totalcn: pageProof.totalcn, // 合计中文
      stocktype: pageProof.stocktype, // 出入库类型 0=非出入库凭证1=入库2=出库
      stockpzid: pageProof.stockpzid, // 出入库关联凭证
      sessionno: sessionnoId,
      bill: pageBill,
      entrys: tableData, // 分录信息
      fileids: fileids, // 已上传文件id列表
      isdraft: type,
    }
    if (voucherParams?.id) {
      params.id = voucherParams.id
    }

    const { code: Billcode, data: Billdata, message } = await Http.post(url, params)
    if (Billcode === 200) {
      onEditType(1)
      //新增
      if (voucherParams.type === 1) {
        getPageInfo(Billdata.pid)
      } else {
        getPageInfo(voucherParams.id)
      }
    } else {
      Message.error(message || '新增凭证出错了')
    }
  }

  // 保存辅助账
  const onSaveRowAssistitems = (record) => {
    if (record.direct === 1) {
      record.borrow = record.money
      record.loan = 0
    }
    if (record.direct === 2) {
      record.borrow = 0
      record.loan = record.money
    }
    setSelectRow(record)
    setTableData((prev) => [...prev].map((e) => (e.id === record.id ? record : e)))
  }
  //行-新增
  const onAddRow = () => {
    const id = 'index_id_' + uuid()
    const newRow = {
      id,
      summary: tableData[tableData?.length - 1]?.summary || '',
      authtype: 0,
    }
    const newTableData = [...tableData, newRow]
    setTableData(newTableData)
    setSelectRow(newRow)
    setIsEditRows((prev) => [...prev, id])
  }
  //行-插入
  const onInsertRow = (record) => {
    if (tableData.length === 0 || !record) {
      onAddRow()
    } else {
      let index = tableData?.findIndex((e) => e.id === record?.id)
      if (index !== -1) {
        const id = 'index_id_' + uuid()
        const newRow = {
          id,
          summary: tableData[index]?.summary || '',
          authtype: 0,
        }

        const newTableData = [...tableData.slice(0, index), newRow, ...tableData.slice(index)]
        setTableData(newTableData)
        setSelectRow(newRow)
        setIsEditRows((prev) => [...prev, id])
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
      setIsEditRows((prev) => [...prev, record.id])
    }
  }
  // 行-选择
  const onRowSelect = (e, record) => {
    const targetElement = e.target
    const isCheckboxClick =
      targetElement.classList.contains('arco-checkbox') ||
      targetElement.classList.contains('arco-checkbox-input') ||
      targetElement.closest('.arco-checkbox')
    // 排除干扰点击

    if (!isCheckboxClick) {
      selectForm.resetFields()
      setSelectRow(() => {
        const item = record?.assistitems
        if (item) {
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
              ...record,
              assistitems: item,
            })
          })
        }

        return record
      })
    }
  }
  // 黏贴
  const onPaste = () => {
    const copyInfo = localGetItem('VOUCHER-COPYPASTE') || []
    const ids = copyInfo.map((e) => e.id)
    setIsEditRows((prev) => [...prev, ...ids])
    setTableData((prev) => {
      return [...copyInfo, ...prev]
    })
  }
  // 提交选择账单
  const onEntry = async (params) => {
    const { code, data, message } = await Http.post('/bill/entry', params)
    if (code === 200) {
      const { bill, entrys } = data
      setPageBill(bill)
      const entrysTable = entrys.map((e, i) => ({ ...e, id: 'index_id_' + i }))
      setTableData(entrysTable)

      onEditType(3)
      setVisibleBill(false)
    } else {
      Message.error(message)
    }
  }
  // 提交数据处理
  const onSelectEntry = (record) => {
    Modal.confirm({
      title: '提示',
      content: '确定选择此条数据？',
      className: 'simpleModal',
      onOk: () => {
        const params = {
          year: voucherParams.year,
          month: voucherParams.month,
          groupid: voucherParams.groupid,
          sericnum: record.sericnum,
          billid: record.billid,
          modeid: record.modeid,
          modecode: record.modecode,
          modetable: record.modetable,
          entrytype: billType?.type,
          brachtype: record?.brachtype || null,
          brachflag: [0, 1].includes(record.brachflag) ? record.brachflag : '',
        }
        if (billType?.type === 1 && record.brachtype === 1) {
          Modal.confirm({
            title: '提示',
            content: (
              <Radio.Group onChange={(e) => (params.brachtype = e)}>
                <Radio value={1}>发放</Radio>
                <Radio value={2}>计提</Radio>
              </Radio.Group>
            ),
            className: 'simpleModal',
            onOk: () => {
              onEntry(params)
            },
            onCancel: () => {
              params.brachtype = record.brachtype
            },
          })
        } else {
          onEntry(params)
        }
      },
    })
  }
  // 获取账单列表
  const getBillList = async (item) => {
    const params = {
      groupid: voucherParams?.groupid,
      entrytype: item?.type || billType?.type,
      summary: item?.summary || '',
      entrymoney: item?.entrymoney || null,
      modecode: item?.modecode || null,
      pid: item?.pid || null,
    }
    const { code, data } = await Http.post('/bill/list', params)
    if (code === 200) {
      const list = data?.list || []
      setBillList(list)
    }
  }
  // 获取账单类型
  const getBillType = async (item) => {
    setBillType({})
    billForm.resetFields()

    if (item.type === 'add') {
      onEditType(3)
      setPageBill({
        sericnum: '无引单',
        modename: '手动录入',
      })

      onAddRow()
    } else {
      const params = {
        entrytype: item.type,
      }
      const { code, data } = await Http.post('/bill/type', params)
      if (code === 200) {
        const list = (data?.list || []).map((e) => ({ ...e, label: e.name, value: e.code }))
        setBillType({
          list,
          ...item,
        })

        getBillList(item)

        setVisibleBill(true)
      }
    }
  }
  // 类别切换
  const onCahengBill = (v, vs) => {
    const key = Object.keys(v)[0]
    if (key === 'modecode') {
      getBillList(vs)
    }
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

  // 删除已存在的账单
  const clearBill = () => {
    setPageBill()
    onEditType(0)
    setTableData([])
    setSelectRow()
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
      const key = buttonlist.find((item) => String(item.id) == String(restProof.status)) || {}
      const itemProof = {
        ...restProof,
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

      setTableData(entrys || [])
    }
  }

  // 监控表格-计算合计
  useEffect(() => {
    const totalBorrow = tableData.reduce((acc, item) => acc + Number(item.borrow) || 0, 0).toFixed(2)
    const totalLoan = tableData.reduce((acc, item) => acc + Number(item.loan) || 0, 0).toFixed(2)
    const totalcn = numberToChinese(totalBorrow)

    setPageProof((prev) => ({
      ...prev,
      totalcn,
      total: totalBorrow,
      borrow: totalBorrow,
      loan: totalLoan,
    }))
  }, [tableData])

  useEffect(() => {
    setTableData([])
    setPageProof()
    setPageType()
    setPageBill()
    setSelectRow()
    setSelectList([])
    setIsEditRows([])

    pageForm.resetFields()
    selectForm.resetFields()

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
              <>
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
              </>
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
                        onClick={() => getBillType(e)}>
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
                  <Table
                    size='small'
                    rowKey={'id'}
                    border={false}
                    borderCell
                    pagination={false}
                    columns={columns}
                    data={tableData}
                    style={{ height: pageHeight - (isCollapsed ? 210 : 298) }}
                    scroll={{ y: pageHeight - 372 }}
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
                      onChange: (selectedRowKeys) => setSelectList(selectedRowKeys),
                      renderCell: (originNode, _, record) =>
                        pageType?.id === 2 ? (
                          originNode
                        ) : (
                          <SortableItem id={record.id}>
                            <IconDragDotVertical className='cursor-move text-xl!' />
                          </SortableItem>
                        ),
                    }}
                    onRow={(record) => {
                      return {
                        onClick: (e) => onRowSelect(e, record),
                        onDoubleClick: () => onRowEdit(record),
                      }
                    }}
                    components={{
                      body: {
                        row: EditableRow,
                        cell: EditableCell,
                      },
                    }}
                  />
                </SortableContext>
              </DndContext>
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
            <div className='w-90 border-l border-neutral-200'>
              <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-3'>
                <div className='text-base'>辅助账</div>
                {isEditRows.includes(selectRow?.id) && selectRow?.assistitems?.items?.length > 0 && (
                  <Button type='primary' size='small' onClick={() => onSaveRowAssistitems(selectForm.getFields())}>
                    确定
                  </Button>
                )}
              </div>
              {selectRow && selectRow?.assistitems?.items?.length > 0 ? (
                <Form
                  form={selectForm}
                  size='small'
                  layout='vertical'
                  autoComplete='off'
                  className='p-4'
                  labelCol={{ style: { flexBasis: 110 } }}
                  wrapperCol={{ style: { flexBasis: `calc(100% - ${110}px)` } }}
                  validateMessages={{ required: (_, { label }) => `${label}不能为空` }}
                  disabled={!isEditRows.includes(selectRow?.id)}>
                  <Form.Item label='业务日期' field={'assistitems.bdate'} rules={[{ required: true }]}>
                    <DatePicker className='w-full!' defaultPickerValue={pageProof?.defaultStart} />
                  </Form.Item>
                  <Form.Item label='方向' field={'assistitems.direct'} rules={[{ required: true }]}>
                    <Radio.Group>
                      <Radio value={1}>借</Radio>
                      <Radio value={2}>贷</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    label='到期日期'
                    field={'assistitems.edate'}
                    rules={[{ required: true }]}
                    hidden={selectRow?.isbj !== 1}>
                    <DatePicker className='w-full!' />
                  </Form.Item>
                  <Form.Item label='本位币金额' field={'assistitems.money'} rules={[{ required: true }]}>
                    <InputNumber prefix='¥' allowClear />
                  </Form.Item>
                  <Form.Item shouldUpdate noStyle>
                    {(values) => {
                      return values?.assistitems?.items?.map((item, index) => (
                        <Form.Item key={index} label={item.typename} field={`assistitems.items[${index}].value`}>
                          <Input placeholder='请输入' />
                        </Form.Item>
                      ))
                    }}
                  </Form.Item>
                  <Form.Item label='摘要' field={'assistitems.summary'} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
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
                              field={`assistitems.project_off_set[${index}].id`}>
                              <Checkbox>冲抵项目款</Checkbox>
                            </Form.Item>
                            <Form.Item
                              label='供应商'
                              field={`assistitems.project_off_set[${index}].suppliername`}
                              rules={[{ required: true }]}>
                              <Input placeholder='请输入' />
                            </Form.Item>
                            <Form.Item
                              label='项目'
                              field={`assistitems.project_off_set[${index}].projectname`}
                              rules={[{ required: true }]}>
                              <Input placeholder='请输入' />
                            </Form.Item>
                            <Form.Item
                              label='合同号'
                              field={`assistitems.project_off_set[${index}].contractno`}
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
      <FileInfo
        visible={visibleImg}
        fileParams={pageProof}
        tableTyle={{ finish: false, ischeckout: pageProof?.ischeckout, status: pageProof?.status }}
        onCancel={() => {
          setVisibleImg(false)
        }}
      />

      {/* 账单 */}
      <Drawer
        visible={visibleBill}
        width={'80%'}
        title={billType?.name + '单查询'}
        footer={null}
        onCancel={() => setVisibleBill(false)}>
        <Form layout='inline' size='small' autoComplete='off' form={billForm} onChange={onCahengBill}>
          <Form.Item label='关键字' field={'summary'}>
            <Input placeholder='请输入关键字' />
          </Form.Item>
          <Form.Item label='金额' field={'entrymoney'}>
            <InputNumber placeholder='请输入金额' prefix='¥' />
          </Form.Item>
          <Form.Item label='类别' field={'modecode'}>
            <Select
              allowClear
              placeholder='请选择类别'
              options={billType?.list || []}
              style={{ width: '180px' }}
              triggerProps={{
                autoAlignPopupWidth: false,
                autoAlignPopupMinWidth: true,
                position: 'bl',
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type='primary' onClick={() => getBillList(billForm.getFields())}>
              查询
            </Button>
          </Form.Item>
        </Form>
        <Table
          className='mt-1'
          size='small'
          rowKey={'id'}
          border
          borderCell
          pagination={false}
          scroll={{ y: pageHeight - 44 }}
          columns={[
            { title: '类别', dataIndex: 'modename', width: 200 },
            { title: '业务日期', dataIndex: 'bdate', width: 120 },
            { title: '单据号', dataIndex: 'sericnum', width: 190 },
            { title: '摘要', dataIndex: 'summary' },
            {
              title: '金额',
              dataIndex: 'money',
              width: 140,
              render: (text) => <div className='text-right'>{formatNumber(text)}</div>,
            },
            { title: '发起人', dataIndex: 'optname', width: 80 },
          ]}
          data={billList}
          onRow={(record) => {
            return {
              onDoubleClick: () => onSelectEntry(record),
            }
          }}
        />
      </Drawer>

      {/* 会计科目 */}
      <Drawer visible={visibleAccount} width={'52%'} title='会计科目选择' footer={null} onCancel={() => setVisibleAccount(false)}>
        <Layout>
          <Layout.Sider width={200} className='pr-4! shadow-none!'>
            {accountClassList?.length > 0 && (
              <Tree
                blockNode
                defaultExpandedKeys={['0']}
                selectedKeys={[selectedKeys]}
                fieldNames={{
                  key: 'id',
                  title: 'name',
                }}
                treeData={accountClassList}
                onSelect={(e) => getAccountList(e[0])}
              />
            )}
          </Layout.Sider>
          <Layout>
            <Layout.Header>
              <Form layout='inline' size='small' autoComplete='off' form={accountForm} onChange={onChangeAccount}>
                <Form.Item field={'haslevel'} triggerPropName='checked'>
                  <Checkbox>包含下级节点</Checkbox>
                </Form.Item>
                <Form.Item field={'open'} triggerPropName='checked'>
                  <Checkbox>全部展开</Checkbox>
                </Form.Item>
                <Form.Item field={'isuse'} triggerPropName='checked'>
                  <Checkbox>常用科目</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type='primary' onClick={() => onSelectRowAccount(selectRowAccount)}>
                    确认选择
                  </Button>
                </Form.Item>
              </Form>
            </Layout.Header>
            <Layout.Content>
              <Table
                size='small'
                rowKey={'id'}
                border
                borderCell
                columns={[
                  { title: '编码', dataIndex: 'code' },
                  { title: '名称', dataIndex: 'name' },
                  { title: '助记码', dataIndex: 'mmcode', width: 100 },
                  { title: '余额方向', dataIndex: 'direct', width: 90 },
                  { title: '辅助账', dataIndex: 'assist' },
                ]}
                data={accountList}
                pagination={false}
                onExpand={onExpand}
                loading={accountLoading}
                expandedRowKeys={expandedRowKeys}
                scroll={{ y: pageHeight - 40 }}
                rowClassName={(record) => record.id === selectRowAccount?.id && 'table-select'}
                onRow={(record) => {
                  return {
                    onClick: () => setSelectRowAccount(record),
                    onDoubleClick: () => onSelectRowAccount(record),
                  }
                }}
              />
            </Layout.Content>
          </Layout>
        </Layout>
      </Drawer>
    </>
  )
}
export default VoucherInfo
