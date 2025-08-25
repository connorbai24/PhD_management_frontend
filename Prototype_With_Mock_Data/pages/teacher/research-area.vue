<template>
  <view class="research-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="handleBack">
        <image class="back-icon" src="/static/return.png"></image>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">研究方向管理</text>
      <view class="nav-right" @click="handleSave">
        <text :class="['save-button', { 'active': hasChanges }]">保存</text>
      </view>
    </view>

    <scroll-view class="content-area" scroll-y="true">
      <!-- 我的研究方向 -->
      <view class="section my-areas-section">
        <view class="section-header">
          <text class="section-title">我的研究方向</text>
          <text class="section-count">({{ selectedAreas.length }})</text>
        </view>
        
        <view v-if="selectedAreas.length > 0" class="tags-container">
          <view 
            v-for="(area, index) in selectedAreas" 
            :key="area.id" 
            class="tag selected-tag"
            :class="{ 'pending-tag': area.pending }"
            @click="removeFromSelected(area)"
          >
            <text class="tag-text">{{ area.name }}</text>
            <text v-if="area.pending" class="pending-badge">待审核</text>
            <text class="remove-icon">⨯</text>
          </view>
        </view>
        
        <view v-else class="empty-state">
          <text class="empty-text">暂未选择任何研究方向</text>
        </view>
      </view>

      <!-- 添加新方向 -->
      <view class="section add-new-section">
        <view class="section-header">
          <text class="section-title">添加新方向</text>
        </view>
        
        <view class="input-container">
          <input 
            v-model="newAreaInput"
            class="new-area-input"
            placeholder="可输入系统暂未收录的新方向"
            placeholder-class="input-placeholder"
            @input="handleInputChange"
          />
          <view 
            :class="['add-button', { 'disabled': !newAreaInput.trim() }]"
            @click="addNewArea"
          >
            <text class="add-icon">+</text>
            <text class="add-text">申请</text>
          </view>
        </view>
        
        <text class="hint-text">新添加的方向需要管理员审核后方可在全系统生效</text>
      </view>

      <!-- 所有方向 -->
      <view class="section all-areas-section">
        <view class="section-header">
          <text class="section-title">所有方向</text>
          <text class="section-count">({{ allAreas.length }})</text>
        </view>
        
        <view class="search-container">
          <input 
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索研究方向"
            placeholder-class="search-placeholder"
          />
        </view>
        
        <view class="tags-container">
          <view 
            v-for="area in filteredAreas" 
            :key="area.id"
            :class="['tag', { 'selected': isSelected(area.id), 'new-added': area.isNew }]"
            @click="toggleArea(area)"
          >
            <text class="tag-text">{{ area.name }}</text>
            <text v-if="area.isNew" class="new-badge">新增</text>
          </view>
        </view>
      </view>

      <!-- 底部间距 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 保存成功提示 -->
    <view v-if="showSuccessToast" class="toast-overlay">
      <view class="toast-content">
        <text class="toast-icon">✓</text>
        <text class="toast-text">保存成功</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 响应式数据
const originalSelectedAreas = ref([])
const selectedAreas = ref([])

const allAreas = ref([
  { id: 1, name: '人工智能', isNew: false },
  { id: 2, name: '自然语言处理', isNew: false },
  { id: 3, name: '计算机视觉', isNew: false },
  { id: 4, name: '机器学习', isNew: false },
  { id: 5, name: '深度学习', isNew: false },
  { id: 6, name: '数据挖掘', isNew: false },
  { id: 7, name: '分布式系统', isNew: false },
  { id: 8, name: '云计算', isNew: false },
  { id: 9, name: '区块链', isNew: false },
  { id: 10, name: '网络安全', isNew: false },
  { id: 11, name: '软件工程', isNew: false },
  { id: 12, name: '数据库', isNew: false }
])

const newAreaInput = ref('')
const searchKeyword = ref('')
const showSuccessToast = ref(false)
const hasChanges = ref(false)
const nextId = ref(20)

const teacherInfo = ref({
  name: '王伟',
  researchAreas: []
})

const showLogoutModal = ref(false)

