<template>
  <view class="teacher-list-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">本次参与老师</text>
      <view class="nav-right">
        <view class="add-btn" @click="showAddModal = true">
          <text class="add-icon">＋</text>
          <text class="add-text">添加</text>
        </view>
      </view>
    </view>

    <!-- 搜索和筛选区域 -->
    <view class="search-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索老师姓名或研究方向"
          v-model="searchKeyword"
          @input="handleSearch"
        />
        <view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
          <text class="clear-icon">×</text>
        </view>
      </view>
      
      <view class="filter-tabs">
        <view 
          class="filter-tab" 
          :class="{ active: activeFilter === 'all' }"
          @click="setFilter('all')"
        >
          <text class="tab-text">全部</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: activeFilter === 'confirmed' }"
          @click="setFilter('confirmed')"
        >
          <text class="tab-text">已确认</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: activeFilter === 'pending' }"
          @click="setFilter('pending')"
        >
          <text class="tab-text">待确认</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: activeFilter === 'assigned' }"
          @click="setFilter('assigned')"
        >
          <text class="tab-text">已分配</text>
        </view>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-number">{{confirmedCount}}</text>
        <text class="stat-label">已确认</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{pendingCount}}</text>
        <text class="stat-label">待确认</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{assignedCount}}</text>
        <text class="stat-label">已分配</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{totalWorkload}}</text>
        <text class="stat-label">总工作量</text>
      </view>
    </view>

    <!-- 截止时间提醒 -->
    <view class="deadline-notice" v-if="!isAfterDeadline">
      <view class="notice-content">
        <text class="notice-icon">⏰</text>
        <text class="notice-text">截止时间：{{deadlineValue}}</text>
        <text class="countdown-text">{{getCountdownText()}}</text>
      </view>
    </view>

    <view class="deadline-notice expired" v-else>
      <view class="notice-content">
        <text class="notice-icon">🔒</text>
        <text class="notice-text">截止时间已过，系统已自动分配时间段</text>
      </view>
    </view>

    <!-- 老师列表 -->
    <scroll-view class="teacher-list" scroll-y="true">
      <view 
        class="teacher-item" 
        v-for="teacher in filteredTeachers" 
        :key="teacher.id"
        @click="handleTeacherClick(teacher)"
      >
        <view class="teacher-info">
          <view class="teacher-header">
            <text class="teacher-name">{{teacher.name}}</text>
            <view class="status-badge" :class="teacher.status">
              <text class="status-text">{{getStatusText(teacher.status)}}</text>
            </view>
          </view>
          <view class="teacher-research">
            <text class="research-label">研究方向：</text>
            <text class="research-areas">{{teacher.researchAreas.join('、')}}</text>
          </view>
          
          <!-- 根据状态显示不同的时间信息 -->
          <view class="teacher-time-info" v-if="teacher.status === 'confirmed' || teacher.status === 'assigned'">
            <text class="time-label">选择时间段：</text>
            <text class="time-count">{{getSelectedTimeCount(teacher.id)}} / {{totalAvailableSlots}} 个</text>
          </view>
          
          <view class="teacher-time-info" v-else-if="teacher.status === 'pending'">
            <text class="time-label">状态：</text>
            <text class="time-status pending">等待老师选择时间段</text>
          </view>
        </view>
        <view class="teacher-actions">
          <view class="action-btn" v-if="teacher.status === 'pending'" @click.stop="sendReminder(teacher)">
            <text class="action-icon">📢</text>
          </view>
          <view class="action-btn" @click.stop="deleteTeacher(teacher)">
            <text class="action-icon">🗑️</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredTeachers.length === 0">
        <text class="empty-icon">👥</text>
        <text class="empty-text">暂无符合条件的老师</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-button" @click="exportTeacherList">
        <text class="action-button-icon">📊</text>
        <text class="action-button-text">导出名单</text>
      </view>
      <view class="action-button primary" @click="sendBatchReminder">
        <text class="action-button-icon">📢</text>
        <text class="action-button-text">批量提醒</text>
      </view>
    </view>

    <!-- 添加老师弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <view class="add-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加老师</text>
          <view class="close-btn" @click="showAddModal = false">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="search-box">
            <text class="search-icon">🔍</text>
            <input class="search-input" v-model="addSearchKeyword" placeholder="搜索老师姓名或研究方向" />
            <view class="clear-btn" v-if="addSearchKeyword" @click="addSearchKeyword = ''">
              <text class="clear-icon">×</text>
            </view>
          </view>
          <scroll-view class="add-list" scroll-y="true">
            <view v-for="teacher in filteredAddTeachers" :key="teacher.id" class="add-teacher-item">
              <view class="add-info">
                <text class="add-name">{{teacher.name}}</text>
                <text class="add-areas">{{teacher.researchAreas.join('、')}}</text>
              </view>
              <view class="add-action">
                <button 
                  :disabled="isInCurrentList(teacher)" 
                  class="add-btn-inner" 
                  @click="addTeacherToList(teacher)">
                  {{ isInCurrentList(teacher) ? '已添加' : '添加' }}
                </button>
              </view>
            </view>
            <view v-if="filteredAddTeachers.length === 0" class="empty-state">
              <text class="empty-text">暂无符合条件的老师</text>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <!-- 时间选择弹窗 -->
    <view v-if="showTimeModal" class="modal-overlay" @click="closeTimeModal">
      <view class="time-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">设置 {{currentEditTeacher?.name}} 的可选时间</text>
          <view class="close-btn" @click="closeTimeModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <view class="modal-body">
          <!-- 状态提示 -->
          <view class="status-notice" v-if="currentEditTeacher?.status === 'assigned'">
            <text class="status-notice-text">此老师的时间段已由系统自动分配</text>
          </view>
          
          <!-- 时间选择区域 -->
          <view class="time-selection-area">
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
                    :class="{ active: isSlotSelected(timeConfig[dayKey].date, 'morning', slot.id) }"
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
                    :class="{ active: isSlotSelected(timeConfig[dayKey].date, 'afternoon', slot.id) }"
                    @click="toggleTimeSlot(timeConfig[dayKey].date, 'afternoon', slot.id)"
                  >
                    <text class="slot-text">{{ slot.time }}</text>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 选择统计 -->
            <view class="selection-summary">
              <text class="summary-text">已选择: {{ currentSelectedSlots.length }} / {{ totalAvailableSlots }} 个时间段</text>
              <text class="summary-note">点击时间段进行选择或取消</text>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeTimeModal">取消</button>
          <button class="confirm-btn" @click="saveTimeSelection">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const searchKeyword = ref('')
