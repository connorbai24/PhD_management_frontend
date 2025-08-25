<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="goBack">
				<image class="back-icon" src="/static/return.png"></image>
			</view>
			<text class="nav-title">修改研究方向</text>
			<view class="nav-right" @click="saveChanges">
				<text class="save-button" :class="{ active: hasChanges }">保存</text>
			</view>
		</view>

		<!-- 主要内容 -->
		<view class="content">
			<!-- 说明文字 -->
			<view class="instruction-section">
				<text class="instruction-text">请从以下列表中选择你的研究方向，这将有助于系统为你匹配最合适的评审老师。</text>
			</view>

			<!-- 已选方向 -->
			<view class="selected-section" v-if="selectedAreas.length > 0">
				<text class="section-title">已选择的研究方向</text>
				<view class="selected-tags">
					<view 
						class="selected-tag" 
						v-for="(area, index) in selectedAreas" 
						:key="area.id"
					>
						<text class="tag-text">{{ area.name }}</text>
						<view class="remove-button" @click="removeArea(index)">
							<text class="remove-icon">×</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 可选方向列表 -->
			<view class="available-section">
				<text class="section-title">可选研究方向</text>
				<view class="available-tags">
					<view 
						class="available-tag" 
						v-for="area in availableAreas" 
						:key="area.id"
						:class="{ 
							selected: isSelected(area.id)
						}"
						@click="toggleArea(area)"
					>
						<text class="check-icon" v-if="isSelected(area.id)">✓</text>
						<text class="tag-text">{{ area.name }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const originalSelectedAreas = ref([])
const selectedAreas = ref([])
const availableAreas = ref([
	{ id: 1, name: '人工智能' },
	{ id: 2, name: '机器学习' },
	{ id: 3, name: '深度学习' },
	{ id: 4, name: '自然语言处理' },
	{ id: 5, name: '计算机视觉' },
	{ id: 6, name: '数据挖掘' },
	{ id: 7, name: '知识图谱' },
	{ id: 8, name: '推荐系统' },
	{ id: 9, name: '强化学习' },
	{ id: 10, name: '语音识别' },
	{ id: 11, name: '图像处理' },
	{ id: 12, name: '模式识别' },
	{ id: 13, name: '信息检索' },
	{ id: 14, name: '分布式系统' },
	{ id: 15, name: '云计算' },
	{ id: 16, name: '大数据' },
	{ id: 17, name: '区块链' },
	{ id: 18, name: '网络安全' },
	{ id: 19, name: '软件工程' },
	{ id: 20, name: '数据库系统' }
])

// 计算属性
const hasChanges = computed(() => {
	if (originalSelectedAreas.value.length !== selectedAreas.value.length) {
		return true
	}
	
	const originalIds = originalSelectedAreas.value.map(area => area.id).sort()
	const currentIds = selectedAreas.value.map(area => area.id).sort()
	
	return !originalIds.every((id, index) => id === currentIds[index])
})

// 生命周期
onMounted(() => {
	loadUserResearchAreas()
})

// 方法
const loadUserResearchAreas = () => {
	const userInfo = uni.getStorageSync('userInfo') || {}
	const researchAreas = userInfo.researchAreas || [
		{ id: 1, name: '人工智能' }
	]
	
	// 只保留第一个研究方向（如果原来有多个的话）
	const singleArea = researchAreas.length > 0 ? [researchAreas[0]] : []
	
	originalSelectedAreas.value = [...singleArea]
	selectedAreas.value = [...singleArea]
}

const goBack = () => {
	if (hasChanges.value) {
		uni.showModal({
			title: '确认离开',
			content: '你有未保存的修改，确定要离开吗？',
			success: (res) => {
				if (res.confirm) {
					uni.navigateBack()
				}
			}
		})
	} else {
		uni.navigateBack()
	}
}

const saveChanges = () => {
	if (!hasChanges.value) return
	
	uni.showLoading({
		title: '保存中...'
	})
	
	// 模拟API调用
	setTimeout(() => {
		uni.hideLoading()
		uni.showToast({
			title: '保存成功',
			icon: 'success'
		})
		
		// 更新原始数据
		originalSelectedAreas.value = [...selectedAreas.value]
		
		// 更新本地存储
		const userInfo = uni.getStorageSync('userInfo') || {}
		userInfo.researchAreas = selectedAreas.value
		uni.setStorageSync('userInfo', userInfo)
		
		// 发送事件通知其他页面更新
		uni.$emit('researchAreasUpdated', selectedAreas.value)
		
		// 延迟返回上一页
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)
	}, 1000)
}

