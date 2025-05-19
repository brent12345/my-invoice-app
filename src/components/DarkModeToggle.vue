<template>
  <button
    @click="toggleDarkMode"
    class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
    :class="[
      isDark ? 'text-yellow-300 focus:ring-yellow-500' : 'text-gray-700 focus:ring-gray-500'
    ]"
  >
    <component :is="isDark ? MoonIcon : SunIcon" class="w-6 h-6" />
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const isDark = ref(false)

// Initialize from localStorage or system
onMounted(() => {
  const stored = localStorage.getItem('theme')
  if (stored) {
    isDark.value = stored === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
})

const applyTheme = () => {
  const html = document.documentElement
  if (isDark.value) html.classList.add('dark')
  else html.classList.remove('dark')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  applyTheme()
}
</script>
```