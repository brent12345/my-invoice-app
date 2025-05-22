<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Create New Invoice</h2>

      <!-- Invoice Form -->
      <form v-if="!promptAddAnother" @submit.prevent="onSubmit" class="space-y-5">
        <!-- Category -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select
            v-model="category"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled>Select category</option>
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat['Category Types']"
            >
              {{ cat['Category Types'] }}
            </option>
          </select>
          <p class="text-sm text-red-600 mt-1">{{ errors.category }}</p>
        </div>

        <!-- Invoice Name -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="Invoice title"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <!-- Amount -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
          <input
            v-model="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.amount }}</p>
        </div>

        <!-- Tax -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tax Charged</label>
          <input
            v-model="tax"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.tax }}</p>
        </div>

        <!-- Date -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Date</label>
          <input
            v-model="date"
            type="date"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.date }}</p>
        </div>

        <!-- Debit/Credit -->
        <div>
          <span class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Type</span>
          <label class="inline-flex items-center mr-4">
            <input type="radio" value="debit" v-model="type" class="form-radio text-blue-600" />
            <span class="ml-2 text-gray-700 dark:text-gray-300">Debit</span>
          </label>
          <label class="inline-flex items-center">
            <input type="radio" value="credit" v-model="type" class="form-radio text-blue-600" />
            <span class="ml-2 text-gray-700 dark:text-gray-300">Credit</span>
          </label>
          <p class="text-sm text-red-600 mt-1">{{ errors.type }}</p>
        </div>

        <!-- Description -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            v-model="description"
            rows="3"
            placeholder="Details about this invoice"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          ></textarea>
          <p class="text-sm text-red-600 mt-1">{{ errors.description }}</p>
        </div>

        <!-- Attachments -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Attach Receipts</label>
          <input
            type="file"
            multiple
            @change="onFileChange"
            class="w-full text-gray-700 dark:text-gray-200"
          />
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create Invoice
        </button>
      </form>

      <!-- Success Prompt -->
      <div v-else class="space-y-4 text-center">
        <p class="text-lg font-semibold text-green-600">{{ success }}</p>
        <p>Would you like to input another invoice?</p>
        <div class="flex justify-center space-x-4">
          <button
            @click="handleAddAnother"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Yes
          </button>
          <button
            @click="handleDone"
            class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400"
          >
            No
          </button>
        </div>
      </div>

      <!-- Server Error -->
      <p v-if="serverError" class="mt-4 text-red-600">{{ serverError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const success = ref('')
const serverError = ref('')
const promptAddAnother = ref(false)
const categories = ref([])
const filesToUpload = ref([])

const router = useRouter()

// Validation schema
const schema = yup.object({
  category: yup.string().required('Category is required'),
  name: yup.string().required('Invoice name is required'),
  amount: yup.number().typeError('Amount must be a number').min(0, 'Cannot be negative').required('Amount is required'),
  tax: yup.number().typeError('Tax must be a number').min(0, 'Cannot be negative').required('Tax is required'),
  date: yup.date().typeError('Valid date is required').required('Date is required'),
  type: yup.string().oneOf(['debit','credit'], 'Select debit or credit').required('Type is required'),
  description: yup.string().required('Description is required')
})

const { handleSubmit, errors, resetForm } = useForm({ validationSchema: schema })
const { value: category } = useField('category')
const { value: name } = useField('name')
const { value: amount } = useField('amount')
const { value: tax } = useField('tax')
const { value: date } = useField('date')
const { value: type } = useField('type')
const { value: description } = useField('description')

// Load categories
async function loadCategories() {
  const { data, error } = await supabase
    .from('Categories')
    .select('id, "Category Types"')
    .order('"Category Types"', { ascending: true })
  if (error) console.error('Error loading categories:', error.message)
  else categories.value = data || []
}

// Handle file input change
function onFileChange(e) {
  filesToUpload.value = Array.from(e.target.files)
}

onMounted(loadCategories)

// Submit handler with attachments
const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''
  success.value = ''

  // 1) Insert invoice and get its ID
  const { data: newInvoice, error: invError } = await supabase
    .from('invoices')
    .insert([{ ...values }])
    .select()
    .single()

  if (invError || !newInvoice) {
    console.error('Insert error:', invError)
    serverError.value = invError?.message || 'Failed to create invoice.'
    return
  }
  const invoiceId = newInvoice.id

  // 2) Upload attachments
  for (const file of filesToUpload.value) {
    const path = `invoices/${invoiceId}/${Date.now()}_${file.name}`
    const { error: upErr } = await supabase
      .storage
      .from('invoice-attachments')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (upErr) {
      console.error('Upload error', upErr.message)
      continue
    }
    const { error: metaErr } = await supabase
      .from('invoice_attachments')
      .insert([{ invoice_id: invoiceId, filename: file.name, path }])
    if (metaErr) console.error('Metadata insert error', metaErr.message)
  }

  success.value = 'Invoice created successfully!'
  promptAddAnother.value = true
  filesToUpload.value = []
})

// Reset form for another invoice
function handleAddAnother() {
  resetForm()
  success.value = ''
  serverError.value = ''
  promptAddAnother.value = false
}

// Navigate away when done
function handleDone() {
  router.push('/dashboard')
}
</script>






