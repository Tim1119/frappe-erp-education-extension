import { defineStore } from 'pinia'
import { createResource } from 'frappe-ui'
import { usersStore } from '@/stores/user'
import router from '@/router'
import { ref, computed } from 'vue'
import { studentStore } from '@/stores/student'

export const sessionStore = defineStore('education-session', () => {
	const { user: currentUser } = usersStore()
	const { student } = studentStore()

	function sessionUser() {
		let cookies = new URLSearchParams(document.cookie.split('; ').join('&'))
		let _sessionUser = cookies.get('user_id')
		if (_sessionUser === 'Guest') {
			_sessionUser = null
		}
		return _sessionUser
	}

	let user = ref(sessionUser())
	const isLoggedIn = computed(() => !!user.value)
	// session.js
	// session.js - find the login resource and replace onSuccess
	const login = createResource({
		url: 'login',
		onError() {
			// Do nothing here — Login.vue watches the error state directly
		},
		onSuccess() {
			user.value = sessionUser()
			currentUser.reload()
			login.reset()
			router.replace({ path: '/' })
		},
	})

	const logout = createResource({
		url: 'logout',
		onSuccess() {
			user.value = null
			window.location.href = '/login'
		},
	})

	return {
		user,
		isLoggedIn,
		login,
		logout,
	}
})
