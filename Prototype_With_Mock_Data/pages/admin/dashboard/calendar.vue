<template>
  <view class="calendar-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">评审日程管理</text>
      <view class="nav-right"></view>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 日程统计卡片 -->
      <view class="stats-card">
        <view class="stats-header">
          <view class="stats-icon">
            <text class="icon-text">📅</text>
          </view>
          <view class="stats-info">
            <text class="stats-title">评审日程概览</text>
            <text class="stats-desc">管理所有评审时间安排</text>
          </view>
        </view>
        <view class="stats-content">
          <view class="stat-item">
            <text class="stat-number">{{scheduleList.length}}</text>
            <text class="stat-label">总日程数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-number">{{getTotalTimeSlots()}}</text>
            <text class="stat-label">总时段数</text>
          </view>
        </view>
      </view>

      <!-- 添加新日程 -->
      <view class="add-schedule-section">
        <text class="section-title">添加新日程</text>
        <view class="add-schedule-card">
          <view class="schedule-form">
            <view class="form-row">
              <text class="field-label">日期</text>
              <uni-datetime-picker
                type="date"
                :value="newScheduleDate"
                @change="(val) => { newScheduleDate = val }"
              />
            </view>
            
            <!-- 上午时段 -->
            <view class="form-row">
              <view class="field-header">
                <text class="field-label">上午时段</text>
                <view class="checkbox-wrapper" @click="toggleMorningEnabled">
                  <view class="checkbox" :class="{ checked: morningEnabled }">
                    <text class="check-icon" v-if="morningEnabled">✓</text>
                  </view>
                </view>
              </view>
              <view class="time-range-picker" :class="{ disabled: !morningEnabled }">
                <input 
                  class="form-input" 
                  :class="{ disabled: !morningEnabled }"
                  v-model="newScheduleMorning" 
                  :disabled="!morningEnabled"
                />
                <text class="disabled-hint" v-if="!morningEnabled">不选择上午时段</text>
              </view>
            </view>
            
            <!-- 下午时段 -->
            <view class="form-row">
              <view class="field-header">
                <text class="field-label">下午时段</text>
                <view class="checkbox-wrapper" @click="toggleAfternoonEnabled">
                  <view class="checkbox" :class="{ checked: afternoonEnabled }">
                    <text class="check-icon" v-if="afternoonEnabled">✓</text>
                  </view>
                </view>
              </view>
              <view class="time-range-picker" :class="{ disabled: !afternoonEnabled }">
                <input 
                  class="form-input" 
                  :class="{ disabled: !afternoonEnabled }"
                  v-model="newScheduleAfternoon" 
                  :disabled="!afternoonEnabled"
                />
                <text class="disabled-hint" v-if="!afternoonEnabled">不选择下午时段</text>
              </view>
            </view>
            
            <view class="add-btn-wrapper">
              <view class="btn btn-primary add-btn" @click="addSchedule">
                <text class="btn-text">+ 添加日程</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 现有日程列表 -->
      <view class="schedule-list-section">
        <view class="section-header">
          <text class="section-title">现有日程</text>
        </view>
        
        <view class="schedule-list" v-if="scheduleList.length > 0">
          <view class="schedule-item" v-for="schedule in scheduleList" :key="schedule.id">
            <view class="schedule-main">
              <view class="schedule-date-section">
                <view class="date-info">
                  <text class="schedule-date">{{formatDate(schedule.date)}}</text>
                  <text class="date-weekday">{{getWeekday(schedule.date)}}</text>
                </view>
              </view>
              
              <view class="schedule-times" :class="{ 'single-slot': (schedule.morning && !schedule.afternoon) || (!schedule.morning && schedule.afternoon) }">
                <view class="time-slot morning-slot" v-if="schedule.morning">
                  <view class="time-indicator morning"></view>
                  <text class="time-label">上午</text>
                  <text class="time-value">{{schedule.morning}}</text>
                </view>
                <view class="time-slot afternoon-slot" v-if="schedule.afternoon">
                  <view class="time-indicator afternoon"></view>
                  <text class="time-label">下午</text>
                  <text class="time-value">{{schedule.afternoon}}</text>
                </view>
                <view class="no-time-slot" v-if="!schedule.morning && !schedule.afternoon">
                  <text class="no-time-text">无可用时段</text>
                </view>
              </view>
            </view>
            
            <view class="schedule-actions">
              <view class="delete-btn" @click="confirmDelete(schedule)">
                <text class="delete-icon">🗑️</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="empty-schedule" v-else>
          <view class="empty-icon">
            <text class="icon-text">📭</text>
          </view>
          <text class="empty-title">暂无日程安排</text>
          <text class="empty-desc">点击上方"添加日程"\n创建新的评审时间安排</text>
        </view>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <view class="modal-overlay" v-if="showDeleteModal" @click="cancelDelete">
      <view class="delete-modal" @click.stop>
        <view class="modal-header">
          <view class="warning-icon">
            <text class="icon-text">⚠️</text>
          </view>
          <text class="modal-title">删除确认</text>
        </view>
        <view class="modal-body">
          <text class="modal-text">确定要删除以下日程吗？</text>
          <view class="delete-info" v-if="deleteTarget">
            <text class="delete-date">{{formatDate(deleteTarget.date)}}</text>
            <view class="delete-times">
              <text class="delete-time" v-if="deleteTarget.morning">上午: {{deleteTarget.morning}}</text>
              <text class="delete-time" v-if="deleteTarget.afternoon">下午: {{deleteTarget.afternoon}}</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="button-row">
            <view class="btn btn-secondary" @click="cancelDelete">
              <text class="btn-text">取消</text>
            </view>
            <view class="btn btn-danger" @click="executeDelete">
              <text class="btn-text">确认删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 时段冲突弹窗 -->
    <view class="modal-overlay" v-if="showConflictModal" @click="cancelConflict">
      <view class="conflict-modal" @click.stop>
        <view class="modal-header">
          <view class="warning-icon">
            <text class="icon-text">⚠️</text>
          </view>
          <text class="modal-title">时段冲突</text>
        </view>
        <view class="modal-body">
          <text class="modal-text">该日期已存在以下时段：</text>
          <view class="conflict-info" v-if="conflictInfo">
            <text class="conflict-date">{{formatDate(conflictInfo.date)}}</text>
            <view class="conflict-times">
              <text class="conflict-time" v-if="conflictInfo.morning">上午: {{conflictInfo.morning}}</text>
              <text class="conflict-time" v-if="conflictInfo.afternoon">下午: {{conflictInfo.afternoon}}</text>
            </view>
          </view>
          <text class="modal-text">您要添加的时段：</text>
          <view class="new-info">
            <view class="new-times">
              <text class="new-time" v-if="morningEnabled && newScheduleMorning">上午: {{newScheduleMorning}}</text>
              <text class="new-time" v-if="afternoonEnabled && newScheduleAfternoon">下午: {{newScheduleAfternoon}}</text>
            </view>
          </view>
          <text class="modal-text">请选择操作：</text>
        </view>
        <view class="modal-footer">
          <view class="button-row">
            <view class="btn btn-secondary" @click="cancelConflict">
              <text class="btn-text">取消</text>
            </view>
            <view class="btn btn-danger" @click="replaceSchedule">
              <text class="btn-text">替换现有</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>



