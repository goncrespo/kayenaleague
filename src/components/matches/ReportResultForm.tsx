"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Match {
  id: string;
  roundNumber: number;
  status: string;
  isHome: boolean;
  opponent: {
    name: string | null;
    lastName: string | null;
    handicap: number;
  };
  userScore?: number;
  opponentScore?: number;
}

interface ReportResultFormProps {
  match: Match;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReportResultForm({ match, onSuccess, onCancel }: ReportResultFormProps) {
  const router = useRouter();
  const [homeScore, setHomeScore] = useState(match.userScore?.toString() || "");
  const [awayScore, setAwayScore] = useState(match.opponentScore?.toString() || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación
    if (!homeScore || !awayScore) {
      setError("Por favor, ingresa los puntos de ambos jugadores");
      return;
    }

    const homeScoreNum = parseInt(homeScore);
    const awayScoreNum = parseInt(awayScore);

    if (homeScoreNum < 0 || awayScoreNum < 0) {
      setError("Los puntos no pueden ser negativos");
      return;
    }

    if (homeScoreNum > 18 || awayScoreNum > 18) {
      setError("Los puntos no pueden ser mayores a 18 (número máximo de hoyos)");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/user/matches/${match.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeScore: match.isHome ? homeScoreNum : awayScoreNum,
          awayScore: match.isHome ? awayScoreNum : homeScoreNum,
          notes: notes.trim() || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al reportar el resultado");
      }

      // Éxito
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirigir al dashboard o a la página del partido
        router.push(`/dashboard/matches/${match.id}?success=true`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResultText = () => {
    const homeNum = parseInt(homeScore) || 0;
    const awayNum = parseInt(awayScore) || 0;
    
    if (match.isHome) {
      if (homeNum > awayNum) return "Victoria";
      if (homeNum < awayNum) return "Derrota";
      return "Empate";
    } else {
      if (awayNum > homeNum) return "Victoria";
      if (awayNum < homeNum) return "Derrota";
      return "Empate";
    }
  };

  const getResultColor = () => {
    const result = getResultText();
    switch (result) {
      case "Victoria": return "text-green-600";
      case "Derrota": return "text-red-600";
      case "Empate": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg p-6 shadow-lg border max-w-2xl mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reportar Resultado</h2>
        <p className="text-gray-600">
          Jornada {match.roundNumber} vs {match.opponent.name} {match.opponent.lastName}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Marcador */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Marcador</h3>
          
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Local */}
            <div className="text-center">
              <p className={`text-sm font-medium mb-2 ${
                match.isHome ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {match.isHome ? 'Tú (Local)' : 'Oponente'}
              </p>
              <input
                type="number"
                min="0"
                max="18"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="w-20 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                placeholder="0"
                required
              />
            </div>

            {/* Separador */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">VS</div>
            </div>

            {/* Visitante */}
            <div className="text-center">
              <p className={`text-sm font-medium mb-2 ${
                !match.isHome ? 'text-red-600' : 'text-gray-600'
              }`}>
                {!match.isHome ? 'Tú (Visitante)' : 'Oponente'}
              </p>
              <input
                type="number"
                min="0"
                max="18"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="w-20 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded focus:border-red-500 focus:outline-none"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Resultado previo */}
          {(homeScore || awayScore) && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Resultado:</p>
              <p className={`text-lg font-bold ${getResultColor()}`}>
                {getResultText()}
              </p>
            </div>
          )}
        </div>

        {/* Información del partido */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium mb-2">Información del Partido</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Jornada</p>
              <p className="font-medium">{match.roundNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Oponente</p>
              <p className="font-medium">
                {match.opponent.name} {match.opponent.lastName}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Tu posición</p>
              <p className="font-medium">{match.isHome ? 'Local' : 'Visitante'}</p>
            </div>
            <div>
              <p className="text-gray-600">Handicap oponente</p>
              <p className="font-medium">{match.opponent.handicap}</p>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notas adicionales (opcional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Condiciones del campo, incidentes, etc."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {notes.length}/500 caracteres
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Reportando..." : "Confirmar Resultado"}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
        </div>

        {/* Información importante */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h5 className="font-medium text-yellow-800 mb-2">Importante</h5>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• El resultado quedará pendiente de validación por el administrador</li>
            <li>• Asegúrate de que ambos jugadores estén de acuerdo con el resultado</li>
            <li>• En caso de disputa, contacta al administrador de la liga</li>
            <li>• Los puntos se actualizarán una vez validado el resultado</li>
          </ul>
        </div>
      </form>
    </motion.div>
  );
}