"use client";

import { useState, useEffect } from "react";
import { createGroups, generateGroupMatches, createKnockoutStage } from "./actions";
import LeagueInfo from "./components/LeagueInfo";
import CreateLeagueForm from "./components/CreateLeagueForm";
import PlayerZoneSelector from "./components/PlayerZoneSelector";
// Lazy import to avoid type resolution hiccups during dev
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PlayersManager from "./components/PlayersManager";

interface AdminAction {
  id: string;
  name: string;
  description: string;
  action: (param: string) => Promise<{ success: boolean; message: string }>;
  inputLabel: string;
  inputPlaceholder: string;
  buttonText: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminPage() {
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ type: "success" | "error"; text: string }[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"leagues" | "groups" | "matches" | "knockout" | "players">("leagues");
  const [selectedLeagueForGroups, setSelectedLeagueForGroups] = useState("");
  const [availableLeagues, setAvailableLeagues] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchAdminUser = async () => {
      try {
        const response = await fetch("/api/admin/me");
        if (response.ok) {
          const userData = await response.json();
          setAdminUser(userData);
        }
      } catch (error) {
        console.error("Error fetching admin user:", error);
      }
    };

    const fetchLeagues = async () => {
      try {
        const res = await fetch("/api/admin/leagues");
        if (res.ok) {
          const data = await res.json();
          const mapped = (data || []).map((l: { id: string; name: string }) => ({ id: l.id, name: l.name }));
          setAvailableLeagues(mapped);
          if (!selectedLeagueForGroups && mapped.length > 0) {
            setSelectedLeagueForGroups(mapped[0].id);
          }
        }
      } catch {
        // noop
      }
    };

    // Obtener información del usuario administrador actual
    fetchAdminUser();
    // Cargar ligas disponibles
    fetchLeagues();
  }, [selectedLeagueForGroups]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Redirigir al login
        window.location.href = "/admin/login";
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleLeagueCreated = (leagueId: string) => {
    setSelectedLeagueForGroups(leagueId);
    setActiveTab("groups");
    setMessages([{ type: "success", text: "Liga creada exitosamente. Ahora puedes configurar los grupos." }]);
  };

  const handleCreateGroups = async (playersPerGroup: number) => {
    if (!selectedLeagueForGroups) {
      setMessages([{ type: "error", text: "Selecciona una liga primero" }]);
      return;
    }

    setLoading("create-groups");
    setMessages([]);

    try {
      const result = await createGroups(selectedLeagueForGroups, playersPerGroup);

      if (result.success) {
        setMessages([{ type: "success", text: result.message }]);
        setActiveTab("matches");
      } else {
        setMessages([{ type: "error", text: result.message }]);
      }
    } catch {
      setMessages([{ type: "error", text: "Error inesperado al crear grupos" }]);
    } finally {
      setLoading(null);
    }
  };

  const adminActions: AdminAction[] = [
    {
      id: "create-groups",
      name: "Crear Grupos",
      description: "Agrupa a los usuarios suscritos por zona y crea grupos de 4 jugadores cada uno.",
      action: createGroups,
      inputLabel: "ID de la Liga",
      inputPlaceholder: "Ingresa el ID de la liga",
      buttonText: "Crear Grupos"
    },
    {
      id: "generate-matches",
      name: "Generar Partidos de Grupo",
      description: "Genera los partidos de todos contra todos para un grupo específico.",
      action: generateGroupMatches,
      inputLabel: "ID del Grupo",
      inputPlaceholder: "Ingresa el ID del grupo",
      buttonText: "Generar Partidos"
    },
    {
      id: "create-knockout",
      name: "Crear Fase de Eliminatorias",
      description: "Crea la fase de eliminatorias basada en la clasificación de los grupos.",
      action: createKnockoutStage,
      inputLabel: "ID de la Liga",
      inputPlaceholder: "Ingresa el ID de la liga",
      buttonText: "Crear Eliminatorias"
    }
  ];

