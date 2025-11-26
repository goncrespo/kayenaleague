"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Standing {
  position: number;
  player: {
    id: string;
    name: string | null;
    lastName: string | null;
    handicap: number;
    zone: {
      name: string;
    } | null;
  };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  holesWon: number;
  holesLost: number;
  holesDiff: number;
  isCurrentUser: boolean;
}

interface StandingsData {
  group: {
    id: string;
    name: string;
  };
  division: {
    id: string;
    name: string;
  };
  season: {
    id: string;
    name: string;
  };
  standings: Standing[];
}

export default function StandingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (status === "authenticated") {
      fetchStandings();
    }
  }, [status, router]);

  const fetchStandings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/standings");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar clasificación");
      }

      setStandings(data.data);
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
          <div className="bg-white rounded-lg p-6 border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
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
            onClick={fetchStandings}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  if (!standings) {
    return (
      <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">Sin clasificación</h1>
          <p className="text-yellow-700">
            No estás asignado a ningún grupo actualmente.
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

  const getPositionColor = (position: number) => {
    if (position === 1) return 'bg-yellow-400 text-yellow-900';
    if (position === 2) return 'bg-gray-400 text-gray-900';
    if (position === 3) return 'bg-orange-400 text-orange-900';
    return 'bg-gray-200 text-gray-700';
  };

  const getRowColor = (isCurrentUser: boolean) => {
    return isCurrentUser 
      ? 'bg-blue-50 border-blue-200' 
      : 'hover:bg-gray-50';
  };

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clasificación</h1>
            <p className="mt-2 text-lg text-gray-600">
              {standings.group} · {standings.division} · {standings.season}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchStandings}
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

      {/* Resumen de la clasificación */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Total de Jugadores</h3>
          <p className="text-3xl font-bold text-blue-600">{standings.standings.length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Tu Posición</h3>
          {standings.standings.find(s => s.isCurrentUser) ? (
            <div className="flex items-center">
              <span className="text-3xl font-bold text-green-600">
                #{standings.standings.find(s => s.isCurrentUser)?.position}
              </span>
              <span className="ml-2 text-gray-600">de {standings.standings.length}</span>
            </div>
          ) : (
            <p className="text-gray-500">No clasificado</p>
          )}
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Líder</h3>
          {standings.standings[0] && (
            <div>
              <p className="font-medium">
                {standings.standings[0].player.name} {standings.standings[0].player.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {standings.standings[0].points} puntos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de clasificación */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">Tabla de Posiciones</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jugador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HCP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  V
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  D
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dif. Hoyos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.standings.map((standing) => (
                <tr
                  key={standing.player.id}
                  className={getRowColor(standing.isCurrentUser)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionColor(standing.position)}`}>
                        {standing.position}
                      </span>
                      {standing.isCurrentUser && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          Tú
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {standing.player.name} {standing.player.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {standing.player.zone?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {standing.player.handicap}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {standing.played}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-600 font-medium">
                      {standing.wins}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-yellow-600 font-medium">
                      {standing.draws}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-red-600 font-medium">
                      {standing.losses}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {standing.points}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      standing.holesDiff >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {standing.holesDiff > 0 ? '+' : ''}{standing.holesDiff}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Leyenda</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><strong>PJ:</strong> Partidos Jugados</div>
          <div><strong>V:</strong> Victorias (3 pts)</div>
          <div><strong>E:</strong> Empates (1 pt)</div>
          <div><strong>D:</strong> Derrotas (0 pts)</div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          La clasificación se ordena por puntos totales. En caso de empate, se utiliza la diferencia de hoyos como desempate.
        </p>
      </div>

      {/* Enlaces relacionados */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/dashboard/stats"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Ver Mis Estadísticas
        </Link>
        <Link
          href="/dashboard/matches"
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Ver Mis Partidos
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