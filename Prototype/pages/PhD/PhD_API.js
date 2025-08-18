// 假设 token 來自本地存储或全局状态
const getToken = () => uni.getStorageSync('token') || '';


/**
 * 获取所有研究方向 (已根据文档修正)
 * @returns {Promise}
 */
export const fetchResearchDirections = () => {
  // 根据文档 v1.4，此接口无参数
  const url = '/api/phd/research-areas';
  return uni.request({
    url: url,
    method: 'GET',
    header: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 获取通知公告列表 (已修正)
 * @param {number} page - 页码 (默认 1)
 * @param {number} size - 每页条数 (默认 10)
 * @returns {Promise}
 */
export const fetchNotices = (page = 1, size = 10) => {
  return uni.request({
    url: `/api/phd/notices?page=${page}&size=${size}`,
    method: 'GET',
    header: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 获取年审历史记录 (原实现已符合要求)
 * @param {number} page - 页码 (默认 1)
 * @param {number} size - 每页条数 (默认 10)
 * @returns {Promise}
 */
export const fetchReviewHistory = (page = 1, size = 10) => {
  return uni.request({
    url: `/api/phd/review/history?page=${page}&size=${size}`,
    method: 'GET',
    header: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
};

// --- 新增接口：根据文档补全 ---

/**
 * [已移除] 获取年审详情
 * 根据文档 v1.3 更新日志，该接口已被移除
 */
// export const fetchReviewDetails = (reviewId) => { ... };


/**
 * 标记通知为已读 (新增)
 * @param {number} noticeId - 通知ID
 * @returns {Promise}
 */
export const markNoticeAsRead = (noticeId) => {
  return uni.request({
    url: `/api/phd/notices/${noticeId}/read`,
    method: 'PUT',
    header: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 修改密码 (新增, URL已根据文档修正)
 * @param {object} passwordData - 包含新旧密码的对象
 * @param {string} passwordData.oldPassword - 旧密码
 * @param {string} passwordData.newPassword - 新密码
 * @param {string} passwordData.confirmPassword - 确认新密码
 * @returns {Promise}
 */
export const updatePassword = (passwordData) => {
  return uni.request({
    // 根据文档 3.5.1 节修正 URL
    url: '/api/phd/user/password',
    method: 'PUT',
    header: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    data: passwordData
  });
};

// --- 无需修改的既有接口 ---

// 获取学生信息
export const fetchStudentInfo = () => {
  return uni.request({
    url: '/api/phd/student/info',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
};

// [已修改] 更新研究方向 - 改为单选模式
export const updateResearchArea = (areaId) => {
  return uni.request({
    url: '/api/phd/student/research-area',
    method: 'PUT',
    header: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    data: {
      researchAreaId: areaId // 单个ID，不再是数组
    }
  });
};

// 获取当前年审状态
export const fetchCurrentReview = () => {
  return uni.request({
    url: '/api/phd/review/current',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
};

// 退出登录 (URL已根据文档修正)
export const logoutUser = () => {
  return uni.request({
    // 根据文档 3.5.2 节修正 URL
    url: '/api/phd/user/logout',
    method: 'POST',
    header: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
};