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

// UUID
export const uuid = () => {
  const timestamp = Date.now().toString()
  const randomStr = Math.random().toString(36).substring(2, 15)
  return CryptoJS.MD5(timestamp + randomStr).toString()
}

// 数字转中文大写金额
export const numberToChinese = (num) => {
  // 验证并转换输入参数
  if (num === null || num === undefined || num === '') {
    return ''
  }

  // 尝试转换为数字
  const numericValue = typeof num === 'number' ? num : Number(num)

  // 检查转换后是否为有效数字
  if (isNaN(numericValue) || !isFinite(numericValue)) {
    return ''
  }

  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟']
  const bigUnits = ['', '万', '亿']

  // 处理整数和小数部分
  const [integerPart, decimalPart] = numericValue.toFixed(2).split('.')

  // 转换整数部分
  const convertInteger = (str) => {
    let result = ''
    const len = str.length

    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i])
      const unitIndex = (len - 1 - i) % 4
      const bigUnitIndex = Math.floor((len - 1 - i) / 4)

      if (digit !== 0) {
        result += digits[digit] + units[unitIndex]
      } else {
        // 处理零的情况
        if (result && !result.endsWith('零')) {
          // 如果不是连续的零，则添加零
          if (i > 0 && parseInt(str[i - 1]) !== 0) {
            result += '零'
          }
        }
      }

      // 添加大单位（万、亿）
      if (unitIndex === 0 && bigUnitIndex > 0 && i < len - 1) {
        if (parseInt(str.slice(len - 4 * (bigUnitIndex + 1), len - 4 * bigUnitIndex)) !== 0) {
          result += bigUnits[bigUnitIndex]
        }
      }
    }

    // 清理多余的零
    result = result.replace(/零+/g, '零')
    result = result.replace(/零([万亿])/g, '$1')

    return result
  }

  // 转换整数部分
  let chineseResult = integerPart === '0' ? '零' : convertInteger(integerPart)

  // 处理小数部分
  if (decimalPart) {
    const decimalDigits = decimalPart.split('')
    if (decimalDigits[0] !== '0' || decimalDigits[1] !== '0') {
      chineseResult += '点'
      if (decimalDigits[0] !== '0') {
        chineseResult += digits[parseInt(decimalDigits[0])] + '角'
      }
      if (decimalDigits[1] !== '0') {
        chineseResult += digits[parseInt(decimalDigits[1])] + '分'
      }
    }
  }

  if (chineseResult.includes('点')) {
    return chineseResult + '元'
  } else {
    return chineseResult + '元整'
  }
}
