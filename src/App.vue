<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    <header class="bg-white dark:bg-gray-800 shadow">
      <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <BoltIcon class="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <span class="text-xl font-bold">InvoiceGPT</span>
        </div>

        <!-- Hamburger (mobile only) -->
        <button
          class="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          @click="isMenuOpen = !isMenuOpen"
          aria-label="Toggle navigation"
        >
          <svg
            v-if="!isMenuOpen"
            class="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"/>
          </svg>

          <svg
            v-else
            class="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center space-x-4">
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

      <!-- Mobile dropdown -->
      <transition name="slide-fade">
        <div
          v-if="isMenuOpen"
          class="md:hidden px-4 pb-4 space-y-2 border-t border-gray-200 dark:border-gray-700"
        >
          <DarkModeToggle />

          <router-link to="/" class="block text-blue-600 dark:text-blue-400 hover:underline">
            Home
          </router-link>

          <template v-if="!auth.user">
            <router-link to="/login" class="block text-blue-600 dark:text-blue-400 hover:underline">
              Login
            </router-link>
            <router-link to="/register" class="block text-blue-600 dark:text-blue-400 hover:underline">
              Register
            </router-link>
          </template>

          <template v-else>
            <router-link
              to="/invoices"
              class="block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              All Invoices
            </router-link>
            <router-link
              to="/invoices/new"
              class="block text-green-600 dark:text-green-400 hover:underline"
            >
              New Invoice
            </router-link>
            <router-link
              to="/dashboard"
              class="block text-blue-600 dark:text-blue-400 hover:underline"
            >
              Dashboard
            </router-link>
            <button @click="logout" class="block text-red-600 dark:text-red-400 hover:underline">
              Logout
            </button>
          </template>
        </div>
      </transition>
    </header>

    <main class="container mx-auto px-4 py-10">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import { BoltIcon } from '@heroicons/vue/24/solid'

const auth = useAuthStore()
const isMenuOpen = ref(false)

onMounted(() => auth.fetchUser())

const logout = async () => {
  await auth.signOut()
  isMenuOpen.value = false // close menu after logout
}
</script>

<style>
/* simple slide down animation */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-0.5rem);
  opacity: 0;
}
</style>
