import { createClient } from '@supabase/supabase-js'

const fallbackSupabaseUrl = 'https://gmndxotsfnbxwohkalkz.supabase.co'
const fallbackSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbmR4b3RzZm5ieHdvaGthbGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTQ4OTksImV4cCI6MjEwNDg5MDg5OX0.o9Y3Y5DsSZJ49YkpiNCAby0x1R3wYdaUTUHBY9JQc4o'
const fallbackSupabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbmR4b3RzZm5ieHdvaGthbGt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTMxNDg5OSwiZXhwIjoyMTA0ODkwODk5fQ.xf5td_QIqPrAnsXiQ6eRVPgG-MoTAZEj0kXCGHQ5BRM'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackSupabaseUrl
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackSupabaseAnonKey
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackSupabaseServiceKey

const globalSupabase = globalThis as typeof globalThis & {
  __izifactureSupabase?: ReturnType<typeof createClient>
  __izifactureSupabaseAdmin?: ReturnType<typeof createClient>
}

if (typeof window === 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
  console.warn('Variables Supabase manquantes dans l’environnement courant ; utilisation des valeurs de secours du projet pour éviter un crash de démarrage.')
}

export const supabase =
  globalSupabase.__izifactureSupabase ??
  (globalSupabase.__izifactureSupabase = createClient(supabaseUrl, supabaseAnonKey))

export const supabaseAdmin =
  globalSupabase.__izifactureSupabaseAdmin ??
  (globalSupabase.__izifactureSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey))

// Types pour les tables Supabase
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      entreprises: {
        Row: {
          id: string
          user_id: string
          name: string
          logo_url: string | null
          address: string | null
          phone: string | null
          email: string | null
          siret: string | null
          tva_number: string | null
          default_payment_terms: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          siret?: string | null
          tva_number?: string | null
          default_payment_terms?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          siret?: string | null
          tva_number?: string | null
          default_payment_terms?: number
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          entreprise_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          type: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entreprise_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          type?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entreprise_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          type?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      factures: {
        Row: {
          id: string
          entreprise_id: string
          client_id: string
          number: string
          date: string
          due_date: string
          amount: number
          tax_amount: number
          total_amount: number
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entreprise_id: string
          client_id: string
          number: string
          date: string
          due_date: string
          amount?: number
          tax_amount?: number
          total_amount?: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entreprise_id?: string
          client_id?: string
          number?: string
          date?: string
          due_date?: string
          amount?: number
          tax_amount?: number
          total_amount?: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lignes_facture: {
        Row: {
          id: string
          facture_id: string
          description: string
          quantity: number
          unit_price: number
          line_total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          facture_id: string
          description: string
          quantity?: number
          unit_price?: number
          line_total?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          facture_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          line_total?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}