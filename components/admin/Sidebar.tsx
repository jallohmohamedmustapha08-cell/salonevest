import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    return (
        <aside className="w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col">
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-white tracking-tight">Salone<span className="text-green-500">Admin</span></h1>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
                {["overview", "users", "staff", "projects", "verifications", "withdrawals", "marketplace", "messages", "settings"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-full text-left px-6 py-4 hover:bg-gray-700 transition flex items-center gap-3 ${activeTab === tab ? "bg-gray-700 text-white border-l-4 border-green-500" : "text-gray-400 border-l-4 border-transparent"
                            }`}
                    >
                        <span className="capitalize font-medium">{tab}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">AD</div>
                    <div>
                        <p className="text-white text-sm font-bold">Admin User</p>
                        <p className="text-gray-500 text-xs">Super Admin</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-900/50 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
                >
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
