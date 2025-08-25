<template>
  <view class="notification-management">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <view class="nav-title">通知管理</view>
      <view class="nav-right" @click="showCreateModal">
        <view class="add-button">
          <text class="add-icon">+</text>
        </view>
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
          <text class="modal-title">{{ getModalTitle() }}</text>
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
            <view class="datetime-picker-group">
              <picker 
                mode="date" 
                :value="formData.scheduleDate"
                :start="currentDate"
                :end="maxDate"
                @change="bindDateChange"
              >
                <view class="datetime-picker date-picker">
                  <text class="picker-label">选择日期</text>
                  <text class="picker-value">{{ formData.scheduleDate || '请选择日期' }}</text>
                </view>
              </picker>
              
              <picker 
                mode="time" 
                :value="formData.scheduleTime"
                @change="bindTimeChange"
              >
                <view class="datetime-picker time-picker">
                  <text class="picker-label">选择时间</text>
                  <text class="picker-value">{{ formData.scheduleTime || '请选择时间' }}</text>
                </view>
              </picker>
            </view>
            
            <view class="schedule-preview" v-if="formData.scheduleDate && formData.scheduleTime">
              <text class="preview-label">定时发送时间：</text>
              <text class="preview-value">{{ getSchedulePreview() }}</text>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeModal">取消</button>
          <button class="modal-btn confirm" @click="handleSubmit">
            {{ getConfirmButtonText() }}
          </button>
        </view>
      </view>
    </uni-popup>

    <!-- 选择接收人员弹窗 - 优化版本 -->
    <uni-popup ref="recipientSelector" type="bottom">
      <view class="modal-content recipient-modal">
        <view class="modal-header">
          <text class="modal-title">选择{{ formData.recipientType === 'teacher' ? '老师' : '博士生' }}</text>
          <view class="modal-close" @click="closeRecipientSelector">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <!-- 搜索框 -->
        <view class="recipient-search">
          <view class="search-box">
            <uni-icons type="search" size="16" color="#999"></uni-icons>
            <input 
              class="search-input" 
              placeholder="搜索姓名"
              v-model="recipientSearchKeyword"
              @input="handleRecipientSearch"
            />
          </view>
        </view>
        
        <!-- 已选择的人员 -->
        <view class="selected-section" v-if="tempSelectedRecipients.length > 0">
          <view class="selected-title">已选择 ({{ tempSelectedRecipients.length }})</view>
          <scroll-view class="selected-list" scroll-y>
            <view 
              v-for="userId in tempSelectedRecipients" 
              :key="userId" 
              class="selected-item"
              @click="removeRecipient(userId)"
            >
              <text class="selected-name">{{ getRecipientNameById(userId) }}</text>
              <text class="remove-btn">×</text>
            </view>
          </scroll-view>
        </view>
        
        <view class="modal-body">
          <!-- 全选/取消全选 -->
          <view class="select-all-section">
            <view class="select-all-btn" @click="toggleSelectAll">
              <text class="checkbox">{{ isAllSelected ? '☑' : '☐' }}</text>
              <text class="select-all-text">{{ isAllSelected ? '取消全选' : '全选' }}</text>
            </view>
            <text class="count-text">共 {{ filteredRecipientList.length }} 人</text>
          </view>
          
          <!-- 人员列表 -->
          <scroll-view 
            class="recipient-scroll"
            scroll-y
            :show-scrollbar="true"
            :enhanced="true"
            :bounces="false"
          >
            <view 
              v-for="user in filteredRecipientList" 
              :key="user.id" 
              class="recipient-item" 
              :class="{ selected: tempSelectedRecipients.includes(user.id) }"
              @click="toggleRecipient(user)"
            >
              <text class="recipient-checkbox">{{ tempSelectedRecipients.includes(user.id) ? '☑' : '☐' }}</text>
              <view class="recipient-info">
                <text class="recipient-name">{{ user.name }}</text>
              </view>
            </view>
            
            <!-- 加载更多提示 -->
            <view class="load-more" v-if="filteredRecipientList.length === 0 && recipientSearchKeyword">
              <text class="no-result">暂无搜索结果</text>
            </view>
          </scroll-view>
        </view>
        
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeRecipientSelector">取消</button>
          <button class="modal-btn confirm" @click="confirmRecipientSelection">
            确定{{ tempSelectedRecipients.length > 0 ? `(${tempSelectedRecipients.length})` : '' }}
          </button>
        </view>
      </view>
    </uni-popup>

    <!-- 确认删除弹窗 -->
    <uni-popup ref="deleteModal" type="dialog">
      <uni-popup-dialog 
        mode="base" 
        title="确认删除" 
        content="确定要删除这条通知吗？\n删除后无法恢复。"
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
const recipientSearchKeyword = ref('')

