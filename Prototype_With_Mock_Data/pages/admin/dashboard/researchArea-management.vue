<template>
    <view class="research-management-container">
      <!-- 顶部导航栏 -->
      <view class="nav-bar">
        <view class="nav-left" @click="handleBack">
          <text class="back-arrow">←</text>
        </view>
        <text class="nav-title">研究方向管理</text>
        <view class="nav-right" @click="showAddModal">
          <view class="add-button">
            <text class="add-icon">+</text>
          </view>
        </view>
      </view>
  
      <!-- 标签页切换 -->
      <view class="tab-switcher">
        <view 
          v-for="(tab, index) in tabs" 
          :key="index"
          :class="['tab-item', { 'active': currentTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          <text class="tab-text">{{ tab.label }}</text>
          <view v-if="tab.count > 0" class="tab-badge">
            <text class="badge-text">{{ tab.count }}</text>
          </view>
        </view>
      </view>
  
      <scroll-view class="content-area" scroll-y="true">
        <!-- 搜索栏 -->
        <view class="search-section">
          <view class="search-container">
            <input 
              v-model="searchKeyword"
              class="search-input"
              :placeholder="currentTab === 'all' ? '搜索研究方向' : '搜索待审核方向'"
              placeholder-class="search-placeholder"
            />
            <view class="search-icon">
              <text class="icon-text">🔍</text>
            </view>
          </view>
        </view>
  
        <!-- 所有方向页面 -->
        <view v-if="currentTab === 'all'" class="all-areas-tab">
          <!-- 统计信息 -->
          <view class="stats-section">
            <text class="stats-text">共 {{ filteredAllAreas.length }} 个研究方向</text>
            <view v-if="selectedAreas.length > 0" class="batch-actions">
              <text class="selected-count">已选择 {{ selectedAreas.length }} 项</text>
              <view class="batch-delete-button" @click="showBatchDeleteConfirm">
                <text class="batch-delete-text">批量删除</text>
              </view>
            </view>
          </view>

          <!-- 研究方向列表 -->
          <view v-if="filteredAllAreas.length > 0" class="areas-list">
            <view 
              v-for="(area, index) in filteredAllAreas" 
              :key="area.id" 
              class="area-item"
              @longpress="toggleAreaSelection(area)"
            >
              <!-- 选择框（多选模式时显示） -->
              <view v-if="isMultiSelectMode" class="select-checkbox" @click="toggleAreaSelection(area)">
                <view :class="['checkbox', { 'checked': isAreaSelected(area) }]">
                  <text v-if="isAreaSelected(area)" class="check-mark">✓</text>
                </view>
              </view>
  
              <!-- 方向信息 -->
              <view class="area-info">
                <view class="area-header">
                  <text class="area-name">{{ area.name }}</text>
                  <view v-if="area.isNew" class="new-badge">
                    <text class="badge-text">新增</text>
                  </view>
                </view>
                <text class="area-usage">被 {{ area.userCount }} 位用户使用</text>
                <text class="area-date">创建时间：{{ area.createDate }}</text>
              </view>
  
              <!-- 操作按钮 -->
              <view v-if="!isMultiSelectMode" class="area-actions">
                <view class="action-button edit" @click="editArea(area)">
                  <text class="action-icon">✏️</text>
                </view>
                <view class="action-button delete" @click="showDeleteConfirm(area)">
                  <text class="action-icon">🗑️</text>
                </view>
              </view>
            </view>
          </view>
  
          <!-- 空状态 -->
          <view v-else class="empty-state">
            <text class="empty-icon">🏷️</text>
            <text class="empty-title">{{ searchKeyword ? '未找到匹配的研究方向' : '暂无研究方向' }}</text>
            <text class="empty-subtitle">{{ searchKeyword ? '请尝试其他搜索关键词' : '点击右上角"+"按钮添加新的研究方向' }}</text>
          </view>
        </view>
  
        <!-- 待审核页面 -->
        <view v-else-if="currentTab === 'pending'" class="pending-areas-tab">
          <!-- 统计信息 -->
          <view class="stats-section">
            <text class="stats-text">共 {{ filteredPendingAreas.length }} 个待审核方向</text>
          </view>
  
          <!-- 待审核列表 -->
          <view v-if="filteredPendingAreas.length > 0" class="pending-list">
            <view 
              v-for="(area, index) in filteredPendingAreas" 
              :key="area.id" 
              class="pending-item"
            >
              <!-- 方向信息 -->
              <view class="pending-info">
                <view class="pending-header">
                  <text class="pending-name">{{ area.name }}</text>
                </view>
                <text class="submitter-info">提交人：{{ area.submitter }} ({{ area.submitterType }})</text>
                <text class="submit-date">提交时间：{{ area.submitDate }}</text>
              </view>
  
              <!-- 审核操作 -->
              <view class="review-actions">
                <view class="action-button approve" @click="approveArea(area)">
                  <text class="action-text">通过</text>
                </view>
                <view class="action-button reject" @click="showRejectModal(area)">
                  <text class="action-text">拒绝</text>
                </view>
              </view>
            </view>
          </view>
  
          <!-- 空状态 -->
          <view v-else class="empty-state">
            <text class="empty-icon">✅</text>
            <text class="empty-title">{{ searchKeyword ? '未找到匹配的待审核方向' : '暂无待审核方向' }}</text>
            <text class="empty-subtitle">{{ searchKeyword ? '请尝试其他搜索关键词' : '所有提交的研究方向已处理完毕' }}</text>
          </view>
        </view>
  
        <!-- 底部间距 -->
        <view class="bottom-space"></view>
      </scroll-view>
  
      <!-- 添加方向弹窗 -->
      <view v-if="showAddAreaModal" class="modal-overlay" @click="hideAddModal">
        <view class="add-modal-content" @click.stop>
          <view class="modal-header">
            <text class="modal-title">{{ editingArea ? '编辑研究方向' : '添加研究方向' }}</text>
            <view class="close-button" @click="hideAddModal">
              <text class="close-text">✕</text>
            </view>
          </view>
          
          <view class="modal-body">
            <view class="form-group">
              <text class="form-label">方向名称</text>
              <input v-model="newAreaName" class="form-input" placeholder="请输入研究方向名称" />
            </view>
          </view>
          
          <view class="modal-actions">
            <view class="modal-button cancel" @click="hideAddModal">
              <text class="button-text">取消</text>
            </view>
            <view class="modal-button confirm" @click="confirmAddArea">
              <text class="button-text">{{ editingArea ? '保存' : '添加' }}</text>
            </view>
          </view>
        </view>
      </view>
  
      <!-- 拒绝理由弹窗 -->
      <view v-if="showRejectReasonModal" class="modal-overlay" @click="hideRejectModal">
        <view class="reject-modal-content" @click.stop>
          <view class="modal-header">
            <text class="modal-title">拒绝理由</text>
            <view class="close-button" @click="hideRejectModal">
              <text class="close-text">✕</text>
            </view>
          </view>
          
          <view class="modal-body">
            <view class="form-group">
              <text class="form-label">说明拒绝理由（可选）</text>
              <textarea v-model="rejectReason" class="form-textarea" placeholder="可选择输入理由，将发送给申请人" />
            </view>
          </view>
          
          <view class="modal-actions">
            <view class="modal-button cancel" @click="hideRejectModal">
              <text class="button-text">取消</text>
            </view>
            <view class="modal-button danger" @click="confirmReject">
              <text class="button-text">确认拒绝</text>
            </view>
          </view>
        </view>
      </view>
  
      <!-- 删除确认弹窗 -->
      <view v-if="showDeleteModal" class="modal-overlay" @click="hideDeleteModal">
        <view class="modal-content" @click.stop>
          <view class="modal-header">
            <text class="modal-title">确认删除</text>
          </view>
          <view class="modal-body">
            <text class="modal-message">
              确定要删除{{ deletingArea ? `"${deletingArea.name}"` : `${selectedAreas.length}个研究方向` }}吗？
              {{ deletingArea && deletingArea.userCount > 0 ? `此方向被${deletingArea.userCount}位用户使用，删除后他们的方向标签将被移除。` : '' }}
            </text>
          </view>
          <view class="modal-actions">
            <view class="modal-button cancel-button" @click="hideDeleteModal">
              <text class="button-text">取消</text>
            </view>
            <view class="modal-button danger-button" @click="confirmDelete">
              <text class="button-text">删除</text>
            </view>
          </view>
        </view>
      </view>
  
      <!-- 操作成功提示 -->
      <view v-if="showSuccessToast" class="toast-overlay">
        <view class="toast-content">
          <text class="toast-icon">✓</text>
          <text class="toast-text">{{ toastMessage }}</text>
        </view>
      </view>
    </view>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  
  // 响应式数据
  const currentTab = ref('all') // all, pending
  const searchKeyword = ref('')
  const showAddAreaModal = ref(false)
  const showRejectReasonModal = ref(false)
  const showDeleteModal = ref(false)
  const showSuccessToast = ref(false)
  const toastMessage = ref('')
  
  const editingArea = ref(null)
  const deletingArea = ref(null)
  const rejectingArea = ref(null)
  const selectedAreas = ref([])
  const isMultiSelectMode = ref(false)
  
  const newAreaName = ref('')
  const rejectReason = ref('')
  
  const tabs = ref([
    { key: 'all', label: '所有方向', count: 0 },
    { key: 'pending', label: '待审核', count: 3 }
  ])
  
  // 所有研究方向
  const allAreas = ref([
    {
      id: 1,
      name: '人工智能',
      userCount: 15,
      createDate: '2023-01-15',
      isNew: false
    },
    {
      id: 2,
      name: '自然语言处理',
      userCount: 8,
      createDate: '2023-02-20',
      isNew: false
    },
    {
      id: 3,
      name: '计算机视觉',
      userCount: 12,
      createDate: '2023-03-10',
      isNew: false
    },
    {
      id: 4,
      name: '机器学习',
      userCount: 20,
      createDate: '2023-01-05',
      isNew: false
    },
    {
      id: 5,
      name: '深度学习',
      userCount: 18,
      createDate: '2023-02-15',
      isNew: false
    }
  ])
  
  // 待审核方向
  const pendingAreas = ref([
    {
      id: 101,
      name: '联邦学习',
      submitter: '张教授',
      submitterType: '老师',
      submitDate: '2025-06-10'
    },
    {
      id: 102,
      name: '量子计算',
      submitter: '李明',
      submitterType: '博士生',
      submitDate: '2025-06-08'
    },
    {
      id: 103,
      name: '边缘计算',
      submitter: '王教授',
      submitterType: '老师',
      submitDate: '2025-06-05'
    }
  ])
  
  // 计算属性
  const filteredAllAreas = computed(() => {
    if (!searchKeyword.value.trim()) {
      return allAreas.value
    }
    const keyword = searchKeyword.value.toLowerCase()
    return allAreas.value.filter(area => 
      area.name.toLowerCase().includes(keyword)
    )
  })
  
  const filteredPendingAreas = computed(() => {
    if (!searchKeyword.value.trim()) {
      return pendingAreas.value
    }
    const keyword = searchKeyword.value.toLowerCase()
    return pendingAreas.value.filter(area => 
      area.name.toLowerCase().includes(keyword) || 
      area.submitter.toLowerCase().includes(keyword)
    )
  })
  
  onMounted(() => {
    console.log('研究方向管理页面已加载')
    updateTabCounts()
  })
  
  // 方法定义
  const handleBack = () => {
	uni.redirectTo({
		url: '/pages/admin/dashboard/dashboard'
	})
  }
  
  const switchTab = (tabKey) => {
    currentTab.value = tabKey
    searchKeyword.value = ''
    selectedAreas.value = []
    isMultiSelectMode.value = false
  }
  
  const updateTabCounts = () => {
    // 移除"所有方向"的数字显示
    tabs.value[0].count = 0
    tabs.value[1].count = pendingAreas.value.length
  }
  
  const showAddModal = () => {
    editingArea.value = null
    newAreaName.value = ''
    showAddAreaModal.value = true
  }
  
  const hideAddModal = () => {
    showAddAreaModal.value = false
    editingArea.value = null
  }
  
  const editArea = (area) => {
    editingArea.value = area
    newAreaName.value = area.name
    showAddAreaModal.value = true
  }
  
  const confirmAddArea = () => {
    if (!newAreaName.value.trim()) {
      uni.showToast({
        title: '请输入方向名称',
        icon: 'none'
      })
      return
    }
  
    // 检查是否重复
    const exists = allAreas.value.some(area => 
      area.name.toLowerCase() === newAreaName.value.trim().toLowerCase() && 
      (!editingArea.value || area.id !== editingArea.value.id)
    )
  
    if (exists) {
      uni.showToast({
        title: '该研究方向已存在',
        icon: 'none'
      })
      return
    }
  
    if (editingArea.value) {
      // 编辑模式
      const index = allAreas.value.findIndex(area => area.id === editingArea.value.id)
      if (index > -1) {
        allAreas.value[index].name = newAreaName.value.trim()
      }
      showToast('修改成功')
    } else {
      // 添加模式
      const newArea = {
        id: Date.now(),
        name: newAreaName.value.trim(),
        userCount: 0,
        createDate: new Date().toLocaleDateString(),
        isNew: true
      }
      allAreas.value.unshift(newArea)
      showToast('添加成功')
    }
  
    hideAddModal()
    updateTabCounts()
  }
  
  const toggleAreaSelection = (area) => {
    if (!isMultiSelectMode.value) {
      isMultiSelectMode.value = true
    }
    
    const index = selectedAreas.value.findIndex(a => a.id === area.id)
    if (index > -1) {
      selectedAreas.value.splice(index, 1)
    } else {
      selectedAreas.value.push(area)
    }
    
    if (selectedAreas.value.length === 0) {
      isMultiSelectMode.value = false
    }
  }
  
  const isAreaSelected = (area) => {
    return selectedAreas.value.some(a => a.id === area.id)
  }
  
  const showDeleteConfirm = (area) => {
    deletingArea.value = area
    showDeleteModal.value = true
  }
  
  const showBatchDeleteConfirm = () => {
    deletingArea.value = null
    showDeleteModal.value = true
  }
  
  const hideDeleteModal = () => {
    showDeleteModal.value = false
    deletingArea.value = null
  }
  
  const confirmDelete = () => {
    if (deletingArea.value) {
      // 删除单个
      const index = allAreas.value.findIndex(a => a.id === deletingArea.value.id)
      if (index > -1) {
        allAreas.value.splice(index, 1)
      }
      showToast('删除成功')
    } else {
      // 批量删除
      selectedAreas.value.forEach(selectedArea => {
        const index = allAreas.value.findIndex(a => a.id === selectedArea.id)
        if (index > -1) {
          allAreas.value.splice(index, 1)
        }
      })
      showToast(`已删除${selectedAreas.value.length}个研究方向`)
      selectedAreas.value = []
      isMultiSelectMode.value = false
    }
  
    hideDeleteModal()
    updateTabCounts()
  }
  
  const approveArea = (area) => {
    // 将待审核方向添加到所有方向中
    const newArea = {
      id: Date.now(),
      name: area.name,
      userCount: 0,
      createDate: new Date().toLocaleDateString(),
      isNew: true
    }
    
    allAreas.value.unshift(newArea)
    
    // 从待审核列表中移除
    const index = pendingAreas.value.findIndex(p => p.id === area.id)
    if (index > -1) {
      pendingAreas.value.splice(index, 1)
    }
    
    updateTabCounts()
    showToast(`"${area.name}"已通过审核`)
  }
  
  const showRejectModal = (area) => {
    rejectingArea.value = area
    rejectReason.value = ''
    showRejectReasonModal.value = true
  }
  
  const hideRejectModal = () => {
    showRejectReasonModal.value = false
    rejectingArea.value = null
  }
  
  const confirmReject = () => {
    // 从待审核列表中移除
    const index = pendingAreas.value.findIndex(p => p.id === rejectingArea.value.id)
    if (index > -1) {
      pendingAreas.value.splice(index, 1)
    }
    
    // 如果有理由就发送理由，没有理由就发送默认信息
      if (rejectReason.value.trim()) {
        console.log('拒绝理由:', rejectReason.value)
      } else {
        console.log('管理员拒绝了申请')
      }
    
    updateTabCounts()
    showToast(`已拒绝"${rejectingArea.value.name}"的申请`)
    hideRejectModal()
  }
  
  const showToast = (message) => {
    toastMessage.value = message
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 2000)
  }
  </script>
  
  
  
  <style scoped>
  .research-management-container {
    min-height: 100vh;
    background: #f2f2f7;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  
  /* 顶部导航栏 */
  .nav-bar {
    width: 100%;
    height: 88rpx;
    background: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32rpx;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1rpx solid #e5e5e7;
  }
  
  .nav-left {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -2rpx;
    cursor: pointer;
  }
  
  .back-arrow {
    color: #007aff;
    font-size: 36rpx;
    font-weight: bold;
  }
  
  .nav-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .nav-right {
    display: flex;
    align-items: center;
	margin-right: 63rpx;
  }
  
  .add-button {
    width: 60rpx;
    height: 60rpx;
    border-radius: 16rpx;
    background: #F2F2F7;
    border: 2rpx solid #E5E5E7;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .add-button:active {
    transform: scale(0.95);
    background: #E5E5E7;
  }
  
  .add-icon {
    font-size: 38rpx;
    color: #007AFF;
    font-weight: 600;
  }
  
  /* 标签页切换 */
  .tab-switcher {
    background: white;
    display: flex;
    margin-left: 0;
    margin-right: 0;
    border-bottom: 1rpx solid #e5e5e7;
    box-sizing: border-box;
  }
  
  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28rpx 20rpx;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .tab-item.active {
    background: #F2F2F7;
  }
  
  .tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(135deg, #007AFF, #5856D6);
  }
  
  .tab-text {
    font-size: 28rpx;
    color: #8E8E93;
    font-weight: 500;
    margin-right: 8rpx;
  }
  
  .tab-item.active .tab-text {
    color: #007AFF;
    font-weight: 600;
  }
  
  .tab-badge {
    background: #FF3B30;
    border-radius: 12rpx;
    padding: 4rpx 12rpx;
    min-width: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .badge-text {
    font-size: 20rpx;
    color: white;
    font-weight: 600;
  }
  
  /* 内容区域 */
  .content-area {
    flex: 1;
    padding: 0 24rpx 40rpx 24rpx;
    box-sizing: border-box;
  }
  
  /* 搜索栏 */
  .search-section {
    padding: 24rpx 0;
  }
  
  .search-container {
    position: relative;
  }
  
  .search-input {
    width: 100%;
    height: 72rpx;
    background: white;
    border-radius: 16rpx;
    padding: 0 24rpx 0 56rpx;
    font-size: 28rpx;
    color: #1d1d1f;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    border: 1rpx solid #e5e5e7;
  }
  
  .search-input:focus {
    border-color: #007AFF;
  }
  
  .search-placeholder {
    color: #C7C7CC;
  }
  
  .search-icon {
    position: absolute;
    left: 20rpx;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .icon-text {
    font-size: 28rpx;
    color: #8E8E93;
  }
  
  /* 统计信息 */
  .stats-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 8rpx;
    margin-bottom: 16rpx;
  }
  
  .stats-text {
    font-size: 26rpx;
    color: #8E8E93;
    font-weight: 500;
  }
  
  .batch-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  
  .selected-count {
    font-size: 24rpx;
    color: #007AFF;
    font-weight: 500;
  }
  
  .batch-delete-button {
    background: #FF3B30;
    border-radius: 12rpx;
    padding: 8rpx 16rpx;
  }
  
  .batch-delete-text {
    font-size: 22rpx;
    color: white;
    font-weight: 500;
  }
  
  /* 研究方向列表 */
  .areas-list {
    background: white;
    border-radius: 16rpx;
    border: 1rpx solid #e5e5e7;
    overflow: hidden;
  }
  
  .area-item {
    display: flex;
    align-items: center;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid #e5e5e7;
    transition: all 0.3s ease;
  }
  
  .area-item:last-child {
    border-bottom: none;
  }
  
  .area-item:active {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  .select-checkbox {
    margin-right: 20rpx;
  }
  
  .checkbox {
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid #C7C7CC;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .checkbox.checked {
    background: linear-gradient(135deg, #007AFF, #5856D6);
    border-color: #007AFF;
  }
  
  .check-mark {
    font-size: 24rpx;
    color: white;
    font-weight: 600;
  }
  
  .area-info {
    flex: 1;
    margin-right: 16rpx;
  }
  
  .area-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 8rpx;
  }
  
  .area-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .new-badge {
    background: linear-gradient(135deg, #FF9500, #FF6B35);
    border-radius: 8rpx;
    padding: 0rpx 10rpx 0rpx 10rpx;
  }
  
  .area-usage {
    font-size: 24rpx;
    color: #8E8E93;
    display: block;
    margin-bottom: 4rpx;
  }
  
  .area-date {
    font-size: 22rpx;
    color: #C7C7CC;
    display: block;
  }
  
  .area-actions {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  
  .action-button {
    width: 56rpx;
    height: 56rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .action-button.edit {
    background: linear-gradient(135deg, #007AFF, #5856D6);
  }
  
  .action-button.delete {
    background: linear-gradient(135deg, #FF3B30, #FF2D20);
  }
  
  .action-button.approve {
    background: linear-gradient(135deg, #34C759, #30D158);
    padding: 16rpx 24rpx;
    border-radius: 16rpx;
    width: auto;
  }
  
  .action-button.reject {
    background: linear-gradient(135deg, #FF3B30, #FF2D20);
    padding: 16rpx 24rpx;
    border-radius: 16rpx;
    width: auto;
  }
  
  .action-button:active {
    transform: scale(0.9);
  }
  
  .action-icon {
    font-size: 28rpx;
    color: white;
  }
  
  .action-text {
    font-size: 24rpx;
    color: white;
    font-weight: 500;
  }
  
  /* 待审核列表 */
  .pending-list {
    background: white;
    border-radius: 16rpx;
    border: 1rpx solid #e5e5e7;
    overflow: hidden;
  }
  
  .pending-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid #e5e5e7;
  }
  
  .pending-item:last-child {
    border-bottom: none;
  }
  
  .pending-info {
    flex: 1;
    margin-right: 16rpx;
  }
  
  .pending-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 8rpx;
  }
  
  .pending-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .submitter-info {
    font-size: 24rpx;
    color: #007AFF;
    display: block;
    margin-bottom: 4rpx;
    font-weight: 500;
  }
  
  .submit-date {
    font-size: 22rpx;
    color: #8E8E93;
    display: block;
    margin-bottom: 4rpx;
  }
  
  .review-actions {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  
  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 120rpx 40rpx;
  }
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 24rpx;
    display: block;
  }
  
  .empty-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 12rpx;
    display: block;
  }
  
  .empty-subtitle {
    font-size: 26rpx;
    color: #8E8E93;
    display: block;
    line-height: 1.4;
  }
  
  /* 底部间距 */
  .bottom-space {
    height: 40rpx;
  }
  
  /* 模态框样式 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(10rpx);
  }
  
  .modal-content,
  .add-modal-content,
  .reject-modal-content {
    background: white;
    border-radius: 28rpx;
    width: 90vw;
    max-width: 640rpx;
    overflow: hidden;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    padding: 32rpx;
    border-bottom: 1rpx solid #e5e5e7;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .close-button {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background: #F2F2F7;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-text {
    font-size: 24rpx;
    color: #8E8E93;
    font-weight: 600;
  }
  
  .modal-body {
    padding: 32rpx;
  }
  
  .modal-message {
    font-size: 28rpx;
    color: #8E8E93;
    line-height: 1.4;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 32rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .form-label {
    font-size: 26rpx;
    color: #1d1d1f;
    font-weight: 500;
    display: block;
    margin-bottom: 12rpx;
  }
  
  .form-input {
    width: 100%;
    height: 80rpx;
    background: #F2F2F7;
    border-radius: 16rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #1d1d1f;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
  }
  
  .form-input:focus {
    border-color: #007AFF;
    background: white;
  }
  
  .form-textarea {
    width: 80%;
    min-width: 200rpx;
    max-width: 100%;
    margin: 0 auto;
    min-height: 160rpx;
    background: #F2F2F7;
    border-radius: 16rpx;
    padding: 24rpx;
    font-size: 28rpx;
    color: #1d1d1f;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    resize: none;
  }
  
  .form-textarea:focus {
    border-color: #007AFF;
    background: white;
  }
  
  .modal-actions {
    border-top: 1rpx solid #e5e5e7;
    display: flex;
  }
  
  .modal-button {
    flex: 1;
    padding: 28rpx;
    text-align: center;
    transition: background-color 0.2s ease;
  }
  
  .modal-button:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .modal-button.cancel {
    border-right: 1rpx solid #e5e5e7;
  }
  
  .modal-button.cancel .button-text,
  .cancel-button .button-text {
    color: #8E8E93;
    font-size: 30rpx;
    font-weight: 500;
  }
  
  .modal-button.confirm .button-text {
    color: #007AFF;
    font-size: 30rpx;
    font-weight: 600;
  }
  
  .modal-button.danger .button-text,
  .danger-button .button-text {
    color: #FF3B30;
    font-size: 30rpx;
    font-weight: 600;
  }
  
  .button-text {
    font-size: 30rpx;
    font-weight: 500;
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
    z-index: 3000;
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
</style>