import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/mail";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("❌ STRIPE_WEBHOOK_SECRET no está configurado");
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("❌ Falta stripe-signature en headers");
    return NextResponse.json({ error: "Falta firma" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId as string | undefined;

        if (userId) {
          const user = await prisma.user.update({
            where: { id: userId },
            data: {
              role: "USER",
              emailVerified: new Date()
            }
          });

          if (user && user.email) {
            const date = new Date().toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' });
            await sendWelcomeEmail({
              to: user.email,
              name: user.name || "Jugador",
              username: user.email.split('@')[0],
              date: date
            });
          }
        }
        break;
      }
      default:
        break;
    }
  } catch {
    return NextResponse.json({ error: "Error procesando evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}



export const dynamic = "force-dynamic"; // evitar caché
export const runtime = "nodejs"; // Stripe SDK requiere Node.js runtime
export const preferredRegion = "auto";

