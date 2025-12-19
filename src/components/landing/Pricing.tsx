"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default function Pricing() {
  const [activeCity, setActiveCity] = useState("MADRID");

  const perks = [
    "Acceso a la plataforma y app",
    "Organización de calendario y cuadros",
    "Ajuste de hándicap y estadísticas",
    "Acceso a la comunidad y eventos",
    "Polo personalizado de regalo al inscribirte",
  ];

  const seasons = [
    {
      id: "MADRID",
      label: "MADRID",
      start: "23 Feb",
      close: "16 Feb",
    },
    {
      id: "MARBELLA",
      label: "MARBELLA",
      start: "23 Feb",
      close: "16 Feb",
    },
    {
      id: "BARCELONA",
      label: "BCN",
      start: "23 Feb",
      close: "16 Feb",
    },
  ];

  const currentSeason = seasons.find(s => s.id === activeCity) || seasons[0];

  return (
    <section className="py-32 relative overflow-hidden" aria-labelledby="pricing-title">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 id="pricing-title" className="text-3xl md:text-5xl font-bold mb-6">Apúntate y empieza a competir.</h2>
          <p className="text-gray-300 text-lg">Sin cuotas mensuales ocultas. Un único pago por temporada.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="card relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500 h-full flex flex-col">
              <div className="absolute -inset-px bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Header Section */}
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-4 py-1.5 text-sm font-semibold mb-6">
                    <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 4l-2 2-3 1v13h6V10h4v10h6V7l-3-1-2-2-2 2h-2L9 4z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                    </svg>
                    <span>Polo personalizado de regalo</span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-6xl font-black text-white tracking-tight">40€</span>
                    <span className="text-xl text-gray-400 font-medium">/ Temporada</span>
                  </div>

                  <p className="text-gray-200 mb-8 text-lg">Incluye todo lo necesario para disfrutar de la liga durante una temporada completa.</p>

                  <ul className="space-y-4 mb-8">
                    {perks.map((p, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-400 text-sm font-bold">✓</span>
                        </div>
                        <span className="text-gray-100">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 my-6"></div>

                {/* Tab System */}
                <div className="flex-grow flex flex-col">
                  {/* City Tabs */}
                  <div className="flex p-1 bg-white/5 rounded-xl gap-1 mb-8">
                    {seasons.map((season) => (
                      <button
                        key={season.id}
                        onClick={() => setActiveCity(season.id)}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 ${activeCity === season.id
                          ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {season.label}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Info */}
                  <div className="text-center space-y-3 mb-8">
                    <div className="flex items-center justify-center gap-2 text-xl font-bold text-white">
                      <Calendar className="w-5 h-5 text-emerald-500" />
                      <span>Inicio: {currentSeason.start}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="text-sm text-red-400 font-medium">Cierre inscripciones: {currentSeason.close}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <Link
                      href={`/register?city=${activeCity}`}
                      className="btn-primary w-full text-lg group-hover:shadow-[0_0_40px_rgba(52,211,153,0.4)]"
                    >
                      UNIRSE
                    </Link>
                    <p className="text-center text-sm text-gray-400 mt-4">Plazas limitadas por zona de juego.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-gray-300 space-y-6 p-6 lg:border-l border-white/10">
            <div>
              <h3 className="font-semibold text-white text-lg mb-2">¿Por qué ahora?</h3>
              <p>Garantiza tu plaza desde el inicio de la temporada y aprovecha el mejor precio.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg mb-2">Comunidad</h3>
              <p>Compite a tu ritmo y conoce a gente con tu misma pasión por el golf.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg mb-2">Garantía</h3>
              <p>Si no se forma grupo en tu zona, te devolvemos el dinero íntegramente.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
