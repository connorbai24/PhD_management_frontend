# 动态时间段配置系统 v2.1

## 概述

本系统实现了完全灵活的动态时间段配置功能，支持：
1. **任意数量的日期**：不限于两天，可以是1天、3天、5天或更多
2. **每日独立时间段配置**：每个日期可以配置不同的上午/下午时间段
3. **全局统一的评审设置**：所有场次使用统一的评审时长和间隔时间
4. **灵活的时间段组合**：某些日期可以只有上午、只有下午，或者两者都有
5. **动态适配**：前端页面自动根据配置数量和结构调整显示

## 新的配置结构

### 全局评审设置

所有场次都使用统一的评审时长和间隔时间，由管理员统一控制：

```javascript
export const globalReviewSettings = {
  slotDuration: 45, // 每场评审时长（分钟）- 全局统一
  breakTime: 15     // 场次间隔时间（分钟）- 全局统一
}
```

### 日期配置数组

每个日期只需要配置开始和结束时间，评审时长和间隔使用全局设置：

```javascript
export const dateConfigs = [
  {
    date: '2025-06-26',
    displayDate: '2025/06/26周四',
    // 只需要配置开始和结束时间
    morning: {
      startTime: '09:00',
      endTime: '12:00'
    },
    afternoon: {
      startTime: '14:00',
      endTime: '17:00'
    }
  },
  {
    date: '2025-06-27',
    displayDate: '2025/06/27周五',
    morning: {
      startTime: '08:30',
      endTime: '11:30'
    },
    afternoon: {
      startTime: '13:30',
      endTime: '16:30'
    }
  },
  {
    date: '2025-06-28',
    displayDate: '2025/06/28周六',
    // 只有上午时间段
    morning: {
      startTime: '09:00',
      endTime: '12:00'
    }
    // 注意：没有 afternoon 配置
  }
]
```

## 配置特性

### 1. 全局统一的评审设置

所有评审场次都使用相同的时长和间隔：

```javascript
// 管理员只需要修改这一个地方
export const globalReviewSettings = {
  slotDuration: 45, // 所有场次都是45分钟
  breakTime: 15     // 所有场次间隔都是15分钟
}
```

**优势：**
- 评审标准统一，确保公平性
- 管理员只需要在一个地方修改设置
- 避免不同时间段配置不一致的问题

### 2. 灵活的时间段安排

虽然评审时长统一，但可以灵活安排不同的时间段：

```javascript
export const flexibleSchedule = [
  {
    date: '2025-07-01',
    displayDate: '2025/07/01周二',
    morning: {
      startTime: '08:00',    // 早上8点开始
      endTime: '12:00'       // 到12点结束
    },
    afternoon: {
      startTime: '14:00',    // 下午2点开始
      endTime: '17:00'       // 到5点结束
    }
  },
  {
    date: '2025-07-02',
    displayDate: '2025/07/02周三',
    // 只有下午，但时间段不同
    afternoon: {
      startTime: '13:00',    // 下午1点开始
      endTime: '18:00'       // 到晚上6点结束
    }
  },
  {
    date: '2025-07-03',
    displayDate: '2025/07/03周四',
    // 只有上午，时间更短
    morning: {
      startTime: '09:30',    // 9:30开始
      endTime: '11:30'       // 11:30结束（只能安排1-2场）
    }
  }
]
```

### 3. 自动时间段生成

系统会根据时间段的开始/结束时间和全局设置自动计算能安排多少场评审：

- **时间段长度** = 结束时间 - 开始时间
- **可安排场次** = floor((时间段长度 - 最后一场时长) / (场次时长 + 间隔时间)) + 1

例如：上午 09:00-12:00（180分钟），场次45分钟，间隔15分钟
- 可安排场次 = floor((180-45)/(45+15)) + 1 = floor(135/60) + 1 = 2 + 1 = 3场
- 实际时间：09:00-09:45, 10:00-10:45, 11:00-11:45

