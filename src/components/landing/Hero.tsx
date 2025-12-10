"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen text-white overflow-hidden" aria-label="Portada Kayena League">
      {/* Fondo de vídeo */}
      <video
        className="absolute inset-0 w-screen h-screen object-cover scale-105"
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?q=80&w=1600&auto=format&fit=crop"
      >
        <source src="https://cdn.coverr.co/videos/coverr-golf-shot-1576/1080p.mp4" type="video/mp4" />
      </video>

      {/* Overlay cinemático + grano */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

      {/* Contenido central animado */}
      <div className="relative z-10 h-full grid place-items-center px-6">
        <div className="max-w-4xl text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-2 drop-shadow-2xl">
              KAYENA <span className="text-emerald-400">LEAGUE</span>
            </h1>
            <div className="h-1 w-24 bg-emerald-400 mx-auto rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto leading-relaxed"
          >
            La liga de golf definitiva. <br className="hidden md:block" />
            <span className="text-white font-medium">Compite. Mejora. Socializa.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <a href="/register" className="btn-primary w-full sm:w-auto text-lg">
              Únete a la Liga
            </a>
            <a href="/como-funciona" className="btn-outline w-full sm:w-auto text-lg backdrop-blur-sm">
              Cómo funciona
            </a>
          </motion.div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 inset-x-0 z-10 flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1"
        >
          <div className="w-1 h-2 bg-emerald-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
