<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="goBack">
				<image class="back-icon" src="/static/return.png"></image>
			</view>
			<text class="nav-title">修改密码</text>
			<view class="nav-right" @click="savePassword">
				<text class="save-button" :class="{ active: isFormValid }">保存</text>
			</view>
		</view>

		<!-- 主要内容 -->
		<view class="content">
			<!-- 输入表单 -->
			<view class="form-container">
				<!-- 当前密码 -->
				<view class="input-group">
					<text class="input-label">当前密码</text>
					<view class="input-wrapper">
						<input 
							class="password-input"
							:type="showCurrentPassword ? 'text' : 'password'"
							v-model="formData.currentPassword"
							placeholder="请输入您的当前密码"
							@blur="validateCurrentPassword"
						/>
						<view class="eye-icon" @click="toggleCurrentPasswordVisibility">
							<image class="icon" :src="showCurrentPassword ? '/static/password/view.png' : '/static/password/hide.png'"></image>
						</view>
					</view>
					<text class="error-text" v-if="errors.currentPassword">{{ errors.currentPassword }}</text>
				</view>

				<!-- 新密码 -->
				<view class="input-group">
					<text class="input-label">新密码</text>
					<view class="input-wrapper">
						<input 
							class="password-input"
							:type="showNewPassword ? 'text' : 'password'"
							v-model="formData.newPassword"
							placeholder="请输入您的新密码"
							@input="validateNewPassword"
							@blur="validateNewPassword"
						/>
						<view class="eye-icon" @click="toggleNewPasswordVisibility">
							<image class="icon" :src="showNewPassword ? '/static/password/view.png' : '/static/password/hide.png'"></image>
						</view>
					</view>
					<text class="helper-text" :class="{ error: errors.newPassword }">
						{{ errors.newPassword || '密码长度至少为8位，建议包含字母和数字。' }}
					</text>
				</view>

				<!-- 确认新密码 -->
				<view class="input-group">
					<text class="input-label">确认新密码</text>
					<view class="input-wrapper">
						<input 
							class="password-input"
							:class="{ error: errors.confirmPassword }"
							:type="showConfirmPassword ? 'text' : 'password'"
							v-model="formData.confirmPassword"
							placeholder="请再次输入您的新密码"
							@blur="validateConfirmPassword"
							@input="validateConfirmPassword"
						/>
						<view class="eye-icon" @click="toggleConfirmPasswordVisibility">
							<image class="icon" :src="showConfirmPassword ? '/static/password/view.png' : '/static/password/hide.png'"></image>
						</view>
					</view>
					<text class="error-text" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</text>
				</view>
			</view>
		</view>

		<!-- 成功提示HUD -->
		<view class="success-hud" v-if="showSuccessHud">
			<view class="hud-content">
				<text class="success-icon">✓</text>
				<text class="success-text">密码更新成功</text>
			</view>
		</view>

		<!-- 遮罩层 -->
		<view class="overlay" v-if="showSuccessHud"></view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 表单数据
			formData: {
				currentPassword: '',
				newPassword: '',
				confirmPassword: ''
			},
			// 密码可见性
			showCurrentPassword: false,
			showNewPassword: false,
			showConfirmPassword: false,
			// 错误信息
			errors: {
				currentPassword: '',
				newPassword: '',
				confirmPassword: ''
			},
			// 成功提示
			showSuccessHud: false,
			// 加载状态
			isLoading: false
		}
	},
	
	computed: {
		// 表单是否有效
		isFormValid() {
			return this.formData.currentPassword.length > 0 &&
				   this.formData.newPassword.length >= 8 &&
				   this.formData.confirmPassword.length > 0 &&
				   this.formData.newPassword === this.formData.confirmPassword &&
				   !this.errors.currentPassword &&
				   !this.errors.newPassword &&
				   !this.errors.confirmPassword;
		}
	},
	
	methods: {
		// 返回上一页
		goBack() {
			if (this.hasChanges()) {
				uni.showModal({
					title: '确认离开',
					content: '你有未保存的修改，确定要离开吗？',
					success: (res) => {
						if (res.confirm) {
							this.smartBack();
						}
					}
				});
			} else {
				this.smartBack();
			}
		},
		
		// 检查是否有变更
		hasChanges() {
			return this.formData.currentPassword || 
				   this.formData.newPassword || 
				   this.formData.confirmPassword;
		},
		
		// 切换当前密码可见性
		toggleCurrentPasswordVisibility() {
			this.showCurrentPassword = !this.showCurrentPassword;
		},
		
		// 切换新密码可见性
		toggleNewPasswordVisibility() {
			this.showNewPassword = !this.showNewPassword;
		},
		
		// 切换确认密码可见性
		toggleConfirmPasswordVisibility() {
			this.showConfirmPassword = !this.showConfirmPassword;
		},
		
		// 验证当前密码
		validateCurrentPassword() {
			if (!this.formData.currentPassword) {
				this.errors.currentPassword = '请输入当前密码';
			} else {
				this.errors.currentPassword = '';
			}
		},
		
		// 验证新密码
		validateNewPassword() {
			if (!this.formData.newPassword) {
				this.errors.newPassword = '请输入新密码';
			} else if (this.formData.newPassword.length < 8) {
				this.errors.newPassword = '密码长度至少为8位';
			} else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(this.formData.newPassword)) {
				this.errors.newPassword = '密码建议包含字母和数字';
			} else {
				this.errors.newPassword = '';
			}
			
			// 如果确认密码已经输入，重新验证确认密码
			if (this.formData.confirmPassword) {
				this.validateConfirmPassword();
			}
		},
		
		// 验证确认密码
		validateConfirmPassword() {
			if (!this.formData.confirmPassword) {
				this.errors.confirmPassword = '请确认新密码';
			} else if (this.formData.confirmPassword !== this.formData.newPassword) {
				this.errors.confirmPassword = '两次输入的新密码不一致';
			} else {
				this.errors.confirmPassword = '';
			}
		},
		
		// 保存密码
		async savePassword() {
			if (!this.isFormValid || this.isLoading) return;
			
			// 最终验证
			this.validateCurrentPassword();
			this.validateNewPassword();
			this.validateConfirmPassword();
			
			if (!this.isFormValid) return;
			
			this.isLoading = true;
			const userRole = uni.getStorageSync('userRole');
			
			try {
				// 显示加载提示
				uni.showLoading({
					title: '保存中...'
				});
				
				// 模拟API调用
				await this.mockApiCall();
				
				uni.hideLoading();
				
				// 显示成功提示
				this.showSuccessHud = true;
				
				// 1.5秒后隐藏提示并返回
				setTimeout(() => {
					this.showSuccessHud = false;
					setTimeout(() => {
						if (userRole === 'teacher') {
							uni.reLaunch({
								url: '/pages/teacher/profile'
							});
						} else {
						uni.navigateBack();
						}
					}, 200);
				}, 1500);
				
			} catch (error) {
				uni.hideLoading();
				uni.showToast({
					title: error.message || '保存失败',
					icon: 'error'
				});
			} finally {
				this.isLoading = false;
			}
		},
		
		// 模拟API调用
		mockApiCall() {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					// 模拟当前密码错误
					if (this.formData.currentPassword !== '123456') {
						reject(new Error('当前密码不正确'));
					} else {
						resolve();
					}
				}, 1000);
			});
		},
		
		smartBack() {
			// 判断页面栈是否大于1，如果是则返回，否则跳转
			const pages = getCurrentPages();
			if (pages.length > 1) {
				uni.navigateBack();
			} else {
				// 兜底，防止直接打开的页面无法返回
				const userRole = uni.getStorageSync('userRole');
				if (userRole === 'teacher') {
					uni.reLaunch({ url: '/pages/teacher/profile' });
				} else {
					uni.reLaunch({ url: '/pages/PhD/profile' });
				}
			}
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #f2f2f7;
	display: flex;
	flex-direction: column;
	position: relative;
}

