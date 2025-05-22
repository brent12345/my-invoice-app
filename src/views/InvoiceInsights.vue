<template>
  <div class="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
    <h1 class="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">
      Invoice Insights
    </h1>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <input
        v-model="filters.fromDate"
        type="date"
        class="p-2 border rounded text-gray-800 dark:text-gray-800 placeholder-gray-700 dark:placeholder-gray-400"
        placeholder="From Date"
      />
      <input
        v-model="filters.toDate"
        type="date"
        class="p-2 border rounded text-gray-800 dark:text-gray-800 placeholder-gray-700 dark:placeholder-gray-400"
        placeholder="To Date"
      />
      <select
        v-model="filters.type"
        class="p-2 border rounded text-gray-800 dark:text-gray-800"
      >
        <option value="" class="text-gray-500 dark:text-gray-400">All Types</option>
        <option value="debit">Debit</option>
        <option value="credit">Credit</option>
      </select>
      <select
        v-model="filters.category"
        class="p-2 border rounded text-gray-800 dark:text-gray-800"
      >
        <option value="" class="text-gray-500 dark:text-gray-400">All Categories</option>
        <option
          v-for="cat in categories"
          :key="cat.id"
          :value="cat['Category Types']"
        >
          {{ cat['Category Types'] }}
        </option>
      </select>
      <input
        v-model="filters.search"
        type="text"
        class="p-2 border rounded col-span-2 text-gray-800 dark:text-gray-800 placeholder-gray-700 dark:placeholder-gray-800"
        placeholder="Search name..."
      />
    </div>

    <!-- Fetch Button -->
    <button
      @click="runFetchInvoices"
      :disabled="loading"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
    >
      {{ loading ? 'Loading Invoices…' : 'Load Invoices' }}
    </button>
    <div v-if="fetchError" class="text-red-600 mb-4">{{ fetchError }}</div>

    <!-- Initial Placeholder -->
    <div
      v-if="!hasFetched"
      class="p-8 text-center text-gray-500 dark:text-gray-400 border border-dashed rounded-lg mb-[5px]"
    >
      Invoices will load here
    </div>

    <!-- No Results Message -->
    <div
      v-else-if="hasFetched && !invoicesList.length"
      class="p-4 text-center text-gray-700 dark:text-gray-300"
    >
      No invoices found for the selected filters.
    </div>

    <!-- Invoice Table -->
    <table
      v-else
      class="min-w-full mb-6 bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
    >
      <thead class="bg-gray-200 dark:bg-gray-700">
        <tr>
          <th class="px-4 py-2 text-left">ID</th>
          <th class="px-4 py-2 text-left">Name</th>
          <th class="px-4 py-2 text-right">Amount</th>
          <th class="px-4 py-2 text-right">Tax</th>
          <th class="px-4 py-2 text-left">Date</th>
          <th class="px-4 py-2 text-left">Type</th>
          <th class="px-4 py-2 text-left">Category</th>
          <th class="px-4 py-2 text-left">Description</th>
          <th class="px-4 py-2 text-center">Receipt</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          v-for="inv in paginatedInvoices"
          :key="inv.id"
          class="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <td class="px-4 py-2">{{ inv.id }}</td>
          <td class="px-4 py-2">{{ inv.name }}</td>
          <td class="px-4 py-2 text-right">${{ inv.amount.toFixed(2) }}</td>
          <td class="px-4 py-2 text-right">${{ inv.tax.toFixed(2) }}</td>
          <td class="px-4 py-2">{{ inv.date }}</td>
          <td class="px-4 py-2">{{ inv.type }}</td>
          <td class="px-4 py-2">{{ inv.category }}</td>
          <td class="px-4 py-2">{{ inv.description }}</td>
          <td class="px-4 py-2 text-center">
            <button
              v-if="attachments[inv.id]"
              @click="openModal(inv.id)"
            >
              <img
                :src="attachments[inv.id][0]"
                class="w-12 h-12 object-cover rounded mx-auto"
                alt="Receipt"
              />
            </button>
            <span v-else class="text-gray-500 dark:text-gray-400">—</span>
          </td>
        </tr>
      </tbody>
      <tfoot class="bg-gray-100 dark:bg-gray-700 font-bold">
        <tr>
          <td colspan="2" class="px-4 py-2 text-right">Totals:</td>
          <td class="px-4 py-2 text-right">${{ amountTotal.toFixed(2) }}</td>
          <td class="px-4 py-2 text-right">${{ taxTotal.toFixed(2) }}</td>
          <td colspan="5"></td>
        </tr>
      </tfoot>
    </table>

    <!-- Pagination -->
    <div v-if="invoicesList.length" class="flex justify-center items-center space-x-2 mb-6">
      <button
        @click="changePage(page - 1)"
        :disabled="page === 1"
        class="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>
      <span class="text-gray-700 dark:text-gray-300">Page {{ page }} of {{ totalPages }}</span>
      <button
        @click="changePage(page + 1)"
        :disabled="page === totalPages"
        class="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>

    <!-- ChatGPT Prompt -->
    <div class="mb-4">
      <textarea
        v-model="prompt"
        rows="3"
        placeholder="Ask GPT about these invoices..."
        class="w-full p-2 border rounded text-gray-800 dark:text-gray-800 placeholder-gray-700 dark:placeholder-gray-800"
      ></textarea>
      <button
        @click="runGPTAnalysis"
        :disabled="loadingGPT || !invoicesList.length"
        class="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {{ loadingGPT ? 'Analyzing…' : 'Ask ChatGPT' }}
      </button>
    </div>

    <!-- Chat History -->
    <div v-for="(entry, idx) in chatHistory" :key="idx" class="mb-4">
      <div class="font-semibold text-gray-700 dark:text-gray-200">
        Q: {{ entry.question }}
      </div>
      <div class="whitespace-pre-wrap text-gray-800 dark:text-gray-300">
        A: {{ entry.answer }}
      </div>
    </div>

    <!-- Receipt Modal -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-md w-full">
        <div class="flex justify-end p-2">
          <button
            @click="modalOpen = false"
            class="text-gray-600 dark:text-gray-300"
          >
            ✕
          </button>
        </div>
        <img
          :src="currentImage"
          alt="Receipt"
          class="w-3/4 max-w-sm h-auto mx-auto mb-4"
        />
        <div class="flex justify-end p-4">
          <button
            @click="modalOpen = false"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// State
