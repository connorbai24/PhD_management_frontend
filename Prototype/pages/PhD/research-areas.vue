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
				<text class="instruction-text">请从以下列表中选择一个研究方向，这将有助于系统为你匹配最合适的评审老师。</text>
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
import { fetchResearchDirections, fetchStudentInfo, updateResearchArea } from './PhD_API.js'

// 响应式数据
const originalSelectedAreas = ref([])
const selectedAreas = ref([])
const availableAreas = ref([])

// 通用的API响应处理函数
const handleApiResponse = (response, dataType) => {
  console.log(`${dataType} API原始返回:`, response);
  
  if (!response) {
    throw new Error('API响应为空');
  }
  
  // 检查HTTP状态
  if (response.statusCode !== 200) {
    let errorMessage = `HTTP状态错误: ${response.statusCode}`;
    
    // 对于400错误，尝试获取更详细的错误信息
    if (response.statusCode === 400) {
      if (response.data && response.data.message) {
        errorMessage += ` - ${response.data.message}`;
      } else {
        errorMessage += ' - 请求参数错误，请检查数据格式';
      }
      console.error('400错误详情:', {
        statusCode: response.statusCode,
        data: response.data,
        headers: response.header
      });
    }
    
    throw new Error(errorMessage);
  }
  
  // 检查响应数据结构
  if (!response.data) {
    throw new Error('响应数据为空');
  }
  
  // 检查业务状态码
  if (response.data.code !== 200) {
    throw new Error(`业务错误: ${response.data.message || '未知错误'}`);
  }
  
  return response.data.data;
}

// 检查登录状态
const checkLoginStatus = () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    console.log('未找到token，跳转到登录页');
    uni.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: false,
      success: () => {
        uni.redirectTo({
          url: '/pages/login/login'
        });
      }
    });
    return false;
  }
  console.log('Token存在，开始加载研究方向数据');
  return true;
}

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
	console.log('Research Areas页面挂载完毕');
	loadResearchAreas()
})

// 加载研究方向数据
const loadResearchAreas = async () => {
	console.log('开始加载研究方向数据...');
	
	// 检查登录状态
	if (!checkLoginStatus()) {
		return;
	}
	
	// 并行获取所有可选方向和用户已选方向
	try {
		await Promise.all([
			loadAvailableAreas(),
			loadUserSelectedAreas()
		]);
		console.log('研究方向数据加载完成');
	} catch (error) {
		console.error('加载研究方向数据失败:', error);
	}
}

// 获取所有可选方向
const loadAvailableAreas = async () => {
	console.log('获取所有可选研究方向...');
	try {
		const response = await fetchResearchDirections();
		const data = handleApiResponse(response, '可选研究方向');
		
		console.log('可选研究方向API成功，解析后的data:', data);
		
		// 处理数据结构 - 兼容不同格式
		let areas = [];
		if (Array.isArray(data)) {
			areas = data;
		} else if (data.list) {
			areas = data.list;
		} else if (data.records) {
			areas = data.records;
		} else {
			console.warn('研究方向数据结构异常:', data);
		}
		
		// 确保每个方向都有正确的id和name属性
		availableAreas.value = areas.map(area => {
			let processedArea = {};
			
			if (typeof area === 'string') {
				// 如果是字符串，可能需要转换为数字ID（这种情况比较少见）
				processedArea = { id: area, name: area };
			} else if (area && typeof area === 'object') {
				// 处理对象格式
				let areaId = area.id || area.skillId || area.value;
				let areaName = area.name || area.skillName || area.label || area.text;
				
				// 确保ID是数字类型
				if (typeof areaId === 'string' && !isNaN(areaId)) {
					areaId = parseInt(areaId);
				}
				
				processedArea = {
					id: areaId,
					name: areaName || '未知方向'
				};
			} else {
				console.warn('研究方向数据格式异常:', area);
				processedArea = { id: 'unknown', name: '未知方向' };
			}
			
			console.log('处理研究方向数据:', { original: area, processed: processedArea });
			return processedArea;
		});
		
		console.log('处理后的可选方向:', availableAreas.value);
		
	} catch (error) {
		console.error('获取可选研究方向失败:', error);
		uni.showToast({ 
			title: `获取研究方向失败: ${error.message}`, 
			icon: 'none',
			duration: 3000
		});
	}
}