const activeFilter = ref('all')
const showAddModal = ref(false)
const addSearchKeyword = ref('')
const showTimeModal = ref(false)
const currentEditTeacher = ref(null)
const currentSelectedSlots = ref([])

// 截止时间数据（从dashboard获取，这里模拟）
const deadlineValue = ref('2025年8月27日 00:00')

// 时间配置数据（从schedule.vue复制）
const timeConfig = ref({
  day1: {
    date: '2025/07/01',
    displayDate: '2025/07/01周二',
    morning: {
      startTime: '08:00',
      endTime: '12:00',
      slotDuration: 45,
      slotInterval: 15
    },
    afternoon: {
      startTime: '14:00', 
      endTime: '17:00',
      slotDuration: 45,
      slotInterval: 15
    }
  },
  day2: {
    date: '2025/07/02',
    displayDate: '2025/07/02周三',
    afternoon: {
      startTime: '13:00',
      endTime: '18:00', 
      slotDuration: 45,
      slotInterval: 15
    }
  },
  day3: {
    date: '2025/07/03',
    displayDate: '2025/07/03周四',
    morning: {
      startTime: '09:30',
      endTime: '11:30',
      slotDuration: 45,
      slotInterval: 15
    },
    afternoon: {
      startTime: '15:00',
      endTime: '17:00',
      slotDuration: 45, 
      slotInterval: 15
    }
  }
})

