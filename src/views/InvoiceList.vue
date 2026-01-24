<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Invoices</h2>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6 items-end">
        <!-- Category Filter -->
        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select v-model="categoryFilter" class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            <option value="all">All</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select v-model="typeFilter" class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            <option value="all">All</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>

        <!-- Date Filter -->
        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Issue Date</label>
          <input v-model="dateFilter" @change="fetchInvoices(1)" type="date" class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
        </div>

        <!-- Search Filter -->
        <div class="flex flex-col flex-1 min-w-[200px]">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Search by Invoice # or Customer</label>
          <input v-model="searchFilter" @keyup.enter="fetchInvoices(1)" type="text" placeholder="Search..." class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
        </div>

        <button @click="fetchInvoices(1)" class="px-4 py-2 mt-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Filter</button>
      </div>

      <!-- Invoice Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th class="px-4 py-2">Category</th>
              <th class="px-4 py-2">Invoice #</th>
              <th class="px-4 py-2 text-right">Amount</th>
              <th class="px-4 py-2 text-right">Tax</th>
              <th class="px-4 py-2 text-center">Issue Date</th>
              <th class="px-4 py-2 text-center">Type</th>
              <th class="px-4 py-2 text-center">Description</th>
              <th class="px-4 py-2 text-center">Receipt</th>
              <th class="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id" class="border-b border-gray-200 dark:border-gray-700">
              <td class="px-4 py-2">{{ invoice.category_name || '—' }}</td>
              <td class="px-4 py-2">{{ invoice.invoice_number || '—' }}</td>
              <td class="px-4 py-2 text-right">${{ (invoice.amount || 0).toFixed(2) }}</td>
              <td class="px-4 py-2 text-right">${{ (invoice.tax || 0).toFixed(2) }}</td>
              <td class="px-4 py-2 text-center">{{ invoice.issue_date || '—' }}</td>
              <td class="px-4 py-2 text-center">{{ invoice.type || '—' }}</td>
              <td class="px-4 py-2">{{ invoice.description || '—' }}</td>
              <td class="px-4 py-2 text-center">
                <button v-if="attachments[invoice.id]" @click="openModal(invoice.id)" class="mx-auto">
                  <img :src="attachments[invoice.id][0]" class="w-16 h-16 object-cover rounded" alt="Receipt" />
                </button>
                <span v-else class="text-gray-500">—</span>
              </td>
              <td class="px-4 py-2 text-right">
                <div class="flex flex-wrap justify-end gap-2">
                  <button
                    @click="startEdit(invoice)"
                    class="flex items-center px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition"
                    title="Edit this invoice"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-4.5 4.5l6-6" />
                    </svg>
                    Edit
                  </button>
                  <button
                    @click="confirmDelete(invoice.id)"
                    class="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                    title="Delete this invoice"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
                    </svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="invoices.length === 0">
              <td colspan="9" class="px-4 py-6 text-center text-gray-500">No invoices found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-4">
        <div class="flex space-x-2">
          <button @click="changePage(page - 1)" :disabled="page===1" class="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded">Prev</button>
          <span class="text-gray-700 dark:text-white">Page {{ page }} of {{ totalPages }}</span>
          <button @click="changePage(page + 1)" :disabled="page===totalPages" class="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded">Next</button>
        </div>
        <div class="font-bold text-gray-800 dark:text-white">Total: ${{ totalAmount.toFixed(2) }}</div>
      </div>

      <!-- Receipt Modal -->
      <div v-if="modalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded shadow-md max-w-4xl w-11/12">
          <button @click="modalOpen = false" class="absolute top-4 right-4 text-gray-600 dark:text-gray-300 text-3xl font-bold">✕</button>
          <img :src="currentImage" class="w-full h-auto max-h-[80vh] object-contain p-4" alt="Receipt" />
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded shadow-md">
          <p class="text-lg text-gray-800 dark:text-gray-200 mb-4">Are you sure you want to delete this invoice?</p>
          <div class="flex justify-end space-x-4">
            <button @click="showDeleteModal = false" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
            <button @click="deleteInvoice(selectedInvoiceId)" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-lg">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Edit Invoice</h3>

          <div class="space-y-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Number</label>
              <input v-model="editInvoice.invoice_number" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>

            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name</label>
              <input v-model="editInvoice.customer_name" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>

            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
              <input type="number" step="0.01" v-model.number="editInvoice.amount" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>

            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tax</label>
              <input type="number" step="0.01" v-model.number="editInvoice.tax" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>

            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Issue Date</label>
              <input type="date" v-model="editInvoice.issue_date" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>

            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
              <input type="date" v-model="editInvoice.due_date" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>

            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select v-model="editInvoice.type" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea v-model="editInvoice.description" rows="3" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"></textarea>
            </div>

            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select v-model="editInvoice.category_id" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="flex justify-end space-x-4 mt-6">
              <button @click="showEditModal = false" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
              <button @click="saveInvoiceEdit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

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
const sortField = ref('issue_date')
const sortAsc = ref(false) // latest first

