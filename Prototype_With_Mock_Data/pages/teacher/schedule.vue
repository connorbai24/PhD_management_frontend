<template>
  <view class="schedule-container">
    <!-- 第一种显示模式：截止日期之后，显示原始页面 -->
    <view v-if="isDeadlinePassed">
      <!-- 顶部导航栏 -->
      <view class="nav-bar">
        <text class="nav-title">评审日程</text>
        <view class="notification-wrapper" @click="navigateToNotification">
          <view class="notification-icon">🔔</view>
          <!-- 新通知小红点 -->
          <view v-if="hasNewNotification" class="notification-dot"></view>
        </view>
      </view>
      <br>
      
      <!-- 评审任务列表 -->
      <scroll-view class="schedule-list" scroll-y="true">
        <view v-for="(daySchedule, index) in scheduleData" :key="index" class="day-group">
          <!-- 日期分组标题 -->
          <view class="date-header">
            <text class="date-text">{{ daySchedule.date }}</text>
            <text class="weekday-text">{{ daySchedule.weekday }}</text>
          </view>
          
          <!-- 该日期下的评审任务 -->
          <view v-for="(task, taskIndex) in daySchedule.tasks" :key="taskIndex" class="review-card">
            <!-- 时间信息 -->
            <view class="time-section">
              <text class="time-text">{{ task.timeRange }}</text>
            </view>
            
            <!-- 主要信息区域 -->
            <view class="info-section">
              <!-- 学生信息 -->
              <view class="student-info">
                <text class="student-name">{{ task.studentName }} 同学</text>
                <text class="research-field">{{ task.researchField }}</text>
              </view>
              
              <!-- 地点信息 -->
              <view class="location-info">
                <text class="location-label">地点：</text>
                <text class="location-text">{{ task.location }}</text>
              </view>
              
              <!-- 角色与搭档信息 -->
              <view class="role-info">
                <view class="role-item">
                  <text class="role-label">我的角色：</text>
                  <text class="role-text">{{ task.myRole }}</text>
                </view>
                <view class="partner-item">
                  <text class="partner-label">搭档评审：</text>
                  <text class="partner-text">{{ task.coAssessor }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态提示 -->
        <view v-if="scheduleData.length === 0" class="empty-state">
          <text class="empty-icon">📅</text>
          <text class="empty-title">暂无评审安排</text>
          <text class="empty-subtitle">请等待管理员发布最新的评审日程</text>
        </view>
      </scroll-view>
    </view>

    <!-- 第二种显示模式：截止日期之前，显示时间选择页面 -->
    <view v-else class="time-selection-wrapper">
      <!-- 顶部导航栏 -->
      <view class="nav-bar">
        <text class="nav-title">评审日程</text>
        <view class="notification-wrapper" @click="navigateToNotification">
          <view class="notification-icon">🔔</view>
          <!-- 新通知小红点 -->
          <view v-if="hasNewNotification" class="notification-dot"></view>
        </view>
      </view>

      <!-- 截止日期提醒 -->
      <view class="deadline-reminder">
        <view class="deadline-section">
          <text class="deadline-label">Deadline</text>
          <text class="deadline-time">{{ formatDeadline }}</text>
          <text class="countdown-text">剩余时间：{{ countdown }}</text>
        </view>
      </view>

      <!-- 主要内容区域 -->
      <view class="content-area">
        <!-- 标题部分 -->
        <view class="header-section">
          <text class="main-title">Available Time Selection</text>
          <text class="subtitle">Your Selected Time</text>
        </view>

        <!-- 动态显示所有可选时段（未点击Modify时不可点击） -->
        <view v-if="!showTimeSelection" class="time-selection-area">
          <!-- 动态渲染所有日期 -->
          <view v-for="dayKey in dateKeys" :key="dayKey" class="day-section">
            <view class="day-header">
              <text class="day-title">{{ timeConfig[dayKey].displayDate }}</text>
            </view>
            
            <!-- 上午时间段（如果存在） -->
            <view v-if="timeConfig[dayKey].morning" class="time-period">
              <text class="period-title">上午 ({{ timeConfig[dayKey].morning.startTime }}-{{ timeConfig[dayKey].morning.endTime }})</text>
              <view class="time-slots">
                <view 
                  v-for="slot in getTimeSlotsForDay(dayKey, 'morning')" 
                  :key="`${dayKey}-morning-${slot.id}`"
                  class="time-slot"
                  :class="{ active: selectedSlots.includes(`${timeConfig[dayKey].date}-morning-${slot.id}`) }"
                >
                  <text class="slot-text">{{ slot.time }}</text>
                </view>
              </view>
            </view>
            
            <!-- 下午时间段（如果存在） -->
            <view v-if="timeConfig[dayKey].afternoon" class="time-period">
              <text class="period-title">下午 ({{ timeConfig[dayKey].afternoon.startTime }}-{{ timeConfig[dayKey].afternoon.endTime }})</text>
              <view class="time-slots">
                <view 
                  v-for="slot in getTimeSlotsForDay(dayKey, 'afternoon')" 
                  :key="`${dayKey}-afternoon-${slot.id}`"
                  class="time-slot"
                  :class="{ active: selectedSlots.includes(`${timeConfig[dayKey].date}-afternoon-${slot.id}`) }"
                >
                  <text class="slot-text">{{ slot.time }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 选择统计 -->
          <view class="selection-summary">
            <text class="summary-text">已选择: {{ selectedSlots.length }} / {{ totalSlots }} 个时间段</text>
            <text class="summary-note">默认所有时段均可用，若有时段冲突请在截止日期前加以修改</text>
          </view>
        </view>

        <!-- Modify 按钮 -->
        <button class="modify-btn" @click="toggleTimeSelection">
          {{ showTimeSelection ? 'Confirm' : 'Modify' }}
        </button>
        
        <!-- 测试按钮：模拟管理员更新配置 -->
        <button class="test-btn" @click="testConfigUpdate">
          测试配置更新
        </button>

        <!-- 时间选择区域（当点击Modify时显示，可编辑） -->
        <view v-if="showTimeSelection" class="time-selection-area">
          <!-- 动态渲染所有日期 -->
          <view v-for="dayKey in dateKeys" :key="dayKey" class="day-section">
            <view class="day-header">
              <text class="day-title">{{ timeConfig[dayKey].displayDate }}</text>
            </view>
            
            <!-- 上午时间段（如果存在） -->
            <view v-if="timeConfig[dayKey].morning" class="time-period">
              <text class="period-title">上午 ({{ timeConfig[dayKey].morning.startTime }}-{{ timeConfig[dayKey].morning.endTime }})</text>
              <view class="time-slots">
                <view 
                  v-for="slot in getTimeSlotsForDay(dayKey, 'morning')" 
                  :key="`${dayKey}-morning-${slot.id}`"
                  class="time-slot"
                  :class="{ active: selectedSlots.includes(`${timeConfig[dayKey].date}-morning-${slot.id}`) }"
                  @click="toggleTimeSlot(timeConfig[dayKey].date, 'morning', slot.id)"
                >
                  <text class="slot-text">{{ slot.time }}</text>
                </view>
              </view>
            </view>
            
            <!-- 下午时间段（如果存在） -->
            <view v-if="timeConfig[dayKey].afternoon" class="time-period">
              <text class="period-title">下午 ({{ timeConfig[dayKey].afternoon.startTime }}-{{ timeConfig[dayKey].afternoon.endTime }})</text>
              <view class="time-slots">
                <view 
                  v-for="slot in getTimeSlotsForDay(dayKey, 'afternoon')" 
                  :key="`${dayKey}-afternoon-${slot.id}`"
                  class="time-slot"
                  :class="{ active: selectedSlots.includes(`${timeConfig[dayKey].date}-afternoon-${slot.id}`) }"
                  @click="toggleTimeSlot(timeConfig[dayKey].date, 'afternoon', slot.id)"
                >
                  <text class="slot-text">{{ slot.time }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 选择统计 -->
          <view class="selection-summary">
            <text class="summary-text">已选择: {{ selectedSlots.length }} / {{ totalSlots }} 个时间段</text>
            <text class="summary-note">默认所有时段均可用，若有时段冲突请在截止日期前加以修改</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="custom-tab-bar">
      <view class="tab-item active" @click="navigateTo('schedule')">
        <view class="tab-icon">📅</view>
        <text class="tab-text">评审日程</text>
      </view>
      <view class="tab-item" @click="navigateTo('profile')">
        <view class="tab-icon">👤</view>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>




<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  defaultTimeConfig, 
  configExample1, 
  configExample2, 
  generateTimeSlots, 
  calculateTotalSlots,
  validateTimeConfig,
  getDateKeys,
  getTimeSlotsForDayUtil
} from '@/utils/timeConfig.js'

// 响应式数据
const scheduleData = ref([
  {
    date: '11月20日',
    weekday: '星期四',
    tasks: [
      {
        id: 1,
        timeRange: '10:30 - 11:15',
        studentName: '李明',
        researchField: '人工智能',
        location: '科研楼A座 301会议室',
        myRole: '评审一号',
        coAssessor: '王伟 教授'
      },
      {
        id: 2,
        timeRange: '11:15 - 12:00',
        studentName: '张小雨',
        researchField: '计算机视觉',
        location: '科研楼A座 301会议室',
        myRole: '评审一号',
        coAssessor: '王伟 教授'
      }
    ]
  },
  {
    date: '11月21日',
    weekday: '星期五',
    tasks: [
      {
        id: 3,
        timeRange: '09:00 - 09:45',
        studentName: '陈思远',
        researchField: '机器学习',
        location: '科研楼B座 205会议室',
        myRole: '评审二号',
        coAssessor: '刘教授'
      },
      {
        id: 4,
        timeRange: '14:30 - 15:15',
        studentName: '赵文博',
        researchField: '数据挖掘',
        location: '科研楼A座 301会议室',
        myRole: '评审一号',
        coAssessor: '李教授'
      }
    ]
  }
])

// 是否有新通知
const hasNewNotification = ref(true)

// 时间相关数据
const currentTime = ref(new Date())
const deadlineDate = ref(new Date('2025-08-25T18:00:00'))
const selectedSlots = ref([]) // 将在初始化时设置
const showTimeSelection = ref(false) // 控制时间选择区域的显示

// 时间段数据 - 使用配置文件
const timeConfig = ref(defaultTimeConfig)

let timer = null
let countdownTimer = null

// 计算属性：获取日期键数组
const dateKeys = computed(() => {
  return getDateKeys(timeConfig.value)
})

// 计算总时间段数
const totalSlots = computed(() => {
  return calculateTotalSlots(timeConfig.value)
})

// 获取指定日期和时间段的时间槽
const getTimeSlotsForDay = (dayKey, period) => {
  return getTimeSlotsForDayUtil(timeConfig.value, dayKey, period)
}

// 初始化选中时间段（默认全选）
const initializeSelectedSlots = () => {
  const allSlots = []
  
  dateKeys.value.forEach(dayKey => {
    const day = timeConfig.value[dayKey]
    
    // 上午时间段
    if (day.morning) {
      const morningSlots = getTimeSlotsForDay(dayKey, 'morning')
      morningSlots.forEach(slot => {
        allSlots.push(`${day.date}-morning-${slot.id}`)
      })
    }
    
    // 下午时间段
    if (day.afternoon) {
      const afternoonSlots = getTimeSlotsForDay(dayKey, 'afternoon')
      afternoonSlots.forEach(slot => {
        allSlots.push(`${day.date}-afternoon-${slot.id}`)
      })
    }
  })
  
  selectedSlots.value = allSlots
  console.log('初始化选中时间段:', allSlots)
}

// 计算属性
const isDeadlinePassed = computed(() => {
  return currentTime.value > deadlineDate.value
})

const formatDeadline = computed(() => {
  return deadlineDate.value.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const countdown = computed(() => {
  const now = currentTime.value
  const deadline = deadlineDate.value
  const diff = deadline - now
  
  if (diff <= 0) return '已截止'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}天${hours}小时${minutes}分钟`
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
})

// 方法
const updateCurrentTime = () => {
  currentTime.value = new Date()
}

const loadSavedTimeSelection = () => {
  try {
    const saved = uni.getStorageSync('selectedTimeSlots')
    if (saved) {
      selectedSlots.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载保存的时间选择失败:', error)
  }
}

// 切换时间选择显示
const toggleTimeSelection = () => {
  if (showTimeSelection.value) {
    // 确认选择，保存到本地存储
    saveTimeSelection()
    showTimeSelection.value = false
  } else {
    // 显示时间选择
    showTimeSelection.value = true
  }
}

// 切换时间段选择
const toggleTimeSlot = (date, period, slotId) => {
  const slotKey = `${date}-${period}-${slotId}`
  const index = selectedSlots.value.indexOf(slotKey)
  
  if (index > -1) {
    selectedSlots.value.splice(index, 1)
  } else {
    selectedSlots.value.push(slotKey)
  }
}

// 保存时间选择
const saveTimeSelection = () => {
  try {
    uni.setStorageSync('selectedTimeSlots', JSON.stringify(selectedSlots.value))
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('保存时间选择失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
  }
}

// 模拟从服务器加载时间段配置
const loadTimeConfigFromServer = () => {
  // 这里模拟从服务器获取配置
  // 在实际应用中，这里会是一个API调用
  const mockServerConfig = configExample1 // 使用示例配置1作为模拟服务器配置
  
  // 验证配置
  const validation = validateTimeConfig(mockServerConfig)
  if (!validation.isValid) {
    console.error('服务器配置验证失败:', validation.errors)
    return
  }
  
  // 更新配置
  timeConfig.value = mockServerConfig
  
  // 重新初始化选中时间段
  initializeSelectedSlots()
  
  console.log('时间段配置已更新:', mockServerConfig)
}

// 测试配置更新方法
const testConfigUpdate = () => {
  // 模拟不同的配置变化
  const testConfigs = [configExample1, configExample2, defaultTimeConfig]
  
  const randomConfig = testConfigs[Math.floor(Math.random() * testConfigs.length)]
  
  // 验证配置
  const validation = validateTimeConfig(randomConfig)
  if (!validation.isValid) {
    console.error('配置验证失败:', validation.errors)
    uni.showToast({
      title: '配置无效',
      icon: 'error'
    })
    return
  }
  
  timeConfig.value = randomConfig
  initializeSelectedSlots()
  
  // 显示当前配置信息
  const configInfo = `配置更新：${Object.keys(randomConfig).length}天，共${calculateTotalSlots(randomConfig)}个时间段`
  console.log(configInfo)
  
  uni.showToast({
    title: '配置已更新',
    icon: 'success'
  })
}

onMounted(() => {
  console.log('评审日程页面已加载')
  checkNewNotifications()
  loadSavedTimeSelection()
  
  // 初始化选中时间段（如果本地存储为空）
  if (selectedSlots.value.length === 0) {
    initializeSelectedSlots()
  }
  
  // 每分钟更新一次当前时间
  timer = setInterval(updateCurrentTime, 60000)
  // 每秒更新倒计时
  countdownTimer = setInterval(updateCurrentTime, 1000)
  
  // 模拟从服务器获取最新的时间段配置
  loadTimeConfigFromServer()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

// 检查新通知
const checkNewNotifications = () => {
  hasNewNotification.value = true
}

// 跳转到通知页面
const navigateToNotification = () => {
  uni.navigateTo({
    url: '/pages/teacher/notification'
  })
}

// 自定义底部导航方法
const navigateTo = (page) => {
  if (page === 'schedule') {
    return
  } else if (page === 'profile') {
    uni.reLaunch({
      url: '/pages/teacher/profile'
    })
  }
}
</script>

<style scoped>
.schedule-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f2f2f7 0%, #f2f2f7 100%);
  padding: 0 24rpx;
  box-sizing: border-box;
  padding-bottom: 120rpx;
}

/* 顶部导航栏 */
.nav-bar {
  height: 88rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  margin: 0 -24rpx;
  position: relative;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.5rpx;
}

/* 通知图标 */
.notification-wrapper {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.notification-icon {
  font-size: 32rpx;
  color: #1d1d1f;
  transition: all 0.2s ease;
}

.notification-wrapper:active .notification-icon {
  transform: scale(0.9);
  color: #007AFF;
}

.notification-dot {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 16rpx;
  height: 16rpx;
  background: #FF3B30;
  border-radius: 50%;
  border: 2rpx solid #ffffff;
  z-index: 1;
}

/* 截止日期提醒区域 */
.deadline-reminder {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 20rpx;
  margin: 24rpx 0;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.deadline-section {
  text-align: center;
}

.deadline-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d1d1f;
  display: block;
  margin-bottom: 8rpx;
}

.deadline-time {
  font-size: 32rpx;
  font-weight: 600;
  color: #007AFF;
  display: block;
  margin-bottom: 8rpx;
}

.countdown-text {
  font-size: 24rpx;
  color: #FF3B30;
  font-weight: 500;
  display: block;
}

/* 时间选择模式的内容区域 */
.time-selection-wrapper {
  flex: 1;
}

.content-area {
  padding: 24rpx 0;
}

.header-section {
  text-align: center;
  margin-bottom: 32rpx;
}

.main-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1d1d1f;
  display: block;
  margin-bottom: 12rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #8E8E93;
  font-weight: 400;
  display: block;
}

/* Modify 按钮 */
.modify-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
  border-radius: 20rpx;
  border: none;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 32rpx;
}

.modify-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
}

/* 测试按钮 */
.test-btn {
  width: 100%;
  height: 60rpx;
  background: linear-gradient(135deg, #34C759 0%, #28A745 100%);
  border-radius: 16rpx;
  border: none;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(52, 199, 89, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 24rpx;
}

.test-btn:active {
  transform: translateY(1rpx);
  box-shadow: 0 2rpx 8rpx rgba(52, 199, 89, 0.3);
}

/* 时间选择区域 */
.time-selection-area {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.day-section {
  margin-bottom: 32rpx;
}

.day-header {
  text-align: center;
  margin-bottom: 24rpx;
}

.day-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d1d1f;
}

.time-period {
  margin-bottom: 24rpx;
}

.period-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d1d1f;
  display: block;
  margin-bottom: 16rpx;
}

.time-slots {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.time-slot {
  flex: 0 0 auto;
  min-width: 160rpx;
  max-width: calc(33.333% - 8rpx);
  height: 72rpx;
  background: rgba(255, 255, 255, 0.8);
  border: 2rpx solid #E5E5EA;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-bottom: 12rpx;
}

.time-slot.active {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007AFF;
}

.slot-text {
  font-size: 24rpx;
  color: #1d1d1f;
  font-weight: 500;
}

.time-slot.active .slot-text {
  color: #007AFF;
  font-weight: 600;
}

.selection-summary {
  text-align: center;
  padding: 24rpx 0;
  border-top: 1rpx solid rgba(0, 0, 0, 0.1);
}

.summary-text {
  font-size: 26rpx;
  color: #007AFF;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.summary-note {
  font-size: 22rpx;
  color: #8E8E93;
  display: block;
}

/* 评审任务列表（原始模式） */
.schedule-list {
  flex: 1;
  padding: 0;
}

.day-group {
  margin-bottom: 32rpx;
}

.date-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 20rpx;
  padding-left: 8rpx;
}

.date-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #1d1d1f;
  margin-right: 16rpx;
}

.weekday-text {
  font-size: 24rpx;
  color: #8E8E93;
  font-weight: 400;
}

/* 评审卡片 */
.review-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  padding: 28rpx;
  display: flex;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.time-section {
  width: 140rpx;
  flex-shrink: 0;
}

.time-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #007AFF;
  line-height: 1.2;
}

.info-section {
  flex: 1;
  margin-left: 24rpx;
}

.student-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  gap: 16rpx;
}

.student-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d1d1f;
}

.research-field {
  font-size: 24rpx;
  color: #007AFF;
  font-weight: 500;
  padding: 4rpx 8rpx;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8rpx;
}

.location-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  gap: 8rpx;
}

.location-label {
  font-size: 24rpx;
  color: #8E8E93;
  font-weight: 400;
}

.location-text {
  font-size: 24rpx;
  color: #1d1d1f;
  font-weight: 500;
}

.role-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.role-item, .partner-item {
  display: flex;
  align-items: center;
}

.role-label, .partner-label {
  font-size: 24rpx;
  color: #8E8E93;
  font-weight: 400;
  width: 120rpx;
  flex-shrink: 0;
}

.role-text {
  font-size: 24rpx;
  color: #007AFF;
  font-weight: 600;
}

.partner-text {
  font-size: 24rpx;
  color: #1d1d1f;
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
  display: block;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 12rpx;
  display: block;
}

.empty-subtitle {
  font-size: 26rpx;
  color: #8E8E93;
  display: block;
}

/* 自定义底部导航 */
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #ffffff;
  display: flex;
  box-shadow: 0 -1rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
}

.tab-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.tab-text {
  font-size: 24rpx;
  color: #8e8e93;
}

.tab-item.active .tab-text {
  color: #007AFF;
  font-weight: 500;
}
</style>