"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ZoneInfo from "@/components/user/ZoneInfo";

interface Zone {
  id: string;
  name: string;
  description: string;
  districts: string[];
  coordinates: string | null;
  maxCapacity: number;
}

interface ZonePreference {
  id: string;
  homeZoneId: string;
  travelRange: number;
  preferences: any;
}

interface PlayerStats {
  totalMatches: number;
  wins: number;
  points: number;
}

interface Venue {
  id: string;
  name: string;
  address: string | null;
}

interface ZoneInfoData {
  userZone: Zone | null;
  zonePreference: ZonePreference | null;
  userStats: PlayerStats | null;
  playersInZone: number;
  zoneStats: {
    totalPlayers: number;
    activePlayers: number;
    totalMatches: number;
    avgHandicap: number;
    activityRate: number;
  } | null;
  availableVenues: Venue[];
  recentMatches: any[];
  canChangeZone: boolean;
}

export default function ZonePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [zoneInfo, setZoneInfo] = useState<ZoneInfoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (status === "authenticated") {
      fetchZoneInfo();
    }
  }, [status, router]);

  const fetchZoneInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/zone");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar información de zona");
      }

      setZoneInfo(data.data);
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
          <ZoneInfo isLoading={true} />
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
            onClick={fetchZoneInfo}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
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
            <h1 className="text-3xl font-bold text-gray-900">Mi Zona</h1>
            <p className="mt-2 text-lg text-gray-600">
              Información sobre tu zona de juego en Madrid
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchZoneInfo}
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

      <ZoneInfo zoneInfo={zoneInfo} isLoading={false} />

      {/* Información adicional sobre zonas */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sistema de zonas */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Sistema de Zonas de Madrid</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">NORTE</h4>
              <p className="text-sm text-blue-700">
                Chamartín, Tetuán, Chamberí, Salamanca, Fuencarral-El Pardo, San Blas-Canillejas
              </p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">SUR</h4>
              <p className="text-sm text-red-700">
                Usera, Puente de Vallecas, Villaverde, Carabanchel, Villa de Vallecas, Vicálvaro
              </p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">CENTRO</h4>
              <p className="text-sm text-yellow-700">
                Centro, Retiro, Arganzuela
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">ESTE</h4>
              <p className="text-sm text-green-700">
                Ciudad Lineal, Moratalaz, San Blas, Barajas
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">OESTE</h4>
              <p className="text-sm text-purple-700">
                Moncloa-Aravaca, Fuencarral-El Pardo, Latina, Hortaleza, Tetuán
              </p>
            </div>
          </div>
        </div>

        {/* Preferencias de viaje */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Preferencias de Viaje</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Rango de Viaje</h4>
              <p className="text-sm text-gray-600 mb-3">
                Puedes ajustar el radio de distancia que estás dispuesto a viajar para jugar tus partidos.
                Esto ayuda a encontrar oponentes y campos cercanos.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">1 km</span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={zoneInfo?.zonePreference?.travelRange || 10}
                  readOnly
                  className="flex-1"
                />
                <span className="text-sm font-medium">50 km</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Tu rango actual: <span className="font-bold">{zoneInfo?.zonePreference?.travelRange || 10} km</span>
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Consejos</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Un rango mayor te da más opciones de oponentes</li>
                <li>• Considera el tráfico y el transporte público</li>
                <li>• Algunos campos pueden requerir desplazamiento adicional</li>
                <li>• Puedes cambiar tu rango en cualquier momento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enlaces de navegación */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/dashboard/matches"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Ver Partidos en Mi Zona
        </Link>
        <Link
          href="/dashboard/stats"
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Ver Estadísticas
        </Link>
        <Link
          href="/dashboard/standings"
          className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Ver Clasificación
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