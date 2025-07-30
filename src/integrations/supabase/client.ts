import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxgesjjnqoosuzzdrpdm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4Z2VzampucW9vc3V6emRycGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxOTgyNTAsImV4cCI6MjA1Mzc3NDI1MH0.fEpBWr900yfxlZ3kIkcKgXEdlPlTEatWwViF8DNbyZo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)