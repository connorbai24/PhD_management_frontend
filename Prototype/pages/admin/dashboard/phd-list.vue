<template>
  <view class="phd-list-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">本次参与博士生</text>
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
          placeholder="搜索博士生姓名或研究方向"
          v-model="searchKeyword"
          @input="handleSearch"
        />
        <view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
          <text class="clear-icon">×</text>
        </view>
      </view>
    </view>

    <!-- 统计信息 -->
    <!-- 彻底删除下方 stats-section 区域 -->
    <!--
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
        <text class="stat-number">{{rejectedCount}}</text>
        <text class="stat-label">已拒绝</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{totalResearchAreas}}</text>
        <text class="stat-label">研究方向</text>
      </view>
    </view>
    -->

    <!-- 博士生列表 -->
    <scroll-view class="phd-list" scroll-y="true">
      <view 
        class="phd-item" 
        v-for="phd in filteredPhds" 
        :key="phd.id"
        @click="viewPhdDetail(phd)"
      >
        <view class="phd-info">
          <view class="phd-header">
            <text class="phd-name">{{phd.name}}</text>
          </view>
          <view class="phd-details">
            <text class="phd-student-id">{{phd.studentId}}</text>
            <text class="phd-supervisor">导师：{{phd.supervisor}}</text>
          </view>
          <view class="phd-research">
            <text class="research-label">研究方向：</text>
            <text class="research-areas">{{phd.researchAreas.join('、')}}</text>
          </view>
        </view>
        <view class="phd-actions">
          <view class="action-btn" @click.stop="deletePhd(phd)">
            <text class="action-icon">🗑️</text>
          </view>
        </view>
      </view>
      <view class="empty-state" v-if="filteredPhds.length === 0">
        <text class="empty-icon">🎓</text>
        <text class="empty-text">暂无符合条件的博士生</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-button" @click="exportPhdList">
        <text class="action-button-icon">📊</text>
        <text class="action-button-text">导出名单</text>
      </view>
    </view>

    <!-- 博士生详情弹窗 -->
    <view class="detail-modal-overlay" v-if="showDetailModal" @click="closeDetailModal">
      <view class="detail-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">博士生详情</text>
          <view class="close-btn" @click="closeDetailModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <view class="modal-body" v-if="selectedPhd">
          <view class="detail-section">
            <view class="detail-row">
              <text class="detail-label">姓名：</text>
              <text class="detail-value">{{selectedPhd.name}}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">学号：</text>
              <text class="detail-value">{{selectedPhd.studentId}}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">导师：</text>
              <text class="detail-value">{{selectedPhd.supervisor}}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">院系：</text>
              <text class="detail-value">{{selectedPhd.department}}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">邮箱：</text>
              <text class="detail-value">{{selectedPhd.email}}</text>
            </view>
          </view>
          
          <view class="detail-section">
            <text class="section-title">研究方向</text>
            <view class="research-tags">
              <view class="research-tag" v-for="area in selectedPhd.researchAreas" :key="area">
                <text class="tag-text">{{area}}</text>
              </view>
            </view>
          </view>
          
          <view class="detail-section">
            <text class="section-title">评审进度</text>
            <view class="progress-detail">
              <view class="progress-item">
                <text class="progress-step">材料提交</text>
                <view class="step-status" :class="{ completed: selectedPhd.progress >= 25 }">
                  <text class="step-icon">{{selectedPhd.progress >= 25 ? '✓' : '○'}}</text>
                </view>
              </view>
              <view class="progress-item">
                <text class="progress-step">初审通过</text>
                <view class="step-status" :class="{ completed: selectedPhd.progress >= 50 }">
                  <text class="step-icon">{{selectedPhd.progress >= 50 ? '✓' : '○'}}</text>
                </view>
              </view>
              <view class="progress-item">
                <text class="progress-step">评审安排</text>
                <view class="step-status" :class="{ completed: selectedPhd.progress >= 75 }">
                  <text class="step-icon">{{selectedPhd.progress >= 75 ? '✓' : '○'}}</text>
                </view>
              </view>
              <view class="progress-item">
                <text class="progress-step">评审完成</text>
                <view class="step-status" :class="{ completed: selectedPhd.progress >= 100 }">
                  <text class="step-icon">{{selectedPhd.progress >= 100 ? '✓' : '○'}}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view class="detail-section">
            <text class="section-title">申请信息</text>
            <view class="application-info">
              <view class="info-item">
                <text class="info-label">申请时间：</text>
                <text class="info-value">{{selectedPhd.applyTime}}</text>
              </view>
              <view class="info-item">
                <text class="info-label">确认时间：</text>
                <text class="info-value">{{selectedPhd.confirmTime || '未确认'}}</text>
              </view>
              <view class="info-item">
                <text class="info-label">备注：</text>
                <text class="info-value">{{selectedPhd.notes || '无'}}</text>
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

    <!-- 添加博士生弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <view class="add-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加博士生</text>
          <view class="close-btn" @click="showAddModal = false">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="search-box">
            <text class="search-icon">🔍</text>
            <input class="search-input" v-model="addSearchKeyword" placeholder="搜索博士生姓名/研究方向/导师/院系" />
            <view class="clear-btn" v-if="addSearchKeyword" @click="addSearchKeyword = ''">
              <text class="clear-icon">×</text>
            </view>
          </view>
          <scroll-view class="add-list" scroll-y="true">
            <view v-for="phd in filteredAddPhds" :key="phd.id" class="add-phd-item">
              <view class="add-info">
                <text class="add-name">{{phd.name}}</text>
                <text class="add-student-id">{{phd.studentId}}</text>
                <text class="add-supervisor">导师：{{phd.supervisor}}</text>
                <text class="add-dept">{{phd.department}}</text>
                <text class="add-areas">{{phd.researchAreas.join('、')}}</text>
              </view>
              <view class="add-action">
                <button 
                  :disabled="isInCurrentList(phd)" 
                  class="add-btn-inner" 
                  @click="addPhdToList(phd)">
                  {{ isInCurrentList(phd) ? '已添加' : '添加' }}
                </button>
              </view>
            </view>
            <view v-if="filteredAddPhds.length === 0" class="empty-state">
              <text class="empty-text">暂无符合条件的博士生</text>
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
const showDetailModal = ref(false)
const selectedPhd = ref(null)
const showAddModal = ref(false)
const addSearchKeyword = ref('')

