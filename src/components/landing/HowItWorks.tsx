"use client";

import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    { title: "Inscríbete", desc: "Regístrate en la plataforma, introduce tu hándicap y prepárate para la acción." },
    { title: "Fase de Grupos", desc: "Compite contra 3-5 jugadores de tu nivel en Match Play. Suma puntos y clasifícate." },
    { title: "Cuadro Final", desc: "Avanza en el eliminatorio. Cada partido es una final: emoción garantizada." },
    { title: "El Evento Final", desc: "Los campeones se coronan en un evento exclusivo en un campo real." },
  ];

  return (
    <section id="how-it-works" className="py-32 relative" aria-labelledby="hiw-title">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 id="hiw-title" className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Tu camino hacia la <span className="text-emerald-400">gloria</span>.
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Un formato diseñado para competir, divertirse y mejorar tu juego paso a paso.
          </p>
        </motion.div>

        <div className="relative">
          {/* Línea central con gradiente */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400/0 via-emerald-400/20 to-emerald-400/0" />

          <ol className="space-y-24">
            {steps.map((s, i) => {
              const isLeft = i % 2 === 0;
              return (
                <li key={i} className="relative">
                  {/* Punto central brillante */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] z-10 border-2 border-black" />

                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className={[
                      "flex flex-col gap-2 w-[calc(50%-3rem)]",
                      isLeft ? "mr-auto items-end text-right" : "ml-auto items-start text-left",
                    ].join(" ")}
                  >
                    <div className="text-6xl font-black text-white/10 select-none absolute -top-8 scale-150 z-0">
                      0{i + 1}
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white mb-2">{s.title}</h3>
                      <p className="text-gray-300 leading-relaxed text-lg">{s.desc}</p>
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
