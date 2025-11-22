"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type RegisterState } from "./actions";
import Alert from "@/components/ui/Alert";
import { apiFetch, ApiError } from "@/lib/http";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? "Registrando..." : "Registrarme"}
    </button>
  );
}

export default function RegisterForm() {
  const [state, action] = useActionState<RegisterState, FormData>(registerAction, {} as RegisterState);
  const [city, setCity] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrice() { //Llamada a stripe para traer el precio.
      try {
        setPriceError(null);
        const data = await apiFetch<{ unitAmountFormatted: string }>("/api/price", { cache: "no-store" });
        setPrice(data.unitAmountFormatted);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "No se pudo cargar el precio";
        setPriceError(message);
        setPrice("—");
      }
    }
    loadPrice();
  }, []);

  return (
    <form action={action} className="space-y-4">
      <h1 className="text-2xl font-semibold text-center">Crear cuenta</h1>

      {priceError && <Alert variant="warning">{priceError}</Alert>}

      {state?.errors?._form && (
        <div className="text-sm text-red-600" role="alert">{state.errors._form}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">Nombre</label>
          <input id="name" name="name" type="text" required minLength={2} className="input" aria-invalid={!!state?.errors?.name} aria-describedby={state?.errors?.name ? "name-error" : undefined} />
          {state?.errors?.name && <p id="name-error" className="text-xs text-red-600">{state.errors.name}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-sm font-medium">Apellidos</label>
          <input id="lastName" name="lastName" type="text" required minLength={2} className="input" aria-invalid={!!state?.errors?.lastName} aria-describedby={state?.errors?.lastName ? "lastName-error" : undefined} />
          {state?.errors?.lastName && <p id="lastName-error" className="text-xs text-red-600">{state.errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$" className="input" aria-invalid={!!state?.errors?.email} aria-describedby={state?.errors?.email ? "email-error" : undefined} />
        {state?.errors?.email && <p id="email-error" className="text-xs text-red-600">{state.errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium">Teléfono</label>
        <input id="phone" name="phone" type="tel" required pattern="^(?:\\+34)?[\\s-]?(6|7|8|9)\\d{2}[\\s-]?\\d{3}[\\s-]?\\d{3}$" placeholder="Ej. +34 600 112 233" className="input" aria-invalid={!!state?.errors?.phone} aria-describedby={state?.errors?.phone ? "phone-error" : undefined} />
        {state?.errors?.phone && <p id="phone-error" className="text-xs text-red-600">{state.errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">Contraseña</label>
        <input id="password" name="password" type="password" required minLength={8} className="input" aria-invalid={!!state?.errors?.password} aria-describedby={state?.errors?.password ? "password-error" : undefined} />
        <p className="text-xs text-gray-500">Mínimo 8 caracteres.</p>
        {state?.errors?.password && <p id="password-error" className="text-xs text-red-600">{state.errors.password}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="licenseNumber" className="block text-sm font-medium">Número de Licencia (opcional)</label>
        <input id="licenseNumber" name="licenseNumber" type="text" placeholder="Ej. ESP12345" className="input" aria-invalid={!!state?.errors?.licenseNumber} aria-describedby={state?.errors?.licenseNumber ? "license-error" : undefined} />
        <p className="text-xs text-gray-500">Si lo indicas, verificaremos tu hándicap automáticamente.</p>
        {state?.errors?.licenseNumber && <p id="license-error" className="text-xs text-red-600">{state.errors.licenseNumber}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="city" className="block text-sm font-medium">Ciudad</label>
        <select id="city" name="city" required className="input" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="" disabled>Selecciona ciudad</option>
          <option value="MADRID" className="text-gray-900">Madrid</option>
          <option value="ZARAGOZA" className="text-gray-900">Zaragoza</option>
          <option value="VALLADOLID" className="text-gray-900">Valladolid</option>
        </select>
        {state?.errors?.city && <p className="text-xs text-red-600">{state.errors.city}</p>}
      </div>

      {city === "MADRID" && (
        <div className="space-y-2">
          <label htmlFor="playPreference" className="block text-sm font-medium">Preferencia de juego</label>
          <select id="playPreference" name="playPreference" className="input" aria-invalid={!!state?.errors?.playPreference} aria-describedby={state?.errors?.playPreference ? "playPreference-error" : undefined} defaultValue="" style={{ colorScheme: "dark" }}>
            <option value="" disabled>Selecciona una opción</option>
            <option value="INDOOR_SIMULATOR" className="text-gray-900">Simulador Indoor</option>
            <option value="PRACTICE_RANGE" className="text-gray-900">Range de prácticas</option>
          </select>
          {state?.errors?.playPreference && <p id="playPreference-error" className="text-xs text-red-600">{state.errors.playPreference}</p>}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-lg border border-gray-700/60 p-4">
        <input id="acceptTerms" name="acceptTerms" type="checkbox" required checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1" aria-invalid={!!state?.errors?.acceptTerms} />
        <label htmlFor="acceptTerms" className="text-sm text-gray-200">Acepto los términos y condiciones</label>
      </div>
      {state?.errors?.acceptTerms && <p className="text-xs text-red-600">{state.errors.acceptTerms}</p>}

      <div className="rounded-xl border border-gray-700/60 p-4 flex items-center justify-between bg-gradient-to-b from-gray-900/40 to-gray-900/20">
        <div>
          <p className="text-xs text-gray-400">Cuota de inscripción</p>
          <p className="text-lg font-semibold">{price || "—"}</p>
        </div>
        <div className="text-right text-xs text-gray-500">Pago seguro con Stripe</div>
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta? <a href="/signin" className="underline">Inicia sesión</a>
      </p>
    </form>
  );
} 