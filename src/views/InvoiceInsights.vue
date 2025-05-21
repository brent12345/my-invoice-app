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
        class="p-2 border rounded"
        placeholder="From Date"
      />
      <input
        v-model="filters.toDate"
        type="date"
        class="p-2 border rounded"
        placeholder="To Date"
      />
      <select v-model="filters.type" class="p-2 border rounded">
        <option value="">All Types</option>
        <option value="debit">Debit</option>
        <option value="credit">Credit</option>
      </select>
      <select v-model="filters.category" class="p-2 border rounded">
        <option value="">All Categories</option>
        <option>Office</option>
        <option>Car</option>
        <option>Shipping</option>
        <option>Miscellaneous</option>
      </select>
      <input
        v-model="filters.search"
        type="text"
        class="p-2 border rounded col-span-2"
        placeholder="Search name..."
      />
    </div>

    <!-- 1) Fetch Invoices Button -->
    <button
      @click="runFetchInvoices"
      :disabled="loading"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
    >
      {{ loading ? 'Loading Invoices…' : 'Load Invoices' }}
    </button>
    <div v-if="fetchError" class="text-red-600 mb-4">{{ fetchError }}</div>

    <!-- Invoice Table -->
    <table v-if="invoicesList.length" class="min-w-full mb-6 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
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
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-for="inv in invoicesList" :key="inv.id" class="hover:bg-gray-100 dark:hover:bg-gray-700">
          <td class="px-4 py-2">{{ inv.id }}</td>
          <td class="px-4 py-2">{{ inv.name }}</td>
          <td class="px-4 py-2 text-right">{{ inv.amount.toFixed(2) }}</td>
          <td class="px-4 py-2 text-right">{{ inv.tax.toFixed(2) }}</td>
          <td class="px-4 py-2">{{ inv.date }}</td>
          <td class="px-4 py-2">{{ inv.type }}</td>
          <td class="px-4 py-2">{{ inv.category }}</td>
          <td class="px-4 py-2">{{ inv.description }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 2) ChatGPT Prompt -->
    <textarea
      v-model="prompt"
      rows="3"
      placeholder="Ask GPT about these invoices..."
      class="w-full p-2 border rounded mb-2"
    ></textarea>
    <button
      @click="runGPTAnalysis"
      :disabled="loadingGPT || !invoicesList.length"
      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
    >
      {{ loadingGPT ? 'Analyzing…' : 'Ask ChatGPT' }}
    </button>
    <div v-if="gptError" class="text-red-600 mb-4">{{ gptError }}</div>
    <div
      v-if="analysis"
      class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md whitespace-pre-wrap"
    >
      {{ analysis }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// 1) State for your invoice fetch
const filters     = ref({ fromDate: '', toDate: '', type: '', category: '', search: '' })
const invoicesList= ref([])
const fetchError  = ref('')
const loading     = ref(false)

// 2) State for GPT
const prompt      = ref('')
const analysis    = ref('')
const gptError    = ref('')
const loadingGPT  = ref(false)

// Reset GPT fields when invoicesList changes
watch(invoicesList, () => {
  prompt.value = ''
  analysis.value = ''
  gptError.value = ''
  loadingGPT.value = false
})

// A) Fetch invoices
async function runFetchInvoices() {
  loading.value    = true
  fetchError.value = ''
  invoicesList.value = []

  try {
    const res = await fetch('/functions/smooth-handler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(filters.value),
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`HTTP ${res.status}: ${txt}`)
    }
    const { invoices } = await res.json()
    invoicesList.value = invoices
  } catch (e) {
    fetchError.value = e.message
  } finally {
    loading.value = false
  }
}

// B) GPT analysis
async function runGPTAnalysis() {
  if (!invoicesList.value.length) return
  loadingGPT.value = true
  gptError.value   = ''
  analysis.value   = ''

  try {
    // Combine prompt + invoice data
    const fullPrompt = `
${prompt.value}

Invoices:
${JSON.stringify(invoicesList.value, null, 2)}
    `
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an invoice analysis assistant.' },
          { role: 'user',   content: fullPrompt },
        ],
      }),
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`GPT HTTP ${res.status}: ${txt}`)
    }

    const { choices } = await res.json()
    analysis.value = choices[0].message.content.trim()
  } catch (e) {
    gptError.value = e.message
  } finally {
    loadingGPT.value = false
  }
}
</script>