// 模拟老师数据（添加可选时间字段）
const teacherList = ref([
  {
    id: 1,
    name: '张教授',
    researchAreas: ['人工智能', '机器学习', '数据挖掘'],
    workload: 8,
    status: 'confirmed',
    confirmTime: '2025/01/15 14:30',
    selectedTimeSlots: [
      '2025/07/01-morning-1', '2025/07/01-morning-2', '2025/07/01-afternoon-1',
      '2025/07/02-afternoon-1', '2025/07/02-afternoon-2',
      '2025/07/03-morning-1', '2025/07/03-afternoon-1'
    ]
  },
  {
    id: 2,
    name: '李副教授',
    researchAreas: ['通信工程', '信号处理'],
    workload: 6,
    status: 'pending',
    confirmTime: null,
    selectedTimeSlots: [] // 待确认老师暂无选择时间段
  },
  {
    id: 3,
    name: '王教授',
    researchAreas: ['机械设计', '智能制造'],
    workload: 10,
    status: 'confirmed',
    confirmTime: '2025/01/16 09:15',
    selectedTimeSlots: [
      '2025/07/01-morning-1', '2025/07/01-morning-2', '2025/07/01-morning-3',
      '2025/07/01-afternoon-1', '2025/07/01-afternoon-2', '2025/07/01-afternoon-3',
      '2025/07/02-afternoon-1', '2025/07/02-afternoon-2', '2025/07/02-afternoon-3',
      '2025/07/03-morning-1', '2025/07/03-morning-2', '2025/07/03-afternoon-1'
    ]
  },
  {
    id: 4,
    name: '陈副教授',
    researchAreas: ['化学工程', '材料科学'],
    workload: 5,
    status: 'pending',
    confirmTime: null,
    selectedTimeSlots: [] // 待确认老师暂无选择时间段
  },
  {
    id: 5,
    name: '刘教授',
    researchAreas: ['管理学', '市场营销'],
    workload: 7,
    status: 'confirmed',
    confirmTime: '2025/01/14 16:45',
    selectedTimeSlots: [
      '2025/07/01-morning-2', '2025/07/01-afternoon-2',
      '2025/07/02-afternoon-1', '2025/07/02-afternoon-3',
      '2025/07/03-morning-1', '2025/07/03-afternoon-1'
    ]
  },
  {
    id: 6,
    name: '白教授',
    researchAreas: ['管理学', '市场营销'],
    workload: 7,
    status: 'confirmed',
    confirmTime: '2025/01/14 16:45',
    selectedTimeSlots: [
      '2025/07/01-morning-2', '2025/07/01-afternoon-2',
      '2025/07/02-afternoon-1', '2025/07/02-afternoon-3',
      '2025/07/03-morning-1', '2025/07/03-afternoon-1'
    ]
  },
  {
    id: 7,
    name: '程教授',
    researchAreas: ['管理学', '市场营销'],
    workload: 7,
    status: 'confirmed',
    confirmTime: '2025/01/14 16:45',
    selectedTimeSlots: [
      '2025/07/01-morning-2', '2025/07/01-afternoon-2',
      '2025/07/02-afternoon-1', '2025/07/02-afternoon-3',
      '2025/07/03-morning-1', '2025/07/03-afternoon-1'
    ]
  }
])

// 模拟所有老师数据库
const allTeachers = ref([
  { id: 1, name: '张教授', researchAreas: ['人工智能', '机器学习', '数据挖掘'] },
  { id: 2, name: '李副教授', researchAreas: ['通信工程', '信号处理'] },
  { id: 3, name: '王教授', researchAreas: ['机械设计', '智能制造'] },
  { id: 4, name: '陈副教授', researchAreas: ['化学工程', '材料科学'] },
  { id: 5, name: '刘教授', researchAreas: ['管理学', '市场营销'] },
  { id: 6, name: '赵讲师', researchAreas: ['英语教学', '跨文化交流'] },
  { id: 7, name: '钱助理教授', researchAreas: ['应用数学', '概率论'] },
  { id: 8, name: '孙讲师', researchAreas: ['理论物理', '量子力学'] },
  { id: 9, name: '黄讲师', researchAreas: ['理论物理', '量子力学'] },
  { id: 10, name: '王讲师', researchAreas: ['理论物理', '量子力学'] },
  { id: 11, name: '白讲师', researchAreas: ['理论物理', '量子力学'] },
  { id: 12, name: '程讲师', researchAreas: ['理论物理', '量子力学'] }
])

