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
    <section className="py-24" aria-labelledby="hiw-title">
      <div className="max-w-5xl mx-auto px-6">
        <h2 id="hiw-title" className="text-2xl md:text-3xl font-semibold text-center mb-12">Tu camino hacia la gloria.</h2>

        <div className="relative">
          {/* Línea central */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-emerald-400/40" />

          <ol className="space-y-12">
            {steps.map((s, i) => {
              const isLeft = i % 2 === 0;
              return (
                <li key={i} className="relative">
                  {/* Punto */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-400" />

                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className={[
                      "max-w-md",
                      isLeft ? "mr-auto pr-8 text-right" : "ml-auto pl-8 text-left",
                    ].join(" ")}
                  >
                    <div className="text-4xl font-extrabold text-emerald-400">{i + 1}</div>
                    <h3 className="font-semibold mt-2">{s.title}</h3>
                    <p className="text-white/80 mt-1">{s.desc}</p>
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
