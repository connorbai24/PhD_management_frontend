import BASE_URL from '@/utils/apiConfig.js'

// 通用请求方法
const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    // 添加请求拦截，自动添加token
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}${url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        console.log(`API ${options.method || 'GET'} ${url}:`, res.data)
        
        if (res.data.code === 200) {
          resolve(res.data)
        } else {
          console.error('API Error:', res.data.message || '请求失败')
          // 根据错误码进行不同处理
          if (res.data.code === 401) {
            // token过期，跳转到登录页
            uni.removeStorageSync('token')
            uni.removeStorageSync('teacherInfo')
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }
          reject(new Error(res.data.message || '请求失败'))
        }
      },
      fail: (error) => {
        console.error('Request failed:', error)
        // 网络错误处理
        if (error.errMsg && error.errMsg.includes('timeout')) {
          reject(new Error('请求超时，请检查网络连接'))
        } else {
          reject(new Error('网络请求失败，请稍后重试'))
        }
      }
    })
  })
}

// 教师信息相关API
export const teacherAPI = {
  // 获取教师基本信息
  getProfile: () => {
    return request('/api/v1/teacher/profile')
  },

  // 更新教师基本信息
  updateProfile: (data) => {
    return request('/api/v1/teacher/profile', {
      method: 'PUT',
      data
    })
  }
}

// 研究方向管理API
export const researchAPI = {
  // 获取可选研究方向列表
  getDirections: () => {
    return request('/api/v1/research-directions')
  },

  // 获取教师研究方向
  getTeacherResearchAreas: () => {
    return request('/api/v1/teacher/research-areas')
  },

  // 添加研究方向
  addResearchArea: (name) => {
    return request('/api/v1/teacher/research-areas', {
      method: 'POST',
      data: { name }
    })
  },

  // 删除研究方向
  deleteResearchArea: (areaId) => {
    return request(`/api/v1/teacher/research-areas/${areaId}`, {
      method: 'DELETE'
    })
  },

  // 申请自定义研究方向
  applyCustomDirection: (customDirection) => {
    return request('/api/v1/teacher/custom-research-direction', {
      method: 'POST',
      data: { customDirection }
    })
  }
}

// 专业方向确认API
export const confirmationAPI = {
  // 获取当前研究方向信息
  getResearchConfirmation: () => {
    return request('/api/v1/teacher/research-confirmation')
  },

  // 保存研究方向确认
  saveResearchConfirmation: (direction) => {
    return request('/api/v1/teacher/research-confirmation', {
      method: 'POST',
      data: { direction }
    })
  }
}

// 时间选择相关API
export const timeSelectionAPI = {
  // 获取当前时间配置
  getTimeConfig: () => {
    return request('/api/v1/time-config')
  },

  // 获取用户时间选择
  getUserTimeSelection: () => {
    return request('/api/v1/user/time-selection')
  },

  // 保存用户时间选择
  saveTimeSelection: (selectedSlots) => {
    return request('/api/v1/user/time-selection', {
      method: 'POST',
      data: { selectedSlots }
    })
  },

  // 获取选择截止时间
  getDeadline: () => {
    return request('/api/v1/deadline')
  }
}

// 评审任务相关API
export const reviewAPI = {
  // 获取用户评审任务
  getReviewTasks: () => {
    return request('/api/v1/user/review-tasks')
  },

  // 更新评审任务状态
  updateTaskStatus: (taskId, status, notes = '') => {
    return request(`/api/v1/user/review-tasks/${taskId}/status`, {
      method: 'PUT',
      data: { status, notes }
    })
  }
}

