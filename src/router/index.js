import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import InvoiceForm from '@/views/InvoiceForm.vue'
import InvoiceList from '@/views/InvoiceList.vue'   // ← import InvoiceList

const routes = [
  { path: '/',        name: 'Home',       component: Home },
  { path: '/login',   name: 'Login',      component: Login },
  { path: '/register',name: 'Register',   component: Register },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices',
    name: 'InvoiceList',                     // ← new listing route
    component: InvoiceList,
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices/new',
    name: 'NewInvoice',
    component: InvoiceForm,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }
  next()
})

export default router