import { Button, Result } from '@arco-design/web-react'

const NotAuth = () => {
  return (
    <div>
      <Result
        status='404'
        subTitle='404 Not Found'
        extra={
          <Button key='back' type='primary'>
            返回
          </Button>
        }></Result>
    </div>
  )
}

export default NotAuth
