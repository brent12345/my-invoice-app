import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://agrzzbpqibouaulrmnzz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncnp6YnBxaWJvdWF1bHJtbnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjIyNzYsImV4cCI6MjA2MzA5ODI3Nn0.09mePDZvmtyW8AlftWjkDsys0HGRm5fRjB43NCnSBQU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)