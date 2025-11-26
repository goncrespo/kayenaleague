"use client";

import { motion } from "framer-motion";

interface DashboardHeroProps {
  userName?: string;
}

export default function DashboardHero({ userName }: DashboardHeroProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 text-center"
    >
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200 bg-clip-text text-transparent mb-4">
        Bienvenido, {userName || "Jugador"}
      </h1>
      <p className="text-lg text-gray-300 max-w-2xl mx-auto">
        Gestiona tus partidos, revisa tus estadísticas y compite en las mejores zonas de Madrid
      </p>
    </motion.div>
  );
}