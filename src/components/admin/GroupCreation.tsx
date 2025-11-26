"use client";

import { useState, useEffect } from "react";
import React from "react";
import { motion } from "framer-motion";
import { City } from "@prisma/client";

interface Player {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
  handicap: number | null;
  zone: {
    name: string;
  } | null;
  city: City;
}

interface Competition {
  id: string;
  name: string;
  city: City;
  isActive: boolean;
}

export default function GroupCreation() {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [groupSize, setGroupSize] = useState(4); // Tamaño por defecto de 4 jugadores
  const [createdGroups, setCreatedGroups] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<City | 'ALL'>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar competiciones y jugadores disponibles
  useEffect(() => {
    fetchCompetitions();
    fetchAvailablePlayers();
  }, []);

  useEffect(() => {
    if (selectedCompetition) {
      fetchAvailablePlayers();
    }
  }, [selectedCompetition, selectedCity]);

  // Limpiar mensajes automáticamente después de 5 segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchCompetitions = async () => {
    try {
      const response = await fetch("/api/admin/competitions-public");
      
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
        setSelectedCity(activeCompetition.city);
      }
    } catch (error) {
      console.error('Error al cargar competiciones:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar competiciones');
      setCompetitions([]);
    }
  };

  const fetchAvailablePlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCompetition) params.append('competitionId', selectedCompetition);
      if (selectedCity !== 'ALL') params.append('city', selectedCity);
      params.append('unassignedOnly', 'true'); // Solo jugadores no asignados a grupos

      const response = await fetch(`/api/admin/players-public?${params}`);
      
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        throw new Error(`Error del servidor: ${response.status} - Respuesta no JSON`);
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar jugadores disponibles');
      }

      // Validar la estructura de datos
      if (!data.players || !Array.isArray(data.players)) {
        throw new Error('Formato de datos inválido del servidor');
      }

      setAvailablePlayers(data.players || []);
    } catch (error) {
      console.error('Error al cargar jugadores disponibles:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al cargar jugadores');
      setAvailablePlayers([]);
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
    if (selectedPlayers.size === availablePlayers.length) {
      setSelectedPlayers(new Set());
    } else {
      setSelectedPlayers(new Set(availablePlayers.map(p => p.id)));
    }
  };

  const handleCreateGroups = async () => {
    if (!selectedCompetition) {
      setError('Por favor, selecciona una competición');
      return;
    }

    if (selectedPlayers.size === 0) {
      setError('Por favor, selecciona al menos un jugador');
      return;
    }

    if (selectedPlayers.size < 3) {
      setError('Se necesitan al menos 3 jugadores para crear grupos');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/create-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerIds: Array.from(selectedPlayers),
          groupSize: groupSize,
          competitionId: selectedCompetition,
        }),
      });

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        throw new Error(`Error del servidor: ${response.status} - Respuesta no JSON`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear grupos");
      }

      setSuccess(`Grupos creados exitosamente: ${data.groupsCreated} grupos`);
      setSelectedPlayers(new Set());
      setCreatedGroups(data.groups || []);
      
      // Recargar datos
      fetchAvailablePlayers();
    } catch (error) {
      console.error("Error al crear grupos:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsCreating(false);
    }
  };

  // Calcular número óptimo de grupos
  const calculateOptimalGroups = () => {
    const totalPlayers = selectedPlayers.size;
    if (totalPlayers === 0) return 0;
    
    // Ajustar el tamaño del grupo si es necesario
    let optimalSize = groupSize;
    
    // Si no es múltiplo del tamaño del grupo, ajustar
    if (totalPlayers % groupSize !== 0) {
      // Intentar con 3, 4 o 5 jugadores por grupo
      for (let size = 3; size <= 5; size++) {
        if (totalPlayers % size === 0) {
          optimalSize = size;
          break;
        }
      }
    }
    
    return Math.ceil(totalPlayers / optimalSize);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 animate-pulse">
            <div className="h-6 bg-slate-600 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 bg-slate-600 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mensajes de error y éxito */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-500 text-white p-4 rounded-lg">
          <p>{success}</p>
          <button 
            onClick={() => setSuccess(null)}
            className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Controles de competición y ciudad */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Crear Grupos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Competición *</label>
            <select
              value={selectedCompetition}
              onChange={(e) => {
                setSelectedCompetition(e.target.value);
                const competition = competitions.find(c => c.id === e.target.value);
                if (competition) {
                  setSelectedCity(competition.city);
                }
              }}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 px-3 py-2"
              required
            >
              <option value="">Selecciona una competición</option>
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.name} ({competition.city}) {competition.isActive && "✓"}
                </option>
              ))}
            </select>
            {selectedCompetition === "" && (
              <p className="text-red-400 text-xs mt-1">Debes seleccionar una competición</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value as City | 'ALL')}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 px-3 py-2"
            >
              <option value="ALL">Todas las ciudades</option>
              <option value={City.MADRID}>Madrid</option>
              <option value={City.ZARAGOZA}>Zaragoza</option>
              <option value={City.VALLADOLID}>Valladolid</option>
            </select>
          </div>
        </div>

        {/* Controles de selección */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white">Jugadores disponibles: {availablePlayers.length}</p>
            <p className="text-sm text-gray-400">
              Seleccionados: {selectedPlayers.size}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Jugadores por grupo</label>
              <select
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value))}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={3}>3 jugadores</option>
                <option value={4}>4 jugadores</option>
                <option value={5}>5 jugadores</option>
              </select>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-all duration-200"
              >
                {selectedPlayers.size === availablePlayers.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Información sobre la distribución óptima */}
        {selectedPlayers.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
          >
            <p className="text-emerald-300">
              Se crearán aproximadamente {calculateOptimalGroups()} grupos de {Math.ceil(selectedPlayers.size / calculateOptimalGroups())} jugadores cada uno
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Lista de jugadores disponibles */}
      {error && availablePlayers.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-lg text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchAvailablePlayers();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {availablePlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border ${
                selectedPlayers.has(player.id)
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-slate-700/50 hover:border-slate-600/50'
              } transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.has(player.id)}
                    onChange={() => handlePlayerSelection(player.id)}
                    className="w-5 h-5 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <div className="text-2xl">👤</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {player.name} {player.lastName}
                    </h3>
                    <p className="text-sm text-gray-400">{player.email}</p>
                    {player.zone && (
                      <p className="text-xs text-gray-500">
                        <span className="text-teal-400">Zona:</span> {player.zone.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-400">
                    <span className="text-emerald-400">HCP:</span> {player.handicap || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ciudad: {player.city}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Botón de acción */}
      {selectedPlayers.size > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={handleCreateGroups}
              disabled={isCreating || !selectedCompetition}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 font-semibold shadow-lg transition-all duration-200"
            >
              {isCreating ? "Creando grupos..." : "Crear Grupos"}
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Resultados de grupos creados */}
      {createdGroups.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Grupos Creados</h3>
          <div className="space-y-4">
            {createdGroups.map((group, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20"
              >
                <h4 className="font-semibold text-emerald-300 mb-2">{group.name}</h4>
                <p className="text-sm text-gray-300 mb-2">{group.players.length} jugadores</p>
                <div className="space-y-1">
                  {group.players.map((player: any, playerIndex: number) => (
                    <p key={playerIndex} className="text-xs text-gray-400">
                      {player.name} {player.lastName} (HCP: {player.handicap})
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}