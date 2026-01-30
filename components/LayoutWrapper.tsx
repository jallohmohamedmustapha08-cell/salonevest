"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LayoutWrapper({
    children,
    user,
}: {
    children: React.ReactNode;
    user: any;
}) {
    const pathname = usePathname();

    // Only hide main navbar for the Admin panel which has its own Sidebar
    const hideNavbarRoutes = ["/admin"];
    const shouldHideNavbar = hideNavbarRoutes.some((route) => pathname?.startsWith(route));

    if (shouldHideNavbar) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar user={user} />
            <main className="pt-20">
                {children}
            </main>
        </>
    );
}