## 管理员操作指南

### 1. 修改全局评审设置

要修改所有场次的时长和间隔：

```javascript
export const globalReviewSettings = {
  slotDuration: 60, // 改为60分钟一场
  breakTime: 10     // 改为10分钟间隔
}
```

### 2. 添加新日期

要添加新的年审日期：

```javascript
export const dateConfigs = [
  // 现有配置...
  
  // 新增日期
  {
    date: '2025-06-30',
    displayDate: '2025/06/30周一',
    morning: {
      startTime: '08:00',
      endTime: '11:00'
    },
    afternoon: {
      startTime: '14:00',
      endTime: '17:00'
    }
  }
]
```

### 3. 修改特定日期的时间段

要修改某个特定日期的时间安排：

```javascript
{
  date: '2025-06-26',
  displayDate: '2025/06/26周四',
  morning: {
    startTime: '07:00',    // 改为7点开始
    endTime: '11:00'       // 改为11点结束
  }
  // 移除下午时间段（如果不需要）
}
```

### 4. 只安排上午或下午

```javascript
// 只有上午
{
  date: '2025-06-26',
  displayDate: '2025/06/26周四',
  morning: {
    startTime: '09:00',
    endTime: '12:00'
  }
  // 不包含 afternoon 配置
}

// 只有下午
{
  date: '2025-06-27',
  displayDate: '2025/06/27周五',
  afternoon: {
    startTime: '14:00',
    endTime: '17:00'
  }
  // 不包含 morning 配置
}
```: 0
    }
    // 注意：没有 afternoon 配置
  }
]
```

## 配置特性

### 1. 任意数量的日期

你可以配置任意数量的日期，从1天到多天：

**单天配置示例：**
```javascript
export const singleDayConfig = [
  {
    date: '2025-07-01',
    displayDate: '2025/07/01周二',
    morning: { /* ... */ },
    afternoon: { /* ... */ }
  }
]
```

**五天配置示例：**
```javascript
export const fiveDayConfig = [
  { date: '2025-08-01', displayDate: '2025/08/01周五', /* ... */ },
  { date: '2025-08-02', displayDate: '2025/08/02周六', /* ... */ },
  { date: '2025-08-05', displayDate: '2025/08/05周二', /* ... */ },
  { date: '2025-08-06', displayDate: '2025/08/06周三', /* ... */ },
  { date: '2025-08-07', displayDate: '2025/08/07周四', /* ... */ }
]
```

### 2. 每日独立的时间段配置

每个日期可以有完全不同的时间段设置：

```javascript
export const flexibleConfig = [
  {
    date: '2025-07-01',
    displayDate: '2025/07/01周二',
    morning: {
      startTime: '08:00',    // 早上8点开始
      endTime: '12:00',
      slotDuration: 50,      // 50分钟一场
      breakTime: 10          // 10分钟休息
    },
    afternoon: {
      startTime: '14:00',
      endTime: '17:00',
      slotDuration: 45,      // 45分钟一场
      breakTime: 15          // 15分钟休息
    }
  },
  {
    date: '2025-07-02',
    displayDate: '2025/07/02周三',
    // 完全不同的时间设置
    morning: {
      startTime: '09:30',    // 早上9:30开始
      endTime: '11:30',
      slotDuration: 60,      // 60分钟一场
      breakTime: 0           // 无休息时间
    },
    afternoon: {
      startTime: '13:00',    // 下午1点开始
      endTime: '18:00',      // 到晚上6点
      slotDuration: 30,      // 30分钟一场
      breakTime: 15
    }
  }
]
```

### 3. 灵活的时间段组合

某些日期可以只安排上午或下午：

```javascript
export const mixedConfig = [
  {
    date: '2025-07-01',
    displayDate: '2025/07/01周二',
    // 全天安排
    morning: { /* ... */ },
    afternoon: { /* ... */ }
  },
  {
    date: '2025-07-02',
    displayDate: '2025/07/02周三',
    // 只有下午
    afternoon: {
      startTime: '13:00',
      endTime: '18:00',
      slotDuration: 30,
      breakTime: 15
    }
  },
  {
    date: '2025-07-03',
    displayDate: '2025/07/03周四',
    // 只有上午
    morning: {
      startTime: '09:00',
      endTime: '12:00',
      slotDuration: 45,
      breakTime: 15
    }
  }
]
```

## 管理员操作指南

### 1. 添加新日期

要添加新的年审日期，在 `dateConfigs` 数组中增加新的配置对象：

```javascript
export const dateConfigs = [
  // 现有配置...
  
  // 新增日期
  {
    date: '2025-06-30',
    displayDate: '2025/06/30周一',
    morning: {
      startTime: '08:00',
      endTime: '11:00',
      slotDuration: 30,
      breakTime: 15
    },
    afternoon: {
      startTime: '14:00',
      endTime: '17:00',
      slotDuration: 45,
      breakTime: 10
    }
  }
]
```

### 2. 修改特定日期的时间段

要修改某个特定日期的配置，直接编辑对应的配置对象：

```javascript
// 修改第一天的配置
{
  date: '2025-06-26',
  displayDate: '2025/06/26周四',
  morning: {
    startTime: '07:00',    // 改为7点开始
    endTime: '11:00',      // 改为11点结束
    slotDuration: 60,      // 改为60分钟一场
    breakTime: 0           // 无休息时间
  }
  // 移除下午时间段（如果不需要）
}
```

### 3. 删除日期

要删除某个日期，直接从 `dateConfigs` 数组中移除对应的配置对象。

### 4. 只安排上午或下午

要让某天只有上午或下午安排，只需要包含对应的时间段配置：

```javascript
// 只有上午
{
  date: '2025-06-26',
  displayDate: '2025/06/26周四',
  morning: {
    startTime: '09:00',
    endTime: '12:00',
    slotDuration: 45,
    breakTime: 15
  }
  // 不包含 afternoon 配置
}

