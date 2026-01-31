"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function LogoLoader({ size = 100 }: { size?: number }) {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="relative flex items-center justify-center" style={{ width: size + 40, height: size + 40 }}>
                {/* Rotating outer ring (Flowing Green) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-t-4 border-l-2 border-green-500 border-r-transparent border-b-transparent opacity-80"
                />

                {/* Counter-rotating inner ring (Subtle Emerald) */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-b-4 border-r-2 border-emerald-700 border-t-transparent border-l-transparent opacity-60"
                />

                {/* Pulsing Glow behind Logo */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-4 rounded-full bg-green-500 blur-xl"
                />

                {/* Logo Image */}
                <div className="relative z-10 w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl border border-white/20">
                    {/* Using a fallback until the user uploads the logo */}
                    <div className="relative w-full h-full">
                        <Image
                            src="/logo.png"
                            alt="SaloneVest Logo"
                            fill
                            className="object-contain p-3"
                            onError={(e) => {
                                // Fallback to text if image fails/missing
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.classList.add('fallback-text');
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-green-500 font-bold text-3xl hidden fallback-container pointer-events-none">
                            S
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
        .fallback-text .fallback-container {
            display: flex !important;
        }
      `}</style>
        </div>
    );
}
