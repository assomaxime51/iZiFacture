import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthenticatedUser, getOwnedEntrepriseIds, isAuthenticated } from '@/lib/api-auth'

// GET - Récupérer tous les clients
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const ownedEntrepriseIds = await getOwnedEntrepriseIds(auth.user.id)
    if (ownedEntrepriseIds.length === 0) return NextResponse.json({ data: [] })
    const { searchParams } = new URL(request.url)
    const entrepriseId = searchParams.get('entreprise_id')

    let query = supabaseAdmin
      .from('clients')
      .select(`
        *,
        factures (id, amount, total_amount, status)
      `)
      .order('created_at', { ascending: false })
      .in('entreprise_id', ownedEntrepriseIds)

    if (entrepriseId && entrepriseId !== 'all') {
      if (!ownedEntrepriseIds.includes(entrepriseId)) {
        return NextResponse.json({ error: 'Entreprise non autorisée' }, { status: 403 })
      }
      query = query.eq('entreprise_id', entrepriseId)
    }

    const { data, error } = await query

    if (error) throw error

    // Formater avec le nombre de factures et le total dépensé
    const formattedClients = (data || []).map((client: any) => {
      const clientFactures = client.factures || []
      const invoiceCount = clientFactures.length
      const totalAmount = clientFactures.reduce((sum: number, f: any) => sum + Number(f.total_amount || 0), 0)

      return {
        id: client.id,
        entreprise_id: client.entreprise_id,
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        type: client.type || 'entreprise',
        notes: client.notes || '',
        invoices: invoiceCount,
        total: totalAmount,
        created_at: client.created_at,
        updated_at: client.updated_at,
      }
    })

    return NextResponse.json({ data: formattedClients })
  } catch (error: any) {
    console.error('Erreur API clients GET:', error)
    return NextResponse.json({ error: error.message || 'Erreur lors de la récupération des clients' }, { status: 500 })
  }
}

// POST - Créer un nouveau client
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const ownedEntrepriseIds = await getOwnedEntrepriseIds(auth.user.id)
    const body = await request.json()
    const providedEntrepriseId = typeof body?.entreprise_id === 'string' ? body.entreprise_id.trim() : ''
    const entrepriseId = providedEntrepriseId || (ownedEntrepriseIds.length === 1 ? ownedEntrepriseIds[0] : '')

    if (!entrepriseId) {
      return NextResponse.json({ error: 'Aucune entreprise active trouvée pour associer ce client' }, { status: 400 })
    }

    if (!ownedEntrepriseIds.includes(entrepriseId)) {
      return NextResponse.json({ error: 'Entreprise non autorisée pour ce client' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({
        entreprise_id: entrepriseId,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        type: body.type || 'entreprise',
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      data: {
        ...data,
        invoices: 0,
        total: 0,
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erreur API clients POST:', error)
    return NextResponse.json({ error: error.message || 'Erreur lors de la création du client' }, { status: 500 })
  }
}
