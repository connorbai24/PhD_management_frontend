// 时间段配置管理
// 管理员可以在这里修改时间段配置

// 全局统一的评审时间设置（所有场次都使用这个配置）
export const globalReviewSettings = {
  slotDuration: 45, // 每场评审时长（分钟）- 全局统一
  breakTime: 15     // 场次间隔时间（分钟）- 全局统一
}

// 日期配置 - 支持任意数量的日期，每个时间段只需配置开始和结束时间
export const dateConfigs = [
  {
    date: '2025-06-26',
    displayDate: '2025/06/26周四',
    // 只需要配置开始和结束时间，评审时长和间隔使用全局设置
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
    // 只有上午时间段，没有下午时间段
    morning: {
      startTime: '09:00',
      endTime: '12:00'
    }
    // 注意：没有 afternoon 配置，表示这天下午不安排年审
  }
]

// 生成完整的时间配置（将全局设置应用到每个时间段）
export const generateTimeConfig = (configs = dateConfigs, globalSettings = globalReviewSettings) => {
  const timeConfig = {}
  
  configs.forEach((dayConfig, index) => {
    const dayKey = `day${index + 1}`
    timeConfig[dayKey] = {
      date: dayConfig.date,
      displayDate: dayConfig.displayDate,
      // 只有当配置存在时才添加时间段，并应用全局设置
      ...(dayConfig.morning && { 
        morning: { 
          ...dayConfig.morning,
          slotDuration: globalSettings.slotDuration,
          breakTime: globalSettings.breakTime
        } 
      }),
      ...(dayConfig.afternoon && { 
        afternoon: { 
          ...dayConfig.afternoon,
          slotDuration: globalSettings.slotDuration,
          breakTime: globalSettings.breakTime
        } 
      })
    }
  })
  
  return timeConfig
}

// 默认配置
export const defaultTimeConfig = generateTimeConfig()

// 示例配置1：三天，每天时间段不同，但评审时长统一
export const configExample1 = generateTimeConfig([
  {
    date: '2025-07-01',
    displayDate: '2025/07/01周二',
    morning: {
      startTime: '08:00',
      endTime: '12:00'
    },
    afternoon: {
      startTime: '14:00',
      endTime: '17:00'
    }
  },
  {
    date: '2025-07-02',
    displayDate: '2025/07/02周三',
    // 只有下午时间段
    afternoon: {
      startTime: '13:00',
      endTime: '18:00'
    }
  },
  {
    date: '2025-07-03',
    displayDate: '2025/07/03周四',
    morning: {
      startTime: '09:30',
      endTime: '11:30'
    },
    afternoon: {
      startTime: '15:00',
      endTime: '17:00'
    }
  }
], globalReviewSettings)

// 示例配置2：五天配置，使用不同的全局设置
export const configExample2 = generateTimeConfig([
  {
    date: '2025-08-01',
    displayDate: '2025/08/01周五',
    morning: {
      startTime: '07:30',
      endTime: '11:30'
    }
  },
  {
    date: '2025-08-02',
    displayDate: '2025/08/02周六',
    afternoon: {
      startTime: '14:30',
      endTime: '18:30'
    }
  },
  {
    date: '2025-08-05',
    displayDate: '2025/08/05周二',
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
    date: '2025-08-06',
    displayDate: '2025/08/06周三',
    morning: {
      startTime: '08:00',
      endTime: '10:00'
    }
  },
  {
    date: '2025-08-07',
    displayDate: '2025/08/07周四',
    afternoon: {
      startTime: '13:00',
      endTime: '16:00'
    }
  }
], {
  slotDuration: 30,  // 这个示例使用30分钟场次
  breakTime: 10      // 10分钟间隔
})

// 动态生成时间段的工具函数
export const generateTimeSlots = (startTime, endTime, slotDuration, breakTime) => {
  const slots = []
  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)
  
  let currentTime = new Date(start)
  let slotId = 1
  
  while (currentTime < end) {
    const slotStart = new Date(currentTime)
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000)
    
    if (slotEnd <= end) {
      const startStr = slotStart.toTimeString().slice(0, 5)
      const endStr = slotEnd.toTimeString().slice(0, 5)
      slots.push({
        id: slotId,
        time: `${startStr}-${endStr}`,
        startTime: startStr,
        endTime: endStr
      })
      slotId++
    }
    
    // 移动到下一个时间段（包括休息时间）
    currentTime = new Date(slotEnd.getTime() + breakTime * 60000)
  }
  
  return slots
}

// 计算总时间段数
export const calculateTotalSlots = (config) => {
  let total = 0
  
  Object.values(config).forEach(day => {
    if (day.morning) {
      const morningSlots = generateTimeSlots(
        day.morning.startTime, 
        day.morning.endTime, 
        day.morning.slotDuration, 
        day.morning.breakTime
      )
      total += morningSlots.length
    }
    
    if (day.afternoon) {
      const afternoonSlots = generateTimeSlots(
        day.afternoon.startTime, 
        day.afternoon.endTime, 
        day.afternoon.slotDuration, 
        day.afternoon.breakTime
      )
      total += afternoonSlots.length
    }
  })
  
  return total
}

