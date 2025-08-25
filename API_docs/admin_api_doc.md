# Admin模块接口文档

## 1. 接口概述

### 1.1 基本信息

- **基础URL**: `http://localhost:8080`
- **接口版本**: v1.0
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 认证方式

所有接口请求需要在Header中携带认证信息：

```
Authorization: Bearer {token}
Content-Type: application/json
```

### 1.3 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2025-08-25T13:00:00Z"
}
```

## 2. 数据结构定义

### 2.1 系统统计信息 (SystemStats)

```json
{
  "totalPhds": "number",
  "totalTeachers": "number", 
  "confirmedTeachers": "number", // 【本次参与老师】中确认的老师
  "pendingTeachers": "number", // 【本次参与老师】中未确认的老师
  "totalSchedules": "number",
  "totalTimeSlots": "number",
  "pendingApprovals": "number",
  "totalNotifications": "number" //管理员创建的通知记录总数，包括所有状态的通知：draft（草稿）、sent（已发送）、scheduled（定时发送）
}
```

### 2.2 用户信息 (User)

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "status": "string",
  "researchAreas": ["string"],
  "studentId": "string", // 仅博士生
  "employeeId": "string", // 仅教师
  "enrollmentDate": "string", // 仅博士生
  "supervisors": ["string"], // 仅博士生
  "mainSupervisor": "string", // 仅博士生
  "createTime": "string"
}
```

### 2.3 研究方向 (ResearchArea)

```json
{
  "id": "number",
  "name": "string",
  "userCount": "number",
  "createDate": "string",
  "status": "string", // approved, pending
  "submitter": "string", // 仅待审核
  "submitDate": "string" // 仅待审核
}
```

### 2.4 通知信息 (Notification)

```json
{
  "id": "number",
  "title": "string",
  "content": "string",
  "recipientType": "string", // all, teacher, student
  "specificRecipients": ["string"],
  "sendType": "string", // immediate, scheduled, draft
  "scheduleDate": "string", // 定时发送的日期（比如，2025-08-25）
  "scheduleTime": "string", // 定时发送的时间（比如，12：23）
  "status": "string", // draft, sent, scheduled
  "createTime": "string",
  "sendTime": "string",
}
```

### 2.5 评审日程 (ReviewSchedule)

```json
{
  "id": "number",
  "date": "string",
  "displayDate": "string",
  "morning": {
    "startTime": "string",
    "endTime": "string"
  },
  "afternoon": {
    "startTime": "string", 
    "endTime": "string"
  }
}
```

## 3. 系统管理接口

### 3.1 获取系统统计信息

**接口地址**: `GET/admin/dashboard/stats`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalPhds": 25,
    "totalTeachers": 12,
    "confirmedTeachers": 8,
    "pendingTeachers": 4,
    "totalSchedules": 3,
    "totalTimeSlots": 15,
    "totalNotifications": 12,
    "pendingResearchAreaApprovals": 2
  }
}
```

### 3.2 获取系统配置

**接口地址**: `GET /admin/system/config`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success", 
  "data": {
    "globalSettings": {
      "slotDuration": 45,
      "workload": 4, 			//每个老师每学期能分配的最多学生数
      "deadline": "2025-08-27T00:00:00Z"
    },
    "scheduleList": [
      {
        "id": 1,
        "date": "2025-06-27",
        "morning": "09:00-12:00",
        "afternoon": "14:00-17:00"
      },
      {
        "id": 2,
        "date": "2025-07-02",
        "morning": "09:00-12:00"
      }
    ]
  }
}
```

### 3.3 更新系统配置

**接口地址**: `PUT/admin/system/config`

**请求参数**:

```json
{
  "slotDuration": 45,
  "workload": 4,
  "deadline": "2025-08-27T00:00:00Z"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "配置更新成功",
  "data": null
}
```

## 4. 用户管理接口

### 4.1 获取用户列表

**接口地址**: `GET/admin/users`

**请求参数**:

