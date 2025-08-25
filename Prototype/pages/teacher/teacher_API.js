// 假设 token 来自本地存储或全局状态
const getToken = () => uni.getStorageSync('token') || '';

// 通用请求处理函数
const request = (options) => {
  return new Promise((resolve, reject) => {
    console.log(`发起API请求: ${options.method} ${options.url}`);
    uni.request({
      ...options,
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        console.log(`API请求成功 [${options.method} ${options.url}]:`, res);
        if (res.data.code === 200) {
          resolve(res.data);
        } else {
          // 特殊处理401未授权
          if (res.data.code === 401) {
            uni.removeStorageSync('token');
            uni.removeStorageSync('teacherInfo');
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        console.error(`API请求失败 [${options.method} ${options.url}]:`, err);
        reject(err);
      }
    });
  });
};

// ===================== 1. 时间配置管理接口 =====================

/**
 * 获取当前时间配置
 * @returns {Promise}
 */
export const fetchTimeConfig = () => {
  return request({
    url: '/teacher/time-config',
    method: 'GET'
  });
};

/**
 * 更新全局评审设置（管理员）
 * @param {object} settings - 全局设置
 * @param {number} settings.slotDuration - 每场评审时长（分钟）
 * @param {number} settings.breakTime - 场次间隔时间（分钟）
 * @returns {Promise}
 */
export const updateGlobalSettings = (settings) => {
  return request({
    url: '/teacher/admin/global-settings',
    method: 'PUT',
    data: settings
  });
};

/**
 * 更新日期配置（管理员）
 * @param {array} dateConfigs - 日期配置数组
 * @returns {Promise}
 */
export const updateDateConfigs = (dateConfigs) => {
  return request({
    url: '/teacher/admin/date-configs',
    method: 'PUT',
    data: { dateConfigs }
  });
};

/**
 * 验证时间配置
 * @param {object} config - 配置对象
 * @returns {Promise}
 */
export const validateTimeConfig = (config) => {
  return request({
    url: '/teacher/admin/validate-config',
    method: 'POST',
    data: config
  });
};

// ===================== 2. 用户时间选择接口 =====================

/**
 * 获取用户时间选择
 * @returns {Promise}
 */
export const fetchUserTimeSelection = () => {
  return request({
    url: '/teacher/user/time-selection',
    method: 'GET'
  });
};

/**
 * 保存用户时间选择
 * @param {array} selectedSlots - 选中的时间段ID数组
 * @returns {Promise}
 */
export const saveTimeSelection = (selectedSlots) => {
  return request({
    url: '/teacher/user/time-selection',
    method: 'POST',
    data: { selectedSlots }
  });
};

/**
 * 获取选择截止时间
 * @returns {Promise}
 */
export const fetchDeadline = () => {
  return request({
    url: '/teacher/deadline',
    method: 'GET'
  });
};

// ===================== 3. 评审任务管理接口 =====================

/**
 * 获取用户评审任务
 * @returns {Promise}
 */
export const fetchReviewTasks = () => {
  return request({
    url: '/teacher/user/review-tasks',
    method: 'GET'
  });
};

/**
 * 更新评审任务状态
 * @param {number} taskId - 任务ID
 * @param {string} status - 任务状态
 * @param {string} notes - 备注信息（可选）
 * @returns {Promise}
 */
export const updateTaskStatus = (taskId, status, notes = '') => {
  return request({
    url: `/teacher/user/review-tasks/${taskId}/status`,
    method: 'PUT',
    data: { status, notes }
  });
};

// ===================== 4. 通知管理接口 =====================

/**
 * 获取用户通知
 * @param {number} page - 页码（默认1）
 * @param {number} limit - 每页数量（默认20）
 * @param {boolean} unreadOnly - 仅未读通知（默认false）
 * @returns {Promise}
 */
export const fetchNotifications = (page = 1, limit = 20, unreadOnly = false) => {
  return request({
    url: `/teacher/user/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
    method: 'GET'
  });
};

/**
 * 标记通知为已读
 * @param {number} notificationId - 通知ID
 * @returns {Promise}
 */
export const markNotificationAsRead = (notificationId) => {
  return request({
    url: `/teacher/user/notifications/${notificationId}/read`,
    method: 'PUT'
  });
};

/**
 * 全部标记为已读
 * @returns {Promise}
 */
export const markAllNotificationsAsRead = () => {
  return request({
    url: '/teacher/user/notifications/mark-all-read',
    method: 'PUT'
  });
};

/**
 * 检查新通知
 * @returns {Promise}
 */
export const checkNewNotifications = () => {
  return request({
    url: '/teacher/user/notifications/check',
    method: 'GET'
  });
};

// ===================== 5. 教师信息管理接口 =====================

/**
 * 获取教师基本信息
 * @returns {Promise}
 */
export const fetchTeacherProfile = () => {
  return request({
    url: '/teacher/profile',
    method: 'GET'
  });
};

/**
 * 更新教师基本信息
 * @param {object} profileData - 教师信息
 * @param {string} profileData.name - 教师姓名
 * @returns {Promise}
 */
export const updateTeacherProfile = (profileData) => {
  return request({
    url: '/teacher/profile',
    method: 'PUT',
    data: profileData
  });
};

// ===================== 6. 研究方向管理接口 =====================

/**
 * 获取教师研究方向
 * @returns {Promise}
 */
export const fetchTeacherResearchAreas = () => {
  return request({
    url: '/teacher/research-areas',
    method: 'GET'
  });
};

/**
 * 添加研究方向
 * @param {string} name - 研究方向名称
 * @returns {Promise}
 */
export const addResearchArea = (name) => {
  return request({
    url: '/teacher/research-areas',
    method: 'POST',
    data: { name }
  });
};

/**
 * 删除研究方向
 * @param {number} areaId - 研究方向ID
 * @returns {Promise}
 */
export const deleteResearchArea = (areaId) => {
  return request({
    url: `/teacher/research-areas/${areaId}`,
    method: 'DELETE'
  });
};

/**
 * 获取可选研究方向列表
 * @returns {Promise}
 */
export const fetchResearchDirections = () => {
  return request({
    url: '/teacher/research-directions',
    method: 'GET'
  });
};

// ===================== 7. 专业方向确认接口 =====================

/**
 * 获取当前研究方向信息
 * @returns {Promise}
 */
export const fetchResearchConfirmation = () => {
  return request({
    url: '/teacher/research-confirmation',
    method: 'GET'
  });
};

/**
 * 保存研究方向确认
 * @param {string} direction - 确认的研究方向
 * @returns {Promise}
 */
export const saveResearchConfirmation = (direction) => {
  return request({
    url: '/teacher/research-confirmation',
    method: 'POST',
    data: { direction }
  });
};

/**
 * 申请自定义研究方向
 * @param {string} customDirection - 自定义研究方向名称
 * @returns {Promise}
 */
export const applyCustomResearchDirection = (customDirection) => {
  return request({
    url: '/teacher/custom-research-direction',
    method: 'POST',
    data: { customDirection }
  });
};

// ===================== 8. 密码管理接口 =====================

/**
 * 修改密码
 * @param {object} passwordData - 密码数据
 * @param {string} passwordData.currentPassword - 当前密码
 * @param {string} passwordData.newPassword - 新密码
 * @param {string} passwordData.confirmPassword - 确认新密码
 * @returns {Promise}
 */
export const updatePassword = (passwordData) => {
  return request({
    url: '/teacher/user/password',
    method: 'PUT',
    data: passwordData
  });
};

// ===================== 9. 用户认证接口 =====================

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {string} userType - 用户类型（默认teacher）
 * @returns {Promise}
 */
export const loginUser = (username, password, userType = 'teacher') => {
  return request({
    url: '/auth/login',
    method: 'POST',
    data: { username, password, userType }
  });
};

/**
 * 用户登出
 * @returns {Promise}
 */
export const logoutUser = () => {
  return request({
    url: '/auth/logout',
    method: 'POST'
  });
};

/**
 * 刷新Token
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise}
 */
export const refreshToken = (refreshToken) => {
  return request({
    url: '/auth/refresh',
    method: 'POST',
    data: { refreshToken }
  });
};

// ===================== 10. 管理员专用接口 =====================

/**
 * 获取所有用户时间选择统计（管理员）
 * @param {string} date - 指定日期过滤（可选）
 * @returns {Promise}
 */
export const fetchTimeSelectionStats = (date = '') => {
  const url = date ? `/teacher/admin/time-selection-stats?date=${date}` : '/teacher/admin/time-selection-stats';
  return request({
    url: url,
    method: 'GET'
  });
};

/**
 * 生成评审任务分配（管理员）
 * @param {object} assignmentData - 分配数据
 * @returns {Promise}
 */
export const generateAssignments = (assignmentData) => {
  return request({
    url: '/teacher/admin/generate-assignments',
    method: 'POST',
    data: assignmentData
  });
};

/**
 * 发送系统通知（管理员）
 * @param {object} notificationData - 通知数据
 * @returns {Promise}
 */
export const sendSystemNotification = (notificationData) => {
  return request({
    url: '/teacher/admin/notifications',
    method: 'POST',
    data: notificationData
  });
};

// ===================== WebSocket 管理 =====================

export const wsManager = {
  ws: null,
  isConnected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectInterval: 3000,
  heartbeatInterval: null,
  heartbeatTimeout: 30000,
  messageHandlers: new Map(),

  /**
   * 连接WebSocket
   * @param {string} token - 认证令牌
   */
  connect: function(token) {
    const wsToken = token || getToken();
    if (!wsToken) {
      console.warn('No token found, cannot connect to WebSocket');
      return;
    }

    try {
      this.ws = uni.connectSocket({
        url: `ws://localhost:8080/ws?token=${wsToken}`,
        header: {
          'Authorization': `Bearer ${wsToken}`
        }
      });

      this.ws.onOpen(() => {
        console.log('WebSocket连接成功');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected');
      });

      this.ws.onMessage((res) => {
        try {
          const data = JSON.parse(res.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket消息解析失败:', error);
        }
      });

      this.ws.onClose((res) => {
        console.log('WebSocket连接关闭', res);
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected');
        
        // 非主动关闭时尝试重连
        if (res.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        }
      });

      this.ws.onError((error) => {
        console.error('WebSocket连接错误:', error);
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('error', error);
      });

    } catch (error) {
      console.error('WebSocket连接失败:', error);
    }
  },

  /**
   * 重连WebSocket
   */
  reconnect: function() {
    this.reconnectAttempts++;
    console.log(`WebSocket重连第${this.reconnectAttempts}次...`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval * this.reconnectAttempts);
  },

  /**
   * 开始心跳检测
   */
  startHeartbeat: function() {
    if (this.heartbeatInterval) return;
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'ping',
          timestamp: Date.now()
        });
      }
    }, this.heartbeatTimeout);
  },

  /**
   * 停止心跳检测
   */
  stopHeartbeat: function() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  },

  /**
   * 处理WebSocket消息
   * @param {object} data - 消息数据
   */
  handleMessage: function(data) {
    console.log('收到WebSocket消息:', data);
    
    // 处理心跳响应
    if (data.type === 'pong') {
      return;
    }
    
    // 触发对应的消息处理器
    this.emit(data.type, data.data);
    
    // 处理不同类型的消息
    switch (data.type) {
      case 'notification':
        uni.showToast({
          title: data.data.title,
          icon: 'none',
          duration: 3000
        });
        uni.$emit('newNotification', data.data);
        break;
        
      case 'config_update':
        uni.$emit('configUpdate', data.data);
        break;
        
      case 'research_area_approved':
      case 'research_area_rejected':
        const status = data.data.status === 'approved' ? '通过' : '拒绝';
        uni.showToast({
          title: `研究方向"${data.data.name}"审核${status}`,
          icon: data.data.status === 'approved' ? 'success' : 'none',
          duration: 3000
        });
        uni.$emit('researchAreaUpdate', data.data);
        break;
        
      case 'task_assigned':
        uni.showToast({
          title: '您有新的评审任务',
          icon: 'none',
          duration: 3000
        });
        uni.$emit('taskAssigned', data.data);
        break;
        
      default:
        console.log('未知的WebSocket消息类型:', data.type);
    }
  },

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {any} data - 事件数据
   */
  emit: function(event, data) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('WebSocket事件处理器执行错误:', error);
        }
      });
    }
  },

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {function} handler - 处理函数
   */
  on: function(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  },

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {function} handler - 处理函数
   */
  off: function(event, handler) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  },

  /**
   * 断开WebSocket连接
   */
  disconnect: function() {
    if (this.ws && this.isConnected) {
      this.ws.close({
        code: 1000,
        reason: 'Normal closure'
      });
      this.ws = null;
      this.isConnected = false;
      this.stopHeartbeat();
    }
  },

  /**
   * 发送消息
   * @param {object} data - 消息数据
   */
  send: function(data) {
    if (this.ws && this.isConnected) {
      this.ws.send({
        data: JSON.stringify(data)
      });
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  },

  /**
   * 获取连接状态
   * @returns {object} 连接状态信息
   */
  getConnectionState: function() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
};