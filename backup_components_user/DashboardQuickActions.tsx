"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardQuickActions() {
  const actions = [
    { name: "Mis Partidos", href: "/dashboard/matches", icon: "⛳", description: "Ver y gestionar" },
    { name: "Estadísticas", href: "/dashboard/stats", icon: "📊", description: "Ver rendimiento" },
    { name: "Clasificación", href: "/dashboard/standings", icon: "🏆", description: "Ver posiciones" },
    { name: "Mi Zona", href: "/dashboard/zone", icon: "📍", description: "Información y campos" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <motion.div 
              key={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={action.href}
                className="group p-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="text-3xl mb-3 group-hover:scale-110 transition-transform"
                >
                  {action.icon}
                </motion.div>
                <p className="font-semibold text-white mb-1">{action.name}</p>
                <p className="text-sm text-gray-400">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}