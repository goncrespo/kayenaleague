"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { GitBranch, Trophy } from "lucide-react";

export default function Step04Bracket() {
    const [activeCategory, setActiveCategory] = useState("Scratch");
    const categories = ["Scratch", "Hándicap 0-12", "Hándicap 13-24", "Hándicap 25+"];

    const pathVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 1.5, ease: "easeInOut" }
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center gap-8">
            <div className="text-center space-y-4 max-w-lg">
                <h2 className="text-3xl font-bold text-white">Fase Final</h2>
                <p className="text-gray-400 text-lg">
                    El resultado en la fase regular determinará tu posición en el cuadro final.
                </p>
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap justify-center gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                            ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Bracket Visualization */}
            <div className="relative w-full max-w-3xl h-64 bg-white/5 border border-white/10 rounded-2xl p-8 flex items-center justify-between overflow-hidden">
                {/* Quarter Finals */}
                <div className="flex flex-col justify-between h-full z-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-24 h-8 bg-black/40 border border-white/10 rounded flex items-center px-2">
                            <div className="w-4 h-4 rounded-full bg-gray-700 mr-2" />
                            <div className="h-2 w-12 bg-gray-800 rounded" />
                        </div>
                    ))}
                </div>

                {/* Semi Finals */}
                <div className="flex flex-col justify-around h-full z-10">
                    {[1, 2].map((i) => (
                        <div key={i} className="w-24 h-8 bg-black/40 border border-white/10 rounded flex items-center px-2">
                            <div className="w-4 h-4 rounded-full bg-gray-700 mr-2" />
                            <div className="h-2 w-12 bg-gray-800 rounded" />
                        </div>
                    ))}
                </div>

                {/* Final */}
                <div className="flex flex-col justify-center h-full z-10">
                    <div className="w-28 h-10 bg-gradient-to-r from-emerald-900/40 to-black border border-emerald-500/30 rounded flex items-center px-3 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                        <Trophy size={16} className="text-emerald-400 mr-2" />
                        <span className="text-emerald-400 font-bold text-sm">CAMPEÓN</span>
                    </div>
                </div>

                {/* Connecting Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2, fill: "none" }}>
                    {/* QF to SF Top */}
                    <motion.path d="M120 40 H180 V85 H240" variants={pathVariants} initial="hidden" animate="visible" />
                    <motion.path d="M120 100 H180 V85" variants={pathVariants} initial="hidden" animate="visible" />

                    {/* QF to SF Bottom */}
                    <motion.path d="M120 155 H180 V200 H240" variants={pathVariants} initial="hidden" animate="visible" />
                    <motion.path d="M120 215 H180 V200" variants={pathVariants} initial="hidden" animate="visible" />

                    {/* SF to Final */}
                    <motion.path d="M340 85 H400 V128 H460" variants={pathVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} />
                    <motion.path d="M340 200 H400 V128" variants={pathVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} />
                </svg>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <GitBranch size={16} />
                <span>Cuadros separados por nivel para garantizar la competitividad.</span>
            </div>
        </div>
    );
}
