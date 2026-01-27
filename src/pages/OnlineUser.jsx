import { Button, Message, Modal, Table, Tooltip, Typography } from '@arco-design/web-react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const OnlineUser = () => {
  const { pageHeight } = useSelector((state) => state.commonReducer)

  const [tableData, setTableData] = useState([])
  const [tableLoading, setTableLoading] = useState(false)
  // 表格列定义
  const columns = [
    {
      title: '用户名',
      dataIndex: 'user_name',
      width: 100,
    },
    {
      title: '登录IP',
      dataIndex: 'client_ip',
      align: 'center',
      width: 150,
    },
    {
      title: '登录城市',
      dataIndex: 'city',
      align: 'center',
      width: 180,
    },
    {
      title: '代理',
      dataIndex: 'user_agent',
      align: 'center',
      render: (text) => (
        <Tooltip content={text}>
          <Typography.Text ellipsis className='mb-0!'>
            {text}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: '设备码',
      dataIndex: 'hash_code',
      align: 'center',
      width: 130,
    },
    {
      title: '登录时间',
      dataIndex: 'login_date',
      align: 'center',
      width: 170,
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Button size='mini' type='text' onClick={() => handleOffline(record)}>
          下线
        </Button>
      ),
    },
  ]
  // 获取表格数据
  const changeTable = async () => {
    setTableData([])
    setTableLoading(true)

    const { code, data } = await Http.post('/user/online/list')
    if (code === 200) {
      setTableData(data)
    }
    setTableLoading(false)
  }

  // 初始化表格
  useEffect(() => {
    changeTable()
  }, [])

  // 下线用户
  const handleOffline = (record) => {
    Modal.confirm({
      title: '警告',
      content: <>是否确认把 {record.user_name} 的用户踢下线?</>,
      className: 'simpleModal',
      onOk: async () => {
        const { code } = await Http.post('/user/kickout', { login_id: record.login_id })
        if (code === 200) {
          Message.success('下线成功')
          changeTable()
        } else {
          Message.error('下线失败')
        }
      },
    })
  }

  return (
    <Table
      rowKey='login_id'
      loading={tableLoading}
      border={false}
      columns={columns}
      data={tableData}
      scroll={{ y: pageHeight }}
      pagination={false}
    />
  )
}
export default OnlineUser
