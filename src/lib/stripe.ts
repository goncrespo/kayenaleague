import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("Falta STRIPE_SECRET_KEY en el entorno");
}

export const stripe = new Stripe(secretKey, { typescript: true });

export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || ""; // configurado en .env
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ""; // configurado en .env


