"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface DashboardNavProps {
  userName?: string;
}

export default function DashboardNav({ userName }: DashboardNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Mis Partidos", href: "/dashboard/matches", icon: "⛳" },
    { name: "Estadísticas", href: "/dashboard/stats", icon: "📈" },
    { name: "Clasificación", href: "/dashboard/standings", icon: "🏆" },
    { name: "Mi Zona", href: "/dashboard/zone", icon: "📍" },
    { name: "Perfil", href: "/profile", icon: "👤" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    return pathname.startsWith(href) && href !== "/dashboard";
  };

  return (
    <nav className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🏌️</span>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
                Kayena League
              </span>
            </Link>
            {userName && (
              <span className="text-sm text-gray-300">
                Bienvenido, {userName}
              </span>
            )}
          </div>

          {/* Navegación principal */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-white/10 text-white border border-white/20 shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Menú móvil y acciones */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-white/10"
            >
              Inicio
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/api/auth/signout"
                className="text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-md hover:bg-red-500/10"
              >
                Cerrar sesión
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-3 gap-2">
            {navItems.map((item) => (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.href}
                  className={`p-3 rounded-lg text-center text-sm transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="text-lg mb-1">{item.icon}</div>
                  <div className="font-medium">{item.name}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}