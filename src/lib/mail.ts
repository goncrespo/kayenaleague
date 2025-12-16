import nodemailer from "nodemailer";

const emailServer = process.env.EMAIL_SERVER;
const emailFrom = process.env.EMAIL_FROM || "no-reply@localhost";

if (!emailServer) {
    // En desarrollo, permitimos que falte para no crashar al importar; se validará al usar
}

export function getBaseUrl(): string {
    return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function sendVerificationEmail(params: { to: string; token: string; }): Promise<void> {
    if (!emailServer) throw new Error("EMAIL_SERVER no configurado");
    const transporter = nodemailer.createTransport(emailServer);
    const verifyUrl = `${getBaseUrl()}/api/auth/verify?token=${encodeURIComponent(params.token)}&email=${encodeURIComponent(params.to)}`;
    await transporter.sendMail({
        from: emailFrom,
        to: params.to,
        subject: "Verifica tu correo - Kayena League",
        html: `<p>Hola,</p><p>Confirma tu correo para activar tu cuenta en Kayena League.</p><p><a href="${verifyUrl}">Confirmar correo</a></p><p>Si no has solicitado esto, ignora este mensaje.</p>`,
    });
}

export async function sendWelcomeEmail(params: { to: string; name: string; username: string; date: string; }): Promise<void> {
    if (!emailServer) throw new Error("EMAIL_SERVER no configurado");
    const transporter = nodemailer.createTransport(emailServer);

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenida Kayena League</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    
    <div style="width: 100%; background-color: #f3f4f6; padding: 40px 0;">
        
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <div style="background-color: #111827; padding: 35px 20px; text-align: center;">
                <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0; font-family: sans-serif;">
                    KAYENA LEAGUE
                </h1>
            </div>
            
            <div style="background-color: #10b981; color: #ffffff; font-size: 13px; font-weight: 600; text-align: center; padding: 8px; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif;">
                Compite. Mejora. Socializa.
            </div>

            <div style="padding: 40px 35px; text-align: left; color: #1f2937;">
                
                <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 20px; margin-top: 0;">
                    Bienvenido a la liga, jugador.
                </h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                    Gracias por unirte a <strong>Kayena League</strong>. Has dado el primer paso para disfrutar de la competición real sin las complicaciones de siempre.
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                    <strong>Se acabó esperar meses para poder competir.</strong> Aquí lo harás semanalmente, a tu ritmo y sin tener que bloquear 5 horas de tu agenda para jugar una ronda.
                </p>

                <div style="background-color: #f8fafc; border-left: 4px solid #111827; padding: 20px; margin: 30px 0; border-radius: 0 4px 4px 0;">
                    <span style="font-size: 14px; font-weight: bold; color: #111827; text-transform: uppercase; margin-bottom: 8px; display: block;">
                        📢 Importante: Acceso a la App
                    </span>
                    <p style="font-size: 15px; color: #374151; margin: 0; line-height: 1.5;">
                        Estamos configurando tu perfil en el sistema. <strong>En breve recibirás un segundo correo</strong> con tus credenciales de acceso a la App oficial.
                        <br><br>
                        Desde allí podrás ver tu grupo, gestionar tus partidos y contactar con tus rivales.
                    </p>
                </div>

                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 0;">
                    Nos vemos pronto en el <em>tee</em>.<br>
                    <strong>El equipo de Kayena League.</strong>
                </p>
            </div>

            <div style="background-color: #f9fafb; padding: 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0;">© 2025 Kayena League. Todos los derechos reservados.</p>
                <div>
                    <a href="https://kayenaleague.com" style="color: #111827; font-weight: 600; text-decoration: none; margin: 0 10px;">Web</a>
                    <a href="#" style="color: #111827; font-weight: 600; text-decoration: none; margin: 0 10px;">Instagram</a>
                    <a href="mailto:hola@kayenaleague.com" style="color: #111827; font-weight: 600; text-decoration: none; margin: 0 10px;">Contacto</a>
                </div>
            </div>

        </div>
    </div>
</body>
</html>`;

    await transporter.sendMail({
        from: emailFrom,
        to: params.to,
        subject: "Bienvenido a Kayena League",
        html: htmlContent,
    });
}

export async function sendContactFormEmails(params: { email: string; subject: string; message: string }): Promise<void> {
    if (!emailServer) throw new Error("EMAIL_SERVER no configurado");
    const transporter = nodemailer.createTransport(emailServer);

    // 1. Correo de confirmación al usuario
    const userHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:sans-serif;">
  <div style="background-color:#ffffff;max-width:600px;margin:20px auto;padding:40px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <h1 style="color:#111827;font-size:24px;text-align:center;">¡Mensaje Recibido!</h1>
    <p style="color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">
      Hemos recibido tu consulta sobre "<strong>${params.subject}</strong>". Nos pondremos en contacto contigo lo antes posible.
    </p>
    <div style="background-color:#f9fafb;padding:20px;border-radius:6px;margin:20px 0;">
       <p style="color:#6b7280;margin:0;"><strong>Tu mensaje:</strong><br>${params.message}</p>
    </div>
    <p style="color:#9ca3af;font-size:12px;text-align:center;">Kayena League</p>
  </div>
</body>
</html>`;

    await transporter.sendMail({
        from: emailFrom,
        to: params.email,
        subject: "Hemos recibido tu mensaje - Kayena League",
        html: userHtml,
    });

    // 2. Correo de notificación al admin
    const adminHtml = `<p><strong>Nuevo mensaje de contacto</strong></p>
<p><strong>De:</strong> ${params.email}</p>
<p><strong>Asunto:</strong> ${params.subject}</p>
<p><strong>Mensaje:</strong></p>
<pre style="background:#eee;padding:10px;">${params.message}</pre>`;

    await transporter.sendMail({
        from: emailFrom,
        to: "info@kayenaleague.com",
        replyTo: params.email,
        subject: `[Contacto Web] ${params.subject}`,
        html: adminHtml,
    });
}