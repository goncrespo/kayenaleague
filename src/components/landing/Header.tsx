"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (pathname === "/como-funciona") {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-[#050505]/80 backdrop-blur-md border-b border-white/5 py-4"
        : "bg-transparent py-8"
        }`}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tighter text-white hover:text-emerald-400 transition-colors">
          KAYENA <span className="text-emerald-400">LEAGUE</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors px-4 py-2 rounded-full border border-transparent hover:border-white/20 ${isScrolled ? "text-white hover:text-emerald-400" : "text-white hover:text-emerald-400"}`}
          >
            Contacto
          </Link>
          <Link
            href="/register"
            className={`text-sm font-medium transition-all duration-300 px-6 py-2.5 rounded-full ${isScrolled
              ? "bg-white text-black hover:bg-emerald-400 hover:text-black shadow-lg shadow-emerald-900/20"
              : "bg-white/5 text-white border border-white/10 hover:bg-white hover:text-black hover:border-white"
              }`}
          >
            Registro
          </Link>
        </nav>
      </div>
    </header>
  );
}
