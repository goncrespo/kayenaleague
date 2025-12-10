"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Rules() {
  const items = [
    { title: "Formato de Partido", body: "Los partidos se juegan a Match Play. El hándicap de juego se ajustará según las reglas de la RFEG para igualar el enfrentamiento." },
    { title: "Resultados", body: "Los resultados deben subirse a la plataforma antes de la fecha límite de la jornada. Se requiere fair play y honestidad." },
    { title: "Ajuste de Hándicap", body: "Al final de la fase de grupos, se aplicará un ajuste automático a tu hándicap basado en tus resultados para la fase eliminatoria." },
    { title: "Código de Conducta", body: "Puntualidad, respeto por el rival y por las instalaciones de las sedes colaboradoras." },
  ];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20" aria-labelledby="rules-title">
      <div className="max-w-4xl mx-auto px-6">
        <h2 id="rules-title" className="text-2xl md:text-3xl font-semibold text-center mb-10 text-white">Juego Limpio y Competición Sana.</h2>
        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="group border border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-300 hover:border-emerald-500/30"
                onMouseEnter={() => setOpen(i)}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <div className="flex items-center justify-between select-none">
                  <span className="font-medium text-white group-hover:text-emerald-300 transition-colors">{item.title}</span>
                  <motion.span
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-xl text-white/60 group-hover:text-white transition-colors"
                    aria-hidden
                  >
                    ▾
                  </motion.span>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-gray-300">{item.body}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