// 只有下午
{
  date: '2025-06-27',
  displayDate: '2025/06/27周五',
  afternoon: {
    startTime: '14:00',
    endTime: '17:00',
    slotDuration: 45,
    breakTime: 15
  }
  // 不包含 morning 配置
}
```

## 前端自动适配

### 动态渲染

前端页面会自动根据配置进行动态渲染：

```vue
<template>
  <!-- 动态渲染所有日期 -->
  <view v-for="dayKey in dateKeys" :key="dayKey" class="day-section">
    <view class="day-header">
      <text class="day-title">{{ timeConfig[dayKey].displayDate }}</text>
    </view>
    
    <!-- 上午时间段（仅当存在时显示） -->
    <view v-if="timeConfig[dayKey].morning" class="time-period">
      <text class="period-title">
        上午 ({{ timeConfig[dayKey].morning.startTime }}-{{ timeConfig[dayKey].morning.endTime }})
      </text>
      <!-- 动态生成时间段 -->
    </view>
    
    <!-- 下午时间段（仅当存在时显示） -->
    <view v-if="timeConfig[dayKey].afternoon" class="time-period">
      <text class="period-title">
        下午 ({{ timeConfig[dayKey].afternoon.startTime }}-{{ timeConfig[dayKey].afternoon.endTime }})
      </text>
      <!-- 动态生成时间段 -->
    </view>
  </view>
</template>
```

### 响应式计算

系统会自动计算总时间段数和生成对应的时间槽：

```javascript
// 计算总时间段数
const totalSlots = computed(() => {
  return calculateTotalSlots(timeConfig.value)
})

