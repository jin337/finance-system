import { useSelector } from 'react-redux'

/**
 * 用户权限控制组件
 * @param {string[]} auth - 权限标识数组，如 ['DocAdd', 'DocEdit'] - 有权限时显示
 * @param {string[]} noAuth - 权限标识数组，如 ['DocView'] - 无权限时显示
 * @param {ReactNode} children - 受权限控制的子元素
 * @returns {ReactNode} 根据权限条件返回子元素或 null
 */


const UserPermissions = ({ auth, noAuth, orAuth, children }) => {
  // 从 Redux 获取用户权限列表和管理员状态
  const { parmission, isAdmin } = useSelector((state) => state.commonReducer)

  // 如果是管理员(user_type === 1)，拥有所有权限
  if (isAdmin === 1) {
    // 管理员模式下：
    // - 如果有 auth 属性，显示内容（管理员拥有所有权限）
    // - 如果有 noAuth 属性，不显示内容（管理员不应该看到"无权限"提示）
    return auth ? <>{children}</> : null
  }

  // 处理 noAuth 逻辑（无权限时显示）
  if (noAuth && noAuth.length > 0) {
    // 如果权限列表为空，显示无权限内容
    if (!parmission || parmission.length === 0) {
      return <>{children}</>
    }

    // 检查是否没有任何权限匹配
    const hasNoPermission = !noAuth.some((permission) =>
      parmission.includes(permission)
    )

    // 无权限则显示子元素
    return hasNoPermission ? <>{children}</> : null
  }

  // 处理 orAuth 逻辑（有权限时显示）
  if (orAuth && orAuth.length > 0) {
    // 如果权限列表为空，显示无权限内容
    if (!parmission || parmission.length === 0) {
      return <>{children}</>
    }

    // 检查是否有任意一个权限匹配
    const hasPermission = orAuth.some((permission) =>
      parmission.includes(permission)
    )

    // 有权限则显示子元素，否则不显示
    return hasPermission ? <>{children}</> : null
  }

  // 处理常规 auth 逻辑（有权限时显示）
  if (!auth || auth.length === 0) {
    return null
  }

  // 如果权限列表为空，不显示内容
  if (!parmission || parmission.length === 0) {
    return null
  }

  // 检查是否有任意一个权限匹配
  const hasPermission = auth.some((permission) =>
    parmission.includes(permission)
  )

  // 有权限则显示子元素，否则不显示
  return hasPermission ? <>{children}</> : null
}

export default UserPermissions
