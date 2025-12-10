"use client";

import { motion } from "framer-motion";
import { TrendingUp, Minus, TrendingDown } from "lucide-react";

export default function Step03Scoring() {
    const cards = [
        { title: "Ganador", points: 3, color: "bg-emerald-900/20", border: "border-emerald-500/30", text: "text-emerald-400", icon: TrendingUp },
        { title: "Empate", points: 2, color: "bg-amber-900/20", border: "border-amber-500/30", text: "text-amber-400", icon: Minus },
        { title: "Perdedor", points: 1, color: "bg-red-900/20", border: "border-red-500/30", text: "text-red-400", icon: TrendingDown },
    ];

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className={`relative overflow-hidden rounded-2xl border ${card.border} ${card.color} p-8 flex flex-col items-center justify-center gap-4 group hover:scale-105 transition-transform duration-300`}
                    >
                        <div className={`p-3 rounded-full bg-black/20 ${card.text}`}>
                            <card.icon size={24} />
                        </div>

                        <h3 className="text-xl font-medium text-gray-200">{card.title}</h3>

                        <div className="flex items-baseline gap-1">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                                className={`text-6xl font-black ${card.text}`}
                            >
                                {card.points}
                            </motion.span>
                            <span className="text-sm text-gray-400 font-medium">PTS</span>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>
                ))}
            </div>

            <p className="mt-12 text-gray-400 text-center max-w-lg">
                Cada punto cuenta. Incluso perdiendo sumas 1 punto por participar, fomentando la constancia en la liga.
            </p>
        </div>
    );
}
