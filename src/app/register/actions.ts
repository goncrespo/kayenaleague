"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/mail";
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
  if (input.licenseNumber && !/^\w{4,}$/.test(input.licenseNumber)) errors.licenseNumber = "Licencia inválida";
  // Teléfono español: opcional +34, separadores opcionales espacios o guiones, 9 dígitos comenzando por 6,7,8,9
  if (!input.phone || !/^(?:\+34)?[\s-]?(6|7|8|9)\d{2}[\s-]?\d{3}[\s-]?\d{3}$/.test(input.phone)) errors.phone = "Teléfono español inválido";
  if (!input.city || !["MADRID", "ZARAGOZA", "VALLADOLID"].includes(input.city)) errors.city = "Selecciona una ciudad";
  if (!input.zoneId) errors.zoneId = "Selecciona una zona";
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
  const licenseNumberRaw = formData.get("licenseNumber");
  const licenseNumber = licenseNumberRaw ? String(licenseNumberRaw) : null;
  const phone = String(formData.get("phone") ?? "");
  const city = String(formData.get("city") ?? "") as "MADRID" | "ZARAGOZA" | "VALLADOLID";
  const playPreferenceRaw = formData.get("playPreference");
  const playPreference = playPreferenceRaw ? String(playPreferenceRaw) as "INDOOR_SIMULATOR" | "PRACTICE_RANGE" : undefined;
  const leagueId = String(formData.get("leagueId") ?? "");
  const zoneId = String(formData.get("zoneId") ?? "");
  const acceptTerms = formData.get("acceptTerms") === "on";

  const errors = validate({ name, lastName, email, password, licenseNumber, phone, city, playPreference, leagueId, zoneId, acceptTerms });
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors } as const;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, errors: { email: "Este email ya está registrado" } } as const;
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

  // Crear token de verificación y enviar email
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

  try {
    await sendVerificationEmail({ to: email, token });
  } catch {
    return { ok: false, errors: { _form: "Cuenta creada, pero no se pudo enviar el email de verificación. Intenta más tarde." } } as const;
  }

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
          unit_amount: Math.round((activeCompetition.price as number) * 100), // euros → céntimos
        },
        quantity: 1,
      },
    ],
    customer_email: email,
    metadata: {
      // Guardamos todos los datos del usuario para crearlo después del pago
      name,
      lastName,
      email,
      hashedPassword,
      licenseNumber: licenseNumber ?? "",
      phone,
      city,
      zoneId,
      playPreference: playPreference ?? "",
      handicap: typeof handicap === "number" ? String(handicap) : "",
      handicapVerified: String(!!handicap),
      competitionId: activeCompetition.id,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  // Redirigir a Stripe Checkout
  redirect(session.url || cancelUrl);
}