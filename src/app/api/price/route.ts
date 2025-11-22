import { NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_ID } from "@/lib/stripe";

export async function GET() {
  const DEFAULT_AMOUNT_CENTS = 4100; // 41€ fallback
  const DEFAULT_CURRENCY = "EUR";

  try {
    if (!STRIPE_PRICE_ID) {
      const unitAmountFormatted = new Intl.NumberFormat("es-ES", { style: "currency", currency: DEFAULT_CURRENCY }).format(DEFAULT_AMOUNT_CENTS / 100);
      return NextResponse.json({ unitAmountFormatted }, { status: 200 });
    }

    const price = await stripe.prices.retrieve(STRIPE_PRICE_ID);
    const amount = typeof price.unit_amount === "number" ? price.unit_amount : DEFAULT_AMOUNT_CENTS;
    const currency = (price.currency || DEFAULT_CURRENCY).toUpperCase();
    const unitAmountFormatted = new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(amount / 100);
    return NextResponse.json({ unitAmountFormatted }, { status: 200 });
  } catch {
    const unitAmountFormatted = new Intl.NumberFormat("es-ES", { style: "currency", currency: DEFAULT_CURRENCY }).format(DEFAULT_AMOUNT_CENTS / 100);
    return NextResponse.json({ unitAmountFormatted }, { status: 200 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

