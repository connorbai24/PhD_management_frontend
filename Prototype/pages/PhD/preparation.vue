<template>
  <view class="preparation-container">
    <view class="nav-bar">
      <text class="nav-title">方向确认</text>
    </view>

    <view class="content-area">
      <view class="header-section">
        <text class="main-title">专业方向确认</text>
        <text class="subtitle">请确认您的研究方向信息是否正确</text>
      </view>

      <view class="research-card">
        <view class="card-header">
          <text class="edit-btn" @click="toggleEditMode" v-if="!isEditing">编辑</text>
        </view>

        <view v-if="!isEditing" class="display-content">
          <text class="research-direction">{{ currentResearch.direction || '暂未选择' }}</text>
        </view>

        <view v-else class="edit-content">
          <view class="edit-section">
            <text class="section-title">选择研究方向</text>
            
            <picker 
              :value="editData.directionIndex" 
              :range="researchDirections" 
              range-key="skillName"
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

          <view class="edit-actions">
            <button class="action-btn cancel-btn" @click="cancelEdit">取消</button>
            <button class="action-btn save-btn" @click="saveChanges">
              保存
            </button>
          </view>
        </view>
      </view>

      <view class="notice-card">
        <text class="notice-text">请仔细核对以上研究方向信息，确认无误后点击"确认"</text>
      </view>

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
    if (res && res.statusCode === 200 && res.data && res.data.code === 200) {
      researchDirections.value = res.data.data
      const selectedArea = res.data.data.find(area => area.selected)
      if (selectedArea) {
        currentResearch.value = {
          direction: selectedArea.skillName,
          directionId: selectedArea.skillId
        }
      }
    } else {
      const errorMsg = (res && res.data && res.data.message) || '获取研究方向失败'
      uni.showToast({ title: errorMsg, icon: 'none' })
    }
  } catch (e) {
    console.error('执行 loadResearchDirections 时发生异常:', e)
    uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
  }
}

const loadStudentInfo = async () => {
  try {
    const res = await fetchStudentInfo()
    if (res && res.statusCode === 200 && res.data && res.data.code === 200) {
      const researchArea = res.data.data.researchArea
      if (researchArea) {
        if (!currentResearch.value.directionId) {
          currentResearch.value = {
            direction: researchArea.skillName || '',
            directionId: researchArea.skillId || null
          }
        }
      }
    } else {
      const errorMsg = (res && res.data && res.data.message) || '获取学生信息失败'
      uni.showToast({ title: errorMsg, icon: 'none' })
    }
  } catch (e) {
    console.error('执行 loadStudentInfo 时发生异常:', e)
    uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
  }
}

const toggleEditMode = () => {
  isEditing.value = true
  const idx = researchDirections.value.findIndex(
    d => d.skillId === currentResearch.value.directionId
  )
  editData.value = {
    direction: currentResearch.value.direction,
    directionId: currentResearch.value.directionId,
    directionIndex: idx !== -1 ? idx : null
  }
}

const onDirectionChange = (e) => {
  const index = e.detail.value
  const selectedDirection = researchDirections.value[index]
  editData.value.directionIndex = index
  editData.value.direction = selectedDirection.skillName
  editData.value.directionId = selectedDirection.skillId
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
    const res = await updateResearchArea(editData.value.directionId)
    uni.hideLoading()
    
    if (res && res.statusCode === 200 && res.data && res.data.code === 200) {
      currentResearch.value.direction = editData.value.direction
      currentResearch.value.directionId = editData.value.directionId
      
      researchDirections.value.forEach(area => {
        area.selected = area.skillId === editData.value.directionId
      })
      
      isEditing.value = false
      uni.showToast({ title: '保存成功', icon: 'success' })
    } else {
      const errorMsg = (res && res.data && res.data.message) || '保存失败'
      uni.showToast({ title: errorMsg, icon: 'none' })
    }
  } catch (e) {
    uni.hideLoading()
    console.error('保存研究方向失败:', e)
    uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
  }
}

const confirmAndContinue = async () => {
  if (!canConfirm.value) {
    uni.showToast({ title: '请先完成信息确认', icon: 'none' })
    return
  }
  
  try {
    uni.showLoading({ title: '确认中...' })
    
    // [MODIFIED] 移除了将确认状态保存到本地存储的逻辑
    // uni.setStorageSync('researchAreaConfirmed', { ... })
    
    isConfirmed.value = true
    uni.hideLoading()
    
    uni.showToast({ title: '确认成功', icon: 'success', duration: 1500 })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/PhD/PhD' })
    }, 1500)
    
  } catch (e) {
    uni.hideLoading()
    console.error('确认失败:', e)
    uni.showToast({ title: '确认失败', icon: 'none' })
  }
}

onMounted(async () => {
  await loadResearchDirections()
  await loadStudentInfo()
  
  // [MODIFIED] 移除了从本地存储检查确认状态的逻辑
  // const confirmedData = uni.getStorageSync('researchAreaConfirmed')
  // if (confirmedData && ...) { ... }
})
</script>

<style scoped>
/* 样式部分无需修改，此处省略 */
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