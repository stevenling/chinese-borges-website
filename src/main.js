// gray-matter 依赖 Node 的 Buffer，浏览器需 polyfill
import { Buffer } from 'buffer'
if (typeof window !== 'undefined') window.Buffer = Buffer

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
