<template>
  <div class="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
    <h1 class="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">
      Invoice Insights
    </h1>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <input
        v-model="filters.fromDate"
        type="date"
        class="p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
        placeholder="From Date"
      />
      <input
        v-model="filters.toDate"
        type="date"
        class="p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
        placeholder="To Date"
      />
      <select
        v-model="filters.type"
        class="p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
      >
        <option value="">All Types</option>
        <option value="debit">Debit</option>
        <option value="credit">Credit</option>
      </select>
      <select
        v-model="filters.category"
        class="p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
      >
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
      <input
        v-model="filters.search"
        type="text"
        placeholder="Search invoice number or customer..."
        class="p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 col-span-2 md:col-span-1"
      />
    </div>

    <!-- Fetch Button -->
    <button
      @click="runFetchInvoices"
      :disabled="loading"
      class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mb-4 disabled:opacity-50"
    >
      {{ loading ? 'Loading Invoices…' : 'Load Invoices' }}
    </button>

    <div v-if="fetchError" class="text-red-600 mb-4">{{ fetchError }}</div>

    <!-- Initial Placeholder -->
    <div
      v-if="!hasFetched"
      class="p-8 text-center text-gray-500 dark:text-gray-400 border border-dashed rounded-lg mb-6"
    >
      Invoices will load here after clicking "Load Invoices"
    </div>

    <!-- No Results -->
    <div
      v-else-if="hasFetched && !invoicesList.length"
      class="p-4 text-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg"
    >
      No invoices found matching your filters.
    </div>

    <!-- Invoice Table -->
    <table
      v-else
      class="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow"
    >
      <thead class="bg-gray-200 dark:bg-gray-700">
        <tr>
          <th class="px-4 py-3 text-left text-sm font-medium">ID</th>
          <th class="px-4 py-3 text-left text-sm font-medium">Invoice #</th>
          <th class="px-4 py-3 text-left text-sm font-medium">Customer</th>
          <th class="px-4 py-3 text-right text-sm font-medium">Amount</th>
          <th class="px-4 py-3 text-right text-sm font-medium">Tax</th>
          <th class="px-4 py-3 text-left text-sm font-medium">Issue Date</th>
          <th class="px-4 py-3 text-left text-sm font-medium">Type</th>
          <th class="px-4 py-3 text-left text-sm font-medium">Category</th>
          <th class="px-4 py-3 text-center text-sm font-medium">Receipt</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          v-for="inv in paginatedInvoices"
          :key="inv.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <td class="px-4 py-3">{{ inv.id }}</td>
          <td class="px-4 py-3">{{ inv.invoice_number || '—' }}</td>
          <td class="px-4 py-3">{{ inv.customer_name || '—' }}</td>
          <td class="px-4 py-3 text-right">${{ (inv.amount || 0).toFixed(2) }}</td>
          <td class="px-4 py-3 text-right">${{ (inv.tax || 0).toFixed(2) }}</td>
          <td class="px-4 py-3">{{ inv.issue_date || '—' }}</td>
          <td class="px-4 py-3">{{ inv.type || '—' }}</td>
          <td class="px-4 py-3">{{ inv.category_name || '—' }}</td>
          <td class="px-4 py-3 text-center">
            <button
              v-if="attachments[inv.id] && attachments[inv.id].length"
              @click="openModal(inv.id)"
              class="focus:outline-none"
            >
              <img
                :src="attachments[inv.id][0]"
                class="w-12 h-12 object-cover rounded mx-auto"
                alt="Receipt thumbnail"
              />
            </button>
            <span v-else class="text-gray-500 dark:text-gray-400">—</span>
          </td>
        </tr>
      </tbody>
      <tfoot class="bg-gray-100 dark:bg-gray-700 font-bold">
        <tr>
          <td colspan="3" class="px-4 py-3 text-right">Totals:</td>
          <td class="px-4 py-3 text-right">${{ amountTotal.toFixed(2) }}</td>
          <td class="px-4 py-3 text-right">${{ taxTotal.toFixed(2) }}</td>
          <td colspan="4"></td>
        </tr>
      </tfoot>
    </table>

    <!-- Pagination -->
    <div v-if="invoicesList.length" class="flex justify-center items-center space-x-4 mt-6">
      <button
        @click="changePage(page - 1)"
        :disabled="page === 1"
        class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>
      <span class="text-gray-700 dark:text-gray-300">
        Page {{ page }} of {{ totalPages }}
      </span>
      <button
        @click="changePage(page + 1)"
        :disabled="page === totalPages"
        class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>

    <!-- ChatGPT Prompt -->
    <div class="mt-8 mb-4">
      <textarea
        v-model="prompt"
        rows="3"
        placeholder="Ask GPT about these invoices (e.g., total spending trends, unusual patterns...)"
        class="w-full p-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
      ></textarea>
      <button
        @click="runGPTAnalysis"
        :disabled="loadingGPT || !invoicesList.length"
        class="mt-3 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {{ loadingGPT ? 'Analyzing...' : 'Ask ChatGPT' }}
      </button>
    </div>

    <!-- Chat History -->
    <div v-for="(entry, idx) in chatHistory" :key="idx" class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="font-semibold text-gray-800 dark:text-gray-200">Q: {{ entry.question }}</div>
      <div class="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
        A: {{ entry.answer }}
      </div>
    </div>

    <!-- Receipt Modal -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-4xl w-11/12 max-h-[90vh] relative">
        <button
          @click="modalOpen = false"
          class="absolute top-4 right-4 text-gray-600 dark:text-gray-300 text-2xl font-bold"
        >
          ✕
        </button>
        <img
          :src="currentImage"
          alt="Receipt"
          class="w-full h-auto max-h-[80vh] object-contain p-4"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// State