- `type`: 用户类型 (phd/teacher)
- `page`: 页码，默认1
- `size`: 每页条数，默认20
- `keyword`: 搜索关键词，可选
- `status`: 状态筛选，可选

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "PhD001",
        "name": "李明",
        "studentId": "PhD2021001", 
        "email": "liming@university.edu.cn",
        "enrollmentDate": "2021-09-01",
        "supervisors": ["T001", "T002"],
        "mainSupervisor": "T001",
        "researchAreas": ["人工智能", "计算机视觉"],
        "status": "active",
        "createTime": "2021-09-01T10:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "size": 20
  }
}
```

### 4.2 添加用户

**接口地址**: `POST/admin/users`

**请求参数**:

```json
{
  "type": "phd",
  "name": "张三",
  "id": "PhD2021003",
  "email": "zhangsan@university.edu.cn", 
  "enrollmentDate": "2021-09-01",
  "supervisors": ["T001"],
  "mainSupervisor": "T001",
  "researchAreas": ["机器学习"]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "用户添加成功",
  "data": {
    "id": "PhD003",
    "createTime": "2025-08-25T13:00:00Z"
  }
}
```

### 4.3 更新用户信息

**接口地址**: `PUT/admin/users/{userId}`

**路径参数**:

- `userId`: 用户ID

**请求参数**: 与添加用户接口相同

**响应示例**:

```json
{
  "code": 200,
  "message": "用户信息更新成功",
  "data": null
}
```

### 4.4 删除用户

**接口地址**: `DELETE/admin/users/{userId}`

**路径参数**:

- `userId`: 用户ID

**响应示例**:

```json
{
  "code": 200,
  "message": "用户删除成功", 
  "data": null
}
```

### 4.5 导入用户Excel

**接口地址**: `POST/admin/users/import`

**请求参数**: 文件上传

**响应示例**:

```json
{
  "code": 200,
  "message": "导入成功",
  "data": {
    "importedCount": 10,
    "failedCount": 2,
    "errors": ["第3行：邮箱格式错误"]
  }
}
```

## 5. 研究方向管理接口

### 5.1 获取所有研究方向

**接口地址**: `GET /admin/research-areas`

**请求参数**:

- `keyword`: 搜索关键词，可选
- `page`: 页码，默认1
- `size`: 每页条数，默认20

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "人工智能",
        "userCount": 15,
        "createDate": "2023-01-15",
        "status": "approved"
      }
    ],
    "total": 10,
    "page": 1,
    "size": 20
  }
}
```

### 5.2 获取待审核研究方向

**接口地址**: `GET /admin/research-areas/pending`

**请求参数**:

- `keyword`: 搜索关键词，可选

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 101,
      "name": "联邦学习",
      "submitter": "张教授",
      "submitDate": "2025-06-10",
      "status": "pending"
    }
  ]
}
```

### 5.3 添加研究方向

**接口地址**: `POST /admin/research-areas`

**请求参数**:

```json
{
  "name": "量子计算"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "研究方向添加成功",
  "data": {
    "id": 15,
    "createTime": "2025-08-25T13:00:00Z"
  }
}
```

### 5.4 更新研究方向

**接口地址**: `PUT/admin/research-areas/{areaId}`

**路径参数**:

- `areaId`: 研究方向ID

**请求参数**:

```json
{
  "name": "深度学习与神经网络"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

### 5.5 删除研究方向

**接口地址**: `DELETE/admin/research-areas/{areaId}`

**路径参数**:

- `areaId`: 研究方向ID

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 5.6 审核研究方向

**接口地址**: `PUT/admin/research-areas/{areaId}/review`

**路径参数**:

- `areaId`: 研究方向ID

**请求参数**:

```json
{
  "action": "reject", // approve, reject
  "reason": "与现有方向冲突" // 可选择性填写
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "审核完成",
  "data": {
    "status": "approved",
    "processTime": "2025-08-25T13:00:00Z"
  }
}
```

## 6. 通知管理接口

### 6.1 获取通知列表

**接口地址**: `GET/admin/notifications`

**请求参数**:

- `status`: 状态筛选 (all/draft/sent/scheduled)，默认all
- `keyword`: 搜索关键词，可选
- `page`: 页码，默认1
- `size`: 每页条数，默认10

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "2025年春季年审安排通知",
        "content": "请各位博士生及时查看个人年审安排...",
        "recipientType": "all",
        "status": "sent",
        "createTime": "2025-05-15T10:30:00Z",
        "sendTime": "2025-05-15T14:30:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "size": 10
  }
}
```

### 6.2 创建通知

**接口地址**: `POST /admin/notifications`

**请求参数**:

```json
{
  "title": "系统维护通知",
  "content": "系统将于今晚进行维护...",
  "recipientType": "all", // all, teacher, student
  "specificRecipients": [], // 具体接收人ID列表，recipientType不为all时使用
  "sendType": "immediate", // immediate, scheduled, draft
  "scheduleDate": "2025-08-26", // sendType为scheduled时必填
  "scheduleTime": "10:00" // sendType为scheduled时必填
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "通知创建成功",
  "data": {
    "id": 13,
    "status": "sent",
    "createTime": "2025-08-25T13:00:00Z",
    "sendTime": "2025-08-25T13:00:00Z"
  }
}
```

### 6.3 更新通知

**接口地址**: `PUT/admin/notifications/{notificationId}`

**路径参数**:

- `notificationId`: 通知ID

**请求参数**: 与创建通知接口相同

**响应示例**:

```json
{
  "code": 200,
  "message": "通知更新成功",
  "data": null
}
```

### 6.4 删除通知

**接口地址**: `DELETE/admin/notifications/{notificationId}`

**路径参数**:

- `notificationId`: 通知ID

**响应示例**:

```json
{
  "code": 200,
  "message": "通知删除成功",
  "data": null
}
```

### 6.5 发送通知

**接口地址**: `POST/admin/notifications/{notificationId}/send`

**路径参数**:

- `notificationId`: 通知ID

**响应示例**:

```json
{
  "code": 200,
  "message": "通知发送成功",
  "data": {
    "sendTime": "2025-08-25T13:00:00Z",
    "sentCount": 50
  }
}
```

## 7. 评审日程管理接口

### 7.1 获取评审日程列表

**接口地址**: `GET/admin/schedules`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "date": "2025-06-27",
      "displayDate": "2025/06/27周四",
      "morning": "09:00-12:00",
      "afternoon": "14:00-17:00"
    }
  ]
}
```

