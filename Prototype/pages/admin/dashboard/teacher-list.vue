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
        <text class="stat-number">{{totalWorkload}}</text>
        <text class="stat-label">总工作量</text>
      </view>
    </view>

    <!-- 老师列表 -->
    <scroll-view class="teacher-list" scroll-y="true">
      <view 
        class="teacher-item" 
        v-for="teacher in filteredTeachers" 
        :key="teacher.id"
        @click="viewTeacherDetail(teacher)"
      >
        <view class="teacher-info">
          <view class="teacher-header">
            <text class="teacher-name">{{teacher.name}}</text>
            <view class="status-badge" :class="teacher.status">
              <text class="status-text">{{getStatusText(teacher.status)}}</text>
            </view>
          </view>
          <view class="teacher-details">
            <text class="teacher-title">{{teacher.title}}</text>
          </view>
          <view class="teacher-research">
            <text class="research-label">研究方向：</text>
            <text class="research-areas">{{teacher.researchAreas.join('、')}}</text>
          </view>
        </view>
        <view class="teacher-actions">
          <view class="action-btn" @click.stop="sendReminder(teacher)">
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

    <!-- 老师详情弹窗 -->
    <view class="detail-modal-overlay" v-if="showDetailModal" @click="closeDetailModal">
      <view class="detail-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">老师详情</text>
          <view class="close-btn" @click="closeDetailModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <view class="modal-body" v-if="selectedTeacher">
          <view class="detail-section">
            <view class="detail-row">
              <text class="detail-label">姓名：</text>
              <text class="detail-value">{{selectedTeacher.name}}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">职称：</text>
              <text class="detail-value">{{selectedTeacher.title}}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">邮箱：</text>
              <text class="detail-value">{{selectedTeacher.email}}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">电话：</text>
              <text class="detail-value">{{selectedTeacher.phone}}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">状态：</text>
              <view class="status-badge" :class="selectedTeacher.status">
                <text class="status-text">{{getStatusText(selectedTeacher.status)}}</text>
              </view>
            </view>
          </view>
          
          <view class="detail-section">
            <text class="section-title">研究方向</text>
            <view class="research-tags">
              <view class="research-tag" v-for="area in selectedTeacher.researchAreas" :key="area">
                <text class="tag-text">{{area}}</text>
              </view>
            </view>
          </view>
          
          <view class="detail-section">
            <text class="section-title">评审信息</text>
            <view class="review-info">
              <view class="info-item">
                <text class="info-label">确认时间：</text>
                <text class="info-value">{{selectedTeacher.confirmTime || '未确认'}}</text>
              </view>
              <view class="info-item">
                <text class="info-label">备注：</text>
                <text class="info-value">{{selectedTeacher.notes || '无'}}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="button-row">
            <view class="btn btn-secondary" @click="closeDetailModal">
              <text class="btn-text">关闭</text>
            </view>
          </view>
        </view>
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
            <input class="search-input" v-model="addSearchKeyword" placeholder="搜索老师姓名/研究方向/院系" />
            <view class="clear-btn" v-if="addSearchKeyword" @click="addSearchKeyword = ''">
              <text class="clear-icon">×</text>
            </view>
          </view>
          <scroll-view class="add-list" scroll-y="true">
            <view v-for="teacher in filteredAddTeachers" :key="teacher.id" class="add-teacher-item">
              <view class="add-info">
                <text class="add-name">{{teacher.name}}</text>
                <text class="add-title">{{teacher.title}}</text>
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
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const searchKeyword = ref('')
const activeFilter = ref('all')
const showDetailModal = ref(false)
const selectedTeacher = ref(null)
const showAddModal = ref(false)
const addSearchKeyword = ref('')

