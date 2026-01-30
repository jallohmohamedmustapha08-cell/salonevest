import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import SupportChatWidget from "@/components/SupportChatWidget";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SaloneVest | Bridge Diaspora Capital to Local Agriculture",
    description: "A dual-sided fintech marketplace bridging Sierra Leonean Diaspora capital and local youth-led agricultural enterprises.",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {

                }
            },
        }
    );

    let user = null;
    try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user = authUser;
    } catch (error) {
        console.warn('RootLayout Auth Error:', error);
        // Proceed as unauthenticated
    }

    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={`${inter.className} bg-[var(--background)] text-[var(--foreground)] antialiased min-h-screen selection:bg-green-500 selection:text-white`}>
                <LayoutWrapper user={user}>
                    {children}
                    <SupportChatWidget />
                </LayoutWrapper>
            </body>
        </html>
    );
}
