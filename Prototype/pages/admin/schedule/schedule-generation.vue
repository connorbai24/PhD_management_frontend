<template>
    <view class="annual-review-container">
      <!-- 顶部导航栏 -->
      <view class="nav-bar">
        <text class="nav-title">年度评审</text>
      </view>
  
      <!-- 流程步骤条 -->
      <view class="stepper-container" v-if="currentStep !== 5">
        <view class="stepper">
          <view 
            v-for="(step, index) in steps" 
            :key="index" 
            :class="['step-item', { 'active': currentStep >= index + 1, 'current': currentStep === index + 1 }]"
          >
            <view class="step-circle">
              <text class="step-number">{{ index + 1 }}</text>
            </view>
            <text class="step-label">{{ step.label }}</text>
            <view v-if="index < steps.length - 1" class="step-line"></view>
          </view>
        </view>
      </view>
  
      <scroll-view class="content-area" scroll-y="true">
        <!-- 准备工作阶段 -->
              <view v-if="currentStep === 1" class="preparation-stage">
                <view class="stage-title">
                  <text class="title-text">准备工作检查清单</text>
                </view>
                <view class="checklist">
                  <!-- 评审时间相关 -->
                  <view class="checklist-item completed">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">评审开始日期</text>
                      <text class="check-subtitle">{{ reviewInfo.startDate }}</text>
                    </view>
                  </view>
                  <view class="checklist-item completed">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">评审结束日期</text>
                      <text class="check-subtitle">{{ reviewInfo.endDate }}</text>
                    </view>
                  </view>
                  <view class="checklist-item completed">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">评审日上午时段</text>
                      <text class="check-subtitle">{{ reviewInfo.amSession }}</text>
                    </view>
                  </view>
                  <view class="checklist-item completed">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">评审日下午时段</text>
                      <text class="check-subtitle">{{ reviewInfo.pmSession }}</text>
                    </view>
                  </view>
                  <view class="checklist-item completed">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">评审工作量</text>
                      <text class="check-subtitle">{{ reviewInfo.workload }}</text>
                    </view>
                  </view>
                  <view class="checklist-item completed">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">单次评审时长</text>
                      <text class="check-subtitle">{{ reviewInfo.sessionDuration }}</text>
                    </view>
                  </view>
                  <!-- 可展开项：本次参与老师 -->
                  <view class="checklist-item completed expandable" @click="toggleExpand('teacher')">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">本次参与老师</text>
                      <text class="check-subtitle">{{ teacherList.length }}名老师</text>
                    </view>
                    <view class="expand-arrow">{{ expandStatus.teacher ? '▲' : '▼' }}</view>
                  </view>
                  <view v-if="expandStatus.teacher" class="expand-detail">
                    <view v-for="teacher in teacherList" :key="teacher.id" class="expand-item">
                      <text>{{ teacher.name }}（{{ teacher.title }}）</text>
                    </view>
                  </view>
                  <!-- 可展开项：本次参与博士生 -->
                  <view class="checklist-item completed expandable" @click="toggleExpand('student')">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">本次参与博士生</text>
                      <text class="check-subtitle">{{ studentList.length }}名博士生</text>
                    </view>
                    <view class="expand-arrow">{{ expandStatus.student ? '▲' : '▼' }}</view>
                  </view>
                  <view v-if="expandStatus.student" class="expand-detail">
                    <view v-for="student in studentList" :key="student.id" class="expand-item">
                      <text>{{ student.name }}（{{ student.studentId }}）</text>
                    </view>
                  </view>
                </view>
                <view class="generate-section">
                  <view :class="['generate-button', { 'disabled': !canGenerateDraft }]" @click="handleGenerateDraft">
                    <text class="generate-text">生成评审草案</text>
                  </view>
                  <text v-if="!canGenerateDraft" class="generate-hint">请完成所有准备工作后再生成草案</text>
                </view>
              </view>
  
        <!-- 生成草案阶段 -->
        <view v-else-if="currentStep === 2" class="generation-stage">
          <view class="stage-title">
            <text class="title-text">正在生成评审草案</text>
          </view>
          
          <view class="generation-progress">
            <view class="progress-circle">
              <text class="progress-text">{{ generationProgress }}%</text>
            </view>
            <text class="progress-label">{{ generationStatus }}</text>
          </view>
          
          <view class="generation-log">
            <view v-for="(log, index) in generationLogs" :key="index" class="log-item">
              <text class="log-time">{{ log.time }}</text>
              <text class="log-message">{{ log.message }}</text>
            </view>
          </view>
        </view>
  
        <!-- 审核调整阶段 -->
        <view v-else-if="currentStep === 3" class="audit-stage">
          <view class="stage-title">
            <text class="title-text">审核与调整</text>
          </view>
          
          <!-- 视图切换器 -->
          <view class="view-switcher">
            <view 
              v-for="(view, index) in viewOptions" 
              :key="index"
              :class="['view-option', { 'active': currentView === view.key }]"
              @click="switchView(view.key)"
            >
              <text class="view-text">{{ view.label }}</text>
            </view>
          </view>
          
          <!-- 统计概览 -->
          <view class="audit-summary">
            <view class="summary-item">
              <text class="summary-number">{{ scheduleStats.totalStudents }}</text>
              <text class="summary-label">待评审学生</text>
            </view>
            <view class="summary-item">
              <text class="summary-number">{{ scheduleStats.conflicts }}</text>
              <text class="summary-label">时间冲突</text>
            </view>
            <view class="summary-item">
              <text class="summary-number">{{ scheduleStats.unassigned }}</text>
              <text class="summary-label">未分配</text>
            </view>
          </view>
          
          <!-- 按学生视图 -->
          <view v-if="currentView === 'student'" class="student-view">
            <view v-for="(student, index) in studentSchedules" :key="index" class="student-item">
              <view class="student-info">
                <view v-if="student.hasConflict" class="conflict-badge">
                  <text class="badge-text">冲突</text>
                </view>
                <text class="student-name">{{ student.name }}</text>
                <text class="student-id">{{ student.studentId }}</text>
              </view>
              <view class="assignment-info">
                <view class="assessors">
                  <text class="assessor-label">评审老师：</text>
                  <text class="assessor-names">{{ student.assessors.join(', ') }}</text>
                </view>
                <view class="schedule-details">
                  <view class="schedule-time">{{ student.time }}</view>
                  <view class="schedule-room">房间{{ index + 1 }}</view>
                </view>
              </view>
              <view class="item-actions">
                <view class="edit-button" @click="editStudentSchedule(student)">
                  <text class="edit-text">编辑</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 按老师视图 -->
          <view v-else-if="currentView === 'teacher'" class="teacher-view">
            <view v-for="(teacher, index) in teacherSchedules" :key="index" class="teacher-item" @click="showMeetingDetail(teacher)">
              <view class="teacher-info">
                <text class="teacher-name">{{ teacher.name }}</text>
              </view>
              <view class="teacher-schedule">
                <view v-for="(slot, slotIndex) in teacher.timeSlots" :key="slotIndex" :class="['time-slot', { 'conflict-slot': isConflict(slot) }]" @click="showMeetingDetail(slot)">
                  <text class="slot-time">{{ slot.time }}</text>
                  <text class="slot-student">{{ slot.student }}</text>
                </view>
              </view>
              <view class="teacher-status">
                <view v-if="teacher.overloaded" class="overload-badge">
                  <text class="badge-text">超负荷</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 按会议室视图 -->
          <view v-else-if="currentView === 'room'" class="room-view">
            <view v-for="(room, index) in roomSchedules" :key="index" class="room-item">
              <view class="room-info">
                <text class="room-name">房间{{ index + 1 }}</text>
              </view>
              <view class="room-schedule">
                <view v-for="(booking, bookingIndex) in room.bookings" :key="bookingIndex" class="booking-slot" @click="showMeetingDetailByRoom(booking, index)">
                  <text class="booking-time">{{ booking.time }}</text>
                  <text class="booking-student">{{ booking.student }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view class="audit-actions">
            <view class="action-button secondary" @click="regenerateDraft">
              <text class="action-text">重新生成</text>
            </view>
            <view class="action-button primary" @click="goToRoomManagement">
              <text class="action-text">上传房间</text>
            </view>
          </view>
        </view>
  
        <!-- 房间管理阶段 -->
        <view v-else-if="currentStep === 4" class="room-management-stage">
          <view class="room-management-title">
            <text>房间管理</text>
          </view>
          <view class="room-info-card">
            <view class="room-input-row">
              <text class="room-input-label">房间一：</text>
              <input v-model="room1" class="room-input-inner" placeholder="请输入房间一名称" />
            </view>
            <view class="room-input-row">
              <text class="room-input-label">房间二：</text>
              <input v-model="room2" class="room-input-inner" placeholder="请输入房间二名称" />
            </view>
          </view>
          <view class="room-action-row">
            <view class="action-button secondary" @click="backToAudit">
              <text class="action-text">重新调整</text>
            </view>
            <view class="action-button primary" @click="finalPublish">
              <text class="action-text">最终发布</text>
            </view>
          </view>
        </view>
  
        <!-- 方案总览阶段 -->
        <view v-else-if="currentStep === 5">
          <view class="publish-status-banner-simple">
            <text class="publish-status-text-simple">方案已发布</text>
          </view>
          <view class="stage-title">
            <text class="title-text">方案总览</text>
          </view>
          <view class="plan-summary-stage">
            <view class="plan-summary-list">
              <view v-for="(student, idx) in studentSchedules" :key="student.studentId" class="plan-summary-item">
                <view class="summary-row">
                  <text class="summary-label">学生：</text>
                  <text class="summary-value">{{ student.name }}（{{ student.studentId }}）</text>
                </view>
                <view class="summary-row">
                  <text class="summary-label">评审老师：</text>
                  <text class="summary-value">{{ student.assessors.join('，') }}</text>
                </view>
                <view class="summary-row">
                  <text class="summary-label">时间：</text>
                  <text class="summary-value">{{ student.time }}</text>
                </view>
                <view class="summary-row">
                  <text class="summary-label">房间：</text>
                  <text class="summary-value">{{ roomInputs[idx]?.name ? roomInputs[idx].name : `房间${idx + 1}` }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="plan-summary-actions">
            <view class="action-button primary" @click="republish">
              <text class="action-text">重新发布</text>
            </view>
          </view>
        </view>
  
        <!-- 底部间距 -->
        <view class="bottom-space"></view>
      </scroll-view>
  
      <!-- 发布确认弹窗 -->
      <view v-if="showPublishModal" class="modal-overlay" @click="hidePublishModal">
        <view class="modal-content" @click.stop>
          <view class="modal-header">
            <text class="modal-title">确认发布</text>
          </view>
          <view class="modal-body">
            <text class="modal-message">确定要发布评审安排并通知全体师生吗？发布后将无法撤回。</text>
          </view>
          <view class="modal-actions">
            <view class="modal-button cancel-button" @click="hidePublishModal">
              <text class="button-text">取消</text>
            </view>
            <view class="modal-button confirm-button" @click="confirmPublish">
              <text class="button-text">确认发布</text>
            </view>
          </view>
        </view>
      </view>
  
      <!-- 编辑安排弹窗 -->
      <view v-if="showEditModal" class="modal-overlay" @click="hideEditModal">
        <view class="edit-modal-content" @click.stop>
          <view class="edit-modal-header">
            <text class="edit-modal-title">编辑评审安排</text>
            <view class="close-button" @click="hideEditModal">
              <text class="close-text">✕</text>
            </view>
          </view>
          <scroll-view class="edit-modal-body" scroll-y="true">
            <!-- 编辑表单内容 -->
            <view class="edit-form">
              <view class="form-section">
                <text class="section-title">学生信息</text>
                <text class="student-info-text">{{ editingStudent?.name }} ({{ editingStudent?.studentId }})</text>
              </view>
              
              <view class="form-section">
                <text class="section-title">评审老师</text>
                <!-- 评审老师选择 -->
              </view>
              
              <view class="form-section">
                <text class="section-title">评审时间</text>
                <!-- 时间选择 -->
              </view>
              
              <view class="form-section">
                <text class="section-title">会议室</text>
                <!-- 会议室选择 -->
              </view>
            </view>
          </scroll-view>
          <view class="edit-modal-actions">
            <view class="modal-button cancel-button" @click="hideEditModal">
              <text class="button-text">取消</text>
            </view>
            <view class="modal-button confirm-button" @click="saveEditChanges">
              <text class="button-text">保存修改</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Teacher Detail Modal -->
      <view v-if="showTeacherDetailModal" class="modal-overlay" @click="hideTeacherDetail">
        <view class="modal-content" @click.stop>
          <view class="modal-header">
            <text class="modal-title">老师详细信息</text>
          </view>
          <view class="modal-body">
            <text>姓名：{{ detailTeacher?.name }}</text><br/>
            <text>已分配场次：{{ detailTeacher?.assigned }}</text><br/>
            <text>最大场次：{{ detailTeacher?.maxLoad }}</text><br/>
            <text>超负荷：{{ detailTeacher?.overloaded ? '是' : '否' }}</text><br/>
            <text>时间安排：</text>
            <view v-for="(slot, idx) in detailTeacher?.timeSlots || []" :key="idx">
              <text>{{ slot.time }} - {{ slot.student }}</text>
            </view>
          </view>
          <view class="modal-actions">
            <view class="modal-button confirm-button" @click="hideTeacherDetail">
              <text class="button-text">关闭</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Meeting Detail Modal -->
      <view v-if="showMeetingDetailModal" class="modal-overlay" @click="hideMeetingDetail">
        <view class="edit-modal-content" @click.stop>
          <view class="modal-header">
            <text class="modal-title">会议详细信息</text>
          </view>
          <view class="modal-body meeting-detail-body">
            <template v-if="!isEditingMeeting">
              <div>学生姓名：{{ detailMeeting?.studentName || '-' }}</div>
              <div>学号：{{ detailMeeting?.studentId || '-' }}</div>
              <div>评审老师：{{ (detailMeeting?.assessors && detailMeeting.assessors.length > 0) ? detailMeeting.assessors.join('，') : '-' }}</div>
              <div>时间：{{ detailMeeting?.time || '-' }}</div>
              <div>房间：{{ detailMeeting?.room || '-' }}</div>
            </template>
            <template v-else>
              <div>学生姓名：<input v-model="editMeetingForm.studentName" /></div>
              <div>学号：<input v-model="editMeetingForm.studentId" /></div>
              <div>评审老师：<input v-model="editMeetingForm.assessorsStr" placeholder="用逗号分隔" /></div>
              <div>时间：<input v-model="editMeetingForm.time" /></div>
              <div>房间：<input v-model="editMeetingForm.room" /></div>
            </template>
          </view>
          <view class="modal-actions">
            <template v-if="!isEditingMeeting">
              <view class="modal-button" @click="hideMeetingDetail">
                <text class="button-text">关闭</text>
              </view>
              <view class="modal-button confirm-button" @click="startEditMeeting">
                <text class="button-text">编辑</text>
              </view>
            </template>
            <template v-else>
              <view class="modal-button" style="flex:1;text-align:left;" @click="cancelEditMeeting">
                <text class="button-text">取消</text>
              </view>
              <view class="modal-button confirm-button" style="flex:1;text-align:right;" @click="saveEditMeeting">
                <text class="button-text">保存</text>
              </view>
            </template>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="bottom-navigation">
      <view class="nav-item" :class="{active: activeTab === 'overview'}" @click="switchTab('overview')">
        <text class="nav-icon">📊</text>
        <text class="nav-text">系统概览</text>
      </view>
      <view class="nav-item" :class="{active: activeTab === 'generation'}" @click="switchTab('generation')">
        <text class="nav-icon">🎯</text>
        <text class="nav-text">方案生成</text>
      </view>
      <view class="nav-item" :class="{active: activeTab === 'profile'}" @click="switchTab('profile')">
        <text class="nav-icon">👤</text>
        <text class="nav-text">我的</text>
      </view>
    </view>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  
  // 响应式数据
  const currentStep = ref(1) // 1: 准备工作, 2: 生成草案, 3: 审核调整, 4: 房间管理, 5: 方案总览
  const currentView = ref('student') // student, teacher, room
  const showPublishModal = ref(false)
  const showEditModal = ref(false)
  const editingStudent = ref(null)
  const activeTab = ref('generation')
  const showTeacherDetailModal = ref(false)
  const detailTeacher = ref(null)
  const showMeetingDetailModal = ref(false)
  const detailMeeting = ref(null)
  const isEditingMeeting = ref(false)
  const editMeetingForm = ref({})
  
  const steps = ref([
    { label: '准备工作' },
    { label: '生成草案' },
    { label: '审核调整' },
    { label: '房间管理' },
    { label: '方案总览' }
  ])
  
  // 评审基本信息（模拟数据）
  const reviewInfo = ref({
    startDate: '2025-06-20',
    endDate: '2025-06-25',
    amSession: '08:30-12:00',
    pmSession: '13:30-17:30',
    workload: '每位老师最多8场，每生2位老师',
    sessionDuration: '45分钟'
  })
  
  // 老师、博士生模拟数据
  const teacherList = ref([
    { id: 1, name: '王伟', title: '教授' },
    { id: 2, name: '李静', title: '副教授' },
    { id: 3, name: '陈华', title: '教授' }
  ])
  const studentList = ref([
    { id: 1, name: '李明', studentId: 'PhD2021001' },
    { id: 2, name: '张小雨', studentId: 'PhD2021002' },
    { id: 3, name: '王磊', studentId: 'PhD2021003' }
  ])
  
  // 展开状态
  const expandStatus = ref({
    teacher: false,
    student: false
  })
  const toggleExpand = (key) => {
    expandStatus.value[key] = !expandStatus.value[key]
  }
  
  // 检查所有准备项是否完成
  const canGenerateDraft = computed(() => true) // 这里所有项都为模拟数据，直接为true
  
  const generationProgress = ref(0)
  const generationStatus = ref('正在分析师生匹配度...')
  const generationLogs = ref([
    { time: '14:32:01', message: '开始生成评审草案' },
    { time: '14:32:03', message: '分析师生研究方向匹配度...' },
    { time: '14:32:05', message: '计算老师工作量分配...' }
  ])
  
  const viewOptions = ref([
    { key: 'student', label: '按学生' },
    { key: 'teacher', label: '按老师' },
    { key: 'room', label: '按会议室' }
  ])
  
  const scheduleStats = ref({
    totalStudents: 42,
    conflicts: 2,
    unassigned: 0
  })
  
  const studentSchedules = ref([
    {
      name: '李明',
      studentId: 'PhD2021001',
      assessors: ['王伟教授', '李静教授'],
      time: '6月20日 10:30-11:15',
      room: '科研楼A座 301室',
      hasConflict: false
    },
    {
      name: '张小雨',
      studentId: 'PhD2021002',
      assessors: ['王伟教授', '陈华教授'],
      time: '6月20日 11:15-12:00',
      room: '科研楼A座 301室',
      hasConflict: true
    }
  ])
  
  const teacherSchedules = ref([
    {
      name: '王伟教授',
      assigned: 5,
      maxLoad: 8,
      overloaded: false,
      timeSlots: [
        { time: '10:30-11:15', student: '李明' },
        { time: '11:15-12:00', student: '张小雨' }
      ]
    }
  ])
  
  const roomSchedules = ref([
    {
      name: '科研楼A座 301室',
      capacity: 15,
      bookings: [
        { time: '10:30-11:15', student: '李明' },
        { time: '11:15-12:00', student: '张小雨' }
      ]
    }
  ])
  
  const publishSummary = ref({
    totalStudents: 42,
    totalTeachers: 35,
    totalRooms: 8,
    dateRange: '2025年6月20日 - 6月25日'
  })
  
  const roomInputs = ref([
    { id: 1, name: '' },
    { id: 2, name: '' }
  ])
  const addRoom = () => {
    roomInputs.value.push({ id: Date.now(), name: '' })
  }
  const removeRoom = (idx) => {
    roomInputs.value.splice(idx, 1)
  }
  const finalPublish = () => {
    // 同步房间输入到 roomInputs
    roomInputs.value[0].name = room1.value
    roomInputs.value[1].name = room2.value
    uni.showModal({
      title: '确认操作',
      content: '是否确认最终发布？',
      success: function (res) {
        if (res.confirm) {
          currentStep.value = 5
          uni.showToast({ title: '已最终发布', icon: 'success' })
        }
      }
    })
  }
  
  // 步骤状态持久化
  watch(currentStep, (val) => {
    localStorage.setItem('scheduleCurrentStep', val)
  })

  onMounted(() => {
    const savedStep = localStorage.getItem('scheduleCurrentStep')
    if (savedStep) {
      currentStep.value = Number(savedStep)
    }
    console.log('年度评审页面已加载')
    // 模拟生成进度
    if (currentStep.value === 2) {
      simulateGeneration()
    }
  })
  
  // 方法定义
  const handleTaskAction = (task) => {
    console.log('处理任务:', task.title)
    if (task.title.includes('时间收集')) {
      // 发送提醒
      uni.showToast({
        title: '提醒已发送',
        icon: 'success'
      })
      // 标记任务为已完成
      task.completed = true
    } else if (task.title.includes('博士生') || task.title.includes('老师') || task.title.includes('会议室')) {
      // 导航到相应管理页面
      let page = ''
      if (task.title.includes('博士生')) page = 'student-management'
      else if (task.title.includes('老师')) page = 'teacher-management'
      
      uni.navigateTo({
        url: `/pages/admin/dashboard/${page}`
      })
    }
  }
  
  const handleGenerateDraft = () => {
    if (!canGenerateDraft.value) return
    
    currentStep.value = 2
    generationProgress.value = 0
    simulateGeneration()
  }
  
  const simulateGeneration = () => {
    const interval = setInterval(() => {
      generationProgress.value += 10
      
      if (generationProgress.value === 30) {
        generationStatus.value = '正在分配评审老师...'
        generationLogs.value.push({
          time: new Date().toLocaleTimeString(),
          message: '开始分配评审老师'
        })
      } else if (generationProgress.value === 60) {
        generationStatus.value = '正在安排时间和地点...'
        generationLogs.value.push({
          time: new Date().toLocaleTimeString(),
          message: '安排评审时间和会议室'
        })
      } else if (generationProgress.value === 90) {
        generationStatus.value = '正在检查冲突...'
        generationLogs.value.push({
          time: new Date().toLocaleTimeString(),
          message: '检查时间和资源冲突'
        })
      } else if (generationProgress.value >= 100) {
        generationStatus.value = '草案生成完成'
        generationLogs.value.push({
          time: new Date().toLocaleTimeString(),
          message: '评审草案生成完成，进入审核阶段'
        })
        clearInterval(interval)
        setTimeout(() => {
          currentStep.value = 3
        }, 1000)
      }
    }, 500)
  }
  
  const switchTab = (tab) => {
    activeTab.value = tab
    switch(tab) {
      case 'overview':
        uni.navigateTo({ url: '/pages/admin/dashboard/dashboard' })
        break
      case 'generation':
        // 当前页，无需跳转
        break
      case 'profile':
        uni.navigateTo({ url: '/pages/admin/profile' })
        break
    }
  }

  const switchView = (viewKey) => {
    currentView.value = viewKey
  }
  
  const editStudentSchedule = (student) => {
    editingStudent.value = student
    showEditModal.value = true
  }
  
  const hideEditModal = () => {
    showEditModal.value = false
    editingStudent.value = null
  }
  
  const saveEditChanges = () => {
    console.log('保存修改:', editingStudent.value)
    hideEditModal()
    uni.showToast({
      title: '修改已保存',
      icon: 'success'
    })
  }
  
  const regenerateDraft = () => {
    uni.showModal({
      title: '确认操作',
      content: '是否重新生成评审草案？',
      success: function (res) {
        if (res.confirm) {
          currentStep.value = 2
          generationProgress.value = 0
          simulateGeneration()
          uni.showToast({ title: '已重新生成', icon: 'success' })
        }
      }
    })
  }
  
  const goToRoomManagement = () => {
    uni.showModal({
      title: '确认操作',
      content: '是否进入房间管理？',
      success: function (res) {
        if (res.confirm) {
          currentStep.value = 4;
          uni.showToast({ title: '进入房间管理', icon: 'success' })
        }
      }
    })
  }
  
  const backToAudit = () => {
    uni.showModal({
      title: '确认操作',
      content: '是否返回审核调整？',
      success: function (res) {
        if (res.confirm) {
          currentStep.value = 3
          uni.showToast({ title: '返回审核调整', icon: 'success' })
        }
      }
    })
  }
  
  const showPublishConfirm = () => {
    showPublishModal.value = true
  }
  
  const hidePublishModal = () => {
    showPublishModal.value = false
  }
  
  const confirmPublish = () => {
    console.log('确认发布评审安排')
    hidePublishModal()
    
    uni.showLoading({
      title: '正在发布...'
    })
    
    setTimeout(() => {
      uni.hideLoading()
      uni.showToast({
        title: '发布成功！',
        icon: 'success'
      })
      // 可以跳转回仪表盘或显示发布成功页面
    }, 2000)
  }

  const showResetModal = ref(false)
  const showResetConfirm = () => { showResetModal.value = true }
  const hideResetConfirm = () => { showResetModal.value = false }
  const resetAll = () => {
    showResetModal.value = false
    currentStep.value = 1
    // 可根据需要重置其它数据
  }
  const backToAuditFromSummary = () => {
    currentStep.value = 3
  }
  // 假设房间与学生一一对应，或可根据实际方案调整
  const getRoomNameByIndex = (idx) => {
    return roomInputs.value[idx] && roomInputs.value[idx].name ? roomInputs.value[idx].name : `房间${idx+1}`
  }

  const showTeacherDetail = (teacher) => {
    detailTeacher.value = teacher
    showTeacherDetailModal.value = true
  }
  const hideTeacherDetail = () => {
    showTeacherDetailModal.value = false
    detailTeacher.value = null
  }

  const showMeetingDetail = (slot) => {
    // 查找该学生的详细信息
    const student = studentSchedules.value.find(s => s.name === slot.student)
    detailMeeting.value = {
      studentName: student ? student.name : slot.student,
      studentId: student ? student.studentId : '',
      assessors: student ? [...student.assessors] : [],
      time: slot.time,
      room: student ? `房间${studentSchedules.value.indexOf(student) + 1}` : '',
      hasConflict: student ? student.hasConflict : false,
      idx: student ? studentSchedules.value.indexOf(student) : -1
    }
    isEditingMeeting.value = false
    showMeetingDetailModal.value = true
  }
  const hideMeetingDetail = () => {
    showMeetingDetailModal.value = false
    detailMeeting.value = null
  }

  const startEditMeeting = () => {
    isEditingMeeting.value = true
    // 复制当前信息到表单
    editMeetingForm.value = { ...detailMeeting.value, assessorsStr: (detailMeeting.value.assessors || []).join(',') }
  }

  const cancelEditMeeting = () => {
    isEditingMeeting.value = false
  }

  const saveEditMeeting = () => {
    // 更新studentSchedules
    if (editMeetingForm.value.idx >= 0) {
      const idx = editMeetingForm.value.idx
      studentSchedules.value[idx] = {
        ...studentSchedules.value[idx],
        name: editMeetingForm.value.studentName,
        studentId: editMeetingForm.value.studentId,
        assessors: (editMeetingForm.value.assessorsStr || '').split(',').map(s => s.trim()).filter(Boolean),
        time: editMeetingForm.value.time,
        room: editMeetingForm.value.room,
        hasConflict: studentSchedules.value[idx].hasConflict // 保持和studentSchedules一致
      }
      // 更新detailMeeting为最新（重新查找）
      const student = studentSchedules.value[idx]
      detailMeeting.value = {
        studentName: student.name,
        studentId: student.studentId,
        assessors: [...student.assessors],
        time: student.time,
        room: `房间${idx + 1}`,
        hasConflict: student.hasConflict,
        idx
      }
    }
    isEditingMeeting.value = false
    uni.showToast({ title: '保存成功', icon: 'success' })
  }

  const isConflict = (slot) => {
    const student = studentSchedules.value.find(s => s.name === slot.student)
    return student && student.hasConflict
  }

  const showMeetingDetailByRoom = (booking, roomIdx) => {
    // 查找该学生的详细信息
    const student = studentSchedules.value.find(s => s.name === booking.student)
    detailMeeting.value = {
      studentName: student ? student.name : booking.student,
      studentId: student ? student.studentId : '',
      assessors: student ? [...student.assessors] : [],
      time: booking.time,
      room: `房间${roomIdx + 1}`,
      hasConflict: student ? student.hasConflict : false,
      idx: student ? studentSchedules.value.indexOf(student) : -1
    }
    isEditingMeeting.value = false
    showMeetingDetailModal.value = true
  }

  const republish = () => {
    uni.showModal({
      title: '确认操作',
      content: '是否确认重新发布？',
      success: function (res) {
        if (res.confirm) {
          currentStep.value = 3
        }
      }
    })
  }

  const room1 = ref('')
  const room2 = ref('')
  </script>
  
  <style scoped>
  .annual-review-container {
    min-height: 100vh;
    background: #f2f2f7;
    display: flex;
    flex-direction: column;
    padding-bottom: 120rpx;
    align-items: center;
  }
  
  .nav-bar {
    height: 88rpx;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1rpx solid #e5e5e7;
    width: 100vw;
    max-width: none;
    margin: 0;
    border-radius: 0;
  }
  
  .nav-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .stepper-container {
    background: white;
    padding: 32rpx 0 32rpx 0;
    border-bottom: 1rpx solid #e5e5e7;
    width: 100vw;
    max-width: none;
    margin: 0;
    border-radius: 0;
    display: flex;
    justify-content: center;
  }
  
  .stepper {
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }
  
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
  }
  
  .step-circle {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background: #F2F2F7;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12rpx;
    transition: all 0.3s ease;
  }
  
  .step-item.active .step-circle {
    background: linear-gradient(135deg, #007AFF, #5856D6);
  }
  
  .step-item.current .step-circle {
    background: linear-gradient(135deg, #FF9500, #FF6B35);
    transform: scale(1.1);
  }
  
  .step-number {
    font-size: 24rpx;
    font-weight: 600;
    color: #8E8E93;
  }
  
  .step-item.active .step-number,
  .step-item.current .step-number {
    color: white;
  }
  
  .step-label {
    font-size: 22rpx;
    color: #8E8E93;
    text-align: center;
    font-weight: 500;
  }
  
  .step-item.active .step-label,
  .step-item.current .step-label {
    color: #1d1d1f;
    font-weight: 600;
  }
  
  .step-line {
    position: absolute;
    top: 30rpx;
    left: 60%;
    right: -40%;
    height: 2rpx;
    background: #E5E5E7;
    z-index: -1;
  }
  
  .step-item.active .step-line {
    background: linear-gradient(135deg, #007AFF, #5856D6);
  }
  
  .content-area {
    flex: 1;
    padding: 0 32rpx 40rpx 32rpx;
    width: 100%;
    max-width: 700px;
    box-sizing: border-box;
    margin: 0 auto;
  }
  
  .stage-title {
    margin: 32rpx 0 24rpx 0;
  }
  
  .title-text {
    font-size: 36rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .preparation-stage {
    padding: 0 0 32rpx 0;
    background: #f7f8fa;
  }
  
  .checklist {
    background: #fff;
    border-radius: 20rpx;
    margin: 0 auto;
    max-width: 100%;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
    padding: 8rpx 0;
  }
  
  .checklist-item {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 28rpx 32rpx 20rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    min-height: 72rpx;
    position: relative;
    transition: background 0.2s;
  }
  .checklist-item:last-child {
    border-bottom: none;
  }
  
  .checklist-item.completed .check-title,
  .checklist-item.completed .check-subtitle {
    color: #222;
  }
  .checklist-item.completed .check-icon .icon-text {
    color: #27c46b;
    font-weight: bold;
  }
  
  .check-icon {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: #eafaf1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    margin-top: 4rpx;
  }
  .icon-text {
    font-size: 28rpx;
  }
  
  .check-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .check-title {
    font-size: 28rpx;
    font-weight: 500;
    margin-bottom: 4rpx;
  }
  .check-subtitle {
    font-size: 24rpx;
    color: #888;
    margin-top: 2rpx;
  }
  
  .checklist-item.expandable {
    cursor: pointer;
    user-select: none;
  }
  .expand-arrow {
    font-size: 26rpx;
    color: #bbb;
    margin-left: 12rpx;
    align-self: center;
    transition: transform 0.2s;
  }
  
  .expand-detail {
    background: #f7f8fa;
    border-radius: 12rpx;
    margin: 0 32rpx 12rpx 96rpx;
    padding: 12rpx 16rpx;
    font-size: 24rpx;
    color: #444;
  }
  .expand-item {
    padding: 4rpx 0;
    border-bottom: 1rpx dashed #e0e0e0;
  }
  .expand-item:last-child {
    border-bottom: none;
  }
  
  .generate-section {
    margin: 32rpx auto 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 100%;
  }
  .generate-button {
    width: 100%;
    max-width: 100%;
    margin: 0 auto 8rpx auto;
    height: 88rpx;
    background: linear-gradient(90deg, #4fc3f7 0%, #1976d2 100%);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 30rpx;
    font-weight: bold;
    transition: opacity 0.2s;
  }
  .generate-button.disabled {
    opacity: 0.5;
  }
  .generate-hint {
    color: #f56c6c;
    font-size: 24rpx;
    margin-top: 4rpx;
  }
  
  .generation-progress {
    text-align: center;
    padding: 60rpx 0;
  }
  
  .progress-circle {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #007AFF, #5856D6);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24rpx auto;
  }
  
  .progress-text {
    font-size: 48rpx;
    color: white;
    font-weight: 700;
  }
  
  .progress-label {
    font-size: 28rpx;
    color: #1d1d1f;
    font-weight: 500;
  }
  
  .generation-log {
    background: white;
    border-radius: 16rpx;
    border: 1rpx solid #e5e5e7;
    margin-top: 32rpx;
    max-height: 400rpx;
    overflow-y: auto;
  }
  
  .log-item {
    display: flex;
    align-items: center;
    padding: 20rpx 32rpx;
    border-bottom: 1rpx solid #e5e5e7;
  }
  
  .log-item:last-child {
    border-bottom: none;
  }
  
  .log-time {
    font-size: 20rpx;
    color: #8E8E93;
    font-family: monospace;
    margin-right: 20rpx;
    min-width: 120rpx;
  }
  
  .log-message {
    font-size: 24rpx;
    color: #1d1d1f;
    flex: 1;
  }
  
  .view-switcher {
    display: flex;
    background: white;
    border-radius: 16rpx;
    border: 1rpx solid #e5e5e7;
    margin-bottom: 24rpx;
    padding: 8rpx;
  }
  
  .view-option {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    border-radius: 12rpx;
    transition: all 0.3s ease;
  }
  
  .view-option.active {
    background: linear-gradient(135deg, #007AFF, #5856D6);
  }
  
  .view-text {
    font-size: 26rpx;
    color: #8E8E93;
    font-weight: 500;
  }
  
  .view-option.active .view-text {
    color: white;
    font-weight: 600;
  }
  
  .audit-summary {
    display: flex;
    gap: 16rpx;
    margin-bottom: 32rpx;
  }
  
  .summary-item {
    flex: 1;
    background: white;
    border-radius: 16rpx;
    border: 1rpx solid #e5e5e7;
    padding: 32rpx 20rpx;
    text-align: center;
  }
  
  .summary-number {
    font-size: 48rpx;
    font-weight: 700;
    color: #007AFF;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .summary-label {
    font-size: 22rpx;
    color: #8E8E93;
    font-weight: 500;
  }
  
  .student-item {
    background: white;
    border-radius: 16rpx;
    border: 1rpx solid #e5e5e7;
    margin-bottom: 16rpx;
    padding: 28rpx 32rpx;
    display: flex;
    align-items: center;
  }
  
  .student-info {
    min-width: 160rpx;
  }
  
  .student-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #1d1d1f;
    display: block;
    margin-bottom: 6rpx;
  }
  
  .student-id {
    font-size: 22rpx;
    color: #8E8E93;
    display: block;
  }
  
  .assignment-info {
    flex: 1;
    margin-left: 24rpx;
  }
  
  .assessors {
    margin-bottom: 12rpx;
  }
  
  .assessor-label {
    font-size: 24rpx;
    color: #8E8E93;
  }
  
  .assessor-names {
    font-size: 24rpx;
    color: #1d1d1f;
    font-weight: 500;
  }
  
  .schedule-details {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }
  
  .schedule-time,
  .schedule-room {
    font-size: 22rpx;
    color: #8E8E93;
  }
  
  .item-actions {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  
  .edit-button {
    background: #f2f2f7;
    border-radius: 8rpx;
    padding: 8rpx 16rpx;
    margin-left: 8rpx;
  }
  
  .edit-text {
    font-size: 22rpx;
    color: #888;
    font-weight: 400;
  }
  
  .conflict-badge {
    background: #f7dada;
    border-radius: 8rpx;
    position: relative;
    width: 48rpx;
    height: 28rpx;
    margin-right: 8rpx;
    display: inline-block;
  }
  .badge-text {
    position: absolute;
    left: 4rpx;
    top: 2rpx;
    font-size: 18rpx;
    color: #b77;
    font-weight: 400;
    line-height: 1;
  }
  
  .teacher-item {
    background: white;
    border-radius: 16rpx;
    border: 1rpx solid #e5e5e7;
    margin-bottom: 16rpx;
    padding: 28rpx 32rpx;
  }
  
  .teacher-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }
  
  .teacher-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .teacher-schedule {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }
  
  .time-slot {
    background: #F2F2F7;
    border-radius: 12rpx;
    padding: 12rpx 16rpx;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }
  
  .slot-time {
    font-size: 20rpx;
    color: #8E8E93;
    font-weight: 500;
  }
  
  .slot-student {
    font-size: 22rpx;
    color: #1d1d1f;
    font-weight: 500;
  }
  
  .teacher-status {
    margin-top: 16rpx;
  }
  
  .overload-badge {
    background: #FF9500;
    border-radius: 12rpx;
    padding: 6rpx 16rpx;
    display: inline-block;
  }
  
  .room-item {
    background: white;
    border-radius: 16rpx;
    border: 1rpx solid #e5e5e7;
    margin-bottom: 16rpx;
    padding: 28rpx 32rpx;
  }
  
  .room-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }
  
  .room-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .room-schedule {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }
  
  .booking-slot {
    background: #F2F2F7;
    border-radius: 12rpx;
    padding: 12rpx 16rpx;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }
  
  .booking-time {
    font-size: 20rpx;
    color: #8E8E93;
    font-weight: 500;
  }
  
  .booking-student {
    font-size: 22rpx;
    color: #1d1d1f;
    font-weight: 500;
  }
  
  .audit-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 40rpx;
  }
  
  .action-button {
    flex: 1;
    text-align: center;
    padding: 28rpx 32rpx;
    border-radius: 16rpx;
    transition: all 0.3s ease;
  }
  
  .action-button.secondary {
    background: #F2F2F7;
    border: 1rpx solid #e5e5e7;
  }
  
  .action-button.secondary .action-text {
    color: #1d1d1f;
  }
  
  .action-button.primary {
    background: linear-gradient(135deg, #007AFF, #5856D6);
  }
  
  .action-button.primary .action-text {
    color: white;
  }
  
  .action-button.danger {
    background: linear-gradient(135deg, #FF3B30, #FF2D20);
  }
  
  .action-button.danger .action-text {
    color: white;
  }
  
  .action-button:active {
    transform: scale(0.95);
  }
  
  .publish-summary {
    margin-bottom: 32rpx;
  }
  
  .summary-card {
    background: white;
    border-radius: 16rpx;
    border: 1rpx solid #e5e5e7;
    padding: 32rpx;
  }
  
  .card-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1d1d1f;
    display: block;
    margin-bottom: 24rpx;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }
  
  .summary-row:last-child {
    margin-bottom: 0;
  }
  
  .row-label {
    font-size: 26rpx;
    color: #8E8E93;
  }
  
  .row-value {
    font-size: 26rpx;
    color: #1d1d1f;
    font-weight: 600;
  }
  
  .publish-warning {
    background: #FFF9E6;
    border: 1rpx solid #FFD60A;
    border-radius: 16rpx;
    padding: 24rpx 32rpx;
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    margin-bottom: 32rpx;
  }
  
  .warning-icon {
    font-size: 32rpx;
    margin-top: 4rpx;
  }
  
  .warning-text {
    flex: 1;
    font-size: 26rpx;
    color: #1d1d1f;
    line-height: 1.4;
  }
  
  .publish-actions {
    display: flex;
    gap: 16rpx;
  }
  
  .bottom-space {
    height: 40rpx;
  }
  
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
  
  .modal-content {
    background: white;
    border-radius: 28rpx;
    width: 540rpx;
    overflow: hidden;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    padding: 40rpx 32rpx 24rpx 32rpx;
    text-align: center;
  }
  
  .modal-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .modal-body {
    padding: 0 32rpx 40rpx 32rpx;
    text-align: center;
  }
  
  .modal-message {
    font-size: 28rpx;
    color: #8E8E93;
    line-height: 1.4;
  }
  
  .modal-actions {
    display: flex;
    border-top: 1rpx solid rgba(0, 0, 0, 0.1);
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
  
  .cancel-button {
    border-right: 1rpx solid rgba(0, 0, 0, 0.1);
  }
  
  .cancel-button .button-text {
    color: #007AFF;
    font-size: 30rpx;
    font-weight: 500;
  }
  
  .confirm-button .button-text {
    color: #FF3B30;
    font-size: 30rpx;
    font-weight: 600;
  }
  
  .edit-modal-content {
    background: white;
    border-radius: 28rpx;
    width: 90vw;
    max-width: 640rpx;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
  }
  
  .edit-modal-header {
    padding: 32rpx;
    border-bottom: 1rpx solid #e5e5e7;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .edit-modal-title {
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
  
  .edit-modal-body {
    flex: 1;
    padding: 32rpx;
  }
  
  .edit-form {
    /* 表单样式 */
  }
  
  .form-section {
    margin-bottom: 32rpx;
  }
  
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .student-info-text {
    font-size: 26rpx;
    color: #8E8E93;
  }
  
  .edit-modal-actions {
    border-top: 1rpx solid #e5e5e7;
    display: flex;
  }

  .bottom-navigation {
    background: white;
    display: flex;
    justify-content: space-around;
    padding: 20rpx 0 32rpx 0;
    border-top: 1rpx solid #e5e5e5;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12rpx 24rpx;
    border-radius: 16rpx;
    transition: all 0.3s ease;
    min-width: 120rpx;
  }

  .nav-item.active {
    background: #f3f4f6;
  }

  .nav-icon {
    font-size: 24rpx;
    margin-bottom: 8rpx;
  }

  .nav-text {
    font-size: 22rpx;
    color: #666666;
  }

  .nav-item.active .nav-text {
    color: #4f46e5;
    font-weight: 600;
  }

  .plan-summary-stage {
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
    background: #fff;
    border-radius: 16rpx;
    padding: 16rpx;
    box-sizing: border-box;
  }
  .plan-summary-list {
    margin-bottom: 32rpx;
    width: 100%;
    box-sizing: border-box;
  }
  .plan-summary-item {
    background: #f7f8fa;
    border-radius: 12rpx;
    padding: 16rpx;
    margin-bottom: 16rpx;
    width: 100%;
    box-sizing: border-box;
  }
  .summary-row {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
    flex-wrap: wrap;
  }
  .summary-label {
    min-width: 70rpx;
    color: #888;
    font-size: 24rpx;
    flex-shrink: 0;
  }
  .summary-value {
    color: #222;
    font-size: 26rpx;
    font-weight: 500;
    word-break: break-all;
    flex: 1;
  }
  .plan-summary-actions {
    display: flex;
    justify-content: center;
    gap: 32rpx;
    margin-top: 24rpx;
  }
  .action-button.danger {
    background: linear-gradient(135deg, #FF3B30, #FF2D20);
    color: #fff;
  }

  .publish-status-banner-simple {
    width: 100%;
    max-width: 700px;
    margin: 0 auto 24rpx auto;
    background: #f5f6fa;
    border-radius: 0;
    padding: 18rpx 0;
    text-align: center;
    box-sizing: border-box;
    border-bottom: 1rpx solid #e5e5e7;
  }
  .publish-status-text-simple {
    color: #1d1d1f;
    font-size: 30rpx;
    font-weight: bold;
    letter-spacing: 2rpx;
  }

  .room-management-title {
    width: 100%;
    text-align: left;
    font-size: 32rpx;
    font-weight: bold;
    margin: 24rpx 0 12rpx 12rpx;
    color: #333;
  }
  .room-management-stage {
    padding: 0 8rpx;
  }
  .room-info-card {
    background: #fff;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    padding: 24rpx 20rpx;
    margin: 0 0 24rpx 0;
    width: 100%;
    box-sizing: border-box;
  }
  .room-input-row {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
  }
  .room-input-label {
    font-size: 24rpx;
    color: #666;
    width: 120rpx;
    flex-shrink: 0;
  }
  .room-input-inner {
    flex: 1;
    font-size: 24rpx;
    padding: 12rpx 16rpx;
    border: none;
    border-radius: 12rpx;
    background: #f5f6fa;
    color: #333;
    box-shadow: none;
  }
  .room-action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 32rpx 0;
    gap: 16rpx;
  }
  .meeting-detail-body {
    text-align: left;
  }
  .meeting-detail-body div {
    margin-bottom: 12rpx;
  }

  .conflict-slot {
    background: #f7dada;
  }
  </style>