<script setup>
import { ref } from 'vue'

// 日程数据
const scheduleList = ref([
  {
    id: 1,
    date: '2025-06-27',
    morning: '09:00-12:00',
    afternoon: '14:00-17:00'
  },
  {
    id: 2,
    date: '2025-06-28',
    morning: '09:00-12:00',
    afternoon: null  // 示例：没有下午时段
  },
  {
    id: 3,
    date: '2025-06-29',
    morning: null,  // 示例：没有上午时段
    afternoon: '14:00-17:00'
  }
])

// 新日程表单数据
const newScheduleDate = ref('')
const newScheduleMorning = ref('09:00-12:00')
const newScheduleAfternoon = ref('14:00-17:00')

// 时段启用状态
const morningEnabled = ref(true)
const afternoonEnabled = ref(true)

// 删除确认相关
const showDeleteModal = ref(false)
const deleteTarget = ref(null)

// 冲突处理相关
const showConflictModal = ref(false)
const conflictInfo = ref(null)

// 返回仪表盘
const goBack = () => {
  // 修复返回路径
  uni.navigateTo({
    url: '/pages/admin/dashboard/dashboard'
  })
}

// 切换上午时段启用状态
const toggleMorningEnabled = () => {
  morningEnabled.value = !morningEnabled.value
  if (!morningEnabled.value) {
    newScheduleMorning.value = ''
  } else {
    newScheduleMorning.value = '09:00-12:00'
  }
}

