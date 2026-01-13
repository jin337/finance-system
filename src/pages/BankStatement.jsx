import {
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Image,
  Input,
  Layout,
  Menu,
  Message,
  Modal,
  Space,
  Table,
} from '@arco-design/web-react'
import {
  IconApps,
  IconCalendar,
  IconDelete,
  IconDownload,
  IconEdit,
  IconExport,
  IconScan,
  IconSync,
  IconUnorderedList,
  IconUpload,
} from '@arco-design/web-react/icon'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router'

import { downloadFile } from 'src/utils/common'

import status from 'src/assets/images/status.png'

import excel from 'src/assets/images/excel.png'
import pdf from 'src/assets/images/pdf.png'
import world from 'src/assets/images/world.png'
import zip from 'src/assets/images/zip.png'

// 上传组件
import UploadModal from 'src/components/UploadModal'

const BankStatement = () => {
  const location = useLocation()
  const { account, currentCompany, pageHeight } = useSelector((state) => state.commonReducer)
  const { menuSelect } = useSelector((state) => state.homeReducer)
  const [rangeValue, setRangeValue] = useState({})
  const [monthList, setMonthList] = useState([])

  const [showType, setShowType] = useState('list')
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState([])

  const [visible, setVisible] = useState(false)
  const [srcList, setSrcList] = useState([])
  const [selectList, setSelectList] = useState([])

  const [uploadVisible, setUploadVisible] = useState(false)

  // 预览内容
  const openPreview = (record) => {
    if (['pdf', '.pdf'].includes(record.fileext)) {
      window.open(record.filepathtrans + '?token=' + account.token, '_blank')
    } else if (['xlsx', 'docx'].includes(record.fileext)) {
      window.open('/excel/view/' + record.id, '_blank')
    } else if (['zip', 'rar'].includes(record.fileext)) {
      Modal.confirm({
        title: '提示',
        content: '压缩文件预览,请先下载文件,是否继续?',
        className: 'simpleModal',
        okText: '下载',
        onOk: async () => {
          const files = [record.filepath + record.filename]
          const result = await Http.post('/file/download', { files }, { responseType: 'blob' })
          const title = record.title.split('.')[0]
          downloadFile(result, title, 'zip')
        },
      })
    } else {
      setVisible(true)
    }
  }

  const columns = [
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
        if (record.fileext === 'zip' || record.fileext === 'rar') {
          url = zip
        }
        return (
          <Image
            className={`h-8 w-8 border-neutral-200 ${['pdf', '.pdf', 'xlsx', 'docx', 'rar', 'zip'].includes(record.fileext) ? '' : 'border'}`}
            onClick={() => openPreview(record)}
            preview={false}
            src={url}
            width={32}
          />
        )
      },
    },
  ]

  // 生成财务报表
  const buildTable = async () => {
    setTableLoading(true)
    const params = {
      groupid: currentCompany?.id,
      year: rangeValue.year,
      month: rangeValue.month,
      catid: menuSelect.catid,
    }
    const { code } = await Http.post('/report/build', params)
    if (code === 200) {
      Message.success('生成成功')
      onSelectMonth(rangeValue.month, rangeValue.year)
    } else {
      Message.error('生成失败')
    }
    setTableLoading(false)
  }

  // 全选
  const checkAll = (e) => {
    if (e) {
      setSelectList(tableData.map((item) => item.id))
    } else {
      setSelectList([])
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
          filesid: selectList,
        }
        const { code } = await Http.post('/file/del', params)
        if (code === 200) {
          Message.success('删除成功')
          onSelectMonth(rangeValue.month, rangeValue.year)
        } else {
          Message.error('删除失败')
        }
      },
    })
  }
  // 重命名
  const editName = () => {
    const name = tableData.find((item) => item.id === selectList[0]).name
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
          id: selectList[0],
          name: currentRenameValue, // 使用变量值
        }
        const { code } = await Http.post('file/rename', params)
        if (code === 200) {
          Message.success('重命名成功')
          onSelectMonth(rangeValue.month, rangeValue.year)
        } else {
          Message.error('重命名失败')
        }
      },
    })
  }
  // 下载
  const downloadFiles = async () => {
    const files = []
    const list = selectList.map((e) => tableData.find((item) => item.id === e))
    if (list.length) {
      list.map((item) => {
        files.push(item.filepath + item.filename)
      })
    }
    const result = await Http.post('/file/download', { files }, { responseType: 'blob' })
    downloadFile(result, menuSelect.title, 'zip')

    setSelectList([])
  }

  // 月份切换
  const onSelectMonth = async (value, year) => {
    setSelectList([])
    setRangeValue((prev) => ({ ...prev, month: value }))

    setTableLoading(true)
    const params = {
      catid: menuSelect.catid,
      groupid: currentCompany?.id,
      year: Number(year),
      month: Number(value),
      sessionno: null,
      pid: null,
    }

    const { code, data } = await Http.post('/file/list', params)
    if (code === 200) {
      const list = data?.list || []
      const imgList = list
        .filter((item) => !['xlsx', 'docx', 'pdf', '.pdf', 'rar', 'zip'].includes(item.fileext))
        .map((item) => item.filepathtrans)
      setTableData(list)
      setSrcList(imgList)
    }

    setTimeout(() => {
      setTableLoading(false)
    }, 200)
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
  }, [currentCompany, location.pathname])

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
        <Layout>
          <Layout.Header className='flex items-center justify-between border-b border-neutral-200 px-5 py-4'>
            {selectList.length > 0 ? (
              <Space size='large'>
                <Button shape='round' type='secondary' status='danger' icon={<IconDelete />} onClick={deleteItem}>
                  删除
                </Button>
                {selectList.length === 1 && (
                  <Button shape='round' type='secondary' icon={<IconEdit />} onClick={editName}>
                    重命名
                  </Button>
                )}
                <Button shape='round' type='secondary' icon={<IconDownload />} onClick={downloadFiles}>
                  下载
                </Button>
              </Space>
            ) : (
              <Space size='large'>
                <Button shape='round' type='primary' icon={<IconScan />} disabled>
                  扫描
                </Button>
                <Button shape='round' type='primary' icon={<IconUpload />} onClick={() => setUploadVisible(true)}>
                  上传
                </Button>
                <Button
                  shape='round'
                  type='outline'
                  icon={<IconSync />}
                  onClick={() => onSelectMonth(rangeValue.month, rangeValue.year)}>
                  刷新
                </Button>
                {menuSelect.catid === 1 && (
                  <Button shape='round' type='outline' icon={<IconExport />} onClick={() => buildTable()}>
                    生成财务报表
                  </Button>
                )}
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
          <Layout.Content className='h-full overflow-hidden'>
            {tableData.length > 0 ? (
              <>
                {showType === 'list' && (
                  <div className='flex flex-wrap'>
                    <div className='w-full border-b border-neutral-200 p-2 select-none'>
                      <Checkbox
                        checked={selectList.length === tableData.length}
                        indeterminate={selectList.length > 0 && tableData.length !== selectList.length}
                        onChange={checkAll}>
                        全选
                        <span className='ml-2 text-neutral-400'>
                          ({selectList.length}/{tableData.length})
                        </span>
                      </Checkbox>
                    </div>
                    <Checkbox.Group value={selectList} onChange={(values) => setSelectList(values)}>
                      {tableData.map((item) => {
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
                        if (item.fileext === 'zip' || item.fileext === 'rar') {
                          url = zip
                        }
                        return (
                          <Checkbox key={item.id} value={item.id}>
                            {({ checked }) => {
                              return (
                                <div
                                  className={`relative mt-5 flex w-38 cursor-pointer flex-col items-center gap-2 border border-white px-5 py-3 hover:border-blue-500 hover:bg-blue-100 ${checked ? 'border-blue-500! bg-blue-100' : ''}`}>
                                  <img className='h-21 w-21' src={url} onClick={() => openPreview(item)} />
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
                    loading={tableLoading}
                    data={tableData}
                    columns={columns}
                    pagination={false}
                    scroll={{ y: pageHeight - 114 }}
                    rowSelection={{
                      type: 'checkbox',
                      selectedRowKeys: selectList,
                      onChange: (selectedRowKeys) => setSelectList(selectedRowKeys),
                    }}
                  />
                )}
              </>
            ) : (
              <Empty className='flex h-full items-center' description='暂无文件，请扫描或者上传' />
            )}

            <Image.PreviewGroup srcList={srcList} visible={visible} onVisibleChange={setVisible} />
          </Layout.Content>
        </Layout>
      </Layout>

      {/* 上传模态框 */}
      <UploadModal
        visible={uploadVisible}
        title={menuSelect.title + rangeValue.year + '年' + rangeValue.month + '月份上传'}
        params={{
          groupid: currentCompany?.id,
          year: Number(rangeValue.year),
          month: Number(rangeValue.month),
          catid: menuSelect.catid,
        }}
        onOk={() => {
          setUploadVisible(false)
          onSelectMonth(rangeValue.month, rangeValue.year)
        }}
        onCancel={() => setUploadVisible(false)}
      />
    </>
  )
}
export default BankStatement