const removeArea = (index) => {
	selectedAreas.value.splice(index, 1)
}

const toggleArea = (area) => {
	if (isSelected(area.id)) {
		// 取消选择
		selectedAreas.value = selectedAreas.value.filter(item => item.id !== area.id)
	} else {
		// 选择新的方向（替换当前选择）
		selectedAreas.value = [area]
	}
}

const isSelected = (areaId) => {
	return selectedAreas.value.some(area => area.id === areaId)
}

// 删除 isDisabled 方法，因为现在不需要禁用逻辑
</script>



<style scoped>
.container {
	min-height: 100vh;
	background: #f2f2f7;
	display: flex;
	flex-direction: column;
}

/* 顶部导航栏 */
.nav-bar {
	background: rgba(255, 255, 255, 0.95);
	padding: 20rpx 32rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: sticky;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.nav-left {
	width: 120rpx;
}

.back-icon {
	width: 32rpx;
	height: 32rpx;
}

.nav-title {
  font-size: 33rpx;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.5rpx;
}

.nav-right {
	width: 120rpx;
	display: flex;
	justify-content: flex-end;
}

.save-button {
	font-size: 32rpx;
	color: #c7c7cc;
	transition: color 0.3s ease;
}

.save-button.active {
	color: #007aff;
	font-weight: 500;
}

.content {
	flex: 1;
	padding: 32rpx;
}

/* 说明文字 */
.instruction-section {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 32rpx;
	margin-bottom: 32rpx;
}

.instruction-text {
	font-size: 28rpx;
	color: #8e8e93;
	line-height: 1.5;
}

/* 已选方向 */
.selected-section {
	margin-bottom: 32rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #000000;
	margin-bottom: 20rpx;
	display: block;
}

.selected-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
}

.selected-tag {
	background: linear-gradient(135deg, #007AFF, #5856D6);
	border-radius: 20rpx;
	padding: 16rpx 24rpx;
	display: flex;
	align-items: center;
	margin-right: 0;
	margin-bottom: 0;
}

.selected-tag .tag-text {
	font-size: 26rpx;
	font-weight: 500;
	color: #fff;
	margin-right: 8rpx;
}

.remove-button {
	width: 32rpx;
	height: 32rpx;
	border-radius: 16rpx;
	background: rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
}

.remove-icon {
	font-size: 24rpx;
	color: #fff;
	font-weight: 600;
	line-height: 1;
}

/* 可选方向列表 */
.available-section {
	margin-bottom: 32rpx;
}

.available-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
}

.available-tag {
	background: #F2F2F7;
	border-radius: 20rpx;
	padding: 16rpx 24rpx;
	display: flex;
	align-items: center;
	transition: all 0.3s ease;
	border: 2rpx solid transparent;
	min-height: 48rpx;
	margin-right: 0;
	margin-bottom: 0;
}

.available-tag.selected {
	background: linear-gradient(135deg, #007AFF, #5856D6);
}

.available-tag .tag-text {
	font-size: 26rpx;
	font-weight: 500;
	color: #1d1d1f;
	transition: color 0.3s ease;
}

.available-tag.selected .tag-text {
	color: #fff;
}

.check-icon {
	font-size: 24rpx;
	color: #fff;
	margin-right: 8rpx;
	font-weight: bold;
}

/* 活跃状态 */
.available-tag:not(.selected):active {
	background: #e0e0e0;
	transform: scale(0.95);
}

.available-tag.selected:active {
	background: #0051d5;
	transform: scale(0.95);
}
</style>