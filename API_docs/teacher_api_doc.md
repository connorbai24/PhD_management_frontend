# Teacher模块接口文档

## 1. 概述

本文档描述了评审日程系统的后端接口规范，包括时间配置管理、用户时间选择、评审任务分配等功能的API接口。

### 1.1 基础信息

- **基础URL**: `http://localhost:8080`
- **接口版本**: v1.1
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
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 1.4 状态码说明

| 状态码 | 说明           |
| ------ | -------------- |
| 200    | 请求成功       |
| 400    | 请求参数错误   |
| 401    | 未授权         |
| 403    | 权限不足       |
| 404    | 资源不存在     |
| 500    | 服务器内部错误 |

## 2. 时间配置管理接口

### 2.1 获取当前时间配置

**接口地址**: `GET /teacher/time-config`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "globalSettings": {
      "slotDuration": 45
    },
    "dateConfigs": [
      {
        "date": "2025-06-26",
        "displayDate": "2025/06/26周四",
        "morning": {
          "startTime": "09:00",
          "endTime": "12:00"
        },
        "afternoon": {
          "startTime": "14:00",
          "endTime": "17:00"
        }
      }
    ],
    "timeConfig": {
      "day1": {
        "date": "2025-06-26",
        "displayDate": "2025/06/26周四",
        "morning": {
          "startTime": "09:00",
          "endTime": "12:00",
          "slotDuration": 45
        },
        "afternoon": {
          "startTime": "14:00",
          "endTime": "17:00",
          "slotDuration": 45
        }
      }
    },
    "totalSlots": 8
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

## 3. 用户时间选择接口

### 3.1 获取用户时间选择

**接口地址**: `GET /teacher/user/time-selection`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "user123",
    "selectedSlots": [
      "2025-06-26-morning-1",
      "2025-06-26-morning-2",
      "2025-06-26-afternoon-1"
    ],
    "lastUpdated": "2025-06-20T10:30:00Z",
    "deadline": "2025-08-25T18:00:00Z",
    "isDeadlinePassed": false
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 3.2 保存用户时间选择

**接口地址**: `POST /teacher/user/time-selection`

**请求参数**:

```json
{
  "selectedSlots": [
    "2025-06-26-morning-1",
    "2025-06-26-morning-2",
    "2025-06-26-afternoon-1"
  ]
}
```

**参数说明**:

| 参数          | 类型  | 必填 | 说明                                     |
| ------------- | ----- | ---- | ---------------------------------------- |
| selectedSlots | array | 是   | 选中的时间段ID数组，格式：日期-时段-序号 |

**响应示例**:

