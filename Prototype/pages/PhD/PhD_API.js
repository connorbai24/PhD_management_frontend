// 假设 token 來自本地存储或全局状态
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
        resolve(res);
      },
      fail: (err) => {
        console.error(`API请求失败 [${options.method} ${options.url}]:`, err);
        reject(err);
      }
    });
  });
};

/**
 * 获取所有研究方向 (已根据文档修正)
 * @returns {Promise}
 */
export const fetchResearchDirections = () => {
  // 根据文档 v1.4，此接口无参数
  const url = '/api/phd/research-areas';
  return request({
    url: url,
    method: 'GET'
  });
};

/**
 * 获取通知公告列表 (已修正)
 * @param {number} page - 页码 (默认 1)
 * @param {number} size - 每页条数 (默认 10)
 * @returns {Promise}
 */
export const fetchNotices = (page = 1, size = 10) => {
  return request({
    url: `/api/phd/notices?page=${page}&size=${size}`,
    method: 'GET'
  });
};

/**
 * 获取年审历史记录 (原实现已符合要求)
 * @param {number} page - 页码 (默认 1)
 * @param {number} size - 每页条数 (默认 10)
 * @returns {Promise}
 */
export const fetchReviewHistory = (page = 1, size = 10) => {
  return request({
    url: `/api/phd/review/history?page=${page}&size=${size}`,
    method: 'GET'
  });
};

/**
 * 标记通知为已读 (新增)
 * @param {number} noticeId - 通知ID
 * @returns {Promise}
 */
export const markNoticeAsRead = (noticeId) => {
  return request({
    url: `/api/phd/notices/${noticeId}/read`,
    method: 'PUT'
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
  return request({
    // 根据文档 3.5.1 节修正 URL
    url: '/api/phd/user/password',
    method: 'PUT',
    data: passwordData
  });
};

// --- 无需修改的既有接口 ---

// 获取学生信息
export const fetchStudentInfo = () => {
  return request({
    url: '/api/phd/student/info',
    method: 'GET'
  });
};

// [已修改] 更新研究方向 - 改为单选模式
export const updateResearchArea = (areaId) => {
  console.log('调用更新研究方向API，原始skillId:', areaId, '类型:', typeof areaId);
  
  // 确保skillId是数字类型
  let skillId = areaId;
  if (typeof areaId === 'string' && !isNaN(areaId)) {
    skillId = parseInt(areaId);
  }
  
  const requestData = [ skillId ];
  console.log('发送的请求数据:', requestData);
  
  return request({
    url: '/api/phd/student/research-area',
    method: 'PUT',
    data: requestData
  });
};

// 获取当前年审状态
export const fetchCurrentReview = () => {
  return request({
    url: '/api/phd/review/current',
    method: 'GET'
  });
};

// 退出登录 (URL已修正为正确的后端路径)
export const logoutUser = () => {
  return request({
    // 修正为正确的URL - 根据UserController.java中的@RequestMapping("/users")
    url: '/api/users/logout',
    method: 'POST'
  });
};