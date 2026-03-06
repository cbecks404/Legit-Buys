import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://guviwpumuctfstivdwba.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dml3cHVtdWN0ZnN0aXZkd2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MjMyMzksImV4cCI6MjA4ODI5OTIzOX0.aENRdypTeYXPB89D4h7e5LphGkfz-DjgpksyieFoX-o'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)