// 切换下午时段启用状态
const toggleAfternoonEnabled = () => {
  afternoonEnabled.value = !afternoonEnabled.value
  if (!afternoonEnabled.value) {
    newScheduleAfternoon.value = ''
  } else {
    newScheduleAfternoon.value = '14:00-17:00'
  }
}

// 时间段格式校验函数
function validateTimeRangeFormat(timeStr) {
  if (!timeStr) return '' // 允许空值（表示不启用该时段）
  if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(timeStr)) return '格式应为HH:MM-HH:MM';
  const [start, end] = timeStr.split('-');
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (sh < 0 || sh > 23 || eh < 0 || eh > 23) return '小时应为00-23';
  if (sm < 0 || sm > 59 || em < 0 || em > 59) return '分钟应为00-59';
  if (sh > eh || (sh === eh && sm >= em)) return '开始时间需早于结束时间';
  return '';
}

// 检查时段冲突
const checkTimeSlotConflict = (date, wantMorning, wantAfternoon) => {
  const existingSchedule = scheduleList.value.find(item => item.date === date)
  if (!existingSchedule) {
    return { hasConflict: false }
  }
  
  const conflicts = []
  
  // 检查上午时段冲突
  if (wantMorning && existingSchedule.morning) {
    conflicts.push('morning')
  }
  
  // 检查下午时段冲突
  if (wantAfternoon && existingSchedule.afternoon) {
    conflicts.push('afternoon')
  }
  
  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    existingSchedule
  }
}

// 添加新日程
const addSchedule = () => {
  if (!newScheduleDate.value) {
    uni.showToast({
      title: '请选择日期',
      icon: 'none'
    })
    return
  }
  
  // 检查是否至少启用一个时段
  if (!morningEnabled.value && !afternoonEnabled.value) {
    uni.showToast({
      title: '请至少启用一个时段',
      icon: 'none'
    })
    return
  }
  
  // 校验上午时段（如果启用）
  if (morningEnabled.value) {
    const morningErr = validateTimeRangeFormat(newScheduleMorning.value)
    if (morningErr) {
      uni.showToast({
        title: '上午时段不规范：' + morningErr,
        icon: 'none'
      })
      return
    }
  }
  
  // 校验下午时段（如果启用）
  if (afternoonEnabled.value) {
    const afternoonErr = validateTimeRangeFormat(newScheduleAfternoon.value)
    if (afternoonErr) {
      uni.showToast({
        title: '下午时段不规范：' + afternoonErr,
        icon: 'none'
      })
      return
    }
  }
  
  // 检查时段冲突
  const conflictResult = checkTimeSlotConflict(
    newScheduleDate.value,
    morningEnabled.value,
    afternoonEnabled.value
  )
  
  if (conflictResult.hasConflict) {
    // 显示冲突处理弹窗
    conflictInfo.value = conflictResult.existingSchedule
    showConflictModal.value = true
    return
  }
  
  // 没有冲突，直接添加
  executeAddSchedule()
}

// 执行添加日程（无冲突情况）
const executeAddSchedule = () => {
  const existingSchedule = scheduleList.value.find(item => item.date === newScheduleDate.value)
  
  if (existingSchedule) {
    // 合并到现有日程（补充缺失的时段）
    if (morningEnabled.value && !existingSchedule.morning) {
      existingSchedule.morning = newScheduleMorning.value
    }
    if (afternoonEnabled.value && !existingSchedule.afternoon) {
      existingSchedule.afternoon = newScheduleAfternoon.value
    }
  } else {
    // 创建新日程
    const newSchedule = {
      id: Date.now(),
      date: newScheduleDate.value,
      morning: morningEnabled.value ? newScheduleMorning.value : null,
      afternoon: afternoonEnabled.value ? newScheduleAfternoon.value : null
    }
    
    scheduleList.value.push(newSchedule)
    scheduleList.value.sort((a, b) => new Date(a.date) - new Date(b.date))
  }
  
  // 重置表单
  resetForm()
  
  uni.showToast({
    title: '添加成功',
    icon: 'success'
  })
}

