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
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Registro - Kayena League</title>
    <style>
        /* Estilos Generales y Reset */
        body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; width: 100%; }
        td { padding: 0; }
        img { border: 0; }
        
        /* Estilos Responsivos */
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 10px !important; }
            .content-padding { padding: 20px !important; }
            .mobile-font { font-size: 16px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8;">

    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8; padding: 40px 0;">
        <tr>
            <td align="center">
                
                <table role="presentation" class="container" width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    
                    <tr>
                        <td align="center" style="background-color: #1a202c; padding: 30px 0;">
                            <img src="https://kayenaleague.com/logo-white.png" alt="Kayena League Logo" width="200" style="display: block; color: #ffffff; font-family: sans-serif; font-weight: bold; font-size: 24px;">
                        </td>
                    </tr>

                    <tr>
                        <td class="content-padding" style="padding: 40px;">
                            <h1 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 700; text-align: center;">¡Bienvenido a la liga!</h1>
                            
                            <p class="mobile-font" style="margin: 0 0 25px 0; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                                Hola <strong>${params.name}</strong>, tu registro se ha completado con éxito. Ya eres parte oficial de la comunidad Kayena League. Estamos listos para ver de qué eres capaz.
                            </p>

                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Detalles de la cuenta</p>
                                        <p style="margin: 0 0 5px 0; color: #111827; font-size: 14px;"><strong>Usuario:</strong> ${params.username}</p>
                                        <p style="margin: 0 0 5px 0; color: #111827; font-size: 14px;"><strong>Email:</strong> ${params.to}</p>
                                        <p style="margin: 0; color: #111827; font-size: 14px;"><strong>Fecha:</strong> ${params.date}</p>
                                    </td>
                                </tr>
                            </table>

                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://kayenaleague.com/login" style="display: inline-block; padding: 14px 30px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">Ir a mi Panel de Usuario</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #9ca3af; font-size: 14px; text-align: center;">
                                ¿Tienes dudas? <a href="https://kayenaleague.com/contacto" style="color: #2563eb; text-decoration: none;">Contacta con soporte</a>.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © 2024 Kayena League. Todos los derechos reservados.<br>
                                <a href="#" style="color: #9ca3af; text-decoration: underline;">Darse de baja</a> | <a href="#" style="color: #9ca3af; text-decoration: underline;">Políticas de Privacidad</a>
                            </p>
                        </td>
                    </tr>

                </table>
                <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">Enviado automáticamente por el sistema de Kayena League.</p>

            </td>
        </tr>
    </table>

</body>
</html>`;

    await transporter.sendMail({
        from: emailFrom,
        to: params.to,
        subject: "Confirmación de Registro - Kayena League",
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