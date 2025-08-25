<template>
  <view class="user-management-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="handleBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="nav-title">用户管理</text>
      <view class="nav-right" @click="showAddUserModal">
        <view class="add-button">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>

    <!-- 用户类型切换 -->
    <view class="user-type-switcher">
      <view 
        v-for="(type, index) in userTypes" 
        :key="index"
        :class="['type-tab', { 'active': currentUserType === type.key }]"
        @click="switchUserType(type.key)"
      >
        <text class="tab-text">{{ type.label }}</text>
      </view>
    </view>

    <!-- 操作栏 -->
    <view class="operation-bar">
      <view class="search-container">
        <input 
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索姓名、学号或工号"
          placeholder-class="search-placeholder"
          @input="handleSearch"
        />
        <view class="search-icon">
          <text class="icon-text">🔍</text>
        </view>
      </view>
      
      <view class="import-button" @click="handleImportExcel">
        <text class="import-text">从Excel导入</text>
      </view>
    </view>

    <!-- 用户列表 -->
    <scroll-view class="user-list-container" scroll-y="true">
      <!-- 列表头部统计 -->
      <view class="list-header">
        <text class="list-stats">共 {{ filteredUsers.length }} 位{{ getCurrentUserTypeLabel() }}</text>
        <view v-if="selectedUsers.length > 0" class="batch-actions">
          <text class="selected-count">已选择 {{ selectedUsers.length }} 项</text>
          <view class="batch-delete-button" @click="showBatchDeleteConfirm">
            <text class="batch-delete-text">批量删除</text>
          </view>
        </view>
      </view>

      <!-- 用户列表 -->
      <view v-if="filteredUsers.length > 0" class="user-list">
        <view 
          v-for="(user, index) in filteredUsers" 
          :key="user.id" 
          class="user-item"
          @longpress="toggleUserSelection(user)"
        >
          <!-- 选择框（多选模式时显示） -->
          <view v-if="isMultiSelectMode" class="select-checkbox" @click="toggleUserSelection(user)">
            <view :class="['checkbox', { 'checked': isUserSelected(user) }]">
              <text v-if="isUserSelected(user)" class="check-mark">✓</text>
            </view>
          </view>

          <!-- 用户头像 -->
          <view class="user-avatar">
            <text class="avatar-text">{{ getUserAvatarText(user.name) }}</text>
          </view>

          <!-- 用户信息 -->
          <view class="user-info">
            <text class="user-name">{{ user.name }}</text>
            <text class="user-id">{{ currentUserType === 'phd' ? user.studentId : user.employeeId }}</text>
            <text class="user-email">{{ user.email }}</text>
            <view v-if="currentUserType === 'phd' && user.supervisors && user.supervisors.length > 0" class="supervisors-info">
              <text class="supervisors-text">导师: {{ getSupervisorsText(user.supervisors) }}</text>
            </view>
            <view v-if="user.researchAreas && user.researchAreas.length > 0" class="research-areas">
              <text class="research-areas-text">{{ user.researchAreas.join('、') }}</text>
            </view>
          </view>

          <!-- 用户状态 -->
          <view class="user-status">
            <view :class="['status-dot', user.status]"></view>
            <text class="status-text">{{ getStatusText(user.status) }}</text>
          </view>

          <!-- 操作按钮 -->
          <view v-if="!isMultiSelectMode" class="user-actions">
            <view class="action-button edit" @click="editUser(user)">
              <text class="action-icon">✏️</text>
            </view>
            <view class="action-button delete" @click="showDeleteConfirm(user)">
              <text class="action-icon">🗑️</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">👥</text>
        <text class="empty-title">{{ searchKeyword ? '未找到匹配的用户' : '暂无' + getCurrentUserTypeLabel() }}</text>
        <text class="empty-subtitle">{{ searchKeyword ? '请尝试其他搜索关键词' : '点击右上角"+"按钮添加用户' }}</text>
      </view>

      <!-- 底部间距 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 添加用户模态框 -->
    <view v-if="showAddModal" class="modal-overlay" @click="hideAddModal">
      <view class="add-modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加{{ getCurrentUserTypeLabel() }}</text>
          <view class="close-button" @click="hideAddModal">
            <text class="close-text">✕</text>
          </view>
        </view>
        
        <scroll-view class="modal-body" scroll-y="true">
          <view class="form-group">
            <text class="form-label">姓名</text>
            <input v-model="newUser.name" class="form-input" placeholder="请输入姓名" />
          </view>
          
          <view class="form-group">
            <text class="form-label">{{ currentUserType === 'phd' ? '学号' : '工号' }}</text>
            <input v-model="newUser.id" class="form-input" :placeholder="`请输入${currentUserType === 'phd' ? '学号' : '工号'}`" />
          </view>
          
          <view class="form-group">
            <text class="form-label">邮箱</text>
            <input v-model="newUser.email" class="form-input" placeholder="请输入邮箱地址" />
          </view>
          
          <view v-if="currentUserType === 'phd'" class="form-group">
            <text class="form-label">入学时间</text>
            <picker mode="date" @change="onEnrollmentDateChange">
              <view class="date-picker">
                <text class="date-text">{{ newUser.enrollmentDate || '请选择入学时间' }}</text>
              </view>
            </picker>
          </view>
          
          <view v-if="currentUserType === 'phd'" class="form-group">
            <text class="form-label">导师选择 <text class="required-hint">(最多4位，至少1位主导师)</text></text>
            <view class="supervisor-list">
              <view
                v-for="teacher in availableTeachers"
                :key="teacher.id"
                :class="['supervisor-tag', { 
                  'selected': isTeacherSelected(teacher.id),
                  'main-supervisor': newUser.mainSupervisor === teacher.id
                }]"
                @click="toggleSupervisor(teacher)"
              >
                <text class="supervisor-name">{{ teacher.name }}</text>
                <view v-if="isTeacherSelected(teacher.id)" class="supervisor-actions">
                  <text 
                    v-if="newUser.mainSupervisor === teacher.id" 
                    class="main-tag"
                  >主</text>
                  <text 
                    v-else
                    class="set-main-btn"
                    @click.stop="setMainSupervisor(teacher.id)"
                  >设主</text>
                </view>
              </view>
            </view>
            <view v-if="newUser.supervisors.length > 0" class="selected-supervisors-info">
              <text class="info-text">已选择 {{ newUser.supervisors.length }}/4 位导师</text>
            </view>
          </view>
          
          <view v-if="currentUserType === 'phd'" class="form-group">
            <text class="form-label">研究方向 <text class="required-hint"></text></text>
            <view class="research-area-list">
              <view
                v-for="(area, idx) in researchAreaOptions"
                :key="area"
                :class="['research-area-tag', { selected: newUser.researchAreas.includes(area) }]"
                @click="toggleResearchArea(area)"
              >
                <text>{{ area }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="currentUserType === 'teacher'" class="form-group">
            <text class="form-label">研究方向</text>
            <view class="research-area-list">
              <view
                v-for="(area, idx) in researchAreaOptions"
                :key="area"
                :class="['research-area-tag', { selected: newUser.researchAreas.includes(area) }]"
                @click="toggleResearchArea(area)"
              >
                <text>{{ area }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-actions">
          <view class="modal-button cancel" @click="hideAddModal">
            <text class="button-text">取消</text>
          </view>
          <view class="modal-button confirm" @click="confirmAddUser">
            <text class="button-text">添加</text>
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
            确定要删除{{ deletingUser ? `"${deletingUser.name}"` : `${selectedUsers.length}位用户` }}吗？删除后无法恢复。
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

    <!-- 编辑用户模态框 -->
    <view v-if="showEditModal" class="modal-overlay" @click="hideEditModal">
      <view class="add-modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">编辑{{ getCurrentUserTypeLabel() }}</text>
          <view class="close-button" @click="hideEditModal">
            <text class="close-text">✕</text>
          </view>
        </view>
        <scroll-view class="modal-body" scroll-y="true">
          <view class="form-group">
            <text class="form-label">姓名</text>
            <input v-model="editUserForm.name" class="form-input" placeholder="请输入姓名" />
          </view>
          <view class="form-group">
            <text class="form-label">{{ currentUserType === 'phd' ? '学号' : '工号' }}</text>
            <input v-model="editUserForm.id" class="form-input" :placeholder="`请输入${currentUserType === 'phd' ? '学号' : '工号'}`" />
          </view>
          <view class="form-group">
            <text class="form-label">邮箱</text>
            <input v-model="editUserForm.email" class="form-input" placeholder="请输入邮箱地址" />
          </view>
          <view v-if="currentUserType === 'phd'" class="form-group">
            <text class="form-label">入学时间</text>
            <picker mode="date" @change="e => editUserForm.enrollmentDate = e.detail.value">
              <view class="date-picker">
                <text class="date-text">{{ editUserForm.enrollmentDate || '请选择入学时间' }}</text>
              </view>
            </picker>
          </view>
          <view v-if="currentUserType === 'phd'" class="form-group">
            <text class="form-label">导师选择 <text class="required-hint">(最多4位，至少1位主导师)</text></text>
            <view class="supervisor-list">
              <view
                v-for="teacher in availableTeachers"
                :key="teacher.id"
                :class="['supervisor-tag', { 
                  'selected': isEditTeacherSelected(teacher.id),
                  'main-supervisor': editUserForm.mainSupervisor === teacher.id
                }]"
                @click="toggleEditSupervisor(teacher)"
              >
                <text class="supervisor-name">{{ teacher.name }}</text>
                <view v-if="isEditTeacherSelected(teacher.id)" class="supervisor-actions">
                  <text 
                    v-if="editUserForm.mainSupervisor === teacher.id" 
                    class="main-tag"
                  >主</text>
                  <text 
                    v-else
                    class="set-main-btn"
                    @click.stop="setEditMainSupervisor(teacher.id)"
                  >设主</text>
                </view>
              </view>
            </view>
            <view v-if="editUserForm.supervisors.length > 0" class="selected-supervisors-info">
              <text class="info-text">已选择 {{ editUserForm.supervisors.length }}/4 位导师</text>
            </view>
          </view>
          <view v-if="currentUserType === 'phd'" class="form-group">
            <text class="form-label">研究方向 <text class="required-hint">(限选1个)</text></text>
            <view class="research-area-list">
              <view
                v-for="(area, idx) in researchAreaOptions"
                :key="area"
                :class="['research-area-tag', { selected: editUserForm.researchAreas.includes(area) }]"
                @click="toggleEditResearchArea(area)"
              >
                <text>{{ area }}</text>
              </view>
            </view>
          </view>
          <view v-if="currentUserType === 'teacher'" class="form-group">
            <text class="form-label">研究方向</text>
            <view class="research-area-list">
              <view
                v-for="(area, idx) in researchAreaOptions"
                :key="area"
                :class="['research-area-tag', { selected: editUserForm.researchAreas.includes(area) }]"
                @click="toggleEditResearchArea(area)"
              >
                <text>{{ area }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="modal-actions">
          <view class="modal-button cancel" @click="hideEditModal">
            <text class="button-text">取消</text>
          </view>
          <view class="modal-button confirm" @click="confirmEditUser">
            <text class="button-text">保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const currentUserType = ref('phd') // phd, teacher
const searchKeyword = ref('')
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const deletingUser = ref(null)
const selectedUsers = ref([])
const isMultiSelectMode = ref(false)

const newUser = ref({
  name: '',
  id: '',
  email: '',
  enrollmentDate: '',
  supervisors: [], // 改为数组存储多个导师ID
  mainSupervisor: '', // 主导师ID
  title: '',
  researchAreas: []
})

const editingUser = ref(null)
const editUserForm = ref({
  name: '',
  id: '',
  email: '',
  enrollmentDate: '',
  supervisors: [], // 改为数组存储多个导师ID
  mainSupervisor: '', // 主导师ID
  title: '',
  researchAreas: []
})

const userTypes = ref([
  { key: 'phd', label: '博士生' },
  { key: 'teacher', label: '老师' }
])

const availableTeachers = ref([
  { id: 'T001', name: '王伟教授' },
  { id: 'T002', name: '李静教授' },
  { id: 'T003', name: '陈华教授' },
  { id: 'T004', name: '张明副教授' },
  { id: 'T005', name: '刘芳教授' },
  { id: 'T006', name: '刘芳教授' },
  { id: 'T007', name: '刘芳教授' },
  { id: 'T008', name: '刘芳教授' },
  { id: 'T009', name: '刘芳教授' },
  { id: 'T010', name: '刘芳教授' },
  { id: 'T011', name: '刘芳教授' },
  { id: 'T012', name: '刘芳教授' },
  { id: 'T013', name: '刘芳教授' }
])

const researchAreaOptions = ref([
  '人工智能',
  '机器学习',
  '自然语言处理',
  '计算机视觉',
  '深度学习',
  '数据挖掘',
  '信息检索',
  '图像处理',
  '信息检索',
  '信息检索',
  '信息检索',
  '信息检索',
  '信息检索',
  '信息检索',
  '信息检索'
])

const phdStudents = ref([
  {
    id: 'PhD001',
    name: '李明',
    studentId: 'PhD2021001',
    email: 'liming@university.edu.cn',
    enrollmentDate: '2021-09-01',
    supervisors: ['T001', 'T002'], // 导师ID数组
    mainSupervisor: 'T001', // 主导师ID
    researchAreas: ['人工智能', '计算机视觉'],
    status: 'active'
  },
  {
    id: 'PhD002',
    name: '张小雨',
    studentId: 'PhD2021002',
    email: 'zhangxy@university.edu.cn',
    enrollmentDate: '2021-09-01',
    supervisors: ['T002', 'T003'],
    mainSupervisor: 'T002',
    researchAreas: ['计算机视觉', '机器学习'],
    status: 'active'
  },
  {
    id: 'PhD003',
    name: '陈思远',
    studentId: 'PhD2020003',
    email: 'chensiyuan@university.edu.cn',
    enrollmentDate: '2020-09-01',
    supervisors: ['T003'],
    mainSupervisor: 'T003',
    researchAreas: ['自然语言处理'],
    status: 'inactive'
  }
])

const teachers = ref([
  {
    id: 'T001',
    name: '王伟',
    employeeId: 'T2020001',
    email: 'wangwei@university.edu.cn',
    researchAreas: ['人工智能', '机器学习', '数据挖掘'],
    status: 'active'
  },
  {
    id: 'T002',
    name: '李静',
    employeeId: 'T2019002',
    email: 'lijing@university.edu.cn',
    researchAreas: ['计算机视觉', '图像处理'],
    status: 'active'
  },
  {
    id: 'T003',
    name: '陈华',
    employeeId: 'T2021003',
    email: 'chenhua@university.edu.cn',
    researchAreas: ['自然语言处理', '信息检索'],
    status: 'active'
  }
])

// 计算属性
const currentUsers = computed(() => {
  return currentUserType.value === 'phd' ? phdStudents.value : teachers.value
})

const filteredUsers = computed(() => {
  if (!searchKeyword.value.trim()) {
    return currentUsers.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return currentUsers.value.filter(user => {
    const searchFields = [
      user.name,
      currentUserType.value === 'phd' ? user.studentId : user.employeeId,
      user.email
    ]
    return searchFields.some(field => 
      field && field.toLowerCase().includes(keyword)
    )
  })
})

onMounted(() => {
  console.log('用户管理页面已加载')
})

// 方法定义
const handleBack = () => {
  uni.redirectTo({
	url: '/pages/admin/dashboard/dashboard'
  })
}
  
const switchUserType = (type) => {
  currentUserType.value = type
  searchKeyword.value = ''
  selectedUsers.value = []
  isMultiSelectMode.value = false
}

const getCurrentUserTypeLabel = () => {
  return currentUserType.value === 'phd' ? '博士生' : '老师'
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

const handleImportExcel = () => {
  uni.chooseFile({
    count: 1,
    extension: ['.xlsx', '.xls'],
    success: (res) => {
      console.log('选择的文件:', res.tempFiles[0])
      uni.showToast({
        title: '文件导入功能开发中',
        icon: 'none'
      })
    }
  })
}

const getUserAvatarText = (name) => {
  return name ? name.charAt(name.length - 1) : '?'
}

const getStatusText = (status) => {
  const statusMap = {
    active: '正常',
    inactive: '停用',
    graduated: '已毕业'
  }
  return statusMap[status] || '未知'
}

// 获取导师显示文本
const getSupervisorsText = (supervisorIds) => {
  if (!supervisorIds || supervisorIds.length === 0) return ''
  
  const supervisorNames = supervisorIds.map(id => {
    const teacher = availableTeachers.value.find(t => t.id === id)
    return teacher ? teacher.name : ''
  }).filter(name => name)
  
  return supervisorNames.join('、')
}

const toggleUserSelection = (user) => {
  if (!isMultiSelectMode.value) {
    isMultiSelectMode.value = true
  }
  
  const index = selectedUsers.value.findIndex(u => u.id === user.id)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(user)
  }
  
  if (selectedUsers.value.length === 0) {
    isMultiSelectMode.value = false
  }
}

const isUserSelected = (user) => {
  return selectedUsers.value.some(u => u.id === user.id)
}

const showAddUserModal = () => {
  newUser.value = {
    name: '',
    id: '',
    email: '',
    enrollmentDate: '',
    supervisors: [],
    mainSupervisor: '',
    title: '',
    researchAreas: []
  }
  showAddModal.value = true
}

const hideAddModal = () => {
  showAddModal.value = false
}

const onEnrollmentDateChange = (e) => {
  newUser.value.enrollmentDate = e.detail.value
}

// 导师选择相关方法
const isTeacherSelected = (teacherId) => {
  return newUser.value.supervisors.includes(teacherId)
}

const toggleSupervisor = (teacher) => {
  const teacherId = teacher.id
  const index = newUser.value.supervisors.indexOf(teacherId)
  
  if (index > -1) {
    // 取消选择
    newUser.value.supervisors.splice(index, 1)
    // 如果取消的是主导师，清空主导师
    if (newUser.value.mainSupervisor === teacherId) {
      newUser.value.mainSupervisor = ''
    }
  } else {
    // 选择导师，最多4个
    if (newUser.value.supervisors.length >= 4) {
      uni.showToast({
        title: '最多只能选择4位导师',
        icon: 'none'
      })
      return
    }
    newUser.value.supervisors.push(teacherId)
    // 如果是第一个导师，自动设为主导师
    if (newUser.value.supervisors.length === 1) {
      newUser.value.mainSupervisor = teacherId
    }
  }
}

const setMainSupervisor = (teacherId) => {
  newUser.value.mainSupervisor = teacherId
}

// 编辑模式的导师选择方法
const isEditTeacherSelected = (teacherId) => {
  return editUserForm.value.supervisors.includes(teacherId)
}

const toggleEditSupervisor = (teacher) => {
  const teacherId = teacher.id
  const index = editUserForm.value.supervisors.indexOf(teacherId)
  
  if (index > -1) {
    // 取消选择
    editUserForm.value.supervisors.splice(index, 1)
    // 如果取消的是主导师，清空主导师
    if (editUserForm.value.mainSupervisor === teacherId) {
      editUserForm.value.mainSupervisor = ''
    }
  } else {
    // 选择导师，最多4个
    if (editUserForm.value.supervisors.length >= 4) {
      uni.showToast({
        title: '最多只能选择4位导师',
        icon: 'none'
      })
      return
    }
    editUserForm.value.supervisors.push(teacherId)
    // 如果是第一个导师，自动设为主导师
    if (editUserForm.value.supervisors.length === 1) {
      editUserForm.value.mainSupervisor = teacherId
    }
  }
}

const setEditMainSupervisor = (teacherId) => {
  editUserForm.value.mainSupervisor = teacherId
}

// 修改研究方向选择逻辑
const toggleResearchArea = (area) => {
    const idx = newUser.value.researchAreas.indexOf(area)
    if (idx > -1) {
      newUser.value.researchAreas.splice(idx, 1)
    } else {
      newUser.value.researchAreas.push(area)
    }
}

const confirmAddUser = () => {
  if (!newUser.value.name || !newUser.value.id || !newUser.value.email) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }
  
  // 博士生需要验证导师选择
  if (currentUserType.value === 'phd') {
    if (newUser.value.supervisors.length === 0) {
      uni.showToast({
        title: '请至少选择一位导师',
        icon: 'none'
      })
      return
    }
    if (!newUser.value.mainSupervisor) {
      uni.showToast({
        title: '请设置主导师',
        icon: 'none'
      })
      return
    }
    if (newUser.value.researchAreas.length === 0) {
      uni.showToast({
        title: '请选择研究方向',
        icon: 'none'
      })
      return
    }
  }
  
  const user = {
    id: Date.now().toString(),
    name: newUser.value.name,
    email: newUser.value.email,
    status: 'active',
    researchAreas: newUser.value.researchAreas || []
  }
  
  if (currentUserType.value === 'phd') {
    user.studentId = newUser.value.id
    user.enrollmentDate = newUser.value.enrollmentDate
    user.supervisors = [...newUser.value.supervisors]
    user.mainSupervisor = newUser.value.mainSupervisor
    phdStudents.value.unshift(user)
  } else {
    user.employeeId = newUser.value.id
    user.title = newUser.value.title
    user.department = '计算机科学与技术学院'
    user.researchAreas = newUser.value.researchAreas || []
    teachers.value.unshift(user)
  }
  
  hideAddModal()
  uni.showToast({
    title: '添加成功',
    icon: 'success'
  })
}

const editUser = (user) => {
  editingUser.value = user
  showEditModal.value = true
  // 深拷贝用户信息到表单
  editUserForm.value = {
    name: user.name,
    id: currentUserType.value === 'phd' ? user.studentId : user.employeeId,
    email: user.email,
    enrollmentDate: user.enrollmentDate || '',
    supervisors: user.supervisors ? [...user.supervisors] : [],
    mainSupervisor: user.mainSupervisor || '',
    title: user.title || '',
    researchAreas: user.researchAreas ? [...user.researchAreas] : []
  }
}

const hideEditModal = () => {
  showEditModal.value = false
  editingUser.value = null
}

// 修改编辑时的研究方向选择逻辑
const toggleEditResearchArea = (area) => {
    const idx = editUserForm.value.researchAreas.indexOf(area)
    if (idx > -1) {
      editUserForm.value.researchAreas.splice(idx, 1)
    } else {
      editUserForm.value.researchAreas.push(area)
    }
}

const confirmEditUser = () => {
  if (!editUserForm.value.name || !editUserForm.value.id || !editUserForm.value.email) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }
  
  // 博士生需要验证导师选择
  if (currentUserType.value === 'phd') {
    if (editUserForm.value.supervisors.length === 0) {
      uni.showToast({
        title: '请至少选择一位导师',
        icon: 'none'
      })
      return
    }
    if (!editUserForm.value.mainSupervisor) {
      uni.showToast({
        title: '请设置主导师',
        icon: 'none'
      })
      return
    }
    if (editUserForm.value.researchAreas.length === 0) {
      uni.showToast({
        title: '请选择研究方向',
        icon: 'none'
      })
      return
    }
  }
  
  // 同步修改到原有用户对象
  editingUser.value.name = editUserForm.value.name
  editingUser.value.email = editUserForm.value.email
  editingUser.value.researchAreas = [...editUserForm.value.researchAreas]
  if (currentUserType.value === 'phd') {
    editingUser.value.studentId = editUserForm.value.id
    editingUser.value.enrollmentDate = editUserForm.value.enrollmentDate
    editingUser.value.supervisors = [...editUserForm.value.supervisors]
    editingUser.value.mainSupervisor = editUserForm.value.mainSupervisor
  } else {
    editingUser.value.employeeId = editUserForm.value.id
    editingUser.value.title = editUserForm.value.title
    editingUser.value.researchAreas = [...editUserForm.value.researchAreas]
  }
  hideEditModal()
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
}

