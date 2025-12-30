import CryptoJS from 'crypto-js' // 添加加密库
import dayjs from 'dayjs'

// 设置数据并附加过期时间戳
export const localSetItem = (key, value, time) => {
  const now = Date.now()
  const item = {
    value: value,
  }
  if (time) {
    item.expiry = now + time
  }
  localStorage.setItem(key, JSON.stringify(item))
}

// 获取数据，如果数据已过期则返回null
export const localGetItem = (key) => {
  const itemStr = localStorage.getItem(key)
  if (!itemStr) {
    return null
  }
  const item = JSON.parse(itemStr)
  const now = Date.now()
  if (now > item.expiry) {
    // 数据已过期，删除它
    localStorage.removeItem(key)
    return null
  }
  return item.value
}

// 清空本地数据
export const localClear = (key) => {
  localStorage.removeItem(key)
}
localClear.all = () => {
  localStorage.clear()
}

// 加密函数
export const encryptData = (data) => {
  const secretKey = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key'
  const dataToEncrypt = typeof data === 'string' ? data : JSON.stringify(data)
  return CryptoJS.AES.encrypt(dataToEncrypt, secretKey).toString()
}

// 解密函数
export const decryptData = (encryptedData) => {
  try {
    const secretKey = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key'
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey)
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8)

    // 尝试解析为JSON对象，如果不是有效的JSON则返回原始字符串
    try {
      return JSON.parse(decryptedData)
    } catch {
      return decryptedData
    }
  } catch (error) {
    console.error('解密失败:', error)
    return null
  }
}

// 千位分割符
export const formatNumber = (num) => {
  // 处理非数字类型输入
  if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
    return ''
  }

  // 先保留两位小数，然后进行千位分割
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 下载文件
export const downloadFile = (response, name, suffix) => {
  const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss')
  const fileName = `${name}-${timestamp}.${suffix}`

  // 创建临时 URL
  const downloadUrl = window.URL.createObjectURL(response)

  // 创建 <a> 标签并触发点击
  const link = document.createElement('a')
  link.href = downloadUrl
  link.setAttribute('download', fileName) // 指定下载文件名
  document.body.appendChild(link)
  link.click()

  // 清理
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}
