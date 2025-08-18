<template>
  <view class="admin-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">管理员控制台</text>
    </view>

    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="title">宁波诺丁汉大学 PhD管理系统</text>
    </view>

    <!-- 主要功能卡片 -->
    <view class="main-functions">
      <!-- 系统配置 -->
      <view class="function-card large-card config-card">
        <view class="card-header">
          <view class="title-with-icon">
            <view class="card-icon config-icon">
              <text class="icon-text">⚙️</text>
            </view>
            <text class="card-title">系统配置</text>
          </view>
        </view>
        <view class="card-content">
          <text class="card-desc">本次评审设置</text>
           <!-- 配置项详情 -->
           <view class="config-items">
             <view class="config-item schedule-item" @click="editSchedule">
               <text class="config-label">评审日程</text>
               <view class="schedule-preview">
                 <text class="schedule-count strong-black">{{scheduleList.length}}个日程</text>
                 <view class="schedule-summary-list" v-if="scheduleList.length > 0">
                   <view class="schedule-summary-row" v-for="item in scheduleList" :key="item.id">
                     <text class="summary-date">{{item.date}}：</text>
                     <text class="summary-time">{{item.morning}}</text>
                     <text v-if="item.afternoon" class="summary-time">、{{item.afternoon}}</text>
                   </view>
                 </view>
               </view>
             </view>

            <view class="config-item" @click="editConfigItem('workload')">
              <text class="config-label">评审工作量</text>
              <text class="config-value">{{workloadValue}}人/年</text>
            </view>

            <view class="config-item" @click="editConfigItem('duration')">
              <text class="config-label">单次评审时长</text>
              <text class="config-value">{{durationValue}}分钟</text>
            </view>

            <view class="config-item" @click="viewTeachers">
              <text class="config-label">本次参与老师</text>
              <text class="config-value">{{teacherCount}}人</text>
            </view>

            <view class="config-item" @click="viewParticipants">
              <text class="config-label">本次参与博士生</text>
              <text class="config-value">{{participantCount}}人</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 所有功能卡片统一网格布局 -->
      <view class="card-grid">
        <!-- 用户管理 -->
        <view class="function-card small-card user-card" @click="navigateTo('/pages/admin/dashboard/user-management')">
          <view class="small-card-header">
            <view class="card-icon user-icon">
              <text class="icon-text">👥</text>
            </view>
          </view>
          <text class="card-title">用户管理</text>
          <text class="card-desc">管理博士生和老师信息</text>
        </view>
        <!-- 研究方向管理 -->
        <view class="function-card small-card research-card" @click="navigateTo('/pages/admin/dashboard/researchArea-management')">
          <view class="small-card-header">
            <view class="card-icon research-icon">
              <text class="icon-text">🔬</text>
            </view>
          </view>
          <text class="card-title">研究方向管理</text>
          <text class="card-desc">管理研究方向和审核申请</text>
        </view>
        <!-- 审批中心 -->
        <view class="function-card small-card approval-card" @click="navigateTo('/pages/admin/dashboard/approval-center')">
          <view class="small-card-header">
            <view class="card-icon approval-icon">
              <text class="icon-text">📋</text>
            </view>
            <view class="badge" v-if="pendingApprovals > 0">
              <text class="badge-text">{{pendingApprovals}}</text>
            </view>
          </view>
          <text class="card-title">审批中心</text>
          <text class="card-desc">处理变更申请</text>
        </view>
        <!-- 通知发送 -->
        <view class="function-card small-card notification-card" @click="navigateTo('/pages/admin/dashboard/notification')">
          <view class="small-card-header">
            <view class="card-icon notification-icon">
              <text class="icon-text">📢</text>
            </view>
          </view>
          <text class="card-title">通知发送</text>
          <text class="card-desc">发送系统通知</text>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="bottom-navigation">
      <view class="nav-item active" @click="switchTab('overview')">
        <text class="nav-icon">📊</text>
        <text class="nav-text">系统概览</text>
      </view>
      <view class="nav-item" @click="switchTab('generation')">
        <text class="nav-icon">🎯</text>
        <text class="nav-text">方案生成</text>
      </view>
      <view class="nav-item" @click="switchTab('profile')">
        <text class="nav-icon">👤</text>
        <text class="nav-text">我的</text>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view class="edit-modal-overlay" v-if="showEditModal" @click="closeModal">
      <view class="edit-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{editConfig.title}}</text>
          <view class="close-btn" @click="closeModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <view class="modal-body">
          <!-- 日期选择器 -->
          <view v-if="editConfig.type === 'date'" class="form-section">
            <text class="field-label">{{editConfig.label}}</text>
            <uni-datetime-picker
              type="date"
              :value="editValue"
              @change="handleDateChange"
            />
          </view>

          <!-- 时间选择器 -->
          <view v-else-if="editConfig.type === 'time'" class="form-section">
            <text class="field-label">{{editConfig.label}}</text>
            <view class="time-range-picker">
              <view class="time-picker-item">
                <text class="time-label">开始时间</text>
                <uni-datetime-picker
                  type="time"
                  :value="startTime"
                  @change="(val) => { startTime = val; updateTimeValue() }"
                />
              </view>
              <text class="time-separator">至</text>
              <view class="time-picker-item">
                <text class="time-label">结束时间</text>
                <uni-datetime-picker
                  type="time"
                  :value="endTime"
                  @change="(val) => { endTime = val; updateTimeValue() }"
                />
              </view>
            </view>
          </view>

          <!-- 普通输入框 -->
          <view v-else class="form-section">
            <text class="field-label">{{editConfig.label}}</text>
            <view class="input-wrapper">
              <input 
                class="form-input" 
                :placeholder="editConfig.placeholder"
                v-model="editValue"
                :focus="inputFocus"
                @input="onInput"
              />
              <view class="input-suffix" v-if="editConfig.suffix">
                <text class="suffix-text">{{editConfig.suffix}}</text>
              </view>
            </view>
            <text class="field-hint" v-if="editConfig.hint && !editError">{{editConfig.hint}}</text>
            <text v-if="editError" style="color:#e53935;font-size:24rpx;margin-top:4rpx;">{{editError}}</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="button-row">
            <view class="btn btn-secondary" @click="closeModal">
              <text class="btn-text">取消</text>
            </view>
            <view class="btn btn-primary" @click="confirmEdit">
              <text class="btn-text">确认</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 日程编辑弹窗 -->
    <view class="edit-modal-overlay" v-if="showScheduleModal" @click="closeScheduleModal">
      <view class="edit-modal schedule-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">评审日程管理</text>
          <view class="close-btn" @click="closeScheduleModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <view class="modal-body">
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
                <view class="form-row">
                  <text class="field-label">上午时段</text>
                  <view class="time-range-picker">
                    <input class="form-input" v-model="newScheduleMorning" placeholder="如09:00-12:00" style="width:100%" />
                  </view>
                </view>
                <view class="form-row">
                  <text class="field-label">下午时段</text>
                  <view class="time-range-picker">
                    <input class="form-input" v-model="newScheduleAfternoon" placeholder="如14:00-17:00" style="width:100%" />
                  </view>
                </view>
                <view class="add-btn-wrapper">
                  <view class="btn btn-primary add-btn" @click="addSchedule">
                    <text class="btn-text">添加日程</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 现有日程列表 -->
          <view class="schedule-list-section">
            <text class="section-title">现有日程</text>
            <view class="schedule-list" v-if="scheduleList.length > 0">
              <view class="schedule-item" v-for="schedule in scheduleList" :key="schedule.id">
                <view class="schedule-info">
                  <text class="schedule-date">{{schedule.date}}</text>
                  <view class="schedule-times">
                    <text class="time-slot">上午: {{schedule.morning}}</text>
                    <text class="time-slot">下午: {{schedule.afternoon}}</text>
                  </view>
                </view>
                <view class="delete-btn" @click="deleteSchedule(schedule.id)">
                  <text class="delete-icon">🗑️</text>
                </view>
              </view>
            </view>
            <view class="empty-schedule" v-else>
              <text class="empty-text">暂无日程安排</text>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="button-row">
            <view class="btn btn-secondary" @click="closeScheduleModal">
              <text class="btn-text">完成</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>