// 模拟博士生数据
const phdList = ref([
  {
    id: 1,
    name: '张三',
    studentId: '2021001',
    supervisor: '张教授',
    department: '计算机科学与技术学院',
    email: 'zhangsan@nottingham.edu.cn',
    researchAreas: ['人工智能', '机器学习'],
    progress: 100,
    status: 'confirmed',
    applyTime: '2025/01/10 09:30',
    confirmTime: '2025/01/15 14:20',
    notes: '材料完整，研究方向明确'
  },
  {
    id: 2,
    name: '李四',
    studentId: '2021002',
    supervisor: '李副教授',
    department: '电子工程学院',
    email: 'lisi@nottingham.edu.cn',
    researchAreas: ['通信工程', '信号处理'],
    progress: 75,
    status: 'pending',
    applyTime: '2025/01/12 16:45',
    confirmTime: null,
    notes: '等待评审安排'
  },
  {
    id: 3,
    name: '王五',
    studentId: '2021003',
    supervisor: '王教授',
    department: '机械工程学院',
    email: 'wangwu@nottingham.edu.cn',
    researchAreas: ['机械设计', '智能制造'],
    progress: 50,
    status: 'pending',
    applyTime: '2025/01/11 11:20',
    confirmTime: null,
    notes: '初审通过，等待进一步安排'
  },
  {
    id: 4,
    name: '赵六',
    studentId: '2021004',
    supervisor: '陈副教授',
    department: '化学工程学院',
    email: 'zhaoliu@nottingham.edu.cn',
    researchAreas: ['化学工程', '材料科学'],
    progress: 25,
    status: 'rejected',
    applyTime: '2025/01/09 15:30',
    confirmTime: '2025/01/14 10:15',
    notes: '材料不完整，研究方向需要调整'
  },
  {
    id: 5,
    name: '钱七',
    studentId: '2021005',
    supervisor: '刘教授',
    department: '商学院',
    email: 'qianqi@nottingham.edu.cn',
    researchAreas: ['管理学', '市场营销'],
    progress: 100,
    status: 'confirmed',
    applyTime: '2025/01/08 13:15',
    confirmTime: '2025/01/13 09:45',
    notes: '评审质量优秀'
  },
  {
    id: 6,
    name: '孙八',
    studentId: '2021006',
    supervisor: '孙教授',
    department: '物理学院',
    email: 'sunba@nottingham.edu.cn',
    researchAreas: ['理论物理', '量子力学'],
    progress: 0,
    status: 'pending',
    applyTime: '2025/01/15 08:30',
    confirmTime: null,
    notes: '新申请，待审核'
  }
])

