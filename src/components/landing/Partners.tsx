const partners = [
  { name: "H0 Golf", src: "/images/vercel.svg" },
  { name: "Magic Golf", src: "/images/next.svg" },
  { name: "FMG", src: "/images/globe.svg" },
  { name: "Toptracer", src: "/images/window.svg" },
  { name: "Kayena", src: "/images/file.svg" },
  { name: "ZeroMed", src: "/images/zeromed.png" },
  { name: "Dentica", src: "/images/dentica.png" },
];

export default function Partners() {
  return (
    <section className="py-20 bg-gray-50/0" aria-labelledby="partners-title">
      <div className="max-w-6xl mx-auto px-6">
        <h2 id="partners-title" className="text-2xl md:text-3xl font-semibold text-center mb-10">Juega en los Mejores Centros.</h2>
        <div className="relative overflow-hidden">
          <div className="flex gap-10 [animation:scroll_25s_linear_infinite] will-change-transform">
            {partners.concat(partners).map((p, idx) => {
              const sizeClass = (p.name === "ZeroMed" || p.name === "Dentica") ? "h-16 md:h-20" : "h-10";
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.name + idx}
                  src={p.src}
                  alt={p.name}
                  className={`${sizeClass} opacity-70 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-105 transition`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
