<template>
  <view class="preparation-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">方向确认</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 主要内容区域 -->
    <view v-else class="content-area">
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
          <text class="research-direction" v-if="currentResearch.direction">
            {{ currentResearch.direction }}
          </text>
          <text class="no-research" v-else>暂未设置研究方向</text>
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
                  {{ editData.directionIndex === -1 ? '其他方向' : (editData.direction || '请选择研究方向') }}
                </text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>

            <!-- 手动输入选项 -->
            <view class="manual-input-section">
              <text class="input-label">或手动输入其他方向：</text>
              <input 
                v-model="editData.customDirection" 
                class="custom-input"
                placeholder="请输入您的研究方向"
                @input="onCustomInput"
              />
            </view>
          </view>

          <!-- 编辑操作按钮 -->
          <view class="edit-actions">
            <button class="action-btn cancel-btn" @click="cancelEdit">取消</button>
            <button class="action-btn save-btn" @click="saveChanges" :disabled="saving">
              {{ saving ? '处理中...' : (editData.directionIndex === -1 && editData.customDirection ? '申请' : '保存') }}
            </button>
          </view>
        </view>
      </view>

      <!-- 确认提示 -->
      <view class="notice-card">
        <text class="notice-text">请仔细核对以上研究方向信息，确认无误后点击"确认并继续"</text>
      </view>

      <!-- 确认按钮 -->
      <view class="confirm-section">
        <button 
          class="confirm-btn" 
          @click="confirmAndContinue" 
          :disabled="isEditing || !canConfirm || confirming"
          :class="{ disabled: isEditing || !canConfirm || confirming }"
        >
          {{ confirming ? '确认中...' : '确认并继续' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { researchAPI, confirmationAPI } from '@/pages/teacher/teacher_API.js'

// 响应式数据
const loading = ref(true)
const saving = ref(false)
const confirming = ref(false)
const isEditing = ref(false)
const currentResearch = ref({})
const editData = ref({})
const researchDirections = ref([])

// 计算属性
const canConfirm = computed(() => {
  return !isEditing.value && currentResearch.value.direction
})

// 方法
const loadData = async () => {
  try {
    loading.value = true
    
    // 并行加载研究方向列表和当前确认信息
    const [directionsRes, confirmationRes] = await Promise.all([
      researchAPI.getDirections(),
      confirmationAPI.getResearchConfirmation()
    ])
    
    // 设置研究方向选项
    if (directionsRes.data && directionsRes.data.directions) {
      researchDirections.value = directionsRes.data.directions
    }
    
    // 设置当前研究方向
    if (confirmationRes.data) {
      currentResearch.value = {
        direction: confirmationRes.data.direction || '',
        isConfirmed: confirmationRes.data.isConfirmed || false,
        lastUpdated: confirmationRes.data.lastUpdated
      }
    }
    
  } catch (error) {
    console.error('加载数据失败:', error)
    uni.showToast({
      title: error.message || '加载数据失败',
      icon: 'none'
    })
    
    // 如果加载失败，使用本地存储作为备选
    loadLocalData()
  } finally {
    loading.value = false
  }
}

const loadLocalData = () => {
  try {
    const saved = uni.getStorageSync('teacherResearch')
    if (saved) {
      currentResearch.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载本地数据失败:', error)
  }
}

const saveLocalData = () => {
  try {
    uni.setStorageSync('teacherResearch', JSON.stringify(currentResearch.value))
  } catch (error) {
    console.error('保存本地数据失败:', error)
  }
}

const toggleEditMode = () => {
  isEditing.value = true
  const idx = researchDirections.value.indexOf(currentResearch.value.direction)
  
  if (idx === -1) {
    // 不是预设列表，视为自定义
    editData.value = {
      direction: '',
      directionIndex: -1,
      customDirection: currentResearch.value.direction || ''
    }
  } else {
    editData.value = {
      direction: currentResearch.value.direction,
      directionIndex: idx,
      customDirection: ''
    }
  }
}

const onDirectionChange = (e) => {
  const index = e.detail.value
  editData.value.directionIndex = index
  editData.value.direction = researchDirections.value[index]
  editData.value.customDirection = '' // 清空手动输入
}

const onCustomInput = (e) => {
  const value = e.detail.value
  editData.value.customDirection = value
  if (value.trim()) {
    editData.value.direction = ''
    editData.value.directionIndex = -1 // 表示自定义输入
  }
}

const cancelEdit = () => {
	
  isEditing.value = false
  editData.value = {}
}

const saveChanges = async () => {
  let finalDirection = ''
  let isCustom = false

  if (editData.value.directionIndex === -1 && editData.value.customDirection && editData.value.customDirection.trim()) {
    finalDirection = editData.value.customDirection.trim()
    isCustom = true
  } else if (editData.value.direction) {
    finalDirection = editData.value.direction
  }

  if (!finalDirection) {
    uni.showToast({
      title: '请选择或输入研究方向',
      icon: 'none'
    })
    return
  }

  try {
    saving.value = true
    
    if (isCustom) {
      // 申请自定义研究方向
      await researchAPI.applyCustomDirection(finalDirection)
      uni.showToast({
        title: '自定义研究方向申请已提交',
        icon: 'success'
      })
    } else {
      // 直接使用预设方向，暂时更新本地状态
      currentResearch.value.direction = finalDirection
      saveLocalData()
      uni.showToast({
        title: '研究方向已更新',
        icon: 'success'
      })
    }
    
    isEditing.value = false
    editData.value = {}
    
  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({
      title: error.message || '保存失败，请重试',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
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
    confirming.value = true
    
    // 调用API确认研究方向
    await confirmationAPI.saveResearchConfirmation(currentResearch.value.direction)
    
    // 保存确认状态到本地
    currentResearch.value.isConfirmed = true
    saveLocalData()
    
    // 设置全局确认状态
    uni.setStorageSync('researchConfirmed', true)
    
    uni.showToast({
      title: '确认成功',
      icon: 'success',
      duration: 1500
    })

    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/teacher/schedule'
      })
    }, 1500)
    
  } catch (error) {
    console.error('确认失败:', error)
    uni.showToast({
      title: error.message || '确认失败，请重试',
      icon: 'none'
    })
  } finally {
    confirming.value = false
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.preparation-container {
  min-height: 100vh;
  background: #f5f5f7;
  display: flex;
  flex-direction: column;
}

/* 加载状态 */
.loading-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #86868b;
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

.no-research {
  font-size: 32rpx;
  color: #86868b;
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

/* 手动输入部分 */
.manual-input-section {
  margin-top: 24rpx;
  margin-right: 25px;
}

.input-label {
  font-size: 26rpx;
  color: #86868b;
  display: block;
  margin-bottom: 12rpx;
}

.custom-input {
  width: 100%;
  background: #f2f2f7;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #1d1d1f;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.custom-input:focus {
  border-color: #007aff;
  background: #f0f8ff;
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

.save-btn:active:not(:disabled) {
  background: #0056cc;
}

.save-btn:disabled {
  background: #d1d1d6;
  color: #86868b;
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