const modalOpen = ref(false)
const currentImage = ref('')

const showDeleteModal = ref(false)
const selectedInvoiceId = ref(null)

const showEditModal = ref(false)
const editInvoice = ref({})

const totalPages = computed(() => Math.ceil(totalCount.value / perPage) || 1)
const totalAmount = computed(() => invoices.value.reduce((sum, inv) => sum + (inv.amount || 0), 0))

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
  }
}

async function loadAttachments(invoiceIds) {
  if (!invoiceIds.length) return

  try {
    const { data, error } = await supabase
      .from('invoice_attachments')
      .select('invoice_id, file_path')
      .in('invoice_id', invoiceIds)

    if (error) throw error

    const map = {}
    for (const att of data) {
      const { data: signed, error: signedErr } = await supabase.storage
        .from('invoice-attachments')
        .createSignedUrl(att.file_path, 3600)

      if (signedErr) continue

      map[att.invoice_id] = map[att.invoice_id] || []
      map[att.invoice_id].push(signed.signedUrl)
    }

    attachments.value = map
  } catch (err) {
    console.error('Attachments error:', err.message)
  }
}

async function fetchInvoices(p = page.value) {
  page.value = p
  const from = (p - 1) * perPage
  const to = p * perPage - 1

  try {
    // Use the view - no join/alias needed in JS
    let query = supabase.from('invoices_with_category').select('*', { count: 'exact' })

    // Filters
    if (categoryFilter.value !== 'all') {
      query = query.eq('category_id', categoryFilter.value)
    }
    if (typeFilter.value !== 'all') {
      query = query.eq('type', typeFilter.value)
    }
    if (dateFilter.value) {
      query = query.eq('issue_date', dateFilter.value)
    }
    if (searchFilter.value) {
      const term = `%${searchFilter.value.trim()}%`
      query = query.or(`invoice_number.ilike.${term},customer_name.ilike.${term}`)
    }

    const { data, count, error } = await query
      .order(sortField.value, { ascending: sortAsc.value })
      .range(from, to)

    if (error) throw error

    invoices.value = data || []
    totalCount.value = count || 0
    await loadAttachments(invoices.value.map(inv => inv.id))
  } catch (err) {
    console.error('Error fetching invoices:', err.message)
  }
}

function changePage(newPage) {
  if (newPage > 0 && newPage <= totalPages.value) fetchInvoices(newPage)
}

function startEdit(invoice) {
  editInvoice.value = { ...invoice }
  showEditModal.value = true
}

async function saveInvoiceEdit() {
  try {
    const updateData = {
      invoice_number: editInvoice.value.invoice_number,
      customer_name: editInvoice.value.customer_name,
      amount: editInvoice.value.amount,
      tax: editInvoice.value.tax,
      issue_date: editInvoice.value.issue_date,
      due_date: editInvoice.value.due_date,
      type: editInvoice.value.type,
      description: editInvoice.value.description,
      category_id: editInvoice.value.category_id
    }

    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', editInvoice.value.id)

    if (error) throw error

    fetchInvoices(page.value)
  } catch (err) {
    console.error('Update failed:', err.message)
  }
  showEditModal.value = false
}

function confirmDelete(id) {
  selectedInvoiceId.value = id
  showDeleteModal.value = true
}

async function deleteInvoice(id) {
  try {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) throw error
    fetchInvoices(page.value)
  } catch (err) {
    console.error('Delete failed:', err.message)
  }
  showDeleteModal.value = false
}

function openModal(id) {
  const urls = attachments.value[id]
  if (urls && urls.length) {
    currentImage.value = urls[0]
    modalOpen.value = true
  }
}

onMounted(() => {
  loadCategories()
  fetchInvoices(1)
})
</script>