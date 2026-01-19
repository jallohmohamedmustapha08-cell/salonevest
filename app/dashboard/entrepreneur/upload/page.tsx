import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import ProjectUploadForm from "@/components/entrepreneur/ProjectUploadForm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function ProjectUploadPage() {
    const cookieStore = await cookies();

    // Server Component supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    // Server Action or Middleware handles setting cookies usually
                }
            }
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch User Groups
    const { getUserGroups } = await import("@/app/actions/groups");
    const { groups } = await getUserGroups(user.id);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <header className="mb-10 flex justify-between items-center bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">Start Your Campaign</h1>
                    <p className="text-gray-400 mt-2">Share your vision and attract investment.</p>
                </div>
                <a href="/dashboard/entrepreneur" className="text-gray-400 hover:text-white font-medium transition flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </a>
            </header>

            {/* Form Container */}
            <main>
                <ProjectUploadForm userId={user.id} userGroups={groups || []} />
            </main>
        </div>
    );
}
