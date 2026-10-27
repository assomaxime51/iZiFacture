// Fonctions utilitaires pour les appels API.
// Les routes vérifient ce jeton avant d'utiliser le client administrateur côté serveur.
import { supabase } from "@/lib/supabase"

async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = new Headers(init.headers)
  if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`)
  return fetch(input, { ...init, headers })
}

async function getErrorMessage(response: Response) {
  try {
    const payload = await response.json()
    return payload?.error || payload?.message || `Erreur HTTP ${response.status}`
  } catch {
    return `Erreur HTTP ${response.status}`
  }
}

export async function fetchClients(entrepriseId?: string) {
  const params = new URLSearchParams()
  if (entrepriseId) params.set("entreprise_id", entrepriseId)
  const response = await apiFetch(`/api/clients?${params.toString()}`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  const data = await response.json()
  return data.data
}

export async function createClient(clientData: any) {
  const response = await apiFetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  const data = await response.json()
  return data.data
}

export async function updateClient(id: string, clientData: any) {
  const response = await apiFetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour du client')
  const data = await response.json()
  return data.data
}

export async function deleteClient(id: string) {
  const response = await apiFetch(`/api/clients/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Erreur lors de la suppression du client')
  return true
}

export async function fetchFacture(idOrNumber: string) {
  const response = await apiFetch(`/api/factures/${encodeURIComponent(idOrNumber)}`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  const data = await response.json()
  return data.data
}

export async function fetchFactures(status?: string, clientId?: string, entrepriseId?: string) {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (clientId) params.append('client_id', clientId)
  if (entrepriseId) params.append('entreprise_id', entrepriseId)
  
  const response = await apiFetch(`/api/factures?${params.toString()}`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  const data = await response.json()
  return data.data
}

export async function createFacture(factureData: any) {
  const response = await apiFetch('/api/factures', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(factureData),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  const data = await response.json()
  return data.data
}

export async function updateFacture(id: string, factureData: any) {
  const response = await apiFetch(`/api/factures/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(factureData),
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour de la facture')
  const data = await response.json()
  return data.data
}

export async function deleteFacture(id: string) {
  const response = await apiFetch(`/api/factures/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Erreur lors de la suppression de la facture')
  return true
}

export async function fetchEntreprises(userId?: string) {
  const params = new URLSearchParams()
  if (userId) params.append('user_id', userId)
  
  const response = await apiFetch(`/api/entreprises?${params.toString()}`)
  if (!response.ok) throw new Error('Erreur lors de la récupération des entreprises')
  const data = await response.json()
  return data.data
}

export async function createEntreprise(entrepriseData: any) {
  const response = await apiFetch('/api/entreprises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entrepriseData),
  })
  if (!response.ok) throw new Error('Erreur lors de la création de l\'entreprise')
  const data = await response.json()
  return data.data
}

export async function updateEntreprise(id: string, entrepriseData: any) {
  const response = await apiFetch(`/api/entreprises/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entrepriseData),
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'entreprise')
  const data = await response.json()
  return data.data
}
