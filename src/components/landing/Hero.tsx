"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen text-white overflow-hidden" aria-label="Portada Kayena League">
      {/* Fondo de vídeo */}
      <video
        className="absolute inset-0 w-screen h-screen object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?q=80&w=1600&auto=format&fit=crop"
      >
        <source src="https://cdn.coverr.co/videos/coverr-golf-shot-1576/1080p.mp4" type="video/mp4" />
      </video>
      {/* Overlay para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />

      {/* Contenido central animado */}
      <div className="relative z-10 h-full grid place-items-center px-6">
        <div className="max-w-3xl text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200"
          >
            Kayena League
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-gray-200/90"
          >
            La liga de golf que se adapta a ti. Compite. Mejora. Socializa.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex items-center justify-center"
          >
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-emerald-400 text-black px-8 py-3 font-semibold shadow-xl hover:scale-[1.03] active:scale-[0.99] transition-transform"
            >
              Únete a la Liga
            </a>
          </motion.div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="pointer-events-none absolute bottom-6 inset-x-0 z-10 flex flex-col items-center gap-2 text-white/80"
      >
        <span className="text-sm">Descubre la liga</span>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl"
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
}