// 获取指定日期和时间段的时间槽
const getTimeSlotsForDay = (dayKey, period) => {
  return getTimeSlotsForDay(timeConfig.value, dayKey, period)
}
```

## 配置示例

### 示例1：灵活的三天配置

```javascript
export const configExample1 = generateTimeConfig([
  {
    date: '2025-07-01',
    displayDate: '2025/07/01周二',
    morning: {
      startTime: '08:00',
      endTime: '12:00',
      slotDuration: 50,
      breakTime: 10
    },
    afternoon: {
      startTime: '14:00',
      endTime: '17:00',
      slotDuration: 45,
      breakTime: 15
    }
  },
  {
    date: '2025-07-02',
    displayDate: '2025/07/02周三',
    // 只有下午
    afternoon: {
      startTime: '13:00',
      endTime: '18:00',
      slotDuration: 30,
      breakTime: 15
    }
  },
  {
    date: '2025-07-03',
    displayDate: '2025/07/03周四',
    morning: {
      startTime: '09:30',
      endTime: '11:30',
      slotDuration: 60,
      breakTime: 0
    },
    afternoon: {
      startTime: '15:00',
      endTime: '17:00',
      slotDuration: 30,
      breakTime: 10
    }
  }
])
```

### 示例2：五天密集安排

```javascript
export const configExample2 = generateTimeConfig([
  {
    date: '2025-08-01',
    displayDate: '2025/08/01周五',
    morning: {
      startTime: '07:30',
      endTime: '11:30',
      slotDuration: 60,
      breakTime: 0
    }
  },
  {
    date: '2025-08-02',
    displayDate: '2025/08/02周六',
    afternoon: {
      startTime: '14:30',
      endTime: '18:30',
      slotDuration: 30,
      breakTime: 15
    }
  },
  {
    date: '2025-08-05',
    displayDate: '2025/08/05周二',
    morning: {
      startTime: '09:00',
      endTime: '12:00',
      slotDuration: 45,
      breakTime: 15
    },
    afternoon: {
      startTime: '14:00',
      endTime: '17:00',
      slotDuration: 45,
      breakTime: 15
    }
  },
  {
    date: '2025-08-06',
    displayDate: '2025/08/06周三',
    morning: {
      startTime: '08:00',
      endTime: '10:00',
      slotDuration: 40,
      breakTime: 20
    }
  },
  {
    date: '2025-08-07',
    displayDate: '2025/08/07周四',
    afternoon: {
      startTime: '13:00',
      endTime: '16:00',
      slotDuration: 35,
      breakTime: 25
    }
  }
])
```

## 测试功能

页面提供"测试配置更新"按钮，可以在不同配置间切换来验证动态效果：

```javascript
const testConfigUpdate = () => {
  const testConfigs = [configExample1, configExample2, defaultTimeConfig]
  const randomConfig = testConfigs[Math.floor(Math.random() * testConfigs.length)]
  
  const validation = validateTimeConfig(randomConfig)
  if (validation.isValid) {
    timeConfig.value = randomConfig
    initializeSelectedSlots()
    
    const configInfo = `配置更新：${Object.keys(randomConfig).length}天，共${calculateTotalSlots(randomConfig)}个时间段`
    console.log(configInfo)
    uni.showToast({ title: '配置已更新', icon: 'success' })
  }
}
```

## 验证机制

### 配置验证

系统提供多层验证机制：

```javascript
// 验证日期配置数组
const validation = validateDateConfigs(dateConfigs)
if (!validation.isValid) {
  console.error('配置错误:', validation.errors)
}

// 验证生成的完整配置
const configValidation = validateTimeConfig(timeConfig)
if (!configValidation.isValid) {
  console.error('配置错误:', configValidation.errors)
}
```

### 常见验证错误

1. **时间段配置错误**：
   - `开始时间不能晚于或等于结束时间`
   - `时间段时长必须大于0`
   - `休息时间不能为负数`

2. **日期配置错误**：
   - `日期配置必须是非空数组`
   - `缺少date或displayDate字段`
   - `必须至少有一个时间段（morning或afternoon）`

## 后端集成建议

### API 接口设计

```javascript
// 获取时间段配置
GET /api/time-configs
// 返回格式：
{
  "success": true,
  "data": [
    {
      "date": "2025-06-26",
      "displayDate": "2025/06/26周四",
      "morning": { /* ... */ },
      "afternoon": { /* ... */ }
    }
  ]
}