### 7.2 添加评审日程

**接口地址**: `POST /admin/schedules`

**请求参数**:

```json
{
  "date": "2025-06-28",
  "displayDate": "2025/06/28周五",
  "morning": "09:00-12:00", // 可选，但morning和afternoon至少有一个
  "afternoon": "14:00-17:00" // 可选，但morning和afternoon至少有一个
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "日程添加成功",
  "data": {
    "id": 4,
    "createTime": "2025-08-25T13:00:00Z"
  }
}
```

### 7.3 删除评审日程

**接口地址**: `DELETE/admin/schedules/{scheduleId}`

**路径参数**:

- `scheduleId`: 日程ID

**响应示例**:

```json
{
  "code": 200,
  "message": "日程删除成功",
  "data": null
}
```

## 8. 参与人员管理接口

### 8.1 获取参与博士生列表

**接口地址**: `GET/admin/participants/phds`

**请求参数**:

- `keyword`: 搜索关键词，可选

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "张三",
      "studentId": "2021001",
      "supervisor": "张教授",
      "researchAreas": ["人工智能", "机器学习"]
    }
  ]
}
```

### 8.2 添加博士生到参与列表

**接口地址**: `POST /admin/participants/phds`

**请求参数**:

```json
{
  "phdIds": ["PhD001", "PhD002"]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "addedCount": 2
  }
}
```

### 8.3 从参与列表移除博士生

**接口地址**: `DELETE /admin/participants/phds/{phdId}`

**路径参数**:

- `phdId`: 博士生ID

**响应示例**:

```json
{
  "code": 200,
  "message": "移除成功",
  "data": null
}
```

### 8.4 获取参与教师列表

**接口地址**: `GET/admin/participants/teachers`

**请求参数**:

- `keyword`: 搜索关键词，可选
- `status`: 状态筛选 (all/confirmed/pending/assigned)，可选

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "张教授",
      "researchAreas": ["人工智能", "机器学习", "数据挖掘"],
      "workload": 4,
      "status": "confirmed",
      "confirmTime": "2025/01/15 14:30",
      "selectedTimeSlots": ["2025/07/01-morning-1", "2025/07/01-morning-2"]
    }
  ]
}
```

### 8.5 添加教师到参与列表

**接口地址**: `POST/admin/participants/teachers`

**请求参数**:

```json
{
  "teacherIds": ["T001", "T002"]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "addedCount": 2
  }
}
```

### 8.6 从参与列表移除教师

**接口地址**: `DELETE/admin/participants/teachers/{teacherId}`

**路径参数**:

- `teacherId`: 教师ID

**响应示例**:

```json
{
  "code": 200,
  "message": "移除成功", 
  "data": null
}
```

