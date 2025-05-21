<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <div class="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Invoices</h2>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6 items-end">
        <!-- Category Filter -->
        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select v-model="categoryFilter"
                  class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600">
            <option value="all">All</option>
            <option value="Office">Office</option>
            <option value="Car">Car</option>
            <option value="Shipping">Shipping</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select v-model="typeFilter"
                  class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600">
            <option value="all">All</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>

        <!-- Date Filter -->
        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input v-model="dateFilter" type="date"
                 class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600" />
        </div>

        <!-- Search Filter -->
        <div class="flex flex-col flex-1 min-w-[200px]">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Search by Name</label>
          <input v-model="searchFilter" type="text" placeholder="Enter invoice name"
                 class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600" />
        </div>

        <button @click="fetchInvoices(1)"
                class="px-4 py-2 mt-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Filter
        </button>
      </div>

      <!-- Invoice Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th @click="changeSort('category')"
                  class="px-4 py-2 text-left text-sm font-semibold cursor-pointer text-gray-700 dark:text-gray-200">
                Category <span>{{ sortField==='category' ? (sortAsc ? '▲' : '▼') : '' }}</span>
              </th>
              <th @click="changeSort('name')"
                  class="px-4 py-2 text-left text-sm font-semibold cursor-pointer text-gray-700 dark:text-gray-200">
                Name <span>{{ sortField==='name' ? (sortAsc ? '▲' : '▼') : '' }}</span>
              </th>
              <th class="px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">Amount</th>
              <th class="px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">Tax</th>
              <th @click="changeSort('date')"
                  class="px-4 py-2 text-center text-sm font-semibold cursor-pointer text-gray-700 dark:text-gray-200">
                Date <span>{{ sortField==='date' ? (sortAsc ? '▲' : '▼') : '' }}</span>
              </th>
              <th @click="changeSort('type')"
                  class="px-4 py-2 text-center text-sm font-semibold cursor-pointer text-gray-700 dark:text-gray-200">
                Type <span>{{ sortField==='type' ? (sortAsc ? '▲' : '▼') : '' }}</span>
              </th>
              <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id" class="border-b border-gray-200 dark:border-gray-700">
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ invoice.category }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ invoice.name }}</td>
              <td class="px-4 py-2 text-sm text-right text-gray-800 dark:text-gray-200">
                ${{ invoice.amount.toFixed(2) }}
              </td>
              <td class="px-4 py-2 text-sm text-right text-gray-800 dark:text-gray-200">
                ${{ invoice.tax.toFixed(2) }}
              </td>
              <td class="px-4 py-2 text-sm text-center text-gray-800 dark:text-gray-200">{{ invoice.date }}</td>
              <td class="px-4 py-2 text-sm text-center text-gray-800 dark:text-gray-200 capitalize">{{ invoice.type }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ invoice.description }}</td>
            </tr>
            <tr v-if="invoices.length === 0">
              <td colspan="7" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">No invoices found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center items-center space-x-2 mt-4">
        <button @click="changePage(page - 1)" :disabled="page===1"
                class="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50">
          Prev
        </button>
        <span class="text-gray-700 dark:text-gray-300">Page {{ page }} of {{ totalPages }}</span>
        <button @click="changePage(page + 1)" :disabled="page===totalPages"
                class="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50">
          Next
        </button>
      </div>

      <!-- Total Amount -->
      <div class="mt-4 text-right font-bold text-lg text-gray-800 dark:text-gray-200">
        Total Amount: ${{ totalAmount.toFixed(2) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const invoices = ref([])
const categoryFilter = ref('all')
const typeFilter = ref('all')
const dateFilter = ref('')
const searchFilter = ref('')
const page = ref(1)
const perPage = 20
const totalCount = ref(0)
const sortField = ref('date')
const sortAsc = ref(true)

const totalPages = computed(() => Math.ceil(totalCount.value / perPage) || 1)

// Compute total amount of currently displayed invoices
const totalAmount = computed(() =>
  invoices.value.reduce((sum, inv) => sum + (inv.amount || 0), 0)
)

const fetchInvoices = async (p = page.value) => {
  page.value = p
  const from = (p - 1) * perPage
  const to = p * perPage - 1

  // determine secondary sort fields
  const fields = ['category', 'date', 'type']
  const primary = sortField.value
  const secondary = fields.filter(f => f !== primary)

  let query = supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .order(primary, { ascending: sortAsc.value })
    .order(secondary[0], { ascending: true })
    .order(secondary[1], { ascending: true })
    .range(from, to)

  if (categoryFilter.value !== 'all') query = query.eq('category', categoryFilter.value)
  if (typeFilter.value !== 'all') query = query.eq('type', typeFilter.value)
  if (dateFilter.value) query = query.eq('date', dateFilter.value)
  if (searchFilter.value) query = query.ilike('name', `%${searchFilter.value}%`)

  const { data, count, error } = await query
  if (error) console.error('Error fetching invoices:', error.message)
  else {
    invoices.value = data || []
    totalCount.value = count || 0
  }
}

const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return
  fetchInvoices(newPage)
}

const changeSort = (field) => {
  if (sortField.value === field) sortAsc.value = !sortAsc.value
  else {
    sortField.value = field
    sortAsc.value = true
  }
  fetchInvoices(1)
}

onMounted(() => fetchInvoices(1))
</script>

