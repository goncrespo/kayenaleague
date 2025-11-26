"use client";

import { useState, useEffect } from 'react';
import React from 'react';
import { City } from '@prisma/client';

interface Player {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
  handicap: number | null;
  city: City;
  phone: string | null;
  licenseNumber: string | null;
  zone: {
    id: string;
    name: string;
  } | null;
  playerStats: {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
  } | null;
  competitions: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
}

interface Competition {
  id: string;
  name: string;
  city: City;
  isActive: boolean;
}

export default function PlayerManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [groupSize, setGroupSize] = useState(4);

  useEffect(() => {
    fetchCompetitions();
    fetchPlayers();
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [selectedCity, searchTerm, selectedCompetition]);

  const fetchCompetitions = async () => {
    try {
      const response = await fetch('/api/admin/competitions-public');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al cargar competiciones');
      }
      
      const data = await response.json();
      
      if (!data.success || !Array.isArray(data.competitions)) {
        throw new Error('Formato de datos inválido');
      }
      
      setCompetitions(data.competitions || []);
      
      // Seleccionar la competición activa por defecto
      const activeCompetition = data.competitions?.find((c: Competition) => c.isActive);
      if (activeCompetition) {
        setSelectedCompetition(activeCompetition.id);
      }
    } catch (error) {
      console.error('Error al cargar competiciones:', error);
      setCompetitions([]);
    }
  };

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCity !== 'ALL') params.append('city', selectedCity);
      if (selectedCompetition) params.append('competitionId', selectedCompetition);

      // Primero intentar el endpoint protegido
      let response = await fetch(`/api/admin/players?${params}`);
      
      // Si no está autenticado, usar el endpoint público
      if (response.status === 403) {
        response = await fetch(`/api/admin/players-public?${params}`);
      }

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        throw new Error(`Error del servidor: ${response.status} - Respuesta no JSON`);
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar jugadores');
      }

      // Validar la estructura de datos
      if (!data.players || !Array.isArray(data.players)) {
        throw new Error('Formato de datos inválido del servidor');
      }

      setPlayers(data.players || []);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al cargar jugadores');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelection = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedPlayers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPlayers.size === players.length) {
      setSelectedPlayers(new Set());
    } else {
      setSelectedPlayers(new Set(players.map(p => p.id)));
    }
  };

  const handleCreateGroups = async () => {
    if (!selectedCompetition) {
      setMessage({ type: 'error', text: 'Por favor selecciona una competición' });
      return;
    }

    if (selectedPlayers.size < 3) {
      setMessage({ type: 'error', text: 'Se necesitan al menos 3 jugadores para crear grupos' });
      return;
    }

    try {
      // Primero intentar el endpoint protegido
      let response = await fetch('/api/admin/create-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerIds: Array.from(selectedPlayers),
          groupSize: groupSize,
          competitionId: selectedCompetition
        })
      });

      // Si no está autorizado, usar el endpoint público
      if (response.status === 403) {
        response = await fetch('/api/admin/create-groups-public', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerIds: Array.from(selectedPlayers),
            groupSize: groupSize,
            competitionId: selectedCompetition
          })
        });
      }
      
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        setMessage({ type: 'error', text: `Error del servidor: ${response.status} - Respuesta no JSON` });
        return;
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        // Manejar error sin lanzar excepción
        const errorMessage = result.error || 'Error al crear grupos';
        setMessage({ type: 'error', text: errorMessage });
        return;
      }
      
      setMessage({ type: 'success', text: result.message });
      setSelectedPlayers(new Set());
    } catch (error) {
      console.error('Error al crear grupos:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error desconocido' });
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = !searchTerm || 
      (player.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       player.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       player.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCity = selectedCity === 'ALL' || player.city === selectedCity;
    
    return matchesSearch && matchesCity;
  });

  // Limpiar mensajes automáticamente después de 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestión de Jugadores</h2>
        <div className="text-sm text-gray-400">
          Total: {filteredPlayers.length} jugadores
        </div>
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message.text}
        </div>
      )}

      {/* Controles de filtrado */}
      <div className="bg-slate-800 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Buscar jugador</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, apellido o email..."
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value as City | 'ALL')}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
            >
              <option value="ALL">Todas las ciudades</option>
              <option value={City.MADRID}>Madrid</option>
              <option value={City.ZARAGOZA}>Zaragoza</option>
              <option value={City.VALLADOLID}>Valladolid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Competición</label>
            <select
              value={selectedCompetition}
              onChange={(e) => setSelectedCompetition(e.target.value)}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
            >
              <option value="">Todas las competiciones</option>
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.name} ({competition.city}) {competition.isActive && "✓"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Controles de selección y creación de grupos */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-slate-700 text-gray-300 rounded-md hover:bg-slate-600 transition-colors"
            >
              {selectedPlayers.size === players.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </button>
            <span className="text-gray-400">
              {selectedPlayers.size} seleccionados
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Jugadores por grupo</label>
              <select
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value))}
                className="bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-1 text-sm"
              >
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
            <button
              onClick={handleCreateGroups}
              disabled={selectedPlayers.size < 3}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              Crear Grupos
            </button>
          </div>
        </div>
      </div>

      {/* Lista de jugadores */}
      {loading ? (
        <div className="bg-slate-800 p-8 rounded-lg text-center text-gray-400">
          Cargando jugadores...
        </div>
      ) : error ? (
        <div className="bg-red-500 text-white p-4 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          <button 
            onClick={fetchPlayers}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-lg text-center text-gray-400">
          No se encontraron jugadores
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className={`bg-slate-800 p-4 rounded-lg border transition-all ${
                selectedPlayers.has(player.id)
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.has(player.id)}
                    onChange={() => handlePlayerSelection(player.id)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {player.name} {player.lastName}
                    </h3>
                    <p className="text-gray-400 text-sm">{player.email}</p>
                    {player.zone && (
                      <p className="text-gray-500 text-xs">
                        Zona: {player.zone.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-400">
                      HCP: <span className="text-white">{player.handicap || 'N/A'}</span>
                    </span>
                    <span className="text-gray-400">
                      Ciudad: <span className="text-white">{player.city}</span>
                    </span>
                  </div>
                  
                  {player.competitions.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Competiciones: {player.competitions.map(c => c.name).join(', ')}
                    </div>
                  )}
                  
                  {player.playerStats && (
                    <div className="text-xs text-gray-500">
                      Partidos: {player.playerStats.totalMatches} 
                      (V: {player.playerStats.wins} | D: {player.playerStats.draws} | P: {player.playerStats.losses})
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}