<template>
  <view class="notification-management">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <view class="nav-title">通知管理</view>
      <view class="nav-action" @click="showCreateModal">
        <uni-icons type="plus" size="20" color="#007aff"></uni-icons>
      </view>
    </view>

    <!-- 筛选和搜索 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view 
          class="filter-tab" 
          :class="{ active: activeTab === 'all' }"
          @click="switchTab('all')"
        >
          全部
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: activeTab === 'draft' }"
          @click="switchTab('draft')"
        >
          草稿
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: activeTab === 'sent' }"
          @click="switchTab('sent')"
        >
          已发送
        </view>
      </view>
      
      <view class="search-box">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <input 
          class="search-input" 
          placeholder="搜索通知标题或内容"
          v-model="searchKeyword"
          @input="handleSearch"
        />
      </view>
    </view>

    <!-- 通知列表 -->
    <view class="notification-list">
      <view 
        class="notification-item" 
        v-for="item in filteredNotifications" 
        :key="item.id"
        @click="viewNotification(item)"
      >
        <view class="item-header">
          <view class="item-title">{{ item.title }}</view>
          <view class="item-status" :class="item.status">
            {{ getStatusText(item.status) }}
          </view>
        </view>
        
        <view class="item-content">{{ item.content }}</view>
        
        <view class="item-meta">
          <view class="meta-info">
            <text class="meta-label">接收对象：</text>
            <text class="meta-value">{{ getRecipientText(item.recipientType) }}</text>
          </view>
          <view class="meta-info">
            <text class="meta-label">创建时间：</text>
            <text class="meta-value">{{ formatTime(item.createTime) }}</text>
          </view>
          <view class="meta-info" v-if="item.sendTime">
            <text class="meta-label">发送时间：</text>
            <text class="meta-value">{{ formatTime(item.sendTime) }}</text>
          </view>
        </view>
        
        <view class="item-actions">
          <view class="action-btn edit" @click.stop="editNotification(item)">编辑</view>
          <view class="action-btn send" v-if="item.status === 'draft'" @click.stop="sendNotification(item)">发送</view>
          <view class="action-btn delete" @click.stop="deleteNotification(item)">删除</view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredNotifications.length === 0">
        <uni-icons type="notification" size="60" color="#ccc"></uni-icons>
        <text class="empty-text">暂无通知记录</text>
      </view>
    </view>

    <!-- 创建/编辑通知弹窗 -->
    <uni-popup ref="notificationModal" type="bottom">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">{{ isEdit ? '编辑通知' : '创建通知' }}</text>
          <view class="modal-close" @click="closeModal">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">通知标题</text>
            <uni-easyinput
              class="form-input"
              placeholder="请输入通知标题"
              v-model="formData.title"
              maxlength="50"
              :inputBorder="false"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">通知内容</text>
            <uni-easyinput
              type="textarea"
              class="form-textarea"
              placeholder="请输入通知内容"
              v-model="formData.content"
              maxlength="500"
              :inputBorder="false"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">接收对象</text>
            <view class="recipient-options">
              <view 
                class="recipient-option" 
                :class="{ active: formData.recipientType === 'all' }"
                @click="selectRecipient('all')"
              >
                全部用户
              </view>
              <view 
                class="recipient-option" 
                :class="{ active: formData.recipientType === 'teacher' }"
                @click="selectRecipient('teacher')"
              >
                老师
              </view>
              <view 
                class="recipient-option" 
                :class="{ active: formData.recipientType === 'student' }"
                @click="selectRecipient('student')"
              >
                博士生
              </view>
            </view>
          </view>
          
          <view class="form-group" v-if="formData.recipientType !== 'all'">
            <text class="form-label">
              {{ formData.recipientType === 'teacher' ? '选择老师' : '选择博士生' }}
            </text>
            <view class="specific-recipients" @click="showRecipientSelector">
              <template v-if="formData.specificRecipients.length">
                <view class="selected-recipients">
                  <text v-for="user in selectedRecipientNames" :key="user" class="recipient-tag">{{ user }}</text>
                </view>
              </template>
              <template v-else>
                <text class="recipients-hint">点击选择具体接收人员</text>
              </template>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">发送方式</text>
            <view class="send-options">
              <view 
                class="send-option" 
                :class="{ active: formData.sendType === 'immediate' }"
                @click="selectSendType('immediate')"
              >
                立即发送
              </view>
              <view 
                class="send-option" 
                :class="{ active: formData.sendType === 'scheduled' }"
                @click="selectSendType('scheduled')"
              >
                定时发送
              </view>
              <view 
                class="send-option" 
                :class="{ active: formData.sendType === 'draft' }"
                @click="selectSendType('draft')"
              >
                保存草稿
              </view>
            </view>
          </view>
          
          <view class="form-group" v-if="formData.sendType === 'scheduled'">
            <text class="form-label">发送时间</text>
            <picker 
              mode="multiSelector" 
              :value="[dateIndex, timeIndex]" 
              :range="[dateRange, timeRange]"
              @change="bindScheduleChange"
            >
              <view class="schedule-picker">
                {{ formData.scheduleTime || '请选择发送时间' }}
              </view>
            </picker>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeModal">取消</button>
          <button class="modal-btn confirm" @click="handleSubmit">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 选择接收人员弹窗 -->
    <uni-popup ref="recipientSelector" type="bottom">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">选择{{ formData.recipientType === 'teacher' ? '老师' : '博士生' }}</text>
          <view class="modal-close" @click="closeRecipientSelector">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="modal-body">
          <scroll-view style="max-height: 50vh;">
            <view v-for="user in recipientList" :key="user.id" class="recipient-item" 
              :class="{ selected: tempSelectedRecipients.includes(user.id) }"
              @click="toggleRecipient(user)">
              <text class="recipient-checkbox">{{ tempSelectedRecipients.includes(user.id) ? '☑' : '☐' }}</text>
              <text class="recipient-name">{{ user.name }}</text>
            </view>
          </scroll-view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeRecipientSelector">取消</button>
          <button class="modal-btn confirm" @click="confirmRecipientSelection">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 确认删除弹窗 -->
    <uni-popup ref="deleteModal" type="dialog">
      <uni-popup-dialog 
        mode="base" 
        title="确认删除" 
        content="确定要删除这条通知吗？删除后无法恢复。"
        @confirm="confirmDelete"
        @close="cancelDelete"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import uniEasyinput from '@dcloudio/uni-ui/lib/uni-easyinput/uni-easyinput.vue'

