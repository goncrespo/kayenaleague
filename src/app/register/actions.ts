"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { stripe, STRIPE_PRICE_ID, getAppBaseUrl } from "@/lib/stripe";

export type RegisterState = {
  ok?: boolean;
  errors?: Record<string, string>;
};

interface RegisterInput {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  licenseNumber?: string | null;
  phone: string;
  city: "MADRID" | "ZARAGOZA" | "VALLADOLID";
  playPreference?: "INDOOR_SIMULATOR" | "PRACTICE_RANGE";
  leagueId: string;
  zoneId: string;
  acceptTerms: boolean;
}

function validate(input: RegisterInput) {
  const errors: Record<string, string> = {};
  if (!input.name || input.name.trim().length < 2) errors.name = "Nombre inválido";
  if (!input.lastName || input.lastName.trim().length < 2) errors.lastName = "Apellidos inválidos";
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.email = "Email inválido";
  if (!input.password || input.password.length < 8) errors.password = "La contraseña debe tener al menos 8 caracteres";
  if (input.password !== input.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden";
  if (input.licenseNumber && !/^\w{4,}$/.test(input.licenseNumber)) errors.licenseNumber = "Licencia inválida";

  // Teléfono español: opcional +34 o 0034, seguido de 6 o 7 y 8 dígitos más.
  if (!input.phone || !/^(?:(?:\+|00)34[\s-]?)?[67]\d{2}[\s-]?\d{3}[\s-]?\d{3}$/.test(input.phone)) errors.phone = "Teléfono móvil español inválido";

  if (!input.city || !["MADRID", "ZARAGOZA", "VALLADOLID"].includes(input.city)) errors.city = "Selecciona una ciudad";

  // Zone is only required for MADRID
  if (input.city === "MADRID" && !input.zoneId) errors.zoneId = "Selecciona una zona";

  if (input.city === "MADRID") {
    if (!input.playPreference || !["INDOOR_SIMULATOR", "PRACTICE_RANGE"].includes(input.playPreference)) errors.playPreference = "Selecciona una preferencia";
  }
  if (!input.acceptTerms) errors.acceptTerms = "Debes aceptar los términos";
  return errors;
}

async function fetchHandicap(): Promise<number> {
  await new Promise((r) => setTimeout(r, 200));
  return 18.5;
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "");
  const lastName = String(formData.get("lastName") ?? "");
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const licenseNumberRaw = formData.get("licenseNumber");
  const licenseNumber = licenseNumberRaw ? String(licenseNumberRaw) : null;
  const phone = String(formData.get("phone") ?? "");
  const city = String(formData.get("city") ?? "") as "MADRID" | "ZARAGOZA" | "VALLADOLID";
  const playPreferenceRaw = formData.get("playPreference");
  const playPreference = playPreferenceRaw ? String(playPreferenceRaw) as "INDOOR_SIMULATOR" | "PRACTICE_RANGE" : undefined;
  const leagueId = String(formData.get("leagueId") ?? "");
  const zoneId = String(formData.get("zoneId") ?? "");
  const acceptTerms = formData.get("acceptTerms") === "on";

  const errors = validate({ name, lastName, email, password, confirmPassword, licenseNumber, phone, city, playPreference, leagueId, zoneId, acceptTerms });
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors } as const;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, errors: { email: "Este email ya está registrado" } } as const;
  }

  // Fetch active competition to get price and name
  const activeCompetition = await prisma.competition.findUnique({
    where: { id: leagueId },
  });

  if (!activeCompetition) {
    return { ok: false, errors: { _form: "Competición no encontrada o no válida." } } as const;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let handicap: number | undefined;
  let handicapVerified = false;
  if (licenseNumber) {
    handicap = await fetchHandicap();
    handicapVerified = true;
  }

  const user = await prisma.user.create({
    data: {
      name,
      lastName,
      email,
      hashedPassword,
      licenseNumber: licenseNumber ?? undefined,
      phone,
      city,
      ...(playPreference ? { playPreference } : {}),
      ...(typeof handicap === "number" ? { handicap, handicapVerified } : {}),
    },
  });

  // Ya no enviamos verificación de email, la confirmación es el pago.
  // El usuario se marca como verificado tras el pago en el webhook de Stripe.

  // Crear sesión de Stripe con todos los datos del usuario en metadata
  const baseUrl = getAppBaseUrl();
  const successUrl = `${baseUrl}/register/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/register/error`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Alta liga ${activeCompetition.name}`,
          },
          unit_amount: Math.round((Number(activeCompetition.price)) * 100), // euros → céntimos
        },
        quantity: 1,
      },
    ],
    customer_email: email,
    metadata: {
      userId: user.id, // Pass the user ID so webhook can find it
      competitionId: activeCompetition.id,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  // Redirigir a Stripe Checkout
  redirect(session.url || cancelUrl);
}