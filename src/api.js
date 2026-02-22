import { supabase } from './supabaseClient'

// ============================================================
// AUTH
// ============================================================
export async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({ email, password })
}
export async function signOut() { return await supabase.auth.signOut() }
export function onAuthChange(cb) { return supabase.auth.onAuthStateChange(cb) }
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
export async function getClientProfile(authUserId) {
  return await supabase.from('clients').select('*').eq('auth_user_id', authUserId).single()
}

// ============================================================
// TARIFF MANAGEMENT
// ============================================================

// Get next version code
export async function nextTariffCode() {
  const { data, error } = await supabase.rpc('next_tariff_code')
  return { data, error }
}

// Save tariff as draft
export async function saveTariffDraft(tariff) {
  const payload = {
    version_code: tariff.version_code,
    name: tariff.name || '',
    status: 'draft',
    params: tariff.params,
    product_prices: tariff.product_prices,
    material_costs: tariff.material_costs,
    notes: tariff.notes || '',
    updated_at: new Date().toISOString(),
  }

  // If has id, update; otherwise insert
  if (tariff.id) {
    return await supabase.from('tariffs').update(payload).eq('id', tariff.id).select().single()
  } else {
    return await supabase.from('tariffs').insert(payload).select().single()
  }
}

// Approve tariff
export async function approveTariff(tariffId, approvedBy) {
  return await supabase.from('tariffs').update({
    status: 'approved',
    approved_by: approvedBy,
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', tariffId).select().single()
}

// Publish tariff with date
export async function publishTariff(tariffId, publishDate) {
  // Archive any currently published tariff
  await supabase.from('tariffs')
    .update({ status: 'archived', archived_at: new Date().toISOString() })
    .eq('status', 'published')

  return await supabase.from('tariffs').update({
    status: 'published',
    published_at: publishDate || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', tariffId).select().single()
}

// List all tariffs
export async function listTariffs() {
  const { data, error } = await supabase.from('tariffs')
    .select('id, version_code, name, status, params, approved_at, published_at, created_at, notes')
    .order('created_at', { ascending: false })
  return { data, error }
}

// Get full tariff by id
export async function getTariff(tariffId) {
  return await supabase.from('tariffs').select('*').eq('id', tariffId).single()
}

// Get active published tariff (for client app)
export async function getActiveTariff() {
  const { data, error } = await supabase.from('tariffs')
    .select('*')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(1)
    .single()
  return { data, error }
}

// Delete draft tariff
export async function deleteTariff(tariffId) {
  return await supabase.from('tariffs').delete().eq('id', tariffId).eq('status', 'draft')
}

// Sync approved prices to products table (base_price update)
export async function syncToProducts(productPrices) {
  const results = { success: 0, errors: [] }
  for (const pp of productPrices) {
    if (!pp.horeca_r) continue
    const { error } = await supabase.from('products')
      .update({ base_price: pp.horeca_si || pp.horeca_r })
      .eq('id', pp.id)
    if (error) results.errors.push({ id: pp.id, error: error.message })
    else results.success++
  }
  return results
}
