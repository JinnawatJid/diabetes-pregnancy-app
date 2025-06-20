import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          patient_number: string
          username: string
          age: number
          gestational_age: number
          weight_before: number
          height: number
          bmi: number | null
          bmi_category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_number?: string
          username: string
          age: number
          gestational_age: number
          weight_before: number
          height: number
          bmi?: number | null
          bmi_category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_number?: string
          username?: string
          age?: number
          gestational_age?: number
          weight_before?: number
          height?: number
          bmi?: number | null
          bmi_category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 