// 更新时间段配置
POST /api/time-configs
// 请求格式：与上面的data格式相同
```

### 前端集成示例

```javascript
// 从服务器加载配置
const loadTimeConfigFromServer = async () => {
  try {
    const response = await uni.request({
      url: '/api/time-configs',
      method: 'GET'
    })
    
    if (response.data.success) {
      const serverConfig = generateTimeConfig(response.data.data)
      const validation = validateTimeConfig(serverConfig)
      
      if (validation.isValid) {
        timeConfig.value = serverConfig
        initializeSelectedSlots()
      } else {
        console.error('服务器配置无效:', validation.errors)
        timeConfig.value = defaultTimeConfig
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    timeConfig.value = defaultTimeConfig
  }
}

// 保存配置到服务器
const saveTimeConfigToServer = async (configs) => {
  try {
    await uni.request({
      url: '/api/time-configs',
      method: 'POST',
      data: { configs }
    })
    uni.showToast({ title: '配置保存成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '保存失败', icon: 'error' })
  }
}
```

## 优势总结

1. **完全灵活**：支持任意数量的日期，每日独立配置
2. **动态适配**：前端自动根据配置调整显示和布局
3. **易于管理**：通过简单的数组配置即可管理复杂的时间安排
4. **强大验证**：多层验证机制确保配置的有效性
5. **向后兼容**：可以轻松从旧的固定配置迁移到新的灵活配置
6. **扩展性好**：可以轻松添加新功能，如时间段类型、优先级等

## 迁移指南

如果你已有旧的配置，可以按以下步骤迁移：

### 1. 从统一配置迁移

**旧配置：**
```javascript
export const unifiedTimeSettings = {
  morning: { startTime: '09:00', endTime: '12:00', /* ... */ },
  afternoon: { startTime: '14:00', endTime: '17:00', /* ... */ }
}
```

**新配置：**
```javascript
export const dateConfigs = [
  {
    date: '2025-06-26',
    displayDate: '2025/06/26周四',
    morning: { startTime: '09:00', endTime: '12:00', /* ... */ },
    afternoon: { startTime: '14:00', endTime: '17:00', /* ... */ }
  },
  // 添加更多日期...
]
```

### 2. 测试迁移

使用测试功能验证迁移后的配置：

```javascript
// 在 schedule.vue 中点击 "测试配置更新" 按钮
// 观察不同配置下的显示效果
// 检查控制台的配置验证信息
```

## 故障排除

### 常见问题

1. **页面不显示某个日期**：
   - 检查 `dateConfigs` 数组中是否包含该日期配置
   - 确认该日期至少有 `morning` 或 `afternoon` 配置

2. **时间段不生成**：
   - 验证时间格式是否为 "HH:MM"
   - 确认 `slotDuration` 大于 0
   - 检查 `startTime` 是否早于 `endTime`

3. **选中状态不正确**：
   - 清除本地存储：`uni.removeStorageSync('selectedTimeSlots')`
   - 重新加载页面让系统重新初始化选中状态

### 调试技巧

```javascript
// 在浏览器控制台中执行以下代码进行调试：

// 查看当前配置
console.log('当前配置:', timeConfig.value)

// 查看日期键
console.log('日期键:', dateKeys.value)

// 查看总时间段数
console.log('总时间段数:', totalSlots.value)

// 查看选中的时间段
console.log('选中时间段:', selectedSlots.value)

// 验证配置
const validation = validateTimeConfig(timeConfig.value)
console.log('配置验证结果:', validation)
```

这个新的配置系统为年审时间管理提供了最大的灵活性，能够适应各种复杂的时间安排需求。