// 获取用户已选方向
const loadUserSelectedAreas = async () => {
	console.log('获取用户已选研究方向...');
	try {
		const response = await fetchStudentInfo();
		const data = handleApiResponse(response, '用户信息');
		
		console.log('用户信息API成功，解析后的data:', data);
		
		// 处理用户已选的研究方向
		let userSelectedAreas = [];
		
		if (data.researchAreas && Array.isArray(data.researchAreas)) {
			userSelectedAreas = data.researchAreas;
		} else if (data.researchArea) {
			// 如果后端返回单个研究方向对象
			if (typeof data.researchArea === 'object' && data.researchArea.id) {
				userSelectedAreas = [data.researchArea];
			} else if (typeof data.researchArea === 'string') {
				userSelectedAreas = [{ id: data.researchArea, name: data.researchArea }];
			}
		} else if (data.researchAreaName) {
			// 如果只有名称
			userSelectedAreas = [{ id: data.researchAreaName, name: data.researchAreaName }];
		}
		
		// 确保数据格式正确
		userSelectedAreas = userSelectedAreas.map(area => {
			let processedArea = {};
			
			if (typeof area === 'string') {
				processedArea = { id: area, name: area };
			} else if (area && typeof area === 'object') {
				let areaId = area.id || area.skillId;
				let areaName = area.name || area.skillName;
				
				// 确保ID是数字类型（如果可以转换的话）
				if (typeof areaId === 'string' && !isNaN(areaId)) {
					areaId = parseInt(areaId);
				}
				
				processedArea = {
					id: areaId || areaName || 'unknown',
					name: areaName || '未知方向'
				};
			} else {
				processedArea = { id: 'unknown', name: '未知方向' };
			}
			
			console.log('处理用户已选方向:', { original: area, processed: processedArea });
			return processedArea;
		});
		
		originalSelectedAreas.value = [...userSelectedAreas];
		selectedAreas.value = [...userSelectedAreas];
		
		console.log('用户已选研究方向:', selectedAreas.value);
		
	} catch (error) {
		console.error('获取用户已选研究方向失败:', error);
		// 这里不显示错误toast，因为可能只是用户还没有选择研究方向
		console.log('用户可能还没有选择研究方向，设为空数组');
		originalSelectedAreas.value = [];
		selectedAreas.value = [];
	}
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

const saveChanges = async () => {
	console.log('开始保存研究方向修改...');
	
	if (!hasChanges.value) {
		console.log('没有修改，无需保存');
		return;
	}
	
	if (selectedAreas.value.length === 0) {
		uni.showToast({ title: '请至少选择一个研究方向', icon: 'none' })
		return
	}
	
	if (selectedAreas.value.length > 1) {
		uni.showToast({ title: '只能选择一个研究方向', icon: 'none' })
		return
	}
	
	uni.showLoading({ title: '保存中...' })
	
	try {
		// 根据API文档，updateResearchArea接受单个研究方向ID
		const selectedArea = selectedAreas.value[0];
		let areaId = selectedArea.id;
		
		// 确保skillId是数字类型
		if (typeof areaId === 'string') {
			areaId = parseInt(areaId);
			if (isNaN(areaId)) {
				throw new Error('研究方向ID格式错误');
			}
		}
		
		console.log('保存的研究方向信息:', {
			selectedArea: selectedArea,
			areaId: areaId,
			areaIdType: typeof areaId
		});
		
		const response = await updateResearchArea(areaId);
		const result = handleApiResponse(response, '保存研究方向');
		
		uni.hideLoading();
		
		console.log('保存研究方向成功:', result);
		
		uni.showToast({ title: '保存成功', icon: 'success' });
		originalSelectedAreas.value = [...selectedAreas.value];
		
		setTimeout(() => {
			uni.navigateBack()
		}, 1500);
		
	} catch (error) {
		uni.hideLoading();
		console.error('保存研究方向失败:', error);
		console.error('完整错误信息:', {
			message: error.message,
			selectedAreas: selectedAreas.value,
			availableAreas: availableAreas.value
		});
		uni.showToast({ 
			title: `保存失败: ${error.message}`, 
			icon: 'none',
			duration: 3000
		});
	}
}

const removeArea = (index) => {
	console.log('移除研究方向，索引:', index);
	selectedAreas.value.splice(index, 1)
}

const toggleArea = (area) => {
	console.log('切换研究方向:', area);
	
	if (isSelected(area.id)) {
		// 取消选择
		selectedAreas.value = []
		console.log('取消选择研究方向');
	} else {
		// 单选：只保留当前选择，替换原有选择
		selectedAreas.value = [area]
		console.log('选择研究方向:', area.name);
	}
}

const isSelected = (areaId) => {
	return selectedAreas.value.some(area => area.id === areaId)
}
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
	margin-left: 12rpx;
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