<template>
	<div class="login-wrapper">
		<div class="login-card">
			<!-- Logo -->
			<div class="brand">
				<div class="brand-icon">
					<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect width="40" height="40" rx="10" fill="#1a1a1a" />
						<path
							d="M20 8L32 15V25L20 32L8 25V15L20 8Z"
							stroke="white"
							stroke-width="1.5"
							fill="none"
						/>
						<circle cx="20" cy="20" r="3.5" fill="white" />
					</svg>
				</div>
				<h1 class="brand-name">Guardian Portal</h1>
			</div>

			<!-- Error Alert -->
			<transition name="fade-down">
				<div v-if="errorMessage" class="error-alert">
					<svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
					<span>{{ errorMessage }}</span>
				</div>
			</transition>

			<!-- Form -->
			<div class="login-form">
				<!-- Email -->
				<div class="field-wrap">
					<svg class="field-icon" viewBox="0 0 20 20" fill="currentColor">
						<path
							d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
						/>
						<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
					</svg>
					<input
						v-model="email"
						type="email"
						placeholder="you@example.com"
						autocomplete="username"
						@keyup.enter="handleLogin"
						:disabled="isLoading"
						class="field-input"
					/>
				</div>

				<!-- Password -->
				<div class="field-wrap">
					<svg class="field-icon" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
							clip-rule="evenodd"
						/>
					</svg>
					<input
						v-model="password"
						:type="showPassword ? 'text' : 'password'"
						placeholder="••••••••••••"
						autocomplete="current-password"
						@keyup.enter="handleLogin"
						:disabled="isLoading"
						class="field-input"
					/>
					<button
						type="button"
						class="show-btn"
						@click="showPassword = !showPassword"
						tabindex="-1"
					>
						{{ showPassword ? 'Hide' : 'Show' }}
					</button>
				</div>

				<!-- Forgot -->
				<div class="forgot-row">
					<a href="/update-password" class="forgot-link">Forgot Password?</a>
				</div>

				<!-- Submit -->
				<button
					class="login-btn"
					@click="handleLogin"
					:disabled="isLoading || !email || !password"
				>
					<span v-if="!isLoading">Login</span>
					<span v-else class="btn-loader">
						<span class="dot"></span>
						<span class="dot"></span>
						<span class="dot"></span>
					</span>
				</button>

				<!-- Divider -->
				<div class="divider"><span>or</span></div>

				<!-- Email Link -->
				<button class="email-link-btn" :disabled="isLoading" @click="handleEmailLink">
					Login with Email Link
				</button>
			</div>

			<p class="powered-by">Powered by <strong>Rhocom Technology</strong></p>
		</div>
	</div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { sessionStore } from '@/stores/session'

const session = sessionStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
	if (!email.value || !password.value) return

	errorMessage.value = ''
	isLoading.value = true

	await session.login.submit({
		usr: email.value,
		pwd: password.value,
	})

	isLoading.value = false
}

// Watch the login resource error state directly
watch(
	() => session.login.error,
	(err) => {
		if (err) {
			isLoading.value = false
			errorMessage.value = 'Invalid email or password. Please try again.'
		}
	},
)
</script>

<style scoped>
* {
	box-sizing: border-box;
}

.login-wrapper {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f0f0f0;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	padding: 1rem;
}

