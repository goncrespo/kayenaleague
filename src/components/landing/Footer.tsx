export default function Footer() {
  return (
    <footer className="bg-black text-white py-10" aria-label="Pie de página">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm">© {new Date().getFullYear()} Kayena League</p>
        <nav className="flex items-center gap-6 text-sm">
          <a className="hover:underline" href="#">Contacto</a>
          <a className="hover:underline" href="#">Términos y Condiciones</a>
          <a className="hover:underline" href="/privacidad">Política de Privacidad</a>
          <a className="hover:underline" href="#">Instagram</a>
        </nav>
      </div>
    </footer>
  );
}
