"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Match {
  id: string;
  roundNumber: number;
  status: string;
  deadlineDate: string;
  matchDate: string | null;
  matchType: string;
  isHome: boolean;
  opponent: {
    id: string;
    name: string | null;
    lastName: string | null;
    handicap: number;
    zone: {
      name: string;
    } | null;
    phone?: string | null;
    email?: string | null;
  };
  group: {
    name: string;
    division: {
      name: string;
      season: {
        name: string;
      };
    };
  } | null;
  userScore?: number | null;
  opponentScore?: number | null;
  isWinner?: boolean;
  canReportResult: boolean;
  canContact: boolean;
  availableVenues: Array<{
    id: string;
    name: string;
    address: string | null;
  }>;
}

interface MatchCardProps {
  match: Match;
  onUpdate?: () => void;
}

export default function MatchCard({ match, onUpdate }: MatchCardProps) {
  const [showContact, setShowContact] = useState(false);
  const [showVenues, setShowVenues] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleReportResult = async () => {
    // Redirigir a la página de reporte
    window.location.href = `/dashboard/matches/${match.id}/report`;
  };

  const handleContact = () => {
    setShowContact(!showContact);
  };

  const isOverdue = new Date() > new Date(match.deadlineDate);
  const isMatchDatePassed = match.matchDate && new Date() > new Date(match.matchDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(match.status)}`}>
            {match.status}
          </span>
          <span className="text-sm text-gray-500">
            Jornada {match.roundNumber}
          </span>
          {match.group && (
            <span className="text-sm text-gray-500">
              {match.group.name} · {match.group.division.name}
            </span>
          )}
        </div>
        
        {match.status === "COMPLETED" && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            match.isWinner ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {match.isWinner ? 'Victoria' : 'Derrota'}
          </div>
        )}
      </div>

      {/* Información del partido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {/* Jugador local */}
        <div className={`p-4 rounded-lg border-2 ${
          match.isHome ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">LOCAL</span>
            {match.isHome && <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">Tú</span>}
          </div>
          <div className="space-y-1">
            <p className="font-semibold">
              {match.isHome ? "Tú" : `${match.opponent.name} ${match.opponent.lastName}`}
            </p>
            {!match.isHome && (
              <>
                <p className="text-sm text-gray-600">HCP: {match.opponent.handicap}</p>
                {match.opponent.zone && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {match.opponent.zone.name}
                  </span>
                )}
              </>
            )}
            {match.userScore !== null && match.userScore !== undefined && (
              <p className="text-lg font-bold text-blue-600">{match.userScore} hoyos</p>
            )}
          </div>
        </div>

        {/* Jugador visitante */}
        <div className={`p-4 rounded-lg border-2 ${
          !match.isHome ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-600">VISITANTE</span>
            {!match.isHome && <span className="text-xs px-2 py-1 bg-red-600 text-white rounded">Tú</span>}
          </div>
          <div className="space-y-1">
            <p className="font-semibold">
              {!match.isHome ? "Tú" : `${match.opponent.name} ${match.opponent.lastName}`}
            </p>
            {match.isHome && (
              <>
                <p className="text-sm text-gray-600">HCP: {match.opponent.handicap}</p>
                {match.opponent.zone && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {match.opponent.zone.name}
                  </span>
                )}
              </>
            )}
            {match.opponentScore !== null && match.opponentScore !== undefined && (
              <p className="text-lg font-bold text-red-600">{match.opponentScore} hoyos</p>
            )}
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Fecha límite</p>
            <p className={`font-medium ${
              isOverdue ? 'text-red-600' : 'text-gray-900'
            }`}>
              {formatDate(match.deadlineDate)}
              {isOverdue && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Vencido</span>}
            </p>
          </div>
          {match.matchDate && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Fecha propuesta</p>
              <p className={`font-medium ${
                isMatchDatePassed ? 'text-green-600' : 'text-gray-900'
              }`}>
                {formatDateTime(match.matchDate)}
                {isMatchDatePassed && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Disponible</span>}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/dashboard/matches/${match.id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Ver Detalles
        </Link>

        {match.canContact && (
          <button
            onClick={handleContact}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Contactar
          </button>
        )}

        {match.availableVenues.length > 0 && (
          <button
            onClick={() => setShowVenues(!showVenues)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Ver Campos ({match.availableVenues.length})
          </button>
        )}

        {match.canReportResult && match.status === "PENDING" && !isOverdue && (
          <button
            onClick={handleReportResult}
            disabled={isReporting}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {isReporting ? "Reportando..." : "Reportar Resultado"}
          </button>
        )}

        {isOverdue && match.status === "PENDING" && (
          <span className="px-4 py-2 bg-red-100 text-red-800 rounded border border-red-200">
            Plazo Vencido
          </span>
        )}
      </div>

      {/* Información de contacto */}
      {showContact && match.canContact && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <h4 className="font-medium mb-2">Información de Contacto</h4>
          <div className="space-y-2">
            {match.opponent.phone && (
              <p className="text-sm">
                <span className="font-medium">Teléfono:</span> {match.opponent.phone}
              </p>
            )}
            {match.opponent.email && (
              <p className="text-sm">
                <span className="font-medium">Email:</span> {match.opponent.email}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Por favor, sé respetuoso al contactar a tu oponente.
          </p>
        </motion.div>
      )}

      {/* Lista de campos */}
      {showVenues && match.availableVenues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg"
        >
          <h4 className="font-medium mb-3">Campos de Golf Disponibles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {match.availableVenues.map((venue) => (
              <div key={venue.id} className="p-3 bg-white rounded border">
                <h5 className="font-medium">{venue.name}</h5>
                {venue.address && (
                  <p className="text-sm text-gray-600">{venue.address}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}