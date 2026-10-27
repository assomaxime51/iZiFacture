import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthenticatedUser, getOwnedEntrepriseIds, isAuthenticated } from '@/lib/api-auth'

// GET - Récupérer un client spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const ownedEntrepriseIds = await getOwnedEntrepriseIds(auth.user.id)
    const resolvedParams = await params
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select(`
        *,
        factures (*)
      `)
      .eq('id', resolvedParams.id)
      .in('entreprise_id', ownedEntrepriseIds)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Erreur API clients [id] GET:', error)
    return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
  }
}

// PUT - Mettre à jour un client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const ownedEntrepriseIds = await getOwnedEntrepriseIds(auth.user.id)
    const resolvedParams = await params
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update({
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        type: body.type || 'entreprise',
        notes: body.notes || null,
      })
      .eq('id', resolvedParams.id)
      .in('entreprise_id', ownedEntrepriseIds)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Erreur API clients [id] PUT:', error)
    return NextResponse.json({ error: error.message || 'Erreur lors de la mise à jour du client' }, { status: 500 })
  }
}

// DELETE - Supprimer un client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const ownedEntrepriseIds = await getOwnedEntrepriseIds(auth.user.id)
    const resolvedParams = await params
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', resolvedParams.id)
      .in('entreprise_id', ownedEntrepriseIds)

    if (error) throw error

    return NextResponse.json({ message: 'Client supprimé avec succès' })
  } catch (error: any) {
    console.error('Erreur API clients [id] DELETE:', error)
    return NextResponse.json({ error: error.message || 'Erreur lors de la suppression du client' }, { status: 500 })
  }
}
