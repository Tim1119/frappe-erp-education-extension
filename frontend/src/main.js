import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import {
    setConfig,
    frappeRequest,
    resourcesPlugin,
    Button,
    FeatherIcon
} from 'frappe-ui'

const app = createApp(App)

setConfig('resourceFetcher', frappeRequest)
setConfig('cache', false)

app.use(createPinia())
app.use(router)
app.use(resourcesPlugin)

app.component('Button', Button)
app.component('FeatherIcon', FeatherIcon)

app.mount('#app')