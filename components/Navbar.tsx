"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UserAvatar from "./UserAvatar";

// Simple Icon Components (SVG)
const Icons = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Explore: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
  Leaf: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Message: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>,
  Rocket: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>,
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
};

export default function Navbar({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async (uid: string) => {
      const { data } = await supabase.from('profiles').select('role, avatar_url').eq('id', uid).single();
      if (data) {
        setUserRole(data.role);
        setAvatarUrl(data.avatar_url);
      }
    };

    if (user) fetchProfile(user.id);
    setCurrentUser(user);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setCurrentUser(session?.user);
        if (session?.user) fetchProfile(session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserRole(null);
        setAvatarUrl(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [user]);

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin': return '/admin';
      case 'moderator': return '/dashboard/moderator';
      case 'investor': return '/dashboard/investor';
      case 'entrepreneur': return '/dashboard/entrepreneur';
      case 'staff': return '/dashboard/staff';
      case 'field_agent': return '/dashboard/staff';
      case 'verifier': return '/dashboard/staff';
      default: return '/login'; // Fallback
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  const NavItem = ({ href, icon: Icon, label, primary = false }: any) => (
    <li>
      <Link
        href={href}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-2 py-3 px-4 rounded-xl transition duration-300 ${primary
          ? "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 font-bold"
          : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
      >
        {Icon && <Icon />}
        <span>{label}</span>
      </Link>
    </li>
  );

  return (
    <nav className="fixed w-full z-50 top-0 start-0 glass border-b border-white/5">
      <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse group">
          <div className="w-8 h-8 relative rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition overflow-hidden">
            {/* Logo Image */}
            <img
              src="/logo.png"
              alt="S"
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.classList.add('fallback-mode');
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold hidden fallback-text">S</span>
            <style jsx>{`
                .fallback-mode .fallback-text { display: flex !important; }
             `}</style>
          </div>
          <span className="self-center text-2xl font-bold whitespace-nowrap text-white tracking-tight">
            Salone<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Vest</span>
          </span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-300 rounded-lg md:hidden hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <span className="sr-only">Open main menu</span>
          {isOpen ? <Icons.X /> : <Icons.Menu />}
        </button>

        <div className={`${isOpen ? "block" : "hidden"} w-full md:block md:w-auto mt-4 md:mt-0`}>
          <ul className="font-medium flex flex-col p-4 md:p-0 md:flex-row md:space-x-4 bg-gray-900/90 md:bg-transparent rounded-2xl border border-white/10 md:border-0">
            <NavItem href="/" icon={Icons.Home} label="Home" />
            <NavItem href="/explore" icon={Icons.Explore} label="Explore" />
            <NavItem href="/marketplace" icon={Icons.Cart} label="Marketplace" />
            <NavItem href="/farmers" icon={Icons.Leaf} label="Farmers" />

            {currentUser ? (
              <>
                <div className="w-full h-px bg-white/10 my-2 md:hidden"></div>

                {/* Mobile Profile Header */}
                <div className="md:hidden flex items-center px-4 py-2 gap-3 mb-2">
                  <UserAvatar url={avatarUrl} size={40} fallbackChar={currentUser.email || "U"} />
                  <span className="text-white text-sm font-bold">{currentUser.email}</span>
                </div>

                <NavItem href={getDashboardLink()} icon={Icons.User} label="Dashboard" />
                <NavItem href="/profile" icon={Icons.User} label="My Profile" />
                <NavItem href="/chat" icon={Icons.Message} label="Messages" />

                {/* Desktop User Menu */}
                <li className="hidden md:flex items-center ml-2">
                  <UserAvatar url={avatarUrl} size={32} fallbackChar={currentUser.email || "U"} />
                </li>

                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left md:w-auto flex items-center gap-2 py-3 px-4 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition duration-300"
                  >
                    <span>Sign Out</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <div className="hidden md:block w-px h-8 bg-white/10 mx-2"></div>
                <NavItem href="/login" icon={Icons.User} label="Login" />
                <NavItem href="/register" icon={Icons.Rocket} label="Get Started" primary />
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
