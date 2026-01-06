// import { createBrowserClient } from '@supabase/ssr'

// export const supabase = createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// )





import { createBrowserClient } from '@supabase/ssr'

// 1. Create the client instance like you had before (for your existing logic)
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 2. Add this export function (this is what Vercel was complaining about)
// It simply returns the same client we just created.
export const createClient = () => supabase




