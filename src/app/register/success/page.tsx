interface Props {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const noPayment = typeof params?.noPayment === "string" ? true : false;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl card text-center space-y-4">
        <h1 className="text-3xl font-bold">¡Registro completado!</h1>
        {noPayment ? (
          <>
            <p className="text-gray-300">Te hemos enviado un correo para verificar tu email. Por favor, revisa tu bandeja de entrada y sigue el enlace para activar tu cuenta.</p>
            <p className="text-gray-400 text-sm">Una vez verifiques tu correo, podrás iniciar sesión.</p>
            <a href="/signin" className="btn-primary inline-block">Ir a iniciar sesión</a>
          </>
        ) : (
          <>
            <p className="text-gray-300">Tu pago se ha confirmado correctamente. Te hemos enviado un email con la confirmación.</p>
            <a href="/dashboard" className="btn-primary inline-block">Ir al panel</a>
          </>
        )}
      </div>
    </main>
  );
}