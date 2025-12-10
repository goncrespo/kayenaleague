"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Activity } from "lucide-react";

export default function Step06Handicap() {
    const [sliderValue, setSliderValue] = useState(50);

    const rounds = [
        { id: 1, hcp: "12.4", change: "+0.1" },
        { id: 2, hcp: "12.5", change: "+0.1" },
        { id: 3, hcp: "12.3", change: "-0.2" },
        { id: 4, hcp: "12.0", change: "-0.3" },
        { id: 5, hcp: "11.8", change: "-0.2" },
    ];

    return (
        <div className="h-full flex flex-col items-center justify-center gap-20">
            <div className="text-center max-w-lg">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 mb-4">
                    <Activity size={14} />
                    SISTEMA DINÁMICO
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Tu juego evoluciona, tu hándicap también.</h3>
                <p className="text-gray-400">
                    Ajustamos tu hándicap jornada a jornada basándonos en tus resultados para mantener la liga justa y competitiva.
                </p>
            </div>

            <div className="w-full max-w-3xl relative px-8">
                {/* Timeline Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 rounded-full -translate-y-1/2" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-emerald-500 rounded-full -translate-y-1/2 transition-all duration-300"
                    style={{ width: `${sliderValue}%` }}
                />

                {/* Rounds Points */}
                <div className="relative flex justify-between">
                    {rounds.map((round, i) => {
                        const position = (i / (rounds.length - 1)) * 100;
                        const isActive = position <= sliderValue;

                        return (
                            <div key={round.id} className="relative flex flex-col items-center group cursor-pointer" onClick={() => setSliderValue(position)}>
                                <div
                                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 z-10 ${isActive ? "bg-emerald-500 border-emerald-500 scale-125" : "bg-black border-white/20"
                                        }`}
                                />

                                {/* Tooltip always visible for active or on hover */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
                                    className={`absolute -bottom-24 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-lg text-center min-w-[80px] transition-all ${isActive ? "scale-110 border-emerald-500/50" : "scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"}`}
                                >
                                    <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white/10 border-l border-t border-white/20 rotate-45" />
                                    <div className="text-xs text-gray-400 font-mono mb-0.5">J{round.id}</div>
                                    <div className="text-sm font-bold text-white">{round.hcp}</div>
                                    <div className={`text-[10px] font-bold ${round.change.startsWith("-") ? "text-emerald-400" : "text-red-400"}`}>
                                        {round.change}
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                {/* Interactive Slider (Invisible but functional overlay) */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mt-12">
                <Settings size={14} />
                <span>Desliza para ver la evolución</span>
            </div>
        </div>
    );
}