// 表单数据
const formData = reactive({
  title: '',
  content: '',
  recipientType: 'all',
  specificRecipients: [],
  sendType: 'immediate',
  scheduleDate: '',
  scheduleTime: '',
  originalStatus: '' // 新增：记录原始通知的状态
})

// 时间选择器数据
const currentDate = ref('')
const maxDate = ref('')

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

// 优化后的教师数据 - 更真实的测试数据
const teacherList = [
  { id: 1, name: '张教授', department: '计算机学院', title: '教授' },
  { id: 2, name: '李副教授', department: '计算机学院', title: '副教授' },
  { id: 3, name: '王教授', department: '软件学院', title: '教授' },
  { id: 4, name: '陈副教授', department: '软件学院', title: '副教授' },
  { id: 5, name: '刘教授', department: '信息学院', title: '教授' },
  { id: 6, name: '赵副教授', department: '信息学院', title: '副教授' },
  { id: 7, name: '孙教授', department: '网络学院', title: '教授' },
  { id: 8, name: '周副教授', department: '网络学院', title: '副教授' },
  { id: 9, name: '吴教授', department: '人工智能学院', title: '教授' },
  { id: 10, name: '徐副教授', department: '人工智能学院', title: '副教授' },
  { id: 11, name: '朱教授', department: '数据科学学院', title: '教授' },
  { id: 12, name: '胡副教授', department: '数据科学学院', title: '副教授' },
  { id: 13, name: '高教授', department: '网络安全学院', title: '教授' },
  { id: 14, name: '林副教授', department: '网络安全学院', title: '副教授' },
  { id: 15, name: '何教授', department: '电子工程学院', title: '教授' },
  { id: 16, name: '郭副教授', department: '电子工程学院', title: '副教授' },
  { id: 17, name: '马教授', department: '通信工程学院', title: '教授' },
  { id: 18, name: '罗副教授', department: '通信工程学院', title: '副教授' },
  { id: 19, name: '梁教授', department: '自动化学院', title: '教授' },
  { id: 20, name: '宋副教授', department: '自动化学院', title: '副教授' },
  { id: 21, name: '韩教授', department: '机械学院', title: '教授' },
  { id: 22, name: '冯副教授', department: '机械学院', title: '副教授' },
  { id: 23, name: '蒋教授', department: '材料学院', title: '教授' },
  { id: 24, name: '彭副教授', department: '材料学院', title: '副教授' },
  { id: 25, name: '曹教授', department: '化学学院', title: '教授' },
  { id: 26, name: '邓副教授', department: '化学学院', title: '副教授' },
  { id: 27, name: '许教授', department: '物理学院', title: '教授' },
  { id: 28, name: '魏副教授', department: '物理学院', title: '副教授' },
  { id: 29, name: '苏教授', department: '数学学院', title: '教授' },
  { id: 30, name: '卢副教授', department: '数学学院', title: '副教授' }
]

