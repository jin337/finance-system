import CryptoJS from 'crypto-js'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

import {
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Image,
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
  Tabs,
  Tag,
  Timeline,
} from '@arco-design/web-react'
import {
  IconApps,
  IconCalendar,
  IconCheckCircle,
  IconDelete,
  IconDownload,
  IconEdit,
  IconExport,
  IconFile,
  IconFilePdf,
  IconPrinter,
  IconRecord,
  IconRedo,
  IconScan,
  IconSubscribeAdd,
  IconSync,
  IconUnorderedList,
  IconUpload,
} from '@arco-design/web-react/icon'

// 公共方法
import { downloadFile, formatNumber } from 'src/utils/common'
// 上传组件
import UploadModal from 'src/components/UploadModal'

import excel from 'src/assets/images/excel.png'
import pdf from 'src/assets/images/pdf.png'
import status from 'src/assets/images/status.png'
import world from 'src/assets/images/world.png'

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
  const [oaSelectForm] = Form.useForm()
  const navigate = useNavigate()
  const { currentCompany, pageHeight, account } = useSelector((state) => state.commonReducer)
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

  // 日志
  const [visibleLog, setVisibleLog] = useState(false)
  const [logInfo, setLogInfo] = useState({})

  // 附件补充
  const [visibleImg, setVisibleImg] = useState(false)
  const [showType, setShowType] = useState('list')

  const [sessionId, setSessionId] = useState('')

  const [imgInfo, setImgInfo] = useState({})
  const [tableImgData, setTableImgData] = useState([])
  const [tableImgLoading, setTableImgLoading] = useState(false)
  const [srcList, setSrcList] = useState([])
  const [selectImgList, setSelectImgList] = useState([])
  const [visibleViewImg, setVisibleViewImg] = useState([])
  const [uploadVisible, setUploadVisible] = useState(false)

  // oa审批
  const [visibleOA, setVisibleOA] = useState(false)
  const [oaTableData, setOATableData] = useState([])

  const [visibleOASelect, setVisibleOASelect] = useState(false)
  const [billType, setBillType] = useState([])

  const [columnsOASelect1Table, setColumnsOASelect1Table] = useState([])
  const [columnsOASelect2Table, setColumnsOASelect2Table] = useState([])
  const [oASelectId, setOASelectId] = useState()

  const columnsOASelect1 = [
    {
      title: '类别',
      dataIndex: 'modename',
    },
    {
      title: '单据号',
      dataIndex: 'sericnum',
    },
    {
      title: '摘要',
      dataIndex: 'summary',
    },
    {
      title: '金额',
      dataIndex: 'money',
    },
    {
      title: '发起人',
      dataIndex: 'optname',
    },
  ]
  const columnsOASelect2 = [
    {
      title: '类别',
      dataIndex: 'modename',
    },
    {
      title: '单据号',
      dataIndex: 'sericnum',
    },
    {
      title: '摘要',
      dataIndex: 'summary',
    },
    {
      title: '项目',
      dataIndex: 'projectname',
    },
    {
      title: '发起人',
      dataIndex: 'optname',
    },
  ]

  // 增加OA
  const onSelectOA = (record) => {
    Modal.confirm({
      title: '提示',
      content: '确定选择此条数据？',
      className: 'simpleModal',
      onOk: async () => {
        const params = {
          ...record,
          groupid: currentCompany.id,
          year: Number(searchData.year),
          month: Number(searchData.month),
          pid: imgInfo.id,
        }
        const { code, message } = await Http.post('/proof/bill/bind', params)
        if (code === 200) {
          setVisibleOASelect(false)
          setOASelectId()
          onOA()
        } else {
          Message.error(message || '绑定OA已审表单出错了')
        }
      },
    })
  }
  // 从OA中选择
  const onSearchOA = async (key) => {
    const value = oaSelectForm.getFieldsValue()
    const params = {
      ...value,
      entrytype: key,
      groupid: currentCompany.id,
    }
    const { code, data, message } = await Http.post('/proof/bill/search', params)
    if (code === 200) {
      const list = (data?.list || []).map((e, i) => ({ ...e, index_id: i }))
      if (key === 1) {
        setColumnsOASelect1Table(list)
        setColumnsOASelect2Table([])
      } else {
        setColumnsOASelect1Table([])
        setColumnsOASelect2Table(list)
      }
    } else {
      Message.error(message || '获取OA数据出错了')
    }
  }
  // 从OA选择审批单绑定
  const goToAllOA = async () => {
    const params = {
      entrytype: 1,
    }
    const { code, data, message } = await Http.post('/proof/bill/type', params)
    if (code === 200) {
      const list = (data?.list || []).map((e) => ({ ...e, label: e.name, value: e.code }))
      setBillType(list)
    } else {
      Message.error(message || '获取类别数据出错了')
    }
    oaSelectForm.resetFields()
    setColumnsOASelect1Table([])
    setColumnsOASelect2Table([])
    setVisibleOASelect(true)
  }
  // OA解绑
  const unBind = async (record) => {
    const params = {
      groupid: currentCompany.id,
      pid: record.pid,
      pbid: record.id,
    }
    const { code, message } = await Http.post('/proof/bill/unbind', params)
    if (code === 200) {
      Message.success('解绑成功')
      onOA()
    } else {
      Message.error(message || '解除OA已审表单绑定出错了')
    }
  }

  const columnsOA = [
    {
      title: '类别',
      dataIndex: 'modename',
      align: 'center',
      width: 220,
    },
    {
      title: '单据号',
      dataIndex: 'sericnum',
      align: 'center',
      width: 200,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 100,
      render: (_, record) =>
        !tableTyle.finish &&
        tableTyle.ischeckout !== 1 &&
        tableTyle.status !== 1 && (
          <Button size='mini' type='text' onClick={() => unBind(record)}>
            解绑
          </Button>
        ),
    },
  ]
  // 预览内容
  const openPreview = (record) => {
    if (['pdf', '.pdf'].includes(record.fileext)) {
      window.open(record.filepathtrans + '?token=' + account.token, '_blank')
    } else if (['xlsx', 'docx'].includes(record.fileext)) {
      window.open('/excel/view/' + record.id, '_blank')
    } else {
      setVisibleViewImg(true)
    }
  }

  const columnsImg = [
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'adddt',
      align: 'center',
      width: 120,
      render: (text) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '大小',
      dataIndex: 'filesizecn',
      align: 'center',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'filetype',
      align: 'center',
      width: 150,
    },
    {
      title: '操作人',
      dataIndex: 'optname',
      align: 'center',
      width: 100,
    },
    {
      title: '缩略图',
      dataIndex: 'filepaththumb',
      align: 'center',
      width: 130,
      render: (text, record) => {
        let url = text
        if (record.fileext === 'docx') {
          url = world
        }
        if (record.fileext === 'xlsx') {
          url = excel
        }
        if (record.fileext === 'pdf' || record.fileext === '.pdf') {
          url = pdf
        }
        return (
          <Image
            className={`h-8 w-8 border-neutral-200 ${['pdf', '.pdf', 'xlsx', 'docx'].includes(record.fileext) ? '' : 'border'}`}
            onClick={() => openPreview(record)}
            preview={false}
            src={url}
            width={32}
          />
        )
      },
    },
  ]

  // oa审批单数据
  const onOA = async () => {
    setOATableData([])
    setVisibleOA(true)

    const { code, data } = await Http.post(`/proof/bill/list/${imgInfo.id}`)
    if (code === 200) {
      const list = data?.list || []
      setOATableData(list)
    }
  }

  // 删除
  const deleteItem = () => {
    Modal.confirm({
      title: '警告',
      content: '请确认是否删除图片?',
      okButtonProps: {
        status: 'danger',
      },
      className: 'simpleModal',
      onOk: async () => {
        const params = {
          groupid: currentCompany?.id,
          filesid: selectImgList,
        }
        const { code } = await Http.post('/file/del', params)
        if (code === 200) {
          Message.success('删除成功')
          onImgInfo(imgInfo)
        } else {
          Message.error('删除失败')
        }
      },
    })
  }
  // 重命名
  const editName = () => {
    const name = tableImgData.find((item) => item.id === selectImgList[0]).name
    let currentRenameValue = name

    Modal.confirm({
      title: '警告',
      content: <Input type='text' defaultValue={name} onChange={(value) => (currentRenameValue = value)} />,
      okButtonProps: {
        status: 'danger',
      },
      className: 'simpleModal',
      onOk: async () => {
        const params = {
          groupid: currentCompany?.id,
          id: selectImgList[0],
          name: currentRenameValue, // 使用变量值
        }
        const { code } = await Http.post('file/rename', params)
        if (code === 200) {
          Message.success('重命名成功')
          onImgInfo(imgInfo)
        } else {
          Message.error('重命名失败')
        }
      },
    })
  }
  // 下载
  const downloadFiles = async () => {
    const files = []
    const list = selectImgList.map((e) => tableImgData.find((item) => item.id === e))
    if (list.length) {
      list.map((item) => {
        files.push(item.filepath + item.filename)
      })
    }
    const result = await Http.post('/file/download', { files }, { responseType: 'blob' })
    downloadFile(result, '财务凭证', 'zip')

    setSelectList([])
  }

  // 全选
  const checkAll = (e) => {
    if (e) {
      setSelectImgList(tableImgData.map((e) => e.id))
    } else {
      setSelectImgList([])
    }
  }

  // 附件清单
  const onImgInfo = async (record) => {
    setImgInfo(record)
    setTableImgLoading(true)
    setTableImgData([])
    setSelectImgList([])
    setSessionId()

    const timestamp = Date.now().toString()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const uuid = CryptoJS.MD5(timestamp + randomStr).toString()
    setSessionId(uuid)

    const params = {
      groupid: currentCompany.id,
      catid: menuSelect.catid,
      year: Number(searchData.year),
      month: Number(searchData.month),
      pid: record.id,
      sessionno: uuid,
    }

    const { code, data } = await Http.post('/file/list', params)
    if (code === 200) {
      const list = data?.list || []
      const imgList = list
        .filter((item) => !['xlsx', 'docx', 'pdf', '.pdf'].includes(item.fileext))
        .map((item) => item.filepathtrans)

      setTableImgData(list)
      setSrcList(imgList)
      setVisibleImg(true)
    }
    setTableImgLoading(false)
  }

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

  const onExamine = async (params) => {
    // 状态: 1审核通过 2审核未通过 5作废 0撤销 3提交
    const { code, message } = await Http.post('/proof/deal', params)
    if (code === 200) {
      changeTableData(tableData.page, tableData.pageSize, searchData)
    } else {
      Message.error(message || '审核出错')
    }
  }

  // 日志
  const onOpenLog = async (record) => {
    const { code, data } = await Http.post('/proof/log/' + record.id)
    if (code === 200) {
      setVisibleLog(true)
      const info = {
        ...record,
        list: data?.list || [],
      }
      setLogInfo(info)
    }
  }

  // 撤销
  const onReset = (record) => {
    let value = null
    Modal.info({
      title: '凭证处理',
      content: (
        <div className=''>
          <div className='mb-2'>操作意见：</div>
          <Input.TextArea onChange={(e) => (value = e)} />
        </div>
      ),
      okText: '撤销',
      className: 'simpleModal',
      onOk: () => {
        onExamine({ id: record.id, status: '0', remark: value })
      },
    })
  }

  // 作废
  const onOpenCancel = (record) => {
    Modal.confirm({
      title: '警告',
      content: '请确认是否作废该凭证?',
      className: 'simpleModal',
      onOk: () => {
        let value = null
        Modal.info({
          title: '凭证处理',
          content: (
            <div className=''>
              <div className='mb-2'>操作意见：</div>
              <Input.TextArea onChange={(e) => (value = e)} />
            </div>
          ),
          okText: '作废',
          className: 'simpleModal',
          onOk: () => {
            onExamine({ id: record.id, status: '5', remark: value })
          },
        })
      },
    })
  }

  // 删除
  const onDel = (record) => {
    Modal.confirm({
      title: '警告',
      content: '是否确认删除数据?',
      className: 'simpleModal',
      onOk: async () => {
        const { code, message } = await Http.post(`/proof/del/${record.id}`)
        if (code === 200) {
          Message.success('删除成功')
          changeTableData(tableData.page, tableData.pageSize, searchData)
        } else {
          Message.error(message || '删除失败')
        }
      },
    })
  }

  // 生成
  const onBuild = async (record) => {
    const { code, message } = await Http.post(`/proof/build/${record.id}`)
    if (code === 200) {
      Message.success('生成成功')
      changeTableData(tableData.page, tableData.pageSize, searchData)
    } else {
      Message.error(message || '凭证生成出错了')
    }
  }

  // 审核
  const onOpenExamine = (record) => {
    let value = null
    Modal.confirm({
      title: '凭证处理',
      content: (
        <div className=''>
          <div className='mb-2'>操作意见：</div>
          <Input.TextArea onChange={(e) => (value = e)} />
        </div>
      ),
      className: 'simpleModal',
      okText: '通过',
      cancelText: '不通过',
      onOk: () => {
        onExamine({ id: record.id, status: '1', remark: value })
      },
      onCancel: () => {
        onExamine({ id: record.id, status: '2', remark: value })
      },
    })
  }

  // 查看&&编辑&&新建
  const onOpenEditView = (type, record) => {
    // 1新建 2查看 3编辑
    navigate(`/voucher/detail/${record.id}`, { state: { type } })
  }

  // 提交
  const onSubmit = (record) => {
    let value = null
    Modal.info({
      title: '凭证处理',
      content: (
        <div className=''>
          <div className='mb-2'>操作意见：</div>
          <Input.TextArea onChange={(e) => (value = e)} />
        </div>
      ),
      okText: '提交',
      className: 'simpleModal',
      onOk: () => {
        onExamine({ id: record.id, status: '3', remark: value })
      },
    })
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
      width: 280,
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
      render: (text, record) => (
        <div className='cursor-pointer' onClick={() => onImgInfo(record)}>
          {text}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 80,
      render: (text) => {
        const item = buttonlist.find((e) => e.id === String(text))
        if (!item) return ''

        if (item?.id == -1) {
          return <Tag color={'red'}>{item.name}</Tag>
        } else {
          return <div style={{ color: item.color }}>{item.name}</div>
        }
      },
    },
    {
      title: '操作',
      dataIndex: 'name',
      width: 380,
      render: (_, record) => (
        <>
          {record.status === 0 && !tableTyle.finish && (
            <Button type='test' size='small' onClick={() => onSubmit(record)}>
              提交
            </Button>
          )}

          <Button type='test' size='small' onClick={() => onOpenEditView(2, record)}>
            查看
          </Button>

          {(record.status === -1 || record.status === 0 || record.status === 2 || record.status === 3) &&
            !tableTyle.finish &&
            record.ischeckout === '0' && (
              <Button type='test' size='small' onClick={() => onOpenEditView(3, record)}>
                编辑
              </Button>
            )}

          {(record.status === 2 || record.status === 3) &&
            !tableTyle.finish &&
            !(tableTyle.ischeckout === 1 && record.ischeckout === '0') && (
              <Button type='test' size='small' onClick={() => onOpenExamine(record)}>
                审核
              </Button>
            )}

          {record.isbuild === 0 && record.status === 1 && (
            <Button type='test' size='small' onClick={() => onBuild(record)}>
              生成
            </Button>
          )}

          {(((record.status === -1 || record.status === 0 || record.status === 2 || record.status === 5) &&
            !tableTyle.finish &&
            tableTyle.ischeckout === 0) ||
            (record.status !== 1 && tableTyle.ischeckout === 1 && record.ischeckout === '1' && !tableTyle.finish)) && (
            <Button type='test' size='small' onClick={() => onDel(record)}>
              删除
            </Button>
          )}

          {(record.status === 0 || record.status === 1 || record.status === 2) &&
            !tableTyle.finish &&
            !(tableTyle.ischeckout === 1 && record.ischeckout === '0') && (
              <Button type='test' size='small' onClick={() => onOpenCancel(record)}>
                作废
              </Button>
            )}

          {record.status === 1 && !tableTyle.finish && !(tableTyle.ischeckout === 1 && record.ischeckout === '0') && (
            <Button type='test' size='small' onClick={() => onReset(record)}>
              撤销
            </Button>
          )}

          <Button type='test' size='small' onClick={() => onOpenLog(record)}>
            日志
          </Button>
        </>
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
        pageSize: pageSize,
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
    <>
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
                      <Button
                        shape='round'
                        type='primary'
                        icon={<IconSubscribeAdd />}
                        onClick={() => onOpenEditView(1, { id: 'create' })}>
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
              pagination={{
                sizeCanChange: true,
                showTotal: true,
                pageSize: tableData.pageSize,
                current: tableData.page,
                total: tableData.total,
                bufferSize: 1,
                className: 'mr-3',
              }}
              onChange={changeTable}
              scroll={{ x: true, y: pageHeight - 216 }}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectList,
                onChange: (selectedRowKeys) => setSelectList(selectedRowKeys),
              }}
            />
          </Layout.Content>
        </Layout>
      </Layout>

      <Drawer width={600} title={logInfo?.vname} visible={visibleLog} footer={null} onCancel={() => setVisibleLog(false)}>
        <Timeline>
          {logInfo?.list?.map((item, index) => (
            <Timeline.Item
              key={item.id}
              label={item.remark || '无'}
              className='pb-4'
              dot={index === 0 && <IconRecord style={{ fontSize: '16px' }} />}
              lineType='dashed'>
              <Tag color='blue'>{item.action}</Tag>
              <div className='flex gap-4 pt-2'>
                <div>{item.uname}</div>
                <div className='text-gray-500'>{item.createdt}</div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
        {logInfo?.list?.length === 0 && <div className='text-gray-500'>暂无操作日志</div>}
      </Drawer>

      <Drawer width={'50%'} title='附件清单' visible={visibleImg} footer={null} onCancel={() => setVisibleImg(false)}>
        <Layout>
          <Layout.Header className='flex items-center justify-between border-b border-neutral-200 px-5 py-4'>
            {selectImgList.length > 0 ? (
              <Space size='large'>
                <Button shape='round' type='primary' icon={<IconCheckCircle />} onClick={onOA}>
                  OA审批单
                </Button>
                {imgInfo.status !== 1 && (
                  <>
                    <Button shape='round' type='secondary' status='danger' icon={<IconDelete />} onClick={deleteItem}>
                      删除
                    </Button>
                    {selectImgList.length === 1 && (
                      <Button shape='round' type='secondary' icon={<IconEdit />} onClick={editName}>
                        重命名
                      </Button>
                    )}
                  </>
                )}
                <Button shape='round' type='secondary' icon={<IconDownload />} onClick={downloadFiles}>
                  下载
                </Button>
              </Space>
            ) : (
              <Space size='large'>
                {imgInfo.status !== 1 && (
                  <>
                    <Button shape='round' type='primary' icon={<IconScan />} disabled>
                      扫描
                    </Button>
                    <Button shape='round' type='primary' icon={<IconUpload />} onClick={() => setUploadVisible(true)}>
                      上传
                    </Button>
                  </>
                )}
                <Button shape='round' type='primary' icon={<IconCheckCircle />} onClick={onOA}>
                  OA审批单
                </Button>
                <Button shape='round' type='outline' icon={<IconSync />} onClick={() => onImgInfo(imgInfo)}>
                  刷新
                </Button>
              </Space>
            )}

            <Button.Group>
              <Button
                type={showType === 'list' ? 'primary' : 'secondary'}
                icon={<IconApps />}
                onClick={() => setShowType('list')}></Button>
              <Button
                type={showType === 'table' ? 'primary' : 'secondary'}
                icon={<IconUnorderedList />}
                onClick={() => setShowType('table')}></Button>
            </Button.Group>
          </Layout.Header>
          <Layout.Content className='h-full overflow-auto'>
            {tableImgData.length > 0 ? (
              <>
                {showType === 'list' && (
                  <div className='flex flex-wrap'>
                    <div className='w-full border-b border-neutral-200 p-2 select-none'>
                      <Checkbox
                        checked={selectImgList.length === tableImgData.length}
                        indeterminate={selectImgList.length > 0 && tableImgData.length !== selectImgList.length}
                        onChange={checkAll}>
                        全选
                        <span className='ml-2 text-neutral-400'>
                          ({selectImgList.length}/{tableImgData.length})
                        </span>
                      </Checkbox>
                    </div>
                    <Checkbox.Group value={selectImgList} onChange={(values) => setSelectImgList(values)}>
                      {tableImgData.map((item) => {
                        let url = item.filepaththumb
                        if (item.fileext === 'docx') {
                          url = world
                        }
                        if (item.fileext === 'xlsx') {
                          url = excel
                        }
                        if (item.fileext === 'pdf' || item.fileext === '.pdf') {
                          url = pdf
                        }
                        return (
                          <Checkbox key={item.id} value={item.id}>
                            {({ checked }) => {
                              return (
                                <div
                                  className={`relative mt-5 flex w-29 cursor-pointer flex-col items-center gap-2 border border-white px-5 py-3 hover:border-blue-500 hover:bg-blue-100 ${checked ? 'border-blue-500! bg-blue-100' : ''}`}>
                                  <img className='h-17 w-17' src={url} onClick={() => openPreview(item)} />
                                  <div className='max-w-full truncate text-center'>{item.name}</div>
                                  <div className='text-xs text-neutral-400'>{item.filesizecn}</div>
                                </div>
                              )
                            }}
                          </Checkbox>
                        )
                      })}
                    </Checkbox.Group>
                  </div>
                )}
                {showType === 'table' && (
                  <Table
                    rowKey='id'
                    size='small'
                    border={{ wrapper: true, cell: true }}
                    loading={tableImgLoading}
                    data={tableImgData}
                    columns={columnsImg}
                    pagination={false}
                    scroll={{ y: pageHeight - 114 }}
                    rowSelection={{
                      type: 'checkbox',
                      selectedRowKeys: selectImgList,
                      onChange: (selectedRowKeys) => setSelectImgList(selectedRowKeys),
                    }}
                  />
                )}
              </>
            ) : (
              <Empty className='flex h-full items-center' description='暂无文件，请扫描或者上传' />
            )}
          </Layout.Content>
        </Layout>
      </Drawer>

      {/* 图片预览 */}
      <Image.PreviewGroup srcList={srcList} visible={visibleViewImg} onVisibleChange={setVisibleViewImg} />

      {/* 上传模态框 */}
      <UploadModal
        visible={uploadVisible}
        title={menuSelect.title + searchData.year + '年' + searchData.month + '月份上传'}
        params={{
          groupid: currentCompany?.id,
          year: Number(searchData.year),
          month: Number(searchData.month),
          catid: menuSelect.catid,
          sessionno: sessionId,
          pid: imgInfo.id,
        }}
        onOk={() => {
          setUploadVisible(false)
          onImgInfo(imgInfo)
        }}
        onCancel={() => setUploadVisible(false)}
      />

      {/* OA审批 */}
      <Drawer width={'100%'} title='OA审批单' visible={visibleOA} footer={null} onCancel={() => setVisibleOA(false)}>
        {!tableTyle.finish && tableTyle.ischeckout !== 1 && tableTyle.status !== 1 && (
          <div className='mb-3'>
            <Button type='primary' onClick={goToAllOA}>
              从OA选择审批单绑定
            </Button>
          </div>
        )}
        <Table
          rowKey='id'
          size='small'
          border={{ wrapper: true, cell: true }}
          columns={columnsOA}
          data={oaTableData}
          pagination={false}
        />
      </Drawer>
      {/* OA审批单据选择 */}
      <Drawer
        width={'100%'}
        title='OA审批单据选择'
        visible={visibleOASelect}
        closable={false}
        cancelText='返回'
        onOk={() => onSelectOA(oASelectId)}
        onCancel={() => setVisibleOASelect(false)}>
        <Tabs defaultActiveTab='1' justify>
          <Tabs.TabPane key='1' title='收付款类'>
            <Form
              form={oaSelectForm}
              layout='inline'
              labelCol={{ style: { flexBasis: 70 } }}
              wrapperCol={{ style: { flexBasis: `calc(100% - ${70}px)` } }}>
              <Form.Item label='单据号' field='searchvalue' className='w-1/3! flex-1'>
                <Input allowClear />
              </Form.Item>
              <Form.Item label='金额' field='entrymoney' className='w-1/3! flex-1'>
                <InputNumber
                  min={0}
                  max={1000000000}
                  prefix='¥'
                  allowClear
                  formatter={(value) => {
                    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }}
                />
              </Form.Item>
              <Form.Item label='类别' field='modecode' className='w-1/3! flex-1'>
                <Select options={billType} allowClear />
              </Form.Item>
              <Form.Item noStyle>
                <Button type='primary' onClick={() => onSearchOA(1)}>
                  查询
                </Button>
              </Form.Item>
            </Form>
            <Table
              rowKey='index_id'
              size='small'
              border={{ wrapper: true, cell: true }}
              columns={columnsOASelect1}
              data={columnsOASelect1Table}
              pagination={false}
              onRow={(record, index) => {
                return {
                  onDoubleClick: () => onSelectOA(record, index),
                  onClick: () => setOASelectId(record),
                }
              }}
              rowClassName={(record) => record.index_id === oASelectId?.index_id && 'table-select'}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key='3' title='出入库类'>
            <Form
              form={oaSelectForm}
              layout='inline'
              labelCol={{ style: { flexBasis: 70 } }}
              wrapperCol={{ style: { flexBasis: `calc(100% - ${70}px)` } }}>
              <Form.Item label='单据号' field='searchvalue' className='w-1/3! flex-1'>
                <Input />
              </Form.Item>
              <Form.Item label='类别' field='modecode' className='w-1/3! flex-1'>
                <Select options={billType} />
              </Form.Item>
              <Form.Item noStyle>
                <Button type='primary' onClick={() => onSearchOA(2)}>
                  查询
                </Button>
              </Form.Item>
            </Form>
            <Table
              rowKey='index_id'
              size='small'
              border={{ wrapper: true, cell: true }}
              columns={columnsOASelect2}
              data={columnsOASelect2Table}
              pagination={false}
              onRow={(record, index) => {
                return {
                  onDoubleClick: () => onSelectOA(record, index),
                  onClick: () => setOASelectId(record),
                }
              }}
              rowClassName={(record) => record.index_id === oASelectId?.index_id && 'table-select'}
            />
          </Tabs.TabPane>
        </Tabs>
      </Drawer>
    </>
  )
}
export default Voucher
