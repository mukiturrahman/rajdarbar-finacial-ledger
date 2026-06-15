import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!client) {
    client = createBrowserClient(
      env.supabaseUrl,
      env.supabaseAnonKey
    )
  }
  return client
}
