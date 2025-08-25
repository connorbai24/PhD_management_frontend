<template>
  <view class="container">
	<!-- 顶部导航栏 -->
	<view class="nav-bar">
	  	<text class="nav-title">我的年度评审</text>
	</view>
	  
    <!-- 页面头部信息 -->
    <view class="page-header">
      <view class="header-top">
        <text class="page-title">PhD</text>
        <view class="user-info">
          <text class="welcome-text">欢迎，{{ studentInfo.name }}</text>
          <text class="student-id">{{ studentInfo.studentId }}</text>
        </view>
      </view>
      <view class="header-stats">
        <view class="stat-item">
          <text class="stat-number">{{ studentInfo.totalReviews }}</text>
          <text class="stat-label">历次评审</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-number">{{ studentInfo.currentYear }}</text>
          <text class="stat-label">在读年限</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-number">{{ studentInfo.researchArea }}</text>
          <text class="stat-label">研究方向</text>
        </view>
      </view>
    </view>

    <!-- 当前年审状态卡片 -->
    <view class="status-card">
      <view class="status-header">
        <text class="status-title">当前年审状态</text>
        <view class="status-badge" :class="currentReview.status">
          {{ getStatusText(currentReview.status) }}
        </view>
      </view>
      
      <view v-if="currentReview.scheduled" class="review-info">
        <!-- 优化后的日期时间显示 -->
        <view class="datetime-card">
          <view class="datetime-icon">📅</view>
          <view class="datetime-content">
            <text class="datetime-main">{{ currentReview.date }}</text>
            <text class="datetime-main">{{ currentReview.time }}</text>
          </view>
          <view class="countdown-info" v-if="countdownDays >= 0">
            <text class="countdown-number">{{ countdownDays }}</text>
            <text class="countdown-label">天后</text>
          </view>
        </view>
        
        <view class="info-row">
          <view class="info-label-with-icon">
            <text class="info-label">📍 地点</text>
          </view>
          <text class="info-value">{{ currentReview.location }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">👥 评审老师</text>
          <view class="assessors-list">
            <text 
              v-for="(assessor, index) in currentReview.assessors" 
              :key="index"
              class="info-value assessor-item"
            >
              {{ assessor }}
            </text>
          </view>
        </view>
      </view>
      
      <view v-else class="no-schedule">
        <view class="no-schedule-icon">⏳</view>
        <text class="no-schedule-text">暂无安排，请等待通知</text>
        <text class="no-schedule-sub">系统将自动为您分配合适的评审时间</text>
      </view>
    </view>

    <!-- 通知公告 -->
    <view class="notice-section">
      <view class="section-title">
        <text class="title-text">📢 通知公告</text>
        <text class="more-text" @click="viewAllNotices">查看全部</text>
      </view>
      <view class="notice-list">
        <view 
          v-for="notice in notices" 
          :key="notice.id" 
          class="notice-item"
          @click="viewNoticeDetail(notice)"
        >
          <view class="notice-header">
            <text class="notice-title">{{ notice.title }}</text>
            <text class="notice-time">{{ notice.time }}</text>
          </view>
          <text class="notice-content">{{ notice.content }}</text>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="bottom-nav">
      <view class="nav-item active">
        <text class="nav-icon">🏠</text>
        <text class="nav-label">首页</text>
      </view>
      <view class="nav-item" @click="switchTab('history')">
        <text class="nav-icon">📋</text>
        <text class="nav-label">历史</text>
      </view>
      <view class="nav-item" @click="switchTab('profile')">
        <text class="nav-icon">👤</text>
        <text class="nav-label">我的</text>
      </view>
    </view>

    <!-- 全部通知弹窗 -->
    <view v-if="showAllNotices" class="modal-overlay" @click="closeAllNotices">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">全部通知</text>
          <text class="modal-close" @click="closeAllNotices">✕</text>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <view 
            v-for="notice in allNotices" 
            :key="notice.id" 
            class="modal-notice-item"
            @click="viewNoticeDetail(notice)"
          >
            <view class="notice-header">
              <text class="notice-title">{{ notice.title }}</text>
              <text class="notice-time">{{ notice.time }}</text>
            </view>
            <text class="notice-content">{{ notice.content }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue'

const currentTab = ref('PhD')
const showAllNotices = ref(false)

// 学生信息
const studentInfo = ref({
  name: '张同学',
  studentId: '2021001001',
  totalReviews: 3,
  currentYear: '4年级',
  researchArea: '机器学习'
})

const currentReview = ref({
  status: 'scheduled', // 'scheduled', 'pending', 'completed'
  scheduled: true,
  date: '2099年6月22日',
  time: '14:00-14:50',
  location: 'A301',
  assessors: ['Prof. Wang Lei', 'Prof. Chen Yu']  // 改为数组形式
})

const notices = ref([
  {
    id: 1,
    title: '2025年春季年审安排通知',
    content: '请各位博士生及时查看个人年审安排，按时参加评审...',
    time: '2025-06-10'
  },
  {
    id: 2,
    title: '研究方向标签更新提醒',
    content: '请及时更新个人研究方向标签，以便系统更好地匹配评审老师...',
    time: '2025-06-08'
  }
])

// 全部通知数据
const allNotices = ref([
  {
    id: 1,
    title: '2025年春季年审安排通知',
    content: '请各位博士生及时查看个人年审安排，按时参加评审。评审将采用线下形式进行，请提前15分钟到达指定地点。',
    time: '2025-06-10'
  },
  {
    id: 2,
    title: '研究方向标签更新提醒',
    content: '请及时更新个人研究方向标签，以便系统更好地匹配评审老师。更新入口位于个人中心-基本信息页面。',
    time: '2025-06-08'
  },
  {
    id: 3,
    title: '年审材料提交截止时间提醒',
    content: '请在评审前一周完成年审材料的在线提交，包括年度总结报告、研究进展报告等必要材料。',
    time: '2025-06-05'
  },
  {
    id: 4,
    title: '评审系统维护通知',
    content: '系统将于本周三晚22:00-24:00进行维护升级，期间可能影响正常使用，请合理安排时间。',
    time: '2025-06-03'
  }
])

// 计算距离评审还有多少天 - 引用currentReview中的date属性
const countdownDays = computed(() => {
  if (!currentReview.value.scheduled || !currentReview.value.date) return -1
  
  const today = new Date()
  // 从currentReview.date中提取日期并转换为Date对象
  const dateStr = currentReview.value.date.replace(/年|月/g, '-').replace(/日/g, '')
  const reviewDate = new Date(dateStr)
  
  const diffTime = reviewDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const getStatusText = (status) => {
  const statusMap = {
    'scheduled': '已安排',
    'pending': '待安排',
    'completed': '已完成'
  }
  return statusMap[status] || '未知'
}

const switchTab = (tab) => {
  currentTab.value = tab
  
  switch(tab) {
    case 'PhD':
      break
    case 'history':
      uni.navigateTo({ 
        url: '/pages/PhD/history' 
      })
      break
    case 'profile':
      uni.navigateTo({ 
        url: '/pages/PhD/profile' 
      })
      break
  }
}

// 查看全部通知
const viewAllNotices = () => {
  showAllNotices.value = true
}

// 关闭全部通知弹窗
const closeAllNotices = () => {
  showAllNotices.value = false
}

const viewNoticeDetail = (notice) => {
  uni.showModal({
    title: notice.title,
    content: notice.content,
    showCancel: false
  })
}

onMounted(() => {
  console.log('PhD页面加载完成')
})
</script>




<style scoped lang="scss">
.container {
  padding: 0;
  padding-bottom: 120rpx;
  background: #f5f7fa;
  min-height: 100vh;
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
  /* 调整导航栏的margin，避免紧贴 */
  margin: 0 -24rpx;
}

.nav-title {
  font-size: 33rpx;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.5rpx;
}

.content {
	flex: 1;
	padding-bottom: 132rpx; /* Add padding for tab bar */
}

/* 页面头部样式 - 调整为深色主题 */
.page-header {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  padding: 60rpx 40rpx 40rpx;
  color: white;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.welcome-text {
  font-size: 28rpx;
  opacity: 0.9;
  margin-bottom: 8rpx;
  color: white;
}

.student-id {
  font-size: 24rpx;
  opacity: 0.7;
  color: white;
}

.header-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 32rpx;
  backdrop-filter: blur(10rpx);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-number {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
  color: white;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.8;
  color: white;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 20rpx;
}

/* 状态卡片样式 - 增强对比度 */
.status-card {
  background: white;
  border-radius: 24rpx 24rpx 16rpx 16rpx;
  margin: -20rpx 20rpx 32rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.15);
  border: 1rpx solid #e8ecf0;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.status-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2c3e50;
}

.status-badge {
  padding: 12rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: white;
}

.status-badge.scheduled {
  background: linear-gradient(45deg, #3498db, #2980b9);
}

/* 优化后的日期时间显示 */
.datetime-card {
  display: flex;
  align-items: center;
  background: linear-gradient(45deg, #ecf0f1, #bdc3c7);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid #d5dbdb;
}

.datetime-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.datetime-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.datetime-main {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
}

.countdown-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #e74c3c;
  color: white;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  min-width: 80rpx;
}

.countdown-number {
  font-size: 32rpx;
  font-weight: bold;
  line-height: 1;
}

.countdown-label {
  font-size: 20rpx;
  opacity: 0.9;
}

/* 准备提醒样式 */
.preparation-reminder {
  background: #ecf0f1;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-top: 24rpx;
  border: 1rpx solid #d5dbdb;
}

.reminder-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16rpx;
}

.reminder-items {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.reminder-item {
  font-size: 26rpx;
  color: #5d6d7e;
  line-height: 1.4;
}

.reminder-item.completed {
  color: #27ae60;
  text-decoration: line-through;
  opacity: 0.7;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #e8ecf0;
}

.info-label {
  font-size: 28rpx;
  color: #5d6d7e;
  min-width: 160rpx;
}

/* 地点图标样式 */
.info-label-with-icon {
  display: flex;
  align-items: center;
  min-width: 160rpx;
}

.location-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
}

.info-value {
  font-size: 28rpx;
  color: #2c3e50;
  font-weight: 500;
  flex: 1;
  text-align: right;
}

/* 评审老师列表样式 */
.assessors-list {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex: 1;
}

.assessor-item {
  margin-bottom: 8rpx;
}

.assessor-item:last-child {
  margin-bottom: 0;
}

/* 无安排状态优化 */
.no-schedule {
  text-align: center;
  padding: 60rpx 0;
}

.no-schedule-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.no-schedule-text {
  color: #5d6d7e;
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.no-schedule-sub {
  color: #85929e;
  font-size: 26rpx;
  line-height: 1.4;
}

/* 通知公告样式 - 增强对比度 */
.notice-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin: 0 20rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
  border: 1rpx solid #e8ecf0;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #2c3e50;
}

.more-text {
  font-size: 24rpx;
  color: #3498db;
}

.notice-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #e8ecf0;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.notice-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #2c3e50;
}

.notice-time {
  font-size: 24rpx;
  color: #85929e;
}

.notice-content {
  font-size: 26rpx;
  color: #5d6d7e;
  line-height: 1.4;
}

/* 全部通知弹窗样式 - 修复版本 */
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
}

.modal-content {
  background: white;
  border-radius: 24rpx;
  width: 90%;
  max-width: 700rpx;
  max-height: 80vh; /* 使用vh单位确保不超出屏幕 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内容溢出 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #e8ecf0;
  flex-shrink: 0; /* 防止头部被压缩 */
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2c3e50;
}

.modal-close {
  font-size: 32rpx;
  color: #85929e;
  padding: 8rpx;
  cursor: pointer;
}

.modal-body {
  flex: 1;
  height: 0; /* 关键：让flex子元素正确计算高度 */
  padding: 0;
}

.modal-notice-item {
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #e8ecf0;
}

.modal-notice-item:last-child {
  border-bottom: none;
  padding-bottom: 32rpx;
}

/* 确保通知内容不会超出边框 */
.modal-notice-item .notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 改为flex-start以防标题过长 */
  margin-bottom: 12rpx;
  gap: 20rpx; /* 添加间距 */
}

.modal-notice-item .notice-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #2c3e50;
  flex: 1;
  word-wrap: break-word; /* 确保长标题能够换行 */
  line-height: 1.4;
}

.modal-notice-item .notice-time {
  font-size: 24rpx;
  color: #85929e;
  flex-shrink: 0; /* 防止时间被压缩 */
  white-space: nowrap;
}

.modal-notice-item .notice-content {
  font-size: 26rpx;
  color: #5d6d7e;
  line-height: 1.5;
  word-wrap: break-word; /* 确保长内容能够换行 */
  overflow-wrap: break-word;
}

/* 底部导航栏 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #ffffff;
  border-top: 1rpx solid #e0e6ed;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item.active {
  color: #667eea;
}

.nav-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: 22rpx;
  color: #666;
}

.nav-item.active .nav-label {
  color: #667eea;
  font-weight: 500;
}
</style>