// 重置表单
const resetForm = () => {
  newScheduleDate.value = ''
  newScheduleMorning.value = '09:00-12:00'
  newScheduleAfternoon.value = '14:00-17:00'
  morningEnabled.value = true
  afternoonEnabled.value = true
}

// 取消冲突处理
const cancelConflict = () => {
  showConflictModal.value = false
  conflictInfo.value = null
}

// 替换现有日程
const replaceSchedule = () => {
  const existingSchedule = scheduleList.value.find(item => item.date === newScheduleDate.value)
  
  if (existingSchedule) {
    // 替换整个日程
    existingSchedule.morning = morningEnabled.value ? newScheduleMorning.value : null
    existingSchedule.afternoon = afternoonEnabled.value ? newScheduleAfternoon.value : null
    
    uni.showToast({
      title: '日程替换成功',
      icon: 'success'
    })
  }
  
  resetForm()
  cancelConflict()
}

// 确认删除
const confirmDelete = (schedule) => {
  deleteTarget.value = schedule
  showDeleteModal.value = true
}

// 取消删除
const cancelDelete = () => {
  showDeleteModal.value = false
  deleteTarget.value = null
}

// 执行删除
const executeDelete = () => {
  if (deleteTarget.value) {
    scheduleList.value = scheduleList.value.filter(item => item.id !== deleteTarget.value.id)
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    })
  }
  cancelDelete()
}

