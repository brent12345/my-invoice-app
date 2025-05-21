<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
    <!-- Hero Section -->
    <section class="flex-grow flex flex-col justify-center items-center text-center px-4">
      <h1 class="text-4xl md:text-5xl font-extrabold text-blue-700 dark:text-blue-300 mb-4">
        Welcome to InvoiceGPT
      </h1>
      <p class="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mb-6">
        Simplify your billing workflow with smart invoice management powered by Supabase and ChatGPT.
      </p>
      <div class="space-x-4">
        <router-link
          to="/register"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Get Started
        </router-link>
        <router-link
          to="/login"
          class="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition"
        >
          Login
        </router-link>
      </div>
    </section>

    <!-- Features Section -->
    <section class="bg-white dark:bg-gray-900 py-12">
      <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
          <DocumentTextIcon class="w-12 h-12 text-blue-500 dark:text-blue-400 mb-4" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Create Invoices</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Easily generate, save, and manage invoices with our intuitive form.
          </p>
        </div>
        <div class="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
          <ListBulletIcon class="w-12 h-12 text-green-500 dark:text-green-400 mb-4" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">View & Filter</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Browse all your invoices with sorting, pagination, and advanced filters.
          </p>
        </div>
        <div class="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
          <ChatBubbleBottomCenterTextIcon class="w-12 h-12 text-indigo-500 dark:text-indigo-400 mb-4" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Smart Assistant</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Get invoice-related insights and assistance using ChatGPT integration.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-4 text-center text-gray-600 dark:text-gray-400">
      &copy; {{ new Date().getFullYear() }} InvoiceGPT. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { DocumentTextIcon, ListBulletIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/vue/24/outline'
</script>