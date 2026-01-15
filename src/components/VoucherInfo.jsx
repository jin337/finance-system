import { useEffect, useState } from 'react'

import { Button, Drawer, Space } from '@arco-design/web-react'

// 组件
import CashInfo from 'src/components/CashInfo'
import FileInfo from 'src/components/FileInfo'
const VoucherInfo = ({ visible = false, voucherKey, onCancel }) => {
  const [visibleDrawer, setVisibleDrawer] = useState(false)

  const [visibleCash, setVisibleCash] = useState(false)
  const [cashParams, setCashParams] = useState({})

  const [visibleFile, setVisibleFile] = useState(false)
  const [fileParams, setFileParams] = useState({})
  const [tableTyle, setTableTyle] = useState({})

  useEffect(() => {
    setVisibleDrawer(!!visible)

    if (visible && voucherKey) {
      console.log(voucherKey)
    }
  }, [visible, voucherKey])

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
        onOk={() => setVisibleDrawer(false)}
        onCancel={handleCancel}>
        <div>VoucherInfo</div>
      </Drawer>

      {/* 现金流量指定 */}
      <CashInfo visible={visibleCash} cashParams={cashParams} onCancel={() => setVisibleCash(false)} />

      {/* 附件清单 */}
      <FileInfo visible={visibleFile} fileParams={fileParams} tableTyle={tableTyle} onCancel={() => setVisibleFile(false)} />
    </>
  )
}

export default VoucherInfo
