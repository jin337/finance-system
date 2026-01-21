import { useEffect } from 'react'

const useWindowResize = (callback, deps = []) => {
  useEffect(() => {
    const handleResize = () => {
      callback()
    }

    // 初始调用
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, deps)
}

export default useWindowResize
