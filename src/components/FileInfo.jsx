import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  Button,
  Checkbox,
  Drawer,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Layout,
  Message,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
} from '@arco-design/web-react'
import {
  IconApps,
  IconCheckCircle,
  IconDelete,
  IconDownload,
  IconEdit,
  IconScan,
  IconSync,
  IconUnorderedList,
  IconUpload,
} from '@arco-design/web-react/icon'

// 公共方法
import { downloadFile, uuid } from 'src/utils/common'
// 上传组件
import UploadModal from 'src/components/UploadModal'

import excel from 'src/assets/images/excel.png'
import pdf from 'src/assets/images/pdf.png'
import world from 'src/assets/images/world.png'
import zip from 'src/assets/images/zip.png'

const FileInfo = ({ visible = false, onCancel, fileParams = {}, tableTyle = {} }) => {
  const [oaSelectForm] = Form.useForm()
  const [visibleDrawer, setVisibleDrawer] = useState(false)

  const { currentCompany, pageHeight, account } = useSelector((state) => state.commonReducer)
  const { menuSelect } = useSelector((state) => state.homeReducer)

  const [showType, setShowType] = useState('list')

  const [sessionId, setSessionId] = useState('')

  const [imgInfo, setImgInfo] = useState({})
  const [tableImgData, setTableImgData] = useState([])
  const [tableImgLoading, setTableImgLoading] = useState(false)

  const [srcList, setSrcList] = useState([])
  const [selectImgList, setSelectImgList] = useState([])
  const [visibleViewImg, setVisibleViewImg] = useState(false)
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
          year: Number(fileParams?.year),
          month: Number(fileParams?.month),
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
      width: 210,
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
        !tableTyle?.finish &&
        tableTyle?.ischeckout !== 1 &&
        tableTyle?.status !== 1 && (
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

    setSelectImgList([])
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

    const UUID = uuid()
    setSessionId(UUID)

    const params = {
      groupid: currentCompany.id,
      catid: menuSelect.catid,
      year: Number(fileParams?.year),
      month: Number(fileParams?.month),
      pid: record.id,
      sessionno: UUID,
    }

    const { code, data } = await Http.post('/file/list', params)
    if (code === 200) {
      const list = data?.list || []
      const imgList = list
        .filter((item) => !['xlsx', 'docx', 'pdf', '.pdf'].includes(item.fileext))
        .map((item) => item.filepathtrans)

      setTableImgData(list)
      setSrcList(imgList)
    }
    setTableImgLoading(false)
  }

  const handleCancel = () => {
    setVisibleDrawer(false)
    if (onCancel) onCancel()
  }

  useEffect(() => {
    setVisibleDrawer(!!visible)
    if (visible) {
      onImgInfo(fileParams)
    }
  }, [visible])

  return (
    <>
      <Drawer width={'50%'} title='附件清单' visible={visibleDrawer} footer={null} onCancel={handleCancel}>
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
                {tableImgData.length > 0 && (
                  <Button shape='round' type='primary' icon={<IconCheckCircle />} onClick={onOA}>
                    OA审批单
                  </Button>
                )}
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
                        if (item.fileext === 'zip' || item.fileext === 'rar') {
                          url = zip
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
        title={menuSelect.title + fileParams?.year + '年' + fileParams?.month + '月份上传'}
        params={{
          groupid: currentCompany?.id,
          year: Number(fileParams?.year),
          month: Number(fileParams?.month),
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
        {!tableTyle?.finish && tableTyle?.ischeckout !== 1 && tableTyle?.status !== 1 && (
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
                  prefix='¥'
                  allowClear
                  formatter={(value) =>
                    value &&
                    parseFloat(value)
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => (value ? parseFloat(value.replace(/,/g, '')) : '')}
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
export default FileInfo
