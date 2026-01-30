import { useState } from 'react'
import { useSelector } from 'react-redux'

import { Button, Checkbox, Form, Layout, Table, Tree } from '@arco-design/web-react'
import { useEffect } from 'react'

// 获取有子项的key
const getChildrenId = (list, key) => {
  return list.reduce((acc, item) => {
    if (item.children && item.children.length > 1) {
      acc.push(item[key])
    }

    if (item.children && Array.isArray(item.children)) {
      acc = acc.concat(getChildrenId(item.children, key))
    }

    return acc
  }, [])
}

const AccountInfo = ({ accountParams, onSelect }) => {
  const { pageHeight } = useSelector((state) => state.commonReducer)
  const [accountForm] = Form.useForm()

  const [accountClassList, setAccountClassList] = useState([])
  const [accountList, setAccountList] = useState([])
  const [selectRowAccount, setSelectRowAccount] = useState()

  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState()
  const [treeExpandedKeys, setTreeExpandedKeys] = useState([])

  // 会计类别
  const getAccountClassList = async () => {
    const { code, data } = await Http.post(`/account/class/list`)
    if (code === 200) {
      const list = data?.list || []
      const treeData = [
        {
          id: 0,
          name: accountParams.shortname,
          children: list,
        },
      ]
      setAccountClassList(treeData)

      const key = accountParams?.classid ? accountParams?.classid : list[0].id
      getAccountList(key)
    }
  }
  // 会计科目
  const getAccountList = async (classid) => {
    setSelectedKeys(classid)

    const values = accountForm.getFields()
    const params = {
      classid: classid,
      haslevel: values?.haslevel ? '1' : '0',
      isuse: values?.isuse ? '1' : null,
    }
    const { code, data } = await Http.post('/account/list', params)
    if (code === 200) {
      const list = data?.list || []
      setAccountList(list)
    }
  }

  // 展开关闭
  const onExpand = (e, expanded) => {
    setExpandedRowKeys((prev) => (expanded ? [...prev, e.id] : prev.filter((id) => id !== e.id)))
  }

  // 会计科目勾选项监控
  const onChangeAccount = (v, vs) => {
    const key = Object?.keys(v)[0]
    if (key === 'open') {
      const keys = getChildrenId(accountList, 'id')
      setExpandedRowKeys(vs?.open ? keys : [])
    } else {
      getAccountList(selectedKeys)
    }
  }

  useEffect(() => {
    getAccountClassList()

    accountForm.setFieldsValue({
      open: false,
      haslevel: true,
    })

    setSelectRowAccount(null)
  }, [])

  useEffect(() => {
    const initialKeys = accountClassList.map((item) => item.id)
    setTreeExpandedKeys(initialKeys)
  }, [accountClassList])

  return (
    <Layout>
      <Layout.Sider width={200} className='pr-4! shadow-none!'>
        {accountClassList?.length > 0 && (
          <Tree
            blockNode
            expandedKeys={treeExpandedKeys}
            selectedKeys={[selectedKeys]}
            fieldNames={{
              key: 'id',
              title: 'name',
            }}
            treeData={accountClassList}
            onSelect={(e) => getAccountList(e[0])}
            onExpand={(e) => setTreeExpandedKeys(e)}
          />
        )}
      </Layout.Sider>
      <Layout>
        <Layout.Header>
          <Form layout='inline' size='small' autoComplete='off' form={accountForm} onChange={onChangeAccount}>
            <Form.Item field={'haslevel'} triggerPropName='checked'>
              <Checkbox>包含下级节点</Checkbox>
            </Form.Item>
            <Form.Item field={'open'} triggerPropName='checked'>
              <Checkbox>全部展开</Checkbox>
            </Form.Item>
            <Form.Item field={'isuse'} triggerPropName='checked'>
              <Checkbox>常用科目</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type='primary' onClick={() => onSelect(selectRowAccount)} disabled={!selectRowAccount?.id}>
                确认选择
              </Button>
            </Form.Item>
          </Form>
        </Layout.Header>
        <Layout.Content>
          <Table
            size='small'
            rowKey={'id'}
            border
            borderCell
            columns={[
              { title: '编码', dataIndex: 'code' },
              { title: '名称', dataIndex: 'name' },
              { title: '助记码', dataIndex: 'mmcode', width: 100 },
              { title: '余额方向', dataIndex: 'direct', width: 90 },
              { title: '辅助账', dataIndex: 'assist' },
            ]}
            data={accountList}
            pagination={false}
            onExpand={onExpand}
            expandedRowKeys={expandedRowKeys}
            scroll={{ y: pageHeight - 40 }}
            rowClassName={(record) => record.id === selectRowAccount?.id && 'table-select'}
            onRow={(record) => {
              return {
                onClick: () => setSelectRowAccount(record),
                onDoubleClick: () => onSelect(record),
              }
            }}
          />
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
export default AccountInfo
