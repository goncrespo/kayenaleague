import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between backdrop-blur-md bg-black/20 border-b border-white/10">
        <Link href="/" className="font-semibold text-white tracking-tight">Kayena League</Link>
        <nav>
          <Link href="/register" className="text-white/90 hover:text-white underline-offset-4 hover:underline transition">Registro</Link>
        </nav>
      </div>
    </header>
  );
}
