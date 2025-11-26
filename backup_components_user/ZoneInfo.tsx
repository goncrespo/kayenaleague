"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Zone {
  id: string;
  name: string;
  description: string;
  districts: string[];
  coordinates: string | null;
  maxCapacity: number;
}

interface ZonePreference {
  id: string;
  homeZoneId: string;
  travelRange: number;
  preferences: any;
}

interface PlayerStats {
  totalMatches: number;
  wins: number;
  points: number;
}

interface Venue {
  id: string;
  name: string;
  address: string | null;
}

interface ZoneInfo {
  userZone: Zone | null;
  zonePreference: ZonePreference | null;
  userStats: PlayerStats | null;
  playersInZone: number;
  zoneStats: {
    totalPlayers: number;
    activePlayers: number;
    totalMatches: number;
    avgHandicap: number;
    activityRate: number;
  } | null;
  availableVenues: Venue[];
  recentMatches: any[];
  canChangeZone: boolean;
}

interface ZoneInfoProps {
  zoneInfo?: ZoneInfo;
  isLoading?: boolean;
}

export default function ZoneInfo({ zoneInfo, isLoading }: ZoneInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [travelRange, setTravelRange] = useState(10);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (zoneInfo?.zonePreference) {
      setTravelRange(zoneInfo.zonePreference.travelRange);
    }
  }, [zoneInfo]);

  const handleUpdatePreferences = async () => {
    if (!zoneInfo?.userZone) return;

    try {
      setIsUpdating(true);
      
      const response = await fetch("/api/user/zone", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeZoneId: zoneInfo.userZone.id,
          travelRange: travelRange,
          preferences: {}
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar preferencias");
      }

      setIsEditing(false);
      // Recargar la página para actualizar los datos
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-600 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
              <div className="h-20 bg-slate-600 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-600 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!zoneInfo?.userZone) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="text-5xl mb-4">📍</div>
          <h3 className="text-xl font-semibold text-yellow-400">Zona no asignada</h3>
          <p className="text-gray-400">
            Aún no has sido asignado a una zona. Contacta con el administrador para que te asigne a una zona de Madrid.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/profile"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-400 text-black px-6 py-2 font-semibold shadow-lg hover:bg-emerald-300 transition-all duration-200"
            >
              Ver Perfil
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const { userZone, zoneStats, availableVenues, recentMatches, canChangeZone } = zoneInfo;

  return (
    <div className="space-y-8">
      {/* Información principal de la zona con estilo Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
              Mi Zona: {userZone.name}
            </h2>
            {canChangeZone && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="mt-2 px-3 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 transition-colors"
                >
                  {isEditing ? "Cancelar" : "Editar Preferencias"}
                </button>
              </motion.div>
            )}
          </div>
          <div className="text-3xl">📍</div>
        </div>

        <p className="text-gray-300 mb-6">{userZone.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-300">{zoneStats?.totalPlayers || 0}</p>
            <p className="text-sm text-gray-400">Jugadores</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-300">{zoneStats?.activePlayers || 0}</p>
            <p className="text-sm text-gray-400">Activos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-300">{availableVenues.length}</p>
            <p className="text-sm text-gray-400">Campos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-300">{zoneStats?.activityRate || 0}%</p>
            <p className="text-sm text-gray-400">Actividad</p>
          </div>
        </div>

        {zoneStats && (
          <div className="mt-6 p-4 bg-slate-700/50 rounded-xl">
            <p className="text-sm text-gray-300">
              Handicap promedio: <span className="font-semibold text-white">{zoneStats.avgHandicap}</span>
            </p>
          </div>
        )}
      </motion.div>

      {/* Distritos con estilo de chips */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl"
      >
        <h4 className="font-semibold text-white mb-4">Distritos Incluidos</h4>
        <div className="flex flex-wrap gap-3">
          {userZone.districts.map((district, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-600 text-gray-200 text-sm rounded-full border border-slate-600/50 shadow-sm"
            >
              {district}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Preferencias de zona con estilo Hero */}
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl"
        >
          <h4 className="font-semibold text-white mb-4">Preferencias de Zona</h4>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Zona de preferencia
              </label>
              <p className="text-lg font-medium text-emerald-300">
                {userZone.name} - {userZone.description}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Rango de Viaje (km)
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={travelRange}
                  onChange={(e) => setTravelRange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${(travelRange / 50) * 100}%, #475569 ${(travelRange / 50) * 100}%, #475569 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>1 km</span>
                  <span className="font-medium text-emerald-300">{travelRange} km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={handleUpdatePreferences}
                  disabled={isUpdating}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg"
                >
                  {isUpdating ? "Guardando..." : "Guardar Preferencias"}
                </button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-all duration-200"
                >
                  Cancelar
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Campos de golf con estilo de cards */}
      {availableVenues.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl"
        >
          <h4 className="font-semibold text-white mb-6">Campos de Golf Disponibles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableVenues.map((venue) => (
              <motion.div
                key={venue.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h5 className="font-semibold text-white mb-2">{venue.name}</h5>
                {venue.address && (
                  <p className="text-sm text-gray-400">{venue.address}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Partidos recientes con estilo */}
      {recentMatches.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl"
        >
          <h4 className="font-semibold text-white mb-6">Partidos Recientes en la Zona</h4>
          <div className="space-y-4">
            {recentMatches.slice(0, 5).map((match, index) => (
              <motion.div
                key={match.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {match.homePlayer.name} {match.homePlayer.lastName} vs {match.awayPlayer.name} {match.awayPlayer.lastName}
                    </p>
                    <p className="text-sm text-gray-400">
                      Jornada {match.roundNumber} · {new Date(match.matchDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-300">
                      Ganador: {match.winner?.name} {match.winner?.lastName}
                    </p>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                      Completado
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}