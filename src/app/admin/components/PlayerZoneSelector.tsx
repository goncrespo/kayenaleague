"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  zoneId: string;
  handicap: number;
}

interface Zone {
  id: string;
  name: string;
  description?: string;
}

interface UsersByZone {
  [zoneId: string]: User[];
}

interface PlayerZoneSelectorProps {
  leagueId: string;
  onCreateGroups: (playersPerGroup: number) => void;
  loading: boolean;
}

export default function PlayerZoneSelector({
  leagueId,
  onCreateGroups,
  loading
}: PlayerZoneSelectorProps) {
  const [usersByZone, setUsersByZone] = useState<UsersByZone>({});
  const [zones, setZones] = useState<Zone[]>([]);
  const [playersPerGroup, setPlayersPerGroup] = useState(4);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsersByZone = async () => {
      setFetchingUsers(true);
      setError(null);

      try {
        // Obtener usuarios por zona
        const usersResponse = await fetch(`/api/admin/users-by-zone?leagueId=${leagueId}`);
        const usersData = await usersResponse.json();

        // Obtener información de zonas
        const zonesResponse = await fetch("/api/admin/zones");
        const zonesData = await zonesResponse.json();

        if (usersResponse.ok && zonesResponse.ok) {
          setUsersByZone(usersData.usersByZone);
          setZones(zonesData);
        } else {
          setError("Error al cargar datos");
        }
      } catch {
        setError("Error de conexión");
      } finally {
        setFetchingUsers(false);
      }
    };

    if (leagueId) {
      fetchUsersByZone();
    }
  }, [leagueId]);

  const handleCreateGroups = () => {
    onCreateGroups(playersPerGroup);
  };

  const totalUsers = Object.values(usersByZone).flat().length;

  if (fetchingUsers) {
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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Configurar Grupos
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Configuración de jugadores por grupo */}
        <div>
          <label htmlFor="playersPerGroup" className="block text-sm font-medium text-gray-700 mb-2">
            Jugadores por Grupo
          </label>
          <select
            id="playersPerGroup"
            value={playersPerGroup}
            onChange={(e) => setPlayersPerGroup(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={2}>2 jugadores</option>
            <option value={3}>3 jugadores</option>
            <option value={4}>4 jugadores</option>
            <option value={5}>5 jugadores</option>
            <option value={6}>6 jugadores</option>
            <option value={7}>7 jugadores</option>
            <option value={8}>8 jugadores</option>
          </select>
        </div>

        {/* Información de zonas */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Distribución de Usuarios por Zona
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Los grupos se crearán automáticamente por zonas. Se agotarán los usuarios de una zona antes de pasar a la siguiente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(usersByZone).map(([zoneId, users]) => {
              const zone = zones.find(z => z.id === zoneId);
              const zoneName = zone?.name || zoneId;
              const groupsInZone = Math.floor(users.length / playersPerGroup);

              return (
                <div
                  key={zoneId}
                  className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{zoneName}</h4>
                      <p className="text-sm text-gray-600">
                        {users.length} jugador{users.length !== 1 ? 'es' : ''}
                      </p>
                      <p className="text-xs text-blue-600">
                        {groupsInZone} grupo{groupsInZone !== 1 ? 's' : ''} estimado{groupsInZone !== 1 ? 's' : ''}
                      </p>
                      {zone?.description && (
                        <p className="text-xs text-gray-500">{zone.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Resumen</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Total de usuarios: {totalUsers}</p>
            <p>Jugadores por grupo: {playersPerGroup}</p>
            <p>Grupos estimados: {totalUsers > 0 ? Math.floor(totalUsers / playersPerGroup) : 0}</p>
            <p>Zonas con usuarios: {Object.keys(usersByZone).length}</p>
          </div>
        </div>

        {/* Botón de crear grupos */}
        <button
          onClick={handleCreateGroups}
          disabled={loading || totalUsers === 0}
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${loading || totalUsers === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creando Grupos...
            </div>
          ) : (
            "Crear Grupos por Zonas"
          )}
        </button>
      </div>
    </div>
  );
}
