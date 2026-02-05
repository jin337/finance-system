import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Button, Checkbox, Form, Input, Layout, Message, Popover, Space, Table } from '@arco-design/web-react'
const AssistInfo = ({ assistParams, onSelect }) => {
  const { pageHeight } = useSelector((state) => state.commonReducer)
  const [assistForm] = Form.useForm()
  const [selectRowAssist, setSelectRowAssist] = useState()
  const [AssistList, setAssistList] = useState([])
  const [expandedRowKeys, setExpandedRowKeys] = useState([])

  const [visible, setVisible] = useState(false)
  const [createForm] = Form.useForm()

  // 提交新增
  const onAssistAdd = async () => {
    const values = await createForm.validate()
    const params = {
      ...values,
      typeid: assistParams?.typeid,
      groupid: assistParams?.groupid + '',
    }
    const { code, message } = await Http.post('/assist/add', params)
    if (code === 200) {
      setVisible(false)
      getAssistList()
    } else {
      Message.error(message || '新增核算项目出错了')
    }
  }
  // 打开新增窗口
  const openCreate = () => {
    setVisible(true)
    createForm.resetFields()
  }
  // 监控表单变化
  const onChangeAssist = (v) => {
    const key = Object.keys(v)[0]
    if (key !== 'name') {
      getAssistList()
    }
  }

  // 选择行
  const onSelectRowAssist = (record) => {
    if (record.isdetail === 0) {
      Message.error('不可选')
    } else {
      record?.id && onSelect(record)
    }
  }

  // 展开关闭
  const onExpand = (e, expanded) => {
    setExpandedRowKeys((prev) => (expanded ? [...prev, e.id] : prev.filter((id) => id !== e.id)))
  }

  // 获取数据
  const getAssistList = async () => {
    const values = assistForm.getFieldsValue()
    const params = {
      haslevel: values.haslevel ? '1' : '0',
      name: values?.name || '',
      typeid: assistParams?.typeid,
      groupid: assistParams?.limitgroup === '1' ? assistParams?.groupid : null,
    }
    const { code, data } = await Http.post('/assist/list', params)
    if (code === 200) {
      setAssistList(data?.list || [])
    }
  }

  useEffect(() => {
    getAssistList()
    assistForm.setFieldValue('haslevel', true)
  }, [])

  return (
    <Layout>
      <Layout.Header>
        <Form layout='inline' size='small' autoComplete='off' form={assistForm} onChange={onChangeAssist}>
          <Form.Item field={'haslevel'} triggerPropName='checked'>
            <Checkbox>包含下级节点</Checkbox>
          </Form.Item>
          <Form.Item shouldUpdate>
            {(values) => {
              return (
                values.haslevel && (
                  <Form.Item field={'open'} triggerPropName='checked'>
                    <Checkbox>全部展开</Checkbox>
                  </Form.Item>
                )
              )
            }}
          </Form.Item>
          <Form.Item field={'name'}>
            <Input.Search searchButton placeholder='输入关键字查询' allowClear onClear={getAssistList} onSearch={getAssistList} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' onClick={() => onSelectRowAssist(selectRowAssist)}>
              确认选择
            </Button>
          </Form.Item>
          <Form.Item>
            <Popover
              trigger='click'
              position='br'
              className='w-80'
              popupVisible={visible}
              content={
                <Form
                  form={createForm}
                  validateMessages={{ required: (_, { label }) => `请输入${label}` }}
                  labelCol={{ style: { flexBasis: 70 } }}
                  wrapperCol={{ style: { flexBasis: `calc(100% - ${70}px)` } }}>
                  <Form.Item label='编码' field={'code'} rules={[{ required: true }]}>
                    <Input placeholder='请输入编码' />
                  </Form.Item>
                  <Form.Item label='名称' field={'name'} rules={[{ required: true }]}>
                    <Input placeholder='请输入名称' />
                  </Form.Item>
                  <Form.Item className='mb-0! text-right' wrapperCol={{ span: 24 }}>
                    <Space>
                      <Button type='text' onClick={() => setVisible(false)}>
                        取消
                      </Button>
                      <Button type='primary' onClick={onAssistAdd}>
                        确认
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              }>
              <Button onClick={openCreate}>新增核算项目</Button>
            </Popover>
          </Form.Item>
        </Form>
      </Layout.Header>
      <Layout.Content className='mt-1'>
        <Table
          size='small'
          rowKey={'id'}
          border
          borderCell
          columns={[
            { title: '编码', dataIndex: 'code', width: 180 },
            { title: '名称', dataIndex: 'name' },
          ]}
          data={AssistList}
          pagination={false}
          onExpand={onExpand}
          expandedRowKeys={expandedRowKeys}
          scroll={{ y: pageHeight - 40 }}
          rowClassName={(record) =>
            [record.id === selectRowAssist?.id && 'table-select', record.isdetail === 0 && 'cursor-not-allowed'].join(' ')
          }
          onRow={(record) => {
            return {
              onClick: () => setSelectRowAssist(record),
              onDoubleClick: () => onSelectRowAssist(record),
            }
          }}
        />
      </Layout.Content>
    </Layout>
  )
}
export default AssistInfo
