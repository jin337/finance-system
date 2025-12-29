import { Button, Form, Input, Message, Modal, Popconfirm, Radio, Space, Table } from '@arco-design/web-react'
import { IconPlus } from '@arco-design/web-react/icon'
import { useEffect, useState } from 'react'

const UserManagement = () => {
  const [formEdit] = Form.useForm()
  const [tableLoading, setTableLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [tableData, setTableData] = useState({ list: [], page: 1, pageSize: 10, total: 0 })

  // 表格列
  const columns = [
    {
      title: '姓名',
      dataIndex: 'user_name',
    },
    {
      title: '用户名',
      dataIndex: 'user_code',
    },
    {
      title: '动态验证',
      dataIndex: 'totp',
      align: 'center',
      render: (totp) => (totp ? '启用' : '禁用'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 120,
      render: (status) => (status ? '启用' : '禁用'),
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 210,
      render: (_, record) => (
        <Space size='mini'>
          <Button size='mini' type='text' onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm focusLock title='提醒' content='是否确认删除当前项?' onOk={() => delItem(record)}>
            <Button size='mini' type='text'>
              删除
            </Button>
          </Popconfirm>
          <Button size='mini' type='text' onClick={() => resetPsw(record)}>
            重置密码
          </Button>
        </Space>
      ),
    },
  ]

  // 获取表格数据
  const changeTable = async (page) => {
    setTableData({ list: [], page: 1, pageSize: 10, total: 0 })
    setTableLoading(true)
    const params = {
      page_no: page,
      page_size: tableData.pageSize,
    }
    const { code, data } = await Http.post('/user/list', params)
    if (code === 200) {
      setTableData({
        pageSize: 10,
        list: data.list,
        page: data.page,
        total: data.total,
      })
    }
    setTableLoading(false)
  }

  // 初始化表格
  useEffect(() => {
    changeTable(1)
  }, [])

  // 打开编辑弹窗
  const openEdit = (e) => {
    setVisible(true)
    formEdit.resetFields()
    if (e) {
      formEdit.setFieldsValue(e)
    } else {
      formEdit.setFieldsValue({
        user_id: '新建用户',
        user_type: 1,
        status: 1,
        totp: 1,
      })
    }
  }

  // 提交编辑
  const submitEdit = async () => {
    const values = await formEdit.validate()
    const url = values.user_id === '新建用户' ? '/user/add' : '/user/update'
    const params =
      values.user_id === '新建用户'
        ? {
            user_code: values.user_code,
            user_name: values.user_name,
            status: values.status + '',
            totp: values.totp + '',
            user_type: values.user_type + '',
            password: values.password,
          }
        : {
            id: values.user_id,
            user_name: values.user_name,
            status: values.status + '',
            totp: values.totp + '',
            user_type: values.user_type + '',
          }
    const { code, message } = await Http.post(url, params)
    if (code === 200) {
      setVisible(false)
      changeTable(1)
    } else {
      Message.error(message)
    }
  }

  // 删除用户
  const delItem = async (record) => {
    const { code } = await Http.post('user/del/' + record.user_id)
    if (code === 200) {
      Message.success('删除成功')
      changeTable(1)
    } else {
      Message.error('删除失败')
    }
  }

  // 重置密码
  const resetPsw = async (record) => {
    const { code } = await Http.post('user/resetpwd', { id: record.user_id })
    if (code === 200) {
      Message.success('密码已重置')
      changeTable(1)
    } else {
      Message.error('密码重置失败')
    }
  }

  return (
    <>
      <div className='px-5 py-4 border-b border-neutral-200'>
        <Button shape='round' type='primary' icon={<IconPlus />} onClick={() => openEdit()}>
          新建用户
        </Button>
      </div>
      <Table
        rowKey='user_id'
        border={false}
        columns={columns}
        data={tableData.list}
        loading={tableLoading}
        onChange={(e) => changeTable(e.current)}
        pagination={{ shshowTotal: true, pageSize: tableData.pageSize, current: tableData.page, total: tableData.total }}
      />

      {/* 新建用户 */}
      <Modal
        title={formEdit.getFieldValue('user_id') ? '编辑用户' : '新建用户'}
        visible={visible}
        onOk={() => submitEdit()}
        onCancel={() => setVisible(false)}
        autoFocus={false}
        focusLock={true}>
        <Form form={formEdit} autoComplete='off' validateMessages={{ required: (_, { label }) => `${label}是必填项` }}>
          <Form.Item rules={[{ required: true }]} label='user_id' field='user_id' hidden>
            <Input placeholder='请输入...' />
          </Form.Item>
          <Form.Item rules={[{ required: true }]} label='姓名' field='user_name'>
            <Input placeholder='请输入...' />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label='用户名'
            field='user_code'
            disabled={formEdit.getFieldValue('user_id') !== '新建用户'}>
            <Input placeholder='请输入...' />
          </Form.Item>
          {formEdit.getFieldValue('user_id') === '新建用户' && (
            <Form.Item rules={[{ required: true }]} label='密码' field='password'>
              <Input.Password placeholder='请输入...' />
            </Form.Item>
          )}
          <Form.Item rules={[{ required: true }]} label='类别' field='user_type'>
            <Radio.Group
              options={[
                { label: '普通用户', value: 0 },
                { label: '管理员', value: 1 },
              ]}
            />
          </Form.Item>
          <Form.Item rules={[{ required: true }]} label='状态' field='status'>
            <Radio.Group
              options={[
                { label: '禁用', value: 0 },
                { label: '启用', value: 1 },
              ]}
            />
          </Form.Item>
          <Form.Item rules={[{ required: true }]} label='动态验证' field='totp'>
            <Radio.Group
              options={[
                { label: '禁用', value: 0 },
                { label: '启用', value: 1 },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default UserManagement
