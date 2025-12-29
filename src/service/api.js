import axios from 'axios'
import { localGetItem } from 'src/utils/common'

const Http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器
Http.interceptors.request.use(
  (config) => {
    const Authorization = localGetItem('LOGINUSER_INFO')
    if (Authorization) {
      config.headers.Token = Authorization.token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
Http.interceptors.response.use(
  (response) => {
    const { data, request } = response
    if (data.code === 200 || request.responseType === 'blob') {
      return Promise.resolve(data)
    } else {
      console.log(data.message || data.error)
      return Promise.reject(data.message || data.error)
    }
  },
  (error) => {
    const { response } = error
    if ([401, 404].includes(response?.data?.code)) {
      // 无效code,跳转至域名
      localStorage.clear()
      sessionStorage.clear()
      console.log(response?.data.message)
      setTimeout(() => {
        window.location.href = window.location.protocol + '//' + window.location.host + '/login'
      }, 1000)
    } else Promise.reject(error)
  }
)

export default Http
