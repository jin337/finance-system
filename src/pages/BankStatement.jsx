import dayjs from 'dayjs'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router'

import { Button, DatePicker, Layout, Menu } from '@arco-design/web-react'
import { IconCalendar } from '@arco-design/web-react/icon'

import status from 'src/assets/images/status.png'

// 组件
import FileInfo from 'src/components/FileInfo'

const BankStatement = () => {
  const location = useLocation()
  const { currentCompany } = useSelector((state) => state.commonReducer)
  const { menuSelect } = useSelector((state) => state.homeReducer)
  const [rangeValue, setRangeValue] = useState({})
  const [monthList, setMonthList] = useState([])

  const [fileParams, setFileParams] = useState({})

  // 月份切换
  const onSelectMonth = async (value, year) => {
    setRangeValue((prev) => ({ ...prev, month: value }))

    const params = {
      year: Number(year),
      month: Number(value),
      isdrawer: 0,
    }
    setFileParams(params)
  }

  // 年份切换
  const onChangeYear = async (value) => {
    setRangeValue((prev) => ({ ...prev, year: value }))

    const params = {
      catid: menuSelect.catid,
      groupid: currentCompany?.id,
      year: Number(value),
    }
    const { code, data } = await Http.post('/proof/month/list', params)
    if (code === 200) {
      setMonthList(data?.list || [])
      // 默认选择第一个月份
      onSelectMonth(rangeValue?.month || String(dayjs().month() + 1), Number(value))
    }
  }

  // 默认执行
  useEffect(() => {
    if (currentCompany) {
      onChangeYear(dayjs().format('YYYY'))
    }
  }, [currentCompany, location.pathname])

  return (
    <>
      <Layout className='h-full w-full'>
        <Layout.Sider width={114} className='h-full border-r border-neutral-200'>
          <DatePicker.YearPicker
            onChange={onChangeYear}
            disabledDate={(e) => e.isAfter(dayjs()) || e.isBefore(dayjs(currentCompany?.beginyearmonth))}
            value={String(rangeValue?.year)}
            triggerElement={
              <Button long>
                <IconCalendar />
                &nbsp;{rangeValue?.year || '请选择'}
              </Button>
            }
          />
          <Menu selectedKeys={[rangeValue?.month]} onClickMenuItem={(e) => onSelectMonth(e, rangeValue?.year)}>
            {monthList?.map((item) => (
              <Menu.Item key={item.month} className='flex items-center gap-1.5 leading-9!'>
                {item.month}月份
                {item.hasdata ? <img src={status} alt='' /> : null}
              </Menu.Item>
            ))}
          </Menu>
        </Layout.Sider>
        {fileParams?.year && fileParams?.month && (
          <FileInfo key={`${fileParams.year}-${fileParams.month}`} fileParams={fileParams} onCancel={() => {}} />
        )}
      </Layout>
    </>
  )
}
export default BankStatement
