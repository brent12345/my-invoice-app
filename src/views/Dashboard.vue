<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Category Selector & Insights Link -->
      <div class="flex items-center justify-center space-x-4">
        <select
          v-model="categoryFilter"
          @change="fetchTotals"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
        >
          <option value="all">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <router-link
          to="/insights"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Invoice Insights
        </router-link>
      </div>

      <!-- Summary Boxes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Total Credits -->
        <div class="p-6 bg-green-100 dark:bg-green-800 rounded-lg shadow">
          <h3 class="text-lg font-medium text-green-800 dark:text-green-100">Total Credits</h3>
          <p class="mt-2 text-3xl font-bold text-green-900 dark:text-green-200">
            ${{ creditTotal.toFixed(2) }}
          </p>
        </div>

        <!-- Total Debits -->
        <div class="p-6 bg-red-100 dark:bg-red-800 rounded-lg shadow">
          <h3 class="text-lg font-medium text-red-800 dark:text-red-100">Total Debits</h3>
          <p class="mt-2 text-3xl font-bold text-red-900 dark:text-red-200">
            ${{ debitTotal.toFixed(2) }}
          </p>
        </div>
      </div>

      <!-- Category Manager -->
      <CategoryManager />

      <!-- ChatGPT Assistant Card -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-300">Invoice Assistant</h2>

        <textarea
          v-model="message"
          placeholder="Ask ChatGPT about invoices..."
          rows="5"
          class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
        ></textarea>

        <button
          @click="askChatGPT"
          :disabled="loading"
          class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {{ loading ? 'Asking GPT...' : 'Ask ChatGPT' }}
        </button>

        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded min-h-[100px] whitespace-pre-wrap text-gray-800 dark:text-gray-200">
          {{ response || 'Response will appear here...' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import CategoryManager from '@/components/CategoryManager.vue'
import { useRouter } from 'vue-router'

// Category filter & list
const categoryFilter = ref('all')
const categories = ref([])

// Summary totals
const creditTotal = ref(0)
const debitTotal = ref(0)

// ChatGPT fields
const message = ref('')
const response = ref('')
const loading = ref(false)

const router = useRouter()

// Load categories
async function loadCategories() {
  try {
    const { data, error, status } = await supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true })

    console.log('[Dashboard] Categories Status:', status)
    console.log('[Dashboard] Categories Data:', data)
    console.log('[Dashboard] Categories Error:', error)

    if (error) throw error

    categories.value = data || []
  } catch (err) {
    console.error('[Dashboard] Error loading categories:', err.message)
  }
}

// Fetch totals using the 'type' column (debit/credit)
async function fetchTotals() {
  try {
    let query = supabase.from('invoices').select('amount, type, category_id')

    // Category filter
    if (categoryFilter.value !== 'all') {
      query = query.eq('category_id', categoryFilter.value)
    }

    const { data, error } = await query
    if (error) throw error

    let credits = 0
    let debits = 0

    data.forEach(inv => {
      const amt = parseFloat(inv.amount || 0)
      if (inv.type === 'credit') {
        credits += amt
      } else if (inv.type === 'debit') {
        debits += amt
      }
      // If type is null or other value → ignore or handle as needed
    })

    creditTotal.value = credits
    debitTotal.value = debits

    console.log('[Dashboard] Totals calculated:', {
      credits,
      debits,
      rows: data.length,
      rawDataSample: data.slice(0, 3) // first 3 rows for debug
    })
  } catch (err) {
    console.error('[Dashboard] Error fetching totals:', err.message)
  }
}

// ChatGPT (unchanged)
async function askChatGPT() {
  loading.value = true
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an assistant that helps with invoice management.' },
          { role: 'user', content: message.value }
        ]
      })
    })
    const data = await res.json()
    response.value = data.choices?.[0]?.message?.content || 'No response.'
  } catch (err) {
    response.value = 'Error: ' + err.message
  }
  loading.value = false
}

onMounted(async () => {
  await loadCategories()
  await fetchTotals()
})
</script>