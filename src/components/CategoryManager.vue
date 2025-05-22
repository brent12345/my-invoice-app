<template>
  <div>
    <!-- Button to open modal -->
    <button @click="showModal = true"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
      Manage Categories
    </button>

    <!-- Modal backdrop -->
    <transition name="fade">
      <div v-if="showModal"
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <!-- Modal content -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
          <!-- Close button -->
          <button @click="closeModal"
                  class="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            ✕
          </button>

          <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Manage Categories</h2>

          <!-- Success/Error Message -->
          <div v-if="message"
               :class="['p-2 mb-4 rounded', messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
            {{ message }}
          </div>

          <!-- Add new category form -->
          <div class="flex space-x-2 mb-4">
            <input v-model="newCategory"
                   type="text"
                   placeholder="New category"
                   class="flex-1 px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button @click="addCategory"
                    :disabled="adding"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {{ adding ? 'Adding...' : 'Add' }}
            </button>
          </div>

          <!-- List existing categories -->
          <ul class="max-h-60 overflow-y-auto mb-2">
            <li v-for="cat in categories" :key="cat.id" class="flex items-center justify-between py-2 border-b dark:border-gray-700">
              <span class="text-gray-800 dark:text-gray-200">{{ cat['Category Types'] }}</span>
              <button @click="removeCategory(cat.id)"
                      :disabled="deletingId === cat.id"
                      class="text-red-600 hover:text-red-800 disabled:opacity-50">
                {{ deletingId === cat.id ? 'Removing...' : 'Remove' }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const showModal = ref(false)
const categories = ref([])
const newCategory = ref('')
const adding = ref(false)
const deletingId = ref(null)
const message = ref('')
const messageType = ref('')  // 'success' or 'error'

// Fetch categories from the "Categories" table
async function fetchCategories() {
  message.value = ''
  const { data, error } = await supabase
    .from('Categories')
    .select('id, "Category Types"')
    .order('"Category Types"', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error.message)
    message.value = 'Failed to load categories.'
    messageType.value = 'error'
  } else {
    categories.value = data || []
  }
}

// Add a new category
async function addCategory() {
  if (!newCategory.value.trim()) return
  adding.value = true
  message.value = ''

  const { error } = await supabase
    .from('Categories')
    .insert([{ "Category Types": newCategory.value.trim() }])

  if (error) {
    console.error('Error adding category:', error.message)
    message.value = 'Failed to add category.'
    messageType.value = 'error'
  } else {
    message.value = 'Category added successfully.'
    messageType.value = 'success'
    newCategory.value = ''
    fetchCategories()
  }
  adding.value = false
}

// Remove a category by id
async function removeCategory(id) {
  deletingId.value = id
  message.value = ''

  const { error } = await supabase
    .from('Categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error removing category:', error.message)
    message.value = 'Failed to remove category.'
    messageType.value = 'error'
  } else {
    message.value = 'Category removed successfully.'
    messageType.value = 'success'
    fetchCategories()
  }
  deletingId.value = null
}

// Close modal and reset input/message
function closeModal() {
  showModal.value = false
  newCategory.value = ''
  message.value = ''
}

onMounted(fetchCategories)
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