// 格式化日期显示
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}月${day}日`
}

// 获取星期几
const getWeekday = (dateStr) => {
  const date = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

// 获取总时段数
const getTotalTimeSlots = () => {
  return scheduleList.value.reduce((total, schedule) => {
    let count = 0
    if (schedule.morning) count++
    if (schedule.afternoon) count++
    return total + count
  }, 0)
}
</script>



<style scoped>
.calendar-container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.nav-bar {
  height: 88rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid #e5e5e5;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  cursor: pointer;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  transition: all 0.2s ease;
}

.nav-left:active {
  background: #f3f4f6;
}

.back-icon {
  font-size: 32rpx;
  color: #0ea5e9;
  font-weight: 600;
}

.back-text {
  font-size: 28rpx;
  color: #0ea5e9;
  font-weight: 500;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.5rpx;
}

.nav-right {
  width: 120rpx;
}

/* 页面内容 */
.page-content {
  flex: 1;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

/* 统计卡片 - 改为灰色调 */
.stats-card {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  color: white;
  box-shadow: 0 8rpx 32rpx rgba(107, 114, 128, 0.3);
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.stats-icon {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-info {
  flex: 1;
}

.stats-title {
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
  display: block;
}

.stats-desc {
  font-size: 24rpx;
  opacity: 0.9;
}

.stats-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-number {
  font-size: 48rpx;
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
}

/* 添加日程区域 */
.add-schedule-section {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24rpx;
}

.add-schedule-card {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 32rpx;
  border: 2rpx dashed #e9ecef;
}

.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

/* 复选框样式 */
.checkbox-wrapper {
  cursor: pointer;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid #d1d5db;
  border-radius: 8rpx;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox.checked {
  background: #00aa00;
  border-color: #00aa00;
}

.check-icon {
  font-size: 24rpx;
  color: white;
  font-weight: 700;
}

.time-range-picker {
  position: relative;
}

.time-range-picker.disabled {
  opacity: 0.6;
}

.form-input {
  height: 88rpx;
  background: white;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 6rpx rgba(14, 165, 233, 0.1);
}

.form-input.disabled {
  background: #f5f5f5;
  color: transparent;
  cursor: not-allowed;
}

.disabled-hint {
  position: absolute;
  top: 50%;
  left: 24rpx;
  transform: translateY(-50%);
  font-size: 26rpx;
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}

.add-btn-wrapper {
  margin-top: 16rpx;
}

.add-btn {
  width: 100%;
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  box-shadow: 0 8rpx 24rpx rgba(14, 165, 233, 0.3);
}

/* 日程列表区域 */
.schedule-list-section {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  flex: 1;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 24rpx;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.schedule-item {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2rpx solid #f0f0f0;
  transition: all 0.3s ease;
}

.schedule-item:hover {
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.schedule-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.schedule-date-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 120rpx;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.schedule-date {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.date-weekday {
  font-size: 22rpx;
  color: #666;
}

.schedule-times {
  flex: 1;
  display: flex;
  gap: 24rpx;
  align-items: center;
}

/* 当只有一个时段时，保持水平排列 */
.schedule-times.single-slot {
  flex-direction: column;
  align-items: flex-start;
}

/* 当有两个时段时，垂直排列 */
.schedule-times:not(.single-slot) {
  flex-direction: column;
  align-items: flex-start;
  gap: 12rpx;
}

.time-slot {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: white;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  border: 2rpx solid #f0f0f0;
}

.time-indicator {
  width: 8rpx;
  height: 32rpx;
  border-radius: 4rpx;
}

.time-indicator.morning {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.time-indicator.afternoon {
  background: linear-gradient(135deg, #06b6d4, #0ea5e9);
}

.time-label {
  font-size: 22rpx;
  color: #666;
  font-weight: 500;
  min-width: 32rpx;
}

.time-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
}

.no-time-slot {
  flex: 1;
  text-align: center;
  padding: 16rpx;
}

.no-time-text {
  font-size: 24rpx;
  color: #9ca3af;
  font-style: italic;
}

.schedule-actions {
  display: flex;
  gap: 16rpx;
}

.delete-btn {
  width: 56rpx;
  height: 56rpx;
  background: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2rpx solid #fecaca;
}

.delete-btn:active {
  background: #fecaca;
  transform: scale(0.95);
}

.delete-icon {
  font-size: 24rpx;
}

/* 空状态 */
.empty-schedule {
  text-align: center;
  padding: 80rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.empty-icon .icon-text {
  font-size: 48rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #666;
}

.empty-desc {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
  max-width: 400rpx;
}

/* 删除确认弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 40rpx;
  animation: fadeIn 0.3s ease-out;
}

.delete-modal, .conflict-modal {
  background: white;
  border-radius: 20rpx;
  width: 100%;
  max-width: 560rpx;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 24rpx 64rpx rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(40rpx) scale(0.95);
    opacity: 0;
  }
  to { 
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-header {
  padding: 40rpx 32rpx 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.warning-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.warning-icon .icon-text {
  font-size: 40rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-body {
  padding: 0 32rpx 32rpx 32rpx;
  text-align: center;
}

.modal-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 24rpx;
  display: block;
}

.delete-info, .conflict-info {
  background: #fef2f2;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 2rpx solid #fecaca;
  margin-bottom: 24rpx;
}

.new-info {
  background: #f0f9ff;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 2rpx solid #bae6fd;
  margin-bottom: 24rpx;
}

.delete-date, .conflict-date {
  font-size: 28rpx;
  font-weight: 700;
  color: #dc2626;
  margin-bottom: 12rpx;
  display: block;
}

.delete-times, .conflict-times, .new-times {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.delete-time, .conflict-time {
  font-size: 24rpx;
  color: #991b1b;
}

.new-time {
  font-size: 24rpx;
  color: #0369a1;
}

.modal-footer {
  padding: 24rpx 32rpx 32rpx 32rpx;
  background: #fafafa;
  border-top: 1rpx solid #f0f0f0;
}

.button-row {
  display: flex;
  gap: 16rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-secondary {
  background: #ffffff;
  border: 2rpx solid #e9ecef;
}

.btn-secondary:active {
  background: #f8f9fa;
  transform: translateY(1rpx);
}

.btn-primary {
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  color: white;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(14, 165, 233, 0.3);
}

.btn-primary:active {
  background: linear-gradient(135deg, #0284c7, #0891b2);
  transform: translateY(1rpx);
  box-shadow: 0 2rpx 8rpx rgba(14, 165, 233, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(239, 68, 68, 0.3);
}

.btn-danger:active {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(1rpx);
  box-shadow: 0 2rpx 8rpx rgba(239, 68, 68, 0.4);
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
}

.btn-secondary .btn-text {
  color: #666;
}

/* uni-datetime-picker 样式调整 */
:deep(.uni-date-editor--date) {
  width: 100%;
}

:deep(.uni-date__x-input) {
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 24rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: white;
  transition: all 0.3s ease;
}

:deep(.uni-date__x-input:focus) {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 6rpx rgba(14, 165, 233, 0.1);
}

.icon-text {
  display: inline-block;
}

/* 响应式设计 */
@media (max-width: 768rpx) {
  .page-content {
    padding: 24rpx 16rpx;
  }
  
  .stats-card {
    padding: 32rpx 24rpx;
  }
  
  .add-schedule-section, .schedule-list-section {
    padding: 24rpx;
  }
  
  .schedule-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 16rpx;
  }
  
  .schedule-date-section {
    min-width: auto;
  }
  
  .schedule-times {
    width: 100%;
    flex-direction: column;
    gap: 16rpx;
  }
  
  .time-slot {
    flex: none;
  }
  
  .button-row {
    flex-direction: column;
  }
  
  .btn {
    flex: none;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .calendar-container {
    background: #111827;
  }
  
  .nav-bar, .add-schedule-section, .schedule-list-section {
    background: #1f2937;
    border-color: #374151;
  }
  
  .nav-title, .section-title, .schedule-date, .field-label {
    color: #f9fafb;
  }
  
  .add-schedule-card, .schedule-item {
    background: #374151;
    border-color: #4b5563;
  }
  
  .form-input {
    background: #1f2937;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .form-input.disabled {
    background: #374151;
    color: #6b7280;
  }
  
  .checkbox {
    background: #374151;
    border-color: #4b5563;
  }
  
  .time-slot {
    background: #1f2937;
    border-color: #4b5563;
  }
  
  .time-value, .time-label {
    color: #f9fafb;
  }
  
  .date-weekday, .stats-desc, .empty-desc {
    color: #9ca3af;
  }
  
  .empty-icon {
    background: #374151;
  }
  
  .delete-modal, .conflict-modal {
    background: #1f2937;
  }
  
  .modal-title {
    color: #f9fafb;
  }
  
  .modal-text {
    color: #d1d5db;
  }
  
  .modal-footer {
    background: #374151;
    border-color: #4b5563;
  }
  
  .btn-secondary {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
}

/* 无障碍增强 */
.btn:focus, .checkbox:focus, .delete-btn:focus {
  outline: 3rpx solid #0ea5e9;
  outline-offset: 2rpx;
}

.form-input:focus {
  outline: none;
}

/* 打印样式 */
@media print {
  .nav-bar, .add-schedule-section, .schedule-actions, .modal-overlay {
    display: none !important;
  }
  
  .calendar-container {
    background: white;
  }
  
  .stats-card {
    background: #f8f9fa !important;
    color: #333 !important;
    box-shadow: none;
    border: 2rpx solid #e9ecef;
  }
  
  .schedule-item {
    border: 2rpx solid #e9ecef;
    break-inside: avoid;
  }
}

/* 加载动画 */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8rpx;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4rpx;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4rpx;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 选中状态样式 */
.schedule-item.selected {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 4rpx rgba(14, 165, 233, 0.1);
}

/* 过渡动画优化 */
.schedule-item {
  transform: translateZ(0);
}

.btn {
  transform: translateZ(0);
}

/* 性能优化 */
.icon-text,
.check-icon,
.delete-icon,
.back-icon {
  will-change: transform;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .btn-primary {
    background: #0066cc;
  }
  
  .btn-danger {
    background: #cc0000;
  }
  
  .stats-card {
    background: linear-gradient(135deg, #6b7280, #4b5563);
  }
  
  .checkbox.checked {
    background: #0066cc;
  }
}
</style>