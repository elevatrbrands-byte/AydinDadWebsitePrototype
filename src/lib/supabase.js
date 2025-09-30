import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && key)
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

export const dal = {
  async getSession() {
    if (!supabase) return { user: null }
    const { data, error } = await supabase.auth.getSession()
    if (error) return { user: null }
    return { user: data?.session?.user || null }
  },
  onAuth(cb) {
    if (!supabase) return () => {}
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session?.user || null))
    return () => { try { data?.subscription?.unsubscribe?.() } catch {} }
  },
  async signInEmailPassword(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.user
  },
  async signInMagicLink(email) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    if (error) throw error
    return data
  },
  async signUpEmailPassword(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
    if (error) throw error
    return data.user
  },
  async signOut() {
    if (!supabase) return; await supabase.auth.signOut()
  },
  async fetchMultipliers() {
    if (!supabase) return { 1:0.2, 2:0.45, 3:0.7, 4:0.9 }
    const { data, error } = await supabase.from('multipliers').select('quality,value')
    if (error || !Array.isArray(data) || data.length === 0) return { 1:0.2, 2:0.45, 3:0.7, 4:0.9 }
    const map = { 1:0.2, 2:0.45, 3:0.7, 4:0.9 }
    for (const row of data) map[Number(row.quality)] = Number(row.value)
    return map
  },
  async upsertMultiplier(quality, value) {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.from('multipliers').upsert({ quality, value })
    if (error) throw error
    return this.fetchMultipliers()
  },
  async fetchModels() {
    if (!supabase) return [
      { id: 'iph13-128', brand: 'Apple', name: 'iPhone 13 (128 GB)', base: 320 },
      { id: 'iph12-64', brand: 'Apple', name: 'iPhone 12 (64 GB)', base: 180 },
      { id: 's21-128', brand: 'Samsung', name: 'Galaxy S21 (128 GB)', base: 170 },
      { id: 'px6-128', brand: 'Google', name: 'Pixel 6 (128 GB)', base: 160 },
    ]
    const { data, error } = await supabase.from('models').select('id,brand,name,base').order('name')
    if (error) return []
    return data
  },
  async upsertModel(model) {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.from('models').upsert(model)
    if (error) throw error
    return this.fetchModels()
  },
  async deleteModel(id) {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.from('models').delete().eq('id', id)
    if (error) throw error
    return this.fetchModels()
  }
}
