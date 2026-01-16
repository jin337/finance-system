import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import { Button, Checkbox, DatePicker, Form, Input, Layout, Space, Tag } from '@arco-design/web-react'

// 组件
import CashInfo from 'src/components/CashInfo'
import FileInfo from 'src/components/FileInfo'

// 数据状态
const buttonlist = [
  { id: '', name: '全部', color: '#606266' },
  { id: '-1', name: '暂存', color: '#df4126' },
  { id: '0', name: '待提交', color: '#D78400' },
  { id: '3', name: '待审核', color: '#606266' },
  { id: '1', name: '已审核', color: '#3F9D06' },
  { id: '2', name: '未通过', color: '#d9330d' },
  { id: '5', name: '作废', color: '#ddd' },
  { id: '999', name: '无附件', color: '#606266' },
  { id: '888', name: '关联交易', color: '#606266' },
]
// 页面状态
const stateList = [
  { id: 1, name: '新建' },
  { id: 2, name: '查看' },
  { id: 3, name: '编辑' },
]
const VoucherDetail = () => {
  const [pageForm] = Form.useForm()
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = params
  const { state } = location

  const [pageProof, setPageProof] = useState()
  const [pageBill, setPageBill] = useState()
  const [pageType, setPageType] = useState()

  const [visibleCash, setVisibleCash] = useState(false)
  const [visibleImg, setVisibleImg] = useState(false)

  // 页面数据
  const getPageInfo = async (id) => {
    const { code, data } = await Http.post(`/proof/info/${id}`)
    if (code === 200) {
      let { proof, bill, ...rest } = data || {}

      const key = buttonlist.find((item) => item.id == proof.status) || {}

      setPageBill(bill)
      setPageProof(() => ({
        ...proof,
        status_name: key?.name,
        status_color: key?.color,
      }))
      setPageType((prev) => ({
        ...prev,
        ...rest,
      }))
    }
  }

  useEffect(() => {
    const stateInfo = stateList.find((item) => item.id == state?.type)
    setPageType((prev) => ({ ...prev, ...stateInfo }))
  }, [state])

  useEffect(() => {
    if (id !== 'create') {
      getPageInfo(id)
    }
  }, [id])
  return (
    <>
      <Layout>
        <Layout.Header className='flex items-center justify-between border-b border-neutral-200 px-5 py-3'>
          <Space size='medium'>
            <div className='space-x-1 text-base'>{pageType?.name}凭证</div>
            <div className='space-x-1 text-base'>{pageProof?.vno}</div>
            {pageType?.id !== 1 && <Tag color={pageProof?.status_color}>{pageProof?.status_name}</Tag>}
            {pageType?.id == 2 && pageType.is_cash_check && (
              <Button type='secondary' size='small' onClick={() => setVisibleCash(true)}>
                现金流量
              </Button>
            )}
          </Space>
          <Space size='medium'>
            {pageType?.id === 2 && (
              <>
                {[-1, 0, 2, 3].includes(pageProof?.status) && (
                  <Button type='primary' shape='round' size='small'>
                    编辑
                  </Button>
                )}
                {pageProof?.status == 3 && (
                  <Button type='primary' shape='round' size='small'>
                    审核
                  </Button>
                )}
              </>
            )}
            <Button type='primary' shape='round' size='small'>
              {pageType?.id === 2 ? '返回' : '取消'}
            </Button>
          </Space>
        </Layout.Header>
        <Layout.Content>
          <Form
            className='border-b border-neutral-200 p-5 pb-0'
            size='small'
            form={pageForm}
            autoComplete='off'
            labelCol={{ style: { flexBasis: 100 } }}
            wrapperCol={{ style: { flexBasis: `calc(100% - ${100}px)` } }}>
            <Space>
              <Form.Item label='记账日期' field='pdate' rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item label='业务日期' field='bdate' rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item label='附件张数' field='attachs'>
                <Input.Group compact>
                  <Input disabled style={{ width: '75%' }} />
                  <Button type='primary' size='small' style={{ width: '25%' }} onClick={() => setVisibleImg(true)}>
                    附件
                  </Button>
                </Input.Group>
              </Form.Item>
              <Form.Item label='业务类型' field='vtype' rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Space>
            <Space>
              <Form.Item label='会计期间' field='range' rules={[{ required: true }]}>
                <Input disabled />
              </Form.Item>
              <Form.Item label='参考信息' field='rmsg'>
                <Input />
              </Form.Item>
              <Form.Item field='isrelatetrans' triggerPropName={'checked'} wrapperCol={'auto'}>
                <Checkbox className='ml-5'>是否是关联交易</Checkbox>
              </Form.Item>
            </Space>
          </Form>
        </Layout.Content>
      </Layout>

      {/* 现金流量 */}
      <CashInfo
        visible={visibleCash}
        cashParams={pageProof}
        onCancel={() => {
          setVisibleCash(false)
        }}
      />

      {/* 附件清单 */}
      <FileInfo
        visible={visibleImg}
        fileParams={pageProof}
        tableTyle={{ finish: false, ischeckout: pageProof?.ischeckout, status: pageProof?.status }}
        onCancel={() => {
          setVisibleImg(false)
        }}
      />
    </>
  )
}
export default VoucherDetail
