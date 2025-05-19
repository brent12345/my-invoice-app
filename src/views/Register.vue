<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-800 dark:to-gray-700">
    <div class="w-full max-w-md bg-white/90 dark:bg-gray-800/70 backdrop-blur border border-purple-100 dark:border-gray-700 p-8 rounded-xl shadow-xl">
      <h2 class="text-3xl font-extrabold text-purple-700 dark:text-purple-300 mb-6 text-center">Create Account</h2>
      <form @submit.prevent="onSubmit" class="space-y-5">
        <div class="relative">
          <EnvelopeIcon
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300"
          />
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <div class="relative">
          <LockClosedIcon
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.password }}</p>
        </div>

        <div class="relative">
          <KeyIcon
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            class="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.confirmPassword }}</p>
        </div>

        <button
          type="submit"
          class="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg shadow hover:from-purple-700 hover:to-pink-600 transition"
        >
          Register
        </button>

        <p v-if="success" class="text-green-600 text-center mt-2">{{ success }}</p>
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
import { EnvelopeIcon, LockClosedIcon, KeyIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const success = ref('')
const serverError = ref('')

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required(),
})

const { handleSubmit, errors } = useForm({ validationSchema: schema })
const { value: email }
 = useField('email')
const { value: password }
 = useField('password')
const { value: confirmPassword }
 = useField('confirmPassword')

const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''
  success.value = ''

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: { data: { role: 'user' } }
  })

  if (error) {
    serverError.value = error.message
    return
  }

  success.value = 'Registered! Please check your email to confirm.'
  setTimeout(() => router.push('/login'), 2500)
})
</script>