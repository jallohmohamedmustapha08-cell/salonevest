import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // "next" is a query param we can pass to redirect to a specific page after login
    const next = searchParams.get("next") ?? "/admin";
    const role = searchParams.get("role");

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return []; // We just need to parse the request cookies, but here we are in a Route Handler
                        // Actually for ssr/createServerClient in Route Handler we need actual cookie handling
                        // But let's use the pattern from Supabase docs for Route Handlers
                    },
                    setAll(cookiesToSet) {
                        // In a Route Handler we modify the response
                    },
                },
            }
        );

        // We need proper cookie handling for the exchange:
        const cookieStore = require("next/headers").cookies;
        const supabaseServer = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore().getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore().set(name, value, options)
                        )
                    },
                },
            }
        )

        const { error } = await supabaseServer.auth.exchangeCodeForSession(code);

        if (!error) {
            // If a role was passed in the URL, updates the user's profile
            if (role) {
                const { data: { user } } = await supabaseServer.auth.getUser();
                if (user) {
                    // Upsert profile with role
                    await supabaseServer.from('profiles').upsert({
                        id: user.id,
                        role: role,
                        email: user.email,
                        full_name: user.user_metadata.full_name,
                        // We don't overwrite other fields if they exist, but upsert might replace. 
                        // Better to update if exists or insert if not. 
                        // Since we want to SET the role on signup, upsert is okay for ID.
                    }, { onConflict: 'id' });

                    // Actually, we should probably just update the role if it's missing or if this is a signup
                    // But since 'profiles' trigger creates a row, we might just be updating it.
                    // However, the trigger MIGHT run before this.
                    // Let's safe-guard:
                    await supabaseServer.from('profiles').update({ role: role }).eq('id', user.id);
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
