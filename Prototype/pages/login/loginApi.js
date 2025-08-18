// 登录接口封装
export function loginApi(data) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: '/api/users/login', // 使用相对路径，由拦截器统一处理
      method: 'POST',
      data,   // 请求体，传递登录参数
      success: (res) => resolve(res.data),   // 直接返回 res.data
      fail: (err) => reject(err)        // 请求失败时，调用 reject(err)，把错误信息传递给调用者。  
    });
  });
} 