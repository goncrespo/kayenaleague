export default function VerifySuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl card text-center space-y-4">
        <h1 className="text-3xl font-bold">¡Email verificado!</h1>
        <p className="text-gray-300">Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión y empezar a disfrutar de Kayena League.</p>
        <a href="/signin" className="btn-primary inline-block">Iniciar sesión</a>
      </div>
    </main>
  );
}