  const handleAction = async (action: AdminAction) => {
    const inputValue = action.id === "generate-matches" ? selectedGroupId : selectedLeagueId;

    if (!inputValue.trim()) {
      setMessages([{ type: "error", text: "Por favor, ingresa un ID válido" }]);
      return;
    }

    setLoading(action.id);
    setMessages([]);

    try {
      const result = await action.action(inputValue);

      if (result.success) {
        setMessages([{ type: "success", text: result.message }]);
        // Limpiar inputs después de éxito
        if (action.id === "create-groups" || action.id === "create-knockout") {
          setSelectedLeagueId("");
        } else {
          setSelectedGroupId("");
        }
      } else {
        setMessages([{ type: "error", text: result.message }]);
      }
    } catch {
      setMessages([{ type: "error", text: "Error inesperado al ejecutar la acción" }]);
    } finally {
      setLoading(null);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Panel de Administración - Kayena League
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Gestiona la competición de golf desde este panel
                </p>
              </div>

              <div className="text-right">
                {adminUser && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">
                      Bienvenido, <span className="font-medium">{adminUser.name}</span>
                    </p>
                    <p className="text-xs text-gray-500">{adminUser.email}</p>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${logoutLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                >
                  {logoutLoading ? "Cerrando..." : "Cerrar Sesión"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Mensajes de estado */}
            {messages.length > 0 && (
              <div className="mb-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-md mb-2 ${message.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{message.text}</span>
                      <button
                        onClick={clearMessages}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pestañas de navegación */}
            <div className="mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: "leagues", name: "Ligas", icon: "🏆" },
                  { id: "groups", name: "Grupos", icon: "👥" },
                  { id: "matches", name: "Partidos", icon: "⚽" },
                  { id: "knockout", name: "Eliminatorias", icon: "🎯" },
                  { id: "players", name: "Jugadores", icon: "🧑‍🤝‍🧑" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "leagues" | "groups" | "matches" | "knockout" | "players")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenido de las pestañas */}
            <div className="space-y-6">
              {activeTab === "leagues" && (
                <div className="space-y-6">
                  <CreateLeagueForm onLeagueCreated={handleLeagueCreated} />

                  {selectedLeagueForGroups && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Liga Seleccionada</h4>
                      <p className="text-sm text-blue-800">
                        ID: <code className="bg-blue-100 px-1 rounded">{selectedLeagueForGroups}</code>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Ve a la pestaña &quot;Grupos&quot; para configurar los grupos de esta liga.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "groups" && (
                <div className="space-y-6">
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Liga</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <div>
                        <label htmlFor="leagueSelect" className="block text-sm font-medium text-gray-700 mb-2">Liga</label>
                        <select
                          id="leagueSelect"
                          value={selectedLeagueForGroups}
                          onChange={(e) => setSelectedLeagueForGroups(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {availableLeagues.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="text-sm text-gray-500">
                        {availableLeagues.length === 0 && (
                          <span>No hay ligas disponibles. Crea una en la pestaña Ligas.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedLeagueForGroups ? (
                    <PlayerZoneSelector
                      leagueId={selectedLeagueForGroups}
                      onCreateGroups={handleCreateGroups}
                      loading={loading === "create-groups"}
                    />
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <h3 className="text-lg font-medium text-yellow-800 mb-2">
                        Selecciona una Liga Primero
                      </h3>
                      <p className="text-yellow-700">
                        Crea o selecciona una liga para configurar los grupos.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "matches" && (
                <div className="space-y-6">
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Generar Partidos de Grupo
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Genera los partidos de todos contra todos para un grupo específico.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-2">
                          ID del Grupo
                        </label>
                        <input
                          type="text"
                          id="groupId"
                          value={selectedGroupId}
                          onChange={(e) => setSelectedGroupId(e.target.value)}
                          placeholder="Ingresa el ID del grupo"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <button
                        onClick={() => handleAction(adminActions.find(a => a.id === "generate-matches")!)}
                        disabled={loading === "generate-matches" || !selectedGroupId}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${loading === "generate-matches" || !selectedGroupId
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          }`}
                      >
                        {loading === "generate-matches" ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generando Partidos...
                          </div>
                        ) : (
                          "Generar Partidos"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "knockout" && (
                <div className="space-y-6">
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Crear Fase de Eliminatorias
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Crea la fase de eliminatorias basada en la clasificación de los grupos.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="leagueId" className="block text-sm font-medium text-gray-700 mb-2">
                          ID de la Liga
                        </label>
                        <input
                          type="text"
                          id="leagueId"
                          value={selectedLeagueId}
                          onChange={(e) => setSelectedLeagueId(e.target.value)}
                          placeholder="Ingresa el ID de la liga"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <button
                        onClick={() => handleAction(adminActions.find(a => a.id === "create-knockout")!)}
                        disabled={loading === "create-knockout" || !selectedLeagueId}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${loading === "create-knockout" || !selectedLeagueId
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          }`}
                      >
                        {loading === "create-knockout" ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creando Eliminatorias...
                          </div>
                        ) : (
                          "Crear Eliminatorias"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "players" && (
                <div className="space-y-6">
                  <PlayersManager />
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Información Importante:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Los grupos se crean automáticamente con 4 jugadores por zona</li>
                <li>• Los partidos de grupo se generan con formato todos contra todos</li>
                <li>• La fase de eliminatorias se crea basada en la clasificación de grupos</li>
                <li>• Asegúrate de que los usuarios tengan zona asignada antes de crear grupos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Información de ligas y grupos */}
        <div className="mt-8">
          <LeagueInfo />
        </div>
      </div>
    </div>
  );
}
