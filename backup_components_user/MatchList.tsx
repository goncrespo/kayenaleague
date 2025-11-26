"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Match {
  id: string;
  roundNumber: number;
  status: string;
  deadlineDate: string;
  matchDate: string | null;
  matchType: string;
  isHome: boolean;
  opponent: {
    id: string;
    name: string | null;
    lastName: string | null;
    handicap: number;
    zone: {
      name: string;
    } | null;
  };
  group: {
    name: string;
    division: {
      name: string;
      season: {
        name: string;
      };
    };
  } | null;
  canReportResult: boolean;
}

interface MatchListProps {
  title: string;
  type: "upcoming" | "history";
  limit?: number;
}

export default function MatchList({ title, type, limit = 10 }: MatchListProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, [type]);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = type === "upcoming" 
        ? "/api/user/matches/upcoming"
        : `/api/user/matches/history?limit=${limit}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar partidos");
      }

      setMatches(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      CONFIRMED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      COMPLETED: "bg-green-500/20 text-green-300 border-green-500/30",
      CANCELLED: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-600 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-slate-600 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="text-center space-y-4">
          <div className="text-3xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-400">Error</h3>
          <p className="text-gray-400">{error}</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button 
              onClick={fetchMatches}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-400 text-black px-6 py-2 font-semibold shadow-lg hover:bg-emerald-300 transition-all duration-200"
            >
              Reintentar
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="text-center space-y-4">
          <div className="text-4xl mb-4">
            {type === "upcoming" ? "📅" : "📊"}
          </div>
          <h3 className="text-lg font-semibold text-gray-300">
            {type === "upcoming" ? "No tienes partidos pendientes" : "No hay partidos en el historial"}
          </h3>
          <p className="text-gray-400">
            {type === "upcoming" 
              ? "Todos tus partidos están completados. ¡Bien hecho!"
              : "Aún no has jugado partidos en esta liga."
            }
          </p>
          {type === "upcoming" && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/dashboard/matches"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-400 text-black px-6 py-2 font-semibold shadow-lg hover:bg-emerald-300 transition-all duration-200"
              >
                Ver todos los partidos
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/dashboard/matches"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Ver todos →
            </Link>
          </motion.div>
        </div>
      )}

      <div className="space-y-4">
        {matches.slice(0, limit).map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-slate-600/50 transition-all duration-300"
          >
            {/* Encabezado con estado */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(match.status)}`}>
                  {match.status}
                </span>
                <span className="text-sm text-gray-400">
                  Jornada {match.roundNumber}
                </span>
                {match.group && (
                  <span className="text-sm text-gray-400">
                    {match.group.name} · {match.group.division.name}
                  </span>
                )}
              </div>
              
              {match.status === "COMPLETED" && (
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  match.isHome ? (match.homePlayerScore! > match.awayPlayerScore! ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300') :
                  match.awayPlayerScore! > match.homePlayerScore! ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {match.isHome ? (match.homePlayerScore! > match.awayPlayerScore! ? 'Victoria' : 'Derrota') :
                   match.awayPlayerScore! > match.homePlayerScore! ? 'Victoria' : 'Derrota'}
                </div>
              )}
            </div>

            {/* Información del partido */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-white">
                    {match.isHome ? "Local" : "Visitante"} vs
                  </span>
                  <span className="font-semibold text-emerald-300">
                    {match.opponent.name} {match.opponent.lastName}
                  </span>
                  <span className="text-sm text-gray-400">
                    (HCP: {match.opponent.handicap})
                  </span>
                  {match.opponent.zone && (
                    <span className="text-xs px-2 py-1 bg-slate-700/50 text-gray-300 rounded">
                      {match.opponent.zone.name}
                    </span>
                  )}
                </div>

                {match.status === "COMPLETED" ? (
                  <div className="mt-2 text-sm text-gray-400">
                    <p>Jugado el: {match.matchDate ? formatDateTime(match.matchDate) : formatDate(match.deadlineDate)}</p>
                    <p className="font-medium text-white">
                      Resultado: {match.isHome ? match.homePlayerScore : match.awayPlayerScore} - {match.isHome ? match.awayPlayerScore : match.homePlayerScore}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-400">
                    <p>Límite: {formatDate(match.deadlineDate)}</p>
                    {match.matchDate && (
                      <p>Fecha propuesta: {formatDateTime(match.matchDate)}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end space-y-2">
                <Link
                  href={`/dashboard/matches/${match.id}`}
                  className="px-3 py-1 text-sm bg-slate-700/50 text-gray-300 rounded hover:bg-slate-600/50 transition-colors"
                >
                  Ver detalles
                </Link>
                
                {match.status === "PENDING" && match.canReportResult && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={`/dashboard/matches/${match.id}/report`}
                      className="px-3 py-1 text-sm bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 transition-colors"
                    >
                      Reportar
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}