<script setup>
import { ref, nextTick } from 'vue'

const activeTab = ref('overview')
const pendingApprovals = ref(3)

// 配置项数据
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
    afternoon: '14:00-17:00'
  }
])
const workloadValue = ref('8')
const durationValue = ref('45')
const teacherCount = ref(12)
const participantCount = ref(25)

// 编辑弹窗相关
const showEditModal = ref(false)
const showScheduleModal = ref(false)
const editValue = ref('')
const editConfig = ref({})
const currentEditType = ref('')
const inputFocus = ref(false)
const editError = ref('')

// 日程编辑相关
const editingSchedule = ref(null)
const newScheduleDate = ref('')
const newScheduleMorning = ref('09:00-12:00')
const newScheduleAfternoon = ref('14:00-17:00')

// 时间选择器相关
const startTime = ref('09:00')
const endTime = ref('12:00')

// 配置项定义
const configDefinitions = {
  workload: {
    title: '设置评审工作量',
    label: '工作量',
    placeholder: '请输入评审工作量',
    hint: '每年需要评审的学生人数',
    suffix: '人/年',
    type: 'input'
  },
  duration: {
    title: '设置单次评审时长',
    label: '评审时长',
    placeholder: '请输入评审时长',
    hint: '单次评审所需的时间',
    suffix: '分钟',
    type: 'input'
  }
}

