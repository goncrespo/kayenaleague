import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0a0a]">
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">

        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            ¡Bienvenido a la liga!
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Tu registro se ha completado con éxito. Te hemos enviado un correo con todos los detalles y los próximos pasos para empezar a competir.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Link
              href="/como-funciona"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(52,211,153,0.3)]"
            >
              Ver cómo funciona
            </Link>

            <Link
              href="/"
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-all"
            >
              Volver al inicio
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}