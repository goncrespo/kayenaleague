"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PlayerManagement from "@/components/admin/PlayerManagement";
import CompetitionManagement from "@/components/admin/CompetitionManagement";
import GroupCreation from "@/components/admin/GroupCreation";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

interface AdminDashboardClientProps {
  user: User;
}

export default function AdminDashboardClient({ user }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("players");

  const tabs = [
    { id: "players", name: "Gestión de Jugadores", icon: "👥" },
    { id: "competitions", name: "Competiciones", icon: "🏆" },
    { id: "groups", name: "Crear Grupos", icon: "🎯" },
    { id: "matches", name: "Gestión de Partidos", icon: "⛳" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Admin */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-gray-400 mt-1">Gestión completa de Kayena League</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-300">{user.name || user.email}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <span className="text-sm text-gray-400">Admin Mode</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "players" && <PlayerManagement />}
        {activeTab === "competitions" && <CompetitionManagement />}
        {activeTab === "groups" && <GroupCreation />}
        {activeTab === "matches" && <div className="text-white text-center py-8">Gestión de Partidos - Próximamente</div>}
      </main>
    </div>
  );
}