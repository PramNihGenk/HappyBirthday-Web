import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function fetchWishes(recipientId) {
  if (!supabase || !recipientId) return []

  const { data, error } = await supabase
    .from('wishes')
    .select('id, recipient_id, sender_name, message, created_at')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }
  return data || []
}

export async function createWish({ recipientId, senderName, message }) {
  if (!supabase) {
    throw new Error('Supabase belum dikonfigurasi')
  }

  const { data, error } = await supabase
    .from('wishes')
    .insert([
      {
        recipient_id: recipientId,
        sender_name: senderName.trim(),
        message: message.trim(),
      },
    ])
    .select('id, recipient_id, sender_name, message, created_at')
    .single()

  if (error) {
    throw error
  }
  return data
}
