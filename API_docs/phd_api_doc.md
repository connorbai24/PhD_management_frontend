# PhD模块接口文档

## 1. 接口概述

### 1.1 基本信息

- **基础URL**: `http://localhost:8080`
- **接口版本**: v1.5
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 认证方式

所有接口请求需要在Header中携带认证信息：

```
Authorization: Bearer {token}
Content-Type: application/json
```

### 1.3 通用响应格式

```
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2025-08-09T13:00:00Z"
}
```

## 2. 数据结构定义

### 2.1 学生信息 (StudentInfo)

```json
{
  "id": "string",
  "name": "string",
  "studentId": "string",
  "totalReviews": "number",
  "currentYear": "string",
  "avatar": "string",
  "researchArea": {
    "skillId": "number",
    "skillName": "string"
  }
}
```

### 2.2 年审记录 (ReviewRecord)

```json
{
  "id": "string",
  "academicYear": "string",
  "status": "string", 
  "date": "string",
  "timeSlot": "string",
  "room": "string",
  "assessor1": "string",
  "assessor2": "string"
}
```

### 2.3 当前年审状态 (CurrentReview)

```json
{
  "status": "string", 
  "scheduled": "boolean",
  "date": "string",
  "time": "string",
  "location": "string",
  "assessors": ["string"]
}
```

### 2.4 通知公告 (Notice)

```json
{
  "id": "number",
  "title": "string",
  "content": "string",
  "time": "string",
  "read": "boolean"
}
```

### 2.5 研究方向 (ResearchArea)

```json
{
  "skillId": "number",
  "skillName": "string",
  "selected": "boolean"
}
```

## 3. 接口详情

### 3.1 学生信息相关

#### 3.1.1 获取学生基本信息

**接口地址**: `GET /phd/student/info`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "001",
    "name": "张同学",
    "studentId": "20611234",
    "totalReviews": 3,
    "currentYear": "4年级",
    "avatar": "/static/images/default-avatar.png",
    "researchArea": {
      "skillId": 5,
      "skillName": "计算机视觉"
    }
  }
}
```

#### 3.1.2 更新学生研究方向

**接口地址**: `PUT /phd/student/research-area`

**请求参数**:

```json
{
  "researchAreaId": 5
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "研究方向更新成功",
  "data": {
    "researchArea": {
      "skillId": 5,
      "skillName": "计算机视觉"
    }
  }
}
```

### 3.2 年审相关

#### 3.2.1 获取当前年审状态

**接口地址**: `GET /phd/review/current`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "scheduled",
    "scheduled": true,
    "date": "2024年6月22日",
    "time": "14:00-14:45",
    "location": "DBa01",
    "assessors": ["Prof. Wang Lei", "Prof. Chen Yu"]
  }
}
```

#### 3.2.2 获取年审历史记录

**接口地址**: `GET /phd/review/history`

**请求参数**:

- `page`: 页码（默认1）
- `size`: 每页条数（默认10）

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "review_001",
        "academicYear": "2024-2025",
        "status": "completed",
        "date": "2024年6月15日",
        "timeSlot": "14:00 - 14:45",
        "room": "DBa01",
        "assessor1": "Prof. Wang Lei",
        "assessor2": "Prof. Chen Yu"
      }
    ],
    "total": 3,
    "page": 1,
    "size": 10
  }
}
```

### 3.3 通知公告相关

#### 3.3.1 获取通知列表

**接口地址**: `GET /phd/notices`

**请求参数**:

- `page`: 页码（默认1）
- `size`: 每页条数（默认10）

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
        "content": "请各位博士生及时查看个人年审安排，按时参加评审...",
        "time": "2025-06-10",
        "type": "normal",
        "read": false
      }
    ],
    "total": 4,
    "page": 1,
    "size": 10,
    "unreadCount": 2
  }
}
```

#### 3.3.2 标记通知为已读

**接口地址**: `PUT /phd/notices/{noticeId}/read`

**请求参数**:

- `noticeId`: 通知ID

**响应示例**:

```json
{
  "code": 200,
  "message": "标记成功",
  "data": null
}
```

### 3.4 研究方向相关

#### 3.4.1 获取当前登录学生的研究方向选项

