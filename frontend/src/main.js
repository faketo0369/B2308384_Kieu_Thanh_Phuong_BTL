import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Style imports
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/css/main.css'
import './assets/css/form.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
