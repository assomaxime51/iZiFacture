import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthenticatedUser, isAuthenticated } from '@/lib/api-auth'

// GET - Récupérer toutes les entreprises
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response

    let query = supabaseAdmin
      .from('entreprises')
      .select('*')
      .order('created_at', { ascending: false })
      .eq('user_id', auth.user.id)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error('Erreur API entreprises GET:', error)
    return NextResponse.json({ error: error.message || 'Erreur lors de la récupération des entreprises' }, { status: 500 })
  }
}

// POST - Créer une nouvelle entreprise
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('entreprises')
      .insert({
        user_id: auth.user.id,
        name: body.name || 'Mon Entreprise',
        logo_url: body.logo_url || null,
        address: body.address || null,
        phone: body.phone || null,
        email: body.email || null,
        siret: body.siret || null,
        tva_number: body.tva_number || null,
        default_payment_terms: body.default_payment_terms || 30,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error('Erreur API entreprises POST:', error)
    return NextResponse.json({ error: error.message || "Erreur lors de la création de l'entreprise" }, { status: 500 })
  }
}
