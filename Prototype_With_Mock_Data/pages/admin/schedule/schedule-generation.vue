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
                  <!-- 评审日程 -->
                  <view class="checklist-item completed expandable" @click="toggleExpand('schedule')">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">评审日程</text>
                      <text class="check-subtitle">{{ scheduleList.length }}个日程</text>
                    </view>
                    <view class="expand-arrow">{{ expandStatus.schedule ? '▲' : '▼' }}</view>
                  </view>
                  <view v-if="expandStatus.schedule" class="expand-detail">
                    <view v-for="schedule in scheduleList" :key="schedule.id" class="expand-item">
                      <text >{{ schedule.date }}：{{ schedule.morning }}</text>
					  <text v-if="schedule.morning">、</text>
                      <text v-if="schedule.afternoon">{{ schedule.afternoon }}</text>
                    </view>
                  </view>

                  <!-- 截止时间 -->
                  <view class="checklist-item completed">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">教师选择截止时间</text>
                      <text class="check-subtitle">{{ deadlineValue }}</text>
                    </view>
                  </view>

                  <view class="checklist-item completed">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">评审工作量</text>
                      <text class="check-subtitle">{{ workloadValue }}人/学期，每生2位老师</text>
                    </view>
                  </view>
                  <view class="checklist-item completed">
                    <view class="check-icon"><text class="icon-text">✓</text></view>
                    <view class="check-content">
                      <text class="check-title">单次评审时长</text>
                      <text class="check-subtitle">{{ durationValue }}分钟</text>
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
                      <view class="teacher-info-row">
                        <text 
                          class="teacher-name" 
                          :class="{ 'overloaded-teacher': isTeacherOverloaded(teacher.name) }"
                        >
                          {{ teacher.name }}（{{ teacher.title }}）
                        </text>
                        <view class="teacher-availability">
                          <text class="availability-label">可用时段：</text>
                          <view class="time-slots">
                            <view v-for="slot in teacher.availableSlots" :key="slot" class="time-slot-tag">
                              <text class="slot-text">{{ slot }}</text>
                            </view>
                          </view>
                        </view>
                      </view>
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
              <text class="summary-number">{{ scheduleStats.timeRoomConflicts }}</text>
              <text class="summary-label">时间冲突</text>
            </view>
            <view class="summary-item">
              <text class="summary-number">{{ scheduleStats.teacherOverloads }}</text>
              <text class="summary-label">教师超负荷</text>
            </view>
          </view>
          
          <!-- 按学生视图 -->
          <view v-if="currentView === 'student'" class="student-view">
            <view v-for="(student, index) in studentSchedules" :key="index" class="student-item" @click="editStudentSchedule(student)">
              <view class="student-info">
                <view v-if="student.hasTimeRoomConflict" class="conflict-badge time-room-conflict">
                  <text class="badge-text">冲突</text>
                </view>
                <text class="student-name">{{ student.name }}</text>
                <text class="student-id">{{ student.studentId }}</text>
              </view>
              <view class="assignment-info">
                <view class="assessors">
                  <text class="assessor-label">评审老师：</text>
                  <text class="assessor-names">
                    <text 
                      v-for="(assessor, aIndex) in student.assessors" 
                      :key="aIndex"
                      :class="{ 'overloaded-teacher-name': isTeacherNameOverloaded(assessor) }"
                    >
                      {{ assessor }}{{ aIndex < student.assessors.length - 1 ? ', ' : '' }}
                    </text>
                  </text>
                </view>
                <view class="schedule-details">
                  <view class="schedule-time">{{ student.time }}</view>
                  <view class="schedule-room">{{ student.room }}</view>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 按老师视图 -->
          <view v-else-if="currentView === 'teacher'" class="teacher-view">
            <view v-for="(teacher, index) in teacherSchedules" :key="index" class="teacher-item">
              <view class="teacher-info">
                <text 
                  class="teacher-name" 
                  :class="{ 'overloaded-teacher': teacher.overloaded }"
                >
                  {{ teacher.name }}
                </text>
              </view>
              <view class="teacher-schedule">
                <view v-for="(slot, slotIndex) in teacher.timeSlots" :key="slotIndex" class="time-slot" @click="editStudentByName(slot.student)">
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
                <text class="room-name">{{ room.name }}</text>
              </view>
              <view class="room-schedule">
                <view v-for="(booking, bookingIndex) in room.bookings" :key="bookingIndex" class="booking-slot" @click="editStudentByName(booking.student)">
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
            <view class="room-input-container">
              <view class="room-input-row">
                <text class="room-input-label">房间一：</text>
                <input v-model="room1" class="room-input-inner" placeholder="请输入房间一名称" />
              </view>
              <view class="room-time-info">
                <text class="room-time-label">预约时间：</text>
                <text class="room-time-text">{{ getRoomTimeInfo(0) }}</text>
              </view>
            </view>
            
            <view class="room-input-container">
              <view class="room-input-row">
                <text class="room-input-label">房间二：</text>
                <input v-model="room2" class="room-input-inner" placeholder="请输入房间二名称" />
              </view>
              <view class="room-time-info">
                <text class="room-time-label">预约时间：</text>
                <text class="room-time-text">{{ getRoomTimeInfo(1) }}</text>
              </view>
            </view>
            
            <view class="room-input-container">
              <view class="room-input-row">
                <text class="room-input-label">房间三：</text>
                <input v-model="room3" class="room-input-inner" placeholder="请输入房间三名称" />
              </view>
              <view class="room-time-info">
                <text class="room-time-label">预约时间：</text>
                <text class="room-time-text">{{ getRoomTimeInfo(2) }}</text>
              </view>
            </view>
            
            <view class="room-input-container">
              <view class="room-input-row">
                <text class="room-input-label">房间四：</text>
                <input v-model="room4" class="room-input-inner" placeholder="请输入房间四名称" />
              </view>
              <view class="room-time-info">
                <text class="room-time-label">预约时间：</text>
                <text class="room-time-text">{{ getRoomTimeInfo(3) }}</text>
              </view>
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
                  <text class="summary-value">{{ student.room }}</text>
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
  
      <!-- 优化后的编辑安排弹窗 -->
      <view v-if="showEditModal" class="modal-overlay" @click="hideEditModal">
        <view class="optimized-edit-modal" @click.stop>
          <!-- 弹窗头部 -->
          <view class="edit-modal-header-new">
            <view class="header-content">
              <text class="modal-title-new">编辑评审安排</text>
              <text class="student-info-header">{{ editForm.name }} ({{ editForm.studentId }})</text>
            </view>
            <view class="close-btn" @click="hideEditModal">
              <text class="close-icon">×</text>
            </view>
          </view>

          <!-- 弹窗主体内容 -->
          <scroll-view class="edit-modal-body-new" scroll-y="true">
            
            <!-- 时间选择区域 -->
            <view class="edit-section">
              <view class="section-header">
                <view class="section-icon">🕒</view>
                <text class="section-title-new">会议时间</text>
              </view>
              
              <view class="time-selection-wrapper">
                <!-- 日期选择卡片 -->
                <view class="date-selection-card">
                  <view class="card-header">
                    <text class="card-title">选择日期</text>
                  </view>
                  <view class="date-grid">
                    <view 
                      v-for="dateInfo in detailedDateOptions" 
                      :key="dateInfo.date"
                      class="date-card-item"
                      :class="{ 'selected': editForm.selectedDate === dateInfo.date }"
                      @click="selectDate(dateInfo.date)"
                    >
                      <view class="date-main">
                        <text class="date-text-new">{{ dateInfo.displayDate }}</text>
                        <text class="weekday-text">{{ dateInfo.weekday }}</text>
                      </view>
                      <view class="date-stats">
                        <text class="slots-count">{{ dateInfo.totalSlots }}个时段</text>
                      </view>
                    </view>
                  </view>
                </view>

                <!-- 时间段选择卡片 -->
                <view class="timeslot-selection-card">
                  <view class="card-header">
                    <text class="card-title">选择时间段</text>
                    <text v-if="editForm.selectedDate" class="selected-date-display">{{ getSelectedDateDisplay() }}</text>
                  </view>
                  
                  <view v-if="!editForm.selectedDate" class="empty-state">
                    <view class="empty-icon">📅</view>
                    <text class="empty-text">请先选择日期</text>
                  </view>
                  
                  <view v-else class="timeslot-content">
                    <!-- 上午时段 -->
                    <view v-if="getMorningSlots().length > 0" class="time-period">
                      <view class="period-header">
                        <text class="period-title">上午</text>
                      </view>
                      <view class="timeslot-grid">
                        <view 
                          v-for="timeSlot in getMorningSlots()" 
                          :key="timeSlot.slot"
                          class="timeslot-item"
                          :class="{ 
                            'selected': editForm.selectedTimeSlot === timeSlot.slot
                          }"
                          @click="selectTimeSlot(timeSlot)"
                        >
                          <text class="time-text-new">{{ timeSlot.displayTime }}</text>
                        </view>
                      </view>
                    </view>
                    
                    <!-- 下午时段 -->
                    <view v-if="getAfternoonSlots().length > 0" class="time-period">
                      <view class="period-header">
                        <text class="period-title">下午</text>
                      </view>
                      <view class="timeslot-grid">
                        <view 
                          v-for="timeSlot in getAfternoonSlots()" 
                          :key="timeSlot.slot"
                          class="timeslot-item"
                          :class="{ 
                            'selected': editForm.selectedTimeSlot === timeSlot.slot
                          }"
                          @click="selectTimeSlot(timeSlot)"
                        >
                          <text class="time-text-new">{{ timeSlot.displayTime }}</text>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <!-- 教师选择区域 -->
            <view class="edit-section">
              <view class="section-header">
                <view class="section-icon">👥</view>
                <text class="section-title-new">评审教师</text>
                <view class="selection-counter">
                  <text class="counter-text">{{ editForm.selectedTeachers.length }}/2</text>
                </view>
              </view>
              
              <view v-if="!editForm.selectedDate || !editForm.selectedTimeSlot" class="empty-state">
                <view class="empty-icon">⏰</view>
                <text class="empty-text">请先选择日期和时间段</text>
              </view>
              
              <view v-else-if="availableTeachers.length === 0" class="empty-state">
                <view class="empty-icon">😔</view>
                <text class="empty-text">该时间段暂无可用教师</text>
              </view>
              
              <view v-else class="teacher-selection-new">
                <view 
                  v-for="teacher in availableTeachers" 
                  :key="teacher.id" 
                  class="teacher-card"
                  :class="{ 
                    'selected': editForm.selectedTeachers.includes(`${teacher.name}（${teacher.title}）`),
                    'disabled': false
                  }"
                  @click="toggleTeacherSelection(teacher)"
                >
                  <view class="teacher-avatar">
                    <text class="avatar-text">{{ teacher.name.charAt(0) }}</text>
                  </view>
                  <view class="teacher-info-new">
                    <text class="teacher-name-new">{{ teacher.name }}</text>
                    <text class="teacher-title">{{ teacher.title }}</text>
                  </view>
                  <view class="selection-indicator">
                    <view v-if="editForm.selectedTeachers.includes(`${teacher.name}（${teacher.title}）`)" class="check-mark">✓</view>
                  </view>
                </view>
              </view>
            </view>

            <!-- 会议室选择区域 -->
            <view class="edit-section">
              <view class="section-header">
                <view class="section-icon">🏢</view>
                <text class="section-title-new">会议室</text>
              </view>
              
              <view v-if="!editForm.selectedDate || !editForm.selectedTimeSlot" class="empty-state">
                <view class="empty-icon">⏰</view>
                <text class="empty-text">请先选择日期和时间段</text>
              </view>
              
              <view v-else-if="availableRooms.length === 0" class="empty-state">
                <view class="empty-icon">😔</view>
                <text class="empty-text">该时间段暂无可用会议室</text>
              </view>
              
              <view v-else class="room-selection-new">
                <view 
                  v-for="room in availableRooms" 
                  :key="room.name"
                  class="room-card"
                  :class="{ 
                    'selected': editForm.selectedRoom === room.name
                  }"
                  @click="selectRoom(room.name)"
                >
                  <view class="room-icon">🏢</view>
                  <view class="room-info-new">
                    <text class="room-name-new">{{ room.name }}</text>
                  </view>
                  <view class="selection-indicator">
                    <view v-if="editForm.selectedRoom === room.name" class="check-mark">✓</view>
                  </view>
                </view>
              </view>
            </view>

            <!-- 安排预览区域 -->
            <view class="edit-section">
              <view class="section-header">
                <view class="section-icon">📋</view>
                <text class="section-title-new">安排预览</text>
              </view>
              
              <view class="preview-card">
                <view class="preview-item">
                  <text class="preview-label">学生</text>
                  <text class="preview-value">{{ editForm.name }}（{{ editForm.studentId }}）</text>
                </view>
                <view class="preview-item">
                  <text class="preview-label">时间</text>
                  <text class="preview-value">{{ getFullSelectedTime() || '未选择' }}</text>
                </view>
                <view class="preview-item">
                  <text class="preview-label">教师</text>
                  <text class="preview-value">{{ editForm.selectedTeachers.length ? editForm.selectedTeachers.join('、') : '未选择' }}</text>
                </view>
                <view class="preview-item">
                  <text class="preview-label">会议室</text>
                  <text class="preview-value">{{ editForm.selectedRoom || '未选择' }}</text>
                </view>
              </view>
            </view>

          </scroll-view>

          <!-- 弹窗底部操作区 -->
          <view class="edit-modal-footer-new">
            <view class="footer-buttons">
              <view class="cancel-btn-new" @click="hideEditModal">
                <text class="btn-text">取消</text>
              </view>
              <view class="save-btn-new" @click="saveEditChanges">
                <text class="btn-text">保存修改</text>
              </view>
            </view>
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
  
  // 重构后的编辑表单数据结构
  const editForm = ref({
    name: '',
    studentId: '',
    selectedDate: '', // 新增：选择的日期
    selectedTimeSlot: '', // 新增：选择的时间段
    selectedTeachers: [], // 选择的教师列表（教师名称数组）
    selectedRoom: '',
    originalIndex: -1
  })
  
  const activeTab = ref('generation')
  const isRegeneration = ref(false) // 新增：标记是否为重新生成
  
  const steps = ref([
    { label: '准备工作' },
    { label: '生成草案' },
    { label: '审核调整' },
    { label: '房间管理' },
    { label: '方案总览' }
  ])
  
  // 同步 dashboard.vue 的配置数据
  const scheduleList = ref([
    {
      id: 1,
      date: '2025-07-01',
      displayDate: '7月1日',
      weekday: '周二',
      morning: '08:00-12:00',
      afternoon: '14:00-17:00'
    },
    {
      id: 2,
      date: '2025-07-02',
      displayDate: '7月2日',
      weekday: '周三',
      morning: '',
      afternoon: '13:00-18:00'
    },
    {
      id: 3,
      date: '2025-07-03',
      displayDate: '7月3日',
      weekday: '周四',
      morning: '09:30-11:30',
      afternoon: '15:00-17:00'
    }
  ])
  
  const deadlineValue = ref('2025年8月7日 00:00')
  const workloadValue = ref('4')
  const durationValue = ref('45')
  
  // 扩展教师列表 - 确保掌陵在列表中
  const teacherList = ref([
    { 
      id: 1, 
      name: '王伟', 
      title: '教授',
      availableSlots: ['7月1日 08:00-12:00', '7月1日 14:00-17:00', '7月2日 13:00-18:00']
    },
    { 
      id: 2, 
      name: '李静', 
      title: '副教授',
      availableSlots: ['7月1日 08:00-12:00', '7月1日 14:00-17:00', '7月2日 13:00-18:00', '7月3日 15:00-17:00']
    },
    { 
      id: 3, 
      name: '陈华', 
      title: '教授',
      availableSlots: ['7月1日 08:00-12:00', '7月3日 15:00-17:00']
    },
    { 
      id: 4, 
      name: '张明', 
      title: '副教授',
      availableSlots: ['7月1日 08:00-12:00', '7月1日 14:00-17:00', '7月2日 13:00-18:00', '7月3日 09:30-11:30']
    },
    { 
      id: 5, 
      name: '刘芳', 
      title: '教授',
      availableSlots: ['7月1日 14:00-17:00', '7月2日 13:00-18:00', '7月3日 15:00-17:00']
    },
    { 
      id: 6, 
      name: '赵强', 
      title: '副教授',
      availableSlots: ['7月1日 08:00-12:00', '7月1日 14:00-17:00', '7月3日 15:00-17:00']
    }
  ])
  
  // 扩展学生列表
  const studentList = ref([
    { id: 1, name: '李明', studentId: 'PhD2021001' },
    { id: 2, name: '张小雨', studentId: 'PhD2021002' },
    { id: 3, name: '王磊', studentId: 'PhD2021003' },
    { id: 4, name: '陈思', studentId: 'PhD2021004' },
    { id: 5, name: '刘洋', studentId: 'PhD2021005' },
    { id: 6, name: '杨帆', studentId: 'PhD2021006' },
    { id: 7, name: '周雪', studentId: 'PhD2021007' },
    { id: 8, name: '吴涛', studentId: 'PhD2021008' }
  ])
  
  // 展开状态，新增schedule
  const expandStatus = ref({
    teacher: false,
    student: false,
    schedule: false
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
  
  // 修改统计数据 - 分别统计两种冲突
  const scheduleStats = ref({
    totalStudents: 8,
    timeRoomConflicts: 0, // 时间会议室冲突，动态计算
    teacherOverloads: 0   // 教师超负荷冲突，动态计算
  })
  
  // 统一的房间数据定义
  const roomSchedules = ref([
    {
      name: '会议室1',
      bookings: []
    },
    {
      name: '会议室2',
      bookings: []
    },
    {
      name: '会议室3',
      bookings: []
    },
    {
      name: '会议室4',
      bookings: []
    }
  ])
  
  // 修改学生安排数据 
  const studentSchedules = ref([
    {
      name: '李明',
      studentId: 'PhD2021001',
      assessors: ['王伟（教授）', '李静（副教授）'],
      time: '7月1日 08:45-09:30',
      room: '会议室1',
      hasTimeRoomConflict: false
    },
    {
      name: '张小雨',
      studentId: 'PhD2021002',
      assessors: ['陈华（教授）', '李静（副教授）'],
      time: '7月1日 08:00-08:45',
      room: '会议室2',
      hasTimeRoomConflict: false
    },
    {
      name: '王磊',
      studentId: 'PhD2021003',
      assessors: ['张明（副教授）', '刘芳（教授）'],
      time: '7月1日 09:30-10:15',
      room: '会议室2',
      hasTimeRoomConflict: false
    },
    {
      name: '陈思',
      studentId: 'PhD2021004',
      assessors: ['陈华（教授）', '赵强（副教授）'],
      time: '7月1日 10:15-11:00',
      room: '会议室2',
      hasTimeRoomConflict: false
    },
    {
      name: '刘洋',
      studentId: 'PhD2021005',
      assessors: ['王伟（教授）', '刘芳（教授）'],
      time: '7月1日 14:00-14:45',
      room: '会议室3',
      hasTimeRoomConflict: false
    },
    {
      name: '杨帆',
      studentId: 'PhD2021006',
      assessors: ['张明（副教授）', '赵强（副教授）'],
      time: '7月1日 14:45-15:30',
      room: '会议室3',
      hasTimeRoomConflict: false
    },
    {
      name: '周雪',
      studentId: 'PhD2021007',
      assessors: ['王伟（教授）', '刘芳（教授）'],
      time: '7月2日 13:00-13:45',
      room: '会议室4',
      hasTimeRoomConflict: false
    },
    {
      name: '吴涛',
      studentId: 'PhD2021008',
      assessors: ['陈华（教授）', '张明（副教授）'],
      time: '7月2日 13:45-14:30',
      room: '会议室4',
      hasTimeRoomConflict: false
    }
  ])
  
  // 教师安排数据 
  const teacherSchedules = ref([
    {
      name: '王伟（教授）',
      assigned: 3, // 减少到3个学生，不超负荷
      maxLoad: 4,
      overloaded: false, // 改为不超负荷
      timeSlots: [
        { time: '7月1日 08:45-09:30', student: '李明' },
        { time: '7月1日 14:00-14:45', student: '刘洋' },
        { time: '7月2日 13:00-13:45', student: '周雪' }
      ]
    },
    {
      name: '李静（副教授）',
      assigned: 2,
      maxLoad: 4,
      overloaded: false,
      timeSlots: [
        { time: '7月1日 08:45-09:30', student: '李明' },
        { time: '7月1日 08:00-08:45', student: '张小雨' }
      ]
    },
    {
      name: '陈华（教授）',
      assigned: 3,
      maxLoad: 4,
      overloaded: false,
      timeSlots: [
        { time: '7月1日 08:00-08:45', student: '张小雨' },
        { time: '7月1日 10:15-11:00', student: '陈思' },
        { time: '7月2日 13:45-14:30', student: '吴涛' }
      ]
    },
    {
      name: '张明（副教授）',
      assigned: 3,
      maxLoad: 4,
      overloaded: false,
      timeSlots: [
        { time: '7月1日 09:30-10:15', student: '王磊' },
        { time: '7月1日 14:45-15:30', student: '杨帆' },
        { time: '7月2日 13:45-14:30', student: '吴涛' }
      ]
    },
    {
      name: '刘芳（教授）',
      assigned: 3,
      maxLoad: 4,
      overloaded: false,
      timeSlots: [
        { time: '7月1日 09:30-10:15', student: '王磊' },
        { time: '7月1日 14:00-14:45', student: '刘洋' },
        { time: '7月2日 13:00-13:45', student: '周雪' }
      ]
    },
    {
      name: '赵强（副教授）',
      assigned: 2,
      maxLoad: 4,
      overloaded: false,
      timeSlots: [
        { time: '7月1日 10:15-11:00', student: '陈思' },
        { time: '7月1日 14:45-15:30', student: '杨帆' }
      ]
    }
  ])
  
  // 房间输入数据
  const room1 = ref('会议室1')
  const room2 = ref('会议室2')
  const room3 = ref('会议室3')
  const room4 = ref('会议室4')
  
  // ====== 新增：重构后的编辑相关方法 ======
  
  // 详细的日期选项，包含所有必要信息
  const detailedDateOptions = computed(() => {
    return scheduleList.value.map(schedule => {
      // 计算该日期的总时段数
      let totalSlots = 0
      if (schedule.morning) {
        const morningSlots = generateTimeSlots(schedule.morning)
        totalSlots += morningSlots.length
      }
      if (schedule.afternoon) {
        const afternoonSlots = generateTimeSlots(schedule.afternoon)
        totalSlots += afternoonSlots.length
      }
      
      return {
        date: schedule.date,
        displayDate: schedule.displayDate,
        weekday: schedule.weekday,
        totalSlots: totalSlots,
        morningRange: schedule.morning,
        afternoonRange: schedule.afternoon
      }
    })
  })
  
  // 生成45分钟时间段的函数
  const generateTimeSlots = (timeRange) => {
    if (!timeRange) return []
    
    const [startTime, endTime] = timeRange.split('-')
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const slots = []
    let currentHour = startHour
    let currentMin = startMin
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const slotStart = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
      
      // 计算结束时间（45分钟后）
      let slotEndHour = currentHour
      let slotEndMin = currentMin + 45
      
      if (slotEndMin >= 60) {
        slotEndHour += 1
        slotEndMin -= 60
      }
      
      // 检查是否超出时间范围
      if (slotEndHour > endHour || (slotEndHour === endHour && slotEndMin > endMin)) {
        break
      }
      
      const slotEnd = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMin.toString().padStart(2, '0')}`
      const slotText = `${slotStart}-${slotEnd}`
      
      slots.push({
        slot: slotText,
        displayTime: slotText,
        startHour: currentHour,
        startMin: currentMin,
        endHour: slotEndHour,
        endMin: slotEndMin
      })
      
      // 移动到下一个时段
      currentHour = slotEndHour
      currentMin = slotEndMin
    }
    
    return slots
  }
  
  // 获取选择日期的显示文本
  const getSelectedDateDisplay = () => {
    const selectedDateInfo = detailedDateOptions.value.find(d => d.date === editForm.value.selectedDate)
    return selectedDateInfo ? `${selectedDateInfo.displayDate} ${selectedDateInfo.weekday}` : ''
  }
  
  // 获取上午时段 - 删除占用逻辑
  const getMorningSlots = () => {
    if (!editForm.value.selectedDate) return []
    
    const selectedDateInfo = detailedDateOptions.value.find(d => d.date === editForm.value.selectedDate)
    if (!selectedDateInfo || !selectedDateInfo.morningRange) return []
    
    const baseSlots = generateTimeSlots(selectedDateInfo.morningRange)
    
    return baseSlots.map(slot => ({
      ...slot,
      isAvailable: true // 简化：总是可用
    }))
  }
  
  // 获取下午时段 - 删除占用逻辑
  const getAfternoonSlots = () => {
    if (!editForm.value.selectedDate) return []
    
    const selectedDateInfo = detailedDateOptions.value.find(d => d.date === editForm.value.selectedDate)
    if (!selectedDateInfo || !selectedDateInfo.afternoonRange) return []
    
    const baseSlots = generateTimeSlots(selectedDateInfo.afternoonRange)
    
    return baseSlots.map(slot => ({
      ...slot,
      isAvailable: true // 简化：总是可用
    }))
  }
  
  // 修复教师可用性计算 - 确保所有教师都可以显示
  const availableTeachers = computed(() => {
    if (!editForm.value.selectedDate || !editForm.value.selectedTimeSlot) {
      return []
    }
    
    const selectedDateInfo = detailedDateOptions.value.find(d => d.date === editForm.value.selectedDate)
    if (!selectedDateInfo) return []
    
    // 构建完整的时间段字符串 (格式: "7月1日 08:00-08:45")
    const fullTimeSlot = `${selectedDateInfo.displayDate} ${editForm.value.selectedTimeSlot}`
    
    // 过滤出在该时间段可用的教师
    return teacherList.value.filter(teacher => {
      return teacher.availableSlots.some(slot => {
        // 检查教师的可用时间段是否包含选择的时间段
        // 教师的可用时间段格式如 "7月1日 08:00-12:00"
        // 需要检查选择的时间段是否在这个范围内
        if (!slot.includes(selectedDateInfo.displayDate)) {
          return false
        }
        
        // 提取教师可用时间段的时间范围
        const timeRangeMatch = slot.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/)
        if (!timeRangeMatch) return false
        
        const [, teacherStartTime, teacherEndTime] = timeRangeMatch
        const [selectedStartTime, selectedEndTime] = editForm.value.selectedTimeSlot.split('-')
        
        // 简单的时间比较（字符串比较，因为格式统一）
        return teacherStartTime <= selectedStartTime && selectedEndTime <= teacherEndTime
      })
    })
  })
  
  // 修复会议室可用性计算 - 删除冲突检测逻辑
  const availableRooms = computed(() => {
    if (!editForm.value.selectedDate || !editForm.value.selectedTimeSlot) {
      return []
    }
    
    // 简化：返回所有会议室，不检查冲突
    return roomSchedules.value
  })
  
  // 选择日期
  const selectDate = (date) => {
    // 如果选择了新的日期，清空时间段和教师选择
    if (editForm.value.selectedDate !== date) {
      editForm.value.selectedTimeSlot = ''
      editForm.value.selectedTeachers = []
      editForm.value.selectedRoom = ''
    }
    editForm.value.selectedDate = date
  }
  
  // 选择时间段
  const selectTimeSlot = (timeSlotInfo) => {
    // 如果选择了新的时间段，清空教师和房间选择
    if (editForm.value.selectedTimeSlot !== timeSlotInfo.slot) {
      editForm.value.selectedTeachers = []
      editForm.value.selectedRoom = ''
    }
    editForm.value.selectedTimeSlot = timeSlotInfo.slot
  }
  
  // 获取完整的选择时间（用于显示）
  const getFullSelectedTime = () => {
    if (!editForm.value.selectedDate || !editForm.value.selectedTimeSlot) {
      return ''
    }
    const selectedDateInfo = detailedDateOptions.value.find(d => d.date === editForm.value.selectedDate)
    return selectedDateInfo ? `${selectedDateInfo.displayDate} ${editForm.value.selectedTimeSlot}` : ''
  }
  
  // 简化的教师选择切换
  const toggleTeacherSelection = (teacher) => {
    const teacherName = `${teacher.name}（${teacher.title}）`
    const index = editForm.value.selectedTeachers.indexOf(teacherName)
    
    if (index > -1) {
      // 如果已选择，则取消选择
      editForm.value.selectedTeachers.splice(index, 1)
    } else {
      // 如果未选择且未达到上限，则添加选择
      if (editForm.value.selectedTeachers.length < 2) {
        editForm.value.selectedTeachers.push(teacherName)
      } else {
        uni.showToast({
          title: '最多只能选择2个教师',
          icon: 'none'
        })
      }
    }
  }
  
  // 选择会议室
  const selectRoom = (roomName) => {
    editForm.value.selectedRoom = roomName
  }
  
  // 修改editStudentSchedule方法，确保教师数据正确设置
  const editStudentSchedule = (student) => {
    const studentIndex = studentSchedules.value.findIndex(s => s.studentId === student.studentId)
    
    // 解析学生的时间信息
    const studentTime = student.time
    // 匹配日期（如："7月1日"）
    const dateMatch = studentTime.match(/(\d+月\d+日)/)
    // 匹配时间段（如："08:00-08:45"）
    const timeMatch = studentTime.match(/(\d{2}:\d{2}-\d{2}:\d{2})/)
    
    // 通过显示日期找到对应的完整日期
    let fullDate = ''
    if (dateMatch) {
      const displayDate = dateMatch[1]
      const dateInfo = scheduleList.value.find(s => s.displayDate === displayDate)
      if (dateInfo) {
        fullDate = dateInfo.date
      }
    }
    
    // 初始化编辑表单数据，确保教师数据完整
    editForm.value = {
      name: student.name,
      studentId: student.studentId,
      selectedDate: fullDate,
      selectedTimeSlot: timeMatch ? timeMatch[1] : '',
      selectedTeachers: [...(student.assessors || [])], // 确保包含所有评审教师
      selectedRoom: student.room,
      originalIndex: studentIndex
    }
    
    showEditModal.value = true
  }
  
  // 新增：根据学生姓名查找并编辑学生
  const editStudentByName = (studentName) => {
    const student = studentSchedules.value.find(s => s.name === studentName)
    if (student) {
      editStudentSchedule(student)
    }
  }
  
  // ====== 新增：冲突检测相关函数 ======
  
  // 检测时间和房间冲突的核心函数
  const detectTimeRoomConflicts = () => {
    const conflicts = new Set()
    
    // 按时间和房间分组，检查是否有重复
    const timeRoomMap = new Map()
    
    studentSchedules.value.forEach((student, index) => {
      const key = `${student.time}_${student.room}`
      
      if (timeRoomMap.has(key)) {
        // 发现冲突，标记相关学生
        const existingStudentIndex = timeRoomMap.get(key)
        conflicts.add(index)
        conflicts.add(existingStudentIndex)
      } else {
        timeRoomMap.set(key, index)
      }
    })
    
    // 更新学生的冲突状态
    studentSchedules.value.forEach((student, index) => {
      student.hasTimeRoomConflict = conflicts.has(index)
    })
    
    return conflicts.size
  }
  
  // 检测教师超负荷
  const detectTeacherOverloads = () => {
    // 重新计算教师安排
    const teacherWorkload = new Map()
    
    // 初始化所有教师的工作量
    teacherList.value.forEach(teacher => {
      const teacherKey = `${teacher.name}（${teacher.title}）`
      teacherWorkload.set(teacherKey, 0)
    })
    
    // 统计每个教师的分配数量
    studentSchedules.value.forEach(student => {
      if (student.assessors) {
        student.assessors.forEach(assessor => {
          const currentCount = teacherWorkload.get(assessor) || 0
          teacherWorkload.set(assessor, currentCount + 1)
        })
      }
    })
    
    // 更新教师超负荷状态
    let overloadCount = 0
    teacherSchedules.value.forEach(teacher => {
      const workload = teacherWorkload.get(teacher.name) || 0
      teacher.assigned = workload
      teacher.overloaded = workload > teacher.maxLoad
      if (teacher.overloaded) {
        overloadCount++
      }
    })
    
    return overloadCount
  }
  
  // 修改saveEditChanges方法，添加冲突重新检测
  const saveEditChanges = () => {
    // 验证必填项
    if (!editForm.value.selectedDate) {
      uni.showToast({
        title: '请选择会议日期',
        icon: 'none'
      })
      return
    }
    
    if (!editForm.value.selectedTimeSlot) {
      uni.showToast({
        title: '请选择会议时间段',
        icon: 'none'
      })
      return
    }
    
    if (editForm.value.selectedTeachers.length !== 2) {
      uni.showToast({
        title: '请选择2个评审教师',
        icon: 'none'
      })
      return
    }
    
    if (!editForm.value.selectedRoom) {
      uni.showToast({
        title: '请选择会议室',
        icon: 'none'
      })
      return
    }
    
    // 保存修改
    if (editForm.value.originalIndex >= 0) {
      // 生成具体的学生时间（基于45分钟时长）
      const generateStudentSpecificTime = () => {
        const selectedDateInfo = detailedDateOptions.value.find(d => d.date === editForm.value.selectedDate)
        if (!selectedDateInfo) return ''
        
        return `${selectedDateInfo.displayDate} ${editForm.value.selectedTimeSlot}`
      }
      
      const studentSpecificTime = generateStudentSpecificTime()
      
      // 更新学生安排数据
      studentSchedules.value[editForm.value.originalIndex] = {
        ...studentSchedules.value[editForm.value.originalIndex],
        assessors: [...editForm.value.selectedTeachers],
        time: studentSpecificTime,
        room: editForm.value.selectedRoom,
        hasTimeRoomConflict: false // 暂时设为false，稍后重新检测
      }
      
      // 重新检测所有冲突
      const timeRoomConflicts = detectTimeRoomConflicts()
      const teacherOverloads = detectTeacherOverloads()
      
      // 更新统计数据
      scheduleStats.value.timeRoomConflicts = timeRoomConflicts
      scheduleStats.value.teacherOverloads = teacherOverloads
      
      // 更新相关的教师安排数据
      updateTeacherSchedules()
      
      // 更新房间安排数据
      updateRoomBookings()
    }
    
    hideEditModal()
    uni.showToast({
      title: '修改已保存',
      icon: 'success'
    })
  }
  
  // 重置编辑表单
  const hideEditModal = () => {
    showEditModal.value = false
    // 重置表单
    editForm.value = {
      name: '',
      studentId: '',
      selectedDate: '',
      selectedTimeSlot: '',
      selectedTeachers: [],
      selectedRoom: '',
      originalIndex: -1
    }
  }
  
  // ====== 新增：冲突检测辅助函数 ======
  
  // 检查教师是否超负荷（用于教师列表显示）
  const isTeacherOverloaded = (teacherName) => {
    // 检查该教师是否被分配给超过4个学生（这里设为4）
    const assignedCount = studentSchedules.value.filter(student => 
      student.assessors.some(assessor => assessor.includes(teacherName))
    ).length
    return assignedCount > 4
  }
  
  // 检查教师名称是否超负荷（用于学生视图中的教师名称显示）
  const isTeacherNameOverloaded = (assessorName) => {
    const teacherName = assessorName.split('（')[0] // 提取教师姓名
    return isTeacherOverloaded(teacherName)
  }
  
  // ====== 新增：房间时间信息显示函数 ======
  
  // 获取房间对应的时间信息
  const getRoomTimeInfo = (roomIndex) => {
    // 查找该房间当前的预约情况
    const roomName = roomSchedules.value[roomIndex]?.name || `房间${roomIndex + 1}`
    const room = roomSchedules.value.find(r => r.name === roomName)
    
    if (!room || room.bookings.length === 0) {
      // 如果没有预约，说明该房间不需要使用，返回提示信息
      return '未安排使用'
    }
    
    // 获取该房间的时间范围
    const times = room.bookings.map(booking => {
      // 提取时间部分，格式如 "7月1日 08:00-08:45"
      const timeMatch = booking.time.match(/(\d{2}:\d{2}-\d{2}:\d{2})/)
      return timeMatch ? timeMatch[1] : ''
    }).filter(Boolean)
    
    if (times.length === 0) {
      return '未安排使用'
    }
    
    // 找出最早和最晚的时间
    const startTimes = times.map(t => t.split('-')[0]).sort()
    const endTimes = times.map(t => t.split('-')[1]).sort()
    
    const earliestStart = startTimes[0]
    const latestEnd = endTimes[endTimes.length - 1]
    
    return `${earliestStart}-${latestEnd}`
  }
  
  // ====== 保持原有的其他方法 ======
  
  // 更新会议室预订数据，与学生安排数据保持一致
  const updateRoomBookings = () => {
    // 清空所有房间的预订记录
    roomSchedules.value.forEach(room => {
      room.bookings = []
    })
    
    // 根据学生安排填充房间预订数据
    studentSchedules.value.forEach(student => {
      const room = roomSchedules.value.find(r => r.name === student.room)
      if (room) {
        room.bookings.push({
          time: student.time, // 使用学生的具体时间段
          student: student.name
        })
      }
    })
    
    // 按时间排序预订记录
    roomSchedules.value.forEach(room => {
      room.bookings.sort((a, b) => {
        const timeA = a.time.match(/(\d{2}:\d{2})/)
        const timeB = b.time.match(/(\d{2}:\d{2})/)
        if (timeA && timeB) {
          return timeA[1].localeCompare(timeB[1])
        }
        return 0
      })
    })
  }
  
  const finalPublish = () => {
    // 同步房间输入到 roomInputs
    const roomInputs = [
      { name: room1.value || '会议室1' },
      { name: room2.value || '会议室2' },
      { name: room3.value || '会议室3' },
      { name: room4.value || '会议室4' }
    ]
    
    // 更新学生安排中的房间名称
    studentSchedules.value.forEach((student, index) => {
      const roomIndex = index % 4 // 循环分配到4个房间
      student.room = roomInputs[roomIndex].name
    })
    
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
  
  // 修改步骤状态持久化，避免重新生成时的问题
  watch(currentStep, (val) => {
    // 只有在非重新生成的情况下才保存到localStorage
    if (!isRegeneration.value) {
      localStorage.setItem('scheduleCurrentStep', val)
    }
  })

  onMounted(() => {
    // 修改：只有在非重新生成时才从localStorage读取步骤
    if (!isRegeneration.value) {
      const savedStep = localStorage.getItem('scheduleCurrentStep')
      if (savedStep) {
        currentStep.value = Number(savedStep)
      }
    }
    console.log('年度评审页面已加载')
    // 修改：只有在当前步骤为2且非重新生成时才自动执行生成
    if (currentStep.value === 2 && !isRegeneration.value) {
      simulateGeneration()
    }
    
    // 初始化房间预订数据
    updateRoomBookings()
    
    // 初始时检测冲突
    detectTimeRoomConflicts()
    detectTeacherOverloads()
  })
  
  // 方法定义
  const handleGenerateDraft = () => {
    if (!canGenerateDraft.value) return
    
    // 重置生成相关状态
    generationProgress.value = 0
    generationStatus.value = '正在分析师生匹配度...'
    generationLogs.value = [
      { time: new Date().toLocaleTimeString(), message: '开始生成评审草案' },
      { time: new Date().toLocaleTimeString(), message: '分析师生研究方向匹配度...' },
      { time: new Date().toLocaleTimeString(), message: '计算老师工作量分配...' }
    ]
    
    currentStep.value = 2
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
          // 生成完成后重置重新生成标记
          isRegeneration.value = false
          // 更新房间预订数据
          updateRoomBookings()
          // 初始检测冲突
          detectTimeRoomConflicts()
          detectTeacherOverloads()
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
  
  // 增强updateTeacherSchedules方法
  const updateTeacherSchedules = () => {
    // 重新构建教师安排数据
    const teacherMap = new Map()
    
    // 初始化教师数据
    teacherList.value.forEach(teacher => {
      const teacherKey = `${teacher.name}（${teacher.title}）`
      teacherMap.set(teacherKey, {
        name: teacherKey,
        assigned: 0,
        maxLoad: 3, // 设置最大负荷为3
        overloaded: false,
        timeSlots: []
      })
    })
    
    // 根据学生安排填充教师数据
    studentSchedules.value.forEach(student => {
      if (student.assessors && student.time) {
        student.assessors.forEach(assessor => {
          const teacher = teacherMap.get(assessor)
          if (teacher) {
            teacher.assigned++
            teacher.timeSlots.push({
              time: student.time, // 使用学生的具体时间
              student: student.name
            })
            teacher.overloaded = teacher.assigned > teacher.maxLoad
          }
        })
      }
    })
    
    // 更新teacherSchedules
    teacherSchedules.value = Array.from(teacherMap.values())
  }
  
  // 修改重新生成方法
  const regenerateDraft = () => {
    uni.showModal({
      title: '确认操作',
      content: '是否重新生成评审草案？',
      success: function (res) {
        if (res.confirm) {
          // 设置重新生成标记
          isRegeneration.value = true
          // 清除localStorage中的步骤记录，防止回到之前的步骤
          localStorage.removeItem('scheduleCurrentStep')
          // 跳转到第1步
          currentStep.value = 1
          uni.showToast({ title: '已返回准备工作', icon: 'success' })
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
      // 可跳转回仪表盘或显示发布成功页面
    }, 2000)
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
  </script>
  
  
  
  <style scoped>
  /* 保持原有的基础样式 */
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
  
  /* ====== 优化后的编辑弹窗样式 ====== */
  
  /* 模态层覆盖 */
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
  
  /* 优化后的编辑弹窗主容器 */
  .optimized-edit-modal {
    background: white;
    border-radius: 24rpx;
    width: 95vw;
    max-width: 800rpx;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
    margin: 20rpx;
  }
  
  /* 弹窗头部区域 */
  .edit-modal-header-new {
    padding: 32rpx 32rpx 24rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
    position: relative;
  }
  
  .header-content {
    flex: 1;
  }
  
  .modal-title-new {
    font-size: 32rpx;
    font-weight: 700;
    color: #1d1d1f;
    margin-bottom: 8rpx;
    display: block;
  }
  
  .student-info-header {
    font-size: 24rpx;
    color: #666;
    background: #f0f8ff;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    display: inline-block;
    border: 1rpx solid #e0f0ff;
  }
  
  .close-btn {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-left: 16rpx;
  }
  
  .close-btn:hover {
    background: #e0e0e0;
  }
  
  .close-icon {
    font-size: 28rpx;
    color: #666;
    font-weight: 600;
  }
  
  /* 弹窗主体内容区域 */
  .edit-modal-body-new {
    flex: 1;
    padding: 24rpx 0rpx;
    overflow-y: auto;
    background: #fafbfc;
  }
  
  /* 编辑区域样式 */
  .edit-section {
    background: white;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    border: 1rpx solid #f0f0f0;
  }
  
  .edit-section:last-child {
    margin-bottom: 0;
  }
  
  /* 区域头部 */
  .section-header {
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f8ff 100%);
    padding: 20rpx 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  
  .section-icon {
    font-size: 28rpx;
    width: 40rpx;
    text-align: center;
  }
  
  .section-title-new {
    font-size: 28rpx;
    font-weight: 600;
    color: #1d1d1f;
    flex: 1;
  }
  
  .selection-counter {
    background: #007aff;
    color: white;
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    font-size: 20rpx;
    font-weight: 600;
  }
  
  .counter-text {
    font-size: 20rpx;
  }
  
  /* 时间选择区域 */
  .time-selection-wrapper {
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }
  
  /* 日期选择卡片 */
  .date-selection-card {
    border: 1rpx solid #e9ecef;
    border-radius: 12rpx;
    overflow: hidden;
    background: #fafbfc;
  }
  
  .card-header {
    padding: 16rpx 20rpx;
    background: #f8f9fa;
    border-bottom: 1rpx solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-title {
    font-size: 24rpx;
    font-weight: 600;
    color: #495057;
  }
  
  .selected-date-display {
    font-size: 20rpx;
    color: #007aff;
    font-weight: 500;
  }
  
  .date-grid {
    padding: 16rpx;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200rpx, 1fr));
    gap: 12rpx;
  }
  
  .date-card-item {
    background: white;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 16rpx;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .date-card-item.selected {
    background: linear-gradient(135deg, #e7f3ff 0%, #cce7ff 100%);
    border-color: #007aff;
    transform: scale(1.02);
    box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.2);
  }
  
  .date-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
  }
  
  .date-text-new {
    font-size: 26rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .weekday-text {
    font-size: 18rpx;
    color: #6c757d;
    background: #e9ecef;
    padding: 4rpx 8rpx;
    border-radius: 6rpx;
  }
  
  .date-card-item.selected .weekday-text {
    background: #007aff;
    color: white;
  }
  
  .date-stats {
    text-align: left;
  }
  
  .slots-count {
    font-size: 20rpx;
    color: #6c757d;
  }
  
  .date-card-item.selected .slots-count {
    color: #007aff;
    font-weight: 600;
  }
  
  /* 时间段选择卡片 */
  .timeslot-selection-card {
    border: 1rpx solid #e9ecef;
    border-radius: 12rpx;
    overflow: hidden;
    background: #fafbfc;
  }
  
  .timeslot-content {
    padding: 16rpx;
  }
  
  .time-period {
    margin-bottom: 24rpx;
  }
  
  .time-period:last-child {
    margin-bottom: 0;
  }
  
  .period-header {
    padding: 12rpx 0 16rpx 0;
    border-bottom: 1rpx dashed #dee2e6;
    margin-bottom: 16rpx;
  }
  
  .period-title {
    font-size: 24rpx;
    font-weight: 600;
    color: #495057;
  }
  
  .timeslot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160rpx, 1fr));
    gap: 12rpx;
  }
  
  .timeslot-item {
    background: white;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 16rpx 12rpx;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    min-height: 80rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 6rpx;
  }
  
  .timeslot-item.selected {
    background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    border-color: #007aff;
    transform: scale(1.05);
    box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.3);
  }
  
  .time-text-new {
    font-size: 22rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .timeslot-item.selected .time-text-new {
    color: white;
  }
  
  /* 空状态样式 */
  .empty-state {
    padding: 60rpx 20rpx;
    text-align: center;
    color: #6c757d;
  }
  
  .empty-icon {
    font-size: 48rpx;
    margin-bottom: 16rpx;
    opacity: 0.6;
  }
  
  .empty-text {
    font-size: 24rpx;
    color: #6c757d;
  }
  
  /* 教师选择区域 */
  .teacher-selection-new {
    padding: 16rpx;
    max-height: 400rpx;
    overflow-y: auto;
  }
  
  .teacher-card {
    background: white;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 16rpx;
    margin-bottom: 12rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .teacher-card:last-child {
    margin-bottom: 0;
  }
  
  .teacher-card.selected {
    background: linear-gradient(135deg, #e7f3ff 0%, #cce7ff 100%);
    border-color: #007aff;
    transform: translateY(-2rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.15);
  }
  
  .teacher-card.disabled {
    opacity: 0.5;
    background: #f8f9fa;
    cursor: not-allowed;
  }
  
  .teacher-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .avatar-text {
    font-size: 24rpx;
    font-weight: 600;
    color: white;
  }
  
  .teacher-info-new {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }
  
  .teacher-name-new {
    font-size: 26rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  .teacher-title {
    font-size: 20rpx;
    color: #6c757d;
  }
  
  .selection-indicator {
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    border: 2rpx solid #dee2e6;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  
  .teacher-card.selected .selection-indicator {
    background: #007aff;
    border-color: #007aff;
  }
  
  .check-mark {
    font-size: 18rpx;
    color: white;
    font-weight: 700;
  }
  
  /* 会议室选择区域 */
  .room-selection-new {
    padding: 16rpx;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200rpx, 1fr));
    gap: 12rpx;
  }
  
  .room-card {
    background: white;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 16rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .room-card.selected {
    background: linear-gradient(135deg, #e7f3ff 0%, #cce7ff 100%);
    border-color: #007aff;
    transform: translateY(-2rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.15);
  }
  
  .room-icon {
    font-size: 32rpx;
    opacity: 0.7;
  }
  
  .room-info-new {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }
  
  .room-name-new {
    font-size: 24rpx;
    font-weight: 600;
    color: #1d1d1f;
  }
  
  /* 预览区域 */
  .preview-card {
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    border: 1rpx solid #e9ecef;
  }
  
  .preview-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16rpx;
    gap: 12rpx;
  }
  
  .preview-item:last-child {
    margin-bottom: 0;
  }
  
  .preview-label {
    font-size: 22rpx;
    color: #6c757d;
    min-width: 80rpx;
    flex-shrink: 0;
    font-weight: 500;
  }
  
  .preview-value {
    font-size: 22rpx;
    color: #1d1d1f;
    font-weight: 500;
    flex: 1;
    word-break: break-all;
  }
  
  /* 弹窗底部操作区 */
  .edit-modal-footer-new {
    padding: 24rpx 32rpx;
    border-top: 1rpx solid #f0f0f0;
    background: white;
  }
  
  .footer-buttons {
    display: flex;
    gap: 16rpx;
  }
  
  .cancel-btn-new,
  .save-btn-new {
    flex: 1;
    height: 80rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
  }
  
  .cancel-btn-new {
    background: #f8f9fa;
    border: 2rpx solid #dee2e6;
    color: #6c757d;
  }
  
  .cancel-btn-new:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
  
  .save-btn-new {
    background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    border: 2rpx solid #007aff;
    color: white;
  }
  
  .save-btn-new:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.3);
  }
  
  .btn-text {
    font-size: 26rpx;
  }
  
  /* 响应式优化 */
  @media (max-width: 750rpx) {
    .optimized-edit-modal {
      width: 98vw;
      max-height: 95vh;
      margin: 10rpx;
    }
    
    .date-grid {
      grid-template-columns: 1fr;
    }
    
    .timeslot-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .room-selection-new {
      grid-template-columns: 1fr;
    }
    
    .teacher-selection-new {
      max-height: 300rpx;
    }
    
    .footer-buttons {
      flex-direction: column;
    }
    
    .edit-modal-header-new {
      padding: 24rpx 20rpx 20rpx 20rpx;
    }
    
    .edit-modal-body-new {
      padding: 16rpx 20rpx;
    }
    
    .edit-modal-footer-new {
      padding: 20rpx;
    }
  }
  
  /* 动画效果 */
  .timeslot-item:hover:not(.unavailable):not(.occupied) {
    transform: translateY(-2rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }
  
  .date-card-item:hover:not(.selected) {
    transform: translateY(-2rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }
  
  .teacher-card:hover:not(.disabled):not(.selected) {
    transform: translateY(-2rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }
  
  .room-card:hover:not(.selected) {
    transform: translateY(-2rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }
  
  /* 滚动条美化 */
  .teacher-selection-new::-webkit-scrollbar,
  .edit-modal-body-new::-webkit-scrollbar {
    width: 8rpx;
  }
  
  .teacher-selection-new::-webkit-scrollbar-track,
  .edit-modal-body-new::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4rpx;
  }
  
  .teacher-selection-new::-webkit-scrollbar-thumb,
  .edit-modal-body-new::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4rpx;
  }
  
  .teacher-selection-new::-webkit-scrollbar-thumb:hover,
  .edit-modal-body-new::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* 保持原有的其他样式... */
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
  
  /* 教师信息展示样式 */
  .teacher-info-row {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .teacher-name {
    font-size: 24rpx;
    color: #333;
    font-weight: 500;
  }

  /* 新增：超负荷教师样式 */
  .overloaded-teacher {
    color: #8A2BE2 !important;
    font-weight: 600;
  }

  .overloaded-teacher-name {
    color: #8A2BE2 !important;
    font-weight: 600;
  }

  .teacher-availability {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .availability-label {
    font-size: 20rpx;
    color: #666;
  }

  .time-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 6rpx;
  }

  .time-slot-tag {
    background: #f0f8ff;
    border: 1rpx solid #b3d9ff;
    border-radius: 8rpx;
    padding: 4rpx 8rpx;
  }

  .slot-text {
    font-size: 18rpx;
    color: #2563eb;
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
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .student-item:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
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
  
  /* 修改冲突标识样式 */
  .conflict-badge {
    background: #f7dada;
    border-radius: 8rpx;
    position: relative;
    width: 64rpx;
    height: 28rpx;
    margin-right: 8rpx;
    display: inline-block;
  }
  
  .time-room-conflict {
    background: #ffe6e6;
    border: 1rpx solid #ffb3b3;
  }
  
  .badge-text {
    position: absolute;
    left: 13rpx;
    top: 5rpx;
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
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .time-slot:hover {
    background: #e5e5ea;
    transform: translateY(-2rpx);
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
    background: #8A2BE2;
    border-radius: 12rpx;
    padding: 0rpx 10rpx 2rpx 10rpx;
    display: inline-block;
  }
  
  .overload-badge .badge-text {
    color: white;
    position: static;
    font-size: 20rpx;
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
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .booking-slot:hover {
    background: #e5e5ea;
    transform: translateY(-2rpx);
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
  
  .action-button:active {
    transform: scale(0.95);
  }
  
  .bottom-space {
    height: 40rpx;
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

  .bottom-navigation {
    background: white;
    display: flex;
    justify-content: space-around;
    padding: 20rpx 0 15rpx 0;
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
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  .summary-label {
    font-size: 26rpx;
    color: #8E8E93;
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

  /* 房间管理相关样式 */
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
  
  /* 新增：房间输入容器 */
  .room-input-container {
    margin-bottom: 28rpx;
    padding: 16rpx;
    border-radius: 12rpx;
    background: #f8f9fa;
    border: 1rpx solid #e9ecef;
  }
  
  .room-input-container:last-child {
    margin-bottom: 0;
  }
  
  .room-input-row {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
    gap: 12rpx;
  }
  
  .room-input-label {
    font-size: 26rpx;
    color: #495057;
    font-weight: 600;
    width: 120rpx;
    flex-shrink: 0;
  }
  
  .room-input-inner {
    flex: 1;
    font-size: 24rpx;
    padding: 12rpx 16rpx;
    border: 1rpx solid #dee2e6;
    border-radius: 8rpx;
    background: #ffffff;
    color: #495057;
    box-shadow: none;
  }
  
  .room-input-inner:focus {
    border-color: #007aff;
    outline: none;
    box-shadow: 0 0 0 2rpx rgba(0, 122, 255, 0.1);
  }
  
  /* 修改：时间信息样式，现在显示在下方 */
  .room-time-info {
    background: #e3f2fd;
    border: 1rpx solid #90caf9;
    border-radius: 8rpx;
    padding: 10rpx 16rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-left: 132rpx; /* 与输入框对齐 */
  }
  
  .room-time-label {
    font-size: 20rpx;
    color: #1976d2;
    font-weight: 500;
    white-space: nowrap;
  }
  
  .room-time-text {
    font-size: 22rpx;
    color: #1565c0;
    font-weight: 600;
  }
  
  .room-action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 32rpx 0;
    gap: 16rpx;
  }
  
  /* 响应式优化 */
  @media (max-width: 750rpx) {
    .room-time-info {
      margin-left: 0;
      margin-top: 8rpx;
    }
    
    .room-input-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 8rpx;
    }
    
    .room-input-label {
      width: 100%;
    }
    
    .room-input-inner {
      width: 100%;
    }
  }
</style>