/* 顶部导航栏 */
.nav-bar {
	background: #ffffff;
	padding: 20rpx 32rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1rpx solid rgba(60, 60, 67, 0.1);
}

.nav-left {
	width: 120rpx;
}

.back-icon {
	width: 32rpx;
	height: 32rpx;
}

.nav-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #000000;
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

/* 表单容器 */
.form-container {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 0;
	overflow: hidden;
}

.input-group {
	padding: 32rpx;
	border-bottom: 1rpx solid rgba(60, 60, 67, 0.1);
}

.input-group:last-child {
	border-bottom: none;
}

.input-label {
	font-size: 28rpx;
	color: #000000;
	margin-bottom: 16rpx;
	display: block;
	font-weight: 500;
}

.input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.password-input {
	flex: 1;
	font-size: 32rpx;
	color: #000000;
	background: transparent;
	border: none;
	outline: none;
	padding: 16rpx 0;
	padding-right: 80rpx;
}

.password-input.error {
	color: #ff3b30;
}

.password-input::placeholder {
	color: #c7c7cc;
}

.eye-icon {
	position: absolute;
	right: 0;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon {
	width: 32rpx;
	height: 32rpx;
}

.helper-text {
	font-size: 24rpx;
	color: #8e8e93;
	margin-top: 12rpx;
	line-height: 1.4;
	display: block;
}

.helper-text.error {
	color: #ff3b30;
}

.error-text {
	font-size: 24rpx;
	color: #ff3b30;
	margin-top: 12rpx;
	line-height: 1.4;
	display: block;
}

/* 成功提示HUD */
.overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.3);
	z-index: 9998;
}

.success-hud {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 9999;
	animation: hudFadeIn 0.3s ease-out;
}

.hud-content {
	background: rgba(0, 0, 0, 0.8);
	border-radius: 20rpx;
	padding: 40rpx 60rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-width: 200rpx;
}

.success-icon {
	font-size: 80rpx;
	color: #ffffff;
	margin-bottom: 20rpx;
	font-weight: bold;
}

.success-text {
	font-size: 28rpx;
	color: #ffffff;
	text-align: center;
	font-weight: 500;
}

@keyframes hudFadeIn {
	0% {
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.8);
	}
	100% {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1);
	}
}

/* 按钮点击效果 */
.eye-icon:active {
	opacity: 0.6;
}

.save-button.active:active {
	opacity: 0.6;
}
</style>