// 检查是否超过截止时间
const isAfterDeadline = computed(() => {
  const now = new Date()
  // 解析截止时间
  const match = deadlineValue.value.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{1,2})/)
  if (!match) return false
  
  const [_, year, month, day, hour, minute] = match
  const deadline = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
  
  return now > deadline
})

// 获取倒计时文本
const getCountdownText = () => {
  if (isAfterDeadline.value) return ''
  
  const now = new Date()
  const match = deadlineValue.value.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{1,2})/)
  if (!match) return ''
  
  const [_, year, month, day, hour, minute] = match
  const deadline = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
  
  const diff = deadline - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `还剩 ${days} 天 ${hours} 小时`
  } else if (hours > 0) {
    return `还剩 ${hours} 小时`
  } else {
    return '即将到期'
  }
}

// 生成所有时间段
const generateAllTimeSlots = () => {
  const allSlots = []
  dateKeys.value.forEach(dayKey => {
    const day = timeConfig.value[dayKey]
    if (day.morning) {
      const morningSlots = getTimeSlotsForDay(dayKey, 'morning')
      morningSlots.forEach(slot => {
        allSlots.push(`${day.date}-morning-${slot.id}`)
      })
    }
    if (day.afternoon) {
      const afternoonSlots = getTimeSlotsForDay(dayKey, 'afternoon')
      afternoonSlots.forEach(slot => {
        allSlots.push(`${day.date}-afternoon-${slot.id}`)
      })
    }
  })
  return allSlots
}

// 自动处理超期的待确认老师
const processOverdueTeachers = () => {
  if (isAfterDeadline.value) {
    const allTimeSlots = generateAllTimeSlots()
    teacherList.value.forEach(teacher => {
      if (teacher.status === 'pending') {
        teacher.status = 'assigned'
        teacher.selectedTimeSlots = [...allTimeSlots]
        teacher.confirmTime = new Date().toLocaleString()
      }
    })
  }
}

// 计算属性
const filteredTeachers = computed(() => {
  let filtered = teacherList.value

  // 按状态筛选
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(teacher => teacher.status === activeFilter.value)
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(teacher => 
      teacher.name.toLowerCase().includes(keyword) ||
      teacher.researchAreas.some(area => area.toLowerCase().includes(keyword)) 
    )
  }

  return filtered
})

const confirmedCount = computed(() => 
  teacherList.value.filter(teacher => teacher.status === 'confirmed').length
)

const pendingCount = computed(() => 
  teacherList.value.filter(teacher => teacher.status === 'pending').length
)

const assignedCount = computed(() => 
  teacherList.value.filter(teacher => teacher.status === 'assigned').length
)

const totalWorkload = computed(() => 
  teacherList.value.reduce((sum, teacher) => sum + teacher.workload, 0)
)

const filteredAddTeachers = computed(() => {
  let filtered = allTeachers.value
  if (addSearchKeyword.value.trim()) {
    const keyword = addSearchKeyword.value.toLowerCase()
    filtered = filtered.filter(teacher =>
      teacher.name.toLowerCase().includes(keyword) ||
      teacher.researchAreas.some(area => area.toLowerCase().includes(keyword))
    )
  }
  return filtered
})

const isInCurrentList = (teacher) => {
  return teacherList.value.some(t => t.id === teacher.id)
}

// 获取日期键数组
const dateKeys = computed(() => {
  return Object.keys(timeConfig.value)
})

// 计算总可用时间段数
const totalAvailableSlots = computed(() => {
  let total = 0
  dateKeys.value.forEach(dayKey => {
    const day = timeConfig.value[dayKey]
    if (day.morning) {
      total += getTimeSlotsForDay(dayKey, 'morning').length
    }
    if (day.afternoon) {
      total += getTimeSlotsForDay(dayKey, 'afternoon').length
    }
  })
  return total
})