.login-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 2.5rem 2rem 2rem;
	width: 100%;
	max-width: 400px;
	box-shadow:
		0 1px 3px rgba(0, 0, 0, 0.06),
		0 4px 16px rgba(0, 0, 0, 0.08);
	animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes fadeUp {
	from {
		opacity: 0;
		transform: translateY(16px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* Brand */
.brand {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 1.75rem;
	gap: 0.75rem;
}
.brand-icon {
	width: 48px;
	height: 48px;
}
.brand-icon svg {
	width: 100%;
	height: 100%;
}
.brand-name {
	font-size: 1.125rem;
	font-weight: 700;
	color: #1a1a1a;
	margin: 0;
	letter-spacing: -0.01em;
}

/* Error */
.error-alert {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background: #fef2f2;
	border: 1px solid #fecaca;
	border-radius: 8px;
	padding: 0.625rem 0.875rem;
	margin-bottom: 1rem;
	color: #dc2626;
	font-size: 0.8125rem;
}
.alert-icon {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
}

/* Form */
.login-form {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.field-wrap {
	position: relative;
	display: flex;
	align-items: center;
	background: #f0f4ff;
	border-radius: 8px;
	border: 1px solid transparent;
	transition:
		border-color 0.15s,
		background 0.15s;
}
.field-wrap:focus-within {
	background: #f8faff;
	border-color: #c7d7fe;
}

.field-icon {
	position: absolute;
	left: 0.75rem;
	width: 16px;
	height: 16px;
	color: #9ca3af;
	pointer-events: none;
	flex-shrink: 0;
}

.field-input {
	width: 100%;
	background: transparent;
	border: none;
	outline: none;
	padding: 0.75rem 3rem 0.75rem 2.5rem;
	font-size: 0.9375rem;
	color: #1a1a1a;
	font-family: inherit;
}
.field-input::placeholder {
	color: #9ca3af;
}
.field-input:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.show-btn {
	position: absolute;
	right: 0.75rem;
	background: none;
	border: none;
	cursor: pointer;
	font-size: 0.8125rem;
	font-weight: 500;
	color: #6b7280;
	padding: 0;
	font-family: inherit;
	transition: color 0.15s;
}
.show-btn:hover {
	color: #1a1a1a;
}

/* Forgot */
.forgot-row {
	display: flex;
	justify-content: flex-end;
	margin-top: -0.25rem;
}
.forgot-link {
	font-size: 0.8125rem;
	color: #6b7280;
	text-decoration: none;
	transition: color 0.15s;
}
.forgot-link:hover {
	color: #1a1a1a;
}

/* Login button */
.login-btn {
	width: 100%;
	padding: 0.75rem;
	background: #1a1a1a;
	color: #ffffff;
	border: none;
	border-radius: 8px;
	font-size: 0.9375rem;
	font-weight: 600;
	font-family: inherit;
	cursor: pointer;
	transition:
		background 0.15s,
		transform 0.1s;
	min-height: 46px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 0.25rem;
}
.login-btn:hover:not(:disabled) {
	background: #333333;
}
.login-btn:active:not(:disabled) {
	transform: scale(0.99);
}
.login-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

/* Loader */
.btn-loader {
	display: flex;
	gap: 4px;
	align-items: center;
}
.dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.9);
	animation: bounce 0.9s ease-in-out infinite;
}
.dot:nth-child(2) {
	animation-delay: 0.15s;
}
.dot:nth-child(3) {
	animation-delay: 0.3s;
}
@keyframes bounce {
	0%,
	80%,
	100% {
		transform: scale(0.7);
		opacity: 0.5;
	}
	40% {
		transform: scale(1);
		opacity: 1;
	}
}

/* Divider */
.divider {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	color: #d1d5db;
	font-size: 0.8125rem;
	color: #9ca3af;
}
.divider::before,
.divider::after {
	content: '';
	flex: 1;
	height: 1px;
	background: #e5e7eb;
}

/* Email link button */
.email-link-btn {
	width: 100%;
	padding: 0.75rem;
	background: #f3f4f6;
	color: #374151;
	border: none;
	border-radius: 8px;
	font-size: 0.9375rem;
	font-weight: 500;
	font-family: inherit;
	cursor: pointer;
	transition: background 0.15s;
	min-height: 46px;
}
.email-link-btn:hover:not(:disabled) {
	background: #e5e7eb;
}
.email-link-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

/* Powered by */
.powered-by {
	text-align: center;
	margin-top: 1.5rem;
	font-size: 0.75rem;
	color: #9ca3af;
	margin-bottom: 0;
}
.powered-by strong {
	color: #6b7280;
	font-weight: 500;
}

/* Transitions */
.fade-down-enter-active {
	animation: fadeDown 0.3s ease;
}
@keyframes fadeDown {
	from {
		opacity: 0;
		transform: translateY(-6px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
