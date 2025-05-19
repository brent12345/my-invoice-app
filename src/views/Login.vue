<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
    <div class="w-full max-w-md bg-white/90 dark:bg-gray-800/70 backdrop-blur border border-blue-100 dark:border-gray-700 p-8 rounded-xl shadow-xl">
      <h2 class="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-6 text-center">Sign In</h2>

      <form @submit.prevent="onSubmit" class="space-y-5">
        <div class="relative">
          <EnvelopeIcon
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300"
          />
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <div class="relative">
          <LockClosedIcon
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300"
          />
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.password }}</p>
        </div>

        <button
          type="submit"
          class="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 transition"
        >
          Login
        </button>

        <p v-if="serverError" class="text-red-600 text-center mt-2">{{ serverError }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const serverError = ref('')

const schema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(6),
})

const { handleSubmit, errors } = useForm({ validationSchema: schema })
const { value: email } = useField('email')
const { value: password } = useField('password')

const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password
  })
  if (error) {
    serverError.value = error.message
    return
  }
  router.push('/dashboard')
})
</script>