// 时间相关方法
const generateTimeSlots = (startTime, endTime, slotDuration, interval) => {
  const slots = []
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  let currentTime = startHour * 60 + startMin
  const endTimeMin = endHour * 60 + endMin
  let slotId = 1
  
  while (currentTime + slotDuration <= endTimeMin) {
    const startH = Math.floor(currentTime / 60)
    const startM = currentTime % 60
    const endTimeSlot = currentTime + slotDuration
    const endH = Math.floor(endTimeSlot / 60)
    const endM = endTimeSlot % 60
    
    slots.push({
      id: slotId++,
      time: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}-${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
    })
    
    currentTime += interval
  }
  
  return slots
}

const getTimeSlotsForDay = (dayKey, period) => {
  const day = timeConfig.value[dayKey]
  if (!day || !day[period]) return []
  
  const { startTime, endTime, slotDuration, slotInterval } = day[period]
  return generateTimeSlots(startTime, endTime, slotDuration, slotInterval)
}

// 获取老师的已选时间段数量
const getSelectedTimeCount = (teacherId) => {
  const teacher = teacherList.value.find(t => t.id === teacherId)
  return teacher ? teacher.selectedTimeSlots.length : 0
}

// 处理老师点击事件
const handleTeacherClick = (teacher) => {
  // 如果是待确认状态且未超过截止时间，不允许打开时间选择
  if (teacher.status === 'pending' && !isAfterDeadline.value) {
    uni.showToast({
      title: '该老师尚未确认参与',
      icon: 'none'
    })
    return
  }
  
  // 其他情况正常打开时间选择模态框
  openTimeSelectionModal(teacher)
}

// 打开时间选择模态框
const openTimeSelectionModal = (teacher) => {
  currentEditTeacher.value = teacher
  currentSelectedSlots.value = [...teacher.selectedTimeSlots]
  showTimeModal.value = true
}

// 关闭时间选择模态框
const closeTimeModal = () => {
  showTimeModal.value = false
  currentEditTeacher.value = null
  currentSelectedSlots.value = []
}

// 检查时间段是否被选中
const isSlotSelected = (date, period, slotId) => {
  const slotKey = `${date}-${period}-${slotId}`
  return currentSelectedSlots.value.includes(slotKey)
}

// 切换时间段选择
const toggleTimeSlot = (date, period, slotId) => {
  const slotKey = `${date}-${period}-${slotId}`
  const index = currentSelectedSlots.value.indexOf(slotKey)
  
  if (index > -1) {
    currentSelectedSlots.value.splice(index, 1)
  } else {
    currentSelectedSlots.value.push(slotKey)
  }
}

// 保存时间选择
const saveTimeSelection = () => {
  if (currentEditTeacher.value) {
    const teacherIndex = teacherList.value.findIndex(t => t.id === currentEditTeacher.value.id)
    if (teacherIndex > -1) {
      teacherList.value[teacherIndex].selectedTimeSlots = [...currentSelectedSlots.value]
    }
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  }
  
  closeTimeModal()
}

// 原有方法
const goBack = () => {
  uni.navigateTo({
    url: '/pages/admin/dashboard/dashboard',
    fail: () => {
      uni.reLaunch({
        url: '/pages/admin/dashboard/dashboard'
      })
    }
  })
}

const handleSearch = (e) => {
  searchKeyword.value = e.detail.value
}

const clearSearch = () => {
  searchKeyword.value = ''
}

const setFilter = (filter) => {
  activeFilter.value = filter
}

const getStatusText = (status) => {
  const statusMap = {
    confirmed: '已确认',
    pending: '待确认',
    assigned: '已分配'
  }
  return statusMap[status] || status
}

