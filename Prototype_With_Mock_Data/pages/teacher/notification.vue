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
    <scroll-view class="notification-list" scroll-y="true">
      <view v-for="(notification, index) in notificationData" :key="index" 
            class="notification-item" 
            :class="{ 'unread': !notification.isRead }" 
            @click="handleNotificationClick(notification, index)">
        
        <!-- 未读指示器 -->
        <view v-if="!notification.isRead" class="unread-indicator"></view>
        
        <!-- 通知内容 -->
        <view class="notification-content">
          <!-- 标题和时间 -->
          <view class="notification-header">
            <view class="title-wrapper">
              <text class="notification-title">{{ notification.title }}</text>
            </view>
            <view class="time-wrapper">
              <text class="notification-time">{{ notification.time }}</text>
            </view>
          </view>
          
          <!-- 描述内容 -->
          <view class="notification-desc-wrapper">
            <text class="notification-desc">{{ notification.description }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="notificationData.length === 0" class="empty-state">
        <text class="empty-title">暂无通知消息</text>
        <text class="empty-subtitle">最新的系统通知将在这里显示</text>
      </view>
    </scroll-view>
  </view>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue'

// 通知数据 - 简化版本
const notificationData = ref([
  {
    id: 1,
    title: '评审安排变更',
    description: '您明日上午的评审时间调整为10:00-10:45，学生：李明，地点：科研楼A座301',
    time: '2小时前',
    isRead: false
  },
  {
    id: 2,
    title: '系统维护通知',
    description: '系统将于今晚22:00-23:00进行维护，期间可能无法正常使用',
    time: '5小时前',
    isRead: false
  },
  {
    id: 3,
    title: '评审提醒',
    description: '距离下次评审还有1小时，学生：张小雨，时间：11:15-12:00',
    time: '1天前',
    isRead: true
  },
  {
    id: 4,
    title: '重要公告',
    description: '评审委员会关于论文评审标准的最新调整说明，请及时查看最新评审要求',
    time: '2天前',
    isRead: true
  },
  {
    id: 5,
    title: '新增评审任务',
    description: '您有一个新的评审任务已分配，学生：王小华，时间：11月25日 14:00',
    time: '3天前',
    isRead: true
  }
])

// 计算未读数量
const unreadCount = computed(() => {
  return notificationData.value.filter(item => !item.isRead).length
})

onMounted(() => {
  console.log('通知页面已加载')
})

// 返回上一页
const goBack = () => {
  uni.navigateTo({
    url: '/pages/teacher/schedule'
  })
}

// 处理通知点击
const handleNotificationClick = (notification, index) => {
  // 标记为已读
  if (!notification.isRead) {
    notificationData.value[index].isRead = true
  }
}

// 全部标记为已读
const markAllAsRead = () => {
  notificationData.value.forEach(item => {
    item.isRead = true
  })
  uni.showToast({
    title: '已全部标记为已读',
    icon: 'success'
  })
}
</script>

<style scoped>
.notification-container {
  min-height: 100vh;
  background: #f2f2f7;
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
  padding: 12rpx 3rpx;
  transform: scale(0.97);
}

.notification-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 未读通知样式 */
.notification-item.unread {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 6rpx 24rpx rgba(0, 122, 255, 0.15);
  border: 1rpx solid rgba(0, 122, 255, 0.1);
}

.notification-item:active {
  transform: scale(0.98);
}

/* 未读指示器 - 右上角圆点 */
.unread-indicator {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 16rpx;
  height: 16rpx;
  background: #FF3B30;
  border-radius: 50%;
  z-index: 10;
}

/* 通知内容 */
.notification-content {
  width: 100%;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
  gap: 24rpx;
}

.title-wrapper {
  flex: 1;
  min-width: 0; /* 重要：允许flex子项缩小 */
}

.notification-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.time-wrapper {
  flex-shrink: 0;
  margin-top: 2rpx; /* 微调对齐 */
}

.notification-time {
  font-size: 24rpx;
  color: #8E8E93;
  white-space: nowrap;
}

.notification-desc-wrapper {
  width: 100%;
  padding-right: 40rpx; /* 给右侧留出空间，避免与指示器重叠 */
}

.notification-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 最多显示3行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 已读通知的样式调整 */
.notification-item:not(.unread) .notification-title {
  color: #666666;
  font-weight: 500;
}

.notification-item:not(.unread) .notification-desc {
  color: #8E8E93;
}

.notification-item:not(.unread) .notification-time {
  color: #C7C7CC;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
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

/* 响应式调整 */
@media screen and (max-width: 750rpx) {
  .notification-header {
    gap: 16rpx;
  }
  
  .notification-desc-wrapper {
    padding-right: 32rpx;
  }
  
  .notification-title {
    font-size: 28rpx;
  }
  
  .notification-time {
    font-size: 22rpx;
  }
  
  .notification-desc {
    font-size: 24rpx;
  }
}
</style>