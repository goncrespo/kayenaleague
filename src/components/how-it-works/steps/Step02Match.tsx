"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle } from "lucide-react";

export default function Step02Match() {
    const [allowBo2, setAllowBo2] = useState(false);

    const holes = [
        { id: 1, result: "WIN", color: "bg-emerald-500", text: "Ganado" },
        { id: 2, result: "LOSS", color: "bg-red-500", text: "Perdido" },
        { id: 3, result: "TIE", color: "bg-amber-500", text: "Empate" },
    ];

    return (
        <div className="h-full flex flex-col items-center justify-center gap-10">
            <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 mb-4">
                    <Target size={16} className="text-emerald-400" />
                    <span className="text-sm font-medium">Match Play Bo3</span>
                </div>
                <h3 className="text-2xl font-bold">El mejor de 3 rondas</h3>
                <p className="text-gray-400 mt-2 max-w-md mx-auto">
                    Cada partido se decide en rondas. El jugador que gane 2, se llevará el enfrentamiento.
                </p>
            </div>

            {/* Scorecard Visualization */}
            <div className="flex gap-4">
                {holes.map((hole, i) => (
                    <motion.div
                        key={hole.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative group"
                    >
                        <div className="w-24 h-32 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors cursor-default overflow-hidden">
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Ronda {hole.id}</span>
                            <div className={`w-12 h-12 rounded-full ${hole.color} flex items-center justify-center text-black font-bold shadow-lg`}>
                                {hole.result[0]}
                            </div>
                        </div>

                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {hole.text}
                            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-white/20 rotate-45" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Toggle Switch */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 max-w-md w-full">
                <div
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${allowBo2 ? "bg-emerald-500" : "bg-gray-600"}`}
                    onClick={() => setAllowBo2(!allowBo2)}
                >
                    <motion.div
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{ x: allowBo2 ? 24 : 0 }}
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Permitir Bo2</span>
                        {allowBo2 && <CheckCircle size={14} className="text-emerald-400" />}
                    </div>
                    <p className="text-xs text-gray-400">Si ambos jugadores están de acuerdo, podrán jugárselo todo a una ronda.</p>
                </div>
            </div>
        </div>
    );
}
