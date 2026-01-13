import { Drawer } from '@arco-design/web-react'
import { useEffect, useState } from 'react'

const CashInfo = ({ visible = false, cashKey, onCancel }) => {
  const [visibleDrawer, setVisibleDrawer] = useState(false)

  useEffect(() => {
    setVisibleDrawer(!!visible)
  }, [visible])

  useEffect(() => {
    if (cashKey) {
      console.log(cashKey)
    }
  }, [cashKey])

  const handleCancel = () => {
    setVisibleDrawer(false)
    if (onCancel) onCancel()
  }

  return (
    <Drawer
      width='80%'
      title={'现金流量指定'}
      footer={null}
      visible={visibleDrawer}
      onOk={() => {
        setVisibleDrawer(false)
      }}
      onCancel={handleCancel}>
      <div>CashInfo</div>
    </Drawer>
  )
}

export default CashInfo
