import { useState } from 'react'

import { Button, Descriptions, Layout, Menu } from '@arco-design/web-react'
import { IconUser } from '@arco-design/web-react/icon'
import { useEffect } from 'react'

import { Message } from '@arco-design/web-react'
import CheckList from './CheckList'

import { useSelector } from 'react-redux'

const SystemAuthorization = () => {
  const { company } = useSelector((state) => state.commonReducer)
  const [groupSelectedKeys, setGroupSelectedKeys] = useState()
  const [userSelectedKeys, setUserSelectedKeys] = useState()

  const [groupList, setGroupList] = useState(company)
  const [userList, setUserList] = useState([])
  const [permissionList, setPermissionList] = useState([])
  const [permissionSelect, setPermissionSelect] = useState([])

  // 选择用户
  const onUserSelect = async (e, groupId) => {
    // 设置当前用户的权限数据
    setUserSelectedKeys(String(e))
    const params = { groupid: Number(groupId), uid: Number(e) }
    const { code, data } = await Http.post('/grant/list', params)
    if (code === 200) {
      setPermissionList(data?.list || [])
    }
  }

  // 处理权限数据变化
  const onChangeSelect = (moduleId, selectedValues, ids) => {
    setPermissionSelect(ids)
  }

  // 选择组织
  const onGroupSelect = (e) => {
    setGroupSelectedKeys(String(e))
    getUserList(e)
  }

  // 获取用户列表
  const getUserList = async (groupId) => {
    const params = { page_no: 1, page_size: 99999999 }
    const { code, data } = await Http.post('/user/list', params)
    if (code === 200) {
      // 获取用户列表 - 过滤掉user_type为1的用户
      const list = (data?.list || []).filter((item) => item.user_type !== 1)
      setUserList(list)
      onUserSelect(list[0]?.user_id, groupId)
    }
  }

  useEffect(() => {
    if (company) {
      setGroupList(company)
      onGroupSelect(company[0]?.id)
    }
  }, [company])

  // 提交授权
  const submitGrant = async () => {
    const params = {
      groupid: Number(groupSelectedKeys),
      uid: Number(userSelectedKeys),
      grant: permissionSelect.map((e) => Number(e)),
    }
    const { code } = await Http.post('/grant/set', params)
    if (code === 200) {
      Message.success('授权成功')
      onUserSelect(userSelectedKeys, groupSelectedKeys)
    }
  }

  return (
    <Layout className='w-full h-full'>
      <Layout.Sider width='245px' className='h-full border-r border-neutral-200'>
        <Menu selectedKeys={[groupSelectedKeys]} onClickMenuItem={onGroupSelect}>
          {groupList?.map((item) => (
            <Menu.Item key={item.id}>
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='arco-icon arco-icon-building'>
                <path d='M10 12h4' />
                <path d='M10 8h4' />
                <path d='M14 21v-3a2 2 0 0 0-4 0v3' />
                <path d='M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2' />
                <path d='M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16' />
              </svg>
              {item.name}
            </Menu.Item>
          ))}
        </Menu>
      </Layout.Sider>
      <Layout>
        <Layout.Header className='flex justify-between items-center py-3 px-7 border-b border-neutral-200'>
          <div className='text-base font-extrabold'>授权用户</div>
          <Button shape='round' type='primary' onClick={() => submitGrant()}>
            确认
          </Button>
        </Layout.Header>
        <Layout>
          <Layout.Sider width='245px' className='h-full border-r border-neutral-200'>
            <Menu selectedKeys={[userSelectedKeys]} onClickMenuItem={(e) => onUserSelect(e, groupSelectedKeys)}>
              {userList?.map((item) => (
                <Menu.Item key={item.user_id}>
                  <IconUser />
                  {item.user_name}
                </Menu.Item>
              ))}
            </Menu>
          </Layout.Sider>
          <Layout.Content>
            <Descriptions
              column={1}
              size='large'
              border
              labelStyle={{ fontWeight: 'bold' }}
              className='-m-px'
              data={CheckList({ data: permissionList, onChange: onChangeSelect })}
            />
          </Layout.Content>
        </Layout>
      </Layout>
    </Layout>
  )
}
export default SystemAuthorization
