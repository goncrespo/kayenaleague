import { NextResponse } from "next/server";
import { sendContactFormEmails } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, subject, message } = body;

        if (!email || !subject || !message) {
            return NextResponse.json(
                { error: "Todos los campos son obligatorios" },
                { status: 400 }
            );
        }

        await sendContactFormEmails({ email, subject, message });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error sending contact email:", error);
        return NextResponse.json(
            { error: "Error al enviar el mensaje" },
            { status: 500 }
        );
    }
}