// 模拟老师数据
const teacherList = ref([
  {
    id: 1,
    name: '张教授',
    title: '教授',
    department: '计算机科学与技术学院',
    email: 'zhang@nottingham.edu.cn',
    phone: '13800138001',
    researchAreas: ['人工智能', '机器学习', '数据挖掘'],
    workload: 8,
    status: 'confirmed',
    confirmTime: '2025/01/15 14:30',
    notes: '经验丰富，评审质量高'
  },
  {
    id: 2,
    name: '李副教授',
    title: '副教授',
    department: '电子工程学院',
    email: 'li@nottingham.edu.cn',
    phone: '13800138002',
    researchAreas: ['通信工程', '信号处理'],
    workload: 6,
    status: 'pending',
    confirmTime: null,
    notes: ''
  },
  {
    id: 3,
    name: '王教授',
    title: '教授',
    department: '机械工程学院',
    email: 'wang@nottingham.edu.cn',
    phone: '13800138003',
    researchAreas: ['机械设计', '智能制造'],
    workload: 10,
    status: 'confirmed',
    confirmTime: '2025/01/16 09:15',
    notes: '评审严格，建议增加工作量'
  },
  {
    id: 4,
    name: '陈副教授',
    title: '副教授',
    department: '化学工程学院',
    email: 'chen@nottingham.edu.cn',
    phone: '13800138004',
    researchAreas: ['化学工程', '材料科学'],
    workload: 5,
    status: 'pending',
    confirmTime: null,
    notes: ''
  },
  {
    id: 5,
    name: '刘教授',
    title: '教授',
    department: '商学院',
    email: 'liu@nottingham.edu.cn',
    phone: '13800138005',
    researchAreas: ['管理学', '市场营销'],
    workload: 7,
    status: 'confirmed',
    confirmTime: '2025/01/14 16:45',
    notes: '评审经验丰富'
  }
])

// 模拟所有老师数据库
const allTeachers = ref([
  { id: 1, name: '张教授', title: '教授', department: '计算机科学与技术学院', researchAreas: ['人工智能', '机器学习', '数据挖掘'] },
  { id: 2, name: '李副教授', title: '副教授', department: '电子工程学院', researchAreas: ['通信工程', '信号处理'] },
  { id: 3, name: '王教授', title: '教授', department: '机械工程学院', researchAreas: ['机械设计', '智能制造'] },
  { id: 4, name: '陈副教授', title: '副教授', department: '化学工程学院', researchAreas: ['化学工程', '材料科学'] },
  { id: 5, name: '刘教授', title: '教授', department: '商学院', researchAreas: ['管理学', '市场营销'] },
  { id: 6, name: '赵讲师', title: '讲师', department: '外国语学院', researchAreas: ['英语教学', '跨文化交流'] },
  { id: 7, name: '钱助理教授', title: '助理教授', department: '数学学院', researchAreas: ['应用数学', '概率论'] },
  { id: 8, name: '孙讲师', title: '讲师', department: '物理学院', researchAreas: ['理论物理', '量子力学'] }
])

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
      teacher.researchAreas.some(area => area.toLowerCase().includes(keyword)) ||
      teacher.department.toLowerCase().includes(keyword)
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

const totalWorkload = computed(() => 
  teacherList.value.reduce((sum, teacher) => sum + teacher.workload, 0)
)

const filteredAddTeachers = computed(() => {
  let filtered = allTeachers.value
  if (addSearchKeyword.value.trim()) {
    const keyword = addSearchKeyword.value.toLowerCase()
    filtered = filtered.filter(teacher =>
      teacher.name.toLowerCase().includes(keyword) ||
      teacher.title.toLowerCase().includes(keyword) ||
      teacher.department.toLowerCase().includes(keyword) ||
      teacher.researchAreas.some(area => area.toLowerCase().includes(keyword))
    )
  }
  return filtered
})

const isInCurrentList = (teacher) => {
  return teacherList.value.some(t => t.id === teacher.id)
}

// 方法
const goBack = () => {
  uni.navigateBack()
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
    pending: '待确认'
  }
  return statusMap[status] || status
}

const viewTeacherDetail = (teacher) => {
  selectedTeacher.value = teacher
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedTeacher.value = null
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
    // 可补充完整信息
    teacherList.value.push({
      ...teacher,
      email: teacher.email || '',
      phone: teacher.phone || '',
      workload: teacher.workload || 1,
      status: 'pending',
      confirmTime: null,
      notes: ''
    })
    uni.showToast({ title: '已添加', icon: 'success' })
  }
}

