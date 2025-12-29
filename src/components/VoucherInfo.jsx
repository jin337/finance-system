import { Drawer } from '@arco-design/web-react'
import { useEffect, useState } from 'react'

const VoucherInfo = ({ visible = false, voucherKey, onCancel }) => {
  const [visibleDrawer, setVisibleDrawer] = useState(false)

  useEffect(() => {
    setVisibleDrawer(!!visible)
  }, [visible])

  useEffect(() => {
    if (voucherKey) {
      console.log(voucherKey)
    }
  }, [voucherKey])

  const handleCancel = () => {
    setVisibleDrawer(false)
    if (onCancel) onCancel()
  }

  return (
    <Drawer
      width='80%'
      title={null}
      footer={null}
      visible={visibleDrawer}
      onOk={() => {
        setVisibleDrawer(false)
      }}
      onCancel={handleCancel}>
      <div>Here is an example text.</div>
      <div>Here is an example text.</div>
    </Drawer>
  )
}

export default VoucherInfo
