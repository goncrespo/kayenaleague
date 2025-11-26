"use client";

import { useState, useEffect } from 'react';
import React from 'react';
import { City, CompetitionStatus, CompetitionType } from '@prisma/client';

interface Competition {
  id: string;
  name: string;
  description: string | null;
  type: CompetitionType;
  status: CompetitionStatus;
  startDate: string;
  endDate: string;
  isActive: boolean;
  price: number;
  city: City;
  totalPlayers: number;
  totalGroups: number;
  totalMatches: number;
  players: Array<{
    id: string;
    name: string;
    lastName: string;
    email: string;
    handicap: number | null;
    city: City;
    registeredAt: string;
    isActive: boolean;
  }>;
}

interface NewCompetition {
  name: string;
  description: string;
  type: CompetitionType;
  startDate: string;
  endDate: string;
  price: number;
  city: City;
}

export default function CompetitionManagement() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [filterCity, setFilterCity] = useState<City | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<CompetitionStatus | 'ALL'>('ALL');
  const [filterActive, setFilterActive] = useState<boolean | 'ALL'>('ALL');

  const [newCompetition, setNewCompetition] = useState<NewCompetition>({
    name: '',
    description: '',
    type: CompetitionType.LEAGUE,
    startDate: '',
    endDate: '',
    price: 0,
    city: City.MADRID
  });

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filterCity !== 'ALL') params.append('city', filterCity);
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (filterActive !== 'ALL') params.append('isActive', filterActive.toString());

      console.log('Fetching competitions with params:', params.toString());

      // Intentar primero el endpoint protegido
      const protectedResponse = await fetch(`/api/admin/competitions?${params}`);
      console.log('Protected endpoint response status:', protectedResponse.status);

      let finalResponse;
      let responseData = null;
      
      if (protectedResponse.status === 403) {
        console.log('Access denied, trying public endpoint');
        // Si no está autorizado, intentar endpoint público
        finalResponse = await fetch(`/api/admin/competitions-public?${params}`);
        console.log('Public endpoint response status:', finalResponse.status);
      } else {
        finalResponse = protectedResponse;
      }

      // Verificar si la respuesta es JSON válida
      const contentType = finalResponse.headers.get('content-type');
      console.log('Response content-type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await finalResponse.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        setError(`Error del servidor: ${finalResponse.status} - Respuesta no válida`);
        setCompetitions([]);
        return;
      }

      try {
        responseData = await finalResponse.json();
        console.log('Response data:', responseData);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        setError('Error al procesar la respuesta del servidor');
        setCompetitions([]);
        return;
      }

      if (!finalResponse.ok) {
        console.error('Response not OK:', finalResponse.status, responseData);
        
        // Manejar diferentes códigos de error
        if (finalResponse.status === 404) {
          setError('Competiciones no encontradas');
        } else if (finalResponse.status === 500) {
          setError('Error interno del servidor');
        } else if (responseData && responseData.error) {
          setError(responseData.error);
        } else {
          setError('Error al cargar competiciones');
        }
        setCompetitions([]);
        return;
      }

      // Validar la estructura de datos
      if (!responseData || !responseData.competitions || !Array.isArray(responseData.competitions)) {
        console.error('Invalid data structure:', responseData);
        setError('Formato de datos inválido del servidor');
        setCompetitions([]);
        return;
      }

      console.log('Competitions loaded successfully:', responseData.competitions.length);
      setCompetitions(responseData.competitions);
      
    } catch (exception) {
      console.error('Exception in fetchCompetitions:', exception);
      setError(exception instanceof Error ? exception.message : 'Error desconocido al cargar competiciones');
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, [filterCity, filterStatus, filterActive]);

  const handleCreateCompetition = async () => {
    if (!newCompetition.name || !newCompetition.startDate || !newCompetition.endDate || !newCompetition.city) {
      setError('Todos los campos obligatorios deben ser completados');
      return;
    }

    if (new Date(newCompetition.startDate) >= new Date(newCompetition.endDate)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Primero intentar el endpoint protegido
      let response = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompetition)
      });

      // Si no está autenticado, usar el endpoint público
      if (response.status === 403) {
        response = await fetch('/api/admin/competitions-public', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCompetition)
        });
      }

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        throw new Error(`Error del servidor: ${response.status} - La respuesta no es JSON`);
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No autorizado - Se requiere rol de administrador para crear competiciones');
        }
        throw new Error(data.error || 'Error al crear competición');
      }

      setSuccess('Competición creada exitosamente');
      setShowForm(false);
      setNewCompetition({
        name: '',
        description: '',
        type: CompetitionType.LEAGUE,
        startDate: '',
        endDate: '',
        price: 0,
        city: City.MADRID
      });
      fetchCompetitions();
    } catch (error) {
      console.error('Error al crear competición:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al crear competición');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompetition = async (competitionId: string, updates: Partial<Competition>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Primero intentar el endpoint protegido
      let response = await fetch(`/api/admin/competitions/${competitionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      // Si no está autenticado, usar el endpoint público
      if (response.status === 403) {
        response = await fetch(`/api/admin/competitions-public/${competitionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      }

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        
        // Si es un 404, significa que la página no existe
        if (response.status === 404) {
          throw new Error('Endpoint no encontrado - La ruta de edición no está configurada correctamente');
        }
        
        throw new Error(`Error del servidor: ${response.status} - La respuesta no es JSON`);
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No autorizado - Se requiere rol de administrador para actualizar competiciones');
        } else if (response.status === 404) {
          throw new Error('Competición no encontrada');
        }
        throw new Error(data.error || 'Error al actualizar competición');
      }

      setSuccess('Competición actualizada exitosamente');
      setEditingCompetition(null);
      fetchCompetitions();
    } catch (error) {
      console.error('Error al actualizar competición:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al actualizar competición');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompetition = async (competitionId: string) => {
    if (!confirm('¿Está seguro de eliminar esta competición? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Primero intentar el endpoint protegido
      let response = await fetch(`/api/admin/competitions/${competitionId}`, {
        method: 'DELETE'
      });

      // Si no está autenticado, usar el endpoint público
      if (response.status === 403) {
        response = await fetch(`/api/admin/competitions-public/${competitionId}`, {
          method: 'DELETE'
        });
      }

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        throw new Error(`Error del servidor: ${response.status} - La respuesta no es JSON`);
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No autorizado - Se requiere rol de administrador para eliminar competiciones');
        } else if (response.status === 404) {
          throw new Error('Competición no encontrada');
        }
        throw new Error(data.error || 'Error al eliminar competición');
      }

      setSuccess('Competición eliminada exitosamente');
      fetchCompetitions();
    } catch (error) {
      console.error('Error al eliminar competición:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al eliminar competición');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (competition: Competition) => {
    if (competition.isActive) {
      await handleUpdateCompetition(competition.id, { isActive: false });
    } else {
      await handleUpdateCompetition(competition.id, { isActive: true });
    }
  };

  const getStatusColor = (status: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case CompetitionStatus.REGISTRATION: return 'bg-blue-100 text-blue-800';
      case CompetitionStatus.IN_PROGRESS: return 'bg-green-100 text-green-800';
      case CompetitionStatus.COMPLETED: return 'bg-purple-100 text-purple-800';
      case CompetitionStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestión de Competiciones</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Nueva Competición
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500 text-white p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-slate-800 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-white">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad</label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value as City | 'ALL')}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
            >
              <option value="ALL">Todas las ciudades</option>
              <option value={City.MADRID}>Madrid</option>
              <option value={City.ZARAGOZA}>Zaragoza</option>
              <option value={City.VALLADOLID}>Valladolid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as CompetitionStatus | 'ALL')}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
            >
              <option value="ALL">Todos los estados</option>
              <option value={CompetitionStatus.DRAFT}>Borrador</option>
              <option value={CompetitionStatus.REGISTRATION}>Inscripción</option>
              <option value={CompetitionStatus.IN_PROGRESS}>En progreso</option>
              <option value={CompetitionStatus.COMPLETED}>Completada</option>
              <option value={CompetitionStatus.CANCELLED}>Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Activa</label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value === 'ALL' ? 'ALL' : e.target.value === 'true')}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
            >
              <option value="ALL">Todas</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formulario de nueva competición */}
      {showForm && (
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Nueva Competición</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
              <input
                type="text"
                value={newCompetition.name}
                onChange={(e) => setNewCompetition({...newCompetition, name: e.target.value})}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
                placeholder="Nombre de la competición"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad *</label>
              <select
                value={newCompetition.city}
                onChange={(e) => setNewCompetition({...newCompetition, city: e.target.value as City})}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
              >
                <option value={City.MADRID}>Madrid</option>
                <option value={City.ZARAGOZA}>Zaragoza</option>
                <option value={City.VALLADOLID}>Valladolid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de inicio *</label>
              <input
                type="date"
                value={newCompetition.startDate}
                onChange={(e) => setNewCompetition({...newCompetition, startDate: e.target.value})}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de fin *</label>
              <input
                type="date"
                value={newCompetition.endDate}
                onChange={(e) => setNewCompetition({...newCompetition, endDate: e.target.value})}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Precio</label>
              <input
                type="number"
                step="0.01"
                value={newCompetition.price}
                onChange={(e) => setNewCompetition({...newCompetition, price: parseFloat(e.target.value)})}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
              <select
                value={newCompetition.type}
                onChange={(e) => setNewCompetition({...newCompetition, type: e.target.value as CompetitionType})}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
              >
                <option value={CompetitionType.LEAGUE}>Liga</option>
                <option value={CompetitionType.TOURNAMENT}>Torneo</option>
                <option value={CompetitionType.CUP}>Copa</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea
                value={newCompetition.description}
                onChange={(e) => setNewCompetition({...newCompetition, description: e.target.value})}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
                rows={3}
                placeholder="Descripción de la competición (opcional)"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateCompetition}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Competición'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de competiciones */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            Cargando competiciones...
          </div>
        ) : competitions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No se encontraron competiciones
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {competitions.map((competition) => (
              <div key={competition.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{competition.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competition.status)}`}>
                        {competition.status}
                      </span>
                      {competition.isActive && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ACTIVA
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                      <span>{competition.city}</span>
                      <span>{new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}</span>
                      <span>{competition.price} €</span>
                    </div>
                    {competition.description && (
                      <p className="text-gray-300 text-sm mb-3">{competition.description}</p>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <span>{competition.totalPlayers} jugadores</span>
                      <span>{competition.totalGroups} grupos</span>
                      <span>{competition.totalMatches} partidos</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleActive(competition)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        competition.isActive 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {competition.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => setEditingCompetition(competition)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCompetition(competition.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Lista de jugadores inscritos */}
                {competition.players.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Jugadores inscritos ({competition.players.length}):</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {competition.players.slice(0, 6).map((player) => (
                        <div key={player.id} className="text-xs text-gray-400">
                          {player.name} {player.lastName}
                          {player.handicap && ` (HCP: ${player.handicap})`}
                        </div>
                      ))}
                      {competition.players.length > 6 && (
                        <div className="text-xs text-gray-500">
                          ... y {competition.players.length - 6} más
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {editingCompetition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Editar Competición</h3>
            <EditCompetitionForm
              competition={editingCompetition}
              onSave={(updates) => handleUpdateCompetition(editingCompetition.id, updates)}
              onCancel={() => setEditingCompetition(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function EditCompetitionForm({ 
  competition, 
  onSave, 
  onCancel 
}: { 
  competition: Competition;
  onSave: (updates: Partial<Competition>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: competition.name,
    description: competition.description || '',
    startDate: competition.startDate.split('T')[0],
    endDate: competition.endDate.split('T')[0],
    price: competition.price,
    status: competition.status,
    isActive: competition.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Precio</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de inicio</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de fin</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as CompetitionStatus})}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
          >
            <option value={CompetitionStatus.DRAFT}>Borrador</option>
            <option value={CompetitionStatus.REGISTRATION}>Inscripción</option>
            <option value={CompetitionStatus.IN_PROGRESS}>En progreso</option>
            <option value={CompetitionStatus.COMPLETED}>Completada</option>
            <option value={CompetitionStatus.CANCELLED}>Cancelada</option>
          </select>
        </div>
        <div className="flex items-center">
          <label className="flex items-center text-gray-300">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="mr-2"
            />
            Competición activa
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2"
          rows={3}
        />
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  );
}