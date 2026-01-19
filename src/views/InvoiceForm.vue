<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Create New Invoice</h2>

      <!-- Invoice Form -->
      <form v-if="!promptAddAnother" @submit.prevent="onSubmit" class="space-y-5">
        <!-- Category -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>

          <div v-if="categoriesLoading" class="text-gray-500 dark:text-gray-400">Loading categories...</div>
          <div v-else-if="categoriesError" class="text-red-600">
            {{ categoriesError }}
            <button @click="loadCategories" class="ml-2 text-blue-600 underline">
              Retry
            </button>
          </div>
          <select
            v-else
            v-model="category"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled>Select category</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <p class="text-sm text-red-600 mt-1">{{ errors.category }}</p>
        </div>

        <!-- Invoice Number (optional for Credit) -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Invoice Number
            <span v-if="type !== 'credit'" class="text-red-600">*</span>
          </label>
          <input
            v-model="invoice_number"
            type="text"
            placeholder="INV-001"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.invoice_number }}</p>
        </div>

        <!-- Customer Name -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name</label>
          <input
            v-model="customer_name"
            type="text"
            placeholder="John Doe"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.customer_name }}</p>
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

        <!-- Tax Charged (optional for Credit) -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Tax Charged
            <span v-if="type !== 'credit'" class="text-red-600">*</span>
          </label>
          <input
            v-model="tax"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.tax }}</p>
        </div>

        <!-- Invoice Date -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Date</label>
          <input
            v-model="issue_date"
            type="date"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.issue_date }}</p>
        </div>

        <!-- Due Date -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
          <input
            v-model="due_date"
            type="date"
            class="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p class="text-sm text-red-600 mt-1">{{ errors.due_date }}</p>
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
import { ref, onMounted, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const success = ref('')
const serverError = ref('')
const promptAddAnother = ref(false)
const categories = ref([])
const categoriesLoading = ref(false)
const categoriesError = ref('')
const filesToUpload = ref([])

const router = useRouter()

// Base schema
const baseSchema = yup.object({
  category: yup.string().required('Category is required'),
  invoice_number: yup.string().required('Invoice number is required'),
  customer_name: yup.string().nullable(),
  amount: yup.number().typeError('Amount must be a number').min(0, 'Cannot be negative').required('Amount is required'),
  tax: yup.number().typeError('Tax must be a number').min(0, 'Cannot be negative').required('Tax is required'),
  issue_date: yup.date().typeError('Valid date is required').required('Issue date is required'),
  due_date: yup.date().nullable(),
  type: yup.string().oneOf(['debit', 'credit'], 'Select debit or credit').required('Type is required'),
  description: yup.string().nullable()
})

// Reactive schema
const schema = ref(baseSchema)

// All fields defined first
const { handleSubmit, errors, resetForm } = useForm({ validationSchema: schema })
const { value: category } = useField('category')
const { value: invoice_number } = useField('invoice_number')
const { value: customer_name } = useField('customer_name')
const { value: amount } = useField('amount')
const { value: tax } = useField('tax')
const { value: issue_date } = useField('issue_date')
const { value: due_date } = useField('due_date')
const { value: type } = useField('type')
const { value: description } = useField('description')

// Watch type and update schema – now safe after fields are initialized
watch(
  () => type.value,
  (newType) => {
    if (newType === undefined || newType === null) return;

    if (newType === 'credit') {
      schema.value = baseSchema.shape({
        invoice_number: yup.string().nullable(),
        tax: yup.number().typeError('Tax must be a number').min(0, 'Cannot be negative').nullable()
      })
    } else {
      schema.value = baseSchema;
    }
  },
  { immediate: true }
)

// Load categories with loading/error state
async function loadCategories() {
  categoriesLoading.value = true
  categoriesError.value = ''
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error

    categories.value = data || []
  } catch (err) {
    console.error('Error loading categories:', err.message)
    categoriesError.value = 'Failed to load categories: ' + err.message
  } finally {
    categoriesLoading.value = false
  }
}

// Handle file input
function onFileChange(e) {
  filesToUpload.value = Array.from(e.target.files)
}

onMounted(loadCategories)

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''
  success.value = ''

  let finalInvoiceNumber = values.invoice_number
  if (values.type === 'credit' && !finalInvoiceNumber) {
    finalInvoiceNumber = `CREDIT-${Date.now()}`
  }

  const invoiceData = {
    invoice_number: finalInvoiceNumber,
    customer_name: values.customer_name || null,
    amount: values.amount,
    tax: values.tax || null,
    issue_date: values.issue_date,
    due_date: values.due_date || null,
    category_id: parseInt(values.category),
    type: values.type,
    description: values.description || null,
    status: 'pending'
  }

  const { data: newInvoice, error: invError } = await supabase
    .from('invoices')
    .insert([invoiceData])
    .select()
    .single()

  if (invError || !newInvoice) {
    console.error('Insert error:', invError)
    serverError.value = invError?.message || 'Failed to create invoice.'
    return
  }

  const invoiceId = newInvoice.id

  // Attachments upload
  for (const file of filesToUpload.value) {
    const path = `invoices/${invoiceId}/${Date.now()}_${file.name}`

    const { error: upErr } = await supabase.storage
      .from('invoice-attachments')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (upErr) {
      console.error('Upload error:', upErr.message)
      serverError.value = serverError.value || 'File upload failed.'
      continue
    }

    const { error: metaErr } = await supabase
      .from('invoice_attachments')
      .insert([{
        invoice_id: invoiceId,
        file_name: file.name,
        file_path: path,
        mime_type: file.type,
        size: file.size
      }])

    if (metaErr) console.error('Attachment metadata error:', metaErr.message)
  }

  success.value = 'Invoice created successfully!'
  promptAddAnother.value = true
  filesToUpload.value = []
  resetForm()
})

// Reset & Done handlers
function handleAddAnother() {
  success.value = ''
  serverError.value = ''
  promptAddAnother.value = false
  resetForm()
}

function handleDone() {
  router.push('/dashboard')
}
</script>