const filters = ref({ fromDate: '', toDate: '', type: '', category: '', search: '' })
const hasFetched = ref(false)
const invoicesList = ref([])
const fetchError = ref('')
const loading = ref(false)
const categories = ref([])
const attachments = ref({})
const page = ref(1)
const perPage = 15

// Computed
const totalPages = computed(() => Math.ceil(invoicesList.value.length / perPage) || 1)
const paginatedInvoices = computed(() => invoicesList.value.slice((page.value-1)*perPage, page.value*perPage))
const amountTotal = computed(() => invoicesList.value.reduce((sum, inv) => sum + (inv.amount || 0), 0))
const taxTotal = computed(() => invoicesList.value.reduce((sum, inv) => sum + (inv.tax || 0), 0))

// GPT & Modal
const prompt = ref('')
const loadingGPT = ref(false)
const chatHistory = ref([])
const modalOpen = ref(false)
const currentImage = ref('')

// Load categories
async function loadCategories() {
  const { data, error } = await supabase
    .from('Categories')
    .select('id, "Category Types"')
    .order('"Category Types"', { ascending: true })
  if (!error) categories.value = data || []
}

// Load attachments
async function loadAttachments(ids) {
  if (!ids.length) return
  const { data, error } = await supabase
    .from('invoice_attachments')
    .select('invoice_id, path')
    .in('invoice_id', ids)
  if (error) return console.error(error.message)
  const map = {}
  for (const att of data) {
    const { data: signedData, error: signedError } = await supabase.storage
      .from('invoice-attachments')
      .createSignedUrl(att.path, 3600)
    if (signedError) continue
    map[att.invoice_id] = map[att.invoice_id] || []
    map[att.invoice_id].push(signedData.signedUrl)
  }
  attachments.value = map
}

// Fetch invoices
async function runFetchInvoices() {
  loading.value = true
  fetchError.value = ''
  invoicesList.value = []
  hasFetched.value = false
  try {
    const res = await fetch('/functions/smooth-handler', {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(filters.value)
    })
    if (!res.ok) throw new Error(await res.text())
    const { invoices } = await res.json()
    invoicesList.value = invoices
    await loadAttachments(invoices.map(i => i.id))
  } catch (e) {
    fetchError.value = e.message
  } finally {
    loading.value = false
    hasFetched.value = true
  }
}

// GPT analysis
async function runGPTAnalysis() {
  if (!prompt.value.trim() || !invoicesList.value.length) return
  loadingGPT.value = true
  const question = prompt.value
  try {
    const fullPrompt = `${question}\n\nInvoices:\n${JSON.stringify(invoicesList.value, null, 2)}`
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`
      },
      body: JSON.stringify({ model: 'gpt-4-turbo', messages: [
        { role: 'system', content: 'You are an invoice analysis assistant.' },
        { role: 'user', content: fullPrompt }
      ]})
    })
    if (!res.ok) throw new Error(await res.text())
    const { choices } = await res.json()
    const answer = choices[0].message.content.trim()
    chatHistory.value.push({ question, answer })
    prompt.value = ''
  } catch (e) {
    chatHistory.value.push({ question, answer: 'Error: ' + e.message })
  } finally {
    loadingGPT.value = false
  }
}

// Pagination handler
function changePage(newPage) {
  if (newPage < 1 || newPage > totalPages.value) return
  page.value = newPage
}

// Modal
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
