export default function Pricing() {
  const perks = [
    "Acceso a la plataforma y app",
    "Organización de calendario y cuadros",
    "Ajuste de hándicap y estadísticas",
    "Acceso a la comunidad y eventos",
    "Polo personalizado de regalo al inscribirte",
  ];
  return (
    <section className="py-24" aria-labelledby="pricing-title">
      <div className="max-w-5xl mx-auto px-6">
        <h2 id="pricing-title" className="text-2xl md:text-3xl font-semibold text-center mb-12">Apúntate y empieza a competir.</h2>
        <div className="grid md:grid-cols-3 gap-10 items-stretch">
          <div className="md:col-span-2">
            <div className="relative border rounded-2xl p-8 space-y-5 bg-white/5 ring-1 ring-emerald-400/20 backdrop-blur-md shadow-xl">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-400/10 pointer-events-none" />
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400 text-black px-3 py-1 text-sm font-semibold">
                <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                  <path d="M9 4l-2 2-3 1v13h6V10h4v10h6V7l-3-1-2-2-2 2h-2L9 4z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                </svg>
                <span>Polo personalizado de regalo</span>
              </div>
              <div className="text-5xl font-extrabold">40€ <span className="text-base font-normal text-white/60">/ Temporada</span></div>
              <p className="text-white/80">Incluye todo lo necesario para disfrutar de la liga durante una temporada completa.</p>
              <ul className="text-left space-y-2 max-w-md">
                {perks.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400" aria-hidden>✓</span>
                    <span className="text-white/90">{p}</span>
                  </li>
                ))}
              </ul>
              <a href="/register" className="relative inline-flex items-center justify-center rounded-md bg-emerald-500 text-black px-7 py-3 font-semibold shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30 hover:-translate-y-0.5 transition-transform">
                Apúntate ahora
              </a>
            </div>
          </div>
          <div className="text-white/80 space-y-3 self-center">
            <h3 className="font-semibold text-emerald-300">¿Por qué ahora?</h3>
            <p>Garantiza tu plaza desde el inicio de la temporada y aprovecha el mejor precio.</p>
            <p>Compite a tu ritmo y conoce a gente con tu misma pasión por el golf.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
