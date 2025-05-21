import { serve } from 'https://deno.land/x/sift@0.5.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'  // ← import

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE')!
)

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  // Parse filters (empty on GET/Test)
  let filters = {}
  if (req.method === 'POST') {
    try { filters = await req.json() } 
    catch { /* no JSON body */ }
  }

  // Build query
  let q = supabase.from('invoices').select('*')
  for (const [k, v] of Object.entries(filters)) {
    if (v) q = q[k === 'search' ? 'ilike' : 'eq'](k, 
          k === 'search' ? `%${v}%` : v)
  }
  const { data: invoices, error } = await q.order('date', { ascending: true })

  // Error?
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }

  // Success
  return new Response(JSON.stringify({ invoices }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  })
})

