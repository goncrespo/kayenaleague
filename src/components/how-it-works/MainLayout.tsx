"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import Step01General from "./steps/Step01General";
import Step02Match from "./steps/Step02Match";
import Step03Scoring from "./steps/Step03Scoring";
import Step04Bracket from "./steps/Step04Bracket";
import Step05Final from "./steps/Step05Final";
import Step06Handicap from "./steps/Step06Handicap";
import Step07Course from "./steps/Step07Course";

export default function MainLayout() {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        { id: 0, title: "Formato General", subtitle: "Liga Regular + Playoffs", component: Step01General },
        { id: 1, title: "Formato de Partido", subtitle: "Match Play Bo3", component: Step02Match },
        { id: 2, title: "Puntuación", subtitle: "Ganar, Empatar o Perder", component: Step03Scoring },
        { id: 3, title: "Clasificación", subtitle: "Fase de Grupos y Cuadro", component: Step04Bracket },
        { id: 4, title: "Torneo Final", subtitle: "Evento Presencial", component: Step05Final },
        { id: 5, title: "Hándicap Dinámico", subtitle: "Ajuste por Jornada", component: Step06Handicap },
        { id: 6, title: "Selección de Campo", subtitle: "Aleatorio o Acuerdo", component: Step07Course },
    ];

    const ActiveComponent = steps[activeStep].component;

    const nextStep = () => {
        if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
    };

    const prevStep = () => {
        if (activeStep > 0) setActiveStep(activeStep - 1);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Navigation (Top) */}
            <MobileNavigation steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />

            {/* Sidebar Navigation (Desktop) */}
            <div className="hidden md:block">
                <Sidebar steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative h-[calc(100vh-130px)] md:h-screen overflow-y-auto bg-gradient-to-br from-white/5 to-transparent [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="min-h-full w-full p-4 md:p-12 flex flex-col justify-center"
                    >
                        <div className="max-w-5xl mx-auto w-full pb-20 md:pb-0">
                            <div className="mb-6 md:mb-8 text-center md:text-left">
                                <h2 className="text-xs md:text-sm font-mono text-emerald-400 mb-2">PASO 0{activeStep + 1}</h2>
                                <h1 className="text-2xl md:text-5xl font-bold tracking-tight">{steps[activeStep].title}</h1>
                                <p className="text-sm md:text-xl text-gray-400 mt-2">{steps[activeStep].subtitle}</p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl backdrop-blur-sm min-h-[400px] relative overflow-hidden">
                                {/* Placeholder for components until they are implemented */}
                                {ActiveComponent ? <ActiveComponent /> : <div className="text-center text-gray-500">Componente en desarrollo...</div>}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 flex justify-between items-center z-50">
                    <button
                        onClick={prevStep}
                        disabled={activeStep === 0}
                        className={`p-3 rounded-full border border-white/10 ${activeStep === 0 ? "opacity-30 cursor-not-allowed" : "active:bg-white/10"}`}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <span className="text-sm font-mono text-gray-400">
                        {activeStep + 1} / {steps.length}
                    </span>

                    <button
                        onClick={nextStep}
                        disabled={activeStep === steps.length - 1}
                        className={`p-3 rounded-full bg-emerald-400 text-black shadow-lg ${activeStep === steps.length - 1 ? "opacity-50 cursor-not-allowed bg-gray-600" : "active:scale-95"}`}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </main>
        </div>
    );
}
