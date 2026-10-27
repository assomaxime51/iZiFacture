import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthenticatedUser, isAuthenticated } from '@/lib/api-auth'

// GET - Récupérer une entreprise spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const resolvedParams = await params
    const { data, error } = await supabaseAdmin
      .from('entreprises')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', auth.user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Erreur API entreprises [id] GET:', error)
    return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
  }
}

// PUT - Mettre à jour une entreprise
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const resolvedParams = await params
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('entreprises')
      .update({
        name: body.name,
        logo_url: body.logo_url || null,
        address: body.address || null,
        phone: body.phone || null,
        email: body.email || null,
        siret: body.siret || null,
        tva_number: body.tva_number || null,
        default_payment_terms: body.default_payment_terms || 30,
      })
      .eq('id', resolvedParams.id)
      .eq('user_id', auth.user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Erreur API entreprises [id] PUT:', error)
    return NextResponse.json({ error: error.message || "Erreur lors de la mise à jour de l'entreprise" }, { status: 500 })
  }
}

// DELETE - Supprimer une entreprise
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const resolvedParams = await params
    const { error } = await supabaseAdmin
      .from('entreprises')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', auth.user.id)

    if (error) throw error

    return NextResponse.json({ message: 'Entreprise supprimée avec succès' })
  } catch (error: any) {
    console.error('Erreur API entreprises [id] DELETE:', error)
    return NextResponse.json({ error: error.message || "Erreur lors de la suppression de l'entreprise" }, { status: 500 })
  }
}
