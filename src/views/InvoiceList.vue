<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Invoices</h2>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6 items-end">
        <!-- Category Filter -->
        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select v-model="categoryFilter" class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600">
            <option value="all">All</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat['Category Types']">{{ cat['Category Types'] }}</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select v-model="typeFilter" class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600">
            <option value="all">All</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>

        <!-- Date Filter -->
        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input v-model="dateFilter" @change="fetchInvoices(1)" type="date" class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <!-- Search Filter -->
        <div class="flex flex-col flex-1 min-w-[200px]">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Search by Name</label>
          <input v-model="searchFilter" @keyup.enter="fetchInvoices(1)" type="text" placeholder="Enter invoice name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <button @click="fetchInvoices(1)" class="px-4 py-2 mt-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Filter</button>
      </div>

      <!-- Invoice Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th @click="changeSort('category')" class="px-4 py-2 text-left text-sm font-semibold cursor-pointer text-gray-700 dark:text-gray-200">Category <span>{{ sortField==='category' ? (sortAsc ? '▲' : '▼') : '' }}</span></th>
              <th @click="changeSort('name')" class="px-4 py-2 text-left text-sm font-semibold cursor-pointer text-gray-700 dark:text-gray-200">Name <span>{{ sortField==='name' ? (sortAsc ? '▲' : '▼') : '' }}</span></th>
              <th class="px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">Amount</th>
              <th class="px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">Tax</th>
              <th @click="changeSort('date')" class="px-4 py-2 text-center text-sm font-semibold cursor-pointer text-gray-700 dark:text-gray-200">Date <span>{{ sortField==='date' ? (sortAsc ? '▲' : '▼') : '' }}</span></th>
              <th @click="changeSort('type')" class="px-4 py-2 text-center text-sm font-semibold cursor-pointer text-gray-700 dark:text-gray-200">Type <span>{{ sortField==='type' ? (sortAsc ? '▲' : '▼') : '' }}</span></th>
              <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Description</th>
              <th class="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Receipt</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id" class="border-b border-gray-200 dark:border-gray-700">
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ invoice.category }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ invoice.name }}</td>
              <td class="px-4 py-2 text-sm text-right text-gray-800 dark:text-gray-200">${{ invoice.amount.toFixed(2) }}</td>
              <td class="px-4 py-2 text-sm text-right text-gray-800 dark:text-gray-200">${{ invoice.tax.toFixed(2) }}</td>
              <td class="px-4 py-2 text-sm text-center text-gray-800 dark:text-gray-200">{{ invoice.date }}</td>
              <td class="px-4 py-2 text-sm text-center text-gray-800 dark:text-gray-200 capitalize">{{ invoice.type }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ invoice.description }}</td>
              <td class="px-4 py-2 text-center">
                <button v-if="attachments[invoice.id]" @click="openModal(invoice.id)" class="mx-auto">
                  <img :src="attachments[invoice.id][0]" class="w-16 h-16 object-cover rounded" alt="Receipt" />
                </button>
                <span v-else class="text-gray-500 dark:text-gray-400">—</span>
              </td>
            </tr>
            <tr v-if="invoices.length === 0">
              <td colspan="8" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">No invoices found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination & Totals -->
      <div class="flex justify-between items-center mt-4">
        <div class="flex space-x-2">
          <button @click="changePage(page - 1)" :disabled="page===1" class="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50">Prev</button>
          <span class="text-gray-700 dark:text-gray-300">Page {{ page }} of {{ totalPages }}</span>
          <button @click="changePage(page + 1)" :disabled="page===totalPages" class="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50">Next</button>
        </div>
        <div class="font-bold text-gray-800 dark:text-gray-200">Total: ${{ totalAmount.toFixed(2) }}</div>
      </div>

      <!-- Receipt Modal -->
      <div v-if="modalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-lg w-full">
          <div class="flex justify-end p-2">
            <button @click="modalOpen = false" class="text-gray-600 dark:text-gray-300">✕</button>
          </div>
          <img :src="currentImage" alt="Receipt" class="w-3/4 max-w-lg h-auto mx-auto" />
          <div class="flex justify-end p-4">
            <button @click="modalOpen = false" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// State
const invoices = ref([])
const categories = ref([])
const attachments = ref({})
const categoryFilter = ref('all')
const typeFilter = ref('all')
const dateFilter = ref('')
const searchFilter = ref('')
const page = ref(1)
const perPage = 20
const totalCount = ref(0)
const sortField = ref('date')
const sortAsc = ref(true)

const modalOpen = ref(false)
const currentImage = ref('')

// Computed
const totalPages = computed(() => Math.ceil(totalCount.value / perPage) || 1)
const totalAmount = computed(() => invoices.value.reduce((sum, inv) => sum + (inv.amount || 0), 0))

// Load categories
async function loadCategories() {
  const { data, error } = await supabase.from('Categories').select('id, "Category Types"').order('"Category Types"', { ascending: true })
  if (!error) categories.value = data || []
}

// Load attachments
async function loadAttachments(invoiceIds) {
  if (!invoiceIds.length) return
  const { data, error } = await supabase.from('invoice_attachments').select('invoice_id, path').in('invoice_id', invoiceIds)
  if (error) return console.error('Error loading attachments:', error.message)

  const map = {}
  for (const att of data) {
    const { data: signedData, error: signedError } = await supabase.storage.from('invoice-attachments').createSignedUrl(att.path, 3600)
    if (signedError) {
      console.error('Signed URL error:', signedError.message)
      continue
    }
    if (!map[att.invoice_id]) map[att.invoice_id] = []
    map[att.invoice_id].push(signedData.signedUrl)
  }
  attachments.value = map
}

// Fetch invoices
async function fetchInvoices(p = page.value) {
  page.value = p
  const from = (p - 1) * perPage
  const to = p * perPage - 1

  // Sorting
  const fields = ['category','date','type']
  const primary = sortField.value
  const secondary = fields.filter(f => f !== primary)

  let query = supabase.from('invoices').select('*', { count: 'exact' }).order(primary, { ascending: sortAsc.value }).order(secondary[0], { ascending: true }).order(secondary[1], { ascending: true }).range(from, to)

  // Filters
  if (categoryFilter.value !== 'all') query = query.eq('category', categoryFilter.value)
  if (typeFilter.value !== 'all') query = query.eq('type', typeFilter.value)
  if (dateFilter.value) query = query.eq('date', dateFilter.value)
  if (searchFilter.value) query = query.ilike('name', `%${searchFilter.value}%`)

  const { data, count, error } = await query
  if (error) console.error('Error fetching invoices:', error.message)
  else {
    invoices.value = data || []
    totalCount.value = count || 0
    const ids = invoices.value.map(inv => inv.id)
    await loadAttachments(ids)
  }
}

// Handlers
const changePage = newPage => { if (newPage>0&&newPage<=totalPages.value) fetchInvoices(newPage) }
const changeSort = field => { sortField.value===field ? sortAsc.value=!sortAsc.value : (sortField.value=field, sortAsc.value=true); fetchInvoices(1) }

// Modal
function openModal(invoiceId) {
  const urls = attachments.value[invoiceId]
  if (urls && urls.length) {
    currentImage.value = urls[0]
    modalOpen.value = true
  }
}

// Init
onMounted(() => { loadCategories(); fetchInvoices(1) })
</script>