const showDeleteConfirm = (user) => {
  deletingUser.value = user
  showDeleteModal.value = true
}

const showBatchDeleteConfirm = () => {
  deletingUser.value = null
  showDeleteModal.value = true
}

const hideDeleteModal = () => {
  showDeleteModal.value = false
  deletingUser.value = null
}

const confirmDelete = () => {
  if (deletingUser.value) {
    // 删除单个用户
    const users = currentUserType.value === 'phd' ? phdStudents.value : teachers.value
    const index = users.findIndex(u => u.id === deletingUser.value.id)
    if (index > -1) {
      users.splice(index, 1)
    }
  } else {
    // 批量删除
    const users = currentUserType.value === 'phd' ? phdStudents.value : teachers.value
    selectedUsers.value.forEach(selectedUser => {
      const index = users.findIndex(u => u.id === selectedUser.id)
      if (index > -1) {
        users.splice(index, 1)
      }
    })
    selectedUsers.value = []
    isMultiSelectMode.value = false
  }
  
  hideDeleteModal()
  uni.showToast({
    title: '删除成功',
    icon: 'success'
  })
}

</script>

<style scoped>
.user-management-container {
  min-height: 100vh;
  background: #f2f2f7;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.nav-bar {
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
  font-size: 36rpx;
  color: #007AFF;
  font-weight: 600;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1d1d1f;
}

