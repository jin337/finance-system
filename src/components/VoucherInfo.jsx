import { useEffect, useState } from 'react'

import { Button, Drawer, Space } from '@arco-design/web-react'

import CashInfo from 'src/components/CashInfo'
const VoucherInfo = ({ visible = false, voucherKey, onCancel }) => {
  const [visibleDrawer, setVisibleDrawer] = useState(false)

  const [visibleCash, setVisibleCash] = useState(false)

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
    <>
      <Drawer
        width='70%'
        title={
          <Space>
            <div>查看凭证</div>
            <Button type='outline' onClick={() => setVisibleCash(true)}>
              现金流量
            </Button>
          </Space>
        }
        footer={null}
        visible={visibleDrawer}
        onOk={() => {
          setVisibleDrawer(false)
        }}
        onCancel={handleCancel}>
        <div>VoucherInfo</div>
      </Drawer>

      {/* 现金流量指定 */}
      <CashInfo visible={visibleCash} cashKey={voucherKey} onCancel={() => setVisibleCash(false)} />
    </>
  )
}

export default VoucherInfo