// 验证全局评审设置的有效性
export const validateGlobalSettings = (settings) => {
  const errors = []
  
  if (settings.slotDuration <= 0) {
    errors.push('评审时长必须大于0分钟')
  }
  
  if (settings.breakTime < 0) {
    errors.push('场次间隔不能为负数')
  }
  
  if (settings.slotDuration > 180) {
    errors.push('单场评审时长不能超过3小时（180分钟）')
  }
  
  if (settings.breakTime > 60) {
    errors.push('场次间隔不建议超过1小时（60分钟）')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 验证单个时间段配置的有效性
export const validateTimeSlot = (timeSlot, dayKey, period) => {
  const errors = []
  
  const start = new Date(`2000-01-01 ${timeSlot.startTime}`)
  const end = new Date(`2000-01-01 ${timeSlot.endTime}`)
  
  if (start >= end) {
    errors.push(`${dayKey} ${period}时间段配置无效：开始时间不能晚于或等于结束时间`)
  }
  
  // 检查时间段是否足够安排至少一场评审
  const duration = (end - start) / (1000 * 60) // 转换为分钟
  if (duration < timeSlot.slotDuration) {
    errors.push(`${dayKey} ${period}时间段太短，无法安排一场评审（需要至少${timeSlot.slotDuration}分钟）`)
  }
  
  return errors
}

// 验证配置的有效性
export const validateTimeConfig = (config) => {
  const errors = []
  
  Object.entries(config).forEach(([dayKey, day]) => {
    // 验证上午时间段（如果存在）
    if (day.morning) {
      const morningErrors = validateTimeSlot(day.morning, dayKey, '上午')
      errors.push(...morningErrors)
    }
    
    // 验证下午时间段（如果存在）
    if (day.afternoon) {
      const afternoonErrors = validateTimeSlot(day.afternoon, dayKey, '下午')
      errors.push(...afternoonErrors)
    }
    
    // 确保至少有一个时间段
    if (!day.morning && !day.afternoon) {
      errors.push(`${dayKey} 必须至少有一个时间段（上午或下午）`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 验证日期配置数组的函数
export const validateDateConfigs = (configs, globalSettings = globalReviewSettings) => {
  const errors = []
  
  if (!Array.isArray(configs) || configs.length === 0) {
    errors.push('日期配置必须是非空数组')
    return { isValid: false, errors }
  }
  
  // 首先验证全局设置
  const globalValidation = validateGlobalSettings(globalSettings)
  if (!globalValidation.isValid) {
    errors.push(...globalValidation.errors)
  }
  
  configs.forEach((config, index) => {
    if (!config.date) {
      errors.push(`第${index + 1}个日期配置缺少date字段`)
    }
    
    if (!config.displayDate) {
      errors.push(`第${index + 1}个日期配置缺少displayDate字段`)
    }
    
    if (!config.morning && !config.afternoon) {
      errors.push(`第${index + 1}个日期配置必须至少有一个时间段（morning或afternoon）`)
    }
    
    if (config.morning) {
      // 应用全局设置后进行验证
      const morningWithGlobal = {
        ...config.morning,
        slotDuration: globalSettings.slotDuration,
        breakTime: globalSettings.breakTime
      }
      const morningErrors = validateTimeSlot(morningWithGlobal, `第${index + 1}天`, '上午')
      errors.push(...morningErrors)
    }
    
    if (config.afternoon) {
      // 应用全局设置后进行验证
      const afternoonWithGlobal = {
        ...config.afternoon,
        slotDuration: globalSettings.slotDuration,
        breakTime: globalSettings.breakTime
      }
      const afternoonErrors = validateTimeSlot(afternoonWithGlobal, `第${index + 1}天`, '下午')
      errors.push(...afternoonErrors)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 获取配置中的所有日期键
export const getDateKeys = (config) => {
  return Object.keys(config).sort((a, b) => {
    const numA = parseInt(a.replace('day', ''))
    const numB = parseInt(b.replace('day', ''))
    return numA - numB
  })
}

// 根据日期键获取时间段配置
export const getTimeSlotsForDayUtil = (config, dayKey, period) => {
  const day = config[dayKey]
  if (!day || !day[period]) {
    return []
  }
  
  return generateTimeSlots(
    day[period].startTime,
    day[period].endTime,
    day[period].slotDuration,
    day[period].breakTime
  )
}

// 更新全局评审设置的函数
export const updateGlobalSettings = (newSettings) => {
  const validation = validateGlobalSettings(newSettings)
  if (!validation.isValid) {
    throw new Error(`全局设置无效: ${validation.errors.join(', ')}`)
  }
  
  // 更新全局设置
  globalReviewSettings.slotDuration = newSettings.slotDuration
  globalReviewSettings.breakTime = newSettings.breakTime
  
  return validation
}

// 获取当前全局设置的函数
export const getCurrentGlobalSettings = () => {
  return { ...globalReviewSettings }
}