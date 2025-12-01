import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuth } from './composables/useAuth'

async function bootstrap() {
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)

  const { init } = useAuth()
  await init()

  app.mount('#app')
}

bootstrap()