.nav-right {
  display: flex;
  align-items: center;
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

/* 用户类型切换 */
.user-type-switcher {
  background: white;
  display: flex;
  border-bottom: 1rpx solid #e5e5e7;
}

.type-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28rpx 20rpx;
  position: relative;
  transition: all 0.3s ease;
}

.type-tab.active {
  background: #F2F2F7;
}

.type-tab.active::after {
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

.type-tab.active .tab-text {
  color: #007AFF;
  font-weight: 600;
}

/* 操作栏 */
.operation-bar {
  background: white;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  gap: 95rpx;
  border-bottom: 1rpx solid #e5e5e7;
}

.search-container {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  height: 72rpx;
  background: #F2F2F7;
  border-radius: 16rpx;
  padding: 0 24rpx 0 56rpx;
  font-size: 28rpx;
  color: #1d1d1f;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #007AFF;
  background: white;
}

.search-placeholder {
  color: #C7C7CC;
}

.search-icon {
  position: absolute;
  left: 15rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28rpx;
}

.icon-text {
  color: #8E8E93;
}

.import-button {
  background: linear-gradient(135deg, #34C759, #30D158);
  border-radius: 16rpx;
  padding: 18rpx 22rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.import-button:active {
  transform: scale(0.95);
}

.import-text {
  font-size: 26rpx;
  color: white;
  font-weight: 500;
}

/* 用户列表容器 */
.user-list-container {
  padding: 0rpx 8rpx
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 8rpx 16rpx 8rpx;
}

.list-stats {
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

/* 用户列表 */
.user-list {
  background: white;
  border-radius: 16rpx;
  border: 1rpx solid #e5e5e7;
  margin-right: 16rpx;
  overflow: hidden;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx 28rpx 32rpx;
  border-bottom: 1rpx solid #e5e5e7;
  transition: all 0.3s ease;
}

.user-item:last-child {
  border-bottom: none;
}

.user-item:active {
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

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-text {
  font-size: 32rpx;
  color: white;
  font-weight: 600;
}

.user-info {
  flex: 1;
  margin-right: 16rpx;
}

.user-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d1d1f;
  display: block;
  margin-bottom: 6rpx;
}

.user-id {
  font-size: 24rpx;
  color: #8E8E93;
  display: block;
  margin-bottom: 6rpx;
}

.user-email {
  font-size: 22rpx;
  color: #8E8E93;
  display: block;
  margin-bottom: 6rpx;
}

.supervisors-info {
  margin-top: 4rpx;
  margin-bottom: 4rpx;
}

.supervisors-text {
  font-size: 20rpx;
  color: #FF9500;
  font-weight: 500;
  display: block;
  line-height: 1.4;
}

.research-areas {
  margin-top: 4rpx;
}

.research-areas-text {
  font-size: 20rpx;
  color: #007AFF;
  font-weight: 500;
  white-space: normal;
  word-break: break-all;
  display: block;
  line-height: 1.6;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-right: 16rpx;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.status-dot.active {
  background: #34C759;
}

.status-dot.inactive {
  background: #FF9500;
}

.status-dot.graduated {
  background: #8E8E93;
}

.status-text {
  font-size: 22rpx;
  color: #8E8E93;
  font-weight: 500;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-right: 8rpx;
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

.action-button:active {
  transform: scale(0.9);
}

.action-icon {
  font-size: 28rpx;
  color: white;
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
  z-index: 999;
  backdrop-filter: blur(10rpx);
}

.modal-content {
  background: white;
  border-radius: 28rpx;
  width: 540rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.add-modal-content {
  background: white;
  border-radius: 28rpx;
  width: 100%;
  max-width: 420px;
  min-width: 260px;
  box-sizing: border-box;
  max-height: 85vh;
  overflow: hidden; /* 确保外层不产生滚动 */
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  padding: 0;
  z-index: 1000;
}

.modal-header {
  padding: 32rpx;
  border-bottom: 1rpx solid #e5e5e7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  flex-shrink: 0; /* 防止头部被压缩 */
}

.modal-body {
  flex: 1;
  padding: 24rpx 20rpx 24rpx 20rpx;
  text-align: center;
  box-sizing: border-box;
  /* 移除固定的 max-height，让它自动适应剩余空间 */
  overflow-y: auto; /* 只在这里处理滚动 */
}

.modal-actions {
  border-top: 1rpx solid #e5e5e7;
  display: flex;
  flex-shrink: 0; /* 防止底部按钮被压缩 */
  background: white;
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

.modal-message {
  font-size: 28rpx;
  color: #8E8E93;
  line-height: 1.4;
}

.form-group {
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 26rpx;
  color: #1d1d1f;
  font-weight: 500;
  display: block;
  margin-bottom: 12rpx;
  text-align: left;
}

.required-hint {
  font-size: 22rpx;
  color: #8E8E93;
  font-weight: normal;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #F2F2F7;
  border-radius: 16rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  color: #1d1d1f;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #007AFF;
  background: white;
}

.date-picker,
.picker {
  width: 100%;
  height: 80rpx;
  background: #F2F2F7;
  border-radius: 16rpx;
  padding: 0 16rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid transparent;
  box-sizing: border-box;
}

.date-text,
.picker-text {
  font-size: 28rpx;
  color: #1d1d1f;
}

/* 导师选择样式 - 彻底移除容器包装 */
.supervisor-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: 16rpx;
  border: 1rpx solid #e5e5e7;
  border-radius: 12rpx;
  background: #f8f8f8;
  margin-top: 8rpx;
}

.supervisor-tag {
  position: relative;
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  background: #f2f2f7;
  border: 2rpx solid #e5e5e7;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.supervisor-tag.selected {
  background: linear-gradient(135deg, #34C759, #30D158);
  border-color: #34C759;
}

.supervisor-tag.main-supervisor {
  background: linear-gradient(135deg, #FF9500, #FF8C00);
  border-color: #FF9500;
}

.supervisor-name {
  font-size: 24rpx;
  color: #1d1d1f;
  font-weight: 500;
}

.supervisor-tag.selected .supervisor-name,
.supervisor-tag.main-supervisor .supervisor-name {
  color: white;
}

.supervisor-actions {
  display: flex;
  align-items: center;
}

.main-tag {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.set-main-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #34C759;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  cursor: pointer;
}

.selected-supervisors-info {
  margin-top: 12rpx;
  text-align: left;
}

.info-text {
  font-size: 22rpx;
  color: #8E8E93;
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

.cancel-button {
  border-right: 1rpx solid rgba(0, 0, 0, 0.1);
}

.button-text {
  font-size: 30rpx;
  font-weight: 500;
}

.modal-button.cancel .button-text,
.cancel-button .button-text {
  color: #8E8E93;
}

.modal-button.confirm .button-text {
  color: #007AFF;
  font-weight: 600;
}

.danger-button .button-text {
  color: #FF3B30;
  font-weight: 600;
}

.research-area-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 8rpx;
}

.research-area-tag {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  background: #f2f2f7;
  color: #666;
  font-size: 24rpx;
  cursor: pointer;
  border: 2rpx solid #e5e5e7;
  transition: all 0.2s;
}

.research-area-tag.selected {
  background: linear-gradient(135deg, #007AFF, #5856D6);
  color: #fff;
  border-color: #007AFF;
}
</style>