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
              range-key="name"
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
          :disabled="isEditing || isConfirmed"
          :class="{ disabled: isEditing || isConfirmed }"
        >
          {{ isConfirmed ? '已确认' : '确认' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  fetchResearchDirections,
  fetchStudentInfo,
  updateResearchArea
} from './PhD_API.js'

const isEditing = ref(false)
const isConfirmed = ref(false)
const currentResearch = ref({ direction: '', directionId: null })
const editData = ref({ direction: '', directionId: null, directionIndex: null })
const researchDirections = ref([])

const canConfirm = computed(() => {
  return !isEditing.value && currentResearch.value.directionId && !isConfirmed.value
})

const loadResearchDirections = async () => {
  try {
    const res = await fetchResearchDirections()
    if (res[1].data.code === 200) {
      researchDirections.value = res[1].data.data
    } else {
      uni.showToast({ title: '获取研究方向失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

const loadStudentInfo = async () => {
  try {
    const res = await fetchStudentInfo()
    if (res[1].data.code === 200) {
      // 修改：根据新的API文档，researchArea现在是单个对象而不是数组
      const researchArea = res[1].data.data.researchArea
      currentResearch.value = {
        direction: researchArea?.name || '',
        directionId: researchArea?.id || null
      }
    } else {
      uni.showToast({ title: '获取学生信息失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

const toggleEditMode = () => {
  isEditing.value = true
  const idx = researchDirections.value.findIndex(
    d => d.id === currentResearch.value.directionId
  )
  editData.value = {
    direction: currentResearch.value.direction,
    directionId: currentResearch.value.directionId,
    directionIndex: idx !== -1 ? idx : null
  }
}

const onDirectionChange = (e) => {
  const index = e.detail.value
  editData.value.directionIndex = index
  editData.value.direction = researchDirections.value[index].name
  editData.value.directionId = researchDirections.value[index].id
}

const cancelEdit = () => {
  isEditing.value = false
  editData.value = {}
}

const saveChanges = async () => {
  if (editData.value.directionId == null) {
    uni.showToast({ title: '请选择研究方向', icon: 'none' })
    return
  }
  try {
    uni.showLoading({ title: '保存中...' })
    // 修改：使用新的单选API，传递单个ID而不是数组
    const res = await updateResearchArea(editData.value.directionId)
    uni.hideLoading()
    if (res[1].data.code === 200) {
      currentResearch.value.direction = editData.value.direction
      currentResearch.value.directionId = editData.value.directionId
      isEditing.value = false
      uni.showToast({ title: '保存成功', icon: 'success' })
    } else {
      uni.showToast({ title: res[1].data.message || '保存失败', icon: 'none' })
    }
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

const confirmAndContinue = async () => {
  if (!canConfirm.value) {
    uni.showToast({ title: '请先完成信息确认', icon: 'none' })
    return
  }
  
  try {
    uni.showLoading({ title: '确认中...' })
    
    // 由于确认逻辑现在由前端处理，我们只需要本地标记为已确认
    // 可以选择将确认状态保存到本地存储
    uni.setStorageSync('researchAreaConfirmed', {
      directionId: currentResearch.value.directionId,
      direction: currentResearch.value.direction,
      confirmedAt: new Date().toISOString()
    })
    
    isConfirmed.value = true
    uni.hideLoading()
    
    uni.showToast({ title: '确认成功', icon: 'success', duration: 1500 })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/PhD/PhD' })
    }, 1500)
    
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '确认失败', icon: 'none' })
  }
}

onMounted(async () => {
  await loadResearchDirections()
  await loadStudentInfo()
  
  // 检查是否已经确认过
  const confirmedData = uni.getStorageSync('researchAreaConfirmed')
  if (confirmedData && confirmedData.directionId === currentResearch.value.directionId) {
    isConfirmed.value = true
  }
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