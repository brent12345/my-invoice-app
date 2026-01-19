// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl = 'https://ixbssvlbcbwkzhlscqym.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4YnNzdmxiY2J3a3pobHNjcXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzMxMDksImV4cCI6MjA4NDI0OTEwOX0.6BvNT3FimjqNauMmOxte2gbHUIjRYuUBKVFJBj2hsA0'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)


