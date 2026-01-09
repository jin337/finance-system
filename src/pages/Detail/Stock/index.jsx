import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Button, DatePicker, Form, Layout, Spin } from '@arco-design/web-react'

// 公共方法
import { formatNumber } from 'src/utils/common'

// svg
import ABottom from 'src/assets/svg/a-bottom.svg'
import ATop from 'src/assets/svg/a-top.svg'
import AWarningFilled from 'src/assets/svg/a-warning-filled.svg'
import Chuku from 'src/assets/svg/chuku.svg'
import FapiaoCk from 'src/assets/svg/fapiao-ck.svg'
import FapiaoRk from 'src/assets/svg/fapiao-rk.svg'
import Ruku from 'src/assets/svg/ruku.svg'

// 组件
import CustomizeIcon from 'src/components/CustomizeIcon'
// 组件
const Stock = () => {
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)

  const [selectInfo, setSelectInfo] = useState()
  const [info, setInfo] = useState({})
  const [loading, setLoading] = useState(false)

  const stockList = [
    {
      column: 2,
      backgroundColor: '',
      color: '#255316',
      children: [
        {
          label: '存货总额(不含税)',
          value: 'balance_totalmoney_norate',
          icon: <AWarningFilled className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
        },
        {},
      ],
    },
    {
      column: 3,
      backgroundColor: '#dbe9fe',
      color: '#2563eb',
      children: [
        {
          label: '入库总额(不含税)',
          value: 'rk_totalmoney_norate',
          icon: <ABottom className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
        },
        {
          label: '发票入库总额(不含税)',
          value: 'rk_fp_totalmoney_norate',
          icon: <FapiaoRk className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
          prefixIcon: '=',
        },
        {
          label: '暂估入库总额(不含税)',
          value: 'rk_zg_totalmoney_norate',
          icon: <Ruku className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
          prefixIcon: '+',
        },
      ],
    },
    {
      column: 3,
      backgroundColor: '#dcfce7',
      color: '#16a34a',
      children: [
        {
          label: '出库总额(不含税)',
          value: 'ck_totalmoney_norate',
          icon: <ATop className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
        },
        {
          label: '发票出库总额(不含税)',
          value: 'ck_fp_totalmoney_norate',
          icon: <FapiaoCk className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
          prefixIcon: '=',
        },
        {
          label: '暂估出库总额(不含税)',
          value: 'ck_zg_totalmoney_norate',
          icon: <Chuku className='arco-icon' />,
          render: (text) => '￥' + formatNumber(text),
          prefixIcon: '+',
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
    const { code, data } = await Http.post('/query/asset/inventory/list', params)
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
            <div key={rowIndex} className={`mb-8 grid ${row.column === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {row.children.map((item, itemIndex) => {
                if (!item.value) {
                  // 空对象，渲染空白占位符
                  return <div key={itemIndex}></div>
                }

                return (
                  <div key={itemIndex} className='flex items-center'>
                    {item.prefixIcon ? <div className='mx-5 text-2xl font-bold'>{item.prefixIcon}</div> : null}
                    <div
                      className={`flex-1 rounded-xl p-6 shadow-[0_2px_12px_0_rgba(0,0,0,0.1)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_8px_24px_0_rgba(0,0,0,0.15)] ${row.column === 2 ? 'bg-[linear-gradient(135deg,#dbf2d0,#b5e6a1)]' : 'bg-[#f9fafb]'}`}>
                      <div className='mb-4 flex items-center'>
                        <div
                          className={`mr-2 flex size-9 items-center justify-center rounded-lg text-2xl ${row.column === 2 ? 'text-3xl' : ''}`}
                          style={{ backgroundColor: row.backgroundColor }}>
                          <CustomizeIcon icon={item.icon} color={row.color} />
                        </div>
                        <div className={`${row.column === 2 ? 'text-lg font-bold' : ''}`}>{item.label}</div>
                      </div>
                      <div className={`font-bold ${row.column === 2 ? 'text-4xl' : 'text-2xl'}`}>
                        {item.render ? item.render(info[item.value]) : info[item.value]}
                      </div>
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
export default Stock
