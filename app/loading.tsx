export default function Loading() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 z-[9999] relative">
            <div className="scale-150 transform">
                <LogoLoader size={120} />
            </div>
            <h2 className="mt-8 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 animate-pulse">
                Loading SaloneVest...
            </h2>
        </div>
    );
}

import LogoLoader from "@/components/ui/LogoLoader";