### 8.7 发送教师提醒

**接口地址**: `POST/admin/participants/teachers/reminder`

**请求参数**:

```json
{
  "teacherIds": ["T001", "T002"], // 空数组表示发送给所有待确认教师
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "提醒发送成功",
  "data": {
    "sentCount": 2
  }
}
```

### 8.8 设置教师可选时间

**接口地址**: `PUT/admin/participants/teachers/{teacherId}/time-slots`

**路径参数**:

- `teacherId`: 教师ID

**请求参数**:

```json
{
  "selectedTimeSlots": [
    "2025/07/01-morning-1",
    "2025/07/01-morning-2",
    "2025/07/01-afternoon-1"
  ]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "时间设置成功",
  "data": null
}
```

## 9. 导出功能接口

### 9.1 导出用户列表

**接口地址**: `GET/admin/export/users`

**请求参数**:

- `type`: 用户类型 (phd/teacher)
- `format`: 导出格式 (excel/csv)，默认excel

**响应**: 文件下载

### 9.2 导出参与人员列表

**接口地址**: `GET/admin/export/participants`

**请求参数**:

- `type`: 参与者类型 (phd/teacher)
- `format`: 导出格式 (excel/csv)，默认excel

**响应**: 文件下载

## 10. 错误码定义

| 错误码 | 错误信息              | 说明                     |
| ------ | --------------------- | ------------------------ |
| 200    | success               | 请求成功                 |
| 400    | Bad Request           | 请求参数错误             |
| 401    | Unauthorized          | 未授权或token失效        |
| 403    | Forbidden             | 权限不足，需要管理员权限 |
| 404    | Not Found             | 资源不存在               |
| 500    | Internal Server Error | 服务器内部错误           |
| 2001   | 用户不存在            | 指定用户ID不存在         |
| 2002   | 用户已存在            | 学号或工号已被使用       |
| 2003   | 研究方向不存在        | 指定研究方向ID不存在     |
| 2004   | 研究方向已存在        | 研究方向名称重复         |
| 2005   | 通知不存在            | 指定通知ID不存在         |
| 2006   | 日程冲突              | 指定日期已存在评审安排   |
| 2007   | 申请不存在            | 指定申请ID不存在         |
| 2008   | 导师不存在            | 指定导师ID不存在         |
| 2009   | 时间段冲突            | 指定时间段已被占用       |
| 2010   | 文件格式错误          | 上传文件格式不支持       |

## 11. 接口调用示例

### 11.1 JavaScript示例

```javascript
// 获取系统统计信息
const getSystemStats = async () => {
  try {
    const response = await fetch('http://localhost:8080/admin/dashboard/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    if (result.code === 200) {
      console.log('系统统计:', result.data);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
};

// 添加用户
const addUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:8080/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    const result = await response.json();
    if (result.code === 200) {
      console.log('添加成功:', result.data);
    }
  } catch (error) {
    console.error('添加失败:', error);
  }
};

// 审核研究方向
const reviewResearchArea = async (areaId, action, reason = '') => {
  try {
    const response = await fetch(`http://localhost:8080/admin/research-areas/${areaId}/review`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: action,
        reason: reason
      })
    });
    const result = await response.json();
    if (result.code === 200) {
      console.log('审核完成:', result.data);
    }
  } catch (error) {
    console.error('审核失败:', error);
  }
};
```

### 11.2 uni-app示例

```javascript
// 获取用户列表
const getUserList = (type) => {
  uni.request({
    url: 'http://localhost:8080/admin/users',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: {
      type: type,
      page: 1,
      size: 20
    },
    success: (res) => {
      if (res.data.code === 200) {
        console.log('用户列表:', res.data.data);
      }
    },
    fail: (error) => {
      console.error('请求失败:', error);
    }
  });
};

