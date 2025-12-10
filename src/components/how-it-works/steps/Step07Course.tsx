"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, MessageSquare, Map, Loader2 } from "lucide-react";

export default function Step07Course() {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

    const courses = ["Golf Santander", "Centro Nacional", "Retamares", "La Herrería", "El Encín"];

    const handleSelect = () => {
        setIsSelecting(true);
        setSelectedCourse(null);

        setTimeout(() => {
            const random = courses[Math.floor(Math.random() * courses.length)];
            setSelectedCourse(random);
            setIsSelecting(false);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center gap-8">
            <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
                {/* Option 1: Random */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Shuffle size={24} />
                    </div>
                    <h3 className="font-bold text-lg">Sorteo Aleatorio</h3>
                    <p className="text-sm text-gray-400">
                        Si no hay acuerdo, la plataforma selecciona un campo neutral equidistante para ambos jugadores.
                    </p>
                </div>

                {/* Option 2: Agreement */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <MessageSquare size={24} />
                    </div>
                    <h3 className="font-bold text-lg">Mutuo Acuerdo</h3>
                    <p className="text-sm text-gray-400">
                        Podéis jugar en cualquier campo homologado que os venga bien a ambos.
                    </p>
                </div>
            </div>

            {/* Interactive Demo */}
            <div className="w-full max-w-md mt-8">
                <AnimatePresence mode="wait">
                    {!selectedCourse && !isSelecting ? (
                        <motion.button
                            key="button"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onClick={handleSelect}
                            className="w-full py-4 bg-emerald-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:shadow-[0_0_30px_rgba(52,211,153,0.6)] hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            <Shuffle size={18} />
                            Demo: Seleccionar Campo Aleatorio
                        </motion.button>
                    ) : isSelecting ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-3 text-emerald-400"
                        >
                            <Loader2 size={20} className="animate-spin" />
                            <span className="font-mono text-sm">Buscando campo neutral...</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, rotateX: 90 }}
                            animate={{ opacity: 1, rotateX: 0 }}
                            className="w-full bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/50 rounded-xl p-6 text-center relative overflow-hidden group cursor-pointer"
                            onClick={handleSelect}
                        >
                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="text-xs font-mono text-emerald-400 mb-2 uppercase tracking-widest">Campo Seleccionado</div>
                                <h3 className="text-2xl font-black text-white mb-4">{selectedCourse}</h3>
                                <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-black/40 px-3 py-1 rounded-full">
                                    <Map size={12} />
                                    <span>A 15km de ambos jugadores</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
