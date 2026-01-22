import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Button, DatePicker, Form, Layout, Spin } from '@arco-design/web-react'

// 公共方法
import { formatNumber } from 'src/utils/common'

// svg
import ABottom from 'src/assets/svg/a-bottom.svg'
import ACircleCheckFilled from 'src/assets/svg/a-circle-check-filled.svg'
import Jisuanqilishuai from 'src/assets/svg/a-jisuanqilishuai.svg'
import ATop from 'src/assets/svg/a-top.svg'
import AWarningFilled from 'src/assets/svg/a-warning-filled.svg'

// 组件
import CustomizeIcon from 'src/components/CustomizeIcon'
// 组件
const Taxes = () => {
  const { currentCompany } = useSelector((state) => state.commonReducer)

  const [selectInfo, setSelectInfo] = useState()
  const [info, setInfo] = useState({})
  const [loading, setLoading] = useState(false)

  const stockList = [
    {
      column: 2,
      backgroundColor: 'linear-gradient(135deg,#dbf2d0,#b5e6a1)',
      color: '#255316',
      children: [
        {
          label: '应交增值税总额',
          value: 'payable_ratemoney',
          icon: <AWarningFilled className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
        },
        {},
      ],
    },
    {
      column: 4,
      children: [
        {
          label: '增值税销项总额（一般征收）',
          value: 'base_in_ratemoney',
          backgroundColor: '#dbe9fe',
          color: '#2563eb',
          icon: <ATop className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
        },
        {
          label: '增值税进项总额',
          value: 'out_ratemoney',
          backgroundColor: '#dcfce7',
          color: '#16a34a',
          icon: <ABottom className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
        },
        {
          label: '增值税销项总额（简易征收）',
          value: 'simple_in_ratemoney',
          backgroundColor: '#f3e8ff',
          color: '#9333ea',
          icon: <Jisuanqilishuai className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
        },
        {
          label: '已缴纳增值税总额',
          value: 'paid_ratemoney',
          backgroundColor: '#d1fae5',
          color: '#059669',
          icon: <ACircleCheckFilled className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
        },
      ],
    },
  ]

  // 搜索
  const onSearch = async (values) => {
    setLoading(true)
    const begin = dayjs(values.selectData[0]).format('YYYY-MM').split('-')
    const end = dayjs(values.selectData[1]).format('YYYY-MM').split('-')
    const params = {
      groupid: currentCompany.id,
      beginyear: Number(begin[0]),
      beginmonth: Number(begin[1]),
      endyear: Number(end[0]),
      endmonth: Number(end[1]),
    }
    const { code, data } = await Http.post('/query/liability/taxes/addtax/list', params)
    if (code === 200) {
      setInfo(data || {})
    }

    setTimeout(() => {
      setLoading(false)
    }, 200)
  }

  // 改变数据
  const onChangeData = (e) => {
    setSelectInfo((prev) => ({
      ...prev,
      selectData: e,
    }))
  }

  useEffect(() => {
    if (currentCompany) {
      const item = {
        disabledDate: currentCompany.beginyearmonth,
        selectData: [currentCompany.beginyearmonth, dayjs().format('YYYY-MM')],
      }
      setSelectInfo(item)
      onSearch(item)
    }
  }, [currentCompany])

  return (
    <Layout className='h-full w-full'>
      <Layout.Header className='px-5 pt-5 pb-3'>
        <Form autoComplete='off' layout='inline' size='small'>
          <Form.Item label='查询区间'>
            <DatePicker.RangePicker
              mode='month'
              placeholder={['开始年月', '结束年月']}
              style={{ width: 200 }}
              allowClear={false}
              value={selectInfo?.selectData}
              disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(selectInfo?.disabledDate))}
              onChange={onChangeData}
            />
          </Form.Item>
          <Form.Item>
            <Button type='primary' onClick={() => onSearch(selectInfo)}>
              查询
            </Button>
          </Form.Item>
        </Form>
      </Layout.Header>
      <Layout.Content className='mt-8 px-5'>
        <Spin loading={loading} className='w-full'>
          {stockList.map((row, rowIndex) => (
            <div key={rowIndex} className={`mb-8 grid gap-5 ${row.column === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {row.children.map((item, itemIndex) => {
                if (!item.value) {
                  // 空对象，渲染空白占位符
                  return <div key={itemIndex}></div>
                }

                return (
                  <div
                    key={itemIndex}
                    className={`flex-1 rounded-xl p-6 shadow-[0_2px_12px_0_rgba(0,0,0,0.1)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_8px_24px_0_rgba(0,0,0,0.15)] ${row.column === 2 ? 'bg-[linear-gradient(135deg,#dbf2d0,#b5e6a1)]' : 'bg-[#f9fafb]'}`}>
                    <div className='mb-4 flex items-center'>
                      <div
                        className={`mr-2 flex size-9 items-center justify-center rounded-lg text-2xl ${row.column === 2 ? 'text-3xl' : ''}`}
                        style={{ backgroundColor: item.backgroundColor }}>
                        <CustomizeIcon icon={item.icon} color={item.color} />
                      </div>
                      <div className={`${row.column === 2 ? 'text-lg font-bold' : ''}`}>{item.label}</div>
                    </div>
                    <div className={`font-bold ${row.column === 2 ? 'text-4xl' : 'text-2xl'}`}>
                      {item.render ? item.render(info[item.value]) : info[item.value]}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </Spin>
      </Layout.Content>
    </Layout>
  )
}
export default Taxes
