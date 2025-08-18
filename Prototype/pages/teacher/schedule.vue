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
              
              <!-- 任务状态操作 -->
              <view class="task-actions">
                <button 
                  v-if="task.status === 'pending'" 
                  class="status-btn pending" 
                  @click="updateTaskStatus(task.id, 'in-progress')"
                >
                  开始评审
                </button>
                <button 
                  v-if="task.status === 'in-progress'" 
                  class="status-btn complete" 
                  @click="updateTaskStatus(task.id, 'completed')"
                >
                  完成评审
                </button>
                <text v-if="task.status === 'completed'" class="status-text completed">
                  ✓ 已完成
                </text>
                <text v-if="task.status === 'cancelled'" class="status-text cancelled">
                  ✗ 已取消
                </text>
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
              <text class="day-title">{{ timeConfig[dayKey]?.displayDate || dayKey }}</text>
            </view>
            
            <!-- 上午时间段（如果存在） -->
            <view v-if="timeConfig[dayKey]?.morning" class="time-period">
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
            <view v-if="timeConfig[dayKey]?.afternoon" class="time-period">
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
        <button 
          class="modify-btn" 
          :class="{ loading: saveLoading }"
          @click="toggleTimeSelection"
          :disabled="saveLoading"
        >
          <text v-if="!saveLoading">{{ showTimeSelection ? 'Confirm' : 'Modify' }}</text>
          <text v-else>保存中...</text>
        </button>

        <!-- 时间选择区域（当点击Modify时显示，可编辑） -->
        <view v-if="showTimeSelection" class="time-selection-area">
          <!-- 动态渲染所有日期 -->
          <view v-for="dayKey in dateKeys" :key="dayKey" class="day-section">
            <view class="day-header">
              <text class="day-title">{{ timeConfig[dayKey]?.displayDate || dayKey }}</text>
            </view>
            
            <!-- 上午时间段（如果存在） -->
            <view v-if="timeConfig[dayKey]?.morning" class="time-period">
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
            <view v-if="timeConfig[dayKey]?.afternoon" class="time-period">
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
import { timeSelectionAPI, reviewAPI, notificationAPI } from '@/pages/teacher/teacher_API.js'

// 响应式数据
const scheduleData = ref([])
const hasNewNotification = ref(false)
const saveLoading = ref(false)

// 时间相关数据
const currentTime = ref(new Date())
const deadlineInfo = ref({
  deadline: null,
  isDeadlinePassed: false,
  remainingTime: null,
  formattedDeadline: '',
  countdownText: ''
})
const selectedSlots = ref([])
const showTimeSelection = ref(false)
const timeConfig = ref({})

let timer = null
let notificationTimer = null

// 计算属性：获取日期键数组
const dateKeys = computed(() => {
  return Object.keys(timeConfig.value).filter(key => key.startsWith('day'))
})

// 计算总时间段数
const totalSlots = computed(() => {
  return timeConfig.value.totalSlots || 0
})

// 计算属性
const isDeadlinePassed = computed(() => {
  return deadlineInfo.value.isDeadlinePassed
})

const formatDeadline = computed(() => {
  return deadlineInfo.value.formattedDeadline
})

const countdown = computed(() => {
  return deadlineInfo.value.countdownText
})

// 获取指定日期和时间段的时间槽
const getTimeSlotsForDay = (dayKey, period) => {
  const dayData = timeConfig.value[dayKey]
  if (!dayData || !dayData[period]) return []
  
  // 生成时间槽（这里需要根据实际的时间配置生成）
  const { startTime, endTime, slotDuration = 45, breakTime = 15 } = dayData[period]
  const slots = []
  
  // 简单的时间槽生成逻辑
  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)
  let current = new Date(start)
  let id = 1
  
  while (current < end) {
    const slotEnd = new Date(current.getTime() + slotDuration * 60000)
    if (slotEnd <= end) {
      slots.push({
        id: id++,
        time: `${current.toTimeString().slice(0,5)}-${slotEnd.toTimeString().slice(0,5)}`,
        startTime: current.toTimeString().slice(0,5),
        endTime: slotEnd.toTimeString().slice(0,5)
      })
      current = new Date(slotEnd.getTime() + breakTime * 60000)
    } else {
      break
    }
  }
  
  return slots
}

