"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardStats from "@/components/user/DashboardStats";

interface PlayerStats {
  general: {
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
  };
  currentStreak: number;
  recentMatches: Array<{
    id: string;
    roundNumber: number;
    matchDate: string | null;
    isHome: boolean;
    opponent: string;
    isWinner: boolean;
    status: string;
  }>;
  currentLeague: {
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  standings: {
    group: string;
    division: string;
    season: string;
    position: number;
    totalPlayers: number;
    standings: Array<any>;
  } | null;
  performance: {
    winRate: number;
    avgPointsPerMatch: number;
    holesDifference: number;
  };
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/stats");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar estadísticas");
      }

      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <DashboardStats isLoading={true} />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error</h1>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">Sin estadísticas</h1>
          <p className="text-yellow-700">
            Aún no hay estadísticas disponibles. ¡Juega tus primeros partidos!
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver al Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Estadísticas</h1>
            <p className="mt-2 text-lg text-gray-600">
              Análisis detallado de tu rendimiento en la liga
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Actualizar
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Información de la liga actual */}
      {stats.currentLeague && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Liga Actual: {stats.currentLeague.name}</h3>
          <p className="text-gray-700">
            Temporada: {new Date(stats.currentLeague.startDate).toLocaleDateString()} - 
            {new Date(stats.currentLeague.endDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Estadísticas principales */}
      <section className="mb-8">
        <DashboardStats stats={stats.general} isLoading={false} />
      </section>

      {/* Información de clasificación */}
      {stats.standings && (
        <section className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-4">
              Tu posición en {stats.standings.group} · {stats.standings.division}
            </h3>
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <span className="text-2xl font-bold mr-2">#{stats.standings.position}</span>
                <span>de {stats.standings.totalPlayers} jugadores</span>
              </div>
            </div>
            
            {stats.standings.standings.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Top 5 de la clasificación</h4>
                <div className="space-y-2">
                  {stats.standings.standings.slice(0, 5).map((player: any, index: number) => (
                    <div
                      key={player.player.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        player.isCurrentUser 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-orange-400 text-orange-900' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">
                            {player.player.name} {player.player.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            HCP: {player.player.handicap}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{player.stats.totalPoints} pts</p>
                        <p className="text-sm text-gray-600">
                          {player.stats.wins}V {player.stats.draws}E {player.stats.losses}D
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Partidos recientes */}
      {stats.recentMatches.length > 0 && (
        <section className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-4">Partidos Recientes</h3>
            <div className="space-y-3">
              {stats.recentMatches.map((match) => (
                <div
                  key={match.id}
                  className={`p-4 border rounded-lg ${
                    match.isWinner ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Jornada {match.roundNumber} vs {match.opponent}
                      </p>
                      <p className="text-sm text-gray-600">
                        {match.matchDate 
                          ? new Date(match.matchDate).toLocaleDateString()
                          : 'Fecha no especificada'
                        }
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      match.isWinner 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {match.isWinner ? 'Victoria' : 'Derrota'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rendimiento */}
      <section className="mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">Análisis de Rendimiento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-3">
                <span className="text-2xl font-bold">{stats.performance.winRate}%</span>
              </div>
              <h4 className="font-medium mb-1">Win Rate</h4>
              <p className="text-sm text-gray-600">Porcentaje de victorias</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-3">
                <span className="text-2xl font-bold">{stats.performance.avgPointsPerMatch.toFixed(1)}</span>
              </div>
              <h4 className="font-medium mb-1">Puntos Promedio</h4>
              <p className="text-sm text-gray-600">Por partido jugado</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mb-3">
                <span className="text-2xl font-bold">
                  {stats.performance.holesDifference > 0 ? '+' : ''}
                  {stats.performance.holesDifference}
                </span>
              </div>
              <h4 className="font-medium mb-1">Diferencia de Hoyos</h4>
              <p className="text-sm text-gray-600">Total en la temporada</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enlaces de navegación */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/dashboard/standings"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Ver Tabla de Clasificación
        </Link>
        <Link
          href="/dashboard/matches"
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Ver Todos Mis Partidos
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>
    </main>
  );
}