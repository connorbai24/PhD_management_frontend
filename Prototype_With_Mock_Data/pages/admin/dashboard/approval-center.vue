<template>
  <view class="approval-center">
    <!-- 页面头部 -->
    <view class="header">
      <view class="nav-bar">
        <view class="nav-back" @click="goBack">
          <text class="back-arrow">←</text>
        </view>
        <view class="nav-title">审批中心</view>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <view class="stat-number">{{ pendingCount }}</view>
        <view class="stat-label">待审批</view>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <view class="stat-number">{{ historyCount }}</view>
        <view class="stat-label">历史记录</view>
      </view>
    </view>

    <!-- 筛选标签 -->
    <!-- <view class="filter-tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'pending' }"
        @click="switchTab('pending')"
      >
        待审批 ({{ pendingCount }})
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'processed' }"
        @click="switchTab('processed')"
      >
        已处理
      </view>
    </view> -->

    <!-- 申请列表 -->
    <view class="application-list">
      <view 
        v-for="item in currentList" 
        :key="item.id" 
        class="application-item"
      >
        <!-- 申请状态标识 -->
        <view class="status-indicator" :class="item.status"></view>
        
        <!-- 申请内容 -->
        <view class="application-content">
          <view class="application-header">
            <view class="applicant-info">
              <text class="applicant-name">{{ item.teacherName }}</text>
              <text class="applicant-id">工号: {{ item.teacherId }}</text>
            </view>
            <view class="application-time">{{ formatTime(item.createTime) }}</view>
          </view>
          
          <view class="application-type">
            <uni-tag :text="getTypeText(item.type)" type="primary" size="small"></uni-tag>
          </view>
          
          <view class="application-reason">
            <text class="reason-label">申请原因：</text>
            <text class="reason-text">{{ item.reason }}</text>
          </view>
          
          <view class="affected-students" v-if="item.affectedStudents.length > 0">
            <text class="students-label">影响学生：</text>
            <text class="students-text">{{ item.affectedStudents.join(', ') }}</text>
          </view>
          
          <!-- 审批操作按钮 -->
          <view v-if="item.status === 'pending'" class="approval-actions">
            <button 
              class="btn-reject" 
              size="mini"
              @click.stop="handleReject(item)"
            >
              拒绝
            </button>
            <button 
              class="btn-approve" 
              size="mini" 
              type="primary"
              @click.stop="handleApprove(item)"
            >
              同意
            </button>
          </view>
          
          <!-- 已处理状态显示 -->
          <view v-else class="processed-info">
            <view class="process-result" :class="item.status">
              {{ item.status === 'approved' ? '已同意' : '已拒绝' }}
            </view>
            <view class="process-time">{{ formatTime(item.processTime) }}</view>
            <view v-if="item.processNote" class="process-note">
              备注：{{ item.processNote }}
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="currentList.length === 0" class="empty-state">
        <image class="empty-image" src="/static/images/empty-approval.png" mode="aspectFit"></image>
        <text class="empty-text">{{ activeTab === 'pending' ? '暂无待审批申请' : '暂无处理记录' }}</text>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore" class="load-more" @click="loadMore">
      <text>加载更多</text>
    </view>
  </view>
</template>



<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 响应式数据
const activeTab = ref('pending')
const applicationList = ref([])
const hasMore = ref(true)
const currentPage = ref(1)

// 统计数量
const pendingCount = computed(() => {
  return applicationList.value.filter(item => item.status === 'pending').length
})
const historyCount = computed(() => {
  return applicationList.value.filter(item => item.status !== 'pending').length
})

// 计算属性
const currentList = computed(() => {
  return applicationList.value.filter(item => {
    if (activeTab.value === 'pending') {
      return item.status === 'pending'
    } else {
      return item.status !== 'pending'
    }
  })
})

// 页面加载
onMounted(() => {
  loadApplications()
})

// 方法定义
const goBack = () => {
  uni.redirectTo({
  	url: '/pages/admin/dashboard/dashboard'
  })
}

const switchTab = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
  loadApplications()
}

const loadApplications = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    
    // 模拟API调用
    const response = await mockApiCall('/api/admin/applications', {
      page: currentPage.value,
      status: activeTab.value === 'pending' ? 'pending' : 'processed'
    })
    
    if (currentPage.value === 1) {
      applicationList.value = response.data
    } else {
      applicationList.value.push(...response.data)
    }
    
    hasMore.value = response.hasMore
    uni.hideLoading()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

const loadMore = () => {
  currentPage.value++
  loadApplications()
}