const studentList = [
  { id: 101, name: '张小明', department: '计算机学院', title: '博士研究生' },
  { id: 102, name: '李小红', department: '软件学院', title: '博士研究生' },
  { id: 103, name: '王小强', department: '信息学院', title: '博士研究生' },
  { id: 104, name: '陈小花', department: '网络学院', title: '博士研究生' },
  { id: 105, name: '刘小刚', department: '人工智能学院', title: '博士研究生' },
  { id: 106, name: '赵小丽', department: '数据科学学院', title: '博士研究生' },
  { id: 107, name: '孙小伟', department: '网络安全学院', title: '博士研究生' },
  { id: 108, name: '周小敏', department: '电子工程学院', title: '博士研究生' },
  { id: 109, name: '吴小东', department: '通信工程学院', title: '博士研究生' },
  { id: 110, name: '徐小燕', department: '自动化学院', title: '博士研究生' },
  { id: 111, name: '朱小龙', department: '机械学院', title: '博士研究生' },
  { id: 112, name: '胡小芳', department: '材料学院', title: '博士研究生' },
  { id: 113, name: '高小军', department: '化学学院', title: '博士研究生' },
  { id: 114, name: '林小娟', department: '物理学院', title: '博士研究生' },
  { id: 115, name: '何小斌', department: '数学学院', title: '博士研究生' }
]

// 选择人员弹窗相关
const recipientSelector = ref()
const tempSelectedRecipients = ref([])

const recipientList = computed(() => {
  return formData.recipientType === 'teacher' ? teacherList : studentList
})

// 过滤后的人员列表
const filteredRecipientList = computed(() => {
  if (!recipientSearchKeyword.value) {
    return recipientList.value
  }
  const keyword = recipientSearchKeyword.value.toLowerCase()
  return recipientList.value.filter(user => 
    user.name.toLowerCase().includes(keyword)
  )
})