// 响应式数据
const activeTab = ref('all')
const searchKeyword = ref('')
const isEdit = ref(false)
const currentEditId = ref(null)
const deleteTargetId = ref(null)

// 表单数据
const formData = reactive({
  title: '',
  content: '',
  recipientType: 'all',
  specificRecipients: [],
  sendType: 'immediate',
  scheduleTime: ''
})

// 时间选择器数据
const dateIndex = ref(0)
const timeIndex = ref(0)
const dateRange = ref([])
const timeRange = ref([])

// 通知列表数据
const notifications = ref([
  {
    id: 1,
    title: '2024年度博士生年审安排通知',
    content: '各位老师和博士生，2024年度博士生年审安排已经确定，请查看具体安排并按时参加。',
    recipientType: 'all',
    status: 'sent',
    createTime: '2024-05-15 10:30:00',
    sendTime: '2024-05-15 14:30:00',
    readCount: 45,
    totalCount: 50
  },
  {
    id: 2,
    title: '评审时间调整通知',
    content: '由于会议室冲突，部分学生的评审时间需要调整，具体调整安排请查看系统...',
    recipientType: 'student',
    status: 'sent',
    createTime: '2024-05-10 09:15:00',
    sendTime: '2024-05-10 09:20:00',
    readCount: 8,
    totalCount: 12
  },
  {
    id: 3,
    title: '系统维护通知',
    content: '系统将于本周末进行例行维护，维护期间可能无法正常访问，请提前做好准备。',
    recipientType: 'all',
    status: 'draft',
    createTime: '2024-05-08 16:45:00',
    sendTime: null,
    readCount: 0,
    totalCount: 0
  }
])

