import { useState } from 'react'

import { Button, DatePicker, Form, Input, InputNumber, Select, Space, Table } from '@arco-design/web-react'
import { IconCopy, IconDelete, IconPlusCircle } from '@arco-design/web-react/icon'

// 公共方法
import { numberToChinese } from 'src/utils/common'

// 组件
import FinanceTableCustom from 'src/components/FinanceTableCustom'

const typeList = [
  {
    value: 1,
    label: '记',
  },
  {
    value: 2,
    label: '收',
  },
  {
    value: 3,
    label: '付',
  },
  {
    value: 4,
    label: '借',
  },
]

// 数字转换
const transNum = (num, index) => {
  if (!num || num === 0) return ''
  const paddedNum = Number(num).toFixed(2).replace('.', '').padStart(11, 'X')
  const targetChar = paddedNum[paddedNum.length - 1 - index]
  return targetChar === 'X' ? '' : targetChar || ''
}

const DemoVoucher = () => {
  const [tableData, setTableData] = useState([
    {
      id: 1,
      summary: '业务招待费-餐饮费用-餐费',
      cashcode: '1',
      borrow: 1468,
      loan: 0,
    },
    {
      id: 2,
      summary: '业务招待费-招待王总一行',
      cashcode: '2',
      borrow: 0,
      loan: 1468,
    },
  ])

  const subject = [
    {
      label: '科目1',
      value: 1,
    },
    {
      label: '科目2',
      value: 2,
    },
    {
      label: '科目3',
      value: 3,
    },
    {
      label: '科目4',
      value: 4,
    },
  ]
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      width: 70,
      align: 'center',
      className: 'relative',
      render: (text, record, index) => (
        <>
          <div className='invisible absolute top-0 -left-9 z-10 flex h-full w-9 cursor-pointer flex-col items-center justify-center gap-2 group-hover:visible'>
            <IconPlusCircle className='text-base! text-blue-500!' />
            <IconCopy className='text-base! text-blue-500!' />
          </div>
          {index + 1}
        </>
      ),
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      align: 'center',
      width: 200,
      editable: true,
    },
    {
      title: '会计科目',
      dataIndex: 'cashcode',
      align: 'center',
      width: 500,
      editable: true,
      render: (text) => {
        const list = [
          { value: '1', label: '1111' },
          { value: '2', label: '2222' },
        ]
        const item = list.find((item) => item.value === text)
        return item?.label || ''
      },
    },
    {
      title: '借方金额',
      dataIndex: 'borrow',
      align: 'center',
      editable: true,
      children: [
        {
          title: '亿',
          dataIndex: 'borrow_10',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.borrow, 10),
        },
        {
          title: '千',
          dataIndex: 'borrow_9',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.borrow, 9),
        },
        {
          title: '百',
          dataIndex: 'borrow_8',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.borrow, 8),
        },
        {
          title: '十',
          dataIndex: 'borrow_7',
          align: 'center',
          className: 'row-money row-blue',
          width: 30,
          render: (_, record) => transNum(record?.borrow, 7),
        },
        {
          title: '万',
          dataIndex: 'borrow_6',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.borrow, 6),
        },
        {
          title: '千',
          dataIndex: 'borrow_5',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.borrow, 5),
        },
        {
          title: '百',
          dataIndex: 'borrow_4',
          align: 'center',
          className: 'row-money row-blue',
          width: 30,
          render: (_, record) => transNum(record?.borrow, 4),
        },
        {
          title: '十',
          dataIndex: 'borrow_3',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.borrow, 3),
        },
        {
          title: '元',
          dataIndex: 'borrow_2',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.borrow, 2),
        },
        {
          title: '角',
          dataIndex: 'borrow_1',
          align: 'center',
          className: 'row-money row-red',
          width: 30,
          render: (_, record) => transNum(record?.borrow, 1),
        },
        {
          title: '分',
          dataIndex: 'borrow_0',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.borrow, 0),
        },
      ],
    },
    {
      title: '贷方金额',
      dataIndex: 'loan',
      align: 'center',
      editable: true,
      children: [
        {
          title: '亿',
          dataIndex: 'loan_10',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.loan, 10),
        },
        {
          title: '千',
          dataIndex: 'loan_9',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.loan, 9),
        },
        {
          title: '百',
          dataIndex: 'loan_8',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.loan, 8),
        },
        {
          title: '十',
          dataIndex: 'loan_7',
          align: 'center',
          className: 'row-money row-blue',
          width: 30,
          render: (_, record) => transNum(record?.loan, 7),
        },
        {
          title: '万',
          dataIndex: 'loan_6',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.loan, 6),
        },
        {
          title: '千',
          dataIndex: 'loan_5',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.loan, 5),
        },
        {
          title: '百',
          dataIndex: 'loan_4',
          align: 'center',
          className: 'row-money row-blue',
          width: 30,
          render: (_, record) => transNum(record?.loan, 4),
        },
        {
          title: '十',
          dataIndex: 'loan_3',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.loan, 3),
        },
        {
          title: '元',
          dataIndex: 'loan_2',
          align: 'center',
          className: 'row-money',
          width: 30,
          render: (_, record) => transNum(record?.loan, 2),
        },
        {
          title: '角',
          dataIndex: 'loan_1',
          align: 'center',
          className: 'row-money row-red',
          width: 30,
          render: (_, record) => transNum(record?.loan, 1),
        },
        {
          title: '分',
          dataIndex: 'loan_0',
          align: 'center',
          className: 'row-money',
          width: 30,
          className: 'relative',
          render: (_, record) => {
            return (
              <>
                <div className='invisible absolute top-0 -right-9 z-10 flex h-full w-9 cursor-pointer flex-col items-center justify-center gap-2 group-hover:visible'>
                  <IconDelete className='text-base! text-red-500!' />
                </div>
                {transNum(record?.loan, 0)}
              </>
            )
          },
        },
      ],
    },
  ]

  return (
    <div className='px-10 py-5'>
      <div className='w-full pb-3 text-right'>2025年第03期</div>

      <Form layout='inline' size='small' className='justify-between'>
        <div className='flex'>
          <Form.Item label='凭证字'>
            <Select options={typeList} className='w-25!' />
          </Form.Item>
          <Form.Item>
            <InputNumber min={0} suffix={'号'} className='w-25!' />
          </Form.Item>
          <Form.Item>
            <DatePicker />
          </Form.Item>
        </div>
        <div className='flex'>
          <Form.Item label='附单据'>
            <Input.Group compact className='w-35!'>
              <Input disabled suffix={'张'} style={{ width: '57%' }} />
              <Button type='primary'>附件</Button>
            </Input.Group>
          </Form.Item>
          <Form.Item noStyle>
            <Button type='primary'>现金流量</Button>
          </Form.Item>
        </div>
      </Form>

      <Table
        size='small'
        border
        borderCell
        pagination={false}
        rowKey={'id'}
        columns={columns}
        data={tableData}
        rowClassName={() => 'group h-15'}
        summary={(currentData) => (
          <Table.Summary>
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={3}>
                合计：
                {numberToChinese(currentData.reduce((prev, next) => prev + (next.borrow || 0), 0))}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.borrow, 0),
                  10
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.borrow, 0),
                  9
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.borrow, 0),
                  8
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money row-blue'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.borrow, 0),
                  7
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.borrow, 0),
                  6
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.borrow, 0),
                  5
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money row-blue'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.borrow, 0),
                  4
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.borrow, 0),
                  3
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.borrow, 0),
                  2
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money row-red'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.borrow, 0),
                  1
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.borrow, 0),
                  0
                )}
              </Table.Summary.Cell>

              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.loan, 0),
                  10
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.loan, 0),
                  9
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.loan, 0),
                  8
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money row-blue'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.loan, 0),
                  7
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.loan, 0),
                  6
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.loan, 0),
                  5
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money row-blue'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.loan, 0),
                  4
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.loan, 0),
                  3
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.loan, 0),
                  2
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money row-red'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.loan, 0),
                  1
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell className='row-money'>
                {transNum(
                  currentData.reduce((prev, next) => prev + next.loan, 0),
                  0
                )}
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
      <FinanceTableCustom columns={columns} data={tableData} subject={subject} />

      <div className='py-3'>制单人：admin</div>
      <Space className='w-full justify-end'>
        <Button type='secondary'>暂存</Button>
        <Button type='primary'>保存</Button>
      </Space>
    </div>
  )
}
export default DemoVoucher
