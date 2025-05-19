<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    <header class="bg-white dark:bg-gray-800 shadow">
      <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <BoltIcon class="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <span class="text-xl font-bold">InvoiceGPT</span>
        </div>

        <div class="flex items-center space-x-4">
          <DarkModeToggle />

          <router-link to="/" class="text-blue-600 dark:text-blue-400 hover:underline">
            Home
          </router-link>

          <template v-if="!auth.user">
            <router-link to="/login" class="text-blue-600 dark:text-blue-400 hover:underline">
              Login
            </router-link>
            <router-link to="/register" class="text-blue-600 dark:text-blue-400 hover:underline">
              Register
            </router-link>
          </template>

          <template v-else>
            <router-link
              to="/invoices"
              class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              All Invoices
            </router-link>
            <router-link
              to="/invoices/new"
              class="text-green-600 dark:text-green-400 hover:underline"
            >
              New Invoice
            </router-link>
            <router-link
              to="/dashboard"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Dashboard
            </router-link>
            <button @click="logout" class="text-red-600 dark:text-red-400 hover:underline">
              Logout
            </button>
          </template>
        </div>
      </nav>
    </header>

    <main class="container mx-auto px-4 py-10">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import { BoltIcon } from '@heroicons/vue/24/solid'

const auth = useAuthStore()
onMounted(() => auth.fetchUser())

const logout = async () => {
  await auth.signOut()
}
</script>
