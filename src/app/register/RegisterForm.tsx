"use client";

import { useActionState, useEffect, useState } from "react";

import { registerAction, type RegisterState } from "./actions";
import Alert from "@/components/ui/Alert";
import { apiFetch, ApiError } from "@/lib/http";

interface Zone {
  id: string;
  name: string;
  label: string;
  description?: string | null;
}

interface Competition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  price: number;
}



export default function RegisterForm() {
  const [state, action] = useActionState<RegisterState, FormData>(registerAction, {} as RegisterState);

  // States for form fields that need real-time validation
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation Error States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [city, setCity] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [priceError, setPriceError] = useState<string | null>(null);
  const [activeLeague, setActiveLeague] = useState<Competition | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Regex Patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(?:(?:\+|00)34[\s-]?)?[67]\d{2}[\s-]?\d{3}[\s-]?\d{3}$/;

  // Validate Email
  useEffect(() => {
    if (!email) {
      setEmailError(null);
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Introduce un email válido.");
    } else {
      setEmailError(null);
    }
  }, [email]);

  // Validate Phone
  useEffect(() => {
    if (!phone) {
      setPhoneError(null);
      return;
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError("Introduce un número de móvil válido (ej: 600123456).");
    } else {
      setPhoneError(null);
    }
  }, [phone]);

  // Validate Password Length
  useEffect(() => {
    if (!password) {
      setPasswordError(null);
      return;
    }
    if (password.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres.");
    } else {
      setPasswordError(null);
    }
  }, [password]);

  // Validate Password Match
  useEffect(() => {
    if (!confirmPassword) {
      setConfirmPasswordError(null);
      return;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError("Las contraseñas no coinciden.");
    } else {
      setConfirmPasswordError(null);
    }
  }, [confirmPassword, password]);

  const isValid = !emailError && !phoneError && !passwordError && !confirmPasswordError &&
    email && phone && password && confirmPassword && acceptTerms && city;

  // Cargar ciudades con competición activa
  useEffect(() => {
    async function loadCities() {
      try {
        const cities = await apiFetch<string[]>("/api/active-cities");
        setAvailableCities(cities);
      } catch (err) {
        console.error("Error al cargar ciudades:", err);
      }
    }
    loadCities();
  }, []);

  // Cargar competición activa cuando se selecciona ciudad
  useEffect(() => {
    if (!city) {
      setActiveLeague(null);
      setPrice("—");
      return;
    }

    async function loadCompetition() {
      try {
        const comp = await apiFetch<Competition>(`/api/active-competition?city=${city}`, { cache: "no-store" });
        setActiveLeague(comp);
        setPrice(`${Number(comp.price).toFixed(2)} €`);
        setPriceError(null);
      } catch (err) {
        console.error("Error al cargar competición:", err);
        setActiveLeague(null);
        setPrice("—");
        setPriceError("No hay competición activa en esta ciudad");
      }
    }

    loadCompetition();
  }, [city]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [selectedZone, setSelectedZone] = useState("");

  // Precio desde la liga activa
  useEffect(() => {
    // Si no hay ciudad seleccionada, no mostramos error de precio
    if (!city) {
      setPriceError(null);
      return;
    }

    if (activeLeague?.price != null) {
      const numericPrice = Number(activeLeague.price);
      if (!isNaN(numericPrice)) {
        setPrice(`${numericPrice.toFixed(2)} €`);
        setPriceError(null);
      } else {
        setPrice("—");
        setPriceError("Precio no válido");
      }
    } else {
      // Si hay ciudad pero no activeLeague (y ya cargó), o activeLeague sin precio
      setPrice("—");
      setPriceError("No se pudo cargar el precio");
    }
  }, [activeLeague, city]);

  // Cargar zonas cuando se selecciona ciudad
  useEffect(() => {
    async function loadZones() {
      if (!city) {
        setZones([]);
        setSelectedZone("");
        return;
      }

      setLoadingZones(true);
      try {
        const zonesData = await apiFetch<Zone[]>(`/api/zones-by-city?city=${city}`, { cache: "no-store" });
        setZones(zonesData);
        setSelectedZone("");
      } catch (err) {
        console.error("Error al cargar las zonas:", err);
        setZones([]);
        setSelectedZone("");
      } finally {
        setLoadingZones(false);
      }
    }
    loadZones();
  }, [city]);

  return (
    <form action={action} className="space-y-4">
      {/* Campo oculto con el ID de la liga activa */}
      {activeLeague && (
        <input type="hidden" name="leagueId" value={activeLeague.id} />
      )}
      <h1 className="text-2xl font-semibold text-center">Únete a la liga</h1>

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
        <input id="email" name="email" type="email" required className={`input ${emailError ? "border-red-500 focus:ring-red-500" : ""}`} value={email} onChange={(e) => setEmail(e.target.value)} />
        {emailError && <p className="text-xs text-red-500">{emailError}</p>}
        {state?.errors?.email && <p className="text-xs text-red-600">{state.errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium">Teléfono</label>
        <input id="phone" name="phone" type="tel" required placeholder="Ej. 600 112 233" className={`input ${phoneError ? "border-red-500 focus:ring-red-500" : ""}`} value={phone} onChange={(e) => setPhone(e.target.value)} />
        {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
        {state?.errors?.phone && <p className="text-xs text-red-600">{state.errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">Contraseña</label>
        <input id="password" name="password" type="password" required minLength={8} className={`input ${passwordError ? "border-red-500 focus:ring-red-500" : ""}`} value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="text-xs text-gray-500">Mínimo 8 caracteres.</p>
        {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
        {state?.errors?.password && <p className="text-xs text-red-600">{state.errors.password}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirmar Contraseña</label>
        <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className={`input ${confirmPasswordError ? "border-red-500 focus:ring-red-500" : ""}`} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        {confirmPasswordError && <p className="text-xs text-red-500">{confirmPasswordError}</p>}
        {state?.errors?.confirmPassword && <p className="text-xs text-red-600">{state.errors.confirmPassword}</p>}
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

      {/* Select de zona - solo se muestra si es MADRID */}
      {city === "MADRID" && (
        <div className="space-y-2">
          <label htmlFor="zoneId" className="block text-sm font-medium">Zona</label>
          <select
            id="zoneId"
            name="zoneId"
            required
            className="input"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            disabled={loadingZones}
          >
            <option value="" disabled>
              {loadingZones ? "Cargando zonas..." : "Selecciona una zona"}
            </option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id} className="text-gray-900">
                {zone.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Identifica tu zona
          </button>
          {state?.errors?.zoneId && <p className="text-xs text-red-600">{state.errors.zoneId}</p>}
        </div>
      )}

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

      <button
        type="submit"
        disabled={!isValid}
        className={`w-full py-4 text-black font-bold text-lg rounded-full transition-all duration-300 ${isValid
          ? "bg-emerald-400 hover:bg-emerald-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(52,211,153,0.4)]"
          : "bg-gray-600 cursor-not-allowed opacity-50"
          }`}
      >
        Registrarme
      </button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta? <a href="/signin" className="underline">Inicia sesión</a>
      </p>

      {/* Map Modal */}
      {isMapOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMapOpen(false)}
        >
          <div
            className="relative bg-[#111] p-2 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsMapOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <img
              src="/images/MadridMap.png"
              alt="Mapa de Zonas Madrid"
              className="w-full h-full object-contain max-h-[85vh] rounded-xl"
            />
          </div>
        </div>
      )}
    </form>
  );
}