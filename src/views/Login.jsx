import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Button, Checkbox, Form, Input, Layout, Message, Modal } from '@arco-design/web-react'
import { IconLock, IconUser } from '@arco-design/web-react/icon'

import { useDispatch } from 'react-redux'
import { setAccount } from 'src/store/reducers/common'
// 公共方法
import { decryptData, encryptData, localClear, localGetItem, localSetItem } from 'src/utils/common'
const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formLogin] = Form.useForm()
  const [formCode] = Form.useForm()

  const captchaLength = 6 // 验证码长度
  const inputRefs = useRef([]) // 用于管理输入框引用

  const [userInfo, setUserInfo] = useState() // 存储登录用户信息
  const [visible, setVisible] = useState(false)
  const [qrCodeImage, setQrCodeImage] = useState() // 存储二维码图片地址

  // 替换为：
  const [remember, setRemember] = useState(() => (localGetItem('LOGINCODE_INFO') ? true : false))

  // 记住密码-还原
  useEffect(() => {
    const loginForm = localGetItem('LOGINCODE_INFO')
    if (loginForm) {
      // 解密数据
      const user = decryptData(loginForm)
      if (user) {
        // 填充表单数据
        formLogin.setFieldsValue(user)
      }
    }
  }, [])
  // 打开验证码模态框
  const openCode = () => {
    formLogin.validate().then(async (values) => {
      const params = {
        usercode: values.usercode,
        password: values.password,
      }
      const { code, data } = await Http.post('/login', params)
      if (code === 200) {
        setUserInfo(data)
        // 记住密码
        if (values.remember) {
          localSetItem('LOGINCODE_INFO', encryptData(values), 7 * 24 * 60 * 60 * 1000) // 存储7天
          setRemember(true)
        } else {
          localStorage.removeItem('LOGINCODE_INFO')
          setRemember(false)
        }

        if (data.totp === 1 || data.totp === '1') {
          // 验证成功，显示模态框
          setVisible(true)
          formCode.resetFields()
          setQrCodeImage()
          const type = await Http.post(
            '/verify_qrcode',
            {},
            {
              responseType: 'blob',
              headers: { Token: data.token },
            }
          )
          if (type && type.size > 40) {
            const imageUrl = URL.createObjectURL(type)
            setQrCodeImage(imageUrl)
          }

          // 聚焦第一个输入框
          setTimeout(() => {
            if (inputRefs.current[0]) {
              inputRefs.current[0].focus()
            }
          }, 100)
        } else {
          dispatch(setAccount(data))
          localSetItem('LOGINUSER_INFO', data, 24 * 60 * 60 * 1000) // 存储24小时
          navigate('/voucher')
        }
      } else {
        Message.error('登录失败，请检查账号密码')
      }
    })
  }

  // 处理记住密码复选框变化
  const onRememberChange = (value) => {
    setRemember(value)
    formLogin.setFieldsValue({ remember: value })
  }

  // 输入框聚焦时全选内容
  const onFocus = (e) => {
    e.target.select()
  }

  // 自动跳转到下一个输入框
  const onInput = (index) => {
    // 获取当前字段的值
    const formValues = formCode.getFieldsValue()
    const currentValue = formValues.code?.[index]

    // 如果输入了值且不是最后一个输入框，则聚焦到下一个输入框
    if (currentValue && index < captchaLength - 1) {
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus()
        }
      }, 50)
    }

    // 如果是最后一个输入框且已填入值，则检查是否可以自动提交
    if (currentValue && index === captchaLength - 1) {
      // 检查所有输入框是否都已填写
      setTimeout(() => {
        const values = formCode.getFieldsValue()
        const filledCount = values.code?.filter((val) => val && val !== '').length || 0
        if (filledCount === captchaLength) {
          submitCode()
        }
      }, 100)
    }
  }

  // 登录-验证码提交
  const submitCode = () => {
    formCode.validate().then(async (values) => {
      const codes = values.code.join('')
      // 校验验证码是否为6位数字
      if (codes.length === 6 && /^\d{6}$/.test(codes)) {
        const { code } = await Http.post(
          '/verify',
          { verify_code: codes },
          {
            headers: { Token: userInfo.token },
          }
        )
        if (code === 200) {
          dispatch(setAccount(userInfo))
          localSetItem('LOGINUSER_INFO', userInfo, 24 * 60 * 60 * 1000) // 存储24小时
          // 验证成功，关闭模态框并跳转页面
          setVisible(false)
          navigate('/voucher')
        } else {
          localClear.all()
          dispatch(setAccount(null))

          Message.error('登录失败')
          return false
        }
      } else {
        Message.error('请输入有效的6位数字动态口令')
        return false
      }
    })
  }

  return (
    <>
      <Layout className='relative flex h-screen w-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-200'>
        <div className='login-elements'>
          <div className='login-circle login-circle1'></div>
          <div className='login-circle login-circle2'></div>
          <div className='login-circle login-circle3'></div>
        </div>
        <div className='z-10 flex w-3xl items-center overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:translate-y-[-5px]'>
          <div className='relative flex h-full flex-1 flex-col items-center justify-center bg-linear-to-br from-[#2a9d8f] to-[#52b788] p-10 opacity-80'>
            <div className='login-line'></div>
            <div className='login-dots'>
              <div className='login-dot login-dot1'></div>
              <div className='login-dot login-dot2'></div>
              <div className='login-dot login-dot3'></div>
              <div className='login-dot login-dot4'></div>
            </div>
            <div className='login-logo-circle'>
              <div className='login-rotate'></div>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='60'
                height='60'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#fffffff2'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <rect width='18' height='12' x='3' y='4' rx='2' ry='2'></rect>
                <line x1='2' x2='22' y1='20' y2='20'></line>
              </svg>
            </div>
            <div className='mb-3 text-3xl font-bold text-white'>财务系统</div>
            <div className='text-lg text-white'>科中信息</div>
          </div>
          <div className='flex-1 px-12 py-20'>
            <div className='mb-2 text-2xl font-bold'>欢迎登录</div>
            <div className='mb-10 text-sm text-neutral-500'>请输入账号信息继续</div>
            <Form form={formLogin} layout='vertical' size='large' autoComplete='off'>
              <Form.Item field='usercode'>
                <Input prefix={<IconUser />} placeholder='账号' />
              </Form.Item>
              <Form.Item field='password'>
                <Input.Password prefix={<IconLock />} placeholder='密码' />
              </Form.Item>
              <Form.Item field='remember'>
                <Checkbox checked={remember} onChange={onRememberChange}>
                  记住密码
                </Checkbox>
              </Form.Item>
              <Form.Item noStyle>
                <Button long type='primary' className='login-submit' onClick={openCode}>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <div className='mt-5 text-xs text-neutral-500'>本平台为互联网非涉密平台，严禁处理、传输国家秘密。</div>
      </Layout>

      {/* 动态口令验证 */}
      <Modal
        title='动态口令验证'
        visible={visible}
        onCancel={() => setVisible(false)}
        autoFocus={false}
        focusLock={true}
        className='w-106!'
        onOk={submitCode}>
        {qrCodeImage ? <img className='w-full' src={qrCodeImage} alt='二维码' /> : null}
        <Form form={formCode} className='flex-nowrap! py-4' autoComplete='off' layout='inline' size='large'>
          {Array.from({ length: captchaLength }, (_, index) => (
            <Form.Item key={index} field={`code[${index}]`} className={index === captchaLength - 1 ? 'mr-0!' : ''}>
              <Input
                ref={(el) => (inputRefs.current[index] = el)}
                maxLength={1}
                className='font-bold'
                onFocus={onFocus}
                onChange={() => onInput(index)}
              />
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  )
}

export default Login