// 发送通知
const sendNotification = (notificationData) => {
  uni.request({
    url: 'http://localhost:8080/admin/notifications',
    method: 'POST',
    header: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: notificationData,
    success: (res) => {
      if (res.data.code === 200) {
        console.log('通知发送成功:', res.data.data);
        uni.showToast({
          title: '发送成功',
          icon: 'success'
        });
      }
    },
    fail: (error) => {
      console.error('发送失败:', error);
      uni.showToast({
        title: '发送失败',
        icon: 'error'
      });
    }
  });
};
```

## 12. 注意事项

1. **权限验证**: 所有管理员接口都需要验证管理员权限
2. **数据验证**: 请求参数需要进行严格的数据验证和清理
3. **并发控制**: 对于修改操作，需要考虑并发访问的数据一致性
4. **日志记录**: 重要操作需要记录管理员操作日志
5. **文件上传**: Excel导入功能需要限制文件大小和格式
6. **批量操作**: 批量删除等操作需要事务支持
7. **通知发送**: 通知功能需要考虑发送失败的重试机制
8. **时间处理**: 所有时间相关操作需要考虑时区问题
9. **缓存管理**: 统计数据可以适当使用缓存提高性能
10. **错误处理**: 需要完善的错误处理和用户友好的错误信息

## 13. 更新日志

| 版本 | 更新时间   | 更新内容                         |
| ---- | ---------- | -------------------------------- |
| v1.0 | 2025-08-25 | 初始版本，包含管理员核心功能接口 |

*本文档最后更新时间：2025-08-25*



---



## 14. 评审方案生成与管理接口（schedule.vue）

### 14.1 获取准备工作检查清单

**接口地址**: `GET/admin/schedule/preparation-status`

**请求参数**: 无

**响应示例**:

json

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "schedules": {
      "count": 3,
      "items": [
        {
          "id": 1,
          "date": "2025-07-01",
          "displayDate": "7月1日",
          "weekday": "周二",
          "morning": "08:00-12:00",
          "afternoon": "14:00-17:00"
        }
      ]
    },
    "systemConfig": {
      "deadline": "2025年8月27日 00:00",
      "workload": 4,
      "duration": 45
    },
    "participantStats": {
      "teacherCount": 12,
      "confirmedTeachers": 8,
      "studentCount": 25
    },
    "teachers": [
      {
        "id": 1,
        "name": "王伟",
        "status": "confirmed",
        "availableSlots": [
          "7月1日 08:00-08:45",
          "7月1日 14:00-14:45"
        ]
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "李明",
        "studentId": "PhD2021001"
      }
    ],
    "canGenerate": true
  }
}
```

### 14.2 生成评审草案（匹配算法）

**接口地址**: `POST/admin/schedule/generate-draft`

**请求参数**:

json

```json
{
  "forceRegenerate": false
}
```

**参数说明**:

```
参数类型必填说明
forceRegenerateboolean否是否强制重新生成，默认false
```

**响应示例**:

json

```json
{
  "code": 200,
  "message": "草案生成已启动",
  "data": {
    "taskId": "draft_task_20250825_001",
    "estimatedTime": 30,
    "status": "processing"
  }
}
```

### 14.3 获取草案生成进度

**接口地址**: `GET /admin/schedule/generation-progress/{taskId}`

**路径参数**:

```
参数类型必填说明
taskIdstring是任务ID
```

**响应示例**:

json

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "progress": 85,
    "status": "正在检查冲突...",
    "logs": [
      {
        "time": "14:32:01",
        "message": "开始生成评审草案"
      },
      {
        "time": "14:32:03",
        "message": "分析师生研究方向匹配度..."
      }
    ],
    "completed": false
  }
}
```

### 14.4 获取草案结果

**接口地址**: `GET/admin/schedule/draft-result`

**请求参数**: 无

**响应示例**:

json

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "statistics": {
      "totalStudents": 8,
      "timeRoomConflicts": 0,
      "teacherOverloads": 0
    },
    "studentSchedules": [
      {
        "id": 1,
        "name": "李明",
        "studentId": "PhD2021001",
        "assessors": ["王伟（教授）", "李静（副教授）"],
        "time": "7月1日 08:45-09:30",
        "room": "会议室1",
        "hasTimeRoomConflict": false
      }
    ],
    "teacherSchedules": [
      {
        "name": "王伟（教授）",
        "assigned": 3,
        "maxLoad": 4,
        "overloaded": false,
        "timeSlots": [
          {
            "time": "7月1日 08:45-09:30",
            "student": "李明"
          }
        ]
      }
    ],
    "roomSchedules": [
      {
        "name": "会议室1",
        "bookings": [
          {
            "time": "7月1日 08:45-09:30",
            "student": "李明"
          }
        ]
      }
    ]
  }
}
```

### 14.5 编辑学生评审安排

**接口地址**: `PUT/admin/schedule/student-arrangement/{studentId}`

**路径参数**:

