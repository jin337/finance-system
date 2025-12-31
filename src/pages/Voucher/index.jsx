import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { Button, DatePicker, Layout, Menu } from '@arco-design/web-react'
import { IconCalendar } from '@arco-design/web-react/icon'
import { useSelector } from 'react-redux'

import status from 'src/assets/images/status.png'

const Voucher = () => {
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)
  const [rangeValue, setRangeValue] = useState({})
  const [monthList, setMonthList] = useState([])

  // 月份切换
  const onSelectMonth = async (value, year) => {
    setRangeValue((prev) => ({ ...prev, month: value }))
  }

  // 年份切换
  const onChangeYear = async (value) => {
    setRangeValue((prev) => ({ ...prev, year: value }))

    const params = {
      catid: 2,
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
  }, [currentCompany])

  return (
    <Layout className='h-full w-full'>
      <Layout.Sider width={114} className='h-full border-r border-neutral-200'>
        <DatePicker.YearPicker
          onChange={onChangeYear}
          disabledDate={(e) => e.isAfter(dayjs())}
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
      <Layout.Content className='h-full overflow-hidden'>111</Layout.Content>
    </Layout>
  )
}
export default Voucher
