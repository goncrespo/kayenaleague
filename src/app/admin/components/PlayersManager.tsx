"use client";

import { useEffect, useMemo, useState } from "react";

interface Zone { id: string; name: string; }
interface Player {
  id: string;
  name: string | null;
  email: string | null;
  handicap: number;
  zoneId: string | null;
}

export default function PlayersManager() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [playersRes, zonesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/zones"),
      ]);
      if (!playersRes.ok) throw new Error("Error cargando jugadores");
      if (!zonesRes.ok) throw new Error("Error cargando zonas");
      const playersData = await playersRes.json();
      const zonesData = await zonesRes.json();
      setPlayers(playersData);
      setZones(zonesData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players;
    return players.filter(p =>
      (p.name || "").toLowerCase().includes(q) || (p.email || "").toLowerCase().includes(q)
    );
  }, [players, search]);

  const updatePlayer = async (playerId: string, data: Partial<Player>) => {
    try {
      setSavingId(playerId);
      const res = await fetch(`/api/admin/users/${playerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Error actualizando jugador");
      setPlayers(prev => prev.map(p => (p.id === playerId ? { ...p, ...data } as Player : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-1/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-48 w-full bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Jugadores</h3>
          <p className="text-sm text-gray-600">Edita handicap y zona de los jugadores</p>
        </div>
        <div className="w-64">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="px-6 pt-4">
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">{error}</div>
        </div>
      )}

      <div className="p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handicap</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPlayers.map((p) => (
              <tr key={p.id} className="align-top">
                <td className="px-3 py-2 text-sm text-gray-900">{p.name || "—"}</td>
                <td className="px-3 py-2 text-sm text-gray-500">{p.email || "—"}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    defaultValue={p.handicap}
                    onBlur={(e) => updatePlayer(p.id, { handicap: Number(e.target.value) })}
                    className="w-24 px-2 py-1 border border-gray-300 rounded"
                    step={0.1}
                    min={0}
                    max={54}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    defaultValue={p.zoneId || ""}
                    onChange={(e) => updatePlayer(p.id, { zoneId: e.target.value || null })}
                    className="px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="">Sin zona</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-right">
                  {savingId === p.id && (
                    <span className="text-xs text-gray-500">Guardando…</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