const navigateTo = (path) => {
  uni.navigateTo({
    url: path
  })
}

const switchTab = (tab) => {
  activeTab.value = tab
  switch(tab) {
    case 'overview':
      break
    case 'generation':
      uni.navigateTo({
        url: '/pages/admin/schedule/schedule-generation'
      })
      break
    case 'profile':
      uni.navigateTo({
        url: '/pages/admin/profile'
      })
      break
  }
}

// 日期格式校验函数
function validateDateFormat(dateStr) {
  // 格式必须为YYYY/MM/DD
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) return '格式应为YYYY/MM/DD';
  const [year, month, day] = dateStr.split('/').map(Number)
  if (month < 1 || month > 12) return '月份应为01-12';
  const daysInMonth = [31, (year%4===0&&year%100!==0)||year%400===0?29:28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (day < 1 || day > daysInMonth[month-1]) return `该月应为1-${daysInMonth[month-1]}日`;
  return ''
}

// 时间段格式校验函数
function validateTimeRangeFormat(timeStr) {
  // 格式必须为HH:MM-HH:MM
  if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(timeStr)) return '格式应为HH:MM-HH:MM';
  const [start, end] = timeStr.split('-');
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (sh < 0 || sh > 23 || eh < 0 || eh > 23) return '小时应为00-23';
  if (sm < 0 || sm > 59 || em < 0 || em > 59) return '分钟应为00-59';
  if (sh > eh || (sh === eh && sm >= em)) return '开始时间需早于结束时间';
  return '';
}

// 编辑配置项
const editConfigItem = (type) => {
  currentEditType.value = type
  editConfig.value = configDefinitions[type]
  // 动态获取最新值
  switch(type) {
    case 'workload':
      editValue.value = workloadValue.value
      break
    case 'duration':
      editValue.value = durationValue.value
      break
    default:
      editValue.value = ''
  }
  // 时间类型的初始化逻辑保持
  if (configDefinitions[type].type === 'time' && editValue.value.includes('-')) {
    const times = editValue.value.split('-')
    startTime.value = times[0]
    endTime.value = times[1]
  } else if (configDefinitions[type].type === 'time') {
    startTime.value = '09:00'
    endTime.value = '12:00'
  }
  
  // 日期类型的初始化
  if (configDefinitions[type].type === 'date') {
    // 日期选择器会自动处理
  }
  showEditModal.value = true
  if (configDefinitions[type].type === 'input') {
    nextTick(() => {
      inputFocus.value = true
    })
  }
  editError.value = ''
}

