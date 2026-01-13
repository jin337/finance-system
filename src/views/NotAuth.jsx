import { Button, Result } from '@arco-design/web-react'

const NotAuth = () => {
  const onBack = () => {
    window.history.back()
  }
  return (
    <div>
      <Result
        status='404'
        subTitle='404 Not Found'
        extra={
          <Button key='back' type='primary' onClick={onBack}>
            返回
          </Button>
        }></Result>
    </div>
  )
}

export default NotAuth
