"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Alert from "@/components/ui/Alert";
import { useSearchParams } from "next/navigation";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useSearchParams();
  const verify = params.get("verify");
  const register = params.get("register");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/profile" });
      if (!res) {
        setError("No se pudo contactar con el servidor. Inténtalo más tarde.");
        return;
      }
      if (res.error) {
        setError("No pudimos iniciar sesión. Revisa tus credenciales o verifica tu correo.");
        return;
      }
      if (res.ok && res.url) {
        window.location.href = res.url;
      }
    } catch {
      setError("Ha ocurrido un error inesperado. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <form onSubmit={onSubmit} className="w-full max-w-md card space-y-4">
        <h1 className="text-2xl font-semibold text-center">Iniciar sesión</h1>

        {register === "success" && (
          <p className="text-sm text-green-600" role="status">Registro realizado. Revisa tu correo para verificar tu cuenta.</p>
        )}
        {verify === "success" && (
          <p className="text-sm text-green-600" role="status">Correo verificado. Ya puedes iniciar sesión.</p>
        )}
        {verify === "invalid" && (
          <p className="text-sm text-red-600" role="alert">Enlace de verificación inválido o caducado.</p>
        )}
        {error && <Alert variant="error">{error}</Alert>}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">Contraseña</label>
          <input id="password" name="password" type="password" required minLength={8} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SignInForm />
    </Suspense>
  );
} 