const sendReminder = (teacher) => {
  uni.showModal({
    title: '发送提醒',
    content: `确定要向${teacher.name}发送时间选择提醒吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '提醒已发送',
          icon: 'success'
        })
      }
    }
  })
}

const deleteTeacher = (teacher) => {
  uni.showModal({
    title: '删除老师',
    content: `确定要删除${teacher.name}吗？`,
    success: (res) => {
      if (res.confirm) {
        teacherList.value = teacherList.value.filter(t => t.id !== teacher.id)
        uni.showToast({
          title: '已删除',
          icon: 'success'
        })
      }
    }
  })
}

const exportTeacherList = () => {
  uni.showToast({
    title: '导出功能开发中',
    icon: 'none'
  })
}

const sendBatchReminder = () => {
  const pendingTeachers = teacherList.value.filter(teacher => teacher.status === 'pending')
  if (pendingTeachers.length === 0) {
    uni.showToast({
      title: '没有待确认的老师',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '批量提醒',
    content: `确定要向${pendingTeachers.length}位待确认的老师发送提醒吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '批量提醒已发送',
          icon: 'success'
        })
      }
    }
  })
}

const addTeacherToList = (teacher) => {
  if (!isInCurrentList(teacher)) {
    teacherList.value.push({
      ...teacher,
      workload: teacher.workload || 1,
      status: 'pending',
      confirmTime: null,
      selectedTimeSlots: [] // 新添加的老师默认没有选择时间
    })
    uni.showToast({ title: '已添加', icon: 'success' })
  }
}

onMounted(() => {
  // 页面加载时处理超期老师
  processOverdueTeachers()
  
  // 设置定时器定期检查截止时间（可选）
  setInterval(() => {
    processOverdueTeachers()
  }, 60000) // 每分钟检查一次
})
</script>

<style scoped>
.teacher-list-container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* 导航栏 */
.nav-bar {
  height: 88rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.5rpx;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.back-icon {
  font-size: 32rpx;
  color: #4f46e5;
}

.back-text {
  font-size: 28rpx;
  color: #4f46e5;
}

.nav-right {
  display: flex;
  align-items: center;
}

.add-btn {
  display: flex;
  align-items: center;
  background: #4f46e5;
  color: #fff;
  border-radius: 8rpx;
  padding: 6rpx 18rpx;
  height: 44rpx;
  font-size: 24rpx;
  cursor: pointer;
}

.add-icon {
  font-size: 28rpx;
  margin-right: 4rpx;
}

.add-text {
  font-size: 24rpx;
}

/* 搜索区域 */
.search-section {
  background: #ffffff;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 0 20rpx;
  margin-bottom: 24rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #999;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  height: 80rpx;
  font-size: 28rpx;
  color: #333;
}

.clear-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border-radius: 50%;
  margin-left: 16rpx;
}

.clear-icon {
  font-size: 24rpx;
  color: #666;
}

.filter-tabs {
  display: flex;
  gap: 12rpx;
}

.filter-tab {
  flex: 1;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 1rpx solid transparent;
  transition: all 0.2s ease;
}

.filter-tab.active {
  background: #4f46e5;
  border-color: #4f46e5;
}

.tab-text {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.filter-tab.active .tab-text {
  color: #fff;
}

/* 统计信息 */
.stats-section {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  background: #fff;
  border-bottom: 1rpx solid #e5e5e5;
}

.stat-card {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx 16rpx;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

/* 截止时间提醒 */
.deadline-notice {
  background: #fff3cd;
  border: 1rpx solid #ffeaa7;
  margin: 24rpx 32rpx;
  border-radius: 12rpx;
  padding: 16rpx;
}

.deadline-notice.expired {
  background: #f8d7da;
  border-color: #f5c6cb;
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-wrap: wrap;
}

.notice-icon {
  font-size: 24rpx;
}

.notice-text {
  font-size: 24rpx;
  color: #856404;
  flex: 1;
}

.deadline-notice.expired .notice-text {
  color: #721c24;
}

.countdown-text {
  font-size: 22rpx;
  color: #856404;
  font-weight: 600;
}

/* 老师列表 */
.teacher-list {
  flex: 1;
  padding: 24rpx 16rpx;
  max-width: 100%;
  box-sizing: border-box;
}

.teacher-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  box-shadow: none;
  border: 1rpx solid #eee;
  max-width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease;
}

.teacher-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
  background: #f8f9fa;
}

.teacher-info {
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.teacher-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.teacher-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160rpx;
  display: inline-block;
}

