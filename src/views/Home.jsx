import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { Breadcrumb, Button, Dropdown, Form, Input, Layout, Menu, Message, Modal } from '@arco-design/web-react'
import { IconDown, IconDriveFile, IconRight } from '@arco-design/web-react/icon'

import Logo from 'src/assets/images/logo.png'

import { useDispatch, useSelector } from 'react-redux'
import { setAccount, setCompany, setPageHeight, setParmission, setSelectCompany } from 'src/store/reducers/common'
import { setMenuList, setMenuSelect } from 'src/store/reducers/home'

// 公共方法
import { localClear, localGetItem } from 'src/utils/common'

const HomeList = [
  {
    title: '财务凭证',
    key: '1',
    pathName: '/voucher',
    siderWidth: 0,
  },
  {
    title: '财务报表',
    key: '2',
    pathName: '/report',
    siderWidth: 0,
  },
  {
    title: '税务报表',
    key: '3',
    pathName: '/taxReport',
    siderWidth: 0,
  },
  {
    title: '银行流水单',
    key: '4',
    pathName: '/bank',
    siderWidth: 0,
  },
  {
    title: '辅助账查询',
    key: '6',
    pathName: '/auxiliary',
    siderWidth: 0,
  },
  {
    title: '科目余额查询',
    key: '7',
    pathName: '/balance',
    siderWidth: 0,
  },
  {
    title: '综合询析',
    key: '8',
    siderWidth: 180,
    children: [
      {
        key: '8-1',
        title: '流动资产与债务',
        pathName: '/comprehensive/assetliab',
      },
      {
        key: '8-2',
        title: '费用综合查询',
        pathName: '/comprehensive/expense',
      },
      {
        key: '8-3',
        title: '项目总台账',
        pathName: '/comprehensive/projectTotal',
      },
      {
        key: '8-4',
        title: '项目出入库明细',
        pathName: '/comprehensive/projectInventory',
      },
      {
        key: '8-5',
        title: '项目实际履约表',
        pathName: '/comprehensive/projectActualPerformance',
      },
    ],
  },
  {
    title: '财务明细查询',
    key: '9',
    siderWidth: 290,
    children: [
      {
        key: '9-1',
        title: '资产',
        children: [
          {
            key: '9-1-1',
            title: '应收票据',
            pathName: '/detail/bill-receive',
          },
          {
            key: '9-1-2',
            title: '应收账款',
            pathName: '/detail/account-receive',
          },
          {
            key: '9-1-3',
            title: '其他应收款',
            pathName: '/detail/ohter-receive',
          },
          {
            key: '9-1-4',
            title: '预付账款',
            pathName: '/detail/prepay',
          },
          {
            key: '9-1-5',
            title: '存货',
            children: [
              {
                key: '9-1-5-1',
                title: '存货',
                pathName: '/detail/stock',
              },
              {
                key: '9-1-5-2',
                title: '存货-入库',
                pathName: '/detail/stockIn',
              },
              {
                key: '9-1-5-3',
                title: '存货-出库',
                pathName: '/detail/stockOut',
              },
            ],
          },
          {
            key: '9-1-6',
            title: '长期待摊费用',
            pathName: '/detail/longterm',
          },
          {
            key: '9-1-7',
            title: '固定资产折旧',
            pathName: '/detail/depreciation',
          },
        ],
      },
      {
        key: '9-2',
        title: '负债',
        children: [
          {
            key: '9-2-1',
            title: '短期借款',
            pathName: '/detail/shortbrrow',
          },
          {
            key: '9-2-2',
            title: '应付票据',
            pathName: '/detail/bill-pay',
          },
          {
            key: '9-2-3',
            title: '应付账款',
            pathName: '/detail/account-pay',
          },
          {
            key: '9-2-4',
            title: '预收账款',
            pathName: '/detail/account-receive',
          },
          {
            key: '9-2-5',
            title: '应付工资',
            pathName: '/detail/wages-pay',
          },
          {
            key: '9-2-6',
            title: '应交税金',
            children: [
              {
                key: '9-2-6-1',
                title: '流转税',
                children: [
                  {
                    key: '9-2-6-1-1',
                    title: '应交增值税',
                    pathName: '/detail/taxes',
                  },
                  {
                    key: '9-2-6-1-2',
                    title: '应交增值税-销项-简易征收',
                    pathName: '/detail/taxes/addtaxin',
                  },
                  {
                    key: '9-2-6-1-3',
                    title: '应交增值税-销项-一般征收',
                    pathName: '/detail/taxes/addtaxin-jy',
                  },
                  {
                    key: '9-2-6-1-4',
                    title: '应交增值税-进项',
                    pathName: '/detail/taxes/addtaxout',
                  },
                ],
              },
              {
                key: '9-2-6-2',
                title: '所得税',
                children: [
                  {
                    key: '9-2-6-2-1',
                    title: '应交所得税',
                  },
                ],
              },
              {
                key: '9-2-6-3',
                title: '附加税',
                children: [
                  {
                    key: '9-2-6-3-1',
                    title: '应交附加税',
                  },
                ],
              },
              {
                key: '9-2-6-4',
                title: '应交其他税种',
              },
              {
                key: '9-2-6-5',
                title: '代扣代缴税种',
              },
            ],
          },
          {
            key: '9-2-7',
            title: '其他应付款',
          },
        ],
      },
      {
        key: '9-3',
        title: '费用',
        children: [
          {
            key: '9-3-1',
            title: '销售费用',
            pathName: '/detail/expense-sell',
          },
          {
            key: '9-3-2',
            title: '管理费用',
            pathName: '/detail/expense-manage',
          },
          {
            key: '9-3-3',
            title: '研发费用',
            pathName: '/detail/expense-develop',
          },
          {
            key: '9-3-4',
            title: '财务费用',
            pathName: '/detail/expense-exp',
          },
        ],
      },
    ],
  },
  {
    title: '银行余额查询',
    key: '10',
    pathName: '/bankBalance',
    siderWidth: 0,
  },
  {
    title: '应收应付查询',
    key: '11',
    pathName: '/receivable',
    siderWidth: 0,
  },
  {
    title: '库存余额查询',
    key: '12',
    pathName: '/inventory',
    siderWidth: 0,
  },
  {
    title: '现金流量查询',
    key: '13',
    pathName: '/cashFlow',
    siderWidth: 0,
  },
  {
    title: '受限资金配置',
    key: '14',
    pathName: '/restrictedFunds',
    siderWidth: 0,
  },
]
const sysList = [
  {
    title: '用户管理',
    key: '1',
    pathName: '/userManagement',
  },
  {
    title: '系统授权',
    key: '2',
    pathName: '/systemAuthorization',
  },
  {
    title: '在线用户',
    key: '3',
    pathName: '/onlineUser',
  },
]
// 寻找默认子项
const findChildKey = (item) => {
  if (item?.children && item?.children?.length > 0) {
    return findChildKey(item?.children[0])
  } else {
    return item
  }
}
// 拍平数组
const flatArr = (arr) => {
  if (!arr || !Array.isArray(arr)) return []
  return arr.reduce((acc, item) => {
    acc.push(item)
    if (item.children && Array.isArray(item.children) && item.children.length > 0) {
      acc.push(...flatArr(item.children))
    }
    return acc
  }, [])
}

