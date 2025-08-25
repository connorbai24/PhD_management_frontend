<template>
  <view class="preparation-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">方向确认</text>
    </view>

    <!-- 主要内容区域 -->
    <view class="content-area">
      <!-- 标题部分 -->
      <view class="header-section">
        <text class="main-title">专业方向确认</text>
        <text class="subtitle">请确认您的研究方向信息是否正确</text>
      </view>

      <!-- 研究方向信息展示卡片 -->
      <view class="research-card">
        <view class="card-header">
          <text class="edit-btn" @click="toggleEditMode" v-if="!isEditing">编辑</text>
        </view>

        <!-- 非编辑模式 - 显示信息 -->
        <view v-if="!isEditing" class="display-content">
          <text class="research-direction">{{ currentResearch.direction }}</text>
        </view>

        <!-- 编辑模式 -->
        <view v-else class="edit-content">
          <view class="edit-section">
            <text class="section-title">选择研究方向</text>
            
            <!-- 下拉选择器 -->
            <picker 
              :value="editData.directionIndex" 
              :range="researchDirections" 
              @change="onDirectionChange"
              class="direction-picker"
            >
              <view class="picker-display">
                <text class="picker-text">
                  {{ editData.direction || '请选择研究方向' }}
                </text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>

          <!-- 编辑操作按钮 -->
          <view class="edit-actions">
            <button class="action-btn cancel-btn" @click="cancelEdit">取消</button>
            <button class="action-btn save-btn" @click="saveChanges">
              保存
            </button>
          </view>
        </view>
      </view>

      <!-- 确认提示 -->
      <view class="notice-card">
        <text class="notice-text">请仔细核对以上研究方向信息，确认无误后点击"确认"</text>
      </view>

      <!-- 确认按钮 -->
      <view class="confirm-section">
        <button 
          class="confirm-btn" 
          @click="confirmAndContinue" 
          :disabled="isEditing"
          :class="{ disabled: isEditing }"
        >
          确认
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const isEditing = ref(false)
const currentResearch = ref({})
const editData = ref({})

// 模拟数据
const mockResearchData = {
  direction: '机器学习与人工智能'
}

// 研究方向选项
const researchDirections = [
  '机器学习与人工智能',
  '计算机视觉',
  '自然语言处理',
  '数据科学与大数据',
  '网络安全',
  '分布式系统',
  '人机交互',
  '软件工程',
  '算法设计与分析',
  '云计算与边缘计算'
]

// 计算属性
const canConfirm = computed(() => {
  return !isEditing.value && currentResearch.value.direction
})

// 方法
const loadResearchData = () => {
  try {
    const saved = uni.getStorageSync('teacherResearch')
    if (saved) {
      currentResearch.value = JSON.parse(saved)
    } else {
      currentResearch.value = { ...mockResearchData }
      saveResearchData()
    }
  } catch (error) {
    console.error('加载研究方向数据失败:', error)
    currentResearch.value = { ...mockResearchData }
  }
}

const saveResearchData = () => {
  try {
    uni.setStorageSync('teacherResearch', JSON.stringify(currentResearch.value))
  } catch (error) {
    console.error('保存研究方向数据失败:', error)
  }
}

const toggleEditMode = () => {
  isEditing.value = true
  const idx = researchDirections.indexOf(currentResearch.value.direction)
  editData.value = {
    direction: idx !== -1 ? currentResearch.value.direction : '',
    directionIndex: idx !== -1 ? idx : null
  }
}

const onDirectionChange = (e) => {
  const index = e.detail.value
  editData.value.directionIndex = index
  editData.value.direction = researchDirections[index]
}

const cancelEdit = () => {
  isEditing.value = false
  editData.value = {}
}

const saveChanges = () => {
  if (editData.value.directionIndex == null || !editData.value.direction) {
    uni.showToast({
      title: '请选择研究方向',
      icon: 'none'
    })
    return
  }
  currentResearch.value.direction = editData.value.direction
  saveResearchData()
  isEditing.value = false
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
}

const confirmAndContinue = async () => {
  if (!canConfirm.value) {
    uni.showToast({
      title: '请先完成信息确认',
      icon: 'none'
    })
    return
  }

  try {
    uni.showLoading({
      title: '确认中...'
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    uni.setStorageSync('researchConfirmed', true)
    uni.hideLoading()
    
    uni.showToast({
      title: '确认成功',
      icon: 'success',
      duration: 1500
    })

    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/PhD/PhD'
      })
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '确认失败，请重试',
      icon: 'none'
    })
    console.error('确认错误:', error)
  }
}

// 生命周期
onMounted(() => {
  loadResearchData()
})
</script>

<style scoped>
.preparation-container {
  min-height: 100vh;
  background: #f5f5f7;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.nav-bar {
  height: 88rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  /* 调整导航栏的margin，避免紧贴 */
  margin: 0 -24rpx;
}

.nav-title {
  font-size: 33rpx;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.5rpx;
}

/* 主要内容区域 */
.content-area {
  flex: 1;
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

/* 标题部分 */
.header-section {
  text-align: center;
  margin-bottom: 20rpx;
}

.main-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #1d1d1f;
  display: block;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #86868b;
  line-height: 1.4;
  display: block;
}

/* 研究方向卡片 */
.research-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 0;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 24rpx 32rpx 0;
  display: flex;
  justify-content: flex-end;
}

.edit-btn {
  font-size: 28rpx;
  color: #007aff;
  padding: 12rpx 24rpx;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 20rpx;
  font-weight: 500;
}

/* 显示内容 */
.display-content {
  padding: 20rpx 32rpx 40rpx;
  text-align: center;
}

.research-direction {
  font-size: 36rpx;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.3;
}

/* 编辑内容 */
.edit-content {
  padding: 20rpx 32rpx 32rpx;
}

.edit-section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 28rpx;
  color: #1d1d1f;
  font-weight: 600;
  display: block;
  margin-bottom: 16rpx;
}

/* 选择器样式 */
.direction-picker {
  margin-bottom: 24rpx;
}

.picker-display {
  background: #f2f2f7;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.picker-display:active {
  border-color: #007aff;
  background: #f0f8ff;
}

.picker-text {
  font-size: 28rpx;
  color: #1d1d1f;
  flex: 1;
}

.picker-arrow {
  font-size: 24rpx;
  color: #86868b;
  transition: transform 0.3s ease;
}

/* 编辑操作按钮 */
.edit-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f2f2f7;
  color: #86868b;
}

.cancel-btn:active {
  background: #e5e5e7;
}

.save-btn {
  background: #007aff;
  color: #ffffff;
}

.save-btn:active {
  background: #0056cc;
}

/* 提示卡片 */
.notice-card {
  background: rgba(255, 149, 0, 0.1);
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(255, 149, 0, 0.2);
}

.notice-text {
  font-size: 26rpx;
  color: #d2691e;
  line-height: 1.5;
  text-align: center;
}

/* 确认按钮区域 */
.confirm-section {
  margin-top: auto;
  padding-top: 20rpx;
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  background: #007aff;
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.confirm-btn:active:not(.disabled) {
  background: #0056cc;
  transform: translateY(2rpx);
}

.confirm-btn.disabled {
  background: #d1d1d6;
  color: #86868b;
}
</style>