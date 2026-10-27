import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthenticatedUser, getOwnedEntrepriseIds, isAuthenticated } from '@/lib/api-auth'

// GET - Récupérer toutes les factures
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const ownedEntrepriseIds = await getOwnedEntrepriseIds(auth.user.id)
    if (ownedEntrepriseIds.length === 0) return NextResponse.json({ data: [] })
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('client_id')
    const entrepriseId = searchParams.get('entreprise_id')

    let query = supabaseAdmin
      .from('factures')
      .select(`
        *,
        clients:client_id (name, email),
        lignes_facture (*)
      `)
      .order('date', { ascending: false })
      .in('entreprise_id', ownedEntrepriseIds)

    if (status && status !== 'Tous') {
      query = query.eq('status', status)
    }

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (entrepriseId) {
      if (!ownedEntrepriseIds.includes(entrepriseId)) {
        return NextResponse.json({ error: 'Entreprise non autorisée' }, { status: 403 })
      }
      query = query.eq('entreprise_id', entrepriseId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error('Erreur API factures GET:', error)
    return NextResponse.json({ error: error.message || 'Erreur lors de la récupération des factures' }, { status: 500 })
  }
}

// POST - Créer une nouvelle facture
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!isAuthenticated(auth)) return auth.response
    const ownedEntrepriseIds = await getOwnedEntrepriseIds(auth.user.id)
    const body = await request.json()
    const providedEntrepriseId = typeof body?.entreprise_id === 'string' ? body.entreprise_id.trim() : ''
    const entrepriseId = providedEntrepriseId || (ownedEntrepriseIds.length === 1 ? ownedEntrepriseIds[0] : '')

    if (!entrepriseId) {
      return NextResponse.json({ error: 'Aucune entreprise active trouvée pour lier la facture. Sélectionnez un espace de travail ou créez-le.' }, { status: 400 })
    }

    if (!ownedEntrepriseIds.includes(entrepriseId)) {
      return NextResponse.json({ error: 'Entreprise non autorisée pour cette facture' }, { status: 403 })
    }

    if (!body.client_id) {
      return NextResponse.json({ error: 'Aucun client sélectionné pour la facture' }, { status: 400 })
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('id', body.client_id)
      .eq('entreprise_id', entrepriseId)
      .maybeSingle()
    if (clientError) throw clientError
    if (!client) {
      return NextResponse.json({ error: 'Client non autorisé pour cette entreprise' }, { status: 403 })
    }

    // Calculs financiers
    const lines = body.lines || []
    const subtotal = lines.reduce((sum: number, l: any) => sum + (Number(l.quantity) || 1) * (Number(l.unit_price) || 0), 0)
    const taxAmount = Math.round(subtotal * 0.18)
    const totalAmount = subtotal + taxAmount

    // Générer un numéro de facture unique si non fourni
    const countRes = await supabaseAdmin
      .from('factures')
      .select('number', { count: 'exact', head: true })
      .eq('entreprise_id', entrepriseId)
    const baseCount = (countRes.count || 0) + 1
    const baseNumber = (body.number || `FAC-${new Date().getFullYear()}-${String(baseCount).padStart(4, '0')}`).trim()

    let invoiceNumber = baseNumber
    let suffix = 1
    while (true) {
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('factures')
        .select('id')
        .eq('number', invoiceNumber)
        .maybeSingle()

      if (existingError) throw existingError
      if (!existing) break

      const nextCount = baseCount + suffix
      invoiceNumber = `${baseNumber.replace(/\d+$/, '')}${String(nextCount).padStart(4, '0')}`
      suffix += 1
    }
    
    // Créer la facture avec les montants calculés explicitement pour éviter
    // les déclencheurs DB qui attendent les colonnes amount / tax_amount / total_amount.
    const { data: facture, error: factureError } = await supabaseAdmin
      .from('factures')
      .insert({
        entreprise_id: entrepriseId,
        client_id: body.client_id,
        number: invoiceNumber,
        date: body.date || new Date().toISOString().split('T')[0],
        due_date: body.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: body.status || 'Brouillon',
        notes: body.notes || null,
      })
      .select()
      .single()

    if (factureError) throw factureError

    // Ajouter les lignes de facture
    if (lines.length > 0) {
      const lignes = lines.map((line: any) => ({
        facture_id: facture.id,
        description: line.description || 'Article',
        quantity: Number(line.quantity) || 1,
        unit_price: Number(line.unit_price) || 0,
        line_total: (Number(line.quantity) || 1) * (Number(line.unit_price) || 0)
      }))

      const { error: lignesError } = await supabaseAdmin
        .from('lignes_facture')
        .insert(lignes)

      if (lignesError) throw lignesError
    }

    // Récupérer la facture complète avec les lignes et client
    const { data: completeFacture, error: fetchError } = await supabaseAdmin
      .from('factures')
      .select(`
        *,
        clients:client_id (name, email),
        lignes_facture (*)
      `)
      .eq('id', facture.id)
      .single()

    if (fetchError) throw fetchError

    return NextResponse.json({ data: completeFacture }, { status: 201 })
  } catch (error: any) {
    console.error('Erreur API factures POST:', error)
    return NextResponse.json({ error: error.message || 'Erreur lors de la création de la facture' }, { status: 500 })
  }
}
