"use client";

import { useState, useEffect } from "react";

interface League {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  divisions: {
    id: string;
    name: string;
    groups: {
      id: string;
      name: string;
      players: {
        player: {
          id: string;
          name: string;
        };
      }[];
    }[];
  }[];
  subscriptions: {
    user: {
      id: string;
      name: string;
      zone: string;
    };
    paid: boolean;
  }[];
}

export default function LeagueInfo() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/leagues");
      if (!response.ok) {
        throw new Error("Error al cargar las ligas");
      }
      const data = await response.json();
      setLeagues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={fetchLeagues}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Información de Ligas y Grupos
        </h2>
        <p className="text-sm text-gray-600">
          Usa estos IDs en las acciones de administración
        </p>
      </div>

      <div className="p-6">
        {leagues.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay ligas disponibles
          </p>
        ) : (
          <div className="space-y-6">
            {leagues.map((league) => (
              <div key={league.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{league.name}</h3>
                    <p className="text-sm text-gray-600">
                      ID: <code className="bg-gray-100 px-1 rounded">{league.id}</code>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(league.startDate).toLocaleDateString()} - {new Date(league.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Suscriptores: {league.subscriptions.filter(s => s.paid).length}
                    </p>
                    <p className="text-xs text-gray-500">
                      Con zona: {league.subscriptions.filter(s => s.paid && s.user.zone).length}
                    </p>
                  </div>
                </div>

                {league.divisions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Divisiones y Grupos:</h4>
                    <div className="space-y-2">
                      {league.divisions.map((division) => (
                        <div key={division.id} className="ml-4">
                          <p className="text-sm text-gray-600">
                            <strong>{division.name}</strong>
                          </p>
                          {division.groups.length > 0 ? (
                            <div className="ml-4 space-y-1">
                              {division.groups.map((group) => (
                                <div key={group.id} className="text-xs text-gray-500">
                                  <span className="font-mono bg-gray-100 px-1 rounded">
                                    {group.id}
                                  </span> - {group.name} ({group.players.length} jugadores)
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 ml-4">Sin grupos creados</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {league.divisions.length === 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Sin divisiones creadas
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
