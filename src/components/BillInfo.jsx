import { useState } from 'react'
import { useSelector } from 'react-redux'

import { Button, Form, Input, InputNumber, Layout, Modal, Radio, Select, Table, Typography } from '@arco-design/web-react'

// 公共方法
import { useEffect } from 'react'
import { formatNumber } from 'src/utils/common'

const BillInfo = ({ billParams, onSelect }) => {
  const { pageHeight } = useSelector((state) => state.commonReducer)
  const [billForm] = Form.useForm()

  const [billList, setBillList] = useState([])
  const [billType, setBillType] = useState({})

  // 获取账单列表
  const getBillList = async (item) => {
    const params = {
      groupid: billParams?.groupid,
      entrytype: item?.type || billType?.type,
      summary: item?.summary || '',
      entrymoney: item?.entrymoney || null,
      modecode: item?.modecode || null,
      pid: item?.pid || null,
    }
    const { code, data } = await Http.post('/bill/list', params)
    if (code === 200) {
      const list = (data?.list || []).map((e, i) => ({ ...e, billid_index: i + 1 }))
      setBillList(list)
    }
  }

  const getBillType = async (item) => {
    setBillType({})
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
    }
  }
  // 类别切换
  const onCahengBill = (v, vs) => {
    const key = Object.keys(v)[0]
    if (key === 'modecode') {
      getBillList(vs)
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
          year: billParams.year,
          month: billParams.month,
          groupid: billParams.groupid,
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
              onSelect(params)
            },
            onCancel: () => {
              params.brachtype = record.brachtype
            },
          })
        } else {
          onSelect(params)
        }
      },
    })
  }

  useEffect(() => {
    billForm.resetFields()

    getBillType(billParams)
  }, [])

  return (
    <Layout>
      <Layout.Header>
        <Form layout='inline' size='small' autoComplete='off' form={billForm} onChange={onCahengBill}>
          <Form.Item label='关键字' field={'summary'}>
            <Input placeholder='请输入关键字' />
          </Form.Item>
          <Form.Item label='金额' field={'entrymoney'}>
            <InputNumber
              hideControl
              placeholder='请输入金额'
              prefix='¥'
              autocomplete='off'
              precision={1}
              step={0.01}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
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
      </Layout.Header>
      <Layout.Content className='mt-1'>
        <Table
          className='mt-1'
          size='small'
          rowKey={'billid_index'}
          border
          borderCell
          pagination={false}
          scroll={{ y: pageHeight - 44 }}
          columns={[
            {
              title: '类别',
              dataIndex: 'modename',
              width: 200,
              ellipsis: true,
              render: (text) => <Typography.Ellipsis showTooltip>{text}</Typography.Ellipsis>,
            },
            { title: '业务日期', dataIndex: 'bdate', width: 110 },
            {
              title: '单据号',
              dataIndex: 'sericnum',
              width: 190,
              ellipsis: true,
              render: (text) => <Typography.Ellipsis showTooltip>{text}</Typography.Ellipsis>,
            },
            {
              title: '摘要',
              dataIndex: 'summary',
              width: 269,
              ellipsis: true,
              render: (text) => <Typography.Ellipsis showTooltip>{text}</Typography.Ellipsis>,
            },
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
      </Layout.Content>
    </Layout>
  )
}
export default BillInfo