```json
{
  "code": 200,
  "message": "时间选择保存成功",
  "data": {
    "userId": "user123",
    "selectedSlots": [
      "2025-06-26-morning-1",
      "2025-06-26-morning-2",
      "2025-06-26-afternoon-1"
    ],
    "savedAt": "2025-06-20T10:30:00Z",
    "totalSelected": 3
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 3.3 获取选择截止时间

**接口地址**: `GET /teacher/deadline`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "deadline": "2025-08-25T18:00:00Z",
    "currentTime": "2025-06-20T10:30:00Z",
    "isDeadlinePassed": false,
    "remainingTime": {
      "days": 66,
      "hours": 7,
      "minutes": 30
    },
    "formattedDeadline": "2025/08/25 18:00",
    "countdownText": "66天7小时30分钟"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

## 4. 评审任务管理接口

### 4.1 获取用户评审任务

**接口地址**: `GET /teacher/user/review-tasks`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "scheduleData": [
      {
        "date": "11月20日",
        "weekday": "星期四",
        "tasks": [
          {
            "id": 1,
            "timeRange": "10:30 - 11:15",
            "studentName": "李明",
            "researchField": "人工智能",
            "location": "科研楼A座 301会议室",
            "myRole": "评审一号",
            "coAssessor": "王伟 教授"
          }
        ]
      }
    ],
    "totalTasks": 1,
    "upcomingTasks": 1
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 4.2 更新评审任务状态

**接口地址**: `PUT /teacher/user/review-tasks/{taskId}/status`

**路径参数**:

| 参数   | 类型   | 必填 | 说明   |
| ------ | ------ | ---- | ------ |
| taskId | number | 是   | 任务ID |

**请求参数**:

```json
{
  "status": "completed"
}
```

**参数说明**:

| 参数   | 类型   | 必填 | 说明                                              |
| ------ | ------ | ---- | ------------------------------------------------- |
| status | string | 是   | 任务状态：pending/in-progress/completed/cancelled |
| notes  | string | 否   | 备注信息                                          |

**响应示例**:

```json
{
  "code": 200,
  "message": "任务状态更新成功",
  "data": {
    "taskId": 1,
    "status": "completed",
    "updatedAt": "2025-06-20T10:30:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

## 5. 通知管理接口

### 5.1 获取用户通知

**接口地址**: `GET /teacher/user/notifications`

**请求参数**:

| 参数       | 类型    | 必填 | 说明                  |
| ---------- | ------- | ---- | --------------------- |
| page       | number  | 否   | 页码，默认1           |
| limit      | number  | 否   | 每页数量，默认20      |
| unreadOnly | boolean | 否   | 仅未读通知，默认false |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "notifications": [
      {
        "id": 1,
        "title": "评审安排变更",
        "description": "您明日上午的评审时间调整为",
        "time": "2小时前",
        "isRead": false,
        "createdAt": "2025-06-20T10:30:00Z"
      },
      {
        "id": 2,
        "title": "系统维护通知",
        "description": "系统将于今晚进行维护，期间可能无法正常使用",
        "time": "5小时前",
        "isRead": false,
        "createdAt": "2025-06-20T05:30:00Z"
      },
      {
        "id": 3,
        "title": "评审提醒",
        "description": "距离下次评审还有1小时",
        "time": "1天前",
        "isRead": true,
        "createdAt": "2025-06-19T10:30:00Z"
      },
      {
        "id": 4,
        "title": "重要公告",
        "description": "评审委员会关于论文评审标准的最新调整说明",
        "time": "2天前",
        "isRead": true,
        "createdAt": "2025-06-18T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 5.2 标记通知为已读

**接口地址**: `PUT /teacher/user/notifications/{notificationId}/read`

**路径参数**:

| 参数           | 类型   | 必填 | 说明   |
| -------------- | ------ | ---- | ------ |
| notificationId | number | 是   | 通知ID |

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "通知已标记为已读",
  "data": {
    "notificationId": 1,
    "isRead": true,
    "readAt": "2025-06-20T10:30:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 5.3 全部标记为已读

**接口地址**: `PUT /teacher/user/notifications/mark-all-read`

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "message": "全部通知已标记为已读",
  "data": {
    "updatedCount": 5,
    "updatedAt": "2025-06-20T10:30:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 5.4 检查新通知

**接口地址**: `GET /teacher/user/notifications/check`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "hasNewNotification": true,
    "unreadCount": 3,
    "latestNotification": {
      "id": 1,
      "title": "评审时间安排更新",
      "createdAt": "2025-06-20T10:30:00Z"
    }
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

## 6. 教师信息管理接口

### 6.1 获取教师基本信息

**接口地址**: `GET /teacher/profile`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "name": "王伟",
    "userId": "teacher123",
    "researchAreas": [
      {
        "id": 1,
        "name": "机器学习与人工智能",
        "status": "approved",
        "createdAt": "2025-06-20T10:30:00Z"
      }
    ],
    "lastLoginAt": "2025-06-20T09:00:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

## 7. 研究方向管理接口

### 7.1 获取教师研究方向

**接口地址**: `GET /teacher/research-areas`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "researchAreas": [
      {
        "id": 1,
        "name": "机器学习与人工智能",
        "status": "approved",
        "createdAt": "2025-06-20T10:30:00Z",
        "approvedAt": "2025-06-21T14:20:00Z"
      },
      {
        "id": 2,
        "name": "计算机视觉",
        "status": "pending",
        "createdAt": "2025-06-22T16:15:00Z",
        "approvedAt": null
      }
    ],
    "totalCount": 2,
    "pendingCount": 1,
    "approvedCount": 1
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 7.2 添加研究方向

**接口地址**: `POST /teacher/research-areas`

**请求参数**:

```json
{
  "name": "自然语言处理"
}
```

**参数说明**:

| 参数 | 类型   | 必填 | 说明                     |
| ---- | ------ | ---- | ------------------------ |
| name | string | 是   | 研究方向名称，2-50个字符 |

**响应示例**:

```json
{
  "code": 200,
  "message": "研究方向添加成功",
  "data": {
    "id": 3,
    "name": "自然语言处理",
    "status": "pending",
    "createdAt": "2025-06-20T10:30:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 7.3 删除研究方向

**接口地址**: `DELETE /teacher/research-areas/{areaId}`

**路径参数**:

| 参数   | 类型   | 必填 | 说明       |
| ------ | ------ | ---- | ---------- |
| areaId | number | 是   | 研究方向ID |

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "研究方向删除成功",
  "data": {
    "deletedId": 3,
    "deletedAt": "2025-06-20T10:30:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 7.4 获取可选研究方向列表

**接口地址**: `GET /teacher/research-directions`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "directions": [
      "机器学习与人工智能",
      "计算机视觉",
      "自然语言处理",
      "数据科学与大数据",
      "网络安全",
      "分布式系统",
      "人机交互",
      "软件工程",
      "算法设计与分析",
      "云计算与边缘计算"
    ]
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

## 8. 专业方向确认接口

### 8.1 获取当前研究方向信息

**接口地址**: `GET /teacher/research-confirmation`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "direction": "机器学习与人工智能",
    "isConfirmed": false,
    "lastUpdated": "2025-06-20T10:30:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 8.2 保存研究方向确认

**接口地址**: `POST /teacher/research-confirmation`

**请求参数**:

```json
{
  "direction": "机器学习与人工智能"
}
```

**参数说明**:

| 参数      | 类型   | 必填 | 说明           |
| --------- | ------ | ---- | -------------- |
| direction | string | 是   | 确认的研究方向 |

**响应示例**:

```json
{
  "code": 200,
  "message": "研究方向确认成功",
  "data": {
    "direction": "机器学习与人工智能",
    "isConfirmed": true,
    "confirmedAt": "2025-06-20T10:30:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 8.3 申请自定义研究方向

**接口地址**: `POST /teacher/custom-research-direction`

**请求参数**:

```json
{
  "customDirection": "量子计算与算法"
}
```

**参数说明**:

| 参数            | 类型   | 必填 | 说明               |
| --------------- | ------ | ---- | ------------------ |
| customDirection | string | 是   | 自定义研究方向名称 |

**响应示例**:

```json
{
  "code": 200,
  "message": "自定义研究方向申请已提交",
  "data": {
    "applicationId": 123,
    "direction": "量子计算与算法",
    "status": "pending",
    "submittedAt": "2025-06-20T10:30:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

## 9. 密码管理接口

### 9.1 修改密码

**接口地址**: `PUT /teacher/user/password`

**请求参数**:

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**参数说明**:

| 参数            | 类型   | 必填 | 说明           |
| --------------- | ------ | ---- | -------------- |
| currentPassword | string | 是   | 当前密码       |
| newPassword     | string | 是   | 新密码，6-20位 |
| confirmPassword | string | 是   | 确认新密码     |

**响应示例**:

```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": {
    "updatedAt": "2025-06-20T10:30:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

## 10. 用户认证接口

### 10.1 用户登录

**接口地址**: `POST /auth/login`

**请求参数**:

```json
{
  "username": "teacher001",
  "password": "password123",
  "userType": "teacher"
}
```

**参数说明**:

| 参数     | 类型   | 必填 | 说明                      |
| -------- | ------ | ---- | ------------------------- |
| username | string | 是   | 用户名                    |
| password | string | 是   | 密码                      |
| userType | string | 是   | 用户类型：teacher/student |

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": "teacher123",
      "name": "王伟",
      "userType": "teacher",
      "researchAreas": [
        {
          "id": 1,
          "name": "机器学习与人工智能",
          "status": "approved"
        }
      ]
    },
    "expiresIn": 86400
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 10.2 用户登出

**接口地址**: `POST /auth/logout`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "登出成功",
  "data": {
    "logoutAt": "2025-06-20T10:30:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 10.3 刷新Token

**接口地址**: `POST /auth/refresh`

**请求参数**:

```json
{
  "refreshToken": "refresh_token_string"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "Token刷新成功",
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 86400
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

## 11. WebSocket实时通知

### 11.1 连接地址

```
ws://localhost:8080/ws
```

### 11.2 消息格式

**服务端推送**:

```json
{
  "type": "notification",
  "data": {
    "id": 123,
    "type": "schedule_update",
    "title": "评审时间安排更新",
    "content": "管理员已更新评审时间配置",
    "timestamp": "2025-08-21T13:00:00Z"
  }
}
```

**配置更新推送**:

```json
{
  "type": "config_update",
  "data": {
    "timeConfig": {
      "day1": {
        "date": "2025-06-26",
        "displayDate": "2025/06/26周四"
      }
    },
    "totalSlots": 8,
    "timestamp": "2025-08-21T13:00:00Z"
  }
}
```

**研究方向审核结果推送**:

```json
{
  "type": "research_area_approved",
  "data": {
    "areaId": 2,
    "name": "计算机视觉",
    "status": "approved",
    "approvedAt": "2025-06-20T10:30:00Z",
    "timestamp": "2025-08-21T13:00:00Z"
  }
}
```

## 12. 管理员专用接口

### 12.1 获取所有用户时间选择统计

**接口地址**: `GET /teacher/admin/time-selection-stats`

**权限要求**: 管理员权限

**请求参数**:

| 参数 | 类型   | 必填 | 说明                         |
| ---- | ------ | ---- | ---------------------------- |
| date | string | 否   | 指定日期过滤，格式YYYY-MM-DD |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalUsers": 50,
    "submittedUsers": 45,
    "submissionRate": 0.9,
    "slotStats": {
      "2025-06-26-morning-1": {
        "slotInfo": {
          "date": "2025-06-26",
          "period": "上午",
          "time": "09:00-09:45"
        },
        "selectedCount": 30,
        "availableUsers": ["user1", "user2"]
      }
    },
    "deadline": "2025-08-25T18:00:00Z",
    "isDeadlinePassed": false
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 12.2 生成评审任务分配

**接口地址**: `POST /teacher/admin/generate-assignments`

**权限要求**: 管理员权限

**请求参数**:

```json
{
  "students": [
    {
      "id": "student1",
      "name": "李明",
      "researchField": "人工智能",
      "preferredDate": "2025-06-26",
      "preferredPeriod": "morning"
    }
  ],
  "locations": [
    {
      "id": "room1",
      "name": "科研楼A座 301会议室",
      "capacity": 2
    }
  ],
  "assignmentRules": {
    "reviewersPerStudent": 2,
    "maxTasksPerReviewer": 5
  }
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "评审任务分配生成成功",
  "data": {
    "assignments": [
      {
        "studentId": "student1",
        "studentName": "李明",
        "slotId": "2025-06-26-morning-1",
        "timeRange": "09:00-09:45",
        "location": "科研楼A座 301会议室",
        "reviewers": [
          {
            "userId": "reviewer1",
            "name": "张教授",
            "role": "评审一号"
          },
          {
            "userId": "reviewer2", 
            "name": "王教授",
            "role": "评审二号"
          }
        ]
      }
    ],
    "stats": {
      "totalAssignments": 1,
      "successfulAssignments": 1,
      "failedAssignments": 0,
      "conflicts": []
    }
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

### 12.3 发送系统通知

**接口地址**: `POST /teacher/admin/notifications`

**权限要求**: 管理员权限

**请求参数**:

```json
{
  "type": "schedule_update",
  "title": "评审时间安排更新",
  "content": "管理员已更新评审时间配置，请重新确认您的可用时间",
  "recipients": ["all"],
  "priority": "normal"
}
```

**参数说明**:

| 参数       | 类型   | 必填 | 说明                                                        |
| ---------- | ------ | ---- | ----------------------------------------------------------- |
| type       | string | 是   | 通知类型：schedule_update/task_assigned/deadline_reminder等 |
| title      | string | 是   | 通知标题                                                    |
| content    | string | 是   | 通知内容                                                    |
| recipients | array  | 是   | 接收者，["all"]表示所有用户，或具体用户ID数组               |
| priority   | string | 否   | 优先级：low/normal/high，默认normal                         |

**响应示例**:

```json
{
  "code": 200,
  "message": "通知发送成功",
  "data": {
    "notificationId": 123,
    "sentTo": 50,
    "failed": 0,
    "sentAt": "2025-06-20T10:30:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

## 13. 错误处理

### 13.1 常见错误响应

**配置验证失败**:

```json
{
  "code": 400,
  "message": "配置验证失败",
  "data": {
    "errors": [
      "评审时长必须大于0分钟",
      "第1天 上午时间段太短，无法安排一场评审（需要至少45分钟）"
    ]
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

**权限不足**:

```json
{
  "code": 403,
  "message": "权限不足，需要管理员权限",
  "data": null,
  "timestamp": "2025-08-21T13:00:00Z"
}
```

**截止时间已过**:

```json
{
  "code": 400,
  "message": "时间选择截止时间已过，无法修改",
  "data": {
    "deadline": "2025-08-25T18:00:00Z",
    "currentTime": "2025-08-26T10:00:00Z"
  },
  "timestamp": "2025-08-21T13:00:00Z"
}
```

## 14. 数据模型

### 14.1 时间配置模型

```typescript
interface GlobalSettings {
  slotDuration: number; // 评审时长（分钟）
  breakTime: number;    // 间隔时间（分钟）
}

interface TimeSlot {
  startTime: string;    // 开始时间 HH:MM
  endTime: string;      // 结束时间 HH:MM
}

interface DateConfig {
  date: string;         // 日期 YYYY-MM-DD
  displayDate: string;  // 显示日期
  morning?: TimeSlot;   // 上午时间段
  afternoon?: TimeSlot; // 下午时间段
}

interface GeneratedTimeSlot {
  id: number;
  time: string;         // 时间范围 HH:MM-HH:MM
  startTime: string;
  endTime: string;
}
```

### 14.2 评审任务模型

```typescript
interface ReviewTask {
  id: number;
  timeRange: string;
  studentName: string;
  researchField: string;
  location: string;
  myRole: string;
  coAssessor: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}
```

### 14.3 通知模型

```typescript
interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}
```

## 15. 接口调用示例

### 15.1 JavaScript示例

```javascript
// 获取教师信息
const getTeacherInfo = async () => {
  try {
    const response = await fetch('http://localhost:8080/teacher/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    if (result.code === 200) {
      console.log('教师信息:', result.data);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
};

// 获取研究方向列表
const getResearchDirections = async () => {
  try {
    const response = await fetch('http://localhost:8080/teacher/research-directions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    if (result.code === 200) {
      console.log('研究方向列表:', result.data);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
};

// 保存时间选择
const saveTimeSelection = async (selectedSlots) => {
  try {
    const response = await fetch('http://localhost:8080/teacher/user/time-selection', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selectedSlots: selectedSlots
      })
    });
    const result = await response.json();
    if (result.code === 200) {
      console.log('保存成功:', result.data);
    }
  } catch (error) {
    console.error('保存失败:', error);
  }
};
```

### 15.2 uni-app示例

```javascript
// 获取评审任务
const getReviewTasks = () => {
  uni.request({
    url: 'http://localhost:8080/teacher/user/review-tasks',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    success: (res) => {
      if (res.data.code === 200) {
        console.log('评审任务:', res.data.data);
      }
    },
    fail: (error) => {
      console.error('请求失败:', error);
    }
  });
};

// 获取通知列表
const getNotifications = () => {
  uni.request({
    url: 'http://localhost:8080/teacher/user/notifications',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    success: (res) => {
      if (res.data.code === 200) {
        console.log('通知列表:', res.data.data);
        res.data.data.notifications.forEach(notification => {
          if (!notification.isRead) {
            console.log('未读通知:', notification.title);
          }
        });
      }
    },
    fail: (error) => {
      console.error('请求失败:', error);
    }
  });
};

// 确认研究方向
const confirmResearchDirection = (direction) => {
  uni.request({
    url: 'http://localhost:8080/teacher/research-confirmation',
    method: 'POST',
    header: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: {
      direction: direction
    },
    success: (res) => {
      if (res.data.code === 200) {
        console.log('研究方向确认成功:', res.data.data);
      }
    },
    fail: (error) => {
      console.error('确认失败:', error);
    }
  });
};
```

## 16. 注意事项

1. **认证**: 所有接口都需要在请求头中携带有效的Bearer Token
2. **数据验证**: 请求参数需要进行前端验证，确保数据格式正确
3. **错误处理**: 需要根据返回的错误码进行相应的错误处理
4. **分页**: 列表接口支持分页，建议使用分页加载优化用户体验
5. **缓存**: 可以对一些不常变化的数据（如研究方向列表）进行本地缓存
6. **超时**: 建议设置合理的请求超时时间（如10秒）
7. **重试**: 对于网络错误，可以实现自动重试机制
8. **时间格式**: 所有时间都采用ISO 8601格式（YYYY-MM-DDTHH:mm:ssZ）
9. **WebSocket**: 建议使用WebSocket接收实时通知，减少轮询请求
10. **权限管理**: 严格区分普通用户和管理员权限，避免越权操作

## 17. 更新日志

| 版本 | 更新时间   | 更新内容                     |
| ---- | ---------- | ---------------------------- |
| v1.0 | 2025-07-31 | 初始版本，包含基础功能接口   |
| v1.1 | 2025-08-21 | 添加"全部标记通知为已读"接口 |

*本文档最后更新时间：2025-08-21*