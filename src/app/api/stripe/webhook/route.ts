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
    console.log("✅ Webhook recibido:", event.type);
  } catch (err) {
    console.error("❌ Firma inválida:", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        console.log("📦 Metadata recibida:", session.metadata);
        const meta = session.metadata;
        if (!meta) {
          console.warn("⚠️ Webhook sin metadata");
          break;
        }

        // Crear usuario solo si el pago fue exitoso
        const user = await prisma.user.create({
          data: {
            name: meta.name,
            lastName: meta.lastName,
            email: meta.email,
            hashedPassword: meta.hashedPassword,
            licenseNumber: meta.licenseNumber || undefined,
            phone: meta.phone,
            city: meta.city as any,
            zoneId: meta.zoneId,
            playPreference: meta.playPreference || undefined,
            handicap: meta.handicap ? parseFloat(meta.handicap) : undefined,
            handicapVerified: meta.handicapVerified === "true",
            paid: true, // ✅ Marcar como pagado
          },
        });
        console.log("✅ Usuario creado:", user.email, "ID:", user.id);

        // Alta en la liga
        await prisma.competitionPlayer.create({
          data: {
            competitionId: meta.competitionId,
            playerId: user.id,
            registeredAt: new Date(),
            isActive: true,
          },
        });

        // Email de bienvenida
        await sendWelcomeEmail({ to: user.email! });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("❌ Error procesando evento:", e);
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

