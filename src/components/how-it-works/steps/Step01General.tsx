"use client";

import { motion } from "framer-motion";
import { Users, Trophy, ArrowRight } from "lucide-react";

export default function Step01General() {
    return (
        <div className="h-full flex flex-col items-center justify-center gap-12">
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center w-full max-w-4xl">
                {/* Phase 1: Groups */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center relative group hover:border-emerald-500/30 transition-colors"
                >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                        <Users size={12} />
                        FASE DE GRUPOS
                    </div>

                    <div className="mt-4 flex justify-center gap-4 mb-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
                                    P{i}
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-gray-400">
                        Grupos de 3-5 jugadores de tu mismo nivel. Juegas contra todos a una vuelta.
                    </p>
                </motion.div>

                {/* Arrow Connector */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center text-emerald-400/50"
                >
                    <ArrowRight size={32} />
                </motion.div>

                {/* Phase 2: Eliminatories */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center relative group hover:border-amber-500/30 transition-colors"
                >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                        <Trophy size={12} />
                        ELIMINATORIAS
                    </div>

                    <div className="mt-4 flex flex-col items-center gap-2 mb-6 h-[48px] justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-900/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <Trophy size={24} />
                        </div>
                    </div>

                    <p className="text-sm text-gray-400">
                        Los mejores de cada grupo avanzan al cuadro final. Partidos a vida o muerte.
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center max-w-lg mx-auto"
            >
                <p className="text-lg text-white font-medium">
                    &quot;Compite contra gente de tu nivel, diviértete y lucha por el título.&quot;
                </p>
            </motion.div>
        </div>
    );
}
