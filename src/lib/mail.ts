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

export async function sendWelcomeEmail(params: { to: string; name?: string | null; }): Promise<void> {
  if (!emailServer) throw new Error("EMAIL_SERVER no configurado");
  const transporter = nodemailer.createTransport(emailServer);
  const greetingName = params.name ? `, ${params.name}` : "";
  await transporter.sendMail({
    from: emailFrom,
    to: params.to,
    subject: "Bienvenido a Kayena League",
    html: `<h1>¡Bienvenid@${greetingName}!</h1><p>Tu pago se ha confirmado correctamente y ya formas parte de la Kayena League.</p><p>¡Nos vemos en el green! ⛳️</p>`,
  });
}