// 处理日期选择
const handleDateChange = (date) => {
  editValue.value = date
}

// 更新时间值
const updateTimeValue = () => {
  if (startTime.value && endTime.value) {
    editValue.value = `${startTime.value}-${endTime.value}`
  }
}

// 关闭弹窗
const closeModal = () => {
  showEditModal.value = false
  inputFocus.value = false
  setTimeout(() => {
    editValue.value = ''
    editConfig.value = {}
    currentEditType.value = ''
    startTime.value = '09:00'
    endTime.value = '12:00'
  }, 300)
}

// 确认编辑
const confirmEdit = () => {
  if (!editValue.value || !editValue.value.toString().trim()) {
    uni.showToast({
      title: '请完成必填项',
      icon: 'none'
    })
    return
  }
  // 日期校验
  if (currentEditType.value === 'endDate' && editError.value) {
    uni.showToast({
      title: '请填写正确的日期',
      icon: 'none'
    })
    return
  }
  // 时段校验
  if ((currentEditType.value === 'morningTime' || currentEditType.value === 'afternoonTime') && editError.value) {
    uni.showToast({
      title: '请填写正确的时段',
      icon: 'none'
    })
    return
  }
  
  // 根据编辑类型更新对应的值
  switch(currentEditType.value) {
    case 'workload':
      workloadValue.value = editValue.value.trim()
      break
    case 'duration':
      durationValue.value = editValue.value.trim()
      break
  }
  
  uni.showToast({
    title: '设置成功',
    icon: 'success'
  })
  
  closeModal()
}

// 查看参与人员
const viewParticipants = () => {
  uni.navigateTo({
    url: '/pages/admin/dashboard/phd-list'
  })
}

// 查看参与老师
const viewTeachers = () => {
  uni.navigateTo({
    url: '/pages/admin/dashboard/teacher-list'
  })
}

// 输入处理
const onInput = (e) => {
  editValue.value = e.detail.value
  // 针对日期输入做校验
  if (currentEditType.value === 'endDate') {
    editError.value = validateDateFormat(editValue.value)
  } else if (currentEditType.value === 'morningTime' || currentEditType.value === 'afternoonTime') {
    editError.value = validateTimeRangeFormat(editValue.value)
  } else {
    editError.value = ''
  }
}

// 日程相关函数
const editSchedule = () => {
  showScheduleModal.value = true
}

const getScheduleSummary = () => {
  if (scheduleList.value.length === 0) return '暂无日程'
  const firstDate = scheduleList.value[0].date
  const lastDate = scheduleList.value[scheduleList.value.length - 1].date
  if (firstDate === lastDate) {
    return `${firstDate}`
  }
  return `${firstDate} - ${lastDate}`
}

// 在script中增强addSchedule函数，校验时间段格式
const addSchedule = () => {
  if (!newScheduleDate.value) {
    uni.showToast({
      title: '请选择日期',
      icon: 'none'
    })
    return
  }
  // 校验上午时段
  const morningErr = validateTimeRangeFormat(newScheduleMorning.value)
  if (morningErr) {
    uni.showToast({
      title: '上午时段不规范：' + morningErr,
      icon: 'none'
    })
    return
  }
  // 校验下午时段
  const afternoonErr = validateTimeRangeFormat(newScheduleAfternoon.value)
  if (afternoonErr) {
    uni.showToast({
      title: '下午时段不规范：' + afternoonErr,
      icon: 'none'
    })
    return
  }
  const newSchedule = {
    id: Date.now(),
    date: newScheduleDate.value,
    morning: newScheduleMorning.value,
    afternoon: newScheduleAfternoon.value
  }
  scheduleList.value.push(newSchedule)
  // 重置表单
  newScheduleDate.value = ''
  newScheduleMorning.value = '09:00-12:00'
  newScheduleAfternoon.value = '14:00-17:00'
  uni.showToast({
    title: '添加成功',
    icon: 'success'
  })
}

