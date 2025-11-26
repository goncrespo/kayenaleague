"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PlayerStats {
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  totalPoints: number;
  avgPoints: number;
  holesWon: number;
  holesLost: number;
  holesDiff: number;
  currentStreak: number;
  bestStreak: number;
}

interface DashboardStatsProps {
  stats?: PlayerStats;
  isLoading?: boolean;
}

export default function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const [animatedStats, setAnimatedStats] = useState({
    totalMatches: 0,
    wins: 0,
    totalPoints: 0,
    winRate: 0
  });

  useEffect(() => {
    if (stats) {
      // Animación progresiva de estadísticas
      const timer = setTimeout(() => {
        setAnimatedStats({
          totalMatches: stats.totalMatches,
          wins: stats.wins,
          totalPoints: stats.totalPoints,
          winRate: stats.totalMatches > 0 ? Math.round((stats.wins / stats.totalMatches) * 100) : 0
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 animate-pulse">
            <div className="h-4 bg-slate-600 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-slate-600 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
        <div className="text-center space-y-4">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white">Aún no hay estadísticas</h3>
          <p className="text-gray-400">
            Aún no hay estadísticas disponibles. ¡Juega tus primeros partidos!
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/dashboard/matches"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-400 text-black px-6 py-2 font-semibold shadow-lg hover:bg-emerald-300 transition-all duration-200"
            >
              Ver Partidos
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Partidos Jugados",
      value: animatedStats.totalMatches,
      icon: "⛳",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Victorias",
      value: animatedStats.wins,
      icon: "🏆",
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Puntos Totales",
      value: animatedStats.totalPoints,
      icon: "⭐",
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Win Rate",
      value: `${animatedStats.winRate}%`,
      icon: "📊",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Tarjetas principales con estilo Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl overflow-hidden"
          >
            {/* Fondo gradiente animado */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
            
            {/* Contenido */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{card.icon}</div>
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${card.color}`} />
              </div>
              <p className="text-sm text-gray-300 mb-2">{card.title}</p>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Estadísticas detalladas con estilo de cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Racha y hoyos */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Rendimiento</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Racha Actual</span>
              <span className="font-semibold text-emerald-300">
                {stats.currentStreak > 0 ? `${stats.currentStreak}V` : 
                 stats.currentStreak < 0 ? `${Math.abs(stats.currentStreak)}D` : "0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Mejor Racha</span>
              <span className="font-semibold text-white">{stats.bestStreak}V</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Diferencia de Hoyos</span>
              <span className={`font-semibold ${
                stats.holesDiff >= 0 ? 'text-emerald-300' : 'text-red-400'
              }`}>
                {stats.holesDiff > 0 ? '+' : ''}{stats.holesDiff}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Puntos Promedio</span>
              <span className="font-semibold text-white">{stats.avgPoints.toFixed(1)}</span>
            </div>
          </div>
        </motion.div>

        {/* Distribución de resultados */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Distribución</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Victorias</span>
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-emerald-300">{stats.wins}</span>
                <div className="w-16 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalMatches > 0 ? (stats.wins / stats.totalMatches) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Empates</span>
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-yellow-300">{stats.draws}</span>
                <div className="w-16 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalMatches > 0 ? (stats.draws / stats.totalMatches) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Derrotas</span>
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-red-400">{stats.losses}</span>
                <div className="w-16 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalMatches > 0 ? (stats.losses / stats.totalMatches) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Resumen de hoyos con estilo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Hoyos</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.holesWon}</p>
            <p className="text-sm text-gray-400">Ganados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{stats.holesLost}</p>
            <p className="text-sm text-gray-400">Perdidos</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${
              stats.holesDiff >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {stats.holesDiff > 0 ? '+' : ''}{stats.holesDiff}
            </p>
            <p className="text-sm text-gray-400">Diferencia</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}