```
参数类型必填说明
studentIdstring是学生ID
```

**请求参数**:

json

```json
{
  "date": "2025-07-01",
  "timeSlot": "08:45-09:30",
  "assessors": ["王伟（教授）", "李静（副教授）"],
  "room": "会议室1"
}
```

**参数说明**:

```
参数类型必填说明
datestring是评审日期
timeSlotstring是时间段
assessorsarray是评审教师列表（2个教师）
roomstring是会议室
```

**响应示例**:

json

```json
{
  "code": 200,
  "message": "安排更新成功",
  "data": {
    "conflicts": {
      "timeRoomConflicts": 0,
      "teacherOverloads": 1
    },
    "updatedAt": "2025-08-25T13:00:00Z"
  }
}
```

### 14.6 获取可用时间段和资源（编辑学生安排弹窗）

**接口地址**: `GET/admin/schedule/available-resources`

**请求参数**:

```
参数类型必填说明
datestring否指定日期，格式YYYY-MM-DD
```

**响应示例**:

json

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dateOptions": [
      {
        "date": "2025-07-01",
        "displayDate": "7月1日",
        "weekday": "周二",
        "totalSlots": 6,
        "morningRange": "08:00-12:00",
        "afternoonRange": "14:00-17:00"
      }
    ],
    "timeSlots": {
      "2025-07-01": {
        "morning": [
          {
            "slot": "08:00-08:45",
            "displayTime": "08:00-08:45",
            "available": true
          }
        ],
        "afternoon": [
          {
            "slot": "14:00-14:45",
            "displayTime": "14:00-14:45",
            "available": true
          }
        ]
      }
    },
    "availableTeachers": [
      {
        "id": 1,
        "name": "王伟",
        "title": "教授",
        "currentLoad": 2,
        "maxLoad": 4
      }
    ],
    "availableRooms": [
      {
        "name": "会议室1",
        "capacity": 10,
        "available": true
      }
    ]
  }
}
```

### 14.7 保存房间配置

**接口地址**: `POST/admin/schedule/room-configuration`

**请求参数**:

json

```json
{
  "rooms": [
    {
      "name": "会议室1"
    },
    {
      "name": "会议室2"
    }
  ]
}
```

**响应示例**:

json

```json
{
  "code": 200,
  "message": "房间配置保存成功",
  "data": {
    "savedRooms": 4,
    "roomUsage": {
      "会议室1": "7月1日 08:00-12:00",
      "会议室2": "7月1日 08:00-10:30"
    }
  }
}
```

### 14.8 最终发布评审方案

**接口地址**: `POST/admin/schedule/publish-final`

**请求参数**:

json

```json
{
  "notifyParticipants": true,
  "publishDate": "2025-08-25T15:00:00Z"
}
```

**参数说明**:

```
参数类型必填说明
notifyParticipantsboolean否是否通知参与人员，默认true
publishDatestring否发布时间，默认立即发布
```

**响应示例**:

json

```json
{
  "code": 200,
  "message": "评审方案发布成功",
  "data": {
    "scheduleId": "schedule_20250825_001",
    "publishedAt": "2025-08-25T15:00:00Z",
    "notificationsSent": 20,
    "finalArrangements": [
      {
        "studentName": "李明",
        "studentId": "PhD2021001",
        "assessors": ["王伟（教授）", "李静（副教授）"],
        "time": "7月1日 08:45-09:30",
        "room": "会议室1"
      }
    ]
  }
}
```

### 14.9 重新发布评审方案

**接口地址**: `POST/admin/schedule/republish`

**请求参数**:

json

```json
{
  "scheduleId": "schedule_20250825_001"
}
```

**响应示例**:

json

```json
{
  "code": 200,
  "message": "方案重新发布成功",
  "data": {
    "newScheduleId": "schedule_20250825_002",
    "republishedAt": "2025-08-25T16:00:00Z"
  }
}
```



---



## 15. 管理员个人信息管理接口（profile.vue）

### 15.1 获取管理员个人信息

**接口地址**: `GET/admin/profile`

**请求参数**: 无

**响应示例**:

json

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "admin_001",
    "name": "王伟",
    "employeeId": "A2021001",
    "email": "admin@university.edu.cn",
    "permissions": [
      "user_management",
      "schedule_management",
      "system_config"
    ],
    "lastLoginAt": "2025-08-25T10:30:00Z",
    "createdAt": "2021-01-01T00:00:00Z"
  }
}
```

