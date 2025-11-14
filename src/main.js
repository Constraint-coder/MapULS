import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Vuesax from 'vuesax-alpha'
import './assets/tailwinds.css'

import 'vuesax-alpha/dist/index.css'
const app = createApp(App)
app.use(Vuesax)
app.use(createPinia())
app.use(router)

app.mount('#app')
