import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setConfig, frappeRequest, resourcesPlugin, Button, FeatherIcon } from 'frappe-ui'

function getCookie(name) {
	let r = document.cookie.match('\\b' + name + '=([^;]*)\\b')
	return r ? r[1] : undefined
}

// Bridge the token from frappe boot object to where frappeRequest expects it
window.csrf_token = window.frappe?.csrf_token

setConfig('resourceFetcher', (url, options) => {
	if (!options) options = {}
	if (!options.headers) options.headers = {}
	options.credentials = 'include'

	const token = getCookie('csrf_token') || window.frappe?.csrf_token

	if (token && token !== 'Guest') {
		options.headers['X-Frappe-CSRF-Token'] = token
	}

	return frappeRequest(url, options)
})

setConfig('cache', false)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(resourcesPlugin)
app.component('Button', Button)
app.component('FeatherIcon', FeatherIcon)

app.mount('#app')
