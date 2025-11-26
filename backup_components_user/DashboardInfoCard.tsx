"use client";

import { motion } from "framer-motion";

interface DashboardInfoCardProps {
  subscription?: {
    league: {
      name: string;
      startDate: string;
      endDate: string;
    };
  } | null;
  assignment?: {
    group: {
      name: string;
      division: {
        name: string;
      };
    };
  } | null;
  userZone?: {
    name: string;
    description: string;
  } | null;
}

export default function DashboardInfoCard({ subscription, assignment, userZone }: DashboardInfoCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-lg font-semibold text-white mb-2">Liga Activa</h3>
            {subscription ? (
              <div>
                <p className="font-medium text-emerald-300">{subscription.league.name}</p>
                <p className="text-sm text-gray-400">
                  {new Date(subscription.league.startDate).toLocaleDateString()} - 
                  {new Date(subscription.league.endDate).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-400">Sin suscripción activa</p>
            )}
          </div>

          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">División / Grupo</h3>
            {assignment ? (
              <div>
                <p className="font-medium text-teal-300">{assignment.group.division.name}</p>
                <p className="text-sm text-gray-400">Grupo {assignment.group.name}</p>
              </div>
            ) : (
              <p className="text-gray-400">No asignado</p>
            )}
          </div>

          <div className="text-center">
            <div className="text-3xl mb-2">📍</div>
            <h3 className="text-lg font-semibold text-white mb-2">Zona</h3>
            {userZone ? (
              <div>
                <p className="font-medium text-cyan-300">{userZone.name}</p>
                <p className="text-sm text-gray-400">{userZone.description}</p>
              </div>
            ) : (
              <p className="text-gray-400">Sin zona asignada</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}