// 计算属性
const filteredAreas = computed(() => {
  if (!searchKeyword.value.trim()) {
    return allAreas.value
  }
  return allAreas.value.filter(area => 
    area.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const loadTeacherResearchAreas = () => {
  const teacherInfo = uni.getStorageSync('teacherInfo') || {}
  const researchAreas = teacherInfo.researchAreas || []
  originalSelectedAreas.value = [...researchAreas]
  selectedAreas.value = [...researchAreas]
}

onMounted(() => {
  loadTeacherResearchAreas()
  uni.$on('teacherResearchAreasUpdated', handleResearchAreasUpdate)
})

onUnmounted(() => {
  uni.$off('teacherResearchAreasUpdated', handleResearchAreasUpdate)
})

// 方法定义
const handleBack = () => {
  if (hasChanges.value) {
    uni.showModal({
      title: '确认离开',
      content: '您有未保存的修改，确定要离开吗？',
      success: (res) => {
        if (res.confirm) {
          uni.reLaunch({
            url: '/pages/teacher/profile'
          })
        }
      }
    })
  } else {
    uni.reLaunch({
      url: '/pages/teacher/profile'
    })
  }
}

const handleSave = () => {
  if (!hasChanges.value) return;
  // 过滤掉待审核方向
  const approvedAreas = selectedAreas.value.filter(area => !area.pending)
  // 保存到本地
  const teacherInfo = uni.getStorageSync('teacherInfo') || {};
  teacherInfo.researchAreas = approvedAreas;
  uni.setStorageSync('teacherInfo', teacherInfo);
  uni.$emit('teacherResearchAreasUpdated', approvedAreas);
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/teacher/profile' });
  }, 500);
}

const isSelected = (areaId) => {
  return selectedAreas.value.some(area => area.id === areaId)
}

const toggleArea = (area) => {
  const index = selectedAreas.value.findIndex(selected => selected.id === area.id)
  
  if (index > -1) {
    // 移除选择
    selectedAreas.value.splice(index, 1)
  } else {
    // 添加选择
    selectedAreas.value.push(area)
  }
  
  checkForChanges()
}

const removeFromSelected = (area) => {
  const index = selectedAreas.value.findIndex(selected => selected.id === area.id)
  if (index > -1) {
    selectedAreas.value.splice(index, 1)
    checkForChanges()
  }
}

const handleInputChange = () => {
  // 输入框变化时的处理
}

const addNewArea = () => {
  const inputValue = newAreaInput.value.trim()
  if (!inputValue) return

  // 检查是否已存在于所有方向
  const exists = allAreas.value.some(area => 
    area.name.toLowerCase() === inputValue.toLowerCase()
  )
  // 检查是否已存在于我的研究方向（防止重复添加待审核）
  const existsInSelected = selectedAreas.value.some(area => 
    area.name.toLowerCase() === inputValue.toLowerCase()
  )

  if (exists || existsInSelected) {
    uni.showToast({
      title: '该研究方向已存在',
      icon: 'none'
    })
    return
  }

  // 创建新的待审核研究方向（不加入allAreas，只加入selectedAreas）
  const newArea = {
    id: 'pending_' + Date.now(),
    name: inputValue,
    isNew: true,
    pending: true // 标记为待审核
  }

  // 只添加到我的研究方向
  selectedAreas.value.push(newArea)

  // 清空输入框
  newAreaInput.value = ''

  checkForChanges()

  uni.showToast({
    title: '新方向已申请，待审核',
    icon: 'none'
  })
}

const checkForChanges = () => {
  const currentIds = selectedAreas.value.map(area => area.id).sort()
  const originalIds = originalSelectedAreas.value.sort()
  
  hasChanges.value = JSON.stringify(currentIds) !== JSON.stringify(originalIds)
}

const formatResearchAreas = (areas) => {
  if (!areas || areas.length === 0) {
    return '未设置研究方向'
  }
  return areas.map(area => area.name).join('、')
}

const handleResearchAreasUpdate = (newAreas) => {
  teacherInfo.value.researchAreas = newAreas
  const storedTeacherInfo = uni.getStorageSync('teacherInfo') || {}
  storedTeacherInfo.researchAreas = newAreas
  uni.setStorageSync('teacherInfo', storedTeacherInfo)
}
</script>

<style scoped>
.research-container {
  min-height: 100vh;
  /* 修改背景为灰色渐变，匹配图片样式 */
  background: linear-gradient(180deg, #f2f2f7 0%, #f2f2f7 100%);
  /* 添加整体容器的padding，确保内容不会紧贴边框 */
  padding: 0 24rpx;
  box-sizing: border-box;
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
  /* 调整导航栏的margin，避免紧贴 */
  margin: 0 -24rpx;
}

.nav-left {
  display: flex;
  align-items: center;
  min-width: 120rpx;
}

.back-icon {
  width: 48rpx;
  height: 48rpx;
}

.back-text {
  font-size: 30rpx;
  color: #007AFF;
  font-weight: 400;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1d1d1f;
  text-align: center;
  flex: 1;
}

.nav-right {
  min-width: 120rpx;
  display: flex;
  justify-content: flex-end;
}

.save-button {
  font-size: 30rpx;
  color: #C7C7CC;
  font-weight: 500;
  transition: color 0.3s ease;
}

.save-button.active {
  color: #007AFF;
}

/* 内容区域 */
.content-area {
  flex: 1;
  /* 移除左右padding，使用容器的padding */
  padding: 0;
}

.section {
  background: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	gap: 16rpx;
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 24rpx;
  padding: 0 8rpx;
  position: relative;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d1d1f;
  margin-right: 12rpx;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8rpx;
  width: 48rpx;
  height: 4rpx;
  background: #007aff;
  border-radius: 2rpx;
}

.section-count {
  font-size: 24rpx;
  color: #8E8E93;
  font-weight: 400;
}

/* 我的研究方向 */
.my-areas-section {
  margin-top: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  background: #F2F2F7;
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.tag.selected {
  background: linear-gradient(135deg, #007AFF, #5856D6);
  color: white;
}

.tag.new-added {
  border-color: #FF9500;
}

.selected-tag {
  background: linear-gradient(135deg, #007AFF, #5856D6);
}

.tag-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #1d1d1f;
}

.selected-tag .tag-text,
.tag.selected .tag-text {
  color: white;
}

.remove-icon {
  font-size: 24rpx;
  color: white;
  margin-left: 12rpx;
  font-weight: 600;
}

.new-badge {
  font-size: 18rpx;
  color: #FF9500;
  background: rgba(255, 149, 0, 0.1);
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  margin-left: 8rpx;
  font-weight: 600;
}

.empty-state {
  text-align: left;
  padding: 10rpx 10rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #8E8E93;
}

/* 添加新方向 */
.add-new-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.input-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.new-area-input {
  flex: 1;
  height: 80rpx;
  background: #F2F2F7;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #1d1d1f;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.new-area-input:focus {
  border-color: #007AFF;
  background: white;
}

.input-placeholder {
  color: #C7C7CC;
}

.add-button {
  height: 80rpx;
  background: linear-gradient(135deg, #34C759, #30D158);
  border-radius: 16rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.add-button.disabled {
  background: #C7C7CC;
  opacity: 0.5;
}

.add-icon {
  font-size: 32rpx;
  color: white;
  font-weight: 600;
}

.add-text {
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}

.hint-text {
  font-size: 22rpx;
  color: #8E8E93;
  line-height: 1.4;
}

/* 所有方向 */
.search-container {
  margin-bottom: 24rpx;
}

.search-input {
  width: 100%;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20rpx);
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #1d1d1f;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.search-input:focus {
  border-color: #007AFF;
  background: white;
}

.search-placeholder {
  color: #C7C7CC;
}

/* 底部间距 */
.bottom-space {
  height: 40rpx;
}

/* 成功提示 */
.toast-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  pointer-events: none;
}

.toast-content {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10rpx);
  border-radius: 16rpx;
  padding: 32rpx 48rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.toast-icon {
  font-size: 32rpx;
  color: #34C759;
  font-weight: 600;
}

.toast-text {
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}


.pending-tag {
  background: linear-gradient(135deg, #7ecbff, #a3d8ff);
}
.pending-tag .tag-text {
  color: #fff;
}
.pending-badge {
  font-size: 18rpx;
  color: #fff;
  background: rgba(51, 153, 255, 0.25);
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  margin-left: 8rpx;
  font-weight: 600;
}

</style>