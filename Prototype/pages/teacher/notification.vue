<template>
  <view class="notification-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <image class="back-icon" src="/static/return.png" mode="aspectFit"></image>
      </view>
      <text class="nav-title">通知消息</text>
      <view class="nav-right">
        <text v-if="unreadCount > 0" class="mark-read-btn" @click="markAllAsRead">全部已读</text>
      </view>
    </view>

    <!-- 通知列表 -->
    <scroll-view class="notification-list" scroll-y="true" @scrolltolower="loadMore">
      <view v-for="(notification, index) in notificationData" :key="notification.id" class="notification-item" 
            :class="{ 'unread': !notification.isRead }" @click="handleNotificationClick(notification, index)">
        <!-- 通知图标 -->
        <view class="notification-icon">
          <text class="icon-text">{{ getNotificationIcon(notification.type) }}</text>
          <view v-if="!notification.isRead" class="unread-dot"></view>
        </view>

        <!-- 通知内容 -->
        <view class="notification-content">
          <view class="notification-header">
            <text class="notification-title">{{ notification.title }}</text>
            <text class="notification-time">{{ formatTime(notification.createdAt) }}</text>
          </view>
          
          <!-- 主要描述内容 -->
          <view class="notification-desc-container">
            <text class="notification-desc">{{ notification.description || notification.content }}</text>
            <!-- 突出显示的重点信息 -->
            <text v-if="notification.highlightInfo" class="highlight-info">{{ notification.highlightInfo }}</text>
          </view>
          
          <!-- 附加信息 -->
          <view v-if="notification.extraInfo" class="notification-extra">
            <text class="extra-text">{{ notification.extraInfo }}</text>
          </view>
        </view>
      </view>

      <!-- 加载更多指示器 -->
      <view v-if="loading" class="loading-indicator">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多数据提示 -->
      <view v-if="!hasMore && notificationData.length > 0" class="no-more">
        <text class="no-more-text">没有更多通知了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="notificationData.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">🔔</text>
        <text class="empty-title">暂无通知消息</text>
        <text class="empty-subtitle">最新的系统通知将在这里显示</text>
      </view>
    </scroll-view>

    <!-- 下拉刷新提示 -->
    <view v-if="refreshing" class="refresh-indicator">
      <text class="refresh-text">正在刷新...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { notificationAPI, apiUtils } from '@/pages/teacher/teacher_API.js'

// 响应式数据
const notificationData = ref([])
const loading = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const totalCount = ref(0)

// 计算未读数量
const unreadCount = computed(() => {
  return notificationData.value.filter(item => !item.isRead).length
})

// 页面加载时初始化数据
onMounted(async () => {
  console.log('通知页面已加载')
  await loadNotifications()
  
  // 监听WebSocket新通知事件
  uni.$on('newNotification', handleNewNotification)
})

// 页面卸载时清理监听
onUnmounted(() => {
  uni.$off('newNotification', handleNewNotification)
})