const handleApprove = (item) => {
  uni.showModal({
    title: '确认操作',
    content: `确定要同意 ${item.teacherName} 的变更申请吗？`,
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        processApplication(item, 'approve')
      }
    }
  })
}

const handleReject = (item) => {
  uni.showModal({
    title: '确认操作',
    content: `确定要拒绝 ${item.teacherName} 的变更申请吗？`,
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        processApplication(item, 'reject')
      }
    }
  })
}

const processApplication = async (item, action) => {
  try {
    uni.showLoading({ title: '处理中...' })
    await mockApiCall('/api/admin/process-application', {
      id: item.id,
      action: action,
      note: '' // 不再需要备注
    })
    // 更新本地数据
    const index = applicationList.value.findIndex(app => app.id === item.id)
    if (index !== -1) {
      applicationList.value[index].status = action === 'approve' ? 'approved' : 'rejected'
      applicationList.value[index].processTime = new Date().toISOString()
      applicationList.value[index].processNote = ''
    }
    uni.hideLoading()
    uni.showToast({
      title: action === 'approve' ? '已同意' : '已拒绝',
      icon: 'success'
    })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '处理失败',
      icon: 'none'
    })
  }
}

const getTypeText = (type) => {
  const typeMap = {
    'schedule_change': '时间变更',
    'room_change': '地点变更',
    'emergency_leave': '紧急请假',
    'other': '其他'
  }
  return typeMap[type] || '未知类型'
}

const formatTime = (timeString) => {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes < 1 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

// 模拟API调用
const mockApiCall = (url, params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟数据
      if (url.includes('applications')) {
        resolve({
          data: [
            {
              id: 1,
              teacherName: '张教授',
              teacherId: 'T001',
              type: 'schedule_change',
              reason: '临时有重要会议需要参加，希望调整评审时间',
              status: 'pending',
              createTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              affectedStudents: ['李明', '王小红']
            },
            {
              id: 2,
              teacherName: '李副教授',
              teacherId: 'T002',
              type: 'emergency_leave',
              reason: '家中紧急事务，无法按时参加评审',
              status: params.status === 'pending' ? 'pending' : 'approved',
              createTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              processTime: params.status !== 'pending' ? new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() : null,
              affectedStudents: ['陈晓明']
            }
          ],
          hasMore: false
        })
      } else {
        resolve({ success: true })
      }
    }, 1000)
  })
}
</script>

<style lang="scss" scoped>
.approval-center {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.nav-right {
  width: 60rpx;
}

.stats-card {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  margin: 24rpx 32rpx;
  padding: 40rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #007aff;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 28rpx;
  color: #666;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background-color: #e5e5e5;
  margin: 0 40rpx;
}

.application-list {
  padding: 0 32rpx;
}

.application-item {
  display: flex;
  align-items: flex-start;
  background-color: #fff;
  margin-bottom: 24rpx;
  padding: 32rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  position: relative;
}

.status-indicator {
  width: 8rpx;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 0 8rpx 8rpx 0;
  
  &.pending {
    background-color: #ff9500;
  }
  
  &.approved {
    background-color: #34c759;
  }
  
  &.rejected {
    background-color: #ff3b30;
  }
}

.application-content {
  flex: 1;
  margin-left: 16rpx;
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.applicant-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.applicant-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.applicant-id {
  font-size: 24rpx;
  color: #999;
}

.application-time {
  font-size: 24rpx;
  color: #999;
}

.application-type {
  margin-bottom: 16rpx;
}

.application-reason {
  margin-bottom: 16rpx;
}

.reason-label {
  font-size: 28rpx;
  color: #666;
}

.reason-text {
  font-size: 28rpx;
  color: #333;
}

.affected-students {
  margin-bottom: 24rpx;
}

.students-label {
  font-size: 28rpx;
  color: #666;
}

.students-text {
  font-size: 28rpx;
  color: #333;
}

.approval-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}

.btn-reject {
  color: #ff3b30;
  background-color: #fff;
  border: 2rpx solid #ff3b30;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.btn-approve {
  background-color: #007aff;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.processed-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.process-result {
  font-size: 28rpx;
  font-weight: 600;
  
  &.approved {
    color: #34c759;
  }
  
  &.rejected {
    color: #ff3b30;
  }
}

.process-time {
  font-size: 24rpx;
  color: #999;
}

.process-note {
  font-size: 28rpx;
  color: #666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.load-more {
  text-align: center;
  padding: 40rpx;
  color: #007aff;
  font-size: 28rpx;
}

.back-arrow {
  color: #007aff;
  font-size: 36rpx;
  font-weight: bold;
  margin-right: 8rpx;
  vertical-align: middle;
}
</style>