.status-badge {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  padding: 0rpx 10rpx;
  font-size: 20rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-badge.confirmed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.assigned {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-text {
  font-size: 18rpx;
  text-align: center;
  line-height: 1;
}

.teacher-research {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8rpx;
}

.research-label {
  font-size: 20rpx;
  color: #666;
  flex-shrink: 0;
}

.research-areas {
  font-size: 20rpx;
  color: #333;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
  margin-left: 0;
}

.teacher-time-info {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.time-label {
  font-size: 20rpx;
  color: #666;
  flex-shrink: 0;
}

.time-count {
  font-size: 20rpx;
  color: #4f46e5;
  font-weight: 600;
  margin-left: 0;
}

.time-status {
  font-size: 20rpx;
  margin-left: 0;
}

.time-status.pending {
  color: #f59e0b;
  font-weight: 500;
}

.teacher-actions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.action-btn {
  width: 56rpx;
  height: 56rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:active {
  background: #e9ecef;
  transform: scale(0.95);
}

.action-icon {
  font-size: 24rpx;
}

/* 状态提示 */
.status-notice {
  background: #e3f2fd;
  border: 1rpx solid #bbdefb;
  border-radius: 8rpx;
  padding: 16rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.status-notice-text {
  font-size: 24rpx;
  color: #1565c0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
  display: block;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 底部操作栏 */
.bottom-actions {
  background: #ffffff;
  padding: 24rpx 32rpx 32rpx 32rpx;
  border-top: 1rpx solid #e5e5e5;
  display: flex;
  gap: 12rpx;
}

.action-button {
  flex: 1;
  height: 88rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.2s ease;
}

.action-button.primary {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
}

.action-button:active {
  transform: translateY(1rpx);
}

.action-button-icon {
  font-size: 24rpx;
}

.action-button-text {
  font-size: 26rpx;
  font-weight: 500;
}

.action-button .action-button-text {
  color: #666;
}

.action-button.primary .action-button-text {
  color: #ffffff;
}

/* 添加老师弹窗 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.add-modal {
  background: #fff;
  border-radius: 16rpx;
  width: 90vw;
  max-width: 600rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 24rpx 12rpx 24rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 28rpx;
  font-weight: 600;
}

.close-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
  cursor: pointer;
}

.close-icon {
  font-size: 24rpx;
  color: #888;
}

.modal-body {
  padding: 16rpx 24rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.add-list {
  flex: 1;
  min-height: 200rpx;
  max-height: 50vh;
}

.add-teacher-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.add-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.add-name {
  font-size: 24rpx;
  font-weight: 600;
}

.add-areas {
  font-size: 20rpx;
  color: #666;
  margin-right: 8rpx;
}

.add-action {
  margin-left: 12rpx;
}

.add-btn-inner {
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  padding: 6rpx 18rpx;
  font-size: 22rpx;
  cursor: pointer;
}

.add-btn-inner[disabled] {
  background: #ccc;
  color: #fff;
  cursor: not-allowed;
}

/* 时间选择弹窗 */
.time-modal {
  background: #fff;
  border-radius: 16rpx;
  width: 95vw;
  max-width: 800rpx;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.time-selection-area {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 24rpx;
}

.day-section {
  margin-bottom: 32rpx;
}

.day-header {
  text-align: center;
  margin-bottom: 24rpx;
}

.day-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d1d1f;
}

.time-period {
  margin-bottom: 24rpx;
}

.period-title {
  font-size: 24rpx;
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
  height: 64rpx;
  background: rgba(255, 255, 255, 0.8);
  border: 2rpx solid #E5E5EA;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-bottom: 12rpx;
  cursor: pointer;
}

.time-slot.active {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007AFF;
}

.slot-text {
  font-size: 20rpx;
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
  margin-top: 16rpx;
}

.summary-text {
  font-size: 24rpx;
  color: #007AFF;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.summary-note {
  font-size: 20rpx;
  color: #8E8E93;
  display: block;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  border-top: 1rpx solid #eee;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 1rpx solid #e9ecef;
}

.confirm-btn {
  background: #4f46e5;
  color: #fff;
}

.cancel-btn:active, .confirm-btn:active {
  transform: translateY(1rpx);
}
</style>