// 通知相关API - 根据API文档完善
export const notificationAPI = {
  // 获取用户通知 - 支持分页和过滤
  getNotifications: (params = {}) => {
    const { page = 1, limit = 20, unreadOnly = false } = params
    const queryStr = `page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`
    return request(`/api/v1/user/notifications?${queryStr}`)
  },

  // 标记通知为已读
  markAsRead: (notificationId) => {
    return request(`/api/v1/user/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  },

  // 检查新通知
  checkNewNotifications: () => {
    return request('/api/v1/user/notifications/check')
  },

  // 标记所有通知为已读 - 新增API
  markAllAsRead: () => {
    return request('/api/v1/user/notifications/read-all', {
      method: 'PUT'
    })
  },

  // 批量标记通知为已读 - 新增API（可选）
  batchMarkAsRead: (notificationIds) => {
    return request('/api/v1/user/notifications/batch-read', {
      method: 'PUT',
      data: { notificationIds }
    })
  },

  // 删除通知 - 新增API（可选）
  deleteNotification: (notificationId) => {
    return request(`/api/v1/user/notifications/${notificationId}`, {
      method: 'DELETE'
    })
  },

  // 批量删除通知 - 新增API（可选）
  batchDeleteNotifications: (notificationIds) => {
    return request('/api/v1/user/notifications/batch-delete', {
      method: 'DELETE',
      data: { notificationIds }
    })
  }
}

// 用户认证相关API
export const authAPI = {
  // 用户登录
  login: (username, password, userType = 'teacher') => {
    return request('/api/v1/auth/login', {
      method: 'POST',
      data: { username, password, userType }
    })
  },

  // 用户登出
  logout: () => {
    return request('/api/v1/auth/logout', {
      method: 'POST'
    })
  },

  // 刷新Token
  refreshToken: (refreshToken) => {
    return request('/api/v1/auth/refresh', {
      method: 'POST',
      data: { refreshToken }
    })
  },

  // 修改密码
  changePassword: (currentPassword, newPassword, confirmPassword) => {
    return request('/api/v1/user/password', {
      method: 'PUT',
      data: { currentPassword, newPassword, confirmPassword }
    })
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return request('/api/v1/user/info')
  }
}

// 工具函数：处理API响应
export const apiUtils = {
  // 处理错误
  handleError: (error, defaultMessage = '操作失败') => {
    console.error('API Error:', error)
    const message = error.message || defaultMessage
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
    return message
  },

  // 显示成功消息
  showSuccess: (message = '操作成功') => {
    uni.showToast({
      title: message,
      icon: 'success',
      duration: 1500
    })
  },

  // 显示加载状态
  showLoading: (title = '加载中...') => {
    uni.showLoading({
      title,
      mask: true
    })
  },

  // 隐藏加载状态
  hideLoading: () => {
    uni.hideLoading()
  },

  // 确认对话框
  showConfirm: (content, title = '提示') => {
    return new Promise((resolve) => {
      uni.showModal({
        title,
        content,
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  },

  // 格式化错误信息
  formatError: (error) => {
    if (typeof error === 'string') return error
    if (error && error.message) return error.message
    if (error && error.data && error.data.message) return error.data.message
    return '操作失败'
  },

  // 处理API响应
  handleResponse: (response, successCallback, errorCallback) => {
    if (response.code === 200) {
      if (typeof successCallback === 'function') {
        successCallback(response.data)
      }
      return response.data
    } else {
      const errorMessage = response.message || '请求失败'
      if (typeof errorCallback === 'function') {
        errorCallback(errorMessage)
      } else {
        apiUtils.handleError(new Error(errorMessage))
      }
      throw new Error(errorMessage)
    }
  }
}

// WebSocket管理 - 增强功能
export const wsManager = {
  ws: null,
  isConnected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectInterval: 3000,
  heartbeatInterval: null,
  heartbeatTimeout: 30000,
  messageHandlers: new Map(), // 消息处理器

  // 连接WebSocket
  connect: (token) => {
    const wsToken = token || uni.getStorageSync('token')
    if (!wsToken) {
      console.warn('No token found, cannot connect to WebSocket')
      return
    }

    try {
      wsManager.ws = uni.connectSocket({
        url: `wss://api.review-system.com/ws?token=${wsToken}`,
        header: {
          'Authorization': `Bearer ${wsToken}`
        }
      })

      wsManager.ws.onOpen(() => {
        console.log('WebSocket连接成功')
        wsManager.isConnected = true
        wsManager.reconnectAttempts = 0
        wsManager.startHeartbeat()
        
        // 触发连接成功事件
        wsManager.emit('connected')
      })

      wsManager.ws.onMessage((res) => {
        try {
          const data = JSON.parse(res.data)
          wsManager.handleMessage(data)
        } catch (error) {
          console.error('WebSocket消息解析失败:', error)
        }
      })

      wsManager.ws.onClose((res) => {
        console.log('WebSocket连接关闭', res)
        wsManager.isConnected = false
        wsManager.stopHeartbeat()
        
        // 触发断开连接事件
        wsManager.emit('disconnected')
        
        // 如果不是主动关闭，尝试重连
        if (res.code !== 1000) {
          wsManager.reconnect()
        }
      })

      wsManager.ws.onError((error) => {
        console.error('WebSocket连接错误:', error)
        wsManager.isConnected = false
        wsManager.stopHeartbeat()
        
        // 触发错误事件
        wsManager.emit('error', error)
      })

    } catch (error) {
      console.error('WebSocket连接失败:', error)
    }
  },

  // 重连WebSocket
  reconnect: () => {
    if (wsManager.reconnectAttempts >= wsManager.maxReconnectAttempts) {
      console.log('WebSocket重连次数已达上限')
      wsManager.emit('reconnectFailed')
      return
    }

    wsManager.reconnectAttempts++
    console.log(`WebSocket重连第${wsManager.reconnectAttempts}次...`)
    
    setTimeout(() => {
      wsManager.connect()
    }, wsManager.reconnectInterval * wsManager.reconnectAttempts) // 递增重连间隔
  },

  // 开始心跳检测
  startHeartbeat: () => {
    if (wsManager.heartbeatInterval) return
    
    wsManager.heartbeatInterval = setInterval(() => {
      if (wsManager.isConnected) {
        wsManager.send({
          type: 'ping',
          timestamp: Date.now()
        })
      }
    }, wsManager.heartbeatTimeout)
  },

  // 停止心跳检测
  stopHeartbeat: () => {
    if (wsManager.heartbeatInterval) {
      clearInterval(wsManager.heartbeatInterval)
      wsManager.heartbeatInterval = null
    }
  },

  // 处理WebSocket消息
  handleMessage: (data) => {
    console.log('收到WebSocket消息:', data)
    
    // 处理心跳响应
    if (data.type === 'pong') {
      return
    }
    
    // 触发对应的消息处理器
    wsManager.emit(data.type, data.data)
    
    switch (data.type) {
      case 'notification':
        // 显示新通知
        uni.showToast({
          title: data.data.title,
          icon: 'none',
          duration: 3000
        })
        // 触发通知更新事件
        uni.$emit('newNotification', data.data)
        break
        
      case 'config_update':
        // 时间配置更新
        uni.showModal({
          title: '时间配置更新',
          content: '管理员已更新评审时间配置，请重新确认您的可用时间',
          showCancel: false,
          success: () => {
            // 刷新当前页面
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            if (currentPage.route.includes('schedule')) {
              // 重新加载时间配置
              uni.$emit('configUpdate', data.data)
            }
          }
        })
        break
        
      case 'research_area_approved':
      case 'research_area_rejected':
        // 研究方向审核结果
        const status = data.data.status === 'approved' ? '通过' : '拒绝'
        uni.showToast({
          title: `研究方向"${data.data.name}"审核${status}`,
          icon: data.data.status === 'approved' ? 'success' : 'none',
          duration: 3000
        })
        uni.$emit('researchAreaUpdate', data.data)
        break
        
      case 'task_assigned':
        // 新评审任务分配
        uni.showToast({
          title: '您有新的评审任务',
          icon: 'none',
          duration: 3000
        })
        uni.$emit('taskAssigned', data.data)
        break
        
      case 'deadline_reminder':
        // 截止时间提醒
        uni.showModal({
          title: '截止时间提醒',
          content: data.data.message || '请及时完成相关操作',
          showCancel: false
        })
        break
        
      default:
        console.log('未知的WebSocket消息类型:', data.type)
    }
  },

  // 事件发射器
  emit: (event, data) => {
    const handlers = wsManager.messageHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error('WebSocket事件处理器执行错误:', error)
        }
      })
    }
  },

  // 添加事件监听器
  on: (event, handler) => {
    if (!wsManager.messageHandlers.has(event)) {
      wsManager.messageHandlers.set(event, [])
    }
    wsManager.messageHandlers.get(event).push(handler)
  },

  // 移除事件监听器
  off: (event, handler) => {
    const handlers = wsManager.messageHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  },

  // 断开WebSocket连接
  disconnect: () => {
    if (wsManager.ws && wsManager.isConnected) {
      wsManager.ws.close({
        code: 1000,
        reason: 'Normal closure'
      })
      wsManager.ws = null
      wsManager.isConnected = false
      wsManager.stopHeartbeat()
    }
  },

  // 发送消息
  send: (data) => {
    if (wsManager.ws && wsManager.isConnected) {
      wsManager.ws.send({
        data: JSON.stringify(data)
      })
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  },

  // 获取连接状态
  getConnectionState: () => {
    return {
      isConnected: wsManager.isConnected,
      reconnectAttempts: wsManager.reconnectAttempts,
      maxReconnectAttempts: wsManager.maxReconnectAttempts
    }
  }
}

// 默认导出所有API
export default {
  teacherAPI,
  researchAPI,
  confirmationAPI,
  timeSelectionAPI,
  reviewAPI,
  notificationAPI,
  authAPI,
  apiUtils,
  wsManager
}