// 查找索引
const findMenuItemByPath = (arr, path) => {
  if (!arr || !Array.isArray(arr) || !path) return 0
  const item = flatArr(arr).find((e) => e.pathName === path)
  if (!item || !item.key) return 0
  const keyParts = item.key.split('-')
  const key = keyParts.length > 0 ? keyParts[0] : item.key
  const num = arr.findIndex((e) => e.key === key)
  return num !== -1 ? num : 0
}

const Home = () => {
  const [formPwd] = Form.useForm()
  const dispatch = useDispatch()
  const navigation = useNavigate()
  const location = useLocation()

  const PageContainer = useRef()

  const { company, currentCompany, account } = useSelector((state) => state.commonReducer)
  const { menuSelect, menuList } = useSelector((state) => state.homeReducer)
  const [visible, setVisible] = useState(false)

  // 判断是否登录
  useEffect(() => {
    const data = localGetItem('LOGINUSER_INFO')
    if (data) {
      dispatch(setAccount(data))
    } else {
      navigation('/login')
    }
  }, [location])

  // 获取组织列表
  const changeGroupList = async () => {
    // 如果已经有公司数据，不再请求
    if (company && company.length > 0) {
      return
    }
    const params = { page_no: 1, page_size: 99999999, subid: 1 }
    const { code, data } = await Http.post('/group/list', params)
    if (code === 200) {
      dispatch(setCompany(data?.list || []))
      dispatch(setSelectCompany(data?.list[0] || null))
    }
  }

  // 获取权限
  const getParmission = async () => {
    // 如果已经有公司数据，不再请求
    if (account && account.id) {
      return
    }
    const { code, data } = await Http.post('/user/grant/list')
    if (code === 200) {
      dispatch(setParmission(data?.grant || []))
    }
  }

  useEffect(() => {
    if (account) {
      getParmission()
      changeGroupList()
    }
  }, [account])

  // 监听窗口大小改变
  useEffect(() => {
    if (!PageContainer.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        dispatch(setPageHeight(entry.target.offsetHeight))
      }
    })

    resizeObserver.observe(PageContainer.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // 页面跳转
  const onMenuSelect = (item) => {
    dispatch(setMenuSelect(item))
    if (item?.childrenSelect?.pathName) {
      navigation(item?.childrenSelect?.pathName)
    } else {
      navigation(item?.pathName)
    }
  }

  // 返回首页-默认跳转页面
  const onBackHome = () => {
    const pathname = location.pathname || ''
    if (!pathname.startsWith('/')) return // 防止路径遍历攻击

    let num = findMenuItemByPath(sysList, pathname)
    const targetList = num ? sysList : HomeList
    num = findMenuItemByPath(targetList, pathname)

    let selectedItem = num >= 0 ? targetList[num] : targetList[0]
    if (!selectedItem) return

    dispatch(setMenuList(targetList))

    const childrenItem = flatArr(targetList).find((e) => e.pathName === pathname)

    selectedItem = {
      ...selectedItem,
      childrenSelect: selectedItem?.children?.length > 0 ? childrenItem : null,
    }
    onMenuSelect(selectedItem)
  }

  useEffect(() => {
    onBackHome()
  }, [])

  // 导航切换
  const onMenuItem = (e) => {
    let item = menuList.find((menu) => menu.key === e)

    if (item) {
      item = {
        ...item,
        childrenSelect: item?.children?.length > 0 ? findChildKey(item) : null,
      }
      onMenuSelect(item)
    }
  }
  const onChildrenItem = (e) => {
    const findItem = (arr, key) => {
      for (const item of arr) {
        if (item.key === key) {
          return item
        }
        if (item.children && item.children.length > 0) {
          const found = findItem(item.children, key)
          if (found) {
            return found
          }
        }
      }
      return null
    }

    const item = findItem(menuSelect.children, e)
    const newItem = {
      ...menuSelect,
      childrenSelect: item,
    }
    onMenuSelect(newItem)
  }

  // 系统管理切换
  const onSysItem = (e) => {
    const item = sysList.find((menu) => menu.key === e)
    // 系统管理
    if (item?.key === '1') {
      dispatch(setMenuList(sysList))
      onMenuSelect(sysList[0])
    }
    // 修改密码
    if (item?.key === '2') {
      setVisible(true)
      formPwd.resetFields()
    }
    // 退出登录
    if (item?.key === '3') {
      Modal.confirm({
        title: '提示',
        content: <div className='text-center'>确定注销并退出系统吗？</div>,
        onOk: () => {
          exitAccount()
        },
      })
    }
  }

  // 切换公司
  const onComponySelect = (e) => {
    const companyItem = company.find((item) => Number(item.id) === Number(e))
    dispatch(setSelectCompany(companyItem))
  }

  // 修改密码
  const submitPwd = () => {
    formPwd.validate().then(async (values) => {
      const params = {
        oldpwd: values.oldpwd,
        newpwd: values.newpwd,
      }
      const { code, message } = await Http.post('/user/chgpwd', params)
      if (code === 200) {
        Message.success('密码修改成功，请重新登录')
        localClear('LOGINCODE_INFO')
        exitAccount()
      } else {
        Message.error(message)
      }
    })
    setVisible(false)
  }
  // 自定义密码验证规则
  const checkPasswordRules = (value, callback) => {
    if (!value) {
      return callback('请输入密码')
    }

    if (value.length < 6 || value.length > 20) {
      return callback('密码长度必须在6到20个字符之间')
    }

    if (value.includes('^')) {
      return callback('密码不能包含^字符')
    }

    return Promise.resolve()
  }
  const checkNewPassword = (value, callback) => {
    if (!value) {
      return callback('请输入新密码')
    }

    if (value.length < 6 || value.length > 20) {
      return callback('密码长度必须在6到20个字符之间')
    }

    if (value.includes('^')) {
      return callback('密码不能包含^字符')
    }

    const oldPassword = formPwd.getFieldValue('oldpwd')
    if (oldPassword && value === oldPassword) {
      return callback('新密码不能与旧密码相同')
    }

    return Promise.resolve()
  }
  const checkConfirmPassword = (value, callback) => {
    if (!value) {
      return callback('请确认新密码')
    }

    const newPassword = formPwd.getFieldValue('newpwd')
    if (newPassword && value !== newPassword) {
      return callback('两次输入的密码不一致')
    }

    return Promise.resolve()
  }

  // 退出登录
  const exitAccount = async () => {
    const { code } = await Http.post('/logout')
    if (code === 200) {
      localClear('LOGINUSER_INFO')
      navigation('/login')
    }
  }

  return (
    <>
      <Layout className='h-screen w-screen overflow-hidden bg-neutral-100'>
        <Layout.Header className='h-16 bg-white shadow-md'>
          <div className='flex h-full items-center justify-between px-6'>
            <div className='flex cursor-pointer items-center gap-2 text-xl font-bold' onClick={onBackHome}>
              <img className='h-8 w-8' src={Logo} alt='logo' />
              {currentCompany?.name}财务系统
            </div>
            <Dropdown
              droplist={
                <Menu onClickMenuItem={onSysItem}>
                  <Menu.Item key='1'>系统管理</Menu.Item>
                  <Menu.Item key='2'>修改密码</Menu.Item>
                  <Menu.Item key='3'>退出登录</Menu.Item>
                </Menu>
              }
              position='br'
              trigger='click'>
              <Button type='text'>
                {account?.user_name} <IconDown />
              </Button>
            </Dropdown>
          </div>
        </Layout.Header>
        <Layout className='h-full'>
          <Layout.Header className='flex h-11 w-full items-center px-6'>
            <Breadcrumb separator={<IconRight />}>
              <Breadcrumb.Item key='1' onClick={onBackHome} className='cursor-pointer'>
                首页
              </Breadcrumb.Item>
              {/* 判断账套数量 */}
              {company.length > 1 ? (
                <Breadcrumb.Item
                  key='2'
                  droplist={
                    <Menu onClickMenuItem={onComponySelect}>
                      {company.map((item) => (
                        <Menu.Item key={item.id}>{item.name}</Menu.Item>
                      ))}
                    </Menu>
                  }>
                  {currentCompany?.name}
                </Breadcrumb.Item>
              ) : (
                <Breadcrumb.Item key='2'>{currentCompany?.name}</Breadcrumb.Item>
              )}
              <Breadcrumb.Item key='3'>{menuSelect?.title}</Breadcrumb.Item>
            </Breadcrumb>
          </Layout.Header>
          <Layout className='h-[calc(100%-108px)] overflow-hidden border-y border-neutral-200'>
            <Layout.Sider width={170} className='h-full'>
              <Menu onClickMenuItem={onMenuItem} selectedKeys={[menuSelect?.key]}>
                {menuList.map((item) => (
                  <Menu.Item key={item.key}>
                    <IconDriveFile style={{ fontSize: '16px' }} />
                    {item.title}
                  </Menu.Item>
                ))}
              </Menu>
            </Layout.Sider>
            {menuSelect?.children?.length > 0 ? (
              <Layout.Sider width={menuSelect.siderWidth} className='h-full overflow-y-auto'>
                <Menu
                  className='h-[calc(100%-62px)] overflow-y-auto'
                  autoOpen
                  onClickMenuItem={onChildrenItem}
                  selectedKeys={[menuSelect?.childrenSelect?.key]}>
                  {menuSelect?.children?.map((item) => {
                    const renderMenuItem = (menuItem) => {
                      if (menuItem.children && menuItem.children.length > 0) {
                        return (
                          <Menu.SubMenu key={menuItem.key} title={<span className='font-bold'>{menuItem.title}</span>}>
                            {menuItem.children.map(renderMenuItem)}
                          </Menu.SubMenu>
                        )
                      } else {
                        return (
                          <Menu.Item key={menuItem.key} className='leading-9!' disabled={!menuItem?.pathName}>
                            {menuItem.title}
                          </Menu.Item>
                        )
                      }
                    }
                    return renderMenuItem(item)
                  })}
                </Menu>
              </Layout.Sider>
            ) : null}
            <Layout.Content ref={PageContainer} className='h-full overflow-hidden border-l border-neutral-200 bg-white'>
              <Outlet />
            </Layout.Content>
          </Layout>
        </Layout>
      </Layout>

      {/* 修改密码 */}
      <Modal
        title='修改密码'
        visible={visible}
        onOk={() => submitPwd()}
        onCancel={() => setVisible(false)}
        autoFocus={false}
        focusLock={true}>
        <Form
          form={formPwd}
          autoComplete='off'
          validateMessages={{ required: (_, { label }) => `${label}是必填项` }}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}>
          <Form.Item rules={[{ required: true }, { validator: checkPasswordRules }]} label='旧密码' field='oldpwd'>
            <Input.Password placeholder='请输入...' />
          </Form.Item>
          <Form.Item rules={[{ required: true }, { validator: checkNewPassword }]} label='新密码' field='newpwd'>
            <Input.Password placeholder='请输入...' />
          </Form.Item>
          <Form.Item rules={[{ required: true }, { validator: checkConfirmPassword }]} label='确认新密码' field='confirmpwd'>
            <Input.Password placeholder='请输入...' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Home
