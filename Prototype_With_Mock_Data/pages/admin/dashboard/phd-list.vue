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
          placeholder="搜索博士生姓名/研究方向/导师"
          v-model="searchKeyword"
          @input="handleSearch"
        />
        <view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
          <text class="clear-icon">×</text>
        </view>
      </view>
    </view>

    <!-- 博士生列表 -->
    <scroll-view class="phd-list" scroll-y="true">
      <view 
        class="phd-item" 
        v-for="phd in filteredPhds" 
        :key="phd.id"
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
            <input class="search-input" v-model="addSearchKeyword" placeholder="搜索博士生姓名/研究方向/导师" />
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
const showAddModal = ref(false)
const addSearchKeyword = ref('')

// 模拟博士生数据
const phdList = ref([
  {
    id: 1,
    name: '张三',
    studentId: '2021001',
    supervisor: '张教授',
    researchAreas: ['人工智能', '机器学习'],
  },
  {
    id: 2,
    name: '李四',
    studentId: '2021002',
    supervisor: '李副教授',
    researchAreas: ['通信工程', '信号处理'],
  },
  {
    id: 3,
    name: '王五',
    studentId: '2021003',
    supervisor: '王教授',
    researchAreas: ['机械设计', '智能制造'],
  },
  {
    id: 4,
    name: '赵六',
    studentId: '2021004',
    supervisor: '陈副教授',
    researchAreas: ['化学工程', '材料科学'],
  },
  {
    id: 5,
    name: '钱七',
    studentId: '2021005',
    supervisor: '刘教授',
    researchAreas: ['管理学', '市场营销'],
  },
  {
    id: 6,
    name: '孙八',
    studentId: '2021006',
    supervisor: '孙教授',
    researchAreas: ['理论物理', '量子力学'],
  }
])

// 模拟所有博士生数据库
const allPhds = ref([
  { id: 1, name: '张三', studentId: '2021001', supervisor: '张教授', researchAreas: ['人工智能', '机器学习'] },
  { id: 2, name: '李四', studentId: '2021002', supervisor: '李副教授', researchAreas: ['通信工程', '信号处理'] },
  { id: 3, name: '王五', studentId: '2021003', supervisor: '王教授', researchAreas: ['机械设计', '智能制造'] },
  { id: 4, name: '赵六', studentId: '2021004', supervisor: '陈副教授', researchAreas: ['化学工程', '材料科学'] },
  { id: 5, name: '钱七', studentId: '2021005', supervisor: '刘教授', researchAreas: ['管理学', '市场营销'] },
  { id: 6, name: '孙八', studentId: '2021006', supervisor: '孙教授', researchAreas: ['理论物理', '量子力学'] },
  { id: 7, name: '王小明', studentId: '2021007', supervisor: '王院士', researchAreas: ['生物工程', '基因技术'] },
  { id: 8, name: '李小王', studentId: '2021008', supervisor: '李教授', researchAreas: ['王牌专业', '数据科学'] }
])

// 计算属性 - 修复搜索过滤逻辑，添加空值检查
const filteredPhds = computed(() => {
  let filtered = phdList.value

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(phd => {
      // 安全地检查每个字段，避免 undefined 错误
      const name = (phd.name || '').toLowerCase()
      const studentId = (phd.studentId || '').toLowerCase()
      const supervisor = (phd.supervisor || '').toLowerCase()
      
      // 检查研究领域数组
      const researchMatch = phd.researchAreas && Array.isArray(phd.researchAreas) 
        ? phd.researchAreas.some(area => (area || '').toLowerCase().includes(keyword))
        : false
      
      return name.includes(keyword) ||
             studentId.includes(keyword) ||
             supervisor.includes(keyword) ||
             researchMatch
    })
  }

  return filtered
})

// 计算属性 - 修复添加弹窗的搜索过滤逻辑
const filteredAddPhds = computed(() => {
  let filtered = allPhds.value
  if (addSearchKeyword.value.trim()) {
    const keyword = addSearchKeyword.value.toLowerCase()
    filtered = filtered.filter(phd => {
      // 安全地检查每个字段，避免 undefined 错误
      const name = (phd.name || '').toLowerCase()
      const studentId = (phd.studentId || '').toLowerCase()
      const supervisor = (phd.supervisor || '').toLowerCase()
      const department = (phd.department || '').toLowerCase()
      
      // 检查研究领域数组
      const researchMatch = phd.researchAreas && Array.isArray(phd.researchAreas)
        ? phd.researchAreas.some(area => (area || '').toLowerCase().includes(keyword))
        : false
      
      return name.includes(keyword) ||
             studentId.includes(keyword) ||
             supervisor.includes(keyword) ||
             researchMatch
    })
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

// 返回仪表盘
const goBack = () => {
  uni.navigateTo({
    url: '/pages/admin/dashboard/dashboard'
  })
}

const handleSearch = (e) => {
  searchKeyword.value = e.detail.value
}

const clearSearch = () => {
  searchKeyword.value = ''
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
  /* 移除了点击效果样式，因为不再有点击功能 */
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
  white-space: nowrap;
  max-width: 200rpx;
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
  white-space: nowrap;
  max-width: 200rpx;
  display: inline-block;
}

.phd-supervisor {
  font-size: 20rpx;
  color: #666;
  overflow: hidden;
  white-space: nowrap;
  max-width: 500rpx;
  display: inline-block;
}

.phd-research {
  margin-bottom: 6rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.research-label {
  font-size: 20rpx;
  color: #666;
  flex-shrink: 0;
}

.research-areas {
  font-size: 20rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
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
  font-size: 26rpx;
  font-weight: 500;
}

.action-button .action-button-text {
  color: #666;
}

.action-button.primary .action-button-text {
  color: #ffffff;
}

/* 添加博士生弹窗 */
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