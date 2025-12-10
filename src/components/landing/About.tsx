"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
  const items = [
    {
      title: "Compite",
      text: "Un formato de liga por temporadas con fases de grupos y eliminatorias que te mantiene motivado todo el año.",
      img: "/images/compite.jpg",
    },
    {
      title: "A tu Ritmo",
      text: "Juega tus partidos cuando y donde quieras. Elige entre los mejores simuladores y campos de práctica de Madrid.",
      img: "/images/ritmo.jpg",
    },
    {
      title: "Conecta",
      text: "Forma parte de una comunidad de apasionados del golf. Conoce nuevos jugadores y comparte tu pasión.",
      img: "/images/conecta.jpg",
    },
  ];

  return (
    <section className="py-24" aria-labelledby="about-title">
      <div className="max-w-6xl mx-auto px-6">
        <h2 id="about-title" className="text-2xl md:text-3xl font-semibold text-center mb-12">Bienvenido a la nueva era del golf amateur.</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center space-y-4"
            >
              <div className="relative mx-auto h-28 w-28 rounded-full ring-1 ring-emerald-400/30 overflow-hidden">
                <Image
                  src={it.img}
                  alt={it.title}
                  fill
                  className={"object-cover " + (it.title === "Conecta" ? "object-[50%_20%]" : "")}
                />
              </div>
              <h3 className="font-semibold text-emerald-300">{it.title}</h3>
              <p className="text-gray-300">{it.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