onMounted(() => {
  // 页面加载时的初始化逻辑
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
}

/* 顶部导航栏 */
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
  padding: 0 18rpx;
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
  background: #fff;
  padding: 12rpx 16rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8rpx;
  padding: 0 10rpx;
  margin-bottom: 12rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #999;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  height: 48rpx;
  font-size: 24rpx;
  color: #333;
}

.clear-btn {
  width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border-radius: 50%;
  margin-left: 8rpx;
}

.clear-icon {
  font-size: 24rpx;
  color: #666;
}

.filter-tabs {
  display: flex;
  gap: 8rpx;
}

.filter-tab {
  flex: 1;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 1rpx solid transparent;
  transition: all 0.2s ease;
}

.filter-tab.active {
  background: #4f46e5;
  border-color: #4f46e5;
}

.tab-text {
  font-size: 22rpx;
  color: #666;
  font-weight: 500;
}

.filter-tab.active .tab-text {
  color: #fff;
}

/* 统计信息 */
.stats-section {
  display: flex;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  background: #fff;
  border-bottom: 1rpx solid #e5e5e5;
}

.stat-card {
  flex: 1;
  background: #f8f9fa;
  border-radius: 8rpx;
  padding: 12rpx 8rpx;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 22rpx;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 18rpx;
  color: #666;
}

/* 老师列表 */
.teacher-list {
  flex: 1;
  padding: 12rpx 8rpx;
  max-width: 100%;
  box-sizing: border-box;
}

.teacher-item {
  background: #fff;
  border-radius: 8rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  box-shadow: none;
  border: 1rpx solid #eee;
  max-width: 100%;
  box-sizing: border-box;
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
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180rpx;
  display: inline-block;
  vertical-align: bottom;
}

.status-badge {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.status-badge.confirmed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-text {
  font-size: 20rpx;
}

.teacher-details {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.teacher-title {
  font-size: 22rpx;
  color: #4f46e5;
  background: #f0f0ff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120rpx;
  display: inline-block;
}

.teacher-research {
  margin-bottom: 6rpx;
}

.research-label {
  font-size: 22rpx;
  color: #666;
  display: inline;
  vertical-align: baseline;
}

.research-areas {
  font-size: 22rpx;
  color: #333;
  word-break: break-all;
  white-space: normal;
  display: inline;
  vertical-align: baseline;
}

.teacher-actions {
  display: flex;
  flex-direction: row;
  gap: 4rpx;
}

.action-btn {
  width: 32rpx;
  height: 32rpx;
  background: #f8f9fa;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: none;
}

.action-icon {
  font-size: 16rpx;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40rpx 0;
}

.empty-icon {
  font-size: 40rpx;
  margin-bottom: 12rpx;
  display: block;
}

.empty-text {
  font-size: 18rpx;
  color: #999;
}

/* 底部操作栏 */
.bottom-actions {
  background: #fff;
  padding: 12rpx 16rpx 16rpx 16rpx;
  border-top: 1rpx solid #e5e5e5;
  display: flex;
  gap: 8rpx;
}

.action-button {
  flex: 1;
  height: 48rpx;
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  transition: none;
}

.action-button.primary {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

.action-button-icon {
  font-size: 16rpx;
}

.action-button-text {
  font-size: 18rpx;
  font-weight: 500;
}

.action-button .action-button-text {
  color: #666;
}

.action-button.primary .action-button-text {
  color: #fff;
}

/* 详情弹窗 */
.detail-modal-overlay {
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
}

.detail-modal {
  background: #ffffff;
  border-radius: 20rpx;
  width: 100%;
  max-width: 640rpx;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
}

.close-icon {
  font-size: 28rpx;
  color: #666;
}

.modal-body {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
  width: 120rpx;
  flex-shrink: 0;
}

.detail-value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
}

.research-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.research-tag {
  background: #f0f0ff;
  border: 1rpx solid #e0e0ff;
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
}

.tag-text {
  font-size: 24rpx;
  color: #4f46e5;
}

.review-info {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 24rpx;
  color: #666;
  width: 140rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
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
  font-weight: 500;
}

.btn-secondary {
  background: #ffffff;
  border: 2rpx solid #e9ecef;
}

.btn-secondary .btn-text {
  color: #666;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary .btn-text {
  color: #ffffff;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 500;
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
.add-title, .add-areas {
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
</style> 