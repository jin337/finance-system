import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Layout,
  Message,
  Modal,
  Popover,
  Select,
  Space,
  Table,
} from '@arco-design/web-react'

const RestrictedFunds = () => {
  const [editForm] = Form.useForm()
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)

  const [time, setTime] = useState({})
  const [tableData, setTableData] = useState({ list: [], page: 1, pageSize: 10, total: 0 })
  const [tableLoading, setTableLoading] = useState(false)
  const [selectList, setSelectList] = useState([])
  const [year, setYear] = useState()

  const [visible, setVisible] = useState(false)
  const [editInfo, setEditInfo] = useState({})
  const [limitType, setLimitType] = useState([])

  const columns = [
    {
      title: '年',
      dataIndex: 'year',
      width: 120,
      align: 'center',
    },
    {
      title: '月',
      dataIndex: 'month',
      width: 120,
      align: 'center',
    },
    {
      title: '受限类型名称',
      dataIndex: 'limitname',
      align: 'center',
    },
    {
      title: '类别',
      dataIndex: 'ctype',
      align: 'center',
      width: 160,
    },
    {
      title: '金额',
      dataIndex: 'money',
      width: 160,
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
      width: 290,
    },
  ]

  // 提交
  const submitEdit = async () => {
    const values = await editForm.validate()
    const params = {
      id: values.id,
      groupid: currentCompany.id,
      year: Number(values.year),
      month: values.month ? (values.id ? String(values.month) : Number(values.month)) : null,
      limitcode: values.limitcode,
      ctype: values.ctype,
      money: values.money,
      remark: values.remark,
    }
    let url = '/cash/limit/add'
    if (params.id) {
      url = '/cash/limit/update'
    }
    const { code, message } = await Http.post(url, params)
    if (code === 200) {
      setVisible(false)

      Message.success(params.id ? '修改成功' : '新建成功')
      changeTable(1, time)
    } else {
      Message.error(message)
    }
  }

  // 监听表单值改变
  const onValuesChange = (v, vs) => {
    // 动态设置列表选项组
    setEditInfo((prev) => ({
      ...prev,
      ctypeList: vs['month']
        ? [
            { value: 1, label: '本月增加' },
            { value: 2, label: '本月减少' },
          ]
        : [{ value: 0, label: '期初' }],
    }))

    // 清空类别内容
    if (Object.keys(v)[0] === 'month') {
      editForm.setFieldValue('ctype', null)
    }
  }
  // 新建&编辑
  const onEdit = async (record) => {
    editForm.resetFields()
    setEditInfo({})

    const { code, data, message } = await Http.post('/cash/limit/type')
    if (code === 200) {
      const list = (data?.list || []).map((item) => ({ ...item, value: item.code, label: item.name }))
      setLimitType(list)
      setVisible(true)
      if (record) {
        const item = {
          ...record,
          year: String(record.year),
        }
        setEditInfo({ ...item, ctypeList: [{ value: 0, label: '期初' }] })
        editForm.setFieldsValue({ ...item, ctypeList: [{ value: 0, label: '期初' }] })
      }
    } else {
      Message.error(message || '获取受限类型出错')
    }
  }
  // 生成年初数
  const createBuild = () => {
    if (!year) {
      Message.error('请选择要生成的年')
      return
    }

    Modal.confirm({
      title: '警告',
      content: <div className='text-center'>{`请确认自动生成${year}年的年初数?`}</div>,
      onOk: async () => {
        const params = {
          groupid: currentCompany.id,
          year: Number(year),
        }
        const { code, message } = await Http.post('/cash/limit/autobuild', params)
        if (code === 200) {
          Message.success('删除成功')
          changeTable(1, time)
        } else {
          Message.error(message || '自动生成的年初数受限资金出错了')
        }
      },
    })
  }
  // 删除
  const DeleteItems = () => {
    Modal.confirm({
      title: '警告',
      content: <div className='text-center'>请确认是否删除?</div>,
      onOk: async () => {
        const params = {
          groupid: currentCompany.id,
          ids: selectList.join(','),
        }
        const { code } = await Http.post('/cash/limit/del', params)
        if (code === 200) {
          Message.success('删除成功')
          changeTable(1, time)
        } else {
          Message.error('删除失败')
        }
      },
    })
  }
  // 获取表格数据
  const changeTable = async (page, e) => {
    setTableData({ list: [], page: 1, pageSize: 10, total: 0 })
    setTableLoading(true)
    setSelectList([])
    setTime(e)
    const params = {
      groupid: currentCompany?.id,
      year: Number(e.year),
      month: Number(e.month),
      page_no: page,
      page_size: tableData.pageSize,
    }
    const { code, data } = await Http.post('/cash/limit/list', params)
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

  useEffect(() => {
    if (currentCompany) {
      changeTable(1, { year: dayjs().format('YYYY') })
    }
  }, [currentCompany])

  return (
    <>
      <Layout.Header className='flex items-center justify-between border-b border-neutral-200 px-5 py-4'>
        <Space size='large'>
          <DatePicker.YearPicker
            disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(currentCompany.beginyearmonth))}
            value={time?.year}
            onChange={(e) => changeTable(1, { year: e })}
          />
          <DatePicker.MonthPicker
            triggerProps={{
              className: 'hideYear',
            }}
            format={'MM'}
            value={time?.month}
            onChange={(e) => changeTable(1, { year: time.year, month: e })}
          />
          {selectList?.length > 0 && (
            <Button status='danger' onClick={DeleteItems}>
              删除
            </Button>
          )}
        </Space>
        <Space size='large'>
          <Button type='primary' onClick={() => onEdit()}>
            新建
          </Button>
          <Popover
            trigger='click'
            position='br'
            content={
              <Space>
                <DatePicker.YearPicker
                  size='small'
                  disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(currentCompany.beginyearmonth))}
                  onChange={(e) => setYear(e)}
                />
                <Button type='primary' size='small' onClick={createBuild}>
                  确定生成年初数
                </Button>
              </Space>
            }>
            <Button>生成年初数</Button>
          </Popover>
        </Space>
      </Layout.Header>
      <Layout.Content>
        <Table
          rowKey='id'
          size='small'
          border={{ wrapper: true, cell: true }}
          loading={tableLoading}
          columns={columns}
          scroll={{ y: pageHeight - 114 }}
          data={tableData.list}
          onChange={(e) => changeTable(e.current)}
          pagination={{ shshowTotal: true, pageSize: tableData.pageSize, current: tableData.page, total: tableData.total }}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectList,
            onChange: (selectedRowKeys) => setSelectList(selectedRowKeys),
          }}
          onRow={(record) => {
            return {
              onDoubleClick: () => onEdit(record),
            }
          }}
        />
      </Layout.Content>

      <Drawer
        width={'50%'}
        title={(editInfo?.id ? '编辑' : '新建') + '受限资金'}
        closable={false}
        visible={visible}
        onOk={submitEdit}
        onCancel={() => setVisible(false)}>
        <Form
          form={editForm}
          autoComplete='off'
          validateMessages={{ required: (_, { label }) => `${label}是必填项` }}
          labelCol={{ style: { flexBasis: 100 } }}
          wrapperCol={{ style: { flexBasis: `calc(100% - ${100}px)` } }}
          onValuesChange={onValuesChange}>
          <Form.Item label='ID' field='id' hidden>
            <Input />
          </Form.Item>
          <div className='flex'>
            <Form.Item label='年' field='year' rules={[{ required: true }]}>
              <DatePicker.YearPicker
                disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(currentCompany.beginyearmonth))}
                style={{ width: '100%' }}
                allowClear
              />
            </Form.Item>
            <Form.Item label='月' field='month'>
              <DatePicker.MonthPicker
                triggerProps={{
                  className: 'hideYear',
                }}
                format={'MM'}
                style={{ width: '100%' }}
                allowClear
              />
            </Form.Item>
          </div>
          <div className='flex'>
            <Form.Item label='受限编码' field='limitcode' rules={[{ required: true }]}>
              <Select options={limitType} allowClear />
            </Form.Item>
            <Form.Item label='类别' field='ctype' rules={[{ required: true }]}>
              <Select options={editInfo?.ctypeList || []} allowClear />
            </Form.Item>
          </div>
          <Form.Item label='金额' field='money' rules={[{ required: true }]}>
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
          <Form.Item label='备注' field='remark'>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  )
}
export default RestrictedFunds
