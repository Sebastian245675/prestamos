import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ijjskcroggxijvxronqy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqanNrY3JvZ2d4aWp2eHJvbnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzg3OTUsImV4cCI6MjA3Nzg1NDc5NX0.kkCahgRngrFueyVQMxSgfWd_74014Ytb931WX8qC758'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
