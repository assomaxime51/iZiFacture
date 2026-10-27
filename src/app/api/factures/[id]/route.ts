import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthenticatedUser, getOwnedEntrepriseIds, isAuthenticated } from '@/lib/api-auth'

// GET - Récupérer une facture spécifique par ID ou par Numéro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const ownedEntrepriseIds = await getOwnedEntrepriseIds(auth.user.id)
    const resolvedParams = await params
    const idOrNumber = decodeURIComponent(resolvedParams.id)

    // Chercher d'abord par id (si c'est un UUID) sinon par number
    let query = supabaseAdmin
      .from('factures')
      .select(`
        *,
        clients:client_id (name, email, phone, address),
        lignes_facture (*)
      `)
      .in('entreprise_id', ownedEntrepriseIds)

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber)
    if (isUUID) {
      query = query.or(`id.eq.${idOrNumber},number.eq.${idOrNumber}`)
    } else {
      query = query.eq('number', idOrNumber)
    }

    const { data, error } = await query.limit(1).maybeSingle()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Erreur API factures [id] GET:', error)
    return NextResponse.json({ error: error.message || 'Facture non trouvée' }, { status: 404 })
  }
}

// PUT - Mettre à jour une facture
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const ownedEntrepriseIds = await getOwnedEntrepriseIds(auth.user.id)
    const resolvedParams = await params
    const idOrNumber = decodeURIComponent(resolvedParams.id)
    const body = await request.json()

    // Retrouver la facture pour obtenir son vrai id UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber)
    let findQuery = supabaseAdmin.from('factures').select('id, amount, tax_amount, total_amount, entreprise_id').in('entreprise_id', ownedEntrepriseIds)
    if (isUUID) {
      findQuery = findQuery.or(`id.eq.${idOrNumber},number.eq.${idOrNumber}`)
    } else {
      findQuery = findQuery.eq('number', idOrNumber)
    }
    const { data: targetFacture } = await findQuery.limit(1).maybeSingle()
    if (!targetFacture) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }
    const factureId = targetFacture.id

    if (body.client_id) {
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('id', body.client_id)
        .eq('entreprise_id', targetFacture.entreprise_id)
        .maybeSingle()
      if (clientError) throw clientError
      if (!client) return NextResponse.json({ error: 'Client non autorisé pour cette entreprise' }, { status: 403 })
    }

    // Mise à jour des lignes et recalcul si body.lines est fourni
    let amount = targetFacture?.amount
    let taxAmount = targetFacture?.tax_amount
    let totalAmount = targetFacture?.total_amount

    if (body.lines) {
      const subtotal = body.lines.reduce((sum: number, l: any) => sum + (Number(l.quantity) || 1) * (Number(l.unit_price) || 0), 0)
      amount = subtotal
      taxAmount = Math.round(subtotal * 0.18)
      totalAmount = subtotal + taxAmount

      // Remplacer les lignes
      await supabaseAdmin.from('lignes_facture').delete().eq('facture_id', factureId)
      if (body.lines.length > 0) {
        const lignes = body.lines.map((l: any) => ({
          facture_id: factureId,
          description: l.description || 'Article',
          quantity: Number(l.quantity) || 1,
          unit_price: Number(l.unit_price) || 0,
          line_total: (Number(l.quantity) || 1) * (Number(l.unit_price) || 0)
        }))
        await supabaseAdmin.from('lignes_facture').insert(lignes)
      }
    }

    if (body.client_id) {
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('id', body.client_id)
        .eq('entreprise_id', targetFacture.entreprise_id)
        .maybeSingle()
      if (clientError) throw clientError
      if (!client) return NextResponse.json({ error: 'Client non autorisé pour cette entreprise' }, { status: 403 })
    }

    const updatePayload: any = {}
    if (body.client_id) updatePayload.client_id = body.client_id
    if (body.date) updatePayload.date = body.date
    if (body.due_date) updatePayload.due_date = body.due_date
    if (body.status) updatePayload.status = body.status
    if (body.notes !== undefined) updatePayload.notes = body.notes
    if (amount !== undefined) updatePayload.amount = amount
    if (taxAmount !== undefined) updatePayload.tax_amount = taxAmount
    if (totalAmount !== undefined) updatePayload.total_amount = totalAmount

    const { data: facture, error: factureError } = await supabaseAdmin
      .from('factures')
      .update(updatePayload)
      .eq('id', factureId)
      .in('entreprise_id', ownedEntrepriseIds)
      .select(`
        *,
        clients:client_id (name, email),
        lignes_facture (*)
      `)
      .single()

    if (factureError) throw factureError

    return NextResponse.json({ data: facture })
  } catch (error: any) {
    console.error('Erreur API factures [id] PUT:', error)
    return NextResponse.json({ error: error.message || 'Erreur lors de la mise à jour de la facture' }, { status: 500 })
  }
}

// DELETE - Supprimer une facture
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const ownedEntrepriseIds = await getOwnedEntrepriseIds(auth.user.id)
    const resolvedParams = await params
    const idOrNumber = decodeURIComponent(resolvedParams.id)

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber)
    let query = supabaseAdmin.from('factures').delete().in('entreprise_id', ownedEntrepriseIds)
    if (isUUID) {
      query = query.or(`id.eq.${idOrNumber},number.eq.${idOrNumber}`)
    } else {
      query = query.eq('number', idOrNumber)
    }

    const { error } = await query

    if (error) throw error

    return NextResponse.json({ message: 'Facture supprimée avec succès' })
  } catch (error: any) {
    console.error('Erreur API factures [id] DELETE:', error)
    return NextResponse.json({ error: error.message || 'Erreur lors de la suppression de la facture' }, { status: 500 })
  }
}