const deleteSchedule = (id) => {
  scheduleList.value = scheduleList.value.filter(item => item.id !== id)
  uni.showToast({
    title: '删除成功',
    icon: 'success'
  })
}

const closeScheduleModal = () => {
  showScheduleModal.value = false
}
</script>



<style scoped>
.time-range-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time-picker-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.time-separator {
  margin: 0 10px;
  color: #666;
}

/* 调整uni-datetime-picker样式 */
:deep(.uni-date-editor--time) {
  width: 100%;
}

:deep(.uni-date__x-input) {
  height: 40px;
  line-height: 40px;
  padding: 0 10px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
}
</style>

<style scoped>
/* 保持原有样式不变 */
.admin-container {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.nav-bar {
  height: 88rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid #e5e5e5;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.5rpx;
}

.header {
  text-align: center;
  margin: 40rpx 0 60rpx 0;
  padding: 0 40rpx;
}

.title {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
}

.main-functions {
  flex: 1;
  padding: 0 30rpx 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.function-card {
  background: white;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
}

.function-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
}

.large-card {
  min-height: 280rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.card-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-icon {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.config-icon {
  background: linear-gradient(135deg, #f59e0b, #f97316);
}

.approval-icon {
  background: linear-gradient(135deg, #06b6d4, #0ea5e9);
}

.notification-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.icon-text {
  font-size: 28rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.action-button {
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.action-icon {
  color: white;
  font-size: 24rpx;
  font-weight: 600;
}

.card-content {
  margin-top: 24rpx;
}

.card-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
  padding-top: 5px;
  margin-bottom: 24rpx;
}

/* 统计数据样式 */
.stats-container {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.stats-row:last-child {
  margin-bottom: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-number {
  font-size: 32rpx;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 2rpx;
}

/* 配置项样式 */
.config-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 16rpx;
}

/* 日程项占两列 */
.config-item.schedule-item {
  grid-column: 1 / -1;
}

.config-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
}

.config-item.clickable {
  cursor: pointer;
}

.config-item.clickable:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.config-label {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.config-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
}

/* 日程相关样式 */
.config-item.schedule-item {
  cursor: pointer;
}

.config-item.schedule-item:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.schedule-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.schedule-count {
  font-size: 24rpx;
  font-weight: 600;
  color: #4f46e5;
}
.strong-black {
  color: #1a1a1a;
  font-weight: bold;
  font-size: 28rpx;
}
.schedule-summary-list {
  width: 100%;
  margin-top: 8rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  align-items: flex-start;
}
.schedule-summary-row {
  display: flex;
  align-items: baseline;
  font-size: 22rpx;
}
.summary-date {
  color: #1a1a1a;
  font-weight: 600;
  margin-right: 8rpx;
}
.summary-time {
  color: #888;
  font-weight: 400;
  margin-right: 8rpx;
}

/* 日程编辑弹窗样式 */
.schedule-modal {
  max-width: 720rpx;
  max-height: 80vh;
}

.add-schedule-section {
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.add-schedule-card {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 32rpx 24rpx 24rpx 24rpx;
  margin-top: 10rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
  border: 1rpx solid #e9ecef;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.add-btn-wrapper {
  margin-top: 16rpx;
}

.add-btn {
  width: 100%;
}

.schedule-list-section {
  margin-top: 24rpx;
}

.schedule-list {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  max-height: 300rpx;
  overflow-y: auto;
}

.schedule-list .schedule-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1rpx solid #e9ecef;
}

.schedule-info {
  flex: 1;
}

.schedule-date {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.schedule-times {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.time-slot {
  font-size: 22rpx;
  color: #666;
}

.delete-btn {
  width: 48rpx;
  height: 48rpx;
  background: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:active {
  background: #fecaca;
  transform: scale(0.95);
}

.delete-icon {
  font-size: 20rpx;
}

.empty-schedule {
  text-align: center;
  padding: 40rpx 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx dashed #dee2e6;
}

.empty-text {
  font-size: 24rpx;
  color: #999;
}

/* 小卡片样式 */
.small-cards-row {
  display: flex;
  gap: 20rpx;
}

.small-card {
  flex: 1;
  min-height: 160rpx;
  display: flex;
  flex-direction: column;
  position: relative;
}

.small-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.small-card .card-icon {
  width: 48rpx;
  height: 48rpx;
}

.badge {
  background: #ef4444;
  color: white;
  border-radius: 12rpx;
  padding: 4rpx 8rpx;
  font-size: 20rpx;
  line-height: 1;
}

.badge-text {
  font-size: 18rpx;
  font-weight: 600;
}

.small-card .card-title {
  font-size: 28rpx;
  margin-bottom: 8rpx;
}

.small-card .card-desc {
  font-size: 22rpx;
  margin-bottom: 0;
}

/* 底部导航栏 */
.bottom-navigation {
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0 32rpx 0;
  border-top: 1rpx solid #e5e5e5;
  position: sticky;
  bottom: 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 24rpx;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  min-width: 120rpx;
}

.nav-item.active {
  background: #f3f4f6;
}

.nav-icon {
  font-size: 24rpx;
  margin-bottom: 8rpx;
}

.nav-text {
  font-size: 22rpx;
  color: #666666;
}

.nav-item.active .nav-text {
  color: #4f46e5;
  font-weight: 600;
}

/* 优化后的编辑弹窗样式 - 干净简洁风格 */
.edit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 40rpx;
  animation: fadeIn 0.25s ease-out;
}

.edit-modal {
  background: #ffffff;
  border-radius: 20rpx;
  width: 100%;
  max-width: 640rpx;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 24rpx 64rpx rgba(0, 0, 0, 0.15);
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
  background: #ffffff;
  padding: 32rpx 32rpx 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  width: 56rpx;
  height: 56rpx;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:active {
  background: #e9ecef;
  transform: scale(0.95);
}

.close-icon {
  font-size: 28rpx;
  color: #666;
  font-weight: 400;
}

.modal-body {
  padding: 32rpx;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.field-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

/* 日期选择器样式 */
.date-picker-wrapper {
  width: 100%;
}

.date-display {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 24rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  cursor: pointer;
}

.date-display:active {
  background: #e9ecef;
  border-color: #dee2e6;
}

.date-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
}

.date-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.arrow-icon {
  font-size: 32rpx;
  color: #999;
  font-weight: 300;
}

/* 时间选择器样式 */
.time-picker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.time-section {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.time-label {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}

.time-display {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  cursor: pointer;
}

.time-display:active {
  background: #e9ecef;
  border-color: #dee2e6;
}

.time-icon {
  font-size: 24rpx;
  margin-right: 12rpx;
}

.time-text {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.time-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8rpx 0;
}

.divider-text {
  font-size: 24rpx;
  color: #999;
  background: #f8f9fa;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

/* 输入框样式 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  height: 96rpx;
  background: #fff;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  transition: all 0.3s ease;
}

.form-input:focus {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 6rpx rgba(79, 70, 229, 0.1);
}

.input-suffix {
  position: absolute;
  right: 24rpx;
  background: #e9ecef;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.suffix-text {
  font-size: 24rpx;
  color: #666;
}

.field-hint {
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
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
  background: #4f46e5;
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(79, 70, 229, 0.25);
}

.btn-primary:active {
  background: #4338ca;
  transform: translateY(1rpx);
  box-shadow: 0 2rpx 8rpx rgba(79, 70, 229, 0.3);
}

.btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

.btn-secondary .btn-text {
  color: #666;
}

.row-cards {
  display: flex;
  gap: 20rpx;
  margin: 30rpx 0 0 0;
}
.row-cards .function-card {
  flex: 1;
  min-height: 140rpx;
  max-width: none;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}
.room-card {
  min-width: 0;
  margin-bottom: 0;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32rpx 24rpx;
  margin: 30rpx 0 0 0;
}
.card-grid .function-card {
  min-height: 140rpx;
  box-sizing: border-box;
}
</style>