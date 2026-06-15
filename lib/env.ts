if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('[startup] Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('[startup] Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}