// 是否全选
const isAllSelected = computed(() => {
  return filteredRecipientList.value.length > 0 && 
         filteredRecipientList.value.every(user => tempSelectedRecipients.value.includes(user.id))
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
  uni.redirectTo({
    url: '/pages/admin/dashboard/dashboard'
  })
}

const switchTab = (tab) => {
  activeTab.value = tab
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleRecipientSearch = () => {
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
  formData.originalStatus = item.status // 记录原始状态
  
  // 根据原始状态设置发送方式
  if (item.status === 'sent') {
    // 已发送的通知，默认设置为立即发送（再次发送）
    formData.sendType = 'immediate'
  } else {
    // 草稿状态保持原来的逻辑
    formData.sendType = 'draft'
  }
  
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
  formData.scheduleDate = ''
  formData.scheduleTime = ''
  formData.originalStatus = ''
  recipientSearchKeyword.value = ''
}

// 获取确认按钮文字
const getConfirmButtonText = () => {
  if (isEdit.value && formData.originalStatus === 'sent') {
    // 编辑已发送通知的情况
    if (formData.sendType === 'draft') {
      return '确定'  // 保存草稿时显示"确定"
    } else {
      return '再次发送'  // 立即发送或定时发送时显示"再次发送"
    }
  } else if (isEdit.value) {
    return '更新'  // 编辑草稿
  } else {
    return '确定'  // 创建新通知
  }
}

// 获取模态框标题
const getModalTitle = () => {
  if (isEdit.value && formData.originalStatus === 'sent') {
    if (formData.sendType === 'draft') {
      return '编辑通知'  // 保存草稿时显示"编辑通知"
    } else {
      return '再次发送通知'  // 立即发送或定时发送时显示"再次发送通知"
    }
  } else if (isEdit.value) {
    return '编辑通知'
  } else {
    return '创建通知'
  }
}

const selectRecipient = (type) => {
  formData.recipientType = type
  // 清空之前选择的特定人员
  formData.specificRecipients = []
}

const selectSendType = (type) => {
  formData.sendType = type
}

const initTimePicker = () => {
  // 设置当前日期为最小可选日期
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')
  currentDate.value = `${year}-${month}-${day}`
  
  // 设置最大可选日期为一年后
  const maxYear = year + 1
  maxDate.value = `${maxYear}-${month}-${day}`
}

const bindDateChange = (e) => {
  formData.scheduleDate = e.detail.value
}

const bindTimeChange = (e) => {
  formData.scheduleTime = e.detail.value
}

const getSchedulePreview = () => {
  if (!formData.scheduleDate || !formData.scheduleTime) return ''
  
  const date = new Date(`${formData.scheduleDate} ${formData.scheduleTime}`)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  
  return `${year}年${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
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
  
  if (formData.sendType === 'scheduled' && (!formData.scheduleDate || !formData.scheduleTime)) {
    uni.showToast({ title: '请选择完整的发送时间', icon: 'none' })
    return
  }
  
  // 验证定时发送时间不能早于当前时间
  if (formData.sendType === 'scheduled') {
    const scheduleDateTime = new Date(`${formData.scheduleDate} ${formData.scheduleTime}`)
    const now = new Date()
    if (scheduleDateTime <= now) {
      uni.showToast({ title: '发送时间不能早于当前时间', icon: 'none' })
      return
    }
  }
  
  try {
    uni.showLoading({ title: '处理中...' })
    
    const notificationData = {
      title: formData.title,
      content: formData.content,
      recipientType: formData.recipientType,
      specificRecipients: formData.specificRecipients,
      sendType: formData.sendType,
      scheduleDate: formData.scheduleDate,
      scheduleTime: formData.scheduleTime
    }
    
    if (isEdit.value && formData.originalStatus === 'sent') {
      if (formData.sendType === 'draft') {
        // 已发送通知保存为草稿：创建新的草稿版本
        await createNotification(notificationData)
        uni.showToast({ title: '草稿保存成功', icon: 'success' })
      } else {
        // 已发送通知再次发送：创建新的发送记录
        await resendNotification(currentEditId.value, notificationData)
        uni.showToast({ title: '再次发送成功', icon: 'success' })
      }
    } else if (isEdit.value) {
      // 更新草稿通知
      await updateNotification(currentEditId.value, notificationData)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      // 创建新通知
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

// 获取人员姓名
const getRecipientNameById = (id) => {
  const user = recipientList.value.find(user => user.id === id)
  return user ? user.name : ''
}

// API 调用方法（示例）
const loadNotifications = async () => {
  // 实际项目中这里应该调用真实的API
}

const createNotification = async (data) => {
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

const resendNotification = async (originalId, data) => {
  // 模拟API调用 - 再次发送通知
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

// 选择人员弹窗相关方法
const showRecipientSelector = () => {
  tempSelectedRecipients.value = [...formData.specificRecipients]
  recipientSearchKeyword.value = ''
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

const removeRecipient = (userId) => {
  const idx = tempSelectedRecipients.value.indexOf(userId)
  if (idx !== -1) {
    tempSelectedRecipients.value.splice(idx, 1)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全选
    filteredRecipientList.value.forEach(user => {
      const idx = tempSelectedRecipients.value.indexOf(user.id)
      if (idx !== -1) {
        tempSelectedRecipients.value.splice(idx, 1)
      }
    })
  } else {
    // 全选
    filteredRecipientList.value.forEach(user => {
      if (!tempSelectedRecipients.value.includes(user.id)) {
        tempSelectedRecipients.value.push(user.id)
      }
    })
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
    background: #f2f2f7;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

/* 顶部导航栏 */
  .nav-bar {
    width: 100%;
    height: 88rpx;
    background: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32rpx;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1rpx solid #e5e5e7;
  }
  
  .nav-left {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -2rpx;
    cursor: pointer;
  }
  
  .back-arrow {
    color: #007aff;
    font-size: 36rpx;
    font-weight: bold;
  }
  
  .nav-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .nav-right {
    display: flex;
    align-items: center;
	margin-right: 63rpx;
  }
  
  .add-button {
    width: 60rpx;
    height: 60rpx;
    border-radius: 16rpx;
    background: #F2F2F7;
    border: 2rpx solid #E5E5E7;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .add-button:active {
    transform: scale(0.95);
    background: #E5E5E7;
  }
  
  .add-icon {
    font-size: 38rpx;
    color: #007AFF;
    font-weight: 600;
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
  height: 80vh;
  display: flex;
  flex-direction: column;
  
  .modal-header {
    flex-shrink: 0;
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
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    min-height: 0;
    
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
      
      .datetime-picker-group {
        display: flex;
        width: 100%;
        gap: 8px;
        
        .datetime-picker {
          flex: 1;
          min-width: 0;
          padding: 12rpx 90rpx 12rpx 90rpx;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #fff;
          box-sizing: border-box;
          
          .picker-label {
            display: block;
            font-size: 12px;
            color: #999;
            margin-bottom: 4rpx;
            white-space: nowrap;
          }
          
          .picker-value {
            font-size: 14px;
            color: #333;
            word-break: break-all;
          }
        }
        
        .date-picker {
          border-color: #007aff;
        }
        
        .time-picker {
          border-color: #28a745;
        }
      }
      
      .schedule-preview {
        margin-top: 12px;
        padding: 8px 12px 10px 12px;
        background-color: #f0f8ff;
        border-radius: 6px;
        border-left: 3px solid #007aff;
        
        .preview-label {
          font-size: 12px;
          color: #666;
          margin-right: 8px;
        }
        
        .preview-value {
          font-size: 14px;
          color: #007aff;
          font-weight: 600;
        }
      }
    }
  }
  
  .modal-footer {
    flex-shrink: 0;
    display: flex;
    padding: 16px 20px;
    border-top: 1px solid #eee;
    gap: 12px;
    background-color: #fff;
    
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

// 人员选择弹窗优化样式
.recipient-modal {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  
  .modal-header {
    flex-shrink: 0;
  }
  
  .recipient-search {
    flex-shrink: 0;
    padding: 16px 20px 0;
    
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
  
  .selected-section {
    flex-shrink: 0;
    padding: 16px 20px 12px;
    border-bottom: 1px solid #eee;
    max-height: 160px;
    
    .selected-title {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .selected-list {
      height: 100px;
      
      view {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px 0;
      }
      
      .selected-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #e6f7ff;
        color: #007aff;
        border-radius: 16px;
        padding: 4px 8px;
        font-size: 12px;
        margin: 2px 4px 2px 0;
        min-width: 80px;
        
        .selected-name {
          flex: 1;
          text-align: left;
        }
        
        .remove-btn {
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin-left: 4px;
        }
      }
    }
  }
  
  .modal-body {
    flex: 1;
    min-height: 0;
    padding: 20px;
    display: flex;
    flex-direction: column;
    
    .select-all-section {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
      
      .select-all-btn {
        display: flex;
        align-items: center;
        
        .checkbox {
          font-size: 16px;
          margin-right: 8px;
          color: #007aff;
        }
        
        .select-all-text {
          font-size: 14px;
          color: #007aff;
        }
      }
      
      .count-text {
        font-size: 12px;
        color: #999;
      }
    }
    
    .recipient-scroll {
      flex: 1;
      min-height: 300px;
      
      .recipient-item {
        display: flex;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #f5f5f5;
        
        &.selected {
          background: #f0f8ff;
        }
        
        .recipient-checkbox {
          font-size: 16px;
          margin-right: 12px;
          color: #007aff;
        }
        
        .recipient-info {
          flex: 1;
          
          .recipient-name {
            font-size: 14px;
            color: #333;
            line-height: 1.4;
          }
        }
      }
      
      .load-more {
        padding: 20px 0;
        text-align: center;
        
        .no-result {
          font-size: 14px;
          color: #999;
        }
      }
    }
  }
  
  .modal-footer {
    flex-shrink: 0;
    background-color: #fff;
    border-top: 1px solid #eee;
  }
}

.back-arrow {
  color: #007aff;
  font-size: 22px;
  font-weight: bold;
  margin-right: 8rpx;
  vertical-align: middle;
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