### 15.2 修改管理员密码

**接口地址**: `PUT/admin/profile/password`

**请求参数**:

json

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**参数说明**:

```
参数类型必填说明
currentPasswordstring是当前密码
newPasswordstring是新密码，6-20位
confirmPasswordstring是确认新密码
```

**响应示例**:

json

```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": {
    "updatedAt": "2025-08-25T13:00:00Z"
  }
}
```

### 15.3 管理员退出登录

**接口地址**: `POST /admin/logout`

**请求参数**: 无

**响应示例**:

json

```json
{
  "code": 200,
  "message": "退出成功",
  "data": {
    "logoutAt": "2025-08-25T13:00:00Z"
  }
}
```

## 16. WebSocket 实时更新（评审生成进度）

### 16.1 连接地址

```
ws://localhost:8080/ws/admin/schedule
```

### 16.2 草案生成进度推送

**服务端推送**:

json

```json
{
  "type": "generation_progress",
  "data": {
    "taskId": "draft_task_20250825_001",
    "progress": 65,
    "status": "正在分配评审教师...",
    "log": {
      "time": "14:32:15",
      "message": "开始分配评审教师"
    }
  }
}
```

### 16.3 草案生成完成推送

**服务端推送**:

json

```json
{
  "type": "generation_completed", 
  "data": {
    "taskId": "draft_task_20250825_001",
    "success": true,
    "statistics": {
      "totalStudents": 8,
      "timeRoomConflicts": 0,
      "teacherOverloads": 0
    },
    "completedAt": "2025-08-25T14:35:00Z"
  }
}
```

### 16.4 实时冲突检测推送

**服务端推送**:

json

```json
{
  "type": "conflict_detected",
  "data": {
    "conflictType": "teacher_overload",
    "affected": ["王伟（教授）"],
    "details": "教师王伟已分配5个学生，超过最大负荷4个",
    "timestamp": "2025-08-25T13:00:00Z"
  }
}
```

## 17. 错误码补充

```
错误码错误信息说明
3001草案生成失败匹配算法执行失败
3002教师资源不足可用教师数量不足
3003时间段冲突存在时间和房间冲突
3004教师超负荷教师分配超过最大工作量
3005房间资源不足可用会议室数量不足
3006方案已发布评审方案已经发布，无法修改
3007草案不存在指定的草案ID不存在
3008密码验证失败当前密码错误
3009权限不足需要管理员权限
```

## 18. 接口调用示例补充

### 18.1 生成评审草案流程示例

javascript

```javascript
// 1. 获取准备工作状态
const getPreparationStatus = async () => {
  const response = await fetch('/admin/schedule/preparation-status', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const result = await response.json()
  return result.data.canGenerate
}

// 2. 启动草案生成
const generateDraft = async () => {
  const response = await fetch('/admin/schedule/generate-draft', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ forceRegenerate: false })
  })
  const result = await response.json()
  return result.data.taskId
}

// 3. 监听生成进度（WebSocket）
const ws = new WebSocket('ws://localhost:8080/ws/admin/schedule')
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.type === 'generation_progress') {
    console.log('生成进度:', data.data.progress + '%')
    console.log('当前状态:', data.data.status)
  } else if (data.type === 'generation_completed') {
    console.log('生成完成')
    // 获取草案结果
    getDraftResult()
  }
}

// 4. 获取草案结果
const getDraftResult = async () => {
  const response = await fetch('/admin/schedule/draft-result', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return await response.json()
}
```

### 18.2 编辑学生安排示例

javascript

```javascript
// 编辑学生评审安排
const editStudentArrangement = async (studentId, arrangement) => {
  try {
    const response = await fetch(`/admin/schedule/student-arrangement/${studentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(arrangement)
    })
    
    const result = await response.json()
    
    if (result.code === 200) {
      console.log('安排更新成功')
      // 检查是否有新的冲突
      if (result.data.conflicts.teacherOverloads > 0) {
        console.warn('存在教师超负荷情况')
      }
    }
    
    return result
  } catch (error) {
    console.error('更新失败:', error)
  }
}

// 使用示例
editStudentArrangement('PhD2021001', {
  date: '2025-07-01',
  timeSlot: '09:30-10:15',
  assessors: ['张明（副教授）', '刘芳（教授）'],
  room: '会议室2'
})
```