// 初始化选中时间段（默认全选）
const initializeSelectedSlots = () => {
  const allSlots = []
  
  dateKeys.value.forEach(dayKey => {
    const day = timeConfig.value[dayKey]
    if (!day) return
    
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

// 加载时间配置
const loadTimeConfig = async () => {
  try {
    const response = await timeSelectionAPI.getTimeConfig()
    if (response.code === 200) {
      timeConfig.value = response.data.timeConfig || {}
      // 如果没有保存的选择，则初始化为全选
      if (selectedSlots.value.length === 0) {
        initializeSelectedSlots()
      }
    }
  } catch (error) {
    console.error('加载时间配置失败:', error)
    uni.showToast({
      title: '加载时间配置失败',
      icon: 'error'
    })
  }
}

// 加载用户时间选择
const loadUserTimeSelection = async () => {
  try {
    const response = await timeSelectionAPI.getUserTimeSelection()
    if (response.code === 200) {
      selectedSlots.value = response.data.selectedSlots || []
    }
  } catch (error) {
    console.error('加载用户时间选择失败:', error)
    // 如果加载失败，使用本地存储的数据
    loadSavedTimeSelection()
  }
}

// 加载本地存储的时间选择
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

// 加载截止时间信息
const loadDeadlineInfo = async () => {
  try {
    const response = await timeSelectionAPI.getDeadline()
    if (response.code === 200) {
      deadlineInfo.value = response.data
      // 更新当前时间
      currentTime.value = new Date(response.data.currentTime)
    }
  } catch (error) {
    console.error('加载截止时间失败:', error)
  }
}

// 加载评审任务
const loadReviewTasks = async () => {
  try {
    const response = await reviewAPI.getReviewTasks()
    if (response.code === 200) {
      scheduleData.value = response.data.scheduleData || []
    }
  } catch (error) {
    console.error('加载评审任务失败:', error)
    uni.showToast({
      title: '加载评审任务失败',
      icon: 'error'
    })
  }
}

// 切换时间选择显示
const toggleTimeSelection = async () => {
  if (showTimeSelection.value) {
    // 确认选择，保存到服务器
    await saveTimeSelection()
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
const saveTimeSelection = async () => {
  saveLoading.value = true
  try {
    // 保存到服务器
    const response = await timeSelectionAPI.saveTimeSelection(selectedSlots.value)
    if (response.code === 200) {
      // 同时保存到本地存储作为备份
      uni.setStorageSync('selectedTimeSlots', JSON.stringify(selectedSlots.value))
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('保存时间选择失败:', error)
    // 如果服务器保存失败，至少保存到本地
    try {
      uni.setStorageSync('selectedTimeSlots', JSON.stringify(selectedSlots.value))
      uni.showToast({
        title: '本地保存成功，请稍后重试同步',
        icon: 'none'
      })
    } catch (localError) {
      uni.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  } finally {
    saveLoading.value = false
  }
}

// 更新任务状态
const updateTaskStatus = async (taskId, status, notes = '') => {
  try {
    const response = await reviewAPI.updateTaskStatus(taskId, status, notes)
    if (response.code === 200) {
      // 更新本地数据
      scheduleData.value.forEach(daySchedule => {
        const task = daySchedule.tasks.find(t => t.id === taskId)
        if (task) {
          task.status = status
          if (notes) task.notes = notes
        }
      })
      
      uni.showToast({
        title: '状态更新成功',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('更新任务状态失败:', error)
    uni.showToast({
      title: '更新失败',
      icon: 'error'
    })
  }
}

// 检查新通知
const checkNewNotifications = async () => {
  try {
    const response = await notificationAPI.checkNewNotifications()
    if (response.code === 200) {
      hasNewNotification.value = response.data.hasNewNotification
    }
  } catch (error) {
    console.error('检查新通知失败:', error)
  }
}

// 页面初始化
const initializePage = async () => {
  console.log('评审日程页面初始化中...')
  
  // 并发加载所有必要数据
  await Promise.all([
    loadTimeConfig(),
    loadUserTimeSelection(),
    loadDeadlineInfo(),
    checkNewNotifications()
  ])
  
  // 如果截止时间已过，加载评审任务
  if (deadlineInfo.value.isDeadlinePassed) {
    await loadReviewTasks()
  }
  
  console.log('评审日程页面初始化完成')
}

onMounted(async () => {
  await initializePage()
  
  // 设置定时器
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
  
  // 定时检查新通知
  notificationTimer = setInterval(checkNewNotifications, 30000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (notificationTimer) {
    clearInterval(notificationTimer)
  }
})

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

.modify-btn.loading {
  opacity: 0.7;
  pointer-events: none;
}

.modify-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
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
  margin-bottom: 16rpx;
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

/* 任务状态操作 */
.task-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 16rpx;
}

.status-btn {
  height: 60rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  border: none;
  font-size: 24rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.status-btn.pending {
  background: linear-gradient(135deg, #34C759 0%, #28A745 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(52, 199, 89, 0.3);
}

.status-btn.complete {
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
}

.status-btn:active {
  transform: translateY(1rpx);
}

.status-text {
  font-size: 24rpx;
  font-weight: 600;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.status-text.completed {
  color: #34C759;
  background: rgba(52, 199, 89, 0.1);
}

.status-text.cancelled {
  color: #FF3B30;
  background: rgba(255, 59, 48, 0.1);
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