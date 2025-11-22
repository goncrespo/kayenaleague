import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/mail";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Falta firma" }, { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    // @ts-expect-error tipo implícito en tiempo de ejecución
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.metadata?.userId as string | undefined;
        const customerEmail = session.customer_details?.email || session.customer_email;
        if (userId) {
          // Para pago único, podemos marcar un flag en usuario o crear un registro simple.
          // Aquí, simplemente marcamos paid=true en una suscripción anual por defecto si existiera el modelo,
          // o puedes reemplazar por otra persistencia según tu negocio.
          await prisma.user.update({ where: { id: userId }, data: { role: "USER" } });
        }
        if (customerEmail) {
          await sendWelcomeEmail({ to: customerEmail });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    return NextResponse.json({ error: "Error procesando evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function ensureDefaultLeague(): Promise<string> {
  const league = await prisma.league.create({
    data: {
      name: "Kayena League",
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  });
  return league.id;
}

export const dynamic = "force-dynamic"; // evitar caché
export const runtime = "nodejs"; // Stripe SDK requiere Node.js runtime
export const preferredRegion = "auto";