// 加载通知列表
const loadNotifications = async (reset = true) => {
  if (loading.value) return
  
  try {
    loading.value = true
    
    if (reset) {
      currentPage.value = 1
      notificationData.value = []
      hasMore.value = true
    }
    
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      unreadOnly: false
    }
    
    const response = await notificationAPI.getNotifications(params)
    
    if (response.code === 200) {
      const { notifications, pagination, unreadCount: serverUnreadCount } = response.data
      
      if (reset) {
        notificationData.value = notifications
      } else {
        notificationData.value.push(...notifications)
      }
      
      totalCount.value = pagination.total
      hasMore.value = currentPage.value < pagination.totalPages
      
      console.log(`加载通知成功，当前页：${currentPage.value}，总页数：${pagination.totalPages}`)
    }
    
  } catch (error) {
    console.error('加载通知失败:', error)
    apiUtils.handleError(error, '加载通知失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载更多通知
const loadMore = async () => {
  if (!hasMore.value || loading.value) return
  
  currentPage.value++
  await loadNotifications(false)
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await loadNotifications(true)
}

// 返回上一页 - 明确返回到 schedule 页面
const goBack = () => {
  uni.navigateTo({
    url: '/pages/teacher/schedule'
  })
}

// 获取通知图标
const getNotificationIcon = (type) => {
  const iconMap = {
    'schedule': '📅',
    'schedule_update': '📅',
    'system': '⚙️',
    'reminder': '⏰',
    'deadline_reminder': '⏰',
    'announcement': '📢',
    'task_assigned': '📋',
    'research_area_approved': '✅',
    'research_area_rejected': '❌'
  }
  return iconMap[type] || '📝'
}

// 格式化时间显示
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  // 超过7天显示具体日期
  const year = time.getFullYear()
  const month = String(time.getMonth() + 1).padStart(2, '0')
  const day = String(time.getDate()).padStart(2, '0')
  const currentYear = now.getFullYear()
  
  if (year === currentYear) {
    return `${month}-${day}`
  } else {
    return `${year}-${month}-${day}`
  }
}

// 处理通知点击
const handleNotificationClick = async (notification, index) => {
  try {
    // 如果是未读通知，标记为已读
    if (!notification.isRead) {
      await notificationAPI.markAsRead(notification.id)
      notificationData.value[index].isRead = true
      apiUtils.showSuccess('通知已标记为已读')
    }
    
    // 根据通知类型执行不同操作
    switch (notification.type) {
      case 'schedule':
      case 'schedule_update':
        // 跳转到时间选择页面
        uni.navigateTo({
          url: '/pages/teacher/schedule'
        })
        break
        
      case 'task_assigned':
        // 跳转到评审任务页面
        uni.navigateTo({
          url: '/pages/teacher/review'
        })
        break
        
      case 'research_area_approved':
      case 'research_area_rejected':
        // 跳转到研究方向管理页面
        uni.navigateTo({
          url: '/pages/teacher/research'
        })
        break
        
      default:
        // 显示通知详情
        const content = (notification.description || notification.content) + 
                       (notification.highlightInfo ? `\n\n重点：${notification.highlightInfo}` : '') + 
                       (notification.extraInfo ? `\n\n详情：${notification.extraInfo}` : '')
        
        uni.showModal({
          title: notification.title,
          content: content,
          showCancel: false,
          confirmText: '知道了'
        })
    }
    
  } catch (error) {
    console.error('处理通知点击失败:', error)
    apiUtils.handleError(error, '操作失败')
  }
}

// 全部标记为已读
const markAllAsRead = async () => {
  try {
    const confirmed = await apiUtils.showConfirm('确定要将所有通知标记为已读吗？')
    if (!confirmed) return
    
    apiUtils.showLoading('标记中...')
    
    // 调用API标记所有通知为已读
    await notificationAPI.markAllAsRead()
    
    // 更新本地数据
    notificationData.value.forEach(item => {
      item.isRead = true
    })
    
    apiUtils.hideLoading()
    apiUtils.showSuccess('已全部标记为已读')
    
  } catch (error) {
    apiUtils.hideLoading()
    console.error('标记全部已读失败:', error)
    apiUtils.handleError(error, '标记失败')
  }
}

// 处理新通知推送
const handleNewNotification = (newNotification) => {
  console.log('收到新通知推送:', newNotification)
  
  // 在列表顶部添加新通知
  notificationData.value.unshift({
    ...newNotification,
    time: formatTime(newNotification.createdAt || new Date().toISOString())
  })
  
  // 如果通知数量超过限制，删除最后一条
  if (notificationData.value.length > pageSize.value * currentPage.value) {
    notificationData.value.pop()
  }
}

// 暴露方法供父组件调用
defineExpose({
  loadNotifications,
  onRefresh
})
</script>

<style scoped>
.notification-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f2f2f7 0%, #f2f2f7 100%);
}

/* 顶部导航栏 */
.nav-bar {
  height: 88rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.nav-left {
  width: 100rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  width: 48rpx;
  height: 48rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.5rpx;
}

.nav-right {
  min-width: 120rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.mark-read-btn {
  font-size: 26rpx;
  color: #007AFF;
  font-weight: 500;
  white-space: nowrap;
}

/* 通知列表 */
.notification-list {
  flex: 1;
  padding: 24rpx 32rpx;
}

.notification-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  padding: 24rpx 32rpx;
  display: flex;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.notification-item.unread {
  border-left: 6rpx solid #007AFF;
  background: rgba(0, 122, 255, 0.02);
}

.notification-item:active {
  transform: scale(0.98);
}

/* 通知图标 */
.notification-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(0, 122, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  position: relative;
  flex-shrink: 0;
}

.icon-text {
  font-size: 32rpx;
}

.unread-dot {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 16rpx;
  height: 16rpx;
  background: #FF3B30;
  border-radius: 50%;
  border: 2rpx solid #ffffff;
}

/* 通知内容 */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.notification-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d1d1f;
  flex: 1;
  margin-right: 24rpx;
}

.notification-time {
  font-size: 24rpx;
  color: #8E8E93;
  flex-shrink: 0;
  white-space: nowrap;
}

/* 描述内容容器 */
.notification-desc-container {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  margin-bottom: 8rpx;
}

.notification-desc {
  font-size: 26rpx;
  color: #1d1d1f;
  line-height: 1.4;
  margin-right: 8rpx;
}

/* 突出显示的重点信息 */
.highlight-info {
  font-size: 26rpx;
  color: #007AFF;
  font-weight: 600;
  background: rgba(0, 122, 255, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  line-height: 1.4;
}

.notification-extra {
  margin-top: 12rpx;
  padding: 12rpx 16rpx;
  background: rgba(242, 242, 247, 0.8);
  border-radius: 12rpx;
  border-left: 4rpx solid #C7C7CC;
}

.extra-text {
  font-size: 24rpx;
  color: #8E8E93;
  font-weight: 400;
}

/* 加载指示器 */
.loading-indicator {
  text-align: center;
  padding: 40rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #8E8E93;
}

/* 没有更多数据 */
.no-more {
  text-align: center;
  padding: 40rpx;
}

.no-more-text {
  font-size: 24rpx;
  color: #C7C7CC;
}

/* 下拉刷新指示器 */
.refresh-indicator {
  position: fixed;
  top: 88rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  z-index: 999;
}

.refresh-text {
  font-size: 24rpx;
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
  opacity: 0.6;
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
</style>