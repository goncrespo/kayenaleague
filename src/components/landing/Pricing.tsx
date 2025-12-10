export default function Pricing() {
  const perks = [
    "Acceso a la plataforma y app",
    "Organización de calendario y cuadros",
    "Ajuste de hándicap y estadísticas",
    "Acceso a la comunidad y eventos",
    "Polo personalizado de regalo al inscribirte",
  ];
  return (
    <section className="py-32 relative overflow-hidden" aria-labelledby="pricing-title">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 id="pricing-title" className="text-3xl md:text-5xl font-bold mb-6">Apúntate y empieza a competir.</h2>
          <p className="text-gray-300 text-lg">Sin cuotas mensuales ocultas. Un único pago por temporada.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <div className="card relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
              <div className="absolute -inset-px bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-4 py-1.5 text-sm font-semibold mb-6">
                  <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 4l-2 2-3 1v13h6V10h4v10h6V7l-3-1-2-2-2 2h-2L9 4z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                  </svg>
                  <span>Polo personalizado de regalo</span>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-black text-white tracking-tight">40€</span>
                  <span className="text-xl text-gray-400 font-medium">/ Temporada</span>
                </div>

                <p className="text-gray-200 mb-8 text-lg">Incluye todo lo necesario para disfrutar de la liga durante una temporada completa.</p>

                <ul className="space-y-4 mb-10">
                  {perks.map((p, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 text-sm font-bold">✓</span>
                      </div>
                      <span className="text-gray-100">{p}</span>
                    </li>
                  ))}
                </ul>

                <a href="/register" className="btn-primary w-full text-lg group-hover:shadow-[0_0_40px_rgba(52,211,153,0.4)]">
                  Apúntate ahora
                </a>
                <p className="text-center text-sm text-gray-400 mt-4">Plazas limitadas por zona de juego.</p>
              </div>
            </div>
          </div>

          <div className="text-gray-300 space-y-6 p-6 border-l border-white/10">
            <div>
              <h3 className="font-semibold text-white text-lg mb-2">¿Por qué ahora?</h3>
              <p>Garantiza tu plaza desde el inicio de la temporada y aprovecha el mejor precio.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg mb-2">Comunidad</h3>
              <p>Compite a tu ritmo y conoce a gente con tu misma pasión por el golf.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg mb-2">Garantía</h3>
              <p>Si no se forma grupo en tu zona, te devolvemos el dinero íntegramente.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
