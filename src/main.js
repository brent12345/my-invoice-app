import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore()
  store.user = session?.user || null

  if (session) {
    localStorage.setItem('supabase_session', JSON.stringify(session))
  } else {
    localStorage.removeItem('supabase_session')
  }
})

const session = JSON.parse(localStorage.getItem('supabase_session'))
if (session) {
  supabase.auth.setSession(session)
}

