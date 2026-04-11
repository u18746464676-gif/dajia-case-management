import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hsfovbgeeqomtvaegfqb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZm92YmdlZXFvbXR2YWVnZnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MTMxNzcsImV4cCI6MjA5MTQ4OTE3N30.Fs22pIQ2rTWoyvGqNG4vTKqoPjWk8gQzmaha7r9VOd0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