**接口地址**: `GET /phd/research-areas`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "skillId": 1,
      "skillName": "ai",
      "selected": false
    },
    {
      "skillId": 2,
      "skillName": "or",
      "selected": true
    },
    {
      "skillId": 3,
      "skillName": "计算机视觉",
      "selected": false
    },
  ]
}
```

**接口说明**:

- 该接口返回所有可选的研究方向列表
- `selected` 字段表示该研究方向是否为当前登录学生已选择的方向
- 由于每个学生只能选择一个研究方向，因此只会有一个研究方向的 `selected` 为 `true`

### 3.5 用户账户相关

#### 3.5.1 修改密码

**接口地址**: `PUT /phd/user/password`

**请求参数**:

```json
{
  "oldPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

#### 3.5.2 退出登录

**接口地址**: `POST /phd/user/logout`

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

## 4. 错误码定义

| 错误码 | 错误信息              | 说明                   |
| ------ | --------------------- | ---------------------- |
| 200    | success               | 请求成功               |
| 400    | Bad Request           | 请求参数错误           |
| 401    | Unauthorized          | 未授权或token失效      |
| 403    | Forbidden             | 没有权限访问           |
| 404    | Not Found             | 资源不存在             |
| 500    | Internal Server Error | 服务器内部错误         |
| 1001   | 学生信息不存在        | 学生信息查询失败       |
| 1002   | 年审记录不存在        | 年审记录查询失败       |
| 1004   | 密码验证失败          | 原密码错误             |
| 1005   | 密码格式不正确        | 新密码不符合要求       |
| 1006   | 研究方向未确认        | 需要先确认研究方向     |
| 1007   | 年审时间冲突          | 年审时间已被占用       |
| 1008   | 通知不存在            | 通知信息查询失败       |
| 1009   | 研究方向不存在        | 指定的研究方向ID不存在 |

## 5. 接口状态码说明

### 5.1 年审状态 (Review Status)

- `scheduled`: 已安排
- `pending`: 待安排
- `completed`: 已完成
- `cancelled`: 已取消

### 5.2 研究方向分类 (Research Area Category)

- `ML & AI`: 机器学习与人工智能
- `CV`: 计算机视觉
- `NLP`: 自然语言处理
- `DS & BD`: 数据科学与大数据
- `CyberSec`: 网络安全
- `DS`: 分布式系统
- `HCI`: 人机交互
- `SE`: 软件工程
- `Algo`: 算法设计与分析
- `CEC`: 云计算与边缘计算

## 6. 接口调用示例

### 6.1 JavaScript示例

```javascript
// 获取学生信息
const getStudentInfo = async () => {
  try {
    const response = await fetch('http://localhost:8080/v1/phd/student/info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    if (result.code === 200) {
      console.log('学生信息:', result.data);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
};

// 获取当前登录学生的研究方向选项
const getResearchAreas = async () => {
  try {
    const response = await fetch('http://localhost:8080/v1/phd/research-areas', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    if (result.code === 200) {
      console.log('研究方向列表:', result.data);
      // 找到已选择的研究方向
      const selectedArea = result.data.find(area => area.selected);
      console.log('已选择的研究方向:', selectedArea);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
};

// 更新研究方向
const updateResearchArea = async (areaId) => {
  try {
    const response = await fetch('http://localhost:8080/v1/phd/student/research-area', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        researchAreaId: areaId
      })
    });
    const result = await response.json();
    if (result.code === 200) {
      console.log('更新成功:', result.data);
    }
  } catch (error) {
    console.error('更新失败:', error);
  }
};
```

### 6.2 uni-app示例

```javascript
// 获取年审历史记录
const getReviewHistory = () => {
  uni.request({
    url: '/api/v1/phd/review/history',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    success: (res) => {
      if (res.data.code === 200) {
        console.log('历史记录:', res.data.data);
      }
    },
    fail: (error) => {
      console.error('请求失败:', error);
    }
  });
};

// 获取研究方向选项
const getResearchAreas = () => {
  uni.request({
    url: '/api/v1/phd/research-areas',
    method: 'GET',
    header: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    success: (res) => {
      if (res.data.code === 200) {
        console.log('研究方向列表:', res.data.data);
        // 处理选择状态
        res.data.data.forEach(area => {
          if (area.selected) {
            console.log('当前选择的研究方向:', area.skillName);
          }
        });
      }
    },
    fail: (error) => {
      console.error('请求失败:', error);
    }
  });
};

// 更新研究方向示例
const updateResearchArea = (areaId) => {
  uni.request({
    url: '/api/v1/phd/student/research-area',
    method: 'PUT',
    header: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: {
      researchAreaId: areaId
    },
    success: (res) => {
      if (res.data.code === 200) {
        console.log('研究方向更新成功:', res.data.data);
      }
    },
    fail: (error) => {
      console.error('更新失败:', error);
    }
  });
};
```

## 7. 注意事项

1. **认证**: 所有接口都需要在请求头中携带有效的Bearer Token
2. **数据验证**: 请求参数需要进行前端验证，确保数据格式正确
3. **错误处理**: 需要根据返回的错误码进行相应的错误处理
4. **分页**: 列表接口支持分页，建议使用分页加载优化用户体验
5. **缓存**: 可以对一些不常变化的数据（如研究方向列表）进行本地缓存
6. **超时**: 建议设置合理的请求超时时间（如10秒）
7. **重试**: 对于网络错误，可以实现自动重试机制
8. **研究方向唯一性**: 每个学生只能选择一个研究方向，更新时会覆盖之前的选择
9. **研究方向确认**: 研究方向的确认逻辑由前端处理，不依赖后端接口
10. **年审信息**: 年审记录仅包含基本的安排信息（时间、地点、评审员），不包含评价内容
11. **研究方向字段**: 在研究方向相关接口中，使用 `skillId` 和 `skillName` 字段名，以保持与前端数据结构的一致性

## 8. 更新日志

| 版本 | 更新时间   | 更新内容                                                     |
| ---- | ---------- | ------------------------------------------------------------ |
| v1.5 | 2025-08-18 | 更新研究方向相关接口，将字段名改为 `skillId`、`skillName`，增加 `selected` 字段，调整接口描述为"获取当前登录学生的研究方向选项"。 |
| v1.4 | 2025-08-18 | 移除研究方向数据结构中的 `category` 字段，简化数据结构。     |
| v1.3 | 2025-08-17 | 移除年审详情接口和评价相关字段，简化年审功能为基本信息管理。 |
| v1.2 | 2025-08-10 | 移除了研究方向确认接口 `POST /phd/research-areas/confirm`，该逻辑改为前端处理。 |
| v1.1 | 2025-08-09 | 将学生研究方向由多选改为单选，并更新相关接口及数据结构。移除了多选相关的错误码，简化了数据结构。 |
| v1.0 | 2025-07-17 | 初始版本，包含基础功能接口。                                 |

*本文档最后更新时间：2025-08-18*