const filters = ref({
  fromDate: '',
  toDate: '',
  type: '',
  category: '',
  search: ''
})
const hasFetched = ref(false)
const invoicesList = ref([])
const fetchError = ref('')
const loading = ref(false)
const categories = ref([])
const attachments = ref({})
const page = ref(1)
const perPage = 15

// GPT & Modal
const prompt = ref('')
const loadingGPT = ref(false)
const chatHistory = ref([])
const modalOpen = ref(false)
const currentImage = ref('')

// Computed
const totalPages = computed(() => Math.ceil(invoicesList.value.length / perPage) || 1)
const paginatedInvoices = computed(() =>
  invoicesList.value.slice((page.value - 1) * perPage, page.value * perPage)
)
const amountTotal = computed(() =>
  invoicesList.value.reduce((sum, inv) => sum + (inv.amount || 0), 0)
)
const taxTotal = computed(() =>
  invoicesList.value.reduce((sum, inv) => sum + (inv.tax || 0), 0)
)

// Load categories
async function loadCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error
    categories.value = data || []
  } catch (err) {
    console.error('Error loading categories:', err.message)
    fetchError.value = 'Failed to load categories'
  }
}

// Fetch invoices using the view
async function runFetchInvoices() {
  loading.value = true
  fetchError.value = ''
  invoicesList.value = []
  hasFetched.value = false

  try {
    let query = supabase.from('invoices_with_category').select('*')

    // Date range
    if (filters.value.fromDate) {
      query = query.gte('issue_date', filters.value.fromDate)
    }
    if (filters.value.toDate) {
      query = query.lte('issue_date', filters.value.toDate)
    }

    // Type (debit/credit)
    if (filters.value.type) {
      query = query.eq('type', filters.value.type)
    }

    // Category
    if (filters.value.category) {
      query = query.eq('category_id', filters.value.category)
    }

    // Search on invoice_number or customer_name
    if (filters.value.search.trim()) {
      const searchTerm = `%${filters.value.search.trim()}%`
      query = query.or(`invoice_number.ilike.${searchTerm},customer_name.ilike.${searchTerm}`)
    }

    const { data, error } = await query.order('issue_date', { ascending: false })

    if (error) throw error

    invoicesList.value = data || []
    await loadAttachments(data.map(i => i.id))
  } catch (err) {
    console.error('Fetch invoices error:', err)
    fetchError.value = 'Failed to fetch invoices: ' + (err.message || JSON.stringify(err))
  } finally {
    loading.value = false
    hasFetched.value = true
  }
}

// Load attachment thumbnails (signed URLs)
async function loadAttachments(ids) {
  if (!ids.length) return

  try {
    const { data, error } = await supabase
      .from('invoice_attachments')
      .select('invoice_id, file_path')
      .in('invoice_id', ids)

    if (error) throw error

    const map = {}
    for (const att of data) {
      const { data: signed, error: signedErr } = await supabase.storage
        .from('invoice-attachments')
        .createSignedUrl(att.file_path, 3600 * 24) // 24 hours

      if (signedErr) continue

      map[att.invoice_id] = map[att.invoice_id] || []
      map[att.invoice_id].push(signed.signedUrl)
    }

    attachments.value = map
  } catch (err) {
    console.error('Attachments fetch error:', err.message)
  }
}

// GPT analysis
async function runGPTAnalysis() {
  if (!prompt.value.trim() || !invoicesList.value.length) return

  loadingGPT.value = true
  const question = prompt.value

  try {
    const fullPrompt = `${question}\n\nInvoices data:\n${JSON.stringify(invoicesList.value, null, 2)}`
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are an expert invoice analyst.' },
          { role: 'user', content: fullPrompt }
        ]
      })
    })

    if (!res.ok) throw new Error(await res.text())

    const { choices } = await res.json()
    const answer = choices[0].message.content.trim()
    chatHistory.value.push({ question, answer })
    prompt.value = ''
  } catch (e) {
    console.error('GPT error:', e)
    chatHistory.value.push({ question, answer: 'Error: ' + e.message })
  } finally {
    loadingGPT.value = false
  }
}

// Pagination
function changePage(newPage) {
  if (newPage < 1 || newPage > totalPages.value) return
  page.value = newPage
}

// Modal for receipt
function openModal(id) {
  const urls = attachments.value[id]
  if (urls && urls.length) {
    currentImage.value = urls[0]
    modalOpen.value = true
  }
}

// Init
onMounted(() => {
  loadCategories()
})
</script>
