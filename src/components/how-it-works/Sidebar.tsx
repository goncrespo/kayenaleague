"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

interface Step {
    id: number;
    title: string;
    subtitle: string;
}

interface SidebarProps {
    steps: Step[];
    activeStep: number;
    setActiveStep: (step: number) => void;
}

export default function Sidebar({ steps, activeStep, setActiveStep }: SidebarProps) {
    return (
        <aside className="w-full md:w-80 lg:w-96 bg-black/40 border-r border-white/10 flex-shrink-0 relative z-20 md:h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="p-8">
                <div className="mb-10">
                    <Link href="/" className="font-bold text-xl tracking-tighter text-white hover:text-emerald-400 transition-colors">
                        KAYENA <span className="text-emerald-400">LEAGUE</span>
                    </Link>
                    <p className="text-xs text-gray-500 mt-2 font-mono">GUÍA DE FUNCIONAMIENTO</p>
                </div>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-4 bottom-4 w-px bg-white/10 hidden md:block" />

                    <div className="space-y-2">
                        {steps.map((step, index) => {
                            const isActive = activeStep === index;
                            const isCompleted = activeStep > index;

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveStep(index)}
                                    className={`relative w-full text-left group flex items-start gap-4 p-3 rounded-xl transition-all duration-300 ${isActive ? "bg-white/5" : "hover:bg-white/5"
                                        }`}
                                >
                                    {/* Circle Indicator */}
                                    <div
                                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${isActive
                                            ? "bg-emerald-400 border-emerald-400 text-black scale-110 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                                            : isCompleted
                                                ? "bg-emerald-900/20 border-emerald-500/50 text-emerald-400"
                                                : "bg-black border-white/20 text-gray-500 group-hover:border-white/40"
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <Check size={14} strokeWidth={3} />
                                        ) : (
                                            <span className="text-xs font-bold font-mono">{index + 1}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 pt-1">
                                        <h3
                                            className={`text-sm font-bold transition-colors ${isActive ? "text-white" : isCompleted ? "text-gray-300" : "text-gray-500"
                                                }`}
                                        >
                                            {step.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{step.subtitle}</p>
                                    </div>

                                    {/* Active Indicator Arrow (Desktop) */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 hidden md:block"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </aside>
    );
}
