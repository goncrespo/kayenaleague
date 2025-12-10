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
          {/* Línea central con gradiente (Mobile: izquierda, Desktop: centro) */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400/0 via-emerald-400/20 to-emerald-400/0" />

          <ol className="space-y-16 md:space-y-24">
            {steps.map((s, i) => {
              const isLeft = i % 2 === 0;
              return (
                <li key={i} className="relative">
                  {/* Punto central brillante (Mobile: izquierda, Desktop: centro) */}
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] z-10 border-2 border-black translate-x-[-6px] md:translate-x-0 mt-1.5 md:mt-0" />

                  <motion.div
                    initial={{ opacity: 0, x: 0, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={[
                      "flex flex-col gap-2 relative pl-12 md:pl-0", // Mobile: padding left for line
                      "md:w-[calc(50%-3rem)]", // Desktop: 50% width
                      "md:absolute md:top-0", // Desktop: positioning
                      isLeft
                        ? "md:mr-auto md:items-end md:text-right md:right-[50%] md:pr-12"
                        : "md:ml-auto md:items-start md:text-left md:left-[50%] md:pl-12",
                    ].join(" ")}
                  >
                    <div className={`text-6xl font-black text-white/10 select-none absolute -top-8 scale-150 z-0 ${isLeft ? "md:right-0" : "md:left-0"} left-12 md:left-auto`}>
                      0{i + 1}
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white mb-2">{s.title}</h3>
                      <p className="text-gray-300 leading-relaxed text-lg">{s.desc}</p>
                    </div>
                  </motion.div>
                  {/* Spacer for desktop absolute positioning to maintain height */}
                  <div className="hidden md:block h-24" />
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
