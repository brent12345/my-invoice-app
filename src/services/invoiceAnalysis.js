import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY,  // ensure this is set in your .env
})

/**
 * Fetches invoices from your Supabase Edge Function.
 * @param {Object} filters
 * @param {string} [filters.fromDate]  // 'YYYY-MM-DD'
 * @param {string} [filters.toDate]
 * @param {string} [filters.type]      // 'debit' or 'credit'
 * @param {string} [filters.category]  // e.g. 'Office'
 * @param {string} [filters.search]    // substring search on name
 * @returns {Promise<Array>}           // resolves to array of invoice objects
 */
export async function fetchInvoicesWithEdge(filters) {
  const { data, error } = await supabase
    .functions
    .invoke('smooth-handler', {
      body: JSON.stringify(filters),
    })

  if (error) {
    console.error('Edge invocation error:', error)
    throw error
  }

  // Expect your function to return: { invoices: [...] }
  return data.invoices
}

/**
 * Fetches invoices via your Edge Function, then asks ChatGPT to analyze them.
 * @param {Object} filters
 * @param {Function} setResult  Callback that receives the GPT analysis string
 */
export async function invokeInvoiceAnalysis(filters, setResult) {
  try {
    // 1) Fetch raw invoice data
    const invoices = await fetchInvoicesWithEdge(filters)

    // 2) Send data to ChatGPT via function call pattern
    // First, tell GPT we want it to call a function:
    const chatRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an invoice analyst.' },
        { role: 'user', content: 'Please analyze these invoices:' },
      ],
      functions: [
        {
          name: 'get_invoices',
          description: 'Returns a list of invoices for analysis',
          parameters: {
            type: 'object',
            properties: {
              invoices: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id:        { type: 'number' },
                    category:  { type: 'string' },
                    name:      { type: 'string' },
                    amount:    { type: 'number' },
                    tax:       { type: 'number' },
                    date:      { type: 'string', format: 'date' },
                    type:      { type: 'string' },
                    description:{ type: 'string' },
                  },
                  required: ['id','category','name','amount','tax','date','type','description']
                }
              }
            },
            required: ['invoices']
          }
        }
      ],
      function_call: {
        name: 'get_invoices',
        arguments: JSON.stringify({ invoices })
      }
    })

    // 3) Extract the function call from GPT and give it back its own data
    const fnCall = chatRes.choices[0].message.function_call
    const finalRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        ...chatRes.choices.map(c => c.message),
        // echo back the invoices so GPT can analyze them
        {
          role: 'function',
          name: fnCall.name,
          content: fnCall.arguments
        },
        { role: 'user', content: 'Now please provide your analysis.' }
      ]
    })

    // 4) Deliver the analysis to your caller
    const analysisText = finalRes.choices[0].message.content
    setResult(analysisText)

  } catch (err) {
    console.error('Error in invokeInvoiceAnalysis:', err)
    setResult(`❌ Analysis failed: ${err.message}`)
  }
}