// 模拟所有博士生数据库
const allPhds = ref([
  { id: 1, name: '张三', studentId: '2021001', supervisor: '张教授', department: '计算机科学与技术学院', researchAreas: ['人工智能', '机器学习'] },
  { id: 2, name: '李四', studentId: '2021002', supervisor: '李副教授', department: '电子工程学院', researchAreas: ['通信工程', '信号处理'] },
  { id: 3, name: '王五', studentId: '2021003', supervisor: '王教授', department: '机械工程学院', researchAreas: ['机械设计', '智能制造'] },
  { id: 4, name: '赵六', studentId: '2021004', supervisor: '陈副教授', department: '化学工程学院', researchAreas: ['化学工程', '材料科学'] },
  { id: 5, name: '钱七', studentId: '2021005', supervisor: '刘教授', department: '商学院', researchAreas: ['管理学', '市场营销'] },
  { id: 6, name: '孙八', studentId: '2021006', supervisor: '孙教授', department: '物理学院', researchAreas: ['理论物理', '量子力学'] }
])

// 计算属性
const filteredPhds = computed(() => {
  let filtered = phdList.value

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(phd => 
      phd.name.toLowerCase().includes(keyword) ||
      phd.studentId.toLowerCase().includes(keyword) ||
      phd.supervisor.toLowerCase().includes(keyword) ||
      phd.researchAreas.some(area => area.toLowerCase().includes(keyword)) ||
      phd.department.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

const filteredAddPhds = computed(() => {
  let filtered = allPhds.value
  if (addSearchKeyword.value.trim()) {
    const keyword = addSearchKeyword.value.toLowerCase()
    filtered = filtered.filter(phd =>
      phd.name.toLowerCase().includes(keyword) ||
      phd.studentId.toLowerCase().includes(keyword) ||
      phd.supervisor.toLowerCase().includes(keyword) ||
      phd.department.toLowerCase().includes(keyword) ||
      phd.researchAreas.some(area => area.toLowerCase().includes(keyword))
    )
  }
  return filtered
})

const isInCurrentList = (phd) => {
  return phdList.value.some(p => p.id === phd.id)
}

const addPhdToList = (phd) => {
  if (!isInCurrentList(phd)) {
    phdList.value.push({
      ...phd,
      email: phd.email || '',
      progress: 0,
      status: 'pending',
      applyTime: new Date().toLocaleString(),
      confirmTime: null,
      notes: ''
    })
    uni.showToast({ title: '已添加', icon: 'success' })
  }
}

const deletePhd = (phd) => {
  uni.showModal({
    title: '删除博士生',
    content: `确定要删除${phd.name}吗？`,
    success: (res) => {
      if (res.confirm) {
        phdList.value = phdList.value.filter(p => p.id !== phd.id)
        uni.showToast({
          title: '已删除',
          icon: 'success'
        })
      }
    }
  })
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

const viewPhdDetail = (phd) => {
  selectedPhd.value = phd
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedPhd.value = null
}

const exportPhdList = () => {
  uni.showToast({
    title: '导出功能开发中',
    icon: 'none'
  })
}

onMounted(() => {
  // 页面加载时的初始化逻辑
})
</script>

<style scoped>
.phd-list-container {
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

/* 统计信息 */
.stats-section {
  display: none !important;
}
.stat-card, .stat-number, .stat-label {
  display: none !important;
}

/* 博士生列表 */
.phd-list {
  flex: 1;
  padding: 24rpx 16rpx;
  max-width: 100%;
  box-sizing: border-box;
}

.phd-item {
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
}

.phd-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
}

.phd-info {
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.phd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.phd-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160rpx;
  display: inline-block;
}

.phd-details {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.phd-student-id {
  font-size: 20rpx;
  color: #4f46e5;
  background: #f0f0ff;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100rpx;
  display: inline-block;
}

.phd-supervisor {
  font-size: 20rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120rpx;
  display: inline-block;
}

.phd-research {
  margin-bottom: 6rpx;
}

.research-label {
  font-size: 20rpx;
  color: #666;
}

.research-areas {
  font-size: 20rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 220rpx;
  display: inline-block;
}

.phd-actions {
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
  font-size: 24rpx;
  font-weight: 500;
}

.action-button .action-button-text {
  color: #666;
}

.action-button.primary .action-button-text {
  color: #ffffff;
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

.progress-detail {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
}

.progress-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-step {
  font-size: 26rpx;
  color: #333;
}

.step-status {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.step-status.completed {
  background: #10b981;
}

.step-icon {
  font-size: 24rpx;
  color: #666;
  font-weight: 600;
}

.step-status.completed .step-icon {
  color: #ffffff;
}

.application-info {
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

.btn-warning {
  background: #ef4444;
  color: white;
}

.btn-warning .btn-text {
  color: #ffffff;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary .btn-text {
  color: #ffffff;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

/* 添加博士生弹窗 */
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

.add-phd-item {
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

.add-student-id, .add-supervisor, .add-dept, .add-areas {
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