// 引用
const notificationModal = ref()
const deleteModal = ref()

// 新增：模拟老师/博士生数据
const teacherList = [
  { id: 1, name: '张教授' },
  { id: 2, name: '李副教授' },
  { id: 3, name: '王教授' },
  { id: 4, name: '陈副教授' },
  { id: 5, name: '刘教授' }
]
const studentList = [
  { id: 101, name: '博士生A' },
  { id: 102, name: '博士生B' },
  { id: 103, name: '博士生C' }
]

// 选择人员弹窗相关
const recipientSelector = ref()
const tempSelectedRecipients = ref([])

const recipientList = computed(() => {
  return formData.recipientType === 'teacher' ? teacherList : studentList
})

const selectedRecipientNames = computed(() => {
  return recipientList.value
    .filter(user => formData.specificRecipients.includes(user.id))
    .map(user => user.name)
})

// 计算属性
const filteredNotifications = computed(() => {
  let result = notifications.value
  
  // 按状态筛选
  if (activeTab.value !== 'all') {
    result = result.filter(item => item.status === activeTab.value)
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(keyword) || 
      item.content.toLowerCase().includes(keyword)
    )
  }
  
  return result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const switchTab = (tab) => {
  activeTab.value = tab
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const showCreateModal = () => {
  isEdit.value = false
  resetFormData()
  initTimePicker()
  notificationModal.value.open()
}

const editNotification = (item) => {
  isEdit.value = true
  currentEditId.value = item.id
  
  // 填充表单数据
  formData.title = item.title
  formData.content = item.content
  formData.recipientType = item.recipientType
  formData.sendType = item.status === 'draft' ? 'draft' : 'immediate'
  
  initTimePicker()
  notificationModal.value.open()
}

const closeModal = () => {
  notificationModal.value.close()
  resetFormData()
}

const resetFormData = () => {
  formData.title = ''
  formData.content = ''
  formData.recipientType = 'all'
  formData.specificRecipients = []
  formData.sendType = 'immediate'
  formData.scheduleTime = ''
}

const selectRecipient = (type) => {
  formData.recipientType = type
}

const selectSendType = (type) => {
  formData.sendType = type
}

const initTimePicker = () => {
  // 初始化日期选择器（未来7天）
  const dates = []
  const times = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    dates.push(`${date.getMonth() + 1}月${date.getDate()}日`)
  }
  
  // 时间选项（每小时一个选项）
  for (let i = 8; i <= 20; i++) {
    times.push(`${i}:00`)
    times.push(`${i}:30`)
  }
  
  dateRange.value = dates
  timeRange.value = times
}

const bindScheduleChange = (e) => {
  const [dateIdx, timeIdx] = e.detail.value
  dateIndex.value = dateIdx
  timeIndex.value = timeIdx
  formData.scheduleTime = `${dateRange.value[dateIdx]} ${timeRange.value[timeIdx]}`
}

const handleSubmit = async () => {
  // 表单验证
  if (!formData.title.trim()) {
    uni.showToast({ title: '请输入通知标题', icon: 'none' })
    return
  }
  
  if (!formData.content.trim()) {
    uni.showToast({ title: '请输入通知内容', icon: 'none' })
    return
  }
  
  if (formData.sendType === 'scheduled' && !formData.scheduleTime) {
    uni.showToast({ title: '请选择发送时间', icon: 'none' })
    return
  }
  
  try {
    uni.showLoading({ title: '处理中...' })
    
    const notificationData = {
      title: formData.title,
      content: formData.content,
      recipientType: formData.recipientType,
      specificRecipients: formData.specificRecipients,
      sendType: formData.sendType,
      scheduleTime: formData.scheduleTime
    }
    
    if (isEdit.value) {
      // 更新通知
      await updateNotification(currentEditId.value, notificationData)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      // 创建通知
      await createNotification(notificationData)
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
    
    closeModal()
    loadNotifications()
    
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const sendNotification = async (item) => {
  try {
    uni.showLoading({ title: '发送中...' })
    await sendNotificationById(item.id)
    uni.showToast({ title: '发送成功', icon: 'success' })
    loadNotifications()
  } catch (error) {
    uni.showToast({ title: '发送失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const deleteNotification = (item) => {
  deleteTargetId.value = item.id
  deleteModal.value.open()
}

const confirmDelete = async () => {
  try {
    uni.showLoading({ title: '删除中...' })
    await deleteNotificationById(deleteTargetId.value)
    uni.showToast({ title: '删除成功', icon: 'success' })
    loadNotifications()
  } catch (error) {
    uni.showToast({ title: '删除失败', icon: 'none' })
  } finally {
    uni.hideLoading()
    deleteModal.value.close()
  }
}

const cancelDelete = () => {
  deleteModal.value.close()
  deleteTargetId.value = null
}

const viewNotification = (item) => {
  // 跳转到通知详情页
  uni.navigateTo({
    url: `/pages/admin/notification-detail?id=${item.id}`
  })
}

// 工具方法
const getStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'sent': '已发送',
    'scheduled': '定时发送'
  }
  return statusMap[status] || status
}

const getRecipientText = (recipientType) => {
  const recipientMap = {
    'all': '全部用户',
    'teacher': '老师',
    'student': '博士生'
  }
  return recipientMap[recipientType] || recipientType
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// API 调用方法（示例）
const loadNotifications = async () => {
  // 实际项目中这里应该调用真实的API
  // const response = await uni.request({
  //   url: '/api/admin/notifications',
  //   method: 'GET'
  // })
  // notifications.value = response.data
}

const createNotification = async (data) => {
  // API调用示例
  // return await uni.request({
  //   url: '/api/admin/notifications',
  //   method: 'POST',
  //   data
  // })
  
  // 模拟API调用
  return new Promise(resolve => {
    setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        ...data,
        status: data.sendType === 'draft' ? 'draft' : 'sent',
        createTime: new Date().toISOString(),
        sendTime: data.sendType === 'immediate' ? new Date().toISOString() : null,
        readCount: 0,
        totalCount: 50
      }
      notifications.value.unshift(newNotification)
      resolve()
    }, 1000)
  })
}

const updateNotification = async (id, data) => {
  // 模拟API调用
  return new Promise(resolve => {
    setTimeout(() => {
      const index = notifications.value.findIndex(item => item.id === id)
      if (index !== -1) {
        notifications.value[index] = { ...notifications.value[index], ...data }
      }
      resolve()
    }, 1000)
  })
}

const sendNotificationById = async (id) => {
  // 模拟API调用
  return new Promise(resolve => {
    setTimeout(() => {
      const notification = notifications.value.find(item => item.id === id)
      if (notification) {
        notification.status = 'sent'
        notification.sendTime = new Date().toISOString()
      }
      resolve()
    }, 1000)
  })
}

const deleteNotificationById = async (id) => {
  // 模拟API调用
  return new Promise(resolve => {
    setTimeout(() => {
      const index = notifications.value.findIndex(item => item.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }
      resolve()
    }, 1000)
  })
}

// 选择人员弹窗相关
const showRecipientSelector = () => {
  tempSelectedRecipients.value = [...formData.specificRecipients]
  recipientSelector.value.open()
}
const closeRecipientSelector = () => {
  recipientSelector.value.close()
}
const toggleRecipient = (user) => {
  const idx = tempSelectedRecipients.value.indexOf(user.id)
  if (idx === -1) {
    tempSelectedRecipients.value.push(user.id)
  } else {
    tempSelectedRecipients.value.splice(idx, 1)
  }
}
const confirmRecipientSelection = () => {
  formData.specificRecipients = [...tempSelectedRecipients.value]
  closeRecipientSelector()
}

// 生命周期
onMounted(() => {
  loadNotifications()
})
</script>

<style lang="scss" scoped>
.notification-management {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 44px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  
  .nav-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .nav-back, .nav-action {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.filter-section {
  background-color: #fff;
  padding: 16px;
  border-bottom: 1px solid #eee;
  
  .filter-tabs {
    display: flex;
    margin-bottom: 16px;
    
    .filter-tab {
      flex: 1;
      text-align: center;
      padding: 8px 0;
      font-size: 14px;
      color: #666;
      border-bottom: 2px solid transparent;
      
      &.active {
        color: #007aff;
        border-bottom-color: #007aff;
      }
    }
  }
  
  .search-box {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border-radius: 20px;
    
    .search-input {
      flex: 1;
      margin-left: 8px;
      font-size: 14px;
      border: none;
      background: transparent;
    }
  }
}

.notification-list {
  padding: 16px;
  
  .notification-item {
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    .item-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 8px;
      
      .item-title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
        color: #333;
        line-height: 1.4;
      }
      
      .item-status {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        margin-left: 12px;
        
        &.draft {
          background-color: #fff3cd;
          color: #856404;
        }
        
        &.sent {
          background-color: #d1ecf1;
          color: #0c5460;
        }
        
        &.scheduled {
          background-color: #e2e3e5;
          color: #383d41;
        }
      }
    }
    
    .item-content {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .item-meta {
      margin-bottom: 12px;
      
      .meta-info {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        
        .meta-label {
          font-size: 12px;
          color: #999;
          min-width: 60px;
        }
        
        .meta-value {
          font-size: 12px;
          color: #666;
        }
      }
    }
    
    .item-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      
      .action-btn {
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        text-align: center;
        
        &.edit {
          background-color: #007aff;
          color: #fff;
        }
        
        &.send {
          background-color: #28a745;
          color: #fff;
        }
        
        &.delete {
          background-color: #dc3545;
          color: #fff;
        }
      }
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    
    .empty-text {
      margin-top: 16px;
      font-size: 14px;
      color: #999;
    }
  }
}

.modal-content {
  background-color: #fff;
  border-radius: 16px 16px 0 0;
  padding: 0;
  max-height: 80vh;
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    
    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .modal-close {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .modal-body {
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
    
    .form-group {
      margin-bottom: 20px;
      
      .form-label {
        display: block;
        font-size: 14px;
        color: #333;
        margin-bottom: 8px;
      }
      
      .form-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        box-sizing: border-box;
      }
      
      .form-textarea {
        width: 100%;
        min-height: 80px;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        resize: vertical;
        box-sizing: border-box;
      }
      
      .recipient-options, .send-options {
        display: flex;
        gap: 12px;
        
        .recipient-option, .send-option {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          
          &.active {
            background-color: #007aff;
            border-color: #007aff;
            color: #fff;
          }
        }
      }
      
      .specific-recipients {
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        
        .recipients-hint {
          font-size: 12px;
          color: #999;
        }
      }
      
      .schedule-picker {
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        color: #333;
      }
    }
  }
  
  .modal-footer {
    display: flex;
    padding: 16px 20px;
    border-top: 1px solid #eee;
    gap: 12px;
    
    .modal-btn {
      flex: 1;
      padding: 12px 0;
      border-radius: 8px;
      font-size: 16px;
      text-align: center;
      
      &.cancel {
        background-color: #f5f5f5;
        color: #666;
        border: none;
      }
      
      &.confirm {
        background-color: #007aff;
        color: #fff;
        border: none;
      }
    }
  }
}

.back-arrow {
  color: #007aff;
  font-size: 28px;
  font-weight: bold;
  margin-right: 8rpx;
  vertical-align: middle;
}

// 高亮已选项
.recipient-item.selected {
  background: #e6f7ff;
}
.recipient-checkbox {
  font-size: 18px;
  margin-right: 8px;
}
.recipient-tag {
  display: inline-block;
  background: #e6f7ff;
  color: #007aff;
  border-radius: 12px;
  padding: 2px 10px;
  margin: 2px 4px 2px 0;
  font-size: 12px;
}
</style>