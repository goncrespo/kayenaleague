"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Crown, Star } from "lucide-react";

export default function Step05Final() {
    return (
        <div className="h-full flex flex-col items-center justify-center relative overflow-hidden rounded-2xl">
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />

            <div className="relative z-10 w-full max-w-4xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold mb-4">
                        ABIERTO PARA TODOS
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
                        El Evento Final
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    {/* Card 1: League Winner */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-black/60 border border-emerald-500/30 p-6 rounded-xl backdrop-blur-md text-left group hover:bg-black/80 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                            <Crown size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Ganador de la Liga</h3>
                        <p className="text-gray-400 text-sm">
                            Se corona al campeón de la temporada regular tras las eliminatorias. Trofeo exclusivo y premios de patrocinadores.
                        </p>
                    </motion.div>

                    {/* Card 2: Tournament Winner */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-black/60 border border-white/10 p-6 rounded-xl backdrop-blur-md text-left group hover:bg-black/80 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                            <Star size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Ganador del Torneo</h3>
                        <p className="text-gray-400 text-sm">
                            Un torneo paralelo de un día abierto a todos los participantes de la liga. Formato Stableford.
                        </p>
                    </motion.div>
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-emerald-400" />
                        <span>Campo de Golf de primer nivel</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-emerald-400" />
                        <span>Mayo 2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-emerald-400" />
                        <span>+70 Jugadores</span>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-10 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-emerald-400 transition-colors shadow-lg"
                >
                    Ver detalles del evento
                